"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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

// Returns { center, bbox } — bbox is [[s,w],[n,e]] for fitBounds, or null
async function geocode(query) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { "Accept-Language": "en,he" } }
    );
    const json = await res.json();
    if (json[0]) {
      const { lat, lon, boundingbox } = json[0];
      const center = [parseFloat(lat), parseFloat(lon)];
      const bbox = boundingbox
        ? [[parseFloat(boundingbox[0]), parseFloat(boundingbox[2])],
           [parseFloat(boundingbox[1]), parseFloat(boundingbox[3])]]
        : null;
      return { center, bbox };
    }
  } catch {}
  return null;
}

// Inner component — fits map to bbox once mounted
function FitBounds({ bbox }) {
  const map = useMap();
  useEffect(() => {
    if (!bbox) return;
    // maxZoom: country→5, region→8, city→12, neighbourhood→15
    map.fitBounds(bbox, { padding: [24, 24], maxZoom: 14, animate: false });
  }, [map, bbox]);
  return null;
}

export default function MapLeaflet({ destination, places, lang }) {
  const [geoResult, setGeoResult] = useState(null); // { center, bbox }
  const [loading, setLoading]     = useState(true);
  const [markerMap, setMarkerMap] = useState({});   // address → [lat,lng]

  // Geocode destination — get center + bounding box
  useEffect(() => {
    if (!destination) { setLoading(false); return; }
    setLoading(true);
    geocode(destination).then(res => {
      setGeoResult(res || { center: [31.7683, 35.2137], bbox: null });
      setLoading(false);
    });
  }, [destination]);

  // Geocode expense addresses (rate-limited: Nominatim max 1 req/sec)
  useEffect(() => {
    if (!places || places.length === 0) return;
    let cancelled = false;
    (async () => {
      const coords = {};
      for (const p of places) {
        if (!p.address || coords[p.address]) continue;
        const res = await geocode(`${p.address}, ${destination}`);
        if (res) coords[p.address] = res.center;
        await new Promise(r => setTimeout(r, 350));
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
        background: "#e8edf2", gap: 12,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          border: "3px solid rgba(13,33,55,0.15)",
          borderTopColor: "#0d2137",
          animation: "spin 0.8s linear infinite",
        }}/>
        <span style={{ color: "rgba(13,33,55,0.5)", fontSize: 13, fontFamily: RF }}>
          {lang === "he" ? "טוען מפה…" : lang === "es" ? "Cargando mapa…" : "Loading map…"}
        </span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!geoResult) {
    return (
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        background: "#e8edf2", color: "rgba(13,33,55,0.4)", fontSize: 14, fontFamily: RF,
      }}>
        {lang === "he" ? "לא נמצא יעד" : lang === "es" ? "Destino no encontrado" : "Destination not found"}
      </div>
    );
  }

  const { center, bbox } = geoResult;

  return (
    <>
      <style>{`
        .leaflet-container { background: #e8edf2; font-family: ${RF}; }
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
        .leaflet-control-attribution { background: rgba(255,255,255,0.7) !important; color: rgba(0,0,0,0.4) !important; font-size: 10px !important; }
        .leaflet-control-attribution a { color: #64dfdf !important; }
      `}</style>
      <MapContainer
        center={center}
        zoom={bbox ? 5 : 10}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        {/* CartoDB Voyager — colorful/clean, great contrast with dark UI chrome */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        {/* Fit to bounding box — handles country vs city zoom automatically */}
        {bbox && <FitBounds bbox={bbox} />}

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
                    {lang === "he" ? "ניווט ↗" : lang === "es" ? "Ir ↗" : "Navigate ↗"}
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
