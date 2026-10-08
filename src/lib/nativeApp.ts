import type { MouseEvent } from "react";

// True inside the Capacitor iOS shell. Android and the plain web return false.
export const isIosApp = (): boolean =>
  typeof window !== "undefined" &&
  (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor?.getPlatform?.() === "ios";

// Legal pages (/privacy, /terms, /contact) open in a new tab on the web. In the
// iOS app a new tab means the system Safari, which has no way back to the app,
// so there they load in the same WebView (each page has a "Back to App" link).
// Android already handles a new tab fine, so it keeps the old behaviour.
export const openLegal = (path: string): void => {
  if (isIosApp()) window.location.href = path;
  else window.open(path, "_blank");
};

// "Back to the app" link on the legal pages. In the iOS app, leaving through
// Next's client-side navigation left the home screen stuck on its loading
// screen, so there it does a full page load, the same path as opening the app.
export const goHome = (e: MouseEvent): void => {
  if (isIosApp()) {
    e.preventDefault();
    window.location.href = "/";
  }
};
