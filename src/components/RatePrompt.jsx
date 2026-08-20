"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

const RF = "'Rubik',sans-serif";
const TEAL = "#64dfdf";
const KEY = "tulon_rate_prompt";       // set once the prompt has been answered
const MIN_DAYS = 14;                   // account age before we ask
const PLAY_URL = "https://play.google.com/store/apps/details?id=il.co.tulon.www.twa";

// IMPORTANT — Google Play policy:
// No star picker and no opinion question here. Filtering users by sentiment
// before sending them to the store ("rating gating" / opinion mining) is
// prohibited and inflates ratings artificially. Both actions are always
// visible and neither is conditioned on an answer.
// https://developer.android.com/guide/playcore/in-app-review
const T = {
  he: {
    title: "טיולון איתך כבר שבועיים",
    body: "דירוג בחנות עוזר למטיילים אחרים למצוא את האפליקציה. לוקח פחות מדקה.",
    rate: "דרגו בגוגל פליי",
    feedback: "שלחו לנו משוב",
    later: "לא עכשיו",
  },
  en: {
    title: "You've had Tulon for two weeks",
    body: "A rating on the store helps other travellers find the app. It takes under a minute.",
    rate: "Rate on Google Play",
    feedback: "Send us feedback",
    later: "Not now",
  },
  es: {
    title: "Llevas dos semanas con Tulon",
    body: "Una valoración en la tienda ayuda a otros viajeros a encontrar la app. Toma menos de un minuto.",
    rate: "Valorar en Google Play",
    feedback: "Envíanos comentarios",
    later: "Ahora no",
  },
};

export default function RatePrompt({ lang = "he", hasTrips }) {
  const [show, setShow] = useState(false);
  const t = T[lang] || T.he;
  const isHe = lang === "he";

  useEffect(() => {
    // Only inside the Play Store build — a store rating is meaningless on web.
    if (!window.Capacitor?.isNativePlatform?.()) return;
    if (!hasTrips) return;                       // only ask engaged users
    try { if (localStorage.getItem(KEY)) return; } catch { return; }
    // Account age from Firebase Auth rather than localStorage: it survives a
    // cache clear and is consistent across the user's devices.
    const created = auth.currentUser?.metadata?.creationTime;
    if (!created) return;
    const days = (Date.now() - new Date(created).getTime()) / 86400000;
    if (days < MIN_DAYS) return;
    const timer = setTimeout(() => setShow(true), 1500); // let the app settle first
    return () => clearTimeout(timer);
  }, [hasTrips]);

  const close = () => {
    try { localStorage.setItem(KEY, String(Date.now())); } catch {}
    setShow(false);
  };
  const go = (url) => { window.open(url, "_blank", "noopener,noreferrer"); close(); };

  if (!show) return null;

  const btn = {
    width: "100%", padding: "13px", borderRadius: 13, cursor: "pointer",
    fontFamily: RF, fontWeight: 700, fontSize: 14, border: "none",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 4000, background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(3px)", display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24,
    }} dir={isHe ? "rtl" : "ltr"}>
      <div style={{
        width: "100%", maxWidth: 340, background: "#0a2035", borderRadius: 22,
        border: "0.5px solid rgba(100,223,223,0.25)", padding: "26px 22px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)", textAlign: "center",
      }}>
        <div style={{ fontFamily: RF, fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", marginBottom: 12 }}>
          TU<span style={{ color: TEAL }}>lon</span>
        </div>
        <div style={{ fontFamily: RF, fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
          {t.title}
        </div>
        <div style={{ fontFamily: RF, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 22 }}>
          {t.body}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <button onClick={() => go(PLAY_URL)} style={{ ...btn, background: TEAL, color: "#0d2137" }}>
            {t.rate}
          </button>
          <button onClick={() => go("/contact")} style={{
            ...btn, background: "rgba(255,255,255,0.06)",
            border: "0.5px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.75)",
          }}>
            {t.feedback}
          </button>
          <button onClick={close} style={{
            ...btn, background: "transparent", color: "rgba(255,255,255,0.45)",
            fontWeight: 600, fontSize: 13.5, padding: "11px",
          }}>
            {t.later}
          </button>
        </div>
      </div>
    </div>
  );
}
