"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useLang } from "@/lib/LangContext";
import { LEGAL_EVENT } from "@/lib/nativeApp";

const ALLOWED = ["/privacy", "/terms", "/contact"];
const TITLES: Record<string, { he: string; en: string; es: string }> = {
  "/privacy": { he: "מדיניות פרטיות", en: "Privacy Policy", es: "Política de privacidad" },
  "/terms":   { he: "תנאי שימוש", en: "Terms of Service", es: "Términos de servicio" },
  "/contact": { he: "צור קשר", en: "Contact", es: "Contacto" },
};
const CLOSE = { he: "סגור", en: "Close", es: "Cerrar" };

// Shows a legal page over the current screen, inside the iOS app. Used instead
// of navigating away: leaving the app screen reloaded it, which left the trip
// list empty, and system Safari had no way back. Closing just removes the
// overlay, so the screen underneath is exactly as the user left it.
export default function LegalViewer() {
  const { lang } = useLang() as { lang: "he" | "en" | "es" };
  const [path, setPath] = useState<string | null>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const p = (e as CustomEvent<string>).detail;
      if (ALLOWED.includes(p)) setPath(p);
    };
    window.addEventListener(LEGAL_EVENT, onOpen);
    return () => window.removeEventListener(LEGAL_EVENT, onOpen);
  }, []);

  if (!path) return null;
  const RF = "'Rubik',sans-serif";
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={TITLES[path][lang]}
      dir={lang === "he" ? "rtl" : "ltr"}
      style={{ position: "fixed", inset: 0, zIndex: 900, background: "#0a1628", display: "flex", flexDirection: "column" }}
    >
      {/* position:fixed ignores the body's safe-area padding, so the bar adds its own. */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", paddingTop: "calc(12px + env(safe-area-inset-top))", borderBottom: "0.5px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
        <div style={{ fontFamily: RF, color: "#fff", fontSize: 16, fontWeight: 700 }}>{TITLES[path][lang]}</div>
        <button
          onClick={() => setPath(null)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 12, border: "0.5px solid rgba(100,223,223,0.3)", background: "rgba(100,223,223,0.08)", color: "#64dfdf", fontFamily: RF, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          <X size={16} strokeWidth={2} />{CLOSE[lang]}
        </button>
      </div>
      <iframe
        src={path}
        title={TITLES[path][lang]}
        style={{ flex: 1, width: "100%", border: "none", background: "#0a1628", paddingBottom: "env(safe-area-inset-bottom)" }}
      />
    </div>
  );
}
