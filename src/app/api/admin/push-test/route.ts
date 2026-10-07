import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { getAdminDb, getAdminMessaging } from "@/lib/firebase-admin";
import { ADMIN_EMAIL, requireAdmin } from "@/lib/admin-auth";
import { parseTripParams } from "@/lib/tripDeepLink";

// TEMPORARY deep-link test tool. Sends ONE test notification to the signed-in
// admin's OWN device(s), carrying the same "/?trip=<id>" link the reminder will
// use, so tapping it can be checked on a real phone. Hard limits:
//  - admin only (requireAdmin);
//  - the recipient is always the caller's own pushSubscriptions document, never
//    chosen by the request;
//  - the trip must be one the admin owns or has been given access to, so a
//    trip id alone is never enough;
//  - no event document is created and no `rn`, so it cannot affect the real
//    reminder's idempotency or "opened" tracking;
//  - not connected to any cron or to the reminder sender.
let lastSentAt = 0;

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;
  const uid = auth.uid;

  if (Date.now() - lastSentAt < 5000) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const link = parseTripParams(new URLSearchParams({ trip: String(body?.tripId ?? "") }));
  if (!link) return NextResponse.json({ error: "Invalid trip id" }, { status: 400 });

  const db = getAdminDb();
  const tripSnap = await db.collection("trips").doc(link.trip).get();
  const trip = tripSnap.data() as { owner?: string; sharedWith?: string[]; destination?: string } | undefined;
  const hasAccess =
    !!trip && (trip.owner === uid || (trip.sharedWith || []).map(e => (e || "").toLowerCase().trim()).includes(ADMIN_EMAIL));
  if (!hasAccess) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const subSnap = await db.collection("pushSubscriptions").doc(uid).get();
  const sub = (subSnap.exists ? subSnap.data() : null) as { fcmToken?: string; subscription?: unknown } | null;
  if (!sub?.fcmToken && !sub?.subscription) return NextResponse.json({ error: "No push token for this account" }, { status: 409 });

  lastSentAt = Date.now();
  const title = "בדיקת קישור עמוק";
  const text = "לחיצה על ההתראה אמורה לפתוח את הטיול";
  const url = `/?trip=${encodeURIComponent(link.trip)}`;
  const result: { fcm: string; web: string } = { fcm: "no-token", web: "no-token" };

  if (sub.fcmToken) {
    try {
      await getAdminMessaging().send({
        token: sub.fcmToken,
        notification: { title, body: text },
        data: { url },
        android: { notification: { icon: "ic_launcher", color: "#0d2137" }, priority: "high" },
      });
      result.fcm = "sent";
    } catch (e) {
      result.fcm = `error:${String((e as { code?: string })?.code ?? "unknown").slice(0, 60)}`;
    }
  }
  if (sub.subscription) {
    try {
      webpush.setVapidDetails(process.env.VAPID_SUBJECT!, process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
      await webpush.sendNotification(sub.subscription as never, JSON.stringify({ title, body: text, url }));
      result.web = "sent";
    } catch (e) {
      result.web = `error:${String((e as { statusCode?: number })?.statusCode ?? "unknown")}`;
    }
  }
  return NextResponse.json({ ok: true, ...result });
}
