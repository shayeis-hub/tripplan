import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { subscription, fcmToken, userId } = await req.json();
    if ((!subscription && !fcmToken) || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    // Admin SDK — there's no firestore.rules entry for pushSubscriptions at
    // all, and this route has no user auth context to satisfy one anyway,
    // so the client SDK's setDoc() here was being silently denied by
    // security rules on every call. No subscription was ever actually
    // getting saved, for anyone, on any platform.
    // merge:true keeps the other channel intact when a user has both
    // (web-push in the browser + FCM in the native app)
    await getAdminDb().collection("pushSubscriptions").doc(userId).set({
      ...(subscription ? { subscription } : {}),
      ...(fcmToken ? { fcmToken } : {}),
      userId,
      updatedAt: Date.now(),
    }, { merge: true });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
