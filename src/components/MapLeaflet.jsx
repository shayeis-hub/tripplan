"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const RF = "'Rubik',sans-serif";

const PIN_COLORS = {
  flight:     "#64dfdf",
  hotel:      "#818cf8",
  attraction: "#f472b6",
  food:       "#fbbf24",
  taxi:       "#4ade80",
  other:      "#94a3b8",
};

// Custom round pin marker
function makeIcon(color) {
  const s = 34;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${s}px;height:${s}px;
      border-radius:${Math.round(s * 0.3)}px;
      background:${color}28;
      border:2px solid ${color};
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 14px ${color}55;
    "><div style="width:${Math.round(s*0.32)}px;height:${Math.round(s*0.32)}px;border-radius:50%;background:${color}"></div></div>`,
    iconSize:    [s, s],
    iconAnchor:  [s / 2, s],
    popupAnchor: [0, -s - 4],
  });
}

// Destination center marker
function makeDestIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:46px;height:46px;border-radius:14px;
      background:rgba(100,223,223,0.22);
      border:2.5px solid #64dfdf;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 20px rgba(100,223,223,0.45);
      font-size:22px;
    ">📍</div>`,
    iconSize:    [46, 46],
    iconAnchor:  [23, 46],
    popupAnchor: [0, -50],
  });
}

async function geocode(query) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { "Accept-Language": "en,he" } }
    );
    const json = await res.json();
    if (json[0]) return [parseFloat(json[0].lat), parseFloat(json[0].lon)];
  } catch {}
  return null;
}

export default function MapLeaflet({ destination, places, lang }) {
  const [center, setCenter]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [markerMap, setMarkerMap] = useState({}); // address → [lat,lng]

  // Geocode destination
  useEffect(() => {
    if (!destination) { setLoading(false); return; }
    setLoading(true);
    geocode(destination).then(c => {
      setCenter(c || [31.7683, 35.2137]); // fallback: Jerusalem
      setLoading(false);
    });
  }, [destination]);

  // Geocode expense addresses (rate-limited to respect Nominatim policy)
  useEffect(() => {
    if (!places || places.length === 0) return;
    let cancelled = false;

    (async () => {
      const coords = {};
      for (const p of places) {
        if (!p.address || coords[p.address]) continue;
        const q = `${p.address}, ${destination}`;
        const c = await geocode(q);
        if (c) coords[p.address] = c;
        await new Promise(r => setTimeout(r, 350)); // Nominatim: max 1 req/sec
        if (cancelled) return;
      }
      if (!cancelled) setMarkerMap(coords);
    })();

    return () => { cancelled = true; };
  }, [places, destination]);

  if (loading) {
    return (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#0d2137", gap: 12,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          border: "3px solid rgba(100,223,223,0.15)",
          borderTopColor: "#64dfdf",
          animation: "spin 0.8s linear infinite",
        }}/>
        <span style={{ color: "rgba(100,223,223,0.7)", fontSize: 13, fontFamily: RF }}>
          {lang === "he" ? "טוען מפה…" : "Loading map…"}
        </span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!center) {
    return (
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        background: "#0d2137", color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: RF,
      }}>
        {lang === "he" ? "לא נמצא יעד" : "Destination not found"}
      </div>
    );
  }

  return (
    <>
      <style>{`
        .leaflet-container { background: #0d2137; font-family: ${RF}; }
        .leaflet-popup-content-wrapper {
          background: #0d2137 !important;
          border: 0.5px solid rgba(100,223,223,0.2) !important;
          border-radius: 14px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
          color: #fff !important;
          font-family: ${RF} !important;
        }
        .leaflet-popup-tip { background: #0d2137 !important; }
        .leaflet-popup-close-button { color: rgba(255,255,255,0.4) !important; font-size: 18px !important; }
        .leaflet-control-attribution { background: rgba(9,25,40,0.8) !important; color: rgba(255,255,255,0.3) !important; }
        .leaflet-control-attribution a { color: rgba(100,223,223,0.5) !important; }
      `}</style>
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        {/* Dark CartoDB tiles — perfect for our dark UI */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        {/* Destination center pin */}
        <Marker position={center} icon={makeDestIcon()}>
          <Popup>
            <div style={{ fontFamily: RF, padding: "2px 0" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#64dfdf", marginBottom: 4 }}>{destination}</div>
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(destination)}`}
                target="_blank" rel="noopener noreferrer"
                style={{ background: "#4285F4", color: "#fff", padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none", display: "inline-block" }}
              >
                Google Maps ↗
              </a>
            </div>
          </Popup>
        </Marker>

        {/* Expense / place markers */}
        {places.map((p, i) => {
          const coords = markerMap[p.address];
          if (!coords) return null;
          const color = PIN_COLORS[p.category] || "#94a3b8";
          const gmLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.address}, ${destination}`)}`;
          return (
            <Marker key={i} position={coords} icon={makeIcon(color)}>
              <Popup>
                <div style={{ fontFamily: RF, padding: "2px 0", minWidth: 160 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 3 }}>{p.label}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: p.amount ? 6 : 10 }}>{p.address}</div>
                  {p.amount && (
                    <div style={{ fontSize: 14, fontWeight: 800, color, marginBottom: 10 }}>{p.amount}</div>
                  )}
                  <a
                    href={gmLink}
                    target="_blank" rel="noopener noreferrer"
                    style={{ background: "#4285F4", color: "#fff", padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none", display: "inline-block" }}
                  >
                    {lang === "he" ? "ניווט ↗" : "Navigate ↗"}
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </>
  );
}
