// What counts as "meaningful trip content" for activation tracking.
//
// Deliberately narrow and explicit: an itinerary item (trips.activities), or a
// flight / hotel entry (stored as an expense with category "flight"/"hotel").
// NOT content: destination, dates, budget, currencies, people, preferences,
// packing list, or expenses of any other category. Those are either part of
// the creation wizard (which autosaves as the user types) or are money
// tracking rather than trip planning.
export function hasMeaningfulContent(trip: Record<string, unknown> | undefined): boolean {
  if (!trip) return false;
  const acts = trip.activities;
  if (acts && typeof acts === "object") {
    for (const k of Object.keys(acts as Record<string, unknown>)) {
      const v = (acts as Record<string, unknown>)[k];
      if (Array.isArray(v) && v.length > 0) return true;
    }
  }
  const expenses = Array.isArray(trip.expenses) ? (trip.expenses as { category?: string }[]) : [];
  return expenses.some(e => e && (e.category === "flight" || e.category === "hotel"));
}
