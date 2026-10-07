"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

const ADMIN_EMAIL = "shayeis@gmail.com";
const RF = "'Rubik',sans-serif";
const TEAL = "#64dfdf";
const BG = "#0d2137";
const SOURCE_LABELS: Record<string, string> = {
  google_organic: "Google / Organic",
  product_hunt: "Product Hunt",
  alternativeto: "AlternativeTo",
  direct: "Direct",
  other: "Other / Referral",
};
// Number ranges are isolated left-to-right so "0–30" and "91+" don't get
// visually reversed inside the RTL page.
const PHASE_LABELS: Record<string, React.ReactNode> = {
  past: "עברו",
  now: "מתרחשים עכשיו",
  future30: <><bdi dir="ltr">0–30</bdi> ימים</>,
  future90: <><bdi dir="ltr">31–90</bdi> ימים</>,
  future91: <><bdi dir="ltr">91+</bdi> ימים</>,
  unknown: "תאריכים לא ברורים",
};
const FUNNEL_LABELS: Record<string, string> = {
  registered: "נרשמו",
  trip: "יצרו או הצטרפו לטיול",
  content: "הוסיפו תוכן משמעותי לטיול",
  participant: "הוסיפו משתתף נוסף",
  expense: "הוסיפו הוצאה",
};

interface DayPoint { date: string; count: number }
interface Pct { count: number; pct: number }
interface Usage { ownedTrips: number; joinedTrips: number; itineraryItems: number; expenses: number }
interface Stats {
  users: { total: number; today: number; week: number; month: number; activeWeek: number; recent: { email: string; created: string; lastSignIn: string; lastActive?: string | null; usage?: Usage }[] };
  product?: {
    registered: number; tripsCreated: number; emptyDrafts: number;
    tripCreators: Pct; joinedTravelers: Pct; groupTrips: Pct; expenseUsers: Pct;
    funnel: { key: string; count: number; pct: number; fromPrev: number | null }[];
    lifecycle: {
      today: string; total: number;
      groups: { key: string; trips: number; withContent: number; withoutContent: number; pct: number | null }[];
      futureTotal: { trips: number; withContent: number; pct: number | null };
      upcoming: { withContent: number; total: number; pct: number | null };
      noContent: { total: number; byPhase: { key: string; count: number }[] };
    };
  };
  acquisition?: { total: number; groups: { key: string; count: number; creators: number }[]; campaigns: { name: string; count: number }[] };
  trips: { total: number; expenses: number; totalILS: number; activatedUsers: number; activationRate: number };
  signupsByDay: DayPoint[];
  activeByDay: DayPoint[];
}

// Simple SVG area/line chart in the app palette
function LineChart({ data, color = TEAL, label }: { data: DayPoint[]; color?: string; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
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
  const hd = hover != null ? days[hover] : null;
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: RF }}>{label}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: RF }}>14 ימים · סה״כ {totalRange}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: "block", overflow: "visible" }}>
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
        {hover != null && (
          <line x1={x(hover)} x2={x(hover)} y1={10} y2={H - PB} stroke={color} strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
        )}
        {days.map((d, i) => d.count > 0 && (
          <circle key={i} cx={x(i)} cy={y(d.count)} r={hover === i ? 5 : 3} fill={color} style={{ transition: "r 0.1s" }} />
        ))}
        {/* Invisible wide hit-targets for hover, one per day */}
        {days.map((d, i) => (
          <rect key={i} x={x(i) - (W / days.length) / 2} y={0} width={W / days.length} height={H}
            fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(h => h === i ? null : h)} />
        ))}
        {days.map((d, i) => (i % 2 === 0) && (
          <text key={i} x={x(i)} y={H - 6} fontSize="10" fill="rgba(255,255,255,0.35)" textAnchor="middle" fontFamily="sans-serif">{fmt(d.date)}</text>
        ))}
        <text x={PAD - 4} y={y(max) + 3} fontSize="10" fill="rgba(255,255,255,0.35)" textAnchor="end" fontFamily="sans-serif">{max}</text>
        {hd && (()=>{
          const tw = 74, th = 34;
          const cx = Math.min(Math.max(x(hover as number), PAD + tw / 2), W - PAD - tw / 2);
          const cy = Math.max(y(hd.count) - th - 10, 4);
          return (
            <g pointerEvents="none">
              <rect x={cx - tw / 2} y={cy} width={tw} height={th} rx={8} fill="#0d2137" stroke={color} strokeWidth="1" />
              <text x={cx} y={cy + 15} fontSize="12" fontWeight={800} fill="#fff" textAnchor="middle" fontFamily="sans-serif">{hd.count}</text>
              <text x={cx} y={cy + 27} fontSize="9" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="sans-serif">{fmt(hd.date)}</text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

function KPI({ label, value, sub, color = TEAL, hint }: { label: string; value: string | number; sub?: string; color?: string; hint?: string }) {
  return (
    <div title={hint} style={{ background: "rgba(255,255,255,0.05)", border: `0.5px solid ${color}40`, borderRadius: 16, padding: "20px 24px", borderTop: `3px solid ${color}` }}>
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

  // fresh=true skips the server-side cache (Refresh button); the first load
  // after login may be served from a few-minutes-old cache to save reads.
  const fetchStats = async (token: string, fresh = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stats${fresh ? "?fresh=1" : ""}`, { headers: { authorization: `Bearer ${token}` } });
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
    fetchStats(token, true);
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
        <div style={{ display: "flex", gap: 10 }}>
          <a href="/admin/instagram" style={{ padding: "10px 20px", borderRadius: 10, border: `0.5px solid ${TEAL}40`, background: "rgba(100,223,223,0.08)", color: TEAL, fontWeight: 700, fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center" }}>
            Instagram
          </a>
          <button onClick={refresh} disabled={loading}
            style={{ padding: "10px 20px", borderRadius: 10, border: `0.5px solid ${TEAL}40`, background: "rgba(100,223,223,0.08)", color: TEAL, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: RF }}>
            {loading ? "⏳ טוען..." : "🔄 רענן"}
          </button>
        </div>
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

            {/* Product usage KPIs + activation funnel */}
            {stats.product && (() => {
              const p = stats.product;
              return (
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>שימוש במוצר</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
                    <KPI label="טיולים שנוצרו" value={p.tripsCreated} color="#64dfdf"
                      sub={p.emptyDrafts > 0 ? `ללא ${p.emptyDrafts} טיוטות ריקות` : "טיולים אמיתיים"}
                      hint="טיולים של משתמשים רשומים עם יעד ותאריכים תקינים, או עם פריט מסלול או הוצאה. יעד בלבד לא נספר, כי הוא נשמר כבר בהקלדת האות הראשונה באשף." />
                    <KPI label="יוצרי טיולים" value={p.tripCreators.count} color="#a78bfa"
                      sub={`${p.tripCreators.pct}% מהרשומים`}
                      hint="משתמשים שהם הבעלים של לפחות טיול אמיתי אחד." />
                    <KPI label="מצטרפים לטיול" value={p.joinedTravelers.count} color="#4ade80"
                      sub={`${p.joinedTravelers.pct}% מהרשומים`}
                      hint="משתמשים שהמייל שלהם ברשימת השיתוף של טיול אמיתי שבבעלות משתמש אחר. כולל הוספה במייל וצפייה בלבד, כי הנתונים לא מבדילים." />
                    <KPI label="טיולים קבוצתיים" value={p.groupTrips.count} color="#fbbf24"
                      sub={`${p.groupTrips.pct}% מהטיולים`}
                      hint="טיול אמיתי עם לפחות 2 נוסעים ברשימת הנוסעים, או לפחות חשבון נוסף אחד עם גישה." />
                    <KPI label="משתמשי הוצאות" value={p.expenseUsers.count} color="#f472b6"
                      sub={`${p.expenseUsers.pct}% מהרשומים`}
                      hint="בעלי טיול אמיתי עם לפחות הוצאה אחת (כולל טיסות ומלונות, שנשמרים כהוצאות). הוצאות של חברים בטיול של אחר לא נספרות, כי להוצאה אין מזהה כותב." />
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>משפך הפעלה</div>
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "18px 20px", marginBottom: 28 }}>
                    {p.funnel.map((s, i) => (
                      <div key={s.key} style={{ marginBottom: i < p.funnel.length - 1 ? 14 : 0 }}>
                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6, gap: 12 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{FUNNEL_LABELS[s.key]}</div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>
                            <b style={{ color: "#fff", fontSize: 14 }}>{s.count}</b> · {s.pct}% מהרשומים
                            {s.fromPrev != null && <span style={{ color: TEAL }}> · {s.fromPrev}% מהשלב הקודם</span>}
                          </div>
                        </div>
                        <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                          <div style={{ width: `${Math.max(s.pct, s.count > 0 ? 1.5 : 0)}%`, height: "100%", borderRadius: 4, background: TEAL, opacity: 1 - i * 0.14 }} />
                        </div>
                      </div>
                    ))}
                    {/* Context only: the funnel stages above are unchanged */}
                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: "0.5px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", marginBottom: 8 }}>
                        טיולים ללא תוכן משמעותי, לפי מועד יציאה <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>· סה״כ {p.lifecycle.noContent.total}</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {["future30", "future90", "future91", "now", "past", "unknown"]
                          .map(k => p.lifecycle.noContent.byPhase.find(x => x.key === k)!)
                          .filter(x => x && (x.count > 0 || x.key !== "unknown"))
                          .map(x => (
                          <span key={x.key} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 10, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
                            {PHASE_LABELS[x.key]}: <b style={{ color: "#fff" }}>{x.count}</b>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginTop: 14, fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
                      כל שלב הוא תת-קבוצה של הקודם. תוכן משמעותי = פריט במסלול, טיסה או מלון. משתתף נוסף = נוסע נוסף ברשימה או חשבון נוסף בטיול. הוסיפו הוצאה = הוצאה בטיול שבבעלותם. מצטרפים לטיול נספרים בשלב 2 בלבד, כי לתוכן ולהוצאות אין מזהה כותב.
                    </div>
                  </div>

                  {/* Trip lifecycle: timing of created trips relative to today */}
                  <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>מחזור חיי הטיולים</div>
                  {(() => {
                    const lc = p.lifecycle;
                    const up = lc.upcoming;
                    const row = (key: string, label: React.ReactNode, trips: number, withContent: number, pct: number | null, indent = false, bold = false) => (
                      <div key={key} style={{ padding: "10px 0", borderBottom: "0.5px solid rgba(255,255,255,0.05)", paddingInlineStart: indent ? 16 : 0 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1.5fr 0.7fr", gap: 8, alignItems: "baseline", fontSize: 12 }}>
                          <div style={{ fontSize: 13, fontWeight: bold ? 700 : 500, color: indent ? "rgba(255,255,255,0.75)" : "#fff" }}>{label}</div>
                          <div style={{ color: "rgba(255,255,255,0.55)" }}><b style={{ color: "#fff", fontSize: 14 }}>{trips}</b> טיולים</div>
                          <div style={{ color: "rgba(255,255,255,0.55)" }}><b style={{ color: "#fff", fontSize: 14 }}>{withContent}</b> עם תוכן משמעותי</div>
                          <div style={{ color: TEAL, fontWeight: 700, textAlign: "end" }}>{pct == null ? "—" : `${pct}%`}</div>
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginTop: 6 }}>
                          <div style={{ width: `${pct ?? 0}%`, height: "100%", background: TEAL, opacity: indent ? 0.6 : 1 }} />
                        </div>
                      </div>
                    );
                    const g = Object.fromEntries(lc.groups.map(x => [x.key, x]));
                    return (
                      <>
                        <div style={{ display: "grid", gridTemplateColumns: "minmax(150px,230px) 1fr", gap: 12, marginBottom: 12, alignItems: "stretch" }}>
                          <KPI label="טיולים קרובים עם תוכן"
                            value={up.total > 0 ? `${up.withContent} מתוך ${up.total}` : "—"}
                            sub={up.total > 0 ? `${up.pct}%` : "אין טיולים שיוצאים ב-30 הימים הקרובים"}
                            color="#4ade80"
                            hint="מבין הטיולים שנוצרו ויוצאים בעוד 1 עד 30 ימים, כמה כבר כוללים תוכן משמעותי (פריט במסלול, טיסה או מלון)." />
                          <div style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 20px", fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, display: "flex", alignItems: "center" }}>
                            טיולים שנוצרו ויוצאים ב-30 הימים הקרובים, והאחוז מהם שכבר כולל פריט במסלול, טיסה או מלון. המספרים מתארים את המצב כרגע, ולא מסווגים טיולים כנטושים או כלא מוכנים.
                          </div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "6px 20px 16px", marginBottom: 28 }}>
                          {row("past", PHASE_LABELS.past, g.past.trips, g.past.withContent, g.past.pct)}
                          {row("now", PHASE_LABELS.now, g.now.trips, g.now.withContent, g.now.pct)}
                          {row("future", "עתידיים", lc.futureTotal.trips, lc.futureTotal.withContent, lc.futureTotal.pct, false, true)}
                          {["future30", "future90", "future91"].map(k => row(k, PHASE_LABELS[k], g[k].trips, g[k].withContent, g[k].pct, true))}
                          {row("unknown", PHASE_LABELS.unknown, g.unknown.trips, g.unknown.withContent, g.unknown.pct)}
                          <div style={{ marginTop: 12, fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
                            {lc.total} טיולים שנוצרו, מסווגים לפי תאריך {lc.today} (שעון ישראל). תאריך הסיום נכלל, ויציאה היום נספרת תחת מתרחשים עכשיו. <bdi dir="ltr">0–30</bdi> ימים = יציאה בעוד 1 עד 30 ימים. תאריכים לא ברורים = חסרים, לא תקינים, או סיום לפני התחלה. תוכן משמעותי = פריט במסלול, טיסה או מלון.
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </>
              );
            })()}

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginBottom: 28 }}>
              {stats.signupsByDay && <LineChart data={stats.signupsByDay} color="#64dfdf" label="📈 הרשמות חדשות ליום" />}
              {stats.activeByDay && <LineChart data={stats.activeByDay} color="#4ade80" label="🟢 משתמשים פעילים ליום (כניסה אחרונה)" />}
            </div>

            {/* Acquisition: appears only once real source data exists */}
            {stats.acquisition && stats.acquisition.total > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>מקורות הרשמה</div>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "18px 20px", marginBottom: 28 }}>
                  {stats.acquisition.groups.map((g, i, arr) => {
                    const share = Math.round((g.count / stats.acquisition!.total) * 1000) / 10;
                    return (
                      <div key={g.key} style={{ marginBottom: i < arr.length - 1 ? 12 : 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5, gap: 12 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{SOURCE_LABELS[g.key]}</div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>
                            <b style={{ color: "#fff", fontSize: 14 }}>{g.count}</b> · {share}%
                            <span style={{ color: "#a78bfa" }}> · {g.creators} פתחו טיול</span>
                          </div>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                          <div style={{ width: `${share}%`, height: "100%", background: TEAL, borderRadius: 3 }} />
                        </div>
                      </div>
                    );
                  })}
                  {stats.acquisition.campaigns.length > 0 && (
                    <div style={{ marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                      קמפיינים: {stats.acquisition.campaigns.map(c => `${c.name} (${c.count})`).join(" · ")}
                    </div>
                  )}
                  <div style={{ marginTop: 12, fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
                    {stats.acquisition.total} נרשמים חדשים מאז הפעלת המעקב. מקור ההרשמה הראשון בלבד, ללא נתונים רטרואקטיביים.
                  </div>
                </div>
              </>
            )}

            {/* Recent users */}
            <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>🆕 משתמשים אחרונים</div>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
              {stats.users.recent.map((u, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: i < stats.users.recent.length - 1 ? "0.5px solid rgba(255,255,255,0.06)" : "none" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{u.email}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>נרשם: {new Date(u.created).toLocaleDateString("he-IL")}</div>
                    {u.usage && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                        {[
                          u.usage.ownedTrips > 0 ? "יצר טיול" : u.usage.joinedTrips > 0 ? "הצטרף לטיול" : "ללא טיול",
                          `טיולים: ${u.usage.ownedTrips + u.usage.joinedTrips}`,
                          `פריטי מסלול: ${u.usage.itineraryItems}`,
                          `הוצאות: ${u.usage.expenses}`,
                        ].map((c, k) => (
                          <span key={k} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: k === 0 ? "rgba(100,223,223,0.12)" : "rgba(255,255,255,0.06)", color: k === 0 ? TEAL : "rgba(255,255,255,0.5)" }}>{c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                    פעיל לאחרונה: {(u.lastActive || u.lastSignIn) ? new Date((u.lastActive || u.lastSignIn) as string).toLocaleDateString("he-IL") : "—"}
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
