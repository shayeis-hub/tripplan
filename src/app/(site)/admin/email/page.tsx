"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Admin-only control panel for the welcome e-mail. The server enforces the admin
// check on every call (see /api/admin/email); this page only shows what it says.
// "Send test" goes to the signed-in admin's own verified address and nowhere else.

const ADMIN_EMAIL = "shayeis@gmail.com";
const box: React.CSSProperties = { background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(100,223,223,0.2)", borderRadius: 14, padding: 18, marginBottom: 16 };
const btn: React.CSSProperties = { background: "#64dfdf", color: "#0d2137", border: 0, borderRadius: 999, padding: "9px 20px", fontWeight: 800, cursor: "pointer", marginInlineEnd: 8 };

export default function AdminEmailPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [report, setReport] = useState<unknown>(null);
  const [msg, setMsg] = useState("");
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
      return { status: res.status, json: await res.json().catch(() => null) };
    } finally {
      setBusy(false);
    }
  };

  const load = async () => {
    const r = await call("GET");
    if (r) setReport(r.json);
  };
  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const sendTest = async (lang: "he" | "en" | "es") => {
    setMsg("");
    const r = await call("POST", { action: "test", lang });
    setMsg(r ? `${r.status}: ${JSON.stringify(r.json)}` : "not signed in");
  };

  const setMode = async (mode: "off" | "allowlist" | "all") => {
    if (mode === "all" && !window.confirm("Enable the welcome e-mail for ALL new registrations from now on?")) return;
    const r = await call("POST", { action: "config", mode, allowlist: user?.email ? [user.email] : [], eligibleSince: "now", controlPct: 0 });
    setMsg(r ? `${r.status}: ${JSON.stringify(r.json)}` : "not signed in");
    await load();
  };

  if (user === undefined) return <div style={{ minHeight: "100vh", background: "#0d2137", padding: 24, color: "#fff" }}>...</div>;
  if (!user || user.email !== ADMIN_EMAIL) {
    return <div style={{ minHeight: "100vh", background: "#0d2137", padding: 24, color: "#fff", fontFamily: "sans-serif" }}>Sign in to TUlon as the admin account in this browser, then reload this page.</div>;
  }
  return (
    <div style={{ minHeight: "100vh", background: "#0d2137" }}>
    <main style={{ maxWidth: 640, margin: "0 auto", padding: 24, color: "#fff", fontFamily: "'Rubik',sans-serif", direction: "ltr" }}>
      <h1 style={{ fontSize: 22 }}>Welcome e-mail</h1>
      <div style={box}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Send a test to {user.email}</h2>
        <button style={btn} disabled={busy} onClick={() => sendTest("he")}>Hebrew</button>
        <button style={btn} disabled={busy} onClick={() => sendTest("en")}>English</button>
        <button style={btn} disabled={busy} onClick={() => sendTest("es")}>Spanish</button>
      </div>
      <div style={box}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Who receives it automatically</h2>
        <p style={{ fontSize: 13, opacity: 0.7 }}>off: nobody. allowlist: only your own address. all: every new Google/Apple registration from now on.</p>
        <button style={btn} disabled={busy} onClick={() => setMode("off")}>Off</button>
        <button style={btn} disabled={busy} onClick={() => setMode("allowlist")}>Allowlist (me)</button>
        <button style={{ ...btn, background: "#ff6b6b" }} disabled={busy} onClick={() => setMode("all")}>All new users</button>
      </div>
      {msg && <pre style={{ ...box, whiteSpace: "pre-wrap", fontSize: 12 }}>{msg}</pre>}
      <div style={box}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Results</h2>
        <button style={btn} disabled={busy} onClick={load}>Refresh</button>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{JSON.stringify(report, null, 2)}</pre>
      </div>
    </main>
    </div>
  );
}
