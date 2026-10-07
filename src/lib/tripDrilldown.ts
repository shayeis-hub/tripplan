// Per-trip rows behind the lifecycle numbers (admin drill-down) and the
// "departing soon" operational list. Built from the trips scan the dashboard
// already does, so it adds no Firestore reads. Holds no e-mail addresses,
// names, amounts, flight numbers or hotel names: only counts, dates, the
// destination and the trip id.
import type { TripLite } from "./adminMetrics";
import { classifyTripPhase, dateIssue, dayNumber, type DateIssue, type Phase } from "./tripLifecycle";

export const RECENT_UPDATE_DAYS = 7;

export interface TripRow {
  id: string;
  destination: string;
  city: string;
  startDate: string | null;
  endDate: string | null;
  phase: Phase;
  // Calendar-day distances against "today" (home zone). Which one is relevant
  // depends on the phase; null when dates cannot be placed.
  daysToStart: number | null; // > 0 future, 0 starts today, < 0 already started
  daysToEnd: number | null; // >= 0 not yet over, < 0 days since return
  dateIssue: DateIssue | null;
  createdAt: number | null; // null = unknown (older trip), never inferred
  updatedAt: number | null;
  travelers: number;
  activities: number;
  flights: number;
  hotels: number;
  expenses: number;
  otherExpenses: number; // expenses other than flight / hotel
  packingItems: number;
  packingChecked: number;
  shared: boolean; // another account has access
  hasContent: boolean; // itinerary item, flight or hotel (existing definition)
  recentlyUpdated: boolean; // updatedAt within the last RECENT_UPDATE_DAYS
}

export function buildTripRow(t: TripLite, today: string, nowMs: number): TripRow {
  const phase = classifyTripPhase(t.startDate, t.endDate, today);
  const tn = dayNumber(today);
  const s = dayNumber(t.startDate);
  const e = dayNumber(t.endDate);
  const placed = phase !== "unknown" && tn != null && s != null && e != null;
  return {
    id: t.id,
    destination: t.destination,
    city: t.city,
    startDate: t.startDate,
    endDate: t.endDate,
    phase,
    daysToStart: placed ? s! - tn! : null,
    daysToEnd: placed ? e! - tn! : null,
    dateIssue: dateIssue(t.startDate, t.endDate),
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    travelers: t.peopleCount,
    activities: t.activityCount,
    flights: t.flightCount,
    hotels: t.hotelCount,
    expenses: t.expenseCount,
    otherExpenses: t.expenseCount - t.flightHotelCount,
    packingItems: t.packingItems,
    packingChecked: t.packingChecked,
    shared: t.sharedWith.length > 0,
    hasContent: t.activityCount > 0 || t.flightHotelCount > 0,
    recentlyUpdated: t.updatedAt != null && nowMs - t.updatedAt <= RECENT_UPDATE_DAYS * 86400000,
  };
}

export type SortKey = "start" | "created" | "updated";

// Compare two rows for the drill-down. For "past" the default is the most
// recent RETURN date, for "now" the nearest END date, otherwise the departure
// date; "created" / "updated" are explicit alternatives. Rows with an unknown
// value for the chosen key always sort last, whatever the direction.
export function sortRows(
  rows: TripRow[],
  group: Phase | "future",
  key: SortKey | "default",
  dir: 1 | -1 = 1,
): TripRow[] {
  const pick = (r: TripRow): number | null => {
    if (key === "created") return r.createdAt;
    if (key === "updated") return r.updatedAt;
    if (key === "start") {
      const n = dayNumber(r.startDate);
      return n;
    }
    // "default": group-specific
    if (group === "past" || group === "now") return dayNumber(r.endDate);
    return dayNumber(r.startDate);
  };
  const d = key === "default" ? (group === "past" ? -1 : 1) : dir;
  return [...rows].sort((a, b) => {
    const x = pick(a);
    const y = pick(b);
    if (x == null && y == null) return a.id.localeCompare(b.id);
    if (x == null) return 1;
    if (y == null) return -1;
    return x === y ? a.id.localeCompare(b.id) : (x - y) * d;
  });
}

// Hebrew count phrase with the correct singular ("נוסע אחד", not "1 נוסעים").
export const heCount = (n: number, one: string, many: string) => (n === 1 ? one : `${n} ${many}`);

// Factual signals shown for trips departing within 30 days. Deliberately
// descriptive: nothing here labels a trip good, bad or abandoned.
export function diagnosticText(r: TripRow): string {
  const parts = [
    heCount(r.activities, "פעילות אחת", "פעילויות"),
    heCount(r.travelers, "נוסע אחד", "נוסעים"),
    heCount(r.expenses, "הוצאה אחת", "הוצאות"),
    r.packingItems > 0 ? "רשימת אריזה קיימת" : "אין רשימת אריזה",
  ];
  return parts.join(" · ");
}

export interface SignalSummary {
  trips: number;
  withActivities: number;
  withFlight: number;
  withHotel: number;
  withOtherExpenses: number;
  withTravelers: number;
  withPacking: number;
  shared: number;
  recentlyUpdated: number;
}

export function summarizeSignals(rows: TripRow[]): SignalSummary {
  const c = (f: (r: TripRow) => boolean) => rows.filter(f).length;
  return {
    trips: rows.length,
    withActivities: c(r => r.activities > 0),
    withFlight: c(r => r.flights > 0),
    withHotel: c(r => r.hotels > 0),
    withOtherExpenses: c(r => r.otherExpenses > 0),
    withTravelers: c(r => r.travelers > 0),
    withPacking: c(r => r.packingItems > 0),
    shared: c(r => r.shared),
    recentlyUpdated: c(r => r.recentlyUpdated),
  };
}
