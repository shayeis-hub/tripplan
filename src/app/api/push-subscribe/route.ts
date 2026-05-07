import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const { subscription, userId } = await req.json();
    if (!subscription || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    await setDoc(doc(db, "pushSubscriptions", userId), {
      subscription,
      userId,
      updatedAt: Date.now(),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}