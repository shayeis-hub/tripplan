import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const { subscription, fcmToken, userId } = await req.json();
    if ((!subscription && !fcmToken) || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    // merge:true keeps the other channel intact when a user has both
    // (web-push in the browser + FCM in the native app)
    await setDoc(doc(db, "pushSubscriptions", userId), {
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
