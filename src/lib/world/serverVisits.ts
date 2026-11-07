import { getAdminDb } from "@/lib/firebase-admin";
import { hasMeaningfulContent } from "@/lib/tripContent";
import { resolveCountry } from "./countries";
import type { Visit, VisitMap } from "./stats";

// Server side only. A user's "world" = what they entered by hand in My World (worldProfiles/{uid}.visits)
// plus what their own finished trips say: an owned trip with real content whose end date has passed counts as a
// visit to the country of its destination, one per (country, year). Pairs already entered by hand are not repeated.
// The yearly summary e-mail and the suggestions on the My World screen both use this, so they always agree.

const MIN_YEAR = 1950;

// A trip that was really used: an itinerary item, a flight or hotel, or any expense. A trip with only a destination
// and dates is usually an abandoned wizard (it autosaves while typing), so it does not count as a visit.
function wasUsed(t: Record<string, unknown>): boolean {
  return hasMeaningfulContent(t) || (Array.isArray(t.expenses) && t.expenses.length > 0);
}

export type TripVisit = { cc: string; year: number };

export async function loadWorld(uid: string): Promise<{ home: string | null; visits: Record<string, Visit>; tripVisits: TripVisit[] }> {
  const db = getAdminDb();
  const snap = await db.collection("worldProfiles").doc(uid).get();
  const data = snap.exists ? snap.data() || {} : {};
  const visits = (data.visits || {}) as Record<string, Visit>;

  const tripVisits: TripVisit[] = [];
  try {
    const today = new Date().toISOString().slice(0, 10);
    const thisYear = new Date().getFullYear();
    const have = new Set(Object.values(visits).map((v) => `${v.cc}:${v.year}`));
    const seen = new Set<string>();
    const trips = await db.collection("trips").where("owner", "==", uid).get();
    for (const d of trips.docs) {
      const t = d.data();
      const end = typeof t.endDate === "string" ? t.endDate : "";
      if (!end || end >= today || !wasUsed(t)) continue;
      const cc = resolveCountry(t.country) || resolveCountry(t.destination);
      const year = Number(end.slice(0, 4));
      if (!cc || !Number.isInteger(year) || year < MIN_YEAR || year > thisYear) continue;
      const key = `${cc}:${year}`;
      if (have.has(key) || seen.has(key)) continue;
      seen.add(key);
      tripVisits.push({ cc, year });
    }
  } catch {
    /* trips are a bonus source; never fail because of them */
  }
  tripVisits.sort((a, b) => b.year - a.year);
  return { home: (data.home as string | null) ?? null, visits, tripVisits };
}

// Manual entries plus trip-derived ones, as one map for the statistics.
export function mergeVisits(visits: Record<string, Visit>, tripVisits: TripVisit[]): VisitMap {
  const out: VisitMap = { ...visits };
  for (const t of tripVisits) out[`t:${t.cc}:${t.year}`] = { cc: t.cc, year: t.year, source: "trip" };
  return out;
}
