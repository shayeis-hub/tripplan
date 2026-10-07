// 7-day pre-trip reminder: eligibility, event state machine, message selection
// and measurement helpers. PURE LOGIC ONLY: nothing here talks to Firestore or
// a push provider. The same functions drive both the admin preview and the
// (not yet scheduled) sender in pre7Reminder.ts, so what the dashboard shows is
// exactly what the sender would decide.
//
// Date semantics: a trip date is a calendar date, not an instant. "Seven days
// away" means startDate is exactly today + 7 calendar days, with "today" taken
// in Asia/Jerusalem (the product's home zone and the zone push-cron already
// uses for the outbound leg). The reminder goes out during the daytime of that
// local date (SEND_FROM_HOUR..SEND_UNTIL_HOUR), never at a fixed UTC time, so
// it cannot land on the wrong calendar day.

import { HOME_TZ, classifyTripPhase, dateIssue, dayNumber } from "./tripLifecycle";

export type NotifLang = "he" | "en" | "es";

export const REMINDER_DAYS = 7;
export const SEND_FROM_HOUR = 10; // local (Asia/Jerusalem), inclusive
export const SEND_UNTIL_HOUR = 20; // local, exclusive: catch-up window if a tick is missed

export type NotificationType = "pre7";

// One document per (trip, reminder type): the id IS the idempotency key.
export const notificationEventId = (tripId: string, type: NotificationType = "pre7") => `${tripId}_${type}`;
export const EVENT_ID_PATTERN = /^[A-Za-z0-9_-]{1,200}_pre7$/;

// ---------- event state machine ----------
//
//   (none) --reserve--> reserved --provider accepted--> sent
//                          |
//                          +--all channels errored--> failed --retry--> reserved ...
//
// reserved is written atomically BEFORE any send (create() fails if the doc
// exists), so two overlapping executions can never both send. Rules:
//  - sent: final. Never sent again.
//  - failed: retried only if it is not a permanent error (dead token), fewer
//    than MAX_ATTEMPTS attempts were made, RETRY_DELAY_MS has passed, and the
//    trip is still exactly 7 days away inside the send window (so retries stop
//    by themselves at the end of the reminder day). "failed" means every
//    channel returned an error, i.e. nothing was accepted, so a retry cannot
//    double-send.
//  - reserved and recent: another execution is sending; wait.
//  - reserved and stale (older than STALE_RESERVATION_MS): the outcome is
//    UNKNOWN (the run may have crashed after the provider accepted). It is NOT
//    retried automatically, since that could send twice; it is surfaced in the
//    admin preview for a human to look at.
export type EventStatus = "reserved" | "sent" | "failed";
export const MAX_ATTEMPTS = 3;
export const RETRY_DELAY_MS = 30 * 60 * 1000;
export const STALE_RESERVATION_MS = 15 * 60 * 1000;

// Stored in notificationEvents/{tripId}_pre7 (Admin SDK only). Measures
// behaviour AFTER a reminder; it does not establish causality.
export interface NotificationEvent {
  type: NotificationType;
  tripId: string;
  userId: string; // owner; used to authorize "opened" and to delete on account removal
  status: EventStatus;
  reservedAt: number;
  sentAt: number | null;
  failedAt: number | null;
  attemptCount: number;
  lang: NotifLang; // language the text was actually sent in ("he" or "en")
  variant: Pre7Variant;
  channels: { fcm: boolean; web: boolean }; // channels attempted
  accepted: { fcm: boolean; web: boolean }; // channels whose provider accepted the message
  hadContentAtSend: boolean;
  activitiesAtSend: number;
  openedAt: number | null; // written once, by /api/notification-open
  lastError: string | null; // short error code only, never a token or message text
  permanent: boolean; // failure that retrying cannot fix (e.g. unregistered token)
  followUp?: { h24?: FollowUp; h48?: FollowUp };
}

export type EventSummary = Pick<
  NotificationEvent,
  "status" | "attemptCount" | "reservedAt" | "sentAt" | "failedAt" | "openedAt" | "permanent" | "lastError"
>;

export type EventAction = "reserve" | "retry" | "none";
export type EventBlock = "sent" | "in_flight" | "stale_reserved" | "failed_retry_wait" | "failed_final";

export function eventDecision(
  ev: EventSummary | null,
  nowMs: number,
): { action: EventAction; block: EventBlock | null } {
  if (!ev) return { action: "reserve", block: null };
  if (ev.status === "sent") return { action: "none", block: "sent" };
  if (ev.status === "reserved") {
    return { action: "none", block: nowMs - ev.reservedAt < STALE_RESERVATION_MS ? "in_flight" : "stale_reserved" };
  }
  // failed
  if (ev.permanent || ev.attemptCount >= MAX_ATTEMPTS) return { action: "none", block: "failed_final" };
  if (nowMs - (ev.failedAt ?? 0) < RETRY_DELAY_MS) return { action: "none", block: "failed_retry_wait" };
  return { action: "retry", block: null };
}

export interface FollowUp {
  at: number; // when this snapshot was taken
  returned: boolean; // the owner's last app activity is after sentAt
  hasContent: boolean; // trip has meaningful content at snapshot time
  gainedContent: boolean; // !hadContentAtSend && hasContent
}

// Snapshot taken by a (future) settle step at about sentAt + 24h / + 48h.
export function evaluateFollowUp(
  ev: Pick<NotificationEvent, "sentAt" | "hadContentAtSend">,
  windowHours: 24 | 48,
  nowMs: number,
  lastActiveMs: number | null,
  hasContentNow: boolean,
): FollowUp | null {
  if (ev.sentAt == null || nowMs < ev.sentAt + windowHours * 3600000) return null;
  return {
    at: nowMs,
    returned: lastActiveMs != null && lastActiveMs > ev.sentAt,
    hasContent: hasContentNow,
    gainedContent: !ev.hadContentAtSend && hasContentNow,
  };
}

// ---------- eligibility ----------

// Which stored token(s) exist. Only Android (FCM) and web push are supported in
// this first experiment; iOS has no working channel and therefore "none".
export type PushChannel = "fcm" | "web" | "both" | "none";

export interface ReminderTrip {
  startDate: string | null;
  endDate: string | null;
  isCreated: boolean; // meets the dashboard's "created trip" definition
  archived?: boolean;
  hasContent: boolean; // itinerary item, flight or hotel (existing definition)
  activityCount: number;
  destination: string;
  city: string;
}

export type EligibilityReason =
  | "eligible"
  | "not_created"
  | "archived"
  | "invalid_dates"
  | "past"
  | "in_progress"
  | "too_early" // more than 7 days away
  | "too_late" // 1-6 days away: the 7-day moment has passed
  | "already_sent"
  | "in_flight"
  | "stale_reserved"
  | "failed_retry_wait"
  | "failed_final"
  | "no_supported_channel"
  | "language_not_synced"; // no explicitly stored language: never guess (a Hebrew user must not get English)

export interface Eligibility {
  eligible: boolean;
  reason: EligibilityReason;
  action: EventAction; // what the sender would do right now (ignoring the clock window)
  daysToStart: number | null;
}

export interface EligibilityContext {
  channel: PushChannel;
  storedLang?: unknown; // pushSubscriptions.lang as stored; must be he / en / es to be eligible
  event: EventSummary | null;
  nowMs: number;
}

export function evaluatePre7(trip: ReminderTrip, today: string, ctx: EligibilityContext): Eligibility {
  const out = (reason: EligibilityReason, action: EventAction, daysToStart: number | null): Eligibility => ({
    eligible: reason === "eligible",
    reason,
    action,
    daysToStart,
  });
  if (!trip.isCreated) return out("not_created", "none", null);
  if (trip.archived) return out("archived", "none", null);
  if (dateIssue(trip.startDate, trip.endDate) != null) return out("invalid_dates", "none", null);
  const phase = classifyTripPhase(trip.startDate, trip.endDate, today);
  const days = dayNumber(trip.startDate)! - dayNumber(today)!;
  if (phase === "past") return out("past", "none", days);
  if (phase === "now") return out("in_progress", "none", days);
  if (days > REMINDER_DAYS) return out("too_early", "none", days);
  if (days < REMINDER_DAYS) return out("too_late", "none", days);
  const d = eventDecision(ctx.event, ctx.nowMs);
  if (d.block) {
    const map: Record<EventBlock, EligibilityReason> = {
      sent: "already_sent",
      in_flight: "in_flight",
      stale_reserved: "stale_reserved",
      failed_retry_wait: "failed_retry_wait",
      failed_final: "failed_final",
    };
    return out(map[d.block], "none", days);
  }
  if (ctx.channel === "none") return out("no_supported_channel", "none", days);
  if (resolveNotifLang(ctx.storedLang) === null) return out("language_not_synced", "none", days);
  return out("eligible", d.action, days);
}

// Whether "now" falls in the daytime send window on the local calendar day.
export function isSendWindow(now: Date): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: HOME_TZ, hour: "2-digit", hourCycle: "h23" }).format(now),
  );
  return hour >= SEND_FROM_HOUR && hour < SEND_UNTIL_HOUR;
}

// ---------- message selection ----------

const MAX_PLACE_CHARS = 40;

// City if known, otherwise the first segment of the destination
// ("Paris, France" -> "Paris"). No names, e-mails, amounts or booking details
// are ever used, only the place.
// The destination is free text typed by the user, so it can carry emoji or
// other pictographs ("ירח דבש 🌙"). Notifications never contain emoji, so they
// are stripped here (including flags, skin tones, joiners and variation
// selectors); if nothing is left the generic "your trip" wording is used.
const PICTOGRAPHS = /[\p{Extended_Pictographic}\p{Emoji_Modifier}\u{1F1E6}-\u{1F1FF}\u200D\uFE0E\uFE0F\u20E3]/gu;
const stripPictographs = (s: string) => s.replace(PICTOGRAPHS, "").replace(/\s+/g, " ").trim();

export function destinationLabel(trip: Pick<ReminderTrip, "city" | "destination">): string {
  for (const raw of [trip.city, trip.destination]) {
    const first = stripPictographs(((raw || "").split(",")[0] || "").trim());
    if (first) return first.length > MAX_PLACE_CHARS ? first.slice(0, MAX_PLACE_CHARS).trim() : first;
  }
  return "";
}

export type Pre7Variant = "A" | "B" | "C";

export function pre7Variant(trip: Pick<ReminderTrip, "hasContent" | "activityCount">): Pre7Variant {
  if (trip.activityCount > 0) return "C"; // has itinerary content
  if (trip.hasContent) return "B"; // flight/hotel but no itinerary activities
  return "A"; // no meaningful content
}

// Hebrew attaches "ל" to the place; a Latin-script name takes a hyphen
// ("ל-Paris") so it reads correctly.
const heTo = (place: string) => (/^[A-Za-z]/.test(place) ? `ל-${place}` : `ל${place}`);

export interface PushText {
  title: string;
  body: string;
  variant: Pre7Variant;
}

// Wording avoids assuming a grammatical gender for the place: Hebrew variant C
// says "הטיול ל{place} מתקרב" (the trip is getting close) instead of putting the
// place name itself as the subject of a feminine verb. If the place is unknown
// the text falls back to "the trip" rather than leaving a hole.
export function buildPre7Message(
  trip: Pick<ReminderTrip, "hasContent" | "activityCount" | "city" | "destination">,
  lang: NotifLang,
): PushText {
  const variant = pre7Variant(trip);
  const place = destinationLabel(trip);
  if (lang === "he") {
    const until = place ? `עוד שבוע יוצאים ${heTo(place)}` : "עוד שבוע יוצאים לטיול";
    if (variant === "A") return { variant, title: until, body: "הטיול מתקרב. זה זמן טוב להתחיל לרכז את התכנון ב-TUlon." };
    if (variant === "B")
      return { variant, title: until, body: "כבר התחלתם לתכנן. זה זמן טוב לעבור על המסלול ולהוסיף את מה שלא רוצים לפספס." };
    return {
      variant,
      title: place ? `הטיול ${heTo(place)} מתקרב` : "הטיול שלכם מתקרב",
      body: "עוד שבוע יוצאים. המסלול שלכם כבר מחכה לכם ב-TUlon.",
    };
  }
  const until = place ? `One week until ${place}` : "One week until your trip";
  if (variant === "A") return { variant, title: until, body: "Your trip is getting close. A good time to start bringing the plan together in TUlon." };
  if (variant === "B")
    return {
      variant,
      title: until,
      body: "You've already started planning. This is a good time to review the itinerary and add anything you don't want to miss.",
    };
  return {
    variant,
    title: place ? `Your trip to ${place} is getting close` : "Your trip is getting close",
    body: "One week to go. Your itinerary is waiting for you in TUlon.",
  };
}

// Language persisted from the app's own `tulon_lang` setting (see
// push-subscribe). he -> Hebrew, en -> English, es -> English for now (no
// approved Spanish copy yet). A missing or unknown value returns null and makes
// the trip INELIGIBLE ("language_not_synced"): existing users may not have
// opened the version that syncs their language yet, and falling back to English
// could send an English notification to a Hebrew user.
export function resolveNotifLang(stored: unknown): "he" | "en" | null {
  if (stored === "he") return "he";
  if (stored === "en" || stored === "es") return "en";
  return null;
}
export const isStoredLang = (v: unknown): v is NotifLang => v === "he" || v === "en" || v === "es";

// ---------- deep link ----------

// The planner at "/" has no URL for a specific trip, so one parameter pair is
// added next to the existing "?invite=" / "?quickadd=":
//   /?trip=<tripId>&rn=<notificationEventId>
// `trip` only selects among trips the signed-in user can already read (Firestore
// rules decide that; knowing an id grants nothing). `rn` lets the server record
// the first open, after checking the event belongs to the signed-in user.
export function reminderDeepLink(tripId: string, eventId: string): string {
  return `/?trip=${encodeURIComponent(tripId)}&rn=${encodeURIComponent(eventId)}`;
}

// ---------- admin preview ----------

export interface ReminderPreview {
  eligible: boolean;
  reason: EligibilityReason;
  action: EventAction;
  daysToStart: number | null;
  channel: PushChannel;
  lang: "he" | "en" | null; // null = not synced: ineligible, no text is chosen
  langStored: boolean;
  variant: Pre7Variant;
  // The text that WOULD be sent in the resolved language, plus both languages
  // for review. Preview only: nothing is ever sent from here.
  title: string;
  body: string;
  titleEn: string;
  bodyEn: string;
  titleHe: string;
  bodyHe: string;
  sendDate: string | null; // the local calendar day the reminder is due (start - 7)
  sendWindow: string; // local hours the reminder may go out
  deepLink: string;
  event: EventSummary | null; // existing event doc, if any
}

const toDateStr = (dayNum: number) => new Date(dayNum * 86400000).toISOString().slice(0, 10);

export function buildReminderPreview(
  trip: ReminderTrip & { id: string },
  today: string,
  ctx: EligibilityContext & { storedLang?: unknown },
): ReminderPreview {
  const ev = evaluatePre7(trip, today, ctx);
  const lang = resolveNotifLang(ctx.storedLang);
  const he = buildPre7Message(trip, "he");
  const en = buildPre7Message(trip, "en");
  const chosen = lang === "he" ? he : lang === "en" ? en : null; // both languages stay visible in the preview
  const start = dayNumber(trip.startDate);
  return {
    eligible: ev.eligible,
    reason: ev.reason,
    action: ev.action,
    daysToStart: ev.daysToStart,
    channel: ctx.channel,
    lang,
    langStored: isStoredLang(ctx.storedLang),
    variant: he.variant,
    title: chosen ? chosen.title : "",
    body: chosen ? chosen.body : "",
    titleHe: he.title,
    bodyHe: he.body,
    titleEn: en.title,
    bodyEn: en.body,
    sendDate: start == null ? null : toDateStr(start - REMINDER_DAYS),
    sendWindow: `${SEND_FROM_HOUR}:00-${SEND_UNTIL_HOUR}:00`,
    deepLink: reminderDeepLink(trip.id, notificationEventId(trip.id)),
    event: ctx.event,
  };
}
