import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { ANNUAL_CTA_TARGET, ANNUAL_FLOW, ANNUAL_VERSION, type EmailLang } from "./constants";
import { getAnnualConfig, type AnnualConfig } from "./config";
import { emailHash, EmailConfigError } from "./tokens";
import { providerConfigured } from "./provider";
import { isAddressSuppressed } from "./suppression";
import { renderAnnual } from "./templates";
import { deliver, readProfileLang } from "./welcome";
import { firstNameOf, resolveEmailLang } from "./welcomeLogic";
import { computeYearStats } from "@/lib/world/stats";
import { loadWorld, mergeVisits } from "@/lib/world/serverVisits";

// Yearly "My World" summary e-mail ("2026 in the world").
//
// Who: users with at least one visit in that year, from My World OR from their own finished trips in the app
// (see lib/world/serverVisits.ts), with a verified Google/Apple address
// (not an Apple private relay), not suppressed (unsubscribed / bounced / complained).
// When: a daily cron from Dec 17 to Dec 31 sends up to BATCH_LIMIT per run (Resend's free plan allows 100 a day
// in total, shared with the welcome e-mail), so a larger audience simply spreads over several days.
// Exactly once per user per year: emailEvents/{uid}__annual__v1__{year} goes through the same reserve ->
// send -> record transaction as the welcome e-mail. Off unless emailConfig/lifecycle.annual.mode says otherwise.
// No log line contains an address, a token or a uid.

export const BATCH_LIMIT = 60;
const APPLE_RELAY = /@privaterelay\.appleid\.com$/i;

export const annualEventId = (uid: string, year: number) => `${uid}__${ANNUAL_FLOW}__v${ANNUAL_VERSION}__${year}`;

// The year being sent: Dec 17-31 of that year. Outside the window nothing is sent.
export function annualSendYear(now: Date = new Date()): number | null {
  return now.getUTCMonth() === 11 && now.getUTCDate() >= 17 ? now.getUTCFullYear() : null;
}

export type AnnualSkip = "off" | "not_allowlisted" | "no_email" | "unverified" | "apple_relay" | "no_countries";

export function evaluateAnnual(
  f: { email: string | null; emailVerified: boolean; countries: number },
  cfg: AnnualConfig,
): { ok: true } | { ok: false; reason: AnnualSkip } {
  if (cfg.mode === "off") return { ok: false, reason: "off" };
  if (!f.email) return { ok: false, reason: "no_email" };
  if (cfg.mode === "allowlist" && !cfg.allowlist.includes(f.email.trim().toLowerCase())) return { ok: false, reason: "not_allowlisted" };
  if (!f.emailVerified) return { ok: false, reason: "unverified" };
  if (APPLE_RELAY.test(f.email)) return { ok: false, reason: "apple_relay" };
  if (f.countries < 1) return { ok: false, reason: "no_countries" };
  return { ok: true };
}

export interface BatchResult {
  skipped?: "outside_window" | "off" | "not_configured";
  candidates: number; // users with at least one visit in the year
  eligible: number;
  sent: number;
  alreadyDone: number;
  failed: number;
  reasons: Record<string, number>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// dryRun: counts only, nothing is reserved or sent (used by the admin page). ignoreWindow: for the dry run.
export async function runAnnualBatch(opts: { now?: Date; limit?: number; dryRun?: boolean; ignoreWindow?: boolean } = {}): Promise<BatchResult> {
  const now = opts.now ?? new Date();
  const out: BatchResult = { candidates: 0, eligible: 0, sent: 0, alreadyDone: 0, failed: 0, reasons: {} };
  const bump = (k: string) => { out.reasons[k] = (out.reasons[k] ?? 0) + 1; };

  const year = annualSendYear(now) ?? (opts.ignoreWindow ? now.getUTCFullYear() : null);
  if (year == null) return { ...out, skipped: "outside_window" };
  const cfg = await getAnnualConfig();
  if (cfg.mode === "off" && !opts.dryRun) return { ...out, skipped: "off" };
  if (!opts.dryRun && !providerConfigured()) return { ...out, skipped: "not_configured" };

  const db = getAdminDb();
  const limit = opts.limit ?? BATCH_LIMIT;

  // Everyone who may have a summary: users with a My World profile, plus owners of a trip that ended this year.
  const uids = new Set<string>();
  const emailToUid = new Map<string, string>();
  for (let last: FirebaseFirestore.QueryDocumentSnapshot | null = null; ; ) {
    let q = db.collection("worldProfiles").orderBy("__name__").limit(300);
    if (last) q = q.startAfter(last);
    const page = await q.get();
    for (const d of page.docs) uids.add(d.id);
    if (page.size < 300) break;
    last = page.docs[page.docs.length - 1];
  }
  for (let last: FirebaseFirestore.QueryDocumentSnapshot | null = null; ; ) {
    let q = db.collection("trips").where("endDate", ">=", `${year}-01-01`).where("endDate", "<=", `${year}-12-31`).orderBy("endDate").limit(300);
    if (last) q = q.startAfter(last);
    const page = await q.get();
    for (const d of page.docs) {
      const t = d.data();
      if (typeof t.owner === "string") uids.add(t.owner);
      // People who joined the trip travelled too (view-only guests did not).
      const viewOnly = (Array.isArray(t.viewOnlyUsers) ? t.viewOnlyUsers : []).map((x: unknown) => String(x).toLowerCase());
      for (const m of Array.isArray(t.sharedWith) ? t.sharedWith : []) {
        const mail = String(m).trim().toLowerCase();
        if (!mail || viewOnly.includes(mail) || emailToUid.has(mail)) continue;
        try {
          emailToUid.set(mail, (await getAdminAuth().getUserByEmail(mail)).uid);
        } catch {
          emailToUid.set(mail, ""); // no account with that address
        }
      }
    }
    if (page.size < 300) break;
    last = page.docs[page.docs.length - 1];
  }

  for (const u of emailToUid.values()) if (u) uids.add(u);

  for (const uid of [...uids].sort()) {
    let user;
    try {
      user = await getAdminAuth().getUser(uid);
    } catch {
      bump("no_user");
      continue;
    }
    const w = await loadWorld(uid, user.email ?? null);
    const stats = computeYearStats(w.home, mergeVisits(w.visits, w.tripVisits), year);
    if (stats.visits < 1) continue;
    out.candidates++;
    const verdict = evaluateAnnual(
      { email: user.email ?? null, emailVerified: user.emailVerified === true, countries: stats.countries },
      opts.dryRun && cfg.mode === "off" ? { mode: "all", allowlist: [] } : cfg,
    );
    if ("reason" in verdict) { bump(verdict.reason); continue; }
    let hash: string;
    try {
      hash = emailHash(user.email as string);
    } catch (e) {
      if (e instanceof EmailConfigError) return { ...out, skipped: "not_configured" };
      throw e;
    }
    if (await isAddressSuppressed(hash)) { bump("suppressed"); continue; }
    out.eligible++;
    if (opts.dryRun) continue;

    const eventId = annualEventId(uid, year);
    const ev = await db.collection("emailEvents").doc(eventId).get();
    const st = ev.exists ? (ev.data()?.status as string) : null;
    if (st === "sent" || st === "unknown" || st === "skipped" || st === "held_out") { out.alreadyDone++; continue; }
    if (out.sent >= limit) return out; // the rest goes out on the next daily run

    const lang: EmailLang = resolveEmailLang(null, await readProfileLang(uid));
    const r = await deliver({
      eventId, uid, email: user.email as string, firstName: firstNameOf(user.displayName), lang, hash,
      variantLabel: "treatment", flow: ANNUAL_FLOW, version: ANNUAL_VERSION,
      render: (ctaUrl, unsubscribeUrl) =>
        renderAnnual({ lang, year, countries: stats.countries, newCountries: stats.newCountries, firstName: firstNameOf(user.displayName), ctaUrl, unsubscribeUrl }),
    });
    if (r.status === "sent") out.sent++;
    else if (r.status === "failed" || r.status === "unknown") out.failed++;
    await sleep(150); // Resend: at most 10 requests a second
  }
  return out;
}

// Admin test: the admin's own address only, with the admin's real numbers (or a sample when there are none).
export async function sendAnnualTest(args: { uid: string; email: string; displayName?: string | null; lang: EmailLang }) {
  if (!providerConfigured()) return { ok: false as const, error: "RESEND_API_KEY is not set" };
  let hash: string;
  try {
    hash = emailHash(args.email);
  } catch {
    return { ok: false as const, error: "EMAIL_TOKEN_SECRET is not set" };
  }
  if (await isAddressSuppressed(hash)) return { ok: false as const, error: "address is suppressed" };

  const year = new Date().getUTCFullYear();
  const w = await loadWorld(args.uid, args.email);
  const real = computeYearStats(w.home, mergeVisits(w.visits, w.tripVisits), year);
  const countries = real.countries > 0 ? real.countries : 4;
  const newCountries = real.countries > 0 ? real.newCountries : 2;

  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  for (let n = 1; n <= 5; n++) {
    const eventId = `${args.uid}__${ANNUAL_FLOW}_test__${day}_${n}`;
    if ((await getAdminDb().collection("emailEvents").doc(eventId).get()).exists) continue;
    const r = await deliver({
      eventId, uid: args.uid, email: args.email, firstName: firstNameOf(args.displayName), lang: args.lang, hash,
      variantLabel: "test", flow: `${ANNUAL_FLOW}_test`, version: ANNUAL_VERSION,
      render: (ctaUrl, unsubscribeUrl) =>
        renderAnnual({ lang: args.lang, year, countries, newCountries, firstName: firstNameOf(args.displayName), ctaUrl, unsubscribeUrl }),
    });
    return { ok: r.status === "sent", result: r, eventId };
  }
  return { ok: false as const, error: "daily test limit (5) reached" };
}

export { ANNUAL_CTA_TARGET };
