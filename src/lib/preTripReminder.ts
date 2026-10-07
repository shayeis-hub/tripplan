// 7-day pre-trip reminder: eligibility, message selection and measurement
// helpers. PURE LOGIC ONLY. Nothing in this file (or anywhere in the project
// yet) sends a notification, writes an event, or runs on a schedule; the admin
// dashboard only uses it to PREVIEW what would be sent.
//
// Date semantics: a trip date is a calendar date, not an instant. "Seven days
// away" means startDate is exactly today + 7 calendar days, with "today" taken
// in Asia/Jerusalem (the product's home zone and the zone push-cron already
// uses for the outbound leg). The reminder is meant to go out during the
// daytime of that local date (SEND_FROM_HOUR..SEND_UNTIL_HOUR), never at a
// fixed UTC time, so it cannot land on the wrong calendar day.

import { HOME_TZ, classifyTripPhase, dateIssue, dayNumber } from "./tripLifecycle";

export type NotifLang = "he" | "en" | "es";

export const REMINDER_DAYS = 7;
export const SEND_FROM_HOUR = 10; // local (Asia/Jerusalem), inclusive
export const SEND_UNTIL_HOUR = 20; // local, exclusive: catch-up window if a tick is missed

export type NotificationType = "pre7";

// One document per (trip, reminder type): the id IS the idempotency key.
// Created atomically BEFORE sending (create() fails if it already exists), so
// overlapping cron runs or retries cannot send twice.
export const notificationEventId = (tripId: string, type: NotificationType = "pre7") => `${tripId}_${type}`;

// Minimal event record (written by the future sender, read by the dashboard).
// Measures behaviour AFTER a reminder; it does not establish causality.
export interface NotificationEvent {
  type: NotificationType;
  tripId: string;
  userId: string; // owner; lets account deletion find and remove the events
  sentAt: number; // epoch ms
  lang: NotifLang;
  variant: "A" | "B" | "C";
  channels: { fcm: boolean; web: boolean }; // which channels were attempted
  delivered: boolean; // at least one provider accepted the message
  hadContentAtSend: boolean; // trip state when sent, for the "gained content" question
  activitiesAtSend: number;
  followUp?: {
    h24?: FollowUp;
    h48?: FollowUp;
  };
  openedAt?: number; // set only if a click is technically measurable (see deep link notes)
}

export interface FollowUp {
  at: number; // when this snapshot was taken
  returned: boolean; // the owner's last app activity is after sentAt
  hasContent: boolean; // trip has meaningful content at snapshot time
  gainedContent: boolean; // !hadContentAtSend && hasContent
}

// Snapshot taken by a (future) settle step at about sentAt + 24h / + 48h.
// Returns null while the window has not elapsed yet.
export function evaluateFollowUp(
  ev: Pick<NotificationEvent, "sentAt" | "hadContentAtSend">,
  windowHours: 24 | 48,
  nowMs: number,
  lastActiveMs: number | null,
  hasContentNow: boolean,
): FollowUp | null {
  if (nowMs < ev.sentAt + windowHours * 3600000) return null;
  return {
    at: nowMs,
    returned: lastActiveMs != null && lastActiveMs > ev.sentAt,
    hasContent: hasContentNow,
    gainedContent: !ev.hadContentAtSend && hasContentNow,
  };
}

// ---------- eligibility ----------

export interface ReminderTrip {
  startDate: string | null;
  endDate: string | null;
  isCreated: boolean; // meets the dashboard's "created trip" definition
  hasContent: boolean; // itinerary item, flight or hotel (existing definition)
  activityCount: number;
  destination: string;
  city: string;
}

export type EligibilityReason =
  | "eligible"
  | "not_created"
  | "invalid_dates"
  | "past"
  | "in_progress"
  | "too_early" // more than 7 days away
  | "too_late" // 1-6 days away: the 7-day moment has passed
  | "already_sent"
  | "no_token";

export interface Eligibility {
  eligible: boolean;
  reason: EligibilityReason;
  daysToStart: number | null;
}

export function evaluatePre7(
  trip: ReminderTrip,
  today: string,
  opts: { hasToken: boolean; alreadySent: boolean },
): Eligibility {
  const base = (reason: EligibilityReason, daysToStart: number | null): Eligibility => ({
    eligible: reason === "eligible",
    reason,
    daysToStart,
  });
  if (!trip.isCreated) return base("not_created", null);
  if (dateIssue(trip.startDate, trip.endDate) != null) return base("invalid_dates", null);
  const phase = classifyTripPhase(trip.startDate, trip.endDate, today);
  const days = dayNumber(trip.startDate)! - dayNumber(today)!;
  if (phase === "past") return base("past", days);
  if (phase === "now") return base("in_progress", days);
  if (days > REMINDER_DAYS) return base("too_early", days);
  if (days < REMINDER_DAYS) return base("too_late", days);
  if (opts.alreadySent) return base("already_sent", days);
  if (!opts.hasToken) return base("no_token", days);
  return base("eligible", days);
}

// Whether "now" falls in the daytime send window on the local calendar day.
export function isSendWindow(now: Date): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: HOME_TZ, hour: "2-digit", hourCycle: "h23" }).format(now),
  );
  return hour >= SEND_FROM_HOUR && hour < SEND_UNTIL_HOUR;
}

// ---------- message selection ----------

// City if known, otherwise the first segment of the destination
// ("Paris, France" -> "Paris"). No names, e-mails, amounts or booking details
// are ever used, only the place.
export function destinationLabel(trip: Pick<ReminderTrip, "city" | "destination">): string {
  const raw = (trip.city || trip.destination || "").trim();
  return (raw.split(",")[0] || "").trim();
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

// Spanish copy has not been written or approved, so Spanish users get the
// English text rather than an unreviewed translation.
export function buildPre7Message(
  trip: Pick<ReminderTrip, "hasContent" | "activityCount" | "city" | "destination">,
  lang: NotifLang,
): PushText {
  const variant = pre7Variant(trip);
  const place = destinationLabel(trip);
  if (lang === "he") {
    if (variant === "A")
      return {
        variant,
        title: `עוד שבוע יוצאים ${heTo(place)}`,
        body: "הטיול מתקרב. זה זמן טוב להתחיל לרכז את התכנון ב-TUlon.",
      };
    if (variant === "B")
      return {
        variant,
        title: `עוד שבוע יוצאים ${heTo(place)}`,
        body: "כבר התחלתם לתכנן. זה זמן טוב לעבור על המסלול ולהוסיף את מה שלא רוצים לפספס.",
      };
    return {
      variant,
      title: `${place} מתקרבת`,
      body: "עוד שבוע יוצאים. המסלול שלכם כבר מחכה לכם ב-TUlon.",
    };
  }
  if (variant === "A")
    return {
      variant,
      title: `One week until ${place}`,
      body: "Your trip is getting close. A good time to start bringing the plan together in TUlon.",
    };
  if (variant === "B")
    return {
      variant,
      title: `One week until ${place}`,
      body: "You've already started planning. This is a good time to review the itinerary and add anything you don't want to miss.",
    };
  return {
    variant,
    title: `${place} is getting close`,
    body: "One week to go. Your itinerary is waiting for you in TUlon.",
  };
}

// Language is not stored server-side today (it lives in the browser's
// localStorage "tulon_lang"), so until a stored value exists the reminder
// defaults to Hebrew, the app's own default.
export const DEFAULT_NOTIF_LANG: NotifLang = "he";
export const notifLangOrDefault = (stored: unknown): NotifLang =>
  stored === "he" || stored === "en" || stored === "es" ? stored : DEFAULT_NOTIF_LANG;

// ---------- deep link ----------

// There is NO existing URL that opens a specific trip (the planner at "/"
// selects trips through in-memory state; "/trip/<shareId>" is the public
// import view). The planned route reuses the pattern of the existing
// "?invite=" and "?quickadd=" parameters and needs a small client handler
// added before activation:
//   /?trip=<tripId>   (+ &rn=<eventId> so an open can be attributed)
export function reminderDeepLink(tripId: string, eventId: string): string {
  return `/?trip=${encodeURIComponent(tripId)}&rn=${encodeURIComponent(eventId)}`;
}

// ---------- admin preview ----------

export type PushChannel = "fcm" | "web" | "both" | "none";

export interface ReminderPreview {
  eligible: boolean;
  reason: EligibilityReason;
  daysToStart: number | null;
  channel: PushChannel; // which stored token(s) exist (never the token itself)
  alreadySent: boolean;
  lang: NotifLang;
  langStored: boolean; // false today: language is not stored server-side
  variant: Pre7Variant;
  // The text that WOULD be sent in the resolved language, plus the other
  // language's text for review. Preview only: nothing is ever sent from here.
  title: string;
  body: string;
  titleEn: string;
  bodyEn: string;
  titleHe: string;
  bodyHe: string;
  sendDate: string | null; // the local calendar day the reminder is due (start - 7)
  deepLink: string;
}

const toDateStr = (dayNum: number) => new Date(dayNum * 86400000).toISOString().slice(0, 10);

export function buildReminderPreview(
  trip: ReminderTrip & { id: string },
  today: string,
  opts: { channel: PushChannel; alreadySent: boolean; storedLang?: unknown },
): ReminderPreview {
  const ev = evaluatePre7(trip, today, { hasToken: opts.channel !== "none", alreadySent: opts.alreadySent });
  const lang = notifLangOrDefault(opts.storedLang);
  const he = buildPre7Message(trip, "he");
  const en = buildPre7Message(trip, "en");
  const chosen = lang === "he" ? he : en;
  const start = dayNumber(trip.startDate);
  return {
    eligible: ev.eligible,
    reason: ev.reason,
    daysToStart: ev.daysToStart,
    channel: opts.channel,
    alreadySent: opts.alreadySent,
    lang,
    langStored: opts.storedLang === "he" || opts.storedLang === "en" || opts.storedLang === "es",
    variant: chosen.variant,
    title: chosen.title,
    body: chosen.body,
    titleHe: he.title,
    bodyHe: he.body,
    titleEn: en.title,
    bodyEn: en.body,
    sendDate: start == null ? null : toDateStr(start - REMINDER_DAYS),
    deepLink: reminderDeepLink(trip.id, notificationEventId(trip.id)),
  };
}
