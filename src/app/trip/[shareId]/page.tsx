"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

const RF = "'Rubik',sans-serif";
const TEAL = "#64dfdf";
const DARK_BG = "#0d2137";
const W35 = "rgba(255,255,255,0.35)";
const W07 = "rgba(255,255,255,0.07)";

const CATS: Record<string, { label: string; icon: string }> = {
  flight:     { label: "טיסה",       icon: "✈️" },
  hotel:      { label: "מלון",       icon: "🏨" },
  attraction: { label: "אטרקציות",   icon: "🎡" },
  food:       { label: "אוכל",       icon: "🍜" },
  taxi:       { label: "מונית",      icon: "🚕" },
  other:      { label: "אחר",        icon: "📦" },
};

const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";

export default function SharePage() {
  const { shareId } = useParams<{ shareId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [tripData, setTripData] = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [imported, setImported]   = useState(false);

  useEffect(() => {
    if (!shareId) return;
    getDoc(doc(db, "publicShares", shareId as string))
      .then(snap => {
        if (!snap.exists()) { setError("הלינק לא קיים או פג תוקפו"); setLoading(false); return; }
        const data = snap.data();
        setTripData(data);
        setSelected(new Set(data.expenses?.map((e: any) => e.id) ?? []));
        setLoading(false);
      })
      .catch(() => { setError("שגיאה בטעינה"); setLoading(false); });
  }, [shareId]);

  const toggleItem = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleImport = async () => {
    if (!user) {
      router.push(`/login?return=/trip/${shareId}`);
      return;
    }
    if (!tripData || selected.size === 0) return;
    setImporting(true);
    try {
      const { setDoc, doc: firestoreDoc, getDoc: firestoreGetDoc } = await import("firebase/firestore");
      const tripId = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const chosenExpenses = tripData.expenses
        .filter((e: any) => selected.has(e.id))
        .map((e: any) => ({ ...e, id: Math.random().toString(36).slice(2), amountILS: 0, amount: 0, currency: "ILS", paid: false }));
      await setDoc(firestoreDoc(db, "trips", tripId), {
        id: tripId,
        destination: tripData.destination,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        defaultCurrency: "ILS",
        currencies: ["ILS", "USD", "EUR"],
        people: [],
        expenses: chosenExpenses,
        activities: {},
        owner: user.uid,
        sharedWith: [],
        updatedAt: Date.now(),
      });
      setImported(true);
      setTimeout(() => router.push("/"), 1800);
    } catch (e) {
      console.error(e);
    }
    setImporting(false);
  };

  const nights = tripData?.startDate && tripData?.endDate
    ? Math.round((new Date(tripData.endDate).getTime() - new Date(tripData.startDate).getTime()) / 86400000) + 1
    : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Rubik',sans-serif;background:${DARK_BG};color:#fff;direction:rtl;}
      `}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", fontFamily: RF }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(160deg,#091928,#0d2137)", padding: "24px 20px 20px", borderBottom: "0.5px solid rgba(100,223,223,0.12)" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6 }}>טיולון</div>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.5px" }}>✨ טיול בהשראה</div>
          <div style={{ fontSize: 12, color: W35, marginTop: 4 }}>בחר מה לקחת לטיול שלך</div>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: W35 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
            <div>טוען...</div>
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#ff6b6b" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>😕</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{error}</div>
          </div>
        )}

        {tripData && !loading && (
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Trip summary */}
            <div style={{ background: "rgba(100,223,223,0.07)", border: "0.5px solid rgba(100,223,223,0.2)", borderRadius: 16, padding: "18px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>🌍 {tripData.destination}</div>
              <div style={{ fontSize: 13, color: W35 }}>
                {fmtDate(tripData.startDate)} – {fmtDate(tripData.endDate)}
                {nights > 0 && ` · ${nights} ימים`}
              </div>
            </div>

            {/* Expense list */}
            <div style={{ background: W07, border: "0.5px solid rgba(100,223,223,0.12)", borderRadius: 16, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>בחר פריטים לייבוא</div>
                <div style={{ fontSize: 12, color: TEAL }}>{selected.size} / {tripData.expenses?.length ?? 0} נבחרו</div>
              </div>

              {tripData.expenses?.length === 0 && (
                <div style={{ textAlign: "center", color: W35, padding: "16px 0", fontSize: 13 }}>אין פריטים לייבוא</div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tripData.expenses?.map((e: any) => {
                  const cat = CATS[e.category] ?? { label: e.category, icon: "📦" };
                  const isSelected = selected.has(e.id);
                  return (
                    <div key={e.id} onClick={() => toggleItem(e.id)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12,
                        background: isSelected ? "rgba(100,223,223,0.08)" : "rgba(255,255,255,0.03)",
                        border: `0.5px solid ${isSelected ? "rgba(100,223,223,0.25)" : "rgba(255,255,255,0.07)"}`,
                        cursor: "pointer", transition: "all 0.15s", opacity: isSelected ? 1 : 0.45 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${isSelected ? TEAL : W35}`,
                        background: isSelected ? TEAL : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {isSelected && <span style={{ color: DARK_BG, fontSize: 13, fontWeight: 900 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 18 }}>{cat.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{e.description || cat.label}</div>
                        {e.date && <div style={{ fontSize: 11, color: W35, marginTop: 2 }}>{fmtDate(e.date)}</div>}
                        {e.address && <div style={{ fontSize: 11, color: W35 }}>📍 {e.address}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Import button */}
            {imported ? (
              <div style={{ textAlign: "center", padding: "16px", background: "rgba(74,222,128,0.1)", border: "0.5px solid rgba(74,222,128,0.3)", borderRadius: 14, color: "#4ade80", fontWeight: 700 }}>
                ✅ הפריטים נוספו לטיולון! מעביר אותך...
              </div>
            ) : (
              <button onClick={handleImport} disabled={importing || selected.size === 0}
                style={{ padding: "16px", borderRadius: 14, border: "none", background: selected.size > 0 ? TEAL : W35,
                  color: DARK_BG, fontFamily: RF, fontWeight: 700, fontSize: 16, cursor: selected.size > 0 ? "pointer" : "default",
                  opacity: importing ? 0.6 : 1 }}>
                {importing ? "⏳ מייבא..." : !user ? "📲 התחבר וייבא לטיול שלי" : `✨ ייבא ${selected.size} פריטים לטיול חדש`}
              </button>
            )}

            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", fontFamily: RF }}>
              הפריטים יתווספו ללא מחירים. תוכל למלא אותם בעצמך.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
