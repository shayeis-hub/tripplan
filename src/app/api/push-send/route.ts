import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { getAdminAuth, getAdminDb, getAdminMessaging } from "@/lib/firebase-admin";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

async function sendToUser(userId: string, title: string, body: string, url: string) {
  const subDoc = await getAdminDb().collection("pushSubscriptions").doc(userId).get();
  if (!subDoc.exists) return "no-subscription";
  const { subscription, fcmToken } = subDoc.data() as { subscription?: any; fcmToken?: string };
  let sent = false;

  if (fcmToken) {
    try {
      await getAdminMessaging().send({
        token: fcmToken,
        notification: { title, body },
        data: { url },
        android: { notification: { icon: "ic_launcher", color: "#0d2137" }, priority: "high" },
      });
      sent = true;
    } catch (e) {
      console.error(`push-send: FCM failed for ${userId}`, e);
    }
  }
  if (subscription) {
    try {
      await webpush.sendNotification(subscription, JSON.stringify({ title, body, url }));
      sent = true;
    } catch (e) {
      console.error(`push-send: web-push failed for ${userId}`, e);
    }
  }
  return sent ? "sent" : "failed";
}

export async function POST(req: NextRequest) {
  try {
    // Used to take an arbitrary target `userId` straight from the request
    // body, with no auth at all — anyone who knew a uid could make the
    // server push whatever title/body/url they chose to that user's
    // device. Now: the caller must be signed in, and the only valid
    // "who gets notified" is "the other members of a trip I'm actually
    // in" — resolved server-side from the trip doc, never from client input.
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    let callerUid: string, callerEmail: string;
    try {
      const decoded = await getAdminAuth().verifyIdToken(token);
      callerUid = decoded.uid;
      callerEmail = (decoded.email || "").toLowerCase().trim();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tripId, title, body, url } = await req.json();
    if (!tripId || !title) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const tripSnap = await getAdminDb().collection("trips").doc(tripId).get();
    if (!tripSnap.exists) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    const trip = tripSnap.data() as { owner?: string; sharedWith?: string[] };

    const sharedWith = (trip.sharedWith || []).map(e => (e || "").toLowerCase().trim());
    const isMember = trip.owner === callerUid || sharedWith.includes(callerEmail);
    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Recipients = every other member of the trip. sharedWith stores
    // emails (that's how trips are shared), so each has to be resolved to
    // a uid — skip any that don't resolve to an actual account rather than
    // failing the whole notification.
    const recipientUids = new Set<string>();
    if (trip.owner && trip.owner !== callerUid) recipientUids.add(trip.owner);
    for (const email of sharedWith) {
      if (!email || email === callerEmail) continue;
      try {
        const u = await getAdminAuth().getUserByEmail(email);
        recipientUids.add(u.uid);
      } catch {
        // no account for this email (yet) — nothing to notify
      }
    }

    const results: Record<string, string> = {};
    for (const uid of recipientUids) {
      results[uid] = await sendToUser(uid, title, body || "", url || "/");
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("push-send: request failed", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
