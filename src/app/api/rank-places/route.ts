import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface Place {
  name: string;
  description?: string;
  rating?: number;
  ratingCount?: number;
}

// Traveler DNA — stable across every trip, read server-side from the
// caller's own profile doc.
const PROFILE_LABELS: Record<string, Record<string, string>> = {
  foodImportance: { casual: "food is a minor part of the trip", important: "food is an important part of the trip", central: "food is central — plans around meals" },
  cuisineAdventure: { familiar: "prefers familiar food", mixed: "open to some new food", adventurous: "adventurous, seeks out new/unusual food" },
  budgetStyle: { budget: "budget-conscious, price comes first", value: "value for money", splurge: "willing to pay more for something great" },
  cultureInterest: { low: "not very interested in museums/history", some: "somewhat interested in culture/history", high: "very interested in museums, culture and history" },
  accommodationStyle: { simple: "prefers simple, functional accommodation", comfortable: "prefers comfortable accommodation", pampering: "enjoys pampering, high-comfort accommodation" },
};

// Trip Preferences — specific to this trip, sent by the client from the
// trip document (trip.tripPrefs), since they change trip to trip.
const TRIP_PREFS_LABELS: Record<string, Record<string, string>> = {
  pace: { relaxed: "relaxed, unhurried pace", balanced: "balanced pace", packed: "packed, sees as much as possible" },
  touristyVsLocal: { touristy: "prefers well-known touristy spots", mixed: "mix of touristy and local", local: "prefers local, off-the-beaten-path spots" },
  walkingVsTransit: { walking: "prefers walking", mixed: "mix of walking and transit", transit: "prefers public transit/taxis" },
  atmosphere: { quiet: "prefers quiet places", mixed: "no strong preference on noise", lively: "prefers lively, energetic places" },
  groupType: { family: "traveling with family", couple: "traveling as a couple", friends: "traveling with friends", solo: "traveling solo" },
};

function describe(source: Record<string, string> | undefined, labels: Record<string, Record<string, string>>): string[] {
  if (!source) return [];
  return Object.entries(labels)
    .map(([key, opts]) => (source[key] && opts[source[key]]) || null)
    .filter((v): v is string => Boolean(v));
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let uid: string;
  try {
    uid = (await getAdminAuth().verifyIdToken(token)).uid;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const places: Place[] = Array.isArray(body?.places) ? body.places : [];
  const destination: string = body?.destination || "";
  const category: string = body?.category === "restaurant" ? "restaurant" : "attraction";
  const lang: string = body?.lang === "he" || body?.lang === "es" ? body.lang : "en";
  // Trip Preferences come from the request body (the client already has its
  // own trip doc loaded) — unlike the DNA profile, these aren't sensitive
  // per-user data, just this-trip context the caller is asking about.
  const tripPrefs: Record<string, string> | undefined =
    body?.tripPrefs && typeof body.tripPrefs === "object" ? body.tripPrefs : undefined;

  if (!places.length || !destination) {
    return NextResponse.json({ error: "Missing places or destination" }, { status: 400 });
  }

  // Traveler DNA is read server-side from the verified caller's own doc —
  // never trusted from the request body, so one user can't rank with
  // another's stated preferences.
  const profileSnap = await getAdminDb().collection("travelProfiles").doc(uid).get();
  const dnaParts = profileSnap.exists ? describe(profileSnap.data() as Record<string, string>, PROFILE_LABELS) : [];
  const tripParts = describe(tripPrefs, TRIP_PREFS_LABELS);
  const allParts = [...dnaParts, ...tripParts];
  if (allParts.length === 0) {
    // No-op: nothing to personalize on, hand back the original order unchanged.
    return NextResponse.json({ places: places.map(p => ({ ...p, why: null })) });
  }
  const profileText = allParts.join("; ");

  const placesList = places.map((p, i) => `${i}. ${p.name}${p.rating ? ` (${p.rating}★, ${p.ratingCount || 0} reviews)` : ""}${p.description ? ` — ${p.description}` : ""}`).join("\n");

  const langNote = lang === "he" ? "Write the \"why\" field in Hebrew." : lang === "es" ? "Write the \"why\" field in Spanish." : "Write the \"why\" field in English.";

  const prompt = `A traveler visiting ${destination} has this travel style: ${profileText}.

Here is a real, verified list of ${category === "restaurant" ? "restaurants" : "attractions"} (do not invent any, do not add any not listed, do not drop any):
${placesList}

Reorder these to best match this traveler's style (best match first), and for each give a very short reason (under 12 words) tied to their specific preferences — not generic praise. ${langNote}

Return ONLY JSON in this exact format, no markdown, no explanation:
{"order":[<original indices in new order, e.g. 2,0,1,...>],"why":["reason for order[0]","reason for order[1]",...]}`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (response.content[0] as { type: string; text: string }).text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("no json in response");
    const data = JSON.parse(jsonMatch[0]);

    const order: number[] = Array.isArray(data.order) ? data.order : [];
    const why: string[] = Array.isArray(data.why) ? data.why : [];

    const valid = order.length === places.length && order.every((i: number) => Number.isInteger(i) && i >= 0 && i < places.length);
    if (!valid) throw new Error("invalid order from model");

    const ranked = order.map((i: number, pos: number) => ({ ...places[i], why: typeof why[pos] === "string" ? why[pos] : null }));
    return NextResponse.json({ places: ranked });
  } catch (err: unknown) {
    console.error("rank-places error:", err);
    // Fail soft: original order, no "why" — Discover should never break
    // because ranking failed.
    return NextResponse.json({ places: places.map(p => ({ ...p, why: null })) });
  }
}
