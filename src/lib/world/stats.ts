import { cityId, cityXY, findCity, normCity } from "./cities";
import { CAPITALS, CONTINENT, LANGS, MEMBERS } from "./geo";

export { normCity };

// "My World" statistics. Pure functions, shared by the screen (and later the share card / yearly summary).

export type Visit = { cc: string; year: number; city?: string; addedAt?: number; source?: "manual" | "trip" };
export type VisitMap = Record<string, Visit>;

// A trip-derived visit is one per (country, year, city); the same city in another language is the same city.
export const tripVisitKey = (v: { cc: string; year: number; city?: string }) => `t:${v.cc}:${v.year}:${v.city ? cityId(v.cc, v.city) : ""}`;

// Distinct cities among visits that have one (a city only counts together with its country), and the map positions
// of those the city list knows.
function cityInfo(visits: Visit[]): { count: number; dots: [number, number][] } {
  const ids = new Set<string>();
  const dots: [number, number][] = [];
  for (const v of visits) {
    const n = v.city ? normCity(v.city) : "";
    if (!n) continue;
    const id = cityId(v.cc, v.city as string);
    if (ids.has(id)) continue;
    ids.add(id);
    const i = findCity(v.cc, v.city as string);
    if (i >= 0) dots.push(cityXY(i));
  }
  return { count: ids.size, dots };
}

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
  cities: number; // distinct cities (with their country) among visits that name one
  cityDots: [number, number][]; // map positions of the known ones
};

export function computeStats(home: string | null | undefined, visits: VisitMap): WorldStats {
  const visited = [...new Set(Object.values(visits).map((v) => v.cc))];
  const members = visited.filter((c) => MEMBER_SET.has(c));
  const continents = new Set(visited.map((c) => CONTINENT[c]).filter(Boolean));
  const langs = new Set<string>();
  for (const c of members) for (const l of LANGS[c] || []) langs.add(l);

  const ci = cityInfo(Object.values(visits));
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
    cities: ci.count,
    cityDots: ci.dots,
  };
}

// ---------------------------------------------------------------- yearly summary ("2026 in the world")

// The year whose summary is shown now: from Dec 17 (two weeks before year end) it is the current year, and
// through January it is still the year that just ended. Otherwise there is none.
// force: the person came from the yearly e-mail (or a test of it), so show the summary whatever the date is
// (the e-mail goes out on Dec 17 UTC, which is still Dec 16 in the Americas).
export function annualYear(now: Date = new Date(), force = false): number | null {
  const m = now.getMonth(); // 0 = January
  if (force) return m === 0 ? now.getFullYear() - 1 : now.getFullYear();
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
  cities: number; // distinct cities visited in that year
  cityDots: [number, number][];
};

export function computeYearStats(home: string | null | undefined, visits: VisitMap, year: number): YearStats {
  const all = Object.values(visits);
  const inYear = all.filter((v) => v.year === year);
  const visited = [...new Set(inYear.map((v) => v.cc))];
  const earlier = new Set(all.filter((v) => v.year < year).map((v) => v.cc));
  const members = visited.filter((c) => MEMBER_SET.has(c));
  const homeCap = home ? CAPITALS[home] : undefined;
  const yi = cityInfo(inYear);
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
    cities: yi.count,
    cityDots: yi.dots,
  };
}
