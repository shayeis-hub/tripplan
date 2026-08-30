import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

// Traveler DNA — stable fields asked once, reused across every trip. Trip-
// specific fields (pace, touristyVsLocal, walkingVsTransit, atmosphere,
// groupType) live on the trip document instead (trip.tripPrefs).
const FIELDS = [
  "foodImportance",
  "cuisineAdventure",
  "budgetStyle",
  "cultureInterest",
  "accommodationStyle",
] as const;

async function requireUid(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const uid = await requireUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const snap = await getAdminDb().collection("travelProfiles").doc(uid).get();
  if (!snap.exists) return NextResponse.json({ profile: null });
  return NextResponse.json({ profile: snap.data() });
}

export async function POST(req: Request) {
  const uid = await requireUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const profile: Record<string, unknown> = { userId: uid, updatedAt: FieldValue.serverTimestamp() };
  for (const key of FIELDS) {
    if (typeof body?.[key] === "string") profile[key] = body[key];
  }

  const ref = getAdminDb().collection("travelProfiles").doc(uid);
  const existing = await ref.get();
  if (!existing.exists) profile.createdAt = FieldValue.serverTimestamp();

  await ref.set(profile, { merge: true });
  return NextResponse.json({ ok: true });
}
