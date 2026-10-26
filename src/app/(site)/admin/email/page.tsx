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

  const wrap: React.CSSProperties = { minHeight: "100vh", background: "#0d2137", color: "#fff", fontFamily: "'Rubik',sans-serif", direction: "ltr" };
  if (user === undefined) return <div style={{ ...wrap, padding: 24 }}>...</div>;
  if (!user || user.email !== ADMIN_EMAIL) {
    return <div style={{ ...wrap, padding: 24 }}>Sign in to TUlon as the admin account in this browser, then reload this page.</div>;
  }

  const w = report?.welcome;
  const mode = report?.config?.mode ?? "off";
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
            <span style={{ fontSize: 13, color: mode === "all" ? "#4ade80" : "#fbbf24" }}>
              Welcome e-mail: {mode === "all" ? "on for new users" : mode === "allowlist" ? "test mode" : "off"}
            </span>
            {mode !== "off" && (
              <button onClick={turnOff} disabled={busy} style={{ background: "transparent", color: "#ff6b6b", border: "0.5px solid #ff6b6b", borderRadius: 999, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
                Turn off
              </button>
            )}
            <button onClick={load} disabled={busy} style={{ background: TEAL, color: "#0d2137", border: 0, borderRadius: 999, padding: "8px 18px", fontWeight: 800, cursor: "pointer" }}>
              {busy ? "..." : "Refresh"}
            </button>
          </div>
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
                  <td style={td}>{e.flow === "welcome" ? "Welcome" : "Welcome (test)"}{e.variant === "control" ? " · control" : ""}</td>
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
