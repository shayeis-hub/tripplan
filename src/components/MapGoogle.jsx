"use client";
import { useEffect, useRef, useState } from "react";

const RF = "'Rubik',sans-serif";
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";

const PIN_COLORS = {
  flight:     "#0ea5b7",
  hotel:      "#6366f1",
  attraction: "#ec4899",
  food:       "#f59e0b",
  taxi:       "#22c55e",
  shopping:   "#ec4899",
  other:      "#64748b",
};

// Load the Google Maps JS API once, shared across mounts.
let mapsPromise = null;
function loadMaps() {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    if (!KEY) { reject(new Error("no-key")); return; }
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&loading=async&v=weekly`;
    s.async = true;
    s.onload = () => resolve(window.google.maps);
    s.onerror = () => reject(new Error("load-failed"));
    document.head.appendChild(s);
  });
  return mapsPromise;
}

// Geocode with a localStorage cache so each address is billed at most once per device.
function cachedGeocode(geocoder, query) {
  const cacheKey = `gmc_${query}`;
  try {
    const hit = localStorage.getItem(cacheKey);
    if (hit) { const [lat, lng] = hit.split(","); return Promise.resolve({ lat: +lat, lng: +lng }); }
  } catch {}
  return new Promise((resolve) => {
    geocoder.geocode({ address: query }, (results, status) => {
      if (status === "OK" && results[0]) {
        const loc = results[0].geometry.location;
        const coords = { lat: loc.lat(), lng: loc.lng() };
        try { localStorage.setItem(cacheKey, `${coords.lat},${coords.lng}`); } catch {}
        resolve(coords);
      } else resolve(null);
    });
  });
}

function pinIcon(maps, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">
    <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z" fill="${color}"/>
    <circle cx="15" cy="15" r="6" fill="#fff"/>
  </svg>`;
  return {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
    scaledSize: new maps.Size(30, 40),
    anchor: new maps.Point(15, 40),
  };
}

export default function MapGoogle({ destination, places, lang }) {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errCode, setErrCode] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!destination) { setStatus("error"); setErrCode("no-destination"); return; }
    if (!KEY) { setStatus("error"); setErrCode("no-key"); return; }
    // Google calls this global on auth/referer/billing failures
    window.gm_authFailure = () => { if (!cancelled) { setStatus("error"); setErrCode("auth-failure (key/referrer/billing)"); } };

    loadMaps().then(async (maps) => {
      if (cancelled || !mapEl.current) return;
      const geocoder = new maps.Geocoder();

      const dest = await cachedGeocode(geocoder, destination);
      if (cancelled) return;
      const center = dest || { lat: 31.7683, lng: 35.2137 };

      const map = new maps.Map(mapEl.current, {
        center,
        zoom: dest ? 11 : 6,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: false,
        zoomControl: true,
        mapTypeControlOptions: { position: maps.ControlPosition.TOP_LEFT },
        gestureHandling: "greedy",
      });
      mapRef.current = map;
      setStatus("ready");

      const bounds = new maps.LatLngBounds();
      if (dest) bounds.extend(center);

      const info = new maps.InfoWindow();

      // Destination marker
      if (dest) {
        new maps.Marker({
          position: center, map, title: destination,
          icon: pinIcon(maps, "#64dfdf"),
        });
      }

      // Place markers (geocoded, cached)
      for (const p of (places || [])) {
        if (!p.address) continue;
        const coords = await cachedGeocode(geocoder, `${p.address}, ${destination}`);
        if (cancelled) return;
        if (!coords) continue;
        const color = PIN_COLORS[p.category] || "#64748b";
        const marker = new maps.Marker({ position: coords, map, title: p.label, icon: pinIcon(maps, color) });
        const nav = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.address}, ${destination}`)}`;
        const navLabel = lang === "he" ? "ניווט" : lang === "es" ? "Ir" : "Navigate";
        marker.addListener("click", () => {
          info.setContent(`<div style="font-family:${RF};min-width:150px;padding:2px 0;color:#0d2137">
            <div style="font-weight:700;font-size:14px;margin-bottom:2px">${p.label || ""}</div>
            <div style="font-size:12px;color:#64748b;margin-bottom:${p.amountFmt ? "6" : "8"}px">${p.address}</div>
            ${p.amountFmt ? `<div style="font-size:14px;font-weight:800;color:${color};margin-bottom:8px">${p.amountFmt}</div>` : ""}
            <a href="${nav}" target="_blank" rel="noopener noreferrer" style="background:#4285F4;color:#fff;padding:5px 12px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;display:inline-block">${navLabel} ↗</a>
          </div>`);
          info.open(map, marker);
        });
        bounds.extend(coords);
      }

      // Fit to all markers if we have more than just the destination
      if (!cancelled && !bounds.isEmpty() && (places || []).length > 0) {
        map.fitBounds(bounds, 60);
        maps.event.addListenerOnce(map, "idle", () => {
          if (map.getZoom() > 15) map.setZoom(15);
        });
      }
    }).catch((e) => { if (!cancelled) { setStatus("error"); setErrCode(e?.message || "load-failed"); } });

    return () => { cancelled = true; };
  }, [destination, places, lang]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#e8edf2" }}>
      <div ref={mapEl} style={{ width: "100%", height: "100%" }} />
      {status !== "ready" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: "#e8edf2", pointerEvents: "none" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid rgba(13,33,55,0.15)", borderTopColor: "#0d2137", animation: "spin 0.8s linear infinite" }}/>
          <span style={{ color: "rgba(13,33,55,0.5)", fontSize: 13, fontFamily: RF }}>
            {status === "error"
              ? (lang === "he" ? "לא ניתן לטעון את המפה" : lang === "es" ? "No se pudo cargar el mapa" : "Couldn't load the map")
              : (lang === "he" ? "טוען מפה…" : lang === "es" ? "Cargando mapa…" : "Loading map…")}
          </span>
          {status === "error" && errCode && (
            <span style={{ color: "rgba(13,33,55,0.4)", fontSize: 11, fontFamily: RF, direction: "ltr" }}>{errCode}</span>
          )}
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
    </div>
  );
}
