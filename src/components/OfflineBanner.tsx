"use client";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import { useLang } from "@/lib/LangContext";

const T = {
  he: "אין חיבור לאינטרנט",
  en: "No internet connection",
  es: "Sin conexión a internet",
} as const;

export default function OfflineBanner() {
  const isOffline = useOnlineStatus();
  const { lang } = useLang();
  if (!isOffline) return null;
  // Normal document flow, not fixed — a fixed overlay would sit on top of the
  // app's own fixed-height screens (each is exactly 100dvh) instead of
  // pushing them down, hiding their header underneath it.
  return (
    <div style={{
      flexShrink: 0, zIndex: 500,
      background: "#7c2d12", color: "#fff",
      fontFamily: "'Rubik',sans-serif", fontSize: 12.5, fontWeight: 700,
      textAlign: "center", padding: "6px 10px",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
    }}>
      📡 {T[lang] || T.he}
    </div>
  );
}
