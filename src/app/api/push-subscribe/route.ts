import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    // The uid used to come straight from the request body — anyone who
    // knew (or guessed) a user's uid could overwrite their push
    // subscription and hijack their notifications, or just spam the
    // endpoint. Now derived only from a verified Firebase ID token, so a
    // caller can only ever subscribe themselves.
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    let userId: string;
    try {
      userId = (await getAdminAuth().verifyIdToken(token)).uid;
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscription, fcmToken } = await req.json();
    if (!subscription && !fcmToken) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    // Admin SDK — there's no firestore.rules entry for pushSubscriptions at
    // all, and this route has no client-SDK auth context to satisfy one
    // anyway, so the client SDK's setDoc() here was being silently denied
    // by security rules on every call. No subscription was ever actually
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
