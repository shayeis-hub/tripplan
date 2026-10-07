// Sender for the 7-day pre-trip reminder. SERVER-SIDE LOGIC, NOT SCHEDULED:
// nothing in the project calls runPre7Reminders yet (no cron entry, no route),
// so no notification can be sent from this code until it is wired in on
// purpose. It is written against small interfaces (Pre7Db, Pre7Senders) so the
// whole flow, including races and failures, is unit-tested with in-memory fakes;
// the Firestore / provider adapters live in pre7Adapters.ts.
//
// Safety properties:
//  - Only trips whose startDate equals today+7 (Asia/Jerusalem) are read, via a
//    single targeted equality query: no collection scan.
//  - Sends only inside the 10:00-20:00 local window, so calling it every ten
//    minutes (as push-cron does) is fine: everything after the first success
//    is a no-op thanks to the event state machine.
//  - The event is reserved atomically BEFORE sending. A failed send is recorded
//    as failed (not sent) and retried under the conservative rules in
//    preTripReminder.ts; an unknown outcome (stale reservation) is never retried.
import { isCreatedTrip, toTripLite } from "./adminMetrics";
import {
  buildPre7Message,
  evaluatePre7,
  isSendWindow,
  notificationEventId,
  reminderDeepLink,
  resolveNotifLang,
  REMINDER_DAYS,
  type EventSummary,
  type NotificationEvent,
  type PushChannel,
} from "./preTripReminder";
import { dayNumber, homeToday } from "./tripLifecycle";

export interface StoredSubscription {
  fcmToken?: string;
  subscription?: unknown;
  lang?: unknown;
}

export interface Pre7Db {
  // The single targeted query: trips whose startDate equals `startDate`.
  tripsStartingOn(startDate: string): Promise<{ id: string; data: Record<string, unknown> }[]>;
  subscriptions(uids: string[]): Promise<Map<string, StoredSubscription>>;
  events(ids: string[]): Promise<Map<string, NotificationEvent>>;
  // Atomic create. Returns false if the event already exists (lost the race).
  reserve(id: string, event: NotificationEvent): Promise<boolean>;
  // Atomic failed -> reserved for a retry; false if another run got there first.
  reacquire(id: string, expectedAttempt: number, nowMs: number): Promise<boolean>;
  finish(id: string, patch: Partial<NotificationEvent>): Promise<void>;
}

export interface SendMessage {
  title: string;
  body: string;
  url: string;
}

export interface Pre7Senders {
  fcm(token: string, msg: SendMessage): Promise<void>;
  web(subscription: unknown, msg: SendMessage): Promise<void>;
}

export interface Pre7Deps {
  db: Pre7Db;
  senders: Pre7Senders;
  now: () => number;
}

export type Outcome =
  | "would_send"
  | "sent"
  | "failed"
  | "lost_race"
  | `skipped_${string}`;

export interface Pre7Result {
  tripId: string;
  outcome: Outcome;
}

export interface Pre7Summary {
  ran: boolean;
  skipped?: "outside_window";
  targetDate: string | null;
  candidates: number;
  results: Pre7Result[];
}

// A provider error that retrying cannot fix: a dead token / expired
// subscription.
export function isPermanentSendError(err: unknown): boolean {
  const e = err as { code?: string; statusCode?: number } | null;
  if (!e) return false;
  if (e.statusCode === 404 || e.statusCode === 410) return true; // web-push: subscription gone
  return (
    e.code === "messaging/registration-token-not-registered" ||
    e.code === "messaging/invalid-registration-token" ||
    e.code === "messaging/invalid-argument"
  );
}

const errCode = (err: unknown): string => {
  const e = err as { code?: string; statusCode?: number } | null;
  return String(e?.code ?? (e?.statusCode != null ? `http_${e.statusCode}` : "send_error")).slice(0, 80);
};

const addDays = (date: string, n: number): string => {
  const d = dayNumber(date)!;
  return new Date((d + n) * 86400000).toISOString().slice(0, 10);
};

export async function runPre7Reminders(deps: Pre7Deps, opts: { dryRun: boolean }): Promise<Pre7Summary> {
  const nowMs = deps.now();
  if (!isSendWindow(new Date(nowMs))) {
    return { ran: false, skipped: "outside_window", targetDate: null, candidates: 0, results: [] };
  }
  const today = homeToday(new Date(nowMs));
  const target = addDays(today, REMINDER_DAYS);
  const docs = await deps.db.tripsStartingOn(target);
  const summary: Pre7Summary = { ran: true, targetDate: target, candidates: docs.length, results: [] };
  if (docs.length === 0) return summary;

  const lites = docs.map(d => ({ id: d.id, lite: toTripLite(d.id, d.data) }));
  const owners = [...new Set(lites.map(l => l.lite.owner).filter((o): o is string => !!o))];
  const subs = await deps.db.subscriptions(owners);
  const evs = await deps.db.events(lites.map(l => notificationEventId(l.id)));

  for (const { id, lite } of lites) {
    const push = (outcome: Outcome) => summary.results.push({ tripId: id, outcome });
    const owner = lite.owner;
    if (!owner) { push("skipped_no_owner"); continue; }
    const sub = subs.get(owner) ?? {};
    const fcm = !!sub.fcmToken;
    const web = !!sub.subscription;
    const channel: PushChannel = fcm && web ? "both" : fcm ? "fcm" : web ? "web" : "none";
    const eventId = notificationEventId(id);
    const existing = evs.get(eventId) ?? null;
    const summaryOf = (e: NotificationEvent | null): EventSummary | null =>
      e && {
        status: e.status, attemptCount: e.attemptCount, reservedAt: e.reservedAt, sentAt: e.sentAt,
        failedAt: e.failedAt, openedAt: e.openedAt, permanent: e.permanent, lastError: e.lastError,
      };

    const reminderTrip = {
      startDate: lite.startDate,
      endDate: lite.endDate,
      isCreated: isCreatedTrip(lite),
      archived: lite.archived,
      hasContent: lite.activityCount > 0 || lite.flightHotelCount > 0,
      activityCount: lite.activityCount,
      destination: lite.destination,
      city: lite.city,
    };
    const plan = evaluatePre7(reminderTrip, today, { channel, event: summaryOf(existing), nowMs, storedLang: sub.lang });
    if (!plan.eligible) { push(`skipped_${plan.reason}`); continue; }
    if (opts.dryRun) { push("would_send"); continue; }

    // ---- reserve atomically; only the winner of the race sends ----
    const lang = resolveNotifLang(sub.lang)!; // eligibility already guarantees a synced language
    const msg = buildPre7Message(reminderTrip, lang);
    if (plan.action === "reserve") {
      const event: NotificationEvent = {
        type: "pre7", tripId: id, userId: owner, status: "reserved",
        reservedAt: nowMs, sentAt: null, failedAt: null, attemptCount: 1,
        lang, variant: msg.variant, channels: { fcm, web }, accepted: { fcm: false, web: false },
        hadContentAtSend: reminderTrip.hasContent, activitiesAtSend: reminderTrip.activityCount,
        openedAt: null, lastError: null, permanent: false,
      };
      if (!(await deps.db.reserve(eventId, event))) { push("lost_race"); continue; }
    } else {
      // retry of a failed attempt
      if (!(await deps.db.reacquire(eventId, existing!.attemptCount, nowMs))) { push("lost_race"); continue; }
    }

    // ---- send on every available channel; nothing here may throw out ----
    const message: SendMessage = { title: msg.title, body: msg.body, url: reminderDeepLink(id, eventId) };
    const accepted = { fcm: false, web: false };
    const errors: { channel: "fcm" | "web"; err: unknown }[] = [];
    if (fcm) {
      try { await deps.senders.fcm(sub.fcmToken!, message); accepted.fcm = true; }
      catch (err) { errors.push({ channel: "fcm", err }); }
    }
    if (web) {
      try { await deps.senders.web(sub.subscription, message); accepted.web = true; }
      catch (err) { errors.push({ channel: "web", err }); }
    }

    if (accepted.fcm || accepted.web) {
      await deps.db.finish(eventId, { status: "sent", sentAt: deps.now(), accepted, lastError: errors[0] ? errCode(errors[0].err) : null, lang, variant: msg.variant, hadContentAtSend: reminderTrip.hasContent, activitiesAtSend: reminderTrip.activityCount });
      push("sent");
    } else {
      const permanent = errors.length > 0 && errors.every(x => isPermanentSendError(x.err));
      await deps.db.finish(eventId, { status: "failed", failedAt: deps.now(), accepted, lastError: errors[0] ? errCode(errors[0].err) : "no_channel", permanent });
      push("failed");
    }
  }
  return summary;
}
