// Reminder deep link: /?trip=<tripId>&rn=<notificationEventId>
//
// SECURITY: the link only ever *selects* a trip the signed-in user can already
// read. The client looks the id up in its own trip list (Firestore rules decide
// what is in it), so knowing or guessing an id grants nothing. `rn` is only
// sent to /api/notification-open, which checks the event belongs to the
// signed-in user before recording anything.
import { EVENT_ID_PATTERN } from "./preTripReminder";

export interface TripLink {
  trip: string;
  rn: string | null;
}

const TRIP_ID = /^[A-Za-z0-9_-]{1,100}$/;
const PENDING_KEY = "pendingTripLink";
const PENDING_TTL_MS = 24 * 3600 * 1000;

export function parseTripParams(params: URLSearchParams): TripLink | null {
  const trip = params.get("trip");
  if (!trip || !TRIP_ID.test(trip)) return null;
  const rn = params.get("rn");
  return { trip, rn: rn && EVENT_ID_PATTERN.test(rn) ? rn : null };
}

export function parseTripLink(search: string): TripLink | null {
  return parseTripParams(new URLSearchParams(search));
}

// For a notification payload's `url`: accepts only a relative path or this
// app's own origin, with path "/" and a valid trip parameter.
export function parseTripUrl(url: unknown, origin: string): TripLink | null {
  if (typeof url !== "string" || url.length > 500) return null;
  try {
    const u = new URL(url, origin);
    if (u.origin !== origin || u.pathname !== "/") return null;
    return parseTripParams(u.searchParams);
  } catch {
    return null;
  }
}

// The target is remembered across sign-in (login ends with a full page load of
// "/", like the existing pendingInvite flow) and expires after a day.
export function stashPendingTripLink(link: TripLink): void {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify({ ...link, at: Date.now() }));
  } catch {
    /* storage blocked: the link simply isn't preserved */
  }
}

export function takePendingTripLink(): TripLink | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    localStorage.removeItem(PENDING_KEY);
    const v = JSON.parse(raw) as { trip?: string; rn?: string | null; at?: number };
    if (!v.at || Date.now() - v.at > PENDING_TTL_MS) return null;
    if (!v.trip || !TRIP_ID.test(v.trip)) return null;
    return { trip: v.trip, rn: v.rn && EVENT_ID_PATTERN.test(v.rn) ? v.rn : null };
  } catch {
    return null;
  }
}

// Removes only the reminder's own parameters from the address bar, leaving any
// other pending parameter (?invite=, ?quickadd=) for the code that owns it.
export function stripTripParams(): void {
  try {
    const u = new URL(window.location.href);
    u.searchParams.delete("trip");
    u.searchParams.delete("rn");
    window.history.replaceState({}, "", u.pathname + (u.search || "") + u.hash);
  } catch {
    /* ignore */
  }
}
