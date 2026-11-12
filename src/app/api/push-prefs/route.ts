import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { readPrefs, sanitizePrefsUpdate } from "@/lib/notifPrefs";

// A person's own notification preferences. The uid comes only from a verified ID token, so nobody can read or
// change someone else's.
async function uidOf(req: NextRequest): Promise<string | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    return (await getAdminAuth().verifyIdToken(token)).uid;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const uid = await uidOf(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const snap = await getAdminDb().collection("pushSubscriptions").doc(uid).get();
    return NextResponse.json({ prefs: readPrefs(snap.exists ? snap.data()?.prefs : undefined) });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const uid = await uidOf(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const update = sanitizePrefsUpdate(await req.json());
    if (Object.keys(update).length === 0) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const ref = getAdminDb().collection("pushSubscriptions").doc(uid);
    const snap = await ref.get();
    const next = { ...readPrefs(snap.exists ? snap.data()?.prefs : undefined), ...update };
    await ref.set({ prefs: next, userId: uid, updatedAt: Date.now() }, { merge: true });
    return NextResponse.json({ prefs: next });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
