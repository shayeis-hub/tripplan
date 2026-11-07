import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { COUNTRY_NAMES, resolveCountry } from "@/lib/world/countries";
import { hasMeaningfulContent } from "@/lib/tripContent";

export const dynamic = "force-dynamic";

// "My World": the countries a user has visited, entered by hand (or accepted from the suggestions below).
// worldProfiles/{uid} is read and written ONLY through this route with the Admin SDK, exactly like
// travelProfiles — so no Firestore rules and no indexes are involved. Deleted with the account.
//   { userId, home?: "IL", visits: { [id]: { cc, year, city?, addedAt, source } }, createdAt, updatedAt }

const MAX_VISITS = 500;
const MIN_YEAR = 1950;

async function requireUid(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    return (await getAdminAuth().verifyIdToken(token)).uid;
  } catch {
    return null;
  }
}

type Visit = { cc: string; year: number; city?: string; addedAt: number; source: "manual" | "trip" };

const validCc = (v: unknown): v is string => typeof v === "string" && v in COUNTRY_NAMES;
const validYear = (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= MIN_YEAR && v <= new Date().getFullYear();
const cleanCity = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const s = v.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, 60);
  return s || undefined;
};

export async function GET(req: Request) {
  const uid = await requireUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getAdminDb();

  const snap = await db.collection("worldProfiles").doc(uid).get();
  const data = snap.exists ? snap.data() || {} : {};
  const visits = (data.visits || {}) as Record<string, Visit>;

  // Suggestions: finished trips of this user (owner only, with real content) whose destination resolves to
  // a country, one per (country, year), minus what is already entered.
  const suggestions: { cc: string; year: number }[] = [];
  try {
    const today = new Date().toISOString().slice(0, 10);
    const trips = await db.collection("trips").where("owner", "==", uid).get();
    const have = new Set(Object.values(visits).map((v) => `${v.cc}:${v.year}`));
    const seen = new Set<string>();
    for (const d of trips.docs) {
      const t = d.data();
      const end = typeof t.endDate === "string" ? t.endDate : "";
      if (!end || end >= today || !hasMeaningfulContent(t)) continue;
      const cc = resolveCountry(t.country) || resolveCountry(t.destination);
      const year = Number(end.slice(0, 4));
      if (!cc || !validYear(year)) continue;
      const key = `${cc}:${year}`;
      if (have.has(key) || seen.has(key)) continue;
      seen.add(key);
      suggestions.push({ cc, year });
    }
  } catch {
    /* suggestions are a bonus; never fail the screen because of them */
  }
  suggestions.sort((a, b) => b.year - a.year);

  return NextResponse.json({ home: data.home ?? null, visits, suggestions });
}

export async function POST(req: Request) {
  const uid = await requireUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const ref = getAdminDb().collection("worldProfiles").doc(uid);
  const action = body?.action;

  if (action === "setHome") {
    if (!validCc(body.cc)) return NextResponse.json({ error: "bad_country" }, { status: 400 });
    await ref.set({ userId: uid, home: body.cc, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return NextResponse.json({ ok: true });
  }

  if (action === "add") {
    const items: unknown[] = Array.isArray(body.items) ? body.items.slice(0, 100) : [];
    if (!items.length) return NextResponse.json({ error: "no_items" }, { status: 400 });
    const snap = await ref.get();
    const existing = (snap.exists ? snap.data()?.visits || {} : {}) as Record<string, Visit>;
    let count = Object.keys(existing).length;
    const added: Record<string, Visit> = {};
    for (const raw of items) {
      const it = raw as Record<string, unknown>;
      if (!validCc(it?.cc) || !validYear(it?.year)) continue;
      if (count >= MAX_VISITS) return NextResponse.json({ error: "limit" }, { status: 400 });
      const id = randomBytes(6).toString("hex");
      const v: Visit = { cc: it.cc, year: it.year, addedAt: Date.now(), source: it.source === "trip" ? "trip" : "manual" };
      const city = cleanCity(it.city);
      if (city) v.city = city;
      added[id] = v;
      count++;
    }
    if (Object.keys(added).length) {
      const patch: Record<string, unknown> = { userId: uid, visits: added, updatedAt: FieldValue.serverTimestamp() };
      if (!snap.exists) patch.createdAt = FieldValue.serverTimestamp();
      await ref.set(patch, { merge: true });
    }
    return NextResponse.json({ ok: true, added });
  }

  if (action === "remove") {
    if (typeof body.id !== "string" || !/^[0-9a-f]{12}$/.test(body.id)) return NextResponse.json({ error: "bad_id" }, { status: 400 });
    try {
      await ref.update({ [`visits.${body.id}`]: FieldValue.delete(), updatedAt: FieldValue.serverTimestamp() });
    } catch {
      /* no document yet: nothing to remove */
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "bad_action" }, { status: 400 });
}
