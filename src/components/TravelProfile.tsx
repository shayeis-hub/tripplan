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

const QUESTIONS: Question[] = [
  {
    id: "pace",
    q: { he: "איזה קצב מתאים לכם?", en: "What pace suits you?", es: "¿Qué ritmo te conviene?" },
    options: [
      { value: "relaxed", label: { he: "רגוע", en: "Relaxed", es: "Relajado" } },
      { value: "balanced", label: { he: "מאוזן", en: "Balanced", es: "Equilibrado" } },
      { value: "packed", label: { he: "עמוס", en: "Packed", es: "Intenso" } },
    ],
  },
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
    id: "touristyVsLocal",
    q: { he: "תיירותי או מקומי?", en: "Touristy or local?", es: "¿Turístico o local?" },
    options: [
      { value: "touristy", label: { he: "אתרי חובה", en: "Must-see sights", es: "Lugares imperdibles" } },
      { value: "mixed", label: { he: "שילוב", en: "A mix", es: "Una mezcla" } },
      { value: "local", label: { he: "מקומי", en: "Local", es: "Local" } },
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
    id: "walkingVsTransit",
    q: { he: "איך אתם אוהבים להתנייד?", en: "How do you like getting around?", es: "¿Cómo prefieres moverte?" },
    options: [
      { value: "walking", label: { he: "הרבה הליכה", en: "Lots of walking", es: "Mucho a pie" } },
      { value: "mixed", label: { he: "שילוב", en: "A mix", es: "Una mezcla" } },
      { value: "transit", label: { he: "תחבורה/מונית", en: "Transit / taxi", es: "Transporte / taxi" } },
    ],
  },
  {
    id: "atmosphere",
    q: { he: "איזו אווירה אתם מעדיפים?", en: "What atmosphere do you prefer?", es: "¿Qué ambiente prefieres?" },
    options: [
      { value: "quiet", label: { he: "שקטה", en: "Quiet", es: "Tranquilo" } },
      { value: "mixed", label: { he: "לא משנה", en: "No strong preference", es: "Sin preferencia" } },
      { value: "lively", label: { he: "תוססת", en: "Lively", es: "Animado" } },
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
    id: "groupType",
    q: { he: "עם מי אתם בדרך כלל מטיילים?", en: "Who do you usually travel with?", es: "¿Con quién sueles viajar?" },
    options: [
      { value: "family", label: { he: "משפחה", en: "Family", es: "Familia" } },
      { value: "couple", label: { he: "זוגי", en: "Couple", es: "Pareja" } },
      { value: "friends", label: { he: "חברים", en: "Friends", es: "Amigos" } },
      { value: "solo", label: { he: "לבד", en: "Solo", es: "Solo" } },
    ],
  },
];

const TITLE: L3 = { he: "פרופיל הטיולים שלי", en: "My Travel Profile", es: "Mi perfil de viaje" };
const SUBTITLE: L3 = {
  he: "כמה שאלות קצרות כדי שההמלצות שלכם ב\"גלה\" יתאימו לטעם שלכם",
  en: "A few quick questions so your recommendations in Discover match your taste",
  es: "Unas preguntas rápidas para que tus recomendaciones en Descubre coincidan con tu gusto",
};
const SAVE: L3 = { he: "שמור", en: "Save", es: "Guardar" };
const SAVED: L3 = { he: "נשמר", en: "Saved", es: "Guardado" };
const CLOSE: L3 = { he: "סגור", en: "Close", es: "Cerrar" };
const SAVE_ERROR: L3 = {
  he: "לא הצלחנו לשמור — נסו שוב",
  en: "Couldn't save — please try again",
  es: "No se pudo guardar — inténtalo de nuevo",
};

export default function TravelProfile({ onClose }: { onClose: () => void }) {
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
    } catch { setError(true); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 700, background: DARK_BG, display: "flex", flexDirection: "column" }} dir={lang === "he" ? "rtl" : "ltr"}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: W40, fontFamily: RF, fontSize: 14, cursor: "pointer" }}>
          {CLOSE[lang]}
        </button>
        <div style={{ fontFamily: RF, color: "#fff", fontSize: 16, fontWeight: 700 }}>{TITLE[lang]}</div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 100px", maxWidth: 560, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontFamily: RF, color: W40, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>{SUBTITLE[lang]}</div>

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

      <div style={{ position: "fixed", bottom: 0, insetInlineStart: 0, insetInlineEnd: 0, padding: "16px 20px", background: DARK_BG, borderTop: "0.5px solid rgba(255,255,255,0.08)" }}>
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
