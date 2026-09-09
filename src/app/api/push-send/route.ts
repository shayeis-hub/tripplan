import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { getAdminAuth, getAdminDb, getAdminMessaging } from "@/lib/firebase-admin";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Mirrors CATS in TripPlan.jsx (icon + Hebrew label) — kept as a small
// plain copy here since that array also carries lucide-react components,
// which have no business in a server route.
const CAT_LABELS: Record<string, { icon: string; label: string }> = {
  flight:     { icon: "✈️", label: "טיסה" },
  hotel:      { icon: "🏨", label: "מלון" },
  attraction: { icon: "🎡", label: "אטרקציות" },
  food:       { icon: "🍜", label: "אוכל" },
  taxi:       { icon: "🚕", label: "מונית" },
  shopping:   { icon: "🛍️", label: "שופינג" },
  other:      { icon: "📦", label: "אחר" },
};

// The only kind of trip-member notification this route builds right now.
// Adding a new kind means adding a case here, not opening up free-text
// content again.
function buildMessage(eventType: string, data: any, destination: string): { title: string; body: string } | null {
  if (eventType === "new_expense") {
    const cat = CAT_LABELS[data?.category] || CAT_LABELS.other;
    const amount = Number(data?.amountILS);
    if (!Number.isFinite(amount) || amount < 0) return null;
    return {
      title: `${cat.icon} הוצאה חדשה בטיולון`,
      body: `${cat.label}: ₪${amount.toFixed(0)} נוסף לטיול ${destination || ""}`,
    };
  }
  return null;
}

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

    // Used to also accept free-text title/body/url straight from the
    // client — any trip member (including a view-only one) could push
    // whatever wording and deep-link URL they wanted to every other
    // member, with no rate limit. Now the client only names a known
    // event and its data; the actual notification text is built here.
    const { tripId, eventType, data } = await req.json();
    if (!tripId || !eventType) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const tripRef = getAdminDb().collection("trips").doc(tripId);
    const tripSnap = await tripRef.get();
    if (!tripSnap.exists) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    const trip = tripSnap.data() as { owner?: string; sharedWith?: string[]; destination?: string; lastPushSentAt?: Record<string, number> };

    const sharedWith = (trip.sharedWith || []).map(e => (e || "").toLowerCase().trim());
    const isMember = trip.owner === callerUid || sharedWith.includes(callerEmail);
    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Light per-(caller,trip) cooldown — not a real rate limiter, but
    // enough to blunt a tight loop hammering this endpoint. Real human
    // expense entry is never this fast.
    const cooldownKey = callerUid;
    const lastSent = trip.lastPushSentAt?.[cooldownKey];
    if (lastSent && Date.now() - lastSent < 3000) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const message = buildMessage(eventType, data, trip.destination || "");
    if (!message) return NextResponse.json({ error: "Invalid event" }, { status: 400 });

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

    let sentCount = 0;
    for (const uid of recipientUids) {
      const result = await sendToUser(uid, message.title, message.body, "/");
      if (result === "sent") sentCount++;
    }

    tripRef.update({ [`lastPushSentAt.${cooldownKey}`]: Date.now() }).catch(() => {});

    // Recipient uids used to come back to the caller — not useful to a
    // legitimate client and not something to hand out either.
    return NextResponse.json({ success: true, sent: sentCount });
  } catch (err) {
    console.error("push-send: request failed", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
