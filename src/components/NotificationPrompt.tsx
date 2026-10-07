"use client";
import { Bell } from "lucide-react";
import { t, type Lang } from "@/lib/i18n";

// One-time soft ask for trip reminders. "Yes" is what opens the system
// permission dialog (done by the caller); "Maybe later" just closes. Same modal
// look as the share dialog; no emoji, lucide icon only.
export default function NotificationPrompt({ lang, onYes, onLater }: { lang: Lang; onYes: () => void; onLater: () => void }) {
  const RF = "'Rubik',sans-serif";
  return (
    <div
      className="fx-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notifprompt-title"
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 320, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onLater}
    >
      <div
        className="fx-card"
        onClick={e => e.stopPropagation()}
        style={{ background: "#0d2f4a", border: "0.5px solid rgba(100,223,223,0.25)", borderRadius: 20, padding: 24, width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", fontFamily: RF, textAlign: "center" }}
      >
        <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(100,223,223,0.1)", border: "0.5px solid rgba(100,223,223,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <Bell size={24} color="#64dfdf" strokeWidth={1.5} />
        </div>
        <h3 id="notifprompt-title" style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", margin: "0 0 8px" }}>{t("notifprompt_title", lang)}</h3>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.6)", margin: "0 0 20px" }}>{t("notifprompt_body", lang)}</p>
        <button
          onClick={onYes}
          style={{ width: "100%", padding: "13px 16px", borderRadius: 14, border: "none", background: "#64dfdf", color: "#0d2137", fontFamily: RF, fontWeight: 800, fontSize: 15, cursor: "pointer" }}
        >
          {t("notifprompt_yes", lang)}
        </button>
        <button
          onClick={onLater}
          style={{ width: "100%", padding: "11px 16px", marginTop: 8, borderRadius: 14, border: "none", background: "transparent", color: "rgba(255,255,255,0.45)", fontFamily: RF, fontWeight: 600, fontSize: 14, cursor: "pointer" }}
        >
          {t("notifprompt_later", lang)}
        </button>
      </div>
    </div>
  );
}
