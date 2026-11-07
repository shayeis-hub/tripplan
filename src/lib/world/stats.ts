import { CAPITALS, CONTINENT, LANGS, MEMBERS } from "./geo";

// "My World" statistics. Pure functions, shared by the screen (and later the share card / yearly summary).

export type Visit = { cc: string; year: number; city?: string; addedAt?: number; source?: "manual" | "trip" };
export type VisitMap = Record<string, Visit>;

const EARTH_RADIUS_KM = 6371;
export const EARTH_CIRCUMFERENCE_KM = 40075;
const MEMBER_SET = new Set(MEMBERS);

export function distanceKm(a: [number, number], b: [number, number]): number {
  const r = Math.PI / 180;
  const dLat = (b[0] - a[0]) * r;
  const dLon = (b[1] - a[1]) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export type WorldStats = {
  visited: string[]; // every distinct country/territory code (for the map)
  countries: number; // distinct members of the 195 (what the totals count)
  territories: number; // distinct visited codes that are not among the 195
  continents: number; // out of 6
  pctWorld: number; // countries / 195, whole percent
  km: number | null; // estimated round-trip flight distance, null without a home country
  earthLaps: number | null; // km / earth circumference
  languages: number;
};

export function computeStats(home: string | null | undefined, visits: VisitMap): WorldStats {
  const visited = [...new Set(Object.values(visits).map((v) => v.cc))];
  const members = visited.filter((c) => MEMBER_SET.has(c));
  const continents = new Set(visited.map((c) => CONTINENT[c]).filter(Boolean));
  const langs = new Set<string>();
  for (const c of members) for (const l of LANGS[c] || []) langs.add(l);

  let km: number | null = null;
  const homeCap = home ? CAPITALS[home] : undefined;
  if (homeCap) {
    km = 0;
    // One round trip per entered visit (country + year), capital to capital.
    for (const v of Object.values(visits)) {
      if (v.cc === home || !CAPITALS[v.cc]) continue;
      km += 2 * distanceKm(homeCap, CAPITALS[v.cc]);
    }
    km = Math.round(km / 100) * 100;
  }
  return {
    visited,
    countries: members.length,
    territories: visited.length - members.length,
    continents: continents.size,
    pctWorld: Math.round((members.length / MEMBERS.length) * 100),
    km,
    earthLaps: km == null ? null : km / EARTH_CIRCUMFERENCE_KM,
    languages: langs.size,
  };
}

// ---------------------------------------------------------------- yearly summary ("2026 in the world")

// The year whose summary is shown now: from Dec 17 (two weeks before year end) it is the current year, and
// through January it is still the year that just ended. Otherwise there is none.
export function annualYear(now: Date = new Date()): number | null {
  const m = now.getMonth(); // 0 = January
  if (m === 11 && now.getDate() >= 17) return now.getFullYear();
  if (m === 0) return now.getFullYear() - 1;
  return null;
}

export type YearStats = {
  year: number;
  visits: number; // entries in that year (each one is a trip)
  visited: string[]; // every country/territory visited in that year (repeat visits included)
  prev: string[]; // visited in earlier years only (shown dimmed on the map)
  countries: number; // distinct members of the 195 visited in that year
  newCountries: number; // of those, countries with no visit in an earlier year
  continents: number;
  km: number | null; // round trips of that year only
};

export function computeYearStats(home: string | null | undefined, visits: VisitMap, year: number): YearStats {
  const all = Object.values(visits);
  const inYear = all.filter((v) => v.year === year);
  const visited = [...new Set(inYear.map((v) => v.cc))];
  const earlier = new Set(all.filter((v) => v.year < year).map((v) => v.cc));
  const members = visited.filter((c) => MEMBER_SET.has(c));
  const homeCap = home ? CAPITALS[home] : undefined;
  let km: number | null = null;
  if (homeCap) {
    km = 0;
    for (const v of inYear) {
      if (v.cc === home || !CAPITALS[v.cc]) continue;
      km += 2 * distanceKm(homeCap, CAPITALS[v.cc]);
    }
    km = Math.round(km / 100) * 100;
  }
  return {
    year,
    visits: inYear.length,
    visited,
    prev: [...earlier].filter((c) => !visited.includes(c)),
    countries: members.length,
    newCountries: members.filter((c) => !earlier.has(c)).length,
    continents: new Set(visited.map((c) => CONTINENT[c]).filter(Boolean)).size,
    km,
  };
}
