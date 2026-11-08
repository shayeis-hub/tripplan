import { getAdminDb } from "@/lib/firebase-admin";
import { hasMeaningfulContent } from "@/lib/tripContent";
import { resolveCountry } from "./countries";
import { normCity, tripVisitKey, type Visit, type VisitMap } from "./stats";

// Server side only. A user's "world" = what they entered by hand in My World (worldProfiles/{uid}.visits)
// plus what their own finished trips say: a trip they own or joined (not as a view-only guest) with real content whose end date has passed counts as a
// visit to the country of its destination, one per (country, year). Pairs already entered by hand are not repeated.
// The yearly summary e-mail and the suggestions on the My World screen both use this, so they always agree.

const MIN_YEAR = 1950;

// A trip that was really used: an itinerary item, a flight or hotel, or any expense. A trip with only a destination
// and dates is usually an abandoned wizard (it autosaves while typing), so it does not count as a visit.
function wasUsed(t: Record<string, unknown>): boolean {
  return hasMeaningfulContent(t) || (Array.isArray(t.expenses) && t.expenses.length > 0);
}

export type TripVisit = { cc: string; year: number; city?: string };

// The city of a trip: the one picked in the trip's destination box ("Venice, Italy" -> city "Venice"). A trip whose
// destination is only a country has no city.
function tripCity(t: Record<string, unknown>, cc: string): string | undefined {
  const dest = typeof t.destination === "string" ? t.destination : "";
  const hasComma = dest.includes(",");
  const raw = (typeof t.city === "string" && t.city.trim() ? t.city : hasComma ? dest.split(",")[0] : "").trim().slice(0, 60);
  if (!raw || (!hasComma && resolveCountry(raw) === cc)) return undefined;
  return raw;
}


// email: the person's address (lower-case). With it, trips shared WITH them count too: someone who joined a trip
// travelled as well (view-only guests do not).
export async function loadWorld(uid: string, email?: string | null): Promise<{ home: string | null; visits: Record<string, Visit>; tripVisits: TripVisit[] }> {
  const db = getAdminDb();
  const snap = await db.collection("worldProfiles").doc(uid).get();
  const data = snap.exists ? snap.data() || {} : {};
  const visits = (data.visits || {}) as Record<string, Visit>;

  const tripVisits: TripVisit[] = [];
  try {
    const today = new Date().toISOString().slice(0, 10);
    const thisYear = new Date().getFullYear();
    // Entered by hand: with a city it covers the trip to that city; without one it covers a single trip of that
    // country and year (it was most likely added from this very trip).
    const haveCity = new Set<string>();
    const haveBare = new Map<string, number>();
    for (const v of Object.values(visits)) {
      const n = v.city ? normCity(v.city) : "";
      if (n) haveCity.add(`${v.cc}:${v.year}:${n}`);
      else haveBare.set(`${v.cc}:${v.year}`, (haveBare.get(`${v.cc}:${v.year}`) || 0) + 1);
    }
    const seen = new Set<string>();
    const found: TripVisit[] = [];
    const mine = await db.collection("trips").where("owner", "==", uid).get();
    const docs = [...mine.docs];
    const mail = email ? email.trim().toLowerCase() : null;
    if (mail) {
      const shared = await db.collection("trips").where("sharedWith", "array-contains", mail).get();
      const ids = new Set(docs.map((d) => d.id));
      for (const d of shared.docs) {
        const viewOnly = Array.isArray(d.data().viewOnlyUsers) ? (d.data().viewOnlyUsers as string[]) : [];
        if (!ids.has(d.id) && !viewOnly.map((x) => String(x).toLowerCase()).includes(mail)) docs.push(d);
      }
    }
    for (const d of docs) {
      const t = d.data();
      const end = typeof t.endDate === "string" ? t.endDate : "";
      if (!end || end >= today || !wasUsed(t)) continue;
      const cc = resolveCountry(t.country) || resolveCountry(t.destination);
      const year = Number(end.slice(0, 4));
      if (!cc || !Number.isInteger(year) || year < MIN_YEAR || year > thisYear) continue;
      const city = tripCity(t, cc);
      const key = tripVisitKey({ cc, year, city });
      if (seen.has(key) || (city && haveCity.has(`${cc}:${year}:${normCity(city)}`))) continue;
      seen.add(key);
      found.push({ cc, year, ...(city ? { city } : {}) });
    }
    // Hand-entered visits without a city absorb trips of the same country and year (trips with a city go last).
    found.sort((a, b) => Number(!!a.city) - Number(!!b.city));
    for (const f of found) {
      const bk = `${f.cc}:${f.year}`;
      const left = haveBare.get(bk) || 0;
      if (left > 0) { haveBare.set(bk, left - 1); continue; }
      tripVisits.push(f);
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
  for (const t of tripVisits) out[tripVisitKey(t)] = { cc: t.cc, year: t.year, ...(t.city ? { city: t.city } : {}), source: "trip" };
  return out;
}
