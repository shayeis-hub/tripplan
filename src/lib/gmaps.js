// Shared Google Maps JS loader — one script, one callback, cached promise.
// Used by both the map (MapGoogle) and the Discover kosher search.
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";
let promise = null;

export function loadGoogleMaps() {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (promise) return promise;
  promise = new Promise((resolve, reject) => {
    if (!KEY) { reject(new Error("no-key")); return; }
    // Classic callback loader — every class is ready when it fires (robust in WebViews).
    window.__gmapsReady = () => resolve(window.google.maps);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&v=weekly&callback=__gmapsReady`;
    s.async = true;
    s.onerror = () => reject(new Error("load-failed"));
    document.head.appendChild(s);
  });
  return promise;
}
