"use client";
import { useState, useEffect, useCallback } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

const ADMIN_EMAIL = "shayeis@gmail.com";
const RF = "'Rubik',sans-serif";
const TEAL = "#64dfdf";
const BG = "#0d2137";

interface Stats {
  users: { total: number; today: number; week: number; month: number; recent: { email: string; created: string; lastSignIn: string }[] };
  trips: { total: number; expenses: number; totalILS: number };
}

interface Partner {
  code: string;
  name: string;
  contact: string;
  platform: string;
  commission: number | null;
  notes: string;
  active: boolean;
  createdAt: number;
  clicks: number;
  lastClick: number;
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 5 }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "0.5px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 13, fontFamily: RF, outline: "none", boxSizing: "border-box" }}/>
    </div>
  );
}

function KPI({ label, value, sub, color = TEAL }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.05)", border: `0.5px solid ${color}40`, borderRadius: 16, padding: "20px 24px", borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 32, fontWeight: 900, color, fontFamily: RF }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginTop: 4, fontFamily: RF }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2, fontFamily: RF }}>{sub}</div>}
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed]   = useState(false);
  const [pass, setPass]       = useState("");
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const [idToken, setIdToken] = useState("");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [pName, setPName]         = useState("");
  const [pCode, setPCode]         = useState("");
  const [pContact, setPContact]   = useState("");
  const [pPlatform, setPPlatform] = useState("");
  const [pCommission, setPCommission] = useState("");
  const [pNotes, setPNotes]       = useState("");
  const [pSaving, setPSaving]     = useState(false);
  const [pErr, setPErr]           = useState("");

  const login = async () => {
    try {
      const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, pass);
      if (cred.user.email !== ADMIN_EMAIL) throw new Error("Not admin");
      const token = await cred.user.getIdToken();
      setIdToken(token);
      setAuthed(true);
      setErr("");
    } catch { setErr("סיסמה שגויה"); }
  };

  const resetPass = async () => {
    try {
      await sendPasswordResetEmail(auth, ADMIN_EMAIL);
      setErr(`📧 נשלח מייל איפוס ל-${ADMIN_EMAIL}`);
    } catch (e: any) {
      setErr(`שגיאה: ${e?.code || "unknown"}`);
    }
  };

  const fetchStats = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats", { headers: { authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStats(data);
    } catch (e: any) {
      setErr(e.message);
    } finally { setLoading(false); }
  };

  const fetchPartners = useCallback(async (token: string) => {
    try {
      const res = await fetch("/api/admin/partners", { headers: { authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPartners(data.partners || []);
    } catch (e: any) { setErr(e.message); }
  }, []);

  const refresh = async () => {
    if (!auth.currentUser) return;
    const token = await auth.currentUser.getIdToken(true);
    fetchStats(token);
    fetchPartners(token);
  };

  const addPartner = async () => {
    if (!pName.trim() || !auth.currentUser) return;
    setPSaving(true); setPErr("");
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: pName, code: pCode || undefined, contact: pContact,
          platform: pPlatform, notes: pNotes,
          commission: pCommission ? Number(pCommission) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setPName(""); setPCode(""); setPContact(""); setPPlatform(""); setPCommission(""); setPNotes("");
      setShowAddPartner(false);
      await fetchPartners(token);
    } catch (e: any) { setPErr(e.message); }
    finally { setPSaving(false); }
  };

  const togglePartner = async (code: string, active: boolean) => {
    if (!auth.currentUser) return;
    const token = await auth.currentUser.getIdToken();
    await fetch(`/api/admin/partners/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ active }),
    });
    fetchPartners(token);
  };

  const deletePartner = async (code: string) => {
    if (!auth.currentUser) return;
    if (!confirm(`למחוק את הקוד ${code}? (לא ימחק את הקליקים ההיסטוריים)`)) return;
    const token = await auth.currentUser.getIdToken();
    await fetch(`/api/admin/partners/${code}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    });
    fetchPartners(token);
  };

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`https://tulon.app/?ref=${code}`);
  };

  useEffect(() => {
    if (authed && idToken) { fetchStats(idToken); fetchPartners(idToken); }
  }, [authed, idToken, fetchPartners]);

  if (!authed) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: RF }}>
      <div style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(100,223,223,0.2)", borderRadius: 24, padding: "40px 32px", width: 360 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 6, textAlign: "center" }}>🛡️ Admin</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24, textAlign: "center" }}>טיולון Dashboard</div>
        <input type="password" placeholder="סיסמת Firebase" value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "0.5px solid rgba(100,223,223,0.2)", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 15, marginBottom: 12, fontFamily: RF, outline: "none", boxSizing: "border-box" }} />
        {err && <div style={{ color: "#ff6b6b", fontSize: 13, marginBottom: 10 }}>{err}</div>}
        <button onClick={login} style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: TEAL, color: BG, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: RF }}>
          כניסה
        </button>
        <button onClick={resetPass} style={{ width: "100%", padding: 10, marginTop: 10, borderRadius: 12, border: "0.5px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 500, fontSize: 12, cursor: "pointer", fontFamily: RF }}>
          🔑 שכחתי סיסמה — שלח מייל איפוס
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: RF, color: "#fff" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#091928,#0d2137)", padding: "24px 32px", borderBottom: "0.5px solid rgba(100,223,223,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900 }}>🛡️ טיולון Admin</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Dashboard</div>
        </div>
        <button onClick={refresh} disabled={loading}
          style={{ padding: "10px 20px", borderRadius: 10, border: `0.5px solid ${TEAL}40`, background: "rgba(100,223,223,0.08)", color: TEAL, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: RF }}>
          {loading ? "⏳ טוען..." : "🔄 רענן"}
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        {loading && !stats && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.4)", fontSize: 16 }}>⏳ טוען נתונים...</div>
        )}

        {err && <div style={{ background: "rgba(255,107,107,0.1)", border: "0.5px solid rgba(255,107,107,0.3)", borderRadius: 12, padding: "12px 16px", color: "#ff6b6b", marginBottom: 24 }}>שגיאה: {err}</div>}

        {stats && (
          <>
            {/* Users KPIs */}
            <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>👥 משתמשים</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
              <KPI label="סה״כ משתמשים" value={stats.users.total} />
              <KPI label="הצטרפו היום" value={stats.users.today} color="#4ade80" />
              <KPI label="השבוע" value={stats.users.week} color="#4ade80" />
              <KPI label="החודש" value={stats.users.month} color="#4ade80" />
            </div>

            {/* Trips KPIs */}
            <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>✈️ טיולים</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
              <KPI label="סה״כ טיולים" value={stats.trips.total} color="#a78bfa" />
              <KPI label="סה״כ הוצאות" value={stats.trips.expenses} color="#a78bfa" />
              <KPI label="סכום כולל בש״ח" value={`₪${stats.trips.totalILS.toLocaleString()}`} color="#fbbf24" />
            </div>

            {/* Recent users */}
            <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>🆕 משתמשים אחרונים</div>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
              {stats.users.recent.map((u, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: i < stats.users.recent.length - 1 ? "0.5px solid rgba(255,255,255,0.06)" : "none" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{u.email}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>נרשם: {new Date(u.created).toLocaleDateString("he-IL")}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                    התחבר לאחרונה: {u.lastSignIn ? new Date(u.lastSignIn).toLocaleDateString("he-IL") : "—"}
                  </div>
                </div>
              ))}
            </div>

            {/* Partners */}
            <div style={{ marginTop: 32, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: 1 }}>🤝 שותפים</div>
              <button onClick={() => setShowAddPartner(s => !s)}
                style={{ padding: "8px 16px", borderRadius: 10, border: `0.5px solid ${TEAL}40`, background: "rgba(100,223,223,0.08)", color: TEAL, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: RF }}>
                {showAddPartner ? "× סגור" : "+ הוסף שותף"}
              </button>
            </div>

            {showAddPartner && (
              <div style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(100,223,223,0.2)", borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <Input label="שם השותף *" value={pName} onChange={setPName}/>
                  <Input label="קוד (אם ריק יווצר אוטומטית)" value={pCode} onChange={setPCode} placeholder="dana23"/>
                  <Input label="פלטפורמה" value={pPlatform} onChange={setPPlatform} placeholder="Instagram"/>
                  <Input label="פרטי קשר" value={pContact} onChange={setPContact} placeholder="email / phone"/>
                  <Input label="אחוז עמלה" value={pCommission} onChange={setPCommission} placeholder="30"/>
                  <Input label="הערות" value={pNotes} onChange={setPNotes}/>
                </div>
                {pErr && <div style={{ color: "#ff6b6b", fontSize: 12, marginBottom: 10 }}>{pErr}</div>}
                <button onClick={addPartner} disabled={pSaving || !pName.trim()}
                  style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: pSaving ? "rgba(100,223,223,0.4)" : TEAL, color: BG, fontWeight: 800, fontSize: 13, cursor: pSaving ? "default" : "pointer", fontFamily: RF }}>
                  {pSaving ? "שומר..." : "צור שותף"}
                </button>
              </div>
            )}

            <div style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden", marginBottom: 28 }}>
              {partners.length === 0 ? (
                <div style={{ padding: "32px 20px", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
                  אין שותפים עדיין. לחץ "הוסף שותף" כדי להתחיל.
                </div>
              ) : partners.map((p, i) => (
                <div key={p.code} style={{ padding: "14px 20px", borderBottom: i < partners.length - 1 ? "0.5px solid rgba(255,255,255,0.06)" : "none", display: "grid", gridTemplateColumns: "auto 1fr auto auto auto auto", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.active ? "#4ade80" : "rgba(255,255,255,0.2)" }}/>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <code style={{ fontSize: 13, fontWeight: 800, color: TEAL, fontFamily: "monospace" }}>{p.code}</code>
                      <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{p.name}</span>
                      {p.commission != null && <span style={{ fontSize: 11, color: "#fbbf24", fontWeight: 700 }}>{p.commission}%</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                      {p.platform || "—"}{p.contact ? ` · ${p.contact}` : ""}
                      {p.lastClick > 0 && ` · קליק אחרון: ${new Date(p.lastClick).toLocaleDateString("he-IL")}`}
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: p.clicks > 0 ? TEAL : "rgba(255,255,255,0.3)" }}>{p.clicks}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>קליקים</div>
                  </div>
                  <button onClick={() => copyLink(p.code)} title="העתק קישור"
                    style={{ padding: "6px 10px", borderRadius: 8, border: "0.5px solid rgba(100,223,223,0.25)", background: "rgba(100,223,223,0.06)", color: TEAL, fontSize: 11, cursor: "pointer", fontFamily: RF }}>
                    📋 העתק
                  </button>
                  <button onClick={() => togglePartner(p.code, !p.active)} title={p.active ? "השבת" : "הפעל"}
                    style={{ padding: "6px 10px", borderRadius: 8, border: `0.5px solid ${p.active ? "rgba(255,255,255,0.15)" : "rgba(74,222,128,0.3)"}`, background: "rgba(255,255,255,0.03)", color: p.active ? "rgba(255,255,255,0.55)" : "#4ade80", fontSize: 11, cursor: "pointer", fontFamily: RF }}>
                    {p.active ? "השבת" : "הפעל"}
                  </button>
                  <button onClick={() => deletePartner(p.code)} title="מחק"
                    style={{ padding: "6px 9px", borderRadius: 8, border: "0.5px solid rgba(255,107,107,0.25)", background: "rgba(255,107,107,0.05)", color: "#ff6b6b", fontSize: 11, cursor: "pointer", fontFamily: RF }}>
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {/* Sentry link */}
            <div style={{ marginTop: 28, background: "rgba(100,223,223,0.05)", border: "0.5px solid rgba(100,223,223,0.2)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>🐛 ניטור שגיאות</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Sentry — לחץ לצפייה בשגיאות האחרונות</div>
              </div>
              <a href="https://tulon.sentry.io" target="_blank" rel="noopener noreferrer"
                style={{ padding: "10px 20px", borderRadius: 10, background: TEAL, color: BG, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                פתח Sentry →
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
