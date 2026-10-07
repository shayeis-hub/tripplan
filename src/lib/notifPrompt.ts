// When to ask a user, once, whether they want trip reminders.
//
// The ask is deliberately rare and only where it can pay off:
//  - right after a NEW trip with a departure date is created (the moment a
//    reminder is obviously relevant), never on app launch;
//  - only if the OS permission is still undecided and they are not already
//    subscribed (a denied permission is never asked again; the existing bell
//    button explains how to re-enable);
//  - only if the departure is at least a week away, so the "a week before"
//    promise in the text can still be kept;
//  - only where this device can actually receive a push (pushReady): the Android
//    app, an iOS app build that ships the Firebase Messaging plugin (older iOS
//    builds have no working push, so they are never asked), and browsers with
//    Notification + service worker + PushManager (so not iOS Safari outside an
//    installed web app);
//  - at most once per 30 days after any answer.
import { dayNumber } from "./tripLifecycle";

export const PROMPT_MIN_DAYS = 7;
export const PROMPT_COOLDOWN_MS = 30 * 24 * 3600 * 1000;

export interface PromptInput {
  permission: string; // Notification.permission, or Capacitor's: default | prompt | prompt-with-rationale | granted | denied
  subscribed: boolean;
  pushReady: boolean; // this device/app build can actually receive a push (see detectPromptEnvironment)
  startDate: string | null; // trip departure, YYYY-MM-DD
  today: string; // device-local calendar date, YYYY-MM-DD (same basis the app uses)
  dismissedAt: number | null; // last time the user answered the ask
  now: number;
}

export function shouldAskForNotifications(i: PromptInput): boolean {
  if (i.subscribed) return false;
  if (!["default", "prompt", "prompt-with-rationale"].includes(i.permission)) return false;
  if (!i.pushReady) return false;
  const start = dayNumber(i.startDate);
  const today = dayNumber(i.today);
  if (start == null || today == null || start - today < PROMPT_MIN_DAYS) return false;
  if (i.dismissedAt != null && i.now - i.dismissedAt < PROMPT_COOLDOWN_MS) return false;
  return true;
}

const KEY = "notifPromptAnsweredAt";

export function readPromptAnsweredAt(): number | null {
  try {
    const v = Number(localStorage.getItem(KEY));
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch {
    return null;
  }
}

export function markPromptAnswered(): void {
  try {
    localStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* storage blocked: the cooldown simply doesn't persist */
  }
}

// Client-only: can this device / app build actually receive a push?
export function detectPromptEnvironment(): { pushReady: boolean } {
  const cap = typeof window !== "undefined"
    ? (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string; Plugins?: Record<string, unknown> } }).Capacitor
    : undefined;
  if (cap?.isNativePlatform?.()) {
    // Android always can. iOS only in a build that includes the Firebase Messaging plugin.
    return { pushReady: cap.getPlatform?.() === "ios" ? !!cap.Plugins?.FirebaseMessaging : true };
  }
  return {
    pushReady:
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window,
  };
}
