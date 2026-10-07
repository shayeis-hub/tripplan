"use client";
import type { User } from "firebase/auth";
import type { FirstTouch } from "./acquisition";

// First-touch capture. The first time a browser (or the native shell's
// WebView) loads any page of the site we remember where it came from and
// never overwrite that on later visits. If the visitor registers later, that
// remembered first touch is what gets attached to their account.

const KEY = "tulon_first_touch_v1";
const SENT_PREFIX = "tulon_acq_sent_";
// Only accounts created in the last 6 hours count as "new registrations", so
// opening the app as an existing user never creates an acquisition record.
const NEW_USER_WINDOW_MS = 6 * 3600 * 1000;

const isOwnHost = (h: string) =>
  h === location.hostname || /(^|\.)tulon\.(app|co\.il)$/.test(h);

export function captureFirstTouch(): FirstTouch | null {
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return JSON.parse(existing);

    const q = new URLSearchParams(location.search);
    let referrer = "";
    if (document.referrer) {
      try {
        const u = new URL(document.referrer);
        if (!isOwnHost(u.hostname)) referrer = u.origin + u.pathname;
      } catch {
        /* unparsable referrer: treat as none */
      }
    }
    const ft: FirstTouch = {
      utmSource: q.get("utm_source"),
      utmMedium: q.get("utm_medium"),
      utmCampaign: q.get("utm_campaign"),
      referrer: referrer || null,
      landing: location.pathname,
      platform: (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.() ? "app" : "web",
      firstSeenAt: Date.now(),
    };
    localStorage.setItem(KEY, JSON.stringify(ft));
    return ft;
  } catch {
    return null; // storage blocked: no source is better than a wrong one
  }
}

// Called on every auth-state change. A no-op unless the user was created in
// the last few hours and this device hasn't already reported it. The server
// re-checks the registration time and only ever creates the record once.
export async function reportAcquisitionIfNewUser(user: User): Promise<void> {
  try {
    const created = Date.parse(user.metadata.creationTime || "");
    if (!created || Date.now() - created > NEW_USER_WINDOW_MS) return;
    const flag = SENT_PREFIX + user.uid;
    if (localStorage.getItem(flag)) return;
    const ft = captureFirstTouch();
    if (!ft) return;
    const token = await user.getIdToken();
    const res = await fetch("/api/acquisition", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(ft),
    });
    if (res.ok) localStorage.setItem(flag, "1");
  } catch {
    /* analytics must never break sign-in */
  }
}
