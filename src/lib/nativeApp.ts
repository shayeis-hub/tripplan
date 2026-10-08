"use client";
import { useEffect, useState, type MouseEvent } from "react";

// True inside the Capacitor iOS shell. Android and the plain web return false.
export const isIosApp = (): boolean =>
  typeof window !== "undefined" &&
  (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor?.getPlatform?.() === "ios";

export const LEGAL_EVENT = "tulon:legal";

// Legal pages (/privacy, /terms, /contact) open in a new tab on the web and on
// Android. In the iOS app a new tab means system Safari, which has no way back,
// and navigating the app's own WebView away reloads the app (the trip list came
// back empty), so there the page is shown in an overlay (LegalViewer).
export const openLegal = (path: string): void => {
  if (isIosApp()) window.dispatchEvent(new CustomEvent(LEGAL_EVENT, { detail: path }));
  else window.open(path, "_blank");
};

// True when the page is displayed inside the LegalViewer iframe, where the
// "back to the app" links are replaced by the overlay's own close button.
export function useEmbedded(): boolean {
  const [embedded, setEmbedded] = useState(false);
  useEffect(() => { setEmbedded(window.self !== window.top); }, []);
  return embedded;
}

// "Back to the app" link on the legal pages when they were opened by a plain
// same-tab navigation (e.g. from the login screen). In the iOS app that does a
// full page load rather than Next's client-side navigation, which left the home
// screen stuck on its loading screen.
export const goHome = (e: MouseEvent): void => {
  if (isIosApp()) {
    e.preventDefault();
    window.location.href = "/";
  }
};
