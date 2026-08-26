"use client";
import { useState, useCallback, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { renderPostCard } from "@/lib/post-card";

const msg = (e: unknown) => e instanceof Error ? e.message : "Unknown error";

const ADMIN_EMAIL = "shayeis@gmail.com";
const RF = "'Rubik',sans-serif";
const TEAL = "#64dfdf";
const BG = "#0d2137";

interface Post {
  id: string;
  topic: string;
  caption: string;
  hashtags: string[];
  imageUrl: string | null;
  imageQuery?: string;
  status: "draft" | "approved" | "published" | "failed";
  igPermalink: string | null;
  postToFacebook?: boolean;
  fbPermalink?: string | null;
  fbError?: string | null;
  scheduledFor?: string | null;
  error: string | null;
  createdAt: string | null;
  publishedAt: string | null;
}

interface StockPhoto {
  id: number;
  url: string;
  thumb: string;
  photographer: string;
  pageUrl: string;
}

const STATUS_LABEL: Record<Post["status"], string> = {
  draft: "טיוטה",
  approved: "מאושר, ממתין לפרסום",
  published: "פורסם",
  failed: "נכשל",
};
const STATUS_COLOR: Record<Post["status"], string> = {
  draft: "rgba(255,255,255,0.4)",
  approved: "#facc15",
  published: "#4ade80",
  failed: "#ff6b6b",
};

// Mirrors the exact caption assembly in api/admin/instagram/publish/route.ts,
// so the preview shows precisely what gets sent to Instagram.
function fullCaptionFor(post: Post): string {
  return [post.caption, (post.hashtags || []).map(h => `#${h}`).join(" ")]
    .filter(Boolean)
    .join("\n\n");
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function InstagramAdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [stockFor, setStockFor] = useState<string | null>(null);
  const [stockPhotos, setStockPhotos] = useState<StockPhoto[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualCaption, setManualCaption] = useState("");
  const [manualHashtags, setManualHashtags] = useState("");
  const [manualTopic, setManualTopic] = useState("");
  const [manualSchedule, setManualSchedule] = useState("");
  const [manualBusy, setManualBusy] = useState(false);

  const authHeader = useCallback(async () => {
    if (!auth.currentUser) return {};
    const token = await auth.currentUser.getIdToken();
    return { authorization: `Bearer ${token}` };
  }, []);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await authHeader();
      const res = await fetch("/api/admin/instagram/queue", { headers });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPosts(data.posts);
    } catch (e: unknown) {
      setErr(msg(e));
    } finally { setLoading(false); }
  }, [authHeader]);

  // Firebase persists the session, so a refresh should not demand the password
  // again — adopt the existing signed-in admin instead of resetting to the gate.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (user?.email === ADMIN_EMAIL) {
        setAuthed(true);
        loadQueue();
      }
      setChecking(false);
    });
    return unsub;
  }, [loadQueue]);

  const login = async () => {
    try {
      const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, pass);
      if (cred.user.email !== ADMIN_EMAIL) throw new Error("Not admin");
      setAuthed(true);
      setErr("");
      await loadQueue();
    } catch { setErr("סיסמה שגויה"); }
  };

  const generate = async () => {
    setGenerating(true);
    setErr("");
    try {
      const headers = { "Content-Type": "application/json", ...(await authHeader()) };
      const res = await fetch("/api/admin/instagram/generate", {
        method: "POST", headers, body: JSON.stringify({ topic: topic || undefined, count: 3 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await loadQueue();
    } catch (e: unknown) {
      setErr(msg(e));
    } finally { setGenerating(false); }
  };

  // Manual post creation — independent of the AI generator, for pasting in
  // pre-written content like the "one feature a day" series.
  const createManual = async () => {
    if (!manualCaption.trim()) { setErr("צריך כיתוב לפוסט"); return; }
    setManualBusy(true);
    setErr("");
    try {
      const headers = { "Content-Type": "application/json", ...(await authHeader()) };
      const res = await fetch("/api/admin/instagram/create", {
        method: "POST", headers,
        body: JSON.stringify({
          caption: manualCaption,
          hashtags: manualHashtags.split(",").map(h => h.trim().replace(/^#/, "")).filter(Boolean),
          topic: manualTopic,
          scheduledFor: manualSchedule || null,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setManualCaption(""); setManualHashtags(""); setManualTopic(""); setManualSchedule("");
      setManualOpen(false);
      await loadQueue();
    } catch (e: unknown) {
      setErr(msg(e));
    } finally { setManualBusy(false); }
  };

  const setSchedule = async (id: string, scheduledFor: string) => {
    await patchPost(id, { scheduledFor: scheduledFor || null } as Partial<Post>);
    setPosts(ps => ps.map(p => p.id === id ? { ...p, scheduledFor: scheduledFor || null } : p));
  };

  const patchPost = async (id: string, patch: Partial<Post>) => {
    const headers = { "Content-Type": "application/json", ...(await authHeader()) };
    await fetch(`/api/admin/instagram/${id}`, { method: "PATCH", headers, body: JSON.stringify(patch) });
  };

  const saveCaption = async (id: string, caption: string) => {
    await patchPost(id, { caption });
    setPosts(ps => ps.map(p => p.id === id ? { ...p, caption } : p));
  };

  const setStatus = async (id: string, status: Post["status"]) => {
    setBusyId(id);
    try {
      await patchPost(id, { status });
      setPosts(ps => ps.map(p => p.id === id ? { ...p, status } : p));
    } finally { setBusyId(null); }
  };

  const discard = async (id: string) => {
    setBusyId(id);
    try {
      const headers = await authHeader();
      await fetch(`/api/admin/instagram/${id}`, { method: "DELETE", headers });
      setPosts(ps => ps.filter(p => p.id !== id));
    } finally { setBusyId(null); }
  };

  const uploadImage = async (id: string, file: File) => {
    setBusyId(id);
    setErr("");
    try {
      const imageBase64 = await fileToBase64(file);
      const headers = { "Content-Type": "application/json", ...(await authHeader()) };
      const res = await fetch("/api/admin/instagram/upload", {
        method: "POST", headers, body: JSON.stringify({ id, imageBase64, contentType: file.type }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPosts(ps => ps.map(p => p.id === id ? { ...p, imageUrl: data.imageUrl } : p));
    } catch (e: unknown) {
      setErr(msg(e));
    } finally { setBusyId(null); }
  };

  // Draws the branded card in the browser and pushes it through the normal
  // upload route, so it lands in Storage exactly like a manual upload would.
  const makeCard = async (post: Post) => {
    setBusyId(post.id);
    setErr("");
    try {
      const imageBase64 = await renderPostCard(post.caption);
      const headers = { "Content-Type": "application/json", ...(await authHeader()) };
      const res = await fetch("/api/admin/instagram/upload", {
        method: "POST", headers, body: JSON.stringify({ id: post.id, imageBase64, contentType: "image/png" }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPosts(ps => ps.map(p => p.id === post.id ? { ...p, imageUrl: data.imageUrl } : p));
    } catch (e: unknown) {
      setErr(msg(e));
    } finally { setBusyId(null); }
  };

  const findStock = async (post: Post) => {
    const q = (post.imageQuery || post.topic || "").trim();
    if (!q) { setErr("אין מונח חיפוש לפוסט הזה"); return; }
    setStockFor(post.id);
    setStockPhotos([]);
    setErr("");
    try {
      const headers = await authHeader();
      const res = await fetch(`/api/admin/instagram/stock?q=${encodeURIComponent(q)}`, { headers });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStockPhotos(data.photos || []);
    } catch (e: unknown) {
      setErr(msg(e));
      setStockFor(null);
    }
  };

  const pickStock = async (id: string, photo: StockPhoto) => {
    setBusyId(id);
    setErr("");
    try {
      const headers = { "Content-Type": "application/json", ...(await authHeader()) };
      const res = await fetch("/api/admin/instagram/stock", {
        method: "POST", headers,
        body: JSON.stringify({ id, photoUrl: photo.url, credit: `Photo by ${photo.photographer} on Pexels` }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPosts(ps => ps.map(p => p.id === id ? { ...p, imageUrl: data.imageUrl } : p));
      setStockFor(null);
      setStockPhotos([]);
    } catch (e: unknown) {
      setErr(msg(e));
    } finally { setBusyId(null); }
  };

  const publish = async (id: string) => {
    setBusyId(id);
    setErr("");
    try {
      const headers = { "Content-Type": "application/json", ...(await authHeader()) };
      const res = await fetch("/api/admin/instagram/publish", {
        method: "POST", headers, body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await loadQueue();
    } catch (e: unknown) {
      setErr(msg(e));
      await loadQueue(); // server already flipped status to "failed" — pull that in, don't leave stale "approved" state showing
    } finally { setBusyId(null); }
  };

  // avoid flashing the password gate while the persisted session is restored
  if (checking) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: RF, color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
      טוען...
    </div>
  );

  if (!authed) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: RF }}>
      <div style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(100,223,223,0.2)", borderRadius: 24, padding: "40px 32px", width: 360 }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 6, textAlign: "center" }}>Instagram Admin</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24, textAlign: "center" }}>טיולון</div>
        <input type="password" placeholder="סיסמת Firebase" value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "0.5px solid rgba(100,223,223,0.2)", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 15, marginBottom: 12, fontFamily: RF, outline: "none", boxSizing: "border-box" }} />
        {err && <div style={{ color: "#ff6b6b", fontSize: 13, marginBottom: 10 }}>{err}</div>}
        <button onClick={login} style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: TEAL, color: BG, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: RF }}>
          כניסה
        </button>
      </div>
    </div>
  );

  const byStatus = (s: Post["status"]) => posts.filter(p => p.status === s);
  const previewPost = posts.find(p => p.id === previewId) || null;

  return (
    <>
    <div style={{ minHeight: "100vh", background: BG, fontFamily: RF, color: "#fff" }}>
      <div style={{ background: "linear-gradient(135deg,#091928,#0d2137)", padding: "24px 32px", borderBottom: "0.5px solid rgba(100,223,223,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>Instagram — טיולון</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>יצירת תוכן ופרסום, כל פוסט דורש אישור ידני</div>
        </div>
        <a href="/admin" style={{ fontSize: 13, color: TEAL, textDecoration: "none" }}>← Dashboard</a>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px" }}>
        {/* Generate */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, marginBottom: 28, display: "flex", gap: 10 }}>
          <input placeholder="נושא ספציפי (אופציונלי) — למשל: פיצול הוצאות בטיול" value={topic}
            onChange={e => setTopic(e.target.value)}
            style={{ flex: 1, padding: "12px 14px", borderRadius: 10, border: "0.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, fontFamily: RF, outline: "none" }} />
          <button onClick={generate} disabled={generating}
            style={{ padding: "12px 22px", borderRadius: 10, border: "none", background: TEAL, color: BG, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: RF, whiteSpace: "nowrap" }}>
            {generating ? "יוצר רעיונות..." : "צור 3 רעיונות חדשים"}
          </button>
        </div>

        {/* Manual post — independent of the AI generator */}
        <div style={{ marginBottom: 28 }}>
          <button onClick={() => setManualOpen(o => !o)}
            style={{ padding: "10px 16px", borderRadius: 10, border: "0.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: RF }}>
            {manualOpen ? "סגור" : "+ פוסט ידני"}
          </button>
          {manualOpen && (
            <div style={{ marginTop: 10, background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              <textarea placeholder="כיתוב הפוסט" value={manualCaption} onChange={e => setManualCaption(e.target.value)}
                style={{ minHeight: 90, padding: "12px 14px", borderRadius: 10, border: "0.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, fontFamily: RF, outline: "none", resize: "vertical" }} />
              <input placeholder="האשטגים, מופרדים בפסיקים" value={manualHashtags} onChange={e => setManualHashtags(e.target.value)}
                style={{ padding: "12px 14px", borderRadius: 10, border: "0.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, fontFamily: RF, outline: "none" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <input placeholder="נושא (תווית פנימית, אופציונלי)" value={manualTopic} onChange={e => setManualTopic(e.target.value)}
                  style={{ flex: 1, padding: "12px 14px", borderRadius: 10, border: "0.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, fontFamily: RF, outline: "none" }} />
                <input type="datetime-local" value={manualSchedule} onChange={e => setManualSchedule(e.target.value)}
                  style={{ padding: "12px 14px", borderRadius: 10, border: "0.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, fontFamily: RF, outline: "none", direction: "ltr" }} />
              </div>
              <button onClick={createManual} disabled={manualBusy}
                style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: TEAL, color: BG, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: RF, alignSelf: "flex-start" }}>
                {manualBusy ? "יוצר..." : "הוסף לתור כטיוטה"}
              </button>
            </div>
          )}
        </div>

        {err && <div style={{ background: "rgba(255,107,107,0.1)", border: "0.5px solid rgba(255,107,107,0.3)", borderRadius: 12, padding: "12px 16px", color: "#ff6b6b", marginBottom: 20 }}>{err}</div>}
        {loading && <div style={{ textAlign: "center", padding: 30, color: "rgba(255,255,255,0.4)" }}>טוען...</div>}

        {(["draft", "approved", "published", "failed"] as const).map(status => {
          const group = byStatus(status);
          if (!group.length) return null;
          return (
            <div key={status} style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: STATUS_COLOR[status], marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                {STATUS_LABEL[status]} ({group.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {group.map(post => (
                  <div key={post.id} style={{ background: "rgba(255,255,255,0.04)", border: `0.5px solid ${STATUS_COLOR[status]}30`, borderRadius: 16, padding: 18, display: "flex", gap: 16 }}>
                    <div style={{ width: 120, flexShrink: 0 }}>
                      {post.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.imageUrl} alt="" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 10 }} />
                      ) : (
                        <label style={{ width: 120, height: 120, borderRadius: 10, border: "1px dashed rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "rgba(255,255,255,0.35)", cursor: "pointer", textAlign: "center", padding: 6 }}>
                          העלה תמונה
                          <input type="file" accept="image/jpeg,image/png" style={{ display: "none" }}
                            onChange={e => e.target.files?.[0] && uploadImage(post.id, e.target.files[0])} />
                        </label>
                      )}
                      {post.imageUrl && (
                        <button onClick={() => setPreviewId(post.id)}
                          style={{ width: "100%", marginTop: 8, padding: "6px 8px", borderRadius: 7, border: `0.5px solid ${TEAL}40`, background: "rgba(100,223,223,0.08)", color: TEAL, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: RF }}>
                          תצוגה מקדימה
                        </button>
                      )}
                      {status !== "published" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                          <button onClick={() => findStock(post)} disabled={busyId === post.id}
                            style={{ padding: "6px 8px", borderRadius: 7, border: "0.5px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)", fontSize: 11, cursor: "pointer", fontFamily: RF }}>
                            תמונת סטוק
                          </button>
                          <button onClick={() => makeCard(post)} disabled={busyId === post.id}
                            style={{ padding: "6px 8px", borderRadius: 7, border: "0.5px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)", fontSize: 11, cursor: "pointer", fontFamily: RF }}>
                            {busyId === post.id ? "..." : "כרטיס ממותג"}
                          </button>
                          {post.imageUrl && (
                            <label style={{ padding: "6px 8px", borderRadius: 7, border: "0.5px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer", fontFamily: RF, textAlign: "center" }}>
                              החלף ידנית
                              <input type="file" accept="image/jpeg,image/png" style={{ display: "none" }}
                                onChange={e => e.target.files?.[0] && uploadImage(post.id, e.target.files[0])} />
                            </label>
                          )}
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {post.topic && <div style={{ fontSize: 11, color: TEAL, marginBottom: 6, fontWeight: 700 }}>{post.topic}</div>}
                      <textarea
                        defaultValue={post.caption}
                        disabled={status === "published"}
                        onBlur={e => e.target.value !== post.caption && saveCaption(post.id, e.target.value)}
                        style={{ width: "100%", minHeight: 70, background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontSize: 13, padding: 10, fontFamily: RF, resize: "vertical", boxSizing: "border-box" }} />
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
                        {(post.hashtags || []).map(h => `#${h}`).join(" ")}
                      </div>
                      {status !== "published" && (
                        <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>
                          <input type="checkbox" checked={!!post.postToFacebook}
                            onChange={e => {
                              const checked = e.target.checked;
                              patchPost(post.id, { postToFacebook: checked });
                              setPosts(ps => ps.map(p => p.id === post.id ? { ...p, postToFacebook: checked } : p));
                            }} />
                          גם לדף הפייסבוק
                        </label>
                      )}
                      {status !== "published" && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>תזמון פרסום:</label>
                          <input type="datetime-local" value={post.scheduledFor || ""}
                            onChange={e => setSchedule(post.id, e.target.value)}
                            style={{ padding: "6px 10px", borderRadius: 7, border: "0.5px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 12, fontFamily: RF, outline: "none", direction: "ltr" }} />
                        </div>
                      )}
                      {post.scheduledFor && status === "approved" && (
                        <div style={{ fontSize: 11, color: TEAL, marginTop: 4 }}>
                          מתוזמן ל-{new Date(post.scheduledFor).toLocaleString("he-IL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                          {" · "}הפרסום בפועל תלוי בזמן הרצת ה-cron היומי, לא מדויק לדקה
                        </div>
                      )}
                      {stockFor === post.id && (
                        <div style={{ marginTop: 10, padding: 10, background: "rgba(0,0,0,0.22)", borderRadius: 10, border: "0.5px solid rgba(255,255,255,0.1)" }}>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
                            {stockPhotos.length ? `בחר תמונה (חיפוש: ${post.imageQuery || post.topic})` : "מחפש..."}
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {stockPhotos.map(ph => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img key={ph.id} src={ph.thumb} alt="" title={`צילום: ${ph.photographer}`}
                                onClick={() => pickStock(post.id, ph)}
                                style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, cursor: "pointer", border: "1px solid rgba(255,255,255,0.12)" }} />
                            ))}
                          </div>
                          <button onClick={() => { setStockFor(null); setStockPhotos([]); }}
                            style={{ marginTop: 8, padding: "4px 10px", borderRadius: 6, border: "none", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer", fontFamily: RF }}>
                            סגור
                          </button>
                        </div>
                      )}
                      {post.error && <div style={{ fontSize: 11, color: "#ff6b6b", marginTop: 6 }}>שגיאה: {post.error}</div>}
                      {post.igPermalink && (
                        <a href={post.igPermalink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: TEAL, marginTop: 6, display: "inline-block" }}>
                          צפה באינסטגרם →
                        </a>
                      )}
                      {post.fbPermalink && (
                        <a href={post.fbPermalink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#4267B2", marginTop: 6, marginInlineStart: 12, display: "inline-block" }}>
                          צפה בפייסבוק →
                        </a>
                      )}
                      {post.fbError && <div style={{ fontSize: 11, color: "#ff6b6b", marginTop: 6 }}>שגיאת פייסבוק: {post.fbError}</div>}

                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        {status === "draft" && (
                          <>
                            <button onClick={() => setStatus(post.id, "approved")} disabled={busyId === post.id}
                              style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: TEAL, color: BG, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: RF }}>
                              אשר
                            </button>
                            <button onClick={() => discard(post.id)} disabled={busyId === post.id}
                              style={{ padding: "8px 16px", borderRadius: 8, border: "0.5px solid rgba(255,255,255,0.2)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", fontFamily: RF }}>
                              מחק
                            </button>
                          </>
                        )}
                        {status === "approved" && (
                          <>
                            <button onClick={() => publish(post.id)} disabled={busyId === post.id || !post.imageUrl}
                              title={!post.imageUrl ? "צריך להעלות תמונה קודם" : ""}
                              style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: post.imageUrl ? "#4ade80" : "rgba(255,255,255,0.15)", color: BG, fontWeight: 700, fontSize: 12, cursor: post.imageUrl ? "pointer" : "not-allowed", fontFamily: RF }}>
                              {busyId === post.id ? "מפרסם..." : "פרסם עכשיו"}
                            </button>
                            <button onClick={() => setStatus(post.id, "draft")} disabled={busyId === post.id}
                              style={{ padding: "8px 16px", borderRadius: 8, border: "0.5px solid rgba(255,255,255,0.2)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", fontFamily: RF }}>
                              בטל אישור
                            </button>
                          </>
                        )}
                        {status === "failed" && (
                          <button onClick={() => setStatus(post.id, "approved")} disabled={busyId === post.id}
                            style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: TEAL, color: BG, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: RF }}>
                            נסה שוב
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {!loading && !posts.length && (
          <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.35)", fontSize: 14 }}>
            אין עדיין פוסטים. לחץ ״צור 3 רעיונות חדשים״ כדי להתחיל.
          </div>
        )}
      </div>
    </div>

    {previewPost && (
      <div onClick={() => setPreviewId(null)}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
        <div onClick={e => e.stopPropagation()}
          style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.5)", fontFamily: "'Segoe UI', Arial, sans-serif" }}>

          {/* header — mimics the IG post chrome so this reads as "how it'll look there" */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderBottom: "1px solid #efefef" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-512.png" alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: "#262626" }}>tulonapp</div>
            <button onClick={() => setPreviewId(null)}
              style={{ marginInlineStart: "auto", background: "none", border: "none", color: "#8e8e8e", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>
              ✕
            </button>
          </div>

          {/* image — square, matching what the branded card / stock search both produce */}
          <div style={{ width: "100%", aspectRatio: "1 / 1", background: "#fafafa" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewPost.imageUrl!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>

          {/* action icons — decorative chrome only, not live counts */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px 4px" }}>
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.8"><path d="M12 20.5s-7.5-4.6-9.7-9.1C.6 8 2 4.5 5.4 3.6c2-.5 4 .3 5.1 2 .3.4.9.4 1.2 0 1.1-1.7 3.1-2.5 5.1-2 3.4.9 4.8 4.4 3.1 7.8C19.5 15.9 12 20.5 12 20.5Z"/></svg>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4c-1.4-.1-2.3-.4-3.6-1L3 20l1.2-4.8a8 8 0 0 1-1-4.2A8.4 8.4 0 0 1 12 3a8.3 8.3 0 0 1 9 8.5Z"/></svg>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.8"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"/></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.8" style={{ marginInlineStart: "auto" }}><path d="M6 3h12v18l-6-4.5L6 21V3Z"/></svg>
          </div>

          {/* caption — exact concatenation used at publish time */}
          <div style={{ padding: "8px 14px 16px", fontSize: 13, color: "#262626", lineHeight: 1.5, direction: "rtl", textAlign: "right" }}>
            <span style={{ fontWeight: 600 }}>tulonapp</span>{" "}
            <span style={{ whiteSpace: "pre-wrap" }}>
              {fullCaptionFor(previewPost).split(/(#\S+)/g).map((part, i) =>
                part.startsWith("#")
                  ? <span key={i} style={{ color: "#00376b" }}>{part}</span>
                  : <span key={i}>{part}</span>
              )}
            </span>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
