"use client";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useLang } from "@/lib/LangContext";

const T = {
  he: "לא ניתן היה לשמור את השינויים",
  en: "Couldn't save your changes",
  es: "No se pudieron guardar los cambios",
} as const;
const RETRY = {
  he: "נסה שוב",
  en: "Retry",
  es: "Reintentar",
} as const;

// Surfaces useTrips' syncFailed flag — a saveTrip() write that actually
// failed (permission denied, offline, rejected by rules...) used to be
// swallowed silently: local state already showed the edit as applied, so
// the user had no way to know it never reached Firestore. onRetry replays
// the exact failed write (useTrips remembers the payload) instead of
// asking the user to redo whatever they just did.
export default function SyncFailedBanner({ failed, onRetry }: { failed: boolean; onRetry: () => void }) {
  const { lang } = useLang();
  if (!failed) return null;
  // Normal document flow, not fixed — matches OfflineBanner, which sits in
  // the same spot: a fixed overlay would sit on top of the app's own
  // fixed-height screens (each is exactly 100dvh) instead of pushing them
  // down, hiding their header underneath it.
  return (
    <div style={{
      flexShrink: 0, zIndex: 500,
      background: "#7c2d12", color: "#fff",
      fontFamily: "'Rubik',sans-serif", fontSize: 12.5, fontWeight: 700,
      textAlign: "center", padding: "6px 10px",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
    }}>
      <AlertCircle size={14} strokeWidth={2}/>
      <span>{T[lang] || T.he}</span>
      <button onClick={onRetry} style={{
        background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6,
        color: "#fff", fontFamily: "'Rubik',sans-serif", fontWeight: 700, fontSize: 11.5,
        padding: "3px 10px", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 4,
      }}>
        <RefreshCw size={11} strokeWidth={2.5}/>
        {RETRY[lang] || RETRY.he}
      </button>
    </div>
  );
}
