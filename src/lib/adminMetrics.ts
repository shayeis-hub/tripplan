// Product-usage metrics for the admin dashboard, computed from data the app
// already stores. Pure functions: the stats route feeds them the Auth user
// list and the single `trips` collection scan it already performs, so none of
// this causes an extra Firestore read.
//
// Schema facts these definitions rest on (see TripPlan.jsx / useTrips.ts):
//  - trips/{id}.owner is the creator's uid; sharedWith[] holds the e-mails of
//    everyone else with access (invite link, or added by e-mail), and
//    viewOnlyUsers[] the view-only subset.
//  - The new-trip wizard saves an EMPTY trip the moment it opens and then
//    autosaves every keystroke (a single typed letter becomes `destination`).
//    Step 1 can only be passed with a destination AND a valid start/end date,
//    but completing the wizard is not recorded anywhere, so a trip with
//    destination + valid dates is the strongest 'set up on purpose' signal
//    the stored data offers.
//  - Itinerary items live in trips.activities {date: [items]}; flights and
//    hotels are entries of trips.expenses with category "flight" / "hotel".
//  - people[] is the free-text list of travelers used for splitting expenses.
//  - Expenses and activities carry NO author uid and NO timestamp; trips have
//    no createdAt (only updatedAt = last write). That is why joiners are not
//    credited for content/expenses and why 7-day activation is not computed.

import { computeLifecycle, homeToday, type Lifecycle } from "./tripLifecycle";
import { buildTripRow, type TripRow } from "./tripDrilldown";

export interface UserLite {
  uid: string;
  email: string | null;
  created: number; // epoch ms
  lastActive: number | null; // epoch ms, best available signal
}

export interface TripLite {
  id: string;
  owner: string | null;
  sharedWith: string[]; // lower-cased e-mails
  hasDestination: boolean;
  hasValidDates: boolean; // startDate and endDate set, end >= start
  startDate: string | null; // raw date-only strings, used for lifecycle timing
  endDate: string | null;
  peopleCount: number;
  expenseCount: number;
  flightHotelCount: number;
  activityCount: number;
  // Detail used by the admin drill-down / pre-trip preview (no personal data).
  destination: string;
  city: string;
  createdAt: number | null; // only trips made after createdAt shipped have it
  updatedAt: number | null; // last write by a member, join, archive...
  flightCount: number;
  hotelCount: number;
  packingItems: number; // packingList only exists once a user edited it
  packingChecked: number;
}

export interface Pct {
  count: number;
  pct: number; // of all registered users, 0-100, 1 decimal
}

export interface FunnelStage extends Pct {
  key: string;
  fromPrev: number | null; // % of previous stage, null for the first
}

export interface RecentUserUsage {
  ownedTrips: number;
  joinedTrips: number;
  itineraryItems: number; // activities + flights + hotels in owned trips
  expenses: number; // expenses in owned trips
}

export interface ProductMetrics {
  registered: number;
  tripsCreated: number; // real trips (drafts excluded)
  emptyDrafts: number; // owned by a registered user, not set up and no content
  tripCreators: Pct;
  joinedTravelers: Pct;
  groupTrips: { count: number; pct: number }; // pct of real trips
  expenseUsers: Pct;
  funnel: FunnelStage[];
  lifecycle: Lifecycle; // timing of created trips vs today (see tripLifecycle.ts)
  // One row per created trip (the same set the lifecycle numbers count). `owner`
  // is internal only and must be stripped before anything leaves the server.
  tripRows: (TripRow & { owner: string })[];
  perUser: Record<string, RecentUserUsage>;
  creatorUids: string[]; // for acquisition-by-source breakdowns
}

const pct1 = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 1000) / 10 : 0);

export function computeProductMetrics(
  users: UserLite[],
  trips: TripLite[],
  today: string = homeToday(),
  nowMs: number = Date.now(),
): ProductMetrics {
  const N = users.length;
  const uidSet = new Set(users.map(u => u.uid));
  const uidByEmail = new Map<string, string>();
  users.forEach(u => {
    if (u.email) uidByEmail.set(u.email.toLowerCase().trim(), u.uid);
  });

  // A "real" (created) trip belongs to a registered user and shows deliberate
  // setup: destination AND valid dates (the gate for leaving wizard step 1), or
  // any itinerary item / expense. A destination alone is NOT enough, since it
  // exists as soon as someone types one character in the wizard.
  const isDraft = (t: TripLite) =>
    !(t.hasDestination && t.hasValidDates) && t.expenseCount === 0 && t.activityCount === 0;
  const owned = trips.filter(t => t.owner && uidSet.has(t.owner));
  const real = owned.filter(t => !isDraft(t));
  const emptyDrafts = owned.length - real.length;

  const hasContent = (t: TripLite) => t.activityCount > 0 || t.flightHotelCount > 0;
  // Group = at least two travelers listed, or at least one other account has
  // access. (people[] is free text, so this is a conservative lower bound.)
  const isGroup = (t: TripLite) => t.peopleCount >= 2 || t.sharedWith.length >= 1;

  const ownedBy = new Map<string, TripLite[]>();
  real.forEach(t => {
    const arr = ownedBy.get(t.owner!) || [];
    arr.push(t);
    ownedBy.set(t.owner!, arr);
  });

  // Joined = the user's e-mail is in sharedWith of a real trip owned by
  // someone else. Includes people added by e-mail and view-only members, since
  // the data does not record how or when they were added.
  const joinedBy = new Map<string, number>();
  real.forEach(t => {
    const seen = new Set<string>();
    t.sharedWith.forEach(e => {
      const uid = uidByEmail.get(e);
      if (uid && uid !== t.owner && !seen.has(uid)) {
        seen.add(uid);
        joinedBy.set(uid, (joinedBy.get(uid) || 0) + 1);
      }
    });
  });

  const creators = users.filter(u => ownedBy.has(u.uid));
  const joiners = users.filter(u => joinedBy.has(u.uid));
  const expenseUsers = users.filter(u => (ownedBy.get(u.uid) || []).some(t => t.expenseCount > 0));

  // Funnel (nested: each stage is a subset of the one before).
  const s2 = users.filter(u => ownedBy.has(u.uid) || joinedBy.has(u.uid));
  const s3 = s2.filter(u => (ownedBy.get(u.uid) || []).some(hasContent));
  const s4 = s3.filter(u => (ownedBy.get(u.uid) || []).some(isGroup));
  const s5 = s4.filter(u => (ownedBy.get(u.uid) || []).some(t => t.expenseCount > 0));
  const counts: [string, number][] = [
    ["registered", N],
    ["trip", s2.length],
    ["content", s3.length],
    ["participant", s4.length],
    ["expense", s5.length],
  ];
  const funnel: FunnelStage[] = counts.map(([key, count], i) => ({
    key,
    count,
    pct: pct1(count, N),
    fromPrev: i === 0 ? null : pct1(count, counts[i - 1][1]),
  }));

  const perUser: Record<string, RecentUserUsage> = {};
  users.forEach(u => {
    const mine = ownedBy.get(u.uid) || [];
    perUser[u.uid] = {
      ownedTrips: mine.length,
      joinedTrips: joinedBy.get(u.uid) || 0,
      itineraryItems: mine.reduce((s, t) => s + t.activityCount + t.flightHotelCount, 0),
      expenses: mine.reduce((s, t) => s + t.expenseCount, 0),
    };
  });

  const groupCount = real.filter(isGroup).length;
  return {
    registered: N,
    tripsCreated: real.length,
    emptyDrafts,
    tripCreators: { count: creators.length, pct: pct1(creators.length, N) },
    joinedTravelers: { count: joiners.length, pct: pct1(joiners.length, N) },
    groupTrips: { count: groupCount, pct: pct1(groupCount, real.length) },
    expenseUsers: { count: expenseUsers.length, pct: pct1(expenseUsers.length, N) },
    funnel,
    // Same created-trip set and same meaningful-content test as the rest of the
    // dashboard; no additional data is read for this.
    lifecycle: computeLifecycle(
      real.map(t => ({ startDate: t.startDate, endDate: t.endDate, hasContent: hasContent(t) })),
      today,
    ),
    tripRows: real.map(t => ({ ...buildTripRow(t, today, nowMs), owner: t.owner! })),
    perUser,
    creatorUids: creators.map(u => u.uid),
  };
}

// Reduce a raw trip document to the few numbers the metrics need.
export function toTripLite(id: string, data: Record<string, unknown>): TripLite {
  const expenses: { category?: string }[] = Array.isArray(data.expenses) ? data.expenses : [];
  const acts: Record<string, unknown> =
    data.activities && typeof data.activities === "object" ? (data.activities as Record<string, unknown>) : {};
  let activityCount = 0;
  for (const k of Object.keys(acts)) {
    if (Array.isArray(acts[k])) activityCount += acts[k].length;
  }
  return {
    id,
    owner: typeof data.owner === "string" ? data.owner : null,
    sharedWith: (Array.isArray(data.sharedWith) ? (data.sharedWith as unknown[]) : [])
      .filter((e): e is string => typeof e === "string")
      .map(e => e.toLowerCase().trim()),
    hasDestination: typeof data.destination === "string" && data.destination.trim() !== "",
    hasValidDates:
      typeof data.startDate === "string" && typeof data.endDate === "string" &&
      data.startDate !== "" && data.endDate !== "" && data.endDate >= data.startDate,
    startDate: typeof data.startDate === "string" ? data.startDate : null,
    endDate: typeof data.endDate === "string" ? data.endDate : null,
    peopleCount: Array.isArray(data.people) ? data.people.length : 0,
    expenseCount: expenses.length,
    flightHotelCount: expenses.filter(e => e && (e.category === "flight" || e.category === "hotel")).length,
    activityCount,
    destination: typeof data.destination === "string" ? data.destination.trim().slice(0, 80) : "",
    city: typeof data.city === "string" ? data.city.trim().slice(0, 80) : "",
    createdAt: typeof data.createdAt === "number" ? data.createdAt : null,
    updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : null,
    flightCount: expenses.filter(e => e && e.category === "flight").length,
    hotelCount: expenses.filter(e => e && e.category === "hotel").length,
    packingItems: Array.isArray(data.packingList) ? data.packingList.length : 0,
    packingChecked: Array.isArray(data.packingList)
      ? (data.packingList as { checked?: boolean }[]).filter(i => i && i.checked).length
      : 0,
  };
}
