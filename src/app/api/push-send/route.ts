import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getAdminMessaging } from "@/lib/firebase-admin";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId, title, body, url } = await req.json();
    if (!userId || !title) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const subDoc = await getDoc(doc(db, "pushSubscriptions", userId));
    if (!subDoc.exists()) {
      return NextResponse.json({ error: "No subscription" }, { status: 404 });
    }

    const { subscription, fcmToken } = subDoc.data();
    const results: Record<string, string> = {};

    // Native app (FCM) — preferred channel when present
    if (fcmToken) {
      try {
        await getAdminMessaging().send({
          token: fcmToken,
          notification: { title, body: body || "" },
          data: { url: url || "/" },
          android: {
            notification: { icon: "ic_launcher", color: "#0d2137" },
            priority: "high",
          },
        });
        results.fcm = "sent";
      } catch (e) {
        results.fcm = "failed";
      }
    }

    // Browser (web-push)
    if (subscription) {
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify({ title, body, url: url || "/" })
        );
        results.webpush = "sent";
      } catch (e) {
        results.webpush = "failed";
      }
    }

    if (!Object.values(results).includes("sent")) {
      return NextResponse.json({ error: "All channels failed", results }, { status: 500 });
    }
    return NextResponse.json({ success: true, results });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
