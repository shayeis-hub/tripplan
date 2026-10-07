// Production adapters for pre7Reminder.ts: Firestore (Admin SDK) and the two
// push providers. Not imported by any route or cron yet; wiring them in is the
// deliberate "turn it on" step (see the report), guarded by a feature flag.
import type { Firestore } from "firebase-admin/firestore";
import type { Messaging } from "firebase-admin/messaging";
import type { NotificationEvent } from "./preTripReminder";
import type { Pre7Db, Pre7Senders, SendMessage, StoredSubscription } from "./pre7Reminder";

const EVENTS = "notificationEvents";

export function createFirestorePre7Db(db: Firestore): Pre7Db {
  return {
    // The ONE trips query the reminder makes. startDate is always an
    // "YYYY-MM-DD" string (written only from <input type="date"> values), so a
    // single-field equality query is exact, and it uses the automatic
    // single-field index: no composite index and no collection scan.
    async tripsStartingOn(startDate) {
      const snap = await db.collection("trips").where("startDate", "==", startDate).get();
      return snap.docs.map(d => ({ id: d.id, data: d.data() as Record<string, unknown> }));
    },
    async subscriptions(uids) {
      const out = new Map<string, StoredSubscription>();
      if (uids.length === 0) return out;
      const snaps = await db.getAll(...uids.map(u => db.collection("pushSubscriptions").doc(u)));
      snaps.forEach((s, i) => { if (s.exists) out.set(uids[i], s.data() as StoredSubscription); });
      return out;
    },
    async events(ids) {
      const out = new Map<string, NotificationEvent>();
      if (ids.length === 0) return out;
      const snaps = await db.getAll(...ids.map(i => db.collection(EVENTS).doc(i)));
      snaps.forEach((s, i) => { if (s.exists) out.set(ids[i], s.data() as NotificationEvent); });
      return out;
    },
    async reserve(id, event) {
      try {
        await db.collection(EVENTS).doc(id).create(event); // fails if it already exists
        return true;
      } catch (e) {
        const err = e as { code?: number; message?: string };
        if (err?.code === 6 || /already exists/i.test(err?.message || "")) return false; // gRPC ALREADY_EXISTS
        throw e;
      }
    },
    async reacquire(id, expectedAttempt, nowMs) {
      const ref = db.collection(EVENTS).doc(id);
      return db.runTransaction(async tx => {
        const snap = await tx.get(ref);
        const d = snap.data() as NotificationEvent | undefined;
        if (!d || d.status !== "failed" || d.permanent || d.attemptCount !== expectedAttempt) return false;
        tx.update(ref, { status: "reserved", reservedAt: nowMs, attemptCount: expectedAttempt + 1 });
        return true;
      });
    },
    async finish(id, patch) {
      await db.collection(EVENTS).doc(id).update(patch as Record<string, unknown>);
    },
  };
}

// Same payload shapes the existing push-send / push-cron use, plus the deep link
// in `data.url`, which the service worker (web) and the Capacitor action
// listener (Android) both read.
export function createPre7Senders(messaging: Messaging, webpush: { sendNotification(sub: never, payload: string): Promise<unknown> }): Pre7Senders {
  return {
    async fcm(token: string, msg: SendMessage) {
      await messaging.send({
        token,
        notification: { title: msg.title, body: msg.body },
        data: { url: msg.url },
        android: { notification: { icon: "ic_launcher", color: "#0d2137" }, priority: "high" },
      });
    },
    async web(subscription: unknown, msg: SendMessage) {
      await webpush.sendNotification(subscription as never, JSON.stringify({ title: msg.title, body: msg.body, url: msg.url }));
    },
  };
}
