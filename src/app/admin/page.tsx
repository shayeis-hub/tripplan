"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

const ADMIN_EMAIL = "shayeis@gmail.com";
const RF = "'Rubik',sans-serif";
const TEAL = "#64dfdf";
const BG = "#0d2137";

interface DayPoint { date: string; count: number }
interface Stats {
  users: { total: number; today: number; week: number; month: number; activeWeek: number; recent: { email: string; created: string; lastSignIn: string }[] };
  trips: { total: number; expenses: number; totalILS: number; activatedUsers: number; activationRate: number };
  signupsByDay: DayPoint[];
  activeByDay: DayPoint[];
}

// Simple SVG area/line chart in the app palette
function LineChart({ data, color = TEAL, label }: { data: DayPoint[]; color?: string; label: string }) {
  const days = data.slice(-14);
  const W = 640, H = 180, PAD = 24, PB = 22;
  const max = Math.max(1, ...days.map(d => d.count));
  const x = (i: number) => PAD + (i * (W - PAD * 2)) / Math.max(1, days.length - 1);
  const y = (v: number) => (H - PB) - (v / max) * (H - PB - 10);
  const pts = days.map((d, i) => `${x(i)},${y(d.count)}`).join(" ");
  const area = `${x(0)},${H - PB} ${pts} ${x(days.length - 1)},${H - PB}`;
  const gid = "g" + label.replace(/\W/g, "");
  const totalRange = days.reduce((s, d) => s + d.count, 0);
  const fmt = (s: string) => { const dt = new Date(s); return `${dt.getMonth() + 1}/${dt.getDate()}`; };
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: RF }}>{label}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: RF }}>14 ימים · סה״כ {totalRange}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map(f => (
          <line key={f} x1={PAD} x2={W - PAD} y1={y(max * f)} y2={y(max * f)} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        ))}
        <polygon points={area} fill={`url(#${gid})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {days.map((d, i) => d.count > 0 && (
          <circle key={i} cx={x(i)} cy={y(d.count)} r="3" fill={color} />
        ))}
        {days.map((d, i) => (i % 2 === 0) && (
          <text key={i} x={x(i)} y={H - 6} fontSize="10" fill="rgba(255,255,255,0.35)" textAnchor="middle" fontFamily="sans-serif">{fmt(d.date)}</text>
        ))}
        <text x={PAD - 4} y={y(max) + 3} fontSize="10" fill="rgba(255,255,255,0.35)" textAnchor="end" fontFamily="sans-serif">{max}</text>
      </svg>
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

  const refresh = async () => {
    if (!auth.currentUser) return;
    const token = await auth.currentUser.getIdToken(true);
    fetchStats(token);
  };

  useEffect(() => {
    if (authed && idToken) { fetchStats(idToken); }
  }, [authed, idToken]);

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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
              <KPI label="סה״כ משתמשים" value={stats.users.total} />
              <KPI label="פעילים השבוע" value={stats.users.activeWeek ?? "—"} color="#64dfdf" sub="נכנסו ב-7 ימים" />
              <KPI label="נרשמו השבוע" value={stats.users.week} color="#4ade80" />
              <KPI label="הפעילו טיול" value={`${stats.trips.activationRate ?? 0}%`} color="#a78bfa" sub={`${stats.trips.activatedUsers ?? 0} משתמשים`} />
            </div>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginBottom: 28 }}>
              {stats.signupsByDay && <LineChart data={stats.signupsByDay} color="#64dfdf" label="📈 הרשמות חדשות ליום" />}
              {stats.activeByDay && <LineChart data={stats.activeByDay} color="#4ade80" label="🟢 משתמשים פעילים ליום (כניסה אחרונה)" />}
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

            {/* Secondary: trip data (muted) */}
            <div style={{ marginTop: 18, display: "flex", gap: 18, flexWrap: "wrap", fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: RF, padding: "0 4px" }}>
              <span>✈️ טיולים: <b style={{ color: "rgba(255,255,255,0.7)" }}>{stats.trips.total}</b></span>
              <span>🧾 הוצאות: <b style={{ color: "rgba(255,255,255,0.7)" }}>{stats.trips.expenses}</b></span>
              <span>💰 מחזור מנוהל: <b style={{ color: "rgba(255,255,255,0.7)" }}>₪{stats.trips.totalILS.toLocaleString()}</b></span>
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
