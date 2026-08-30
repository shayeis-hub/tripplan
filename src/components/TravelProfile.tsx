"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/LangContext";

const RF = "'Rubik',sans-serif";
const TEAL = "#64dfdf";
const DARK_BG = "#0d2137";
const W40 = "rgba(255,255,255,0.4)";

type Lang = "he" | "en" | "es";
type L3 = { he: string; en: string; es: string };

interface Question {
  id: string;
  q: L3;
  options: { value: string; label: L3 }[];
}

// Traveler DNA — stable, asked once, applies across every trip. Trip-specific
// preferences (pace, touristy-vs-local, walking-vs-transit, atmosphere,
// group type) live per-trip instead, since they change trip to trip.
const QUESTIONS: Question[] = [
  {
    id: "foodImportance",
    q: { he: "כמה אוכל חשוב בטיול?", en: "How important is food on the trip?", es: "¿Qué tan importante es la comida?" },
    options: [
      { value: "casual", label: { he: "שיהיה טעים", en: "Just tasty", es: "Que sea rico" } },
      { value: "important", label: { he: "חלק משמעותי", en: "A meaningful part", es: "Parte importante" } },
      { value: "central", label: { he: "בונה סביבו טיולים", en: "Plans around meals", es: "Planifica en torno a esto" } },
    ],
  },
  {
    id: "budgetStyle",
    q: { he: "מה חשוב יותר בבחירת מלון?", en: "What matters more when choosing a hotel?", es: "¿Qué importa más al elegir hotel?" },
    options: [
      { value: "budget", label: { he: "מחיר קודם", en: "Price first", es: "Precio primero" } },
      { value: "value", label: { he: "תמורה למחיר", en: "Value for money", es: "Buena relación calidad-precio" } },
      { value: "splurge", label: { he: "מוכן לשלם יותר", en: "Willing to pay more", es: "Dispuesto a pagar más" } },
    ],
  },
  {
    id: "cuisineAdventure",
    q: { he: "עד כמה הרפתקני באוכל?", en: "How adventurous with food?", es: "¿Qué tan aventurero con la comida?" },
    options: [
      { value: "familiar", label: { he: "מוכר ובטוח", en: "Familiar", es: "Familiar" } },
      { value: "mixed", label: { he: "לפעמים", en: "Sometimes", es: "A veces" } },
      { value: "adventurous", label: { he: "אוהב להפתיע", en: "Loves surprises", es: "Le encantan las sorpresas" } },
    ],
  },
  {
    id: "cultureInterest",
    q: { he: "כמה מעניין אתכם תרבות והיסטוריה?", en: "How interested are you in culture & history?", es: "¿Cuánto te interesa la cultura e historia?" },
    options: [
      { value: "low", label: { he: "פחות", en: "Not much", es: "Poco" } },
      { value: "some", label: { he: "קצת", en: "Some", es: "Algo" } },
      { value: "high", label: { he: "מאוד — מוזיאונים ואתרים", en: "A lot — museums & sites", es: "Mucho — museos y sitios" } },
    ],
  },
  {
    id: "accommodationStyle",
    q: { he: "איזה סגנון לינה מתאים לכם?", en: "What accommodation style suits you?", es: "¿Qué estilo de alojamiento prefieres?" },
    options: [
      { value: "simple", label: { he: "פשוט ותכליתי", en: "Simple & functional", es: "Sencillo y funcional" } },
      { value: "comfortable", label: { he: "נוח", en: "Comfortable", es: "Cómodo" } },
      { value: "pampering", label: { he: "מפנק", en: "Pampering", es: "Consentidor" } },
    ],
  },
];

const TITLE: L3 = { he: "פרופיל הטיולים שלי", en: "My Travel Profile", es: "Mi perfil de viaje" };
const SUBTITLE: L3 = {
  he: "כמה שאלות קצרות כדי שההמלצות שלכם ב\"גלה\" יתאימו לטעם שלכם",
  en: "A few quick questions so your recommendations in Discover match your taste",
  es: "Unas preguntas rápidas para que tus recomendaciones en Descubre coincidan con tu gusto",
};
const SUBTITLE_ONBOARDING: L3 = {
  he: "כמה שאלות קצרות שישרתו אתכם בכל טיול — לא רק בזה",
  en: "A few quick questions that carry over to every trip — not just this one",
  es: "Unas preguntas rápidas que se aplican a todos tus viajes, no solo a este",
};
const SAVE: L3 = { he: "שמור", en: "Save", es: "Guardar" };
const SAVED: L3 = { he: "נשמר", en: "Saved", es: "Guardado" };
const CLOSE: L3 = { he: "סגור", en: "Close", es: "Cerrar" };
const SKIP: L3 = { he: "דלג", en: "Skip", es: "Omitir" };
const SAVE_ERROR: L3 = {
  he: "לא הצלחנו לשמור — נסו שוב",
  en: "Couldn't save — please try again",
  es: "No se pudo guardar — inténtalo de nuevo",
};

export default function TravelProfile({ onClose, onboarding, onSaved }: { onClose: () => void; onboarding?: boolean; onSaved?: () => void }) {
  const { lang } = useLang() as { lang: Lang };
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/travel-profile", { headers: { authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.profile) {
          const { userId, createdAt, updatedAt, ...rest } = data.profile;
          setAnswers(rest);
        }
      } catch { /* start blank if this fails — not fatal */ }
      finally { setLoading(false); }
    })();
  }, [user]);

  const pick = (qid: string, value: string) => {
    setAnswers(a => ({ ...a, [qid]: value }));
    setSaved(false);
    setError(false);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    setError(false);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/travel-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify(answers),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSaved(true);
      onSaved?.();
      if (onboarding) setTimeout(onClose, 700); // brief "saved" confirmation, then continue automatically
    } catch { setError(true); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 700, background: DARK_BG, display: "flex", flexDirection: "column" }} dir={lang === "he" ? "rtl" : "ltr"}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: W40, fontFamily: RF, fontSize: 14, cursor: "pointer" }}>
          {(onboarding ? SKIP : CLOSE)[lang]}
        </button>
        <div style={{ fontFamily: RF, color: "#fff", fontSize: 16, fontWeight: 700 }}>{TITLE[lang]}</div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 100px", paddingBottom: "calc(100px + env(safe-area-inset-bottom))", maxWidth: 560, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontFamily: RF, color: W40, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>{(onboarding ? SUBTITLE_ONBOARDING : SUBTITLE)[lang]}</div>

        {loading ? (
          <div style={{ textAlign: "center", color: W40, fontFamily: RF, padding: 40 }}>...</div>
        ) : (
          QUESTIONS.map(question => (
            <div key={question.id} style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: RF, color: "#fff", fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{question.q[lang]}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {question.options.map(opt => {
                  const active = answers[question.id] === opt.value;
                  return (
                    <button key={opt.value} onClick={() => pick(question.id, opt.value)}
                      style={{
                        padding: "9px 16px", borderRadius: 999, fontFamily: RF, fontSize: 13, fontWeight: 600, cursor: "pointer",
                        border: `1.5px solid ${active ? TEAL : "rgba(255,255,255,0.15)"}`,
                        background: active ? "rgba(100,223,223,0.12)" : "rgba(255,255,255,0.04)",
                        color: active ? TEAL : "rgba(255,255,255,0.7)",
                      }}>
                      {opt.label[lang]}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, insetInlineStart: 0, insetInlineEnd: 0, padding: "16px 20px", paddingBottom: "calc(16px + env(safe-area-inset-bottom))", background: DARK_BG, borderTop: "0.5px solid rgba(255,255,255,0.08)" }}>
        {error && (
          <div style={{ maxWidth: 560, margin: "0 auto 10px", textAlign: "center", color: "#ff6b6b", fontFamily: RF, fontSize: 13 }}>
            {SAVE_ERROR[lang]}
          </div>
        )}
        <button onClick={save} disabled={saving || !user}
          style={{ width: "100%", maxWidth: 560, margin: "0 auto", display: "block", padding: 14, borderRadius: 14, border: "none", background: TEAL, color: DARK_BG, fontFamily: RF, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          {saved ? SAVED[lang] : SAVE[lang]}
        </button>
      </div>
    </div>
  );
}
