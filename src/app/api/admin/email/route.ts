import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-auth";
import { isEmailLang } from "@/lib/email/constants";
import { clearConfigCache, getWelcomeConfig } from "@/lib/email/config";
import { sendWelcomeTest } from "@/lib/email/welcome";
import { isCreatedTrip, toTripLite } from "@/lib/adminMetrics";

// Admin-only controls for the welcome e-mail. Nothing here can send to anyone
// but the signed-in admin's own verified address.
//
//   GET                              -> current config + results of the welcome e-mail
//   POST {action:"test", lang}       -> send the welcome e-mail to the admin's own address
//   POST {action:"config", mode, allowlist?, controlPct?, eligibleSince?}
//                                    -> change who may receive it ("off" | "allowlist" | "all")
export const dynamic = "force-dynamic";

const WINDOW_MS = 7 * 24 * 3600 * 1000; // created_trip counted within 7 days of the e-mail

export async function GET(req: NextRequest) {
  const a = await requireAdmin(req);
  if ("error" in a) return a.error;

  const db = getAdminDb();
  const snap = await db.collection("emailEvents").where("flow", "==", "welcome").limit(1000).get();
  const counts: Record<string, number> = {};
  let delivered = 0, bounced = 0, complained = 0, clicked = 0, sent = 0, createdTrip = 0, createdTripAfterClick = 0;
  const sentDocs: { uid: string; sentAt: number; clicked: boolean }[] = [];
  for (const d of snap.docs) {
    const e = d.data();
    counts[e.status] = (counts[e.status] ?? 0) + 1;
    if (e.status === "sent") {
      sent++;
      if (e.deliveredAt) delivered++;
      if (e.firstClickAt) clicked++;
      sentDocs.push({ uid: e.uid, sentAt: e.sentAt, clicked: !!e.firstClickAt });
    }
    if (e.bouncedAt) bounced++;
    if (e.complainedAt) complained++;
  }
  // created_trip: the sender's first real trip made after the e-mail went out.
  for (const s of sentDocs.slice(0, 300)) {
    const trips = await db.collection("trips").where("owner", "==", s.uid).get();
    const hit = trips.docs.some((t) => {
      const data = t.data();
      return typeof data.createdAt === "number" && data.createdAt > s.sentAt && data.createdAt - s.sentAt <= WINDOW_MS && isCreatedTrip(toTripLite(t.id, data));
    });
    if (hit) {
      createdTrip++;
      if (s.clicked) createdTripAfterClick++;
    }
  }
  // The 15 most recent e-mail events of any kind (tests included), no addresses.
  const recentSnap = await db.collection("emailEvents").orderBy("createdAt", "desc").limit(15).get();
  const recent = recentSnap.docs.map((d) => {
    const e = d.data();
    return {
      flow: e.flow, status: e.status, lang: e.lang, variant: e.variant ?? null, skipReason: e.skipReason ?? null,
      createdAt: e.createdAt, sentAt: e.sentAt ?? null, deliveredAt: e.deliveredAt ?? null,
      firstClickAt: e.firstClickAt ?? null, clickCount: e.clickCount ?? 0,
      bouncedAt: e.bouncedAt ?? null, complainedAt: e.complainedAt ?? null, errorName: e.errorName ?? null,
    };
  });
  return NextResponse.json({
    recent,
    config: await getWelcomeConfig(true),
    events: counts,
    welcome: { sent, delivered, clicked, bounced, complained, createdTrip7d: createdTrip, createdTrip7dAmongClicked: createdTripAfterClick },
  });
}

export async function POST(req: NextRequest) {
  const a = await requireAdmin(req);
  if ("error" in a) return a.error;
  const body = await req.json().catch(() => ({}));

  if (body?.action === "test") {
    const decoded = await getAdminAuth().verifyIdToken(req.headers.get("authorization")!.replace("Bearer ", ""));
    if (!decoded.email || decoded.email_verified !== true) {
      return NextResponse.json({ ok: false, error: "admin address is not verified" }, { status: 400 });
    }
    const lang = isEmailLang(body?.lang) ? body.lang : "he";
    const r = await sendWelcomeTest({ uid: decoded.uid, email: decoded.email, displayName: decoded.name as string | undefined, lang });
    return NextResponse.json(r, { status: r.ok ? 200 : 400 });
  }

  if (body?.action === "config") {
    const mode = body.mode === "all" || body.mode === "allowlist" ? body.mode : "off";
    const allowlist: string[] = Array.isArray(body.allowlist)
      ? body.allowlist.filter((x: unknown): x is string => typeof x === "string").map((x: string) => x.trim().toLowerCase())
      : [];
    const welcome = {
      mode,
      allowlist,
      // "now" = only registrations from this moment on are eligible in "all" mode.
      eligibleSince: body.eligibleSince === "now" ? Date.now() : typeof body.eligibleSince === "number" ? body.eligibleSince : Number.MAX_SAFE_INTEGER,
      controlPct: typeof body.controlPct === "number" ? Math.min(100, Math.max(0, body.controlPct)) : 0,
    };
    await getAdminDb().collection("emailConfig").doc("lifecycle").set({ welcome, updatedAt: Date.now() }, { merge: true });
    clearConfigCache();
    return NextResponse.json({ ok: true, welcome });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
