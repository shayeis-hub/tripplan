"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Admin-only view of the e-mails TUlon has sent. The server enforces the admin
// check on every call (see /api/admin/email); this page only shows what it says.

const ADMIN_EMAIL = "shayeis@gmail.com";
const TEAL = "#64dfdf";

type RecentEvent = {
  flow: string; status: string; lang: string; variant: string | null; skipReason: string | null;
  createdAt: number; sentAt: number | null; deliveredAt: number | null; firstClickAt: number | null;
  clickCount: number; bouncedAt: number | null; complainedAt: number | null; errorName: string | null;
};
type Report = {
  recent?: RecentEvent[];
  config?: { mode?: string };
  annualConfig?: { mode?: string };
  verifyConfig?: { mode?: string };
  welcome?: { sent: number; delivered: number; clicked: number; bounced: number; complained: number; createdTrip7d: number };
};

const fmt = (ms: number | null) =>
  ms ? new Date(ms).toLocaleString("he-IL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) : "-";

const LANG: Record<string, string> = { he: "עברית", en: "English", es: "Español" };
const STATUS_COLOR: Record<string, string> = { sent: "#4ade80", failed: "#ff6b6b", unknown: "#fbbf24", skipped: "rgba(255,255,255,0.45)", held_out: "#fbbf24", reserved: "#fbbf24" };

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ flex: "1 1 130px", background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(100,223,223,0.18)", borderRadius: 14, padding: "14px 16px" }}>
      <div style={{ fontSize: 26, fontWeight: 900, color: TEAL }}>{value}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

const th: React.CSSProperties = { textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "13px 16px", fontSize: 13, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" };

export default function AdminEmailPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [report, setReport] = useState<Report | null>(null);
  const [showTests, setShowTests] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const call = async (method: "GET" | "POST", body?: unknown) => {
    if (!auth.currentUser) return null;
    setBusy(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/admin/email", {
        method,
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      return await res.json().catch(() => null);
    } finally {
      setBusy(false);
    }
  };

  const load = async () => {
    const r = await call("GET");
    if (r) setReport(r as Report);
  };
  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Kill switch only: turning it ON is done deliberately by the owner.
  const turnOff = async () => {
    if (!window.confirm("Stop sending the welcome e-mail to new users?")) return;
    await call("POST", { action: "config", mode: "off", allowlist: [], eligibleSince: "now", controlPct: 0 });
    await load();
  };

  // Yearly "My World" summary ("2026 in the world"): off unless turned on here. The cron only sends Dec 17-31.
  const [notice, setNotice] = useState<string>("");
  const [testLang, setTestLang] = useState<"he" | "en" | "es">("he");
  const welcomeTest = async () => {
    const r = await call("POST", { action: "test", lang: testLang });
    setNotice(r?.ok ? "Welcome test sent to your address" : `Welcome test failed: ${r?.error ?? r?.result?.status ?? "unknown"}`);
    await load();
  };
  const annualTest = async () => {
    const r = await call("POST", { action: "annual_test", lang: testLang });
    setNotice(r?.ok ? "Yearly summary test sent to your address" : `Test failed: ${r?.error ?? r?.result?.status ?? "unknown"}`);
    await load();
  };
  const annualDry = async () => {
    const r = await call("POST", { action: "annual_dryrun" });
    setNotice(r?.ok ? `Yearly summary dry run: ${r.candidates} users with a visit this year, ${r.eligible} would receive it. Skipped: ${JSON.stringify(r.reasons)}` : "Dry run failed");
  };
  const annualSet = async (mode: "all" | "off") => {
    if (!window.confirm(mode === "all" ? "Turn ON the yearly summary e-mail? It is sent daily from Dec 17 to Dec 31." : "Turn OFF the yearly summary e-mail?")) return;
    await call("POST", { action: "annual_config", mode, allowlist: [] });
    await load();
  };

  const verifyTest = async () => {
    const r = await call("POST", { action: "verify_test", lang: testLang });
    setNotice(r?.ok ? "Verification test sent to your address" : `Test failed: ${r?.error ?? r?.result?.reason ?? r?.result?.status ?? "unknown"}`);
    await load();
  };
  const verifySet = async (mode: "all" | "off") => {
    if (!window.confirm(mode === "all" ? "Turn ON the verification e-mail for new e-mail/password sign-ups?" : "Turn OFF the verification e-mail?")) return;
    await call("POST", { action: "verify_config", mode });
    await load();
  };

  const wrap: React.CSSProperties = { minHeight: "100vh", background: "#0d2137", color: "#fff", fontFamily: "'Rubik',sans-serif", direction: "ltr" };
  if (user === undefined) return <div style={{ ...wrap, padding: 24 }}>...</div>;
  if (!user || user.email !== ADMIN_EMAIL) {
    return <div style={{ ...wrap, padding: 24 }}>Sign in to TUlon as the admin account in this browser, then reload this page.</div>;
  }

  const w = report?.welcome;
  const mode = report?.config?.mode ?? "off";
  const annualMode = report?.annualConfig?.mode ?? "off";
  const verifyMode = report?.verifyConfig?.mode ?? "off";
  const linkBtn: React.CSSProperties = { background: "none", border: 0, color: TEAL, fontSize: 12, cursor: "pointer", padding: 0, textDecoration: "underline" };
  const kinds = [
    { name: "Welcome", on: mode !== "off", onText: mode === "all" ? "Sent to each new Google/Apple sign-up." : "Test mode.", test: welcomeTest, toggle: turnOff, canTurnOn: false, dry: null as null | (() => void) },
    { name: "Address verification", on: verifyMode !== "off", onText: "Sent once to each new e-mail/password sign-up.", test: verifyTest, toggle: () => verifySet(verifyMode === "off" ? "all" : "off"), canTurnOn: true, dry: null as null | (() => void) },
    { name: "Yearly summary", on: annualMode !== "off", onText: "Sent daily Dec 17 to Dec 31, once per user.", test: annualTest, toggle: () => annualSet(annualMode === "off" ? "all" : "off"), canTurnOn: true, dry: annualDry as null | (() => void) },
  ];
  const rows = (report?.recent ?? []).filter((e) => showTests || e.flow === "welcome");

  return (
    <div style={wrap}>
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 24px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
          <div>
            <a href="/admin" style={{ color: TEAL, fontSize: 13, textDecoration: "none" }}>← Admin</a>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: "6px 0 0" }}>Emails</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={load} disabled={busy} style={{ background: TEAL, color: "#0d2137", border: 0, borderRadius: 999, padding: "8px 18px", fontWeight: 800, cursor: "pointer" }}>
              {busy ? "..." : "Refresh"}
            </button>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(100,223,223,0.18)", borderRadius: 16, marginBottom: 20, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 16px", borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>E-mail types</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
              Test language
              {(["he", "en", "es"] as const).map((l) => (
                <button key={l} onClick={() => setTestLang(l)} style={{ background: testLang === l ? TEAL : "transparent", color: testLang === l ? "#0d2137" : "rgba(255,255,255,0.7)", border: "0.5px solid " + (testLang === l ? TEAL : "rgba(255,255,255,0.25)"), borderRadius: 999, padding: "3px 11px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          {kinds.map((k, i) => (
            <div key={k.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "11px 16px", borderTop: i ? "0.5px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: k.on ? "#4ade80" : "#fbbf24", display: "inline-block" }} />
                  {k.name}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{k.on ? k.onText : "Off. Nothing is sent."}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {k.dry && <button onClick={k.dry} disabled={busy} style={linkBtn}>Dry run</button>}
                <button onClick={k.test} disabled={busy} style={linkBtn}>Send me a test</button>
                <button
                  role="switch"
                  aria-checked={k.on}
                  aria-label={k.name}
                  onClick={k.toggle}
                  disabled={busy || (!k.on && !k.canTurnOn)}
                  title={!k.on && !k.canTurnOn ? "Turning this one on is done deliberately by the owner" : undefined}
                  style={{ width: 42, height: 24, borderRadius: 999, border: 0, padding: 2, background: k.on ? "#4ade80" : "rgba(255,255,255,0.2)", cursor: busy || (!k.on && !k.canTurnOn) ? "default" : "pointer", opacity: !k.on && !k.canTurnOn ? 0.4 : 1, display: "flex", justifyContent: k.on ? "flex-end" : "flex-start" }}
                >
                  <span style={{ width: 20, height: 20, borderRadius: 999, background: "#fff", display: "block" }} />
                </button>
              </div>
            </div>
          ))}
          {notice && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", padding: "10px 16px", borderTop: "0.5px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>{notice}</div>}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
          <Stat label="Sent" value={w?.sent ?? 0} />
          <Stat label="Delivered" value={w?.delivered ?? 0} />
          <Stat label="Clicked" value={w?.clicked ?? 0} />
          <Stat label="Created a trip (7 days)" value={w?.createdTrip7d ?? 0} />
          <Stat label="Bounced" value={w?.bounced ?? 0} />
          <Stat label="Complaints" value={w?.complained ?? 0} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <h2 style={{ fontSize: 16, margin: 0 }}>Sent e-mails</h2>
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>
            <input type="checkbox" checked={showTests} onChange={(e) => setShowTests(e.target.checked)} style={{ marginInlineEnd: 6 }} />
            Include test sends
          </label>
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(100,223,223,0.18)", borderRadius: 16, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                <th style={th}>Created</th>
                <th style={th}>Type</th>
                <th style={th}>Language</th>
                <th style={th}>Status</th>
                <th style={th}>Delivered</th>
                <th style={th}>Clicked</th>
                <th style={th}>Issue</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={7} style={{ ...td, textAlign: "center", color: "rgba(255,255,255,0.4)", padding: 28 }}>No e-mails yet</td></tr>
              )}
              {rows.map((e, i) => (
                <tr key={i} style={{ borderTop: "0.5px solid rgba(255,255,255,0.08)" }}>
                  <td style={td}>{fmt(e.createdAt)}</td>
                  <td style={td}>{e.flow === "welcome" ? "Welcome" : e.flow === "annual" ? "Yearly summary" : e.flow === "annual_test" ? "Yearly summary (test)" : e.flow === "verify" ? "Verification" : e.flow === "verify_test" ? "Verification (test)" : "Welcome (test)"}{e.variant === "control" ? " · control" : ""}</td>
                  <td style={td}>{LANG[e.lang] ?? e.lang}</td>
                  <td style={{ ...td, color: STATUS_COLOR[e.status] ?? "#fff", fontWeight: 700 }}>
                    {e.status}{e.skipReason ? ` (${e.skipReason})` : ""}
                  </td>
                  <td style={td}>{fmt(e.deliveredAt)}</td>
                  <td style={td}>{e.clickCount ? `${e.clickCount}× · ${fmt(e.firstClickAt)}` : "-"}</td>
                  <td style={{ ...td, color: e.bouncedAt || e.complainedAt || e.errorName ? "#ff6b6b" : undefined }}>
                    {e.bouncedAt ? "bounced" : e.complainedAt ? "complaint" : e.errorName ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
