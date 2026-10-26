"use client";
import type { User } from "firebase/auth";
import { auth } from "./firebase";
import { currentLang } from "./currentLang";

// Client side of the e-mail system. Both calls are fire-and-forget: they never
// block or break sign-in, and an error is silently dropped (the server decides
// everything: eligibility, exactly-once, retries).

const WELCOME_WINDOW_MS = 24 * 3600 * 1000;
const DONE_PREFIX = "tulon_welcome_done_";
const LANG_PREFIX = "tulon_lang_synced_";

const hasSavedLang = (): boolean => {
  try {
    const v = localStorage.getItem("tulon_lang");
    return v === "he" || v === "en" || v === "es";
  } catch {
    return false;
  }
};

async function post(user: User, url: string, body: unknown): Promise<Response> {
  const token = await user.getIdToken();
  return fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

// Called on every auth-state change. For an account created in the last 24h it
// asks the server to send the welcome e-mail once; the server answers "final"
// when nothing more can happen (sent, skipped, ...). Until then (a transient
// failure) the next app open within the window asks again; the server's own
// state makes a repeat safe.
export async function reportNewUserForWelcome(user: User): Promise<void> {
  try {
    const created = Date.parse(user.metadata.creationTime || "");
    if (!created || Date.now() - created > WELCOME_WINDOW_MS) return;
    const flag = DONE_PREFIX + user.uid;
    if (localStorage.getItem(flag)) return;
    const res = await post(user, "/api/welcome", { lang: currentLang(), langSource: hasSavedLang() ? "saved" : "device" });
    if (!res.ok) return;
    const j = (await res.json()) as { final?: boolean };
    if (j.final) localStorage.setItem(flag, "1");
  } catch {
    /* a welcome e-mail must never affect sign-in */
  }
}

// Keeps profile.lang in step with the app language: once per device after
// sign-in (backfills existing users) and again whenever the language changes.
export async function syncProfileLang(user: User | null, force = false): Promise<void> {
  try {
    if (!user) return;
    const lang = currentLang();
    const key = `${LANG_PREFIX}${user.uid}`;
    const source = hasSavedLang() ? "saved" : "device";
    if (!force && localStorage.getItem(key) === `${lang}:${source}`) return;
    const res = await post(user, "/api/profile/lang", { lang, source });
    if (res.ok) localStorage.setItem(key, `${lang}:${source}`);
  } catch {
    /* best effort */
  }
}

export const syncProfileLangForCurrentUser = (force = false) => syncProfileLang(auth.currentUser, force);
