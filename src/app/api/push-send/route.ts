import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

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

    const { subscription } = subDoc.data();
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body, url: url || "/" })
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}