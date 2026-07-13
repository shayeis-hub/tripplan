"use client";
import { useEffect, useRef, useState } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { loadGoogleMaps } from "@/lib/gmaps";

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

// Dark map theme to match the app chrome (works because we don't use a cloud mapId).
const DARK_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0f2438" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f2438" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ca3b8" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#2a4058" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9fb4c9" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#cddbe9" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#7f97ac" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#12362e" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#4a9c7d" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e3750" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#16293c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8ca3b8" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2b4a68" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#223a52" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a1b2b" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d5975" }] },
];

const loadMaps = loadGoogleMaps;

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

// Cluster bubble styled to match the app
function clusterRenderer(maps) {
  return {
    render({ count, position }) {
      const size = count < 10 ? 40 : count < 50 ? 48 : 56;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2-2}" fill="#64dfdf" opacity="0.92"/>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2-2}" fill="none" stroke="#0d2137" stroke-width="1.5"/>
      </svg>`;
      return new maps.Marker({
        position,
        icon: { url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg), scaledSize: new maps.Size(size, size), anchor: new maps.Point(size/2, size/2) },
        label: { text: String(count), color: "#0d2137", fontSize: "13px", fontWeight: "800", fontFamily: RF },
        zIndex: 1000 + count,
      });
    },
  };
}

export default function MapGoogle({ destination, places, lang, dayFilter = "all", searchPin = null, routeActive = false, onRouteInfo }) {
  const mapEl = useRef(null);
  const mapsRef = useRef(null);
  const mapObjRef = useRef(null);
  const clustererRef = useRef(null);
  const taggedRef = useRef([]); // [{ marker, date, coords }]
  const searchMarkerRef = useRef(null);
  const dirRendererRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [errCode, setErrCode] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!destination) { setStatus("error"); setErrCode("no-destination"); return; }
    if (!KEY) { setStatus("error"); setErrCode("no-key"); return; }
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
        styles: DARK_STYLE,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: false,
        zoomControl: true,
        mapTypeControlOptions: { position: maps.ControlPosition.TOP_LEFT, style: maps.MapTypeControlStyle.DROPDOWN_MENU },
        gestureHandling: "greedy",
      });
      setStatus("ready");

      const bounds = new maps.LatLngBounds();
      if (dest) bounds.extend(center);
      const info = new maps.InfoWindow();

      // Destination marker
      if (dest) {
        new maps.Marker({ position: center, map, title: destination, icon: pinIcon(maps, "#64dfdf"), zIndex: 999 });
      }

      // "Where am I" custom control
      const locBtn = document.createElement("button");
      locBtn.type = "button";
      locBtn.title = lang === "he" ? "המיקום שלי" : lang === "es" ? "Mi ubicación" : "My location";
      locBtn.innerHTML = "◎";
      Object.assign(locBtn.style, {
        margin: "10px", width: "40px", height: "40px", borderRadius: "10px", border: "none",
        background: "#0d2137", color: "#64dfdf", fontSize: "20px", cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
      });
      let meMarker = null;
      locBtn.onclick = () => {
        if (!navigator.geolocation) return;
        locBtn.innerHTML = "…";
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const me = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            if (meMarker) meMarker.setMap(null);
            meMarker = new maps.Marker({
              position: me, map, zIndex: 1200,
              icon: { path: maps.SymbolPath.CIRCLE, scale: 8, fillColor: "#4285F4", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 3 },
            });
            map.panTo(me); map.setZoom(14);
            locBtn.innerHTML = "◎";
          },
          () => { locBtn.innerHTML = "◎"; },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      };
      map.controls[maps.ControlPosition.RIGHT_BOTTOM].push(locBtn);

      // Place markers → clustered
      const markers = [];
      const tagged = [];
      for (const p of (places || [])) {
        if (!p.address) continue;
        const coords = await cachedGeocode(geocoder, `${p.address}, ${destination}`);
        if (cancelled) return;
        if (!coords) continue;
        const color = PIN_COLORS[p.category] || "#64748b";
        const marker = new maps.Marker({ position: coords, title: p.label, icon: pinIcon(maps, color) });
        tagged.push({ marker, date: p.date || "", coords });
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
        markers.push(marker);
        bounds.extend(coords);
      }

      mapsRef.current = maps;
      mapObjRef.current = map;
      taggedRef.current = tagged;
      if (!cancelled && markers.length > 0) {
        clustererRef.current = new MarkerClusterer({ map, markers, renderer: clusterRenderer(maps) });
      }

      if (!cancelled && !bounds.isEmpty() && (places || []).length > 0) {
        map.fitBounds(bounds, 60);
        maps.event.addListenerOnce(map, "idle", () => { if (map.getZoom() > 15) map.setZoom(15); });
      }
    }).catch((e) => { if (!cancelled) { setStatus("error"); setErrCode(e?.message || "load-failed"); } });

    return () => { cancelled = true; };
  }, [destination, places, lang]);

  // Drop / move a highlighted marker for a searched place and pan to it
  useEffect(() => {
    const maps = mapsRef.current, map = mapObjRef.current;
    if (!maps || !map || status !== "ready") return;
    if (searchMarkerRef.current) { searchMarkerRef.current.setMap(null); searchMarkerRef.current = null; }
    if (!searchPin) return;
    const pos = { lat: searchPin.lat, lng: searchPin.lng };
    searchMarkerRef.current = new maps.Marker({
      position: pos, map, title: searchPin.name, zIndex: 1500,
      icon: pinIcon(maps, "#ef4444"), animation: maps.Animation.DROP,
    });
    map.panTo(pos);
    if (map.getZoom() < 13) map.setZoom(15);
  }, [searchPin, status]);

  // Draw / clear the day route (Directions API)
  useEffect(() => {
    const maps = mapsRef.current, map = mapObjRef.current, tagged = taggedRef.current;
    if (!maps || !map || status !== "ready") return;
    if (dirRendererRef.current) { dirRendererRef.current.setMap(null); dirRendererRef.current = null; }
    if (!routeActive) { onRouteInfo && onRouteInfo(null); return; }
    const pts = tagged.filter(t => dayFilter === "all" || t.date === dayFilter).map(t => t.coords);
    if (pts.length < 2) { onRouteInfo && onRouteInfo(null); return; }
    const svc = new maps.DirectionsService();
    svc.route({
      origin: pts[0], destination: pts[pts.length - 1],
      waypoints: pts.slice(1, -1).map(p => ({ location: p, stopover: true })),
      optimizeWaypoints: true, travelMode: maps.TravelMode.DRIVING,
    }, (res, st) => {
      if (st !== "OK" || !res) { onRouteInfo && onRouteInfo(null); return; }
      dirRendererRef.current = new maps.DirectionsRenderer({
        map, directions: res, suppressMarkers: true,
        polylineOptions: { strokeColor: "#64dfdf", strokeWeight: 5, strokeOpacity: 0.9 },
      });
      let dist = 0, dur = 0;
      res.routes[0].legs.forEach(l => { dist += l.distance.value; dur += l.duration.value; });
      onRouteInfo && onRouteInfo({ km: (dist / 1000).toFixed(1), min: Math.round(dur / 60) });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeActive, dayFilter, status]);

  // React to the day filter without rebuilding the whole map
  useEffect(() => {
    const maps = mapsRef.current, clusterer = clustererRef.current, map = mapObjRef.current, tagged = taggedRef.current;
    if (!maps || !clusterer || !map || status !== "ready") return;
    const visible = tagged.filter(t => dayFilter === "all" || t.date === dayFilter);
    clusterer.clearMarkers();
    clusterer.addMarkers(visible.map(t => t.marker));
    if (visible.length > 0) {
      const b = new maps.LatLngBounds();
      visible.forEach(t => b.extend(t.coords));
      map.fitBounds(b, 60);
      maps.event.addListenerOnce(map, "idle", () => { if (map.getZoom() > 15) map.setZoom(15); });
    }
  }, [dayFilter, status]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#0f2438" }}>
      <div ref={mapEl} style={{ width: "100%", height: "100%" }} />
      {status !== "ready" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: "#0f2438", pointerEvents: "none" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid rgba(100,223,223,0.15)", borderTopColor: "#64dfdf", animation: "spin 0.8s linear infinite" }}/>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: RF }}>
            {status === "error"
              ? (lang === "he" ? "לא ניתן לטעון את המפה" : lang === "es" ? "No se pudo cargar el mapa" : "Couldn't load the map")
              : (lang === "he" ? "טוען מפה…" : lang === "es" ? "Cargando mapa…" : "Loading map…")}
          </span>
          {status === "error" && errCode && (
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: RF, direction: "ltr" }}>{errCode}</span>
          )}
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
    </div>
  );
}
