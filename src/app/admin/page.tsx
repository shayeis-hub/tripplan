"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const ADMIN_EMAIL = "shayeis@gmail.com";
const RF = "'Rubik',sans-serif";
const TEAL = "#64dfdf";
const BG = "#0d2137";

interface Stats {
  users: { total: number; today: number; week: number; month: number; recent: { email: string; created: string; lastSignIn: string }[] };
  trips: { total: number; expenses: number; totalILS: number };
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
  const [secret, setSecret]   = useState("");

  const login = async () => {
    try {
      const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, pass);
      if (cred.user.email !== ADMIN_EMAIL) throw new Error("Not admin");
      setAuthed(true);
      setErr("");
    } catch { setErr("סיסמה שגויה"); }
  };

  const fetchStats = async (s: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats", { headers: { authorization: `Bearer ${s}` } });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStats(data);
    } catch (e: any) {
      setErr(e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (authed && secret) fetchStats(secret);
  }, [authed, secret]);

  if (!authed) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: RF }}>
      <div style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(100,223,223,0.2)", borderRadius: 24, padding: "40px 32px", width: 360 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 6 }}>🛡️ Admin</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>טיולון Dashboard</div>
        <input type="password" placeholder="סיסמת Firebase" value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "0.5px solid rgba(100,223,223,0.2)", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 15, marginBottom: 8, fontFamily: RF, outline: "none" }} />
        <input type="text" placeholder="CRON_SECRET" value={secret}
          onChange={e => setSecret(e.target.value)}
          style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "0.5px solid rgba(100,223,223,0.2)", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 15, marginBottom: 12, fontFamily: RF, outline: "none" }} />
        {err && <div style={{ color: "#ff6b6b", fontSize: 13, marginBottom: 10 }}>{err}</div>}
        <button onClick={login} style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: TEAL, color: BG, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: RF }}>
          כניסה
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
        <button onClick={() => fetchStats(secret)} disabled={loading}
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
