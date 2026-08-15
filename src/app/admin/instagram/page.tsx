"use client";
import { useState, useCallback } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

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
  status: "draft" | "approved" | "published" | "failed";
  igPermalink: string | null;
  error: string | null;
  createdAt: string | null;
  publishedAt: string | null;
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
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

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
    } finally { setBusyId(null); }
  };

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

  return (
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
                      {post.error && <div style={{ fontSize: 11, color: "#ff6b6b", marginTop: 6 }}>שגיאה: {post.error}</div>}
                      {post.igPermalink && (
                        <a href={post.igPermalink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: TEAL, marginTop: 6, display: "inline-block" }}>
                          צפה באינסטגרם →
                        </a>
                      )}

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
  );
}
