// Trip lifecycle analysis for the admin dashboard: where each created trip sits
// relative to today, and how many already have meaningful content.
//
// Date semantics (same as the product, see TripPlan.jsx):
//  - Trip dates are date-only strings "YYYY-MM-DD" (from <input type="date">),
//    with no time and no zone, and the end date is INCLUSIVE.
//  - The product compares them lexicographically with the viewer's local
//    calendar date: ended = endDate < today; underway = startDate <= today <=
//    endDate. The server has no viewer, so "today" is the calendar date in
//    Asia/Jerusalem (the product's home zone, also push-cron's ORIGIN_TZ). For
//    a traveler elsewhere this can differ by one day, and only for trips that
//    start or end within a day of today.
//  - Day counts are differences of calendar days computed on UTC midnights of
//    the date-only values, so DST changes and the server's own zone can never
//    shift a count by one.
//
// "Meaningful content" is NOT defined here; callers pass it in (itinerary item,
// flight or hotel - see lib/tripContent.ts).

export type Phase = "past" | "now" | "future30" | "future90" | "future91" | "unknown";

export const PHASE_ORDER: Phase[] = ["past", "now", "future30", "future90", "future91", "unknown"];

export const HOME_TZ = "Asia/Jerusalem";

// Calendar date ("YYYY-MM-DD") of an instant in the home zone.
export function homeToday(now: Date = new Date()): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: HOME_TZ, year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(now)
      .map(x => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}`;
}

// A real calendar day as a whole number of days since the epoch, or null for
// anything that is not a valid "YYYY-MM-DD" (wrong shape, or e.g. 2026-02-30).
export function dayNumber(s: unknown): number | null {
  if (typeof s !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  const ms = Date.UTC(y, mo - 1, d);
  const dt = new Date(ms);
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return ms / 86400000;
}

// Both dates must be valid and end >= start, otherwise the trip cannot be
// placed reliably and is reported as "unknown" instead of being guessed.
export function classifyTripPhase(startDate: unknown, endDate: unknown, today: string): Phase {
  const s = dayNumber(startDate);
  const e = dayNumber(endDate);
  const t = dayNumber(today);
  if (s == null || e == null || t == null || e < s) return "unknown";
  if (e < t) return "past";
  if (s <= t) return "now";
  const days = s - t; // >= 1: departure is after today
  if (days <= 30) return "future30";
  if (days <= 90) return "future90";
  return "future91";
}

export type DateIssue =
  | "missing_both"
  | "missing_start"
  | "missing_end"
  | "invalid_start"
  | "invalid_end"
  | "end_before_start";

// Why a trip's dates cannot be placed on the timeline (null when they can).
export function dateIssue(startDate: unknown, endDate: unknown): DateIssue | null {
  const blank = (v: unknown) => v == null || (typeof v === "string" && v.trim() === "");
  const sBlank = blank(startDate);
  const eBlank = blank(endDate);
  if (sBlank && eBlank) return "missing_both";
  if (sBlank) return "missing_start";
  if (eBlank) return "missing_end";
  const s = dayNumber(startDate);
  const e = dayNumber(endDate);
  if (s == null) return "invalid_start";
  if (e == null) return "invalid_end";
  if (e < s) return "end_before_start";
  return null;
}

export interface LifecycleTrip {
  startDate: string | null;
  endDate: string | null;
  hasContent: boolean;
}

export interface LifecycleGroup {
  key: Phase;
  trips: number;
  withContent: number;
  withoutContent: number;
  pct: number | null; // % with content, null when there are no trips
}

export interface Lifecycle {
  today: string;
  total: number;
  groups: LifecycleGroup[];
  futureTotal: { trips: number; withContent: number; pct: number | null };
  // Created trips departing in the next 1-30 days (the "future30" group).
  upcoming: { withContent: number; total: number; pct: number | null };
  // Created trips WITHOUT meaningful content, by timing (sums to withoutContent).
  noContent: { total: number; byPhase: { key: Phase; count: number }[] };
}

const pct1 = (n: number, d: number): number | null => (d > 0 ? Math.round((n / d) * 1000) / 10 : null);

export function computeLifecycle(trips: LifecycleTrip[], today: string = homeToday()): Lifecycle {
  const acc: Record<Phase, { trips: number; withContent: number }> = {
    past: { trips: 0, withContent: 0 },
    now: { trips: 0, withContent: 0 },
    future30: { trips: 0, withContent: 0 },
    future90: { trips: 0, withContent: 0 },
    future91: { trips: 0, withContent: 0 },
    unknown: { trips: 0, withContent: 0 },
  };
  for (const t of trips) {
    const g = acc[classifyTripPhase(t.startDate, t.endDate, today)];
    g.trips++;
    if (t.hasContent) g.withContent++;
  }
  const groups: LifecycleGroup[] = PHASE_ORDER.map(key => ({
    key,
    trips: acc[key].trips,
    withContent: acc[key].withContent,
    withoutContent: acc[key].trips - acc[key].withContent,
    pct: pct1(acc[key].withContent, acc[key].trips),
  }));
  const fTrips = acc.future30.trips + acc.future90.trips + acc.future91.trips;
  const fWith = acc.future30.withContent + acc.future90.withContent + acc.future91.withContent;
  const withoutTotal = groups.reduce((s, g) => s + g.withoutContent, 0);
  return {
    today,
    total: trips.length,
    groups,
    futureTotal: { trips: fTrips, withContent: fWith, pct: pct1(fWith, fTrips) },
    upcoming: {
      withContent: acc.future30.withContent,
      total: acc.future30.trips,
      pct: pct1(acc.future30.withContent, acc.future30.trips),
    },
    noContent: {
      total: withoutTotal,
      byPhase: groups.map(g => ({ key: g.key, count: g.withoutContent })),
    },
  };
}
