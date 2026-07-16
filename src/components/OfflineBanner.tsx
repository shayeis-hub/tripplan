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
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 99999,
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
