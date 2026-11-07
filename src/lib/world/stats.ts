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
    // One round trip per distinct country (not per visit): a lower-bound estimate.
    for (const c of visited) {
      if (c === home || !CAPITALS[c]) continue;
      km += 2 * distanceKm(homeCap, CAPITALS[c]);
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
