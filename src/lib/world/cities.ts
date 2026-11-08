import { CITIES, type CityRow } from "./citiesData";

// City recognition for "My World". A city the person typed (or a trip's destination city) is matched, within its
// country, against CITIES by any of its English / Hebrew / Spanish names, so "Venice", "ונציה" and "Venecia" are one
// city and can be placed on the map. A city that is not in the list still counts (by its own normalized name) but has
// no dot on the map.

// Identity of a city name: lower case, no accents or niqqud, letters and digits only.
export function normCity(c: string): string {
  return c.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

let index: Map<string, number> | null = null;
function byName(): Map<string, number> {
  if (index) return index;
  const m = new Map<string, number>();
  const put = (cc: string, name: string, i: number) => {
    const n = normCity(name);
    if (!n) return;
    const k = `${cc}:${n}`;
    if (!m.has(k)) m.set(k, i); // the larger city (earlier row) wins a shared name
  };
  CITIES.forEach((r, i) => {
    for (const name of [r[3], r[4], r[5]]) {
      if (!name) continue;
      put(r[0], name, i);
      // "תל אביב-יפו" / "Tel Aviv-Yafo": the first part alone is also a name people type
      const first = name.split(/[-–/]/)[0].trim();
      if (first && first !== name) put(r[0], first, i);
    }
  });
  index = m;
  return m;
}

// Row index of the known city, or -1.
export function findCity(cc: string, name: string): number {
  const n = normCity(name);
  if (!n) return -1;
  return byName().get(`${cc}:${n}`) ?? -1;
}

// What identifies a city for counting: the known city, or the normalized text when it is unknown.
export function cityId(cc: string, name: string): string {
  const i = findCity(cc, name);
  return i >= 0 ? `${cc}:#${i}` : `${cc}:${normCity(name)}`;
}

export type CityLang = "he" | "en" | "es";

export function cityName(row: CityRow, lang: CityLang): string {
  return (lang === "he" ? row[4] : lang === "es" ? row[5] : "") || row[3];
}

// A stored city shown in the viewer's language when it is a known city, otherwise as typed.
export function cityLabel(cc: string, name: string, lang: CityLang): string {
  const i = findCity(cc, name);
  return i >= 0 ? cityName(CITIES[i], lang) : name;
}

// Map position of a known city (the same projection and canvas as the country map), or null.
const rad = Math.PI / 180;
function natEarth(lon: number, lat: number): [number, number] {
  const l = lon * rad, p = lat * rad, p2 = p * p, p4 = p2 * p2;
  return [
    l * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4))),
    p * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4))),
  ];
}
const XMAX = natEarth(180, 0)[0];
const SC = 1000 / (2 * XMAX);
const YTOP = natEarth(0, 84)[1];
export function cityXY(i: number): [number, number] {
  const r = CITIES[i];
  const [x, y] = natEarth(r[2], r[1]);
  return [Math.round((x + XMAX) * SC * 10) / 10, Math.round((YTOP - y) * SC * 10) / 10];
}

// Autocomplete: known cities whose name (in any language) starts a word with the query, biggest first.
export function searchCities(query: string, lang: CityLang, limit = 6): { i: number; cc: string; name: string }[] {
  const q = normCity(query);
  if (q.length < 2) return [];
  const starts: number[] = [];
  const inner: number[] = [];
  for (let i = 0; i < CITIES.length && starts.length < limit; i++) {
    const r = CITIES[i];
    let best = 0;
    for (const name of [r[3], r[4], r[5]]) {
      if (!name) continue;
      const n = normCity(name);
      if (n.startsWith(q)) { best = 2; break; }
      if (n.includes(" " + q)) best = Math.max(best, 1);
    }
    if (best === 2) starts.push(i);
    else if (best === 1 && inner.length < limit) inner.push(i);
  }
  return [...starts, ...inner].slice(0, limit).map((i) => ({ i, cc: CITIES[i][0], name: cityName(CITIES[i], lang) }));
}

export { CITIES };
