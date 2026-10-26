import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { SITE_URL, WELCOME_FLOW, WELCOME_VERSION, type EmailLang } from "./constants";
import { getWelcomeConfig } from "./config";
import { emailHash, signToken, bucketOf, EmailConfigError } from "./tokens";
import { providerConfigured, sendEmail } from "./provider";
import { isAddressSuppressed } from "./suppression";
import { renderWelcome } from "./templates";
import {
  RECORDED_SKIPS,
  decideNext,
  evaluateEligibility,
  firstNameOf,
  resolveEmailLang,
  type ExistingEvent,
  type SkipReason,
} from "./welcomeLogic";

// Orchestrates the one-time welcome e-mail. Called from POST /api/welcome, which
// the client fires (without waiting) after a new sign-in. Nothing here can make
// a registration fail: the registration already happened, this is a side effect.
//
// Exactly-once, per account:
//  1. emailEvents/{uid}__welcome__v1 is created in a transaction BEFORE calling
//     the provider (status "reserved"). A second concurrent call finds it and
//     stops.
//  2. The provider call carries an Idempotency-Key (per attempt).
//  3. The outcome is written: sent (+ provider id), failed (retry only if the
//     provider definitely rejected it with a transient error), or unknown (we
//     cannot tell: never resent).
// No log line in this module contains an address, a token or a uid.

export type WelcomeResult = {
  status: "sent" | "skipped" | "held_out" | "already" | "in_progress" | "failed" | "unknown" | "not_configured";
  reason?: string;
  final: boolean; // false = the client may call again later (within the 24h window)
};

const events = () => getAdminDb().collection("emailEvents");
export const welcomeEventId = (uid: string) => `${uid}__${WELCOME_FLOW}__v${WELCOME_VERSION}`;

// ---------- language ----------

export async function saveProfileLang(uid: string, lang: EmailLang, source: "saved" | "device") {
  const ref = getAdminDb().collection("userProfiles").doc(uid);
  await getAdminDb().runTransaction(async (tx) => {
    const s = await tx.get(ref);
    const cur = s.exists ? s.data() : null;
    // A device-derived guess never overwrites a language the user chose.
    if (cur?.langSource === "saved" && source === "device") return;
    const now = Date.now();
    tx.set(
      ref,
      {
        lang,
        langSource: source,
        langUpdatedAt: now,
        ...(cur?.registrationLang ? {} : { registrationLang: lang }),
      },
      { merge: true },
    );
  });
}

async function readProfileLang(uid: string): Promise<unknown> {
  const s = await getAdminDb().collection("userProfiles").doc(uid).get();
  return s.exists ? s.data()?.lang : null;
}

// ---------- the send ----------

interface Deliver {
  eventId: string;
  uid: string;
  email: string;
  firstName: string | null;
  lang: EmailLang;
  hash: string;
  variantLabel: string;
  flow?: string; // "welcome" unless this is an admin test send
}

async function deliver(d: Deliver): Promise<WelcomeResult> {
  const now = Date.now();
  const ref = events().doc(d.eventId);

  // 1. Reserve (transaction): the single point that makes it exactly-once.
  const decision = await getAdminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const ex = snap.exists ? (snap.data() as ExistingEvent) : null;
    const next = decideNext(ex, now);
    let attempts = 1;
    if (next.action === "create") {
      tx.create(ref, {
        uid: d.uid,
        flow: d.flow ?? WELCOME_FLOW,
        version: WELCOME_VERSION,
        status: "reserved",
        attempts: 1,
        lang: d.lang,
        variant: d.variantLabel,
        emailHash: d.hash,
        createdAt: now,
        reservedAt: now,
        lastAttemptAt: now,
      });
    } else if (next.action === "retry") {
      attempts = (ex?.attempts ?? 0) + 1;
      tx.update(ref, { status: "reserved", attempts, reservedAt: now, lastAttemptAt: now });
    } else if (next.action === "mark_unknown") {
      tx.update(ref, { status: "unknown", updatedAt: now });
    }
    return { next, attempts };
  });

  if (decision.next.action === "mark_unknown") return { status: "unknown", final: true };
  if (decision.next.action === "stop") {
    const r = decision.next.reason;
    if (r === "sent") return { status: "already", final: true };
    if (r === "in_flight" || r === "backoff") return { status: "in_progress", reason: r, final: false };
    if (r === "skipped" || r === "held_out") return { status: r === "held_out" ? "held_out" : "skipped", final: true };
    if (r === "unknown") return { status: "unknown", final: true };
    return { status: "failed", reason: r, final: true }; // max_attempts / not_retryable
  }

  // 2. Send.
  const clickUrl = `${SITE_URL}/api/e/c?t=${signToken({ k: "c", ev: d.eventId })}`;
  const unsubscribeUrl = `${SITE_URL}/api/email/unsubscribe?t=${signToken({ k: "u", h: d.hash, ev: d.eventId, l: d.lang })}`;
  const mail = renderWelcome({ lang: d.lang, firstName: d.firstName, ctaUrl: clickUrl, unsubscribeUrl });

  const out = await sendEmail({
    to: d.email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    unsubscribeUrl,
    idempotencyKey: `${d.eventId}-a${decision.attempts}`,
    tags: [
      { name: "flow", value: d.flow ?? WELCOME_FLOW },
      { name: "lang", value: d.lang },
    ],
  });

  // 3. Record the outcome.
  const t = Date.now();
  if (out.kind === "sent") {
    await ref.update({ status: "sent", sentAt: t, resendId: out.id, updatedAt: t });
    return { status: "sent", final: true };
  }
  if (out.kind === "unknown") {
    await ref.update({ status: "unknown", errorName: out.errorName, updatedAt: t });
    console.error("email: send outcome unknown", out.errorName);
    return { status: "unknown", final: true };
  }
  await ref.update({ status: "failed", retryable: out.retryable, errorName: out.errorName, updatedAt: t });
  console.error("email: send failed", out.errorName, out.statusCode);
  return { status: "failed", reason: out.errorName, final: !out.retryable };
}

async function recordSkip(uid: string, reason: SkipReason, hash: string, lang: EmailLang) {
  try {
    await events().doc(welcomeEventId(uid)).create({
      uid,
      flow: WELCOME_FLOW,
      version: WELCOME_VERSION,
      status: "skipped",
      skipReason: reason,
      attempts: 0,
      lang,
      emailHash: hash,
      createdAt: Date.now(),
    });
  } catch (e) {
    // ALREADY_EXISTS (gRPC 6): the first record stays.
    if ((e as { code?: number })?.code !== 6) console.error("email: recordSkip failed");
  }
}

// ---------- entry point: a new registration ----------

export async function handleWelcome(args: {
  uid: string;
  requestedLang: unknown;
  langSource: "saved" | "device";
}): Promise<WelcomeResult> {
  const { uid } = args;
  const user = await getAdminAuth().getUser(uid);
  const lang = resolveEmailLang(args.requestedLang, await readProfileLang(uid));

  // Always keep the user's language (needed for every future e-mail), whether
  // or not a welcome is sent.
  await saveProfileLang(uid, lang, args.langSource);

  const cfg = await getWelcomeConfig();
  const email = user.email ?? null;
  const verdict = evaluateEligibility(
    {
      email,
      emailVerified: user.emailVerified === true,
      createdAtMs: Date.parse(user.metadata.creationTime) || null,
      now: Date.now(),
    },
    cfg,
  );
  if ("reason" in verdict) {
    if (RECORDED_SKIPS.includes(verdict.reason) && email) {
      try {
        await recordSkip(uid, verdict.reason, emailHash(email), lang);
      } catch (e) {
        if (!(e instanceof EmailConfigError)) throw e;
      }
    }
    return { status: "skipped", reason: verdict.reason, final: true };
  }
  if (!email) return { status: "skipped", reason: "no_email", final: true };

  if (!providerConfigured()) return { status: "not_configured", final: false };
  let hash: string;
  try {
    hash = emailHash(email);
  } catch (e) {
    if (e instanceof EmailConfigError) return { status: "not_configured", final: false };
    throw e;
  }

  if (await isAddressSuppressed(hash)) {
    await recordSkip(uid, "suppressed", hash, lang);
    return { status: "skipped", reason: "suppressed", final: true };
  }

  // Holdout (0% today): the person is counted as eligible but gets nothing, so
  // later flows can compare created_trip with and without the e-mail.
  const variantLabel = bucketOf(uid, WELCOME_FLOW) < cfg.controlPct ? "control" : "treatment";
  if (variantLabel === "control") {
    try {
      await events().doc(welcomeEventId(uid)).create({
        uid,
        flow: WELCOME_FLOW,
        version: WELCOME_VERSION,
        status: "held_out",
        variant: "control",
        attempts: 0,
        lang,
        emailHash: hash,
        createdAt: Date.now(),
      });
    } catch {
      /* already recorded */
    }
    return { status: "held_out", final: true };
  }

  return deliver(
    { eventId: welcomeEventId(uid), uid, email, firstName: firstNameOf(user.displayName), lang, hash, variantLabel });
}

// ---------- admin test: the admin's own address only ----------

export async function sendWelcomeTest(args: { uid: string; email: string; displayName?: string | null; lang: EmailLang }) {
  if (!providerConfigured()) return { ok: false as const, error: "RESEND_API_KEY is not set" };
  let hash: string;
  try {
    hash = emailHash(args.email);
  } catch {
    return { ok: false as const, error: "EMAIL_TOKEN_SECRET is not set" };
  }
  if (await isAddressSuppressed(hash)) return { ok: false as const, error: "address is suppressed" };

  // At most 5 test sends per day: the id carries the day and a counter.
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  for (let n = 1; n <= 5; n++) {
    const eventId = `${args.uid}__${WELCOME_FLOW}_test__${day}_${n}`;
    const taken = (await events().doc(eventId).get()).exists;
    if (taken) continue;
    const r = await deliver(
      { eventId, uid: args.uid, email: args.email, firstName: firstNameOf(args.displayName), lang: args.lang, hash, variantLabel: "test", flow: `${WELCOME_FLOW}_test` });
    return { ok: r.status === "sent", result: r, eventId };
  }
  return { ok: false as const, error: "daily test limit (5) reached" };
}
