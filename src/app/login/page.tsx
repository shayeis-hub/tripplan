"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [isNew,    setIsNew]    = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    try { const saved = localStorage.getItem("tayalon_email"); if (saved) setEmail(saved); } catch {}
  }, []);

  const handle = async () => {
    if (!email || !password) return;
    setLoading(true); setError("");
    try {
      if (isNew) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      try { localStorage.setItem("tayalon_email", email); } catch {}
      router.push("/");
    } catch (err: any) {
      const msg: Record<string,string> = {
        "auth/user-not-found":       "משתמש לא נמצא",
        "auth/wrong-password":       "סיסמה שגויה",
        "auth/invalid-credential":   "אימייל או סיסמה שגויים",
        "auth/email-already-in-use": "האימייל כבר רשום",
        "auth/weak-password":        "סיסמה חלשה מדי (מינימום 6 תווים)",
        "auth/invalid-email":        "אימייל לא תקין",
      };
      setError(msg[err.code] || `שגיאה: ${err.code || err.message}`);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Rubik', sans-serif; background: #0d2137; direction: rtl; }
        .page {
          min-height: 100vh;
          background: linear-gradient(160deg, #091928 0%, #0d2137 50%, #0a2a40 100%);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 24px 20px; position: relative; overflow: hidden;
        }
        .page::before {
          content: ''; position: absolute; top: -120px; left: -120px;
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(100,223,223,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .card {
          background: rgba(255,255,255,0.05);
          border: 0.5px solid rgba(100,223,223,0.2);
          border-radius: 24px; padding: 36px 28px;
          width: 100%; max-width: 420px;
          position: relative; z-index: 1;
        }
        .logo-wrap { text-align: center; margin-bottom: 32px; }
        .logo-name { font-family: 'Rubik', sans-serif; font-size: 44px; font-weight: 900; color: #ffffff; letter-spacing: -1.5px; line-height: 1; }
        .logo-sub { font-family: 'Rubik', sans-serif; font-size: 12px; font-weight: 300; color: rgba(255,255,255,0.3); letter-spacing: 0.8px; margin-top: 6px; }
        .greeting { font-family: 'Rubik', sans-serif; font-size: 14px; font-weight: 400; color: rgba(100,223,223,0.7); margin-top: 14px; }
        .input {
          width: 100%; padding: 14px 16px; border-radius: 14px;
          border: 0.5px solid rgba(100,223,223,0.2);
          font-family: 'Rubik', sans-serif; font-size: 15px;
          margin-bottom: 12px; direction: rtl;
          background: rgba(255,255,255,0.07); color: #ffffff; outline: none;
          transition: border-color 0.2s; display: block;
        }
        .input:focus { border-color: #64dfdf; }
        .input::placeholder { color: rgba(255,255,255,0.25); }
        .btn-primary {
          width: 100%; padding: 15px; border-radius: 14px; border: none;
          background: #64dfdf; color: #0d2137; font-size: 15px; font-weight: 700;
          cursor: pointer; font-family: 'Rubik', sans-serif; margin-bottom: 10px;
          display: block; transition: opacity 0.2s;
        }
        .btn-primary:disabled { opacity: 0.5; cursor: default; }
        .btn-secondary {
          width: 100%; padding: 13px; border-radius: 14px;
          border: 0.5px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.4); font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'Rubik', sans-serif; display: block;
        }
        .error-box {
          background: rgba(255,107,107,0.1); border: 0.5px solid rgba(255,107,107,0.3);
          border-radius: 12px; padding: 10px 14px; margin-bottom: 14px;
          color: #ff6b6b; font-size: 13px; font-family: 'Rubik', sans-serif;
        }
        .divider { height: 0.5px; background: rgba(255,255,255,0.07); margin: 18px 0; }
      `}</style>

      <div className="page">
        <div className="card">
          <div className="logo-wrap">
            <div className="logo-name">טיולון</div>
            <div className="logo-sub">מתכנן הטיולים שלי</div>
            <div className="greeting">{isNew ? "צור חשבון חדש ✨" : "ברוך השב 👋"}</div>
          </div>

          <input className="input" type="email" value={email}
            onChange={ev => setEmail(ev.target.value)}
            placeholder="אימייל" autoComplete="email"/>

          <input className="input" type="password" value={password}
            onChange={ev => setPassword(ev.target.value)}
            placeholder="סיסמה (מינימום 6 תווים)"
            onKeyDown={ev => { if (ev.key === "Enter") handle(); }}
            autoComplete={isNew ? "new-password" : "current-password"}/>

          {error && <div className="error-box">⚠️ {error}</div>}

          <button className="btn-primary" onClick={() => handle()} disabled={loading}>
            {loading ? "⏳ רגע..." : isNew ? "צור חשבון ✓" : "התחבר ←"}
          </button>

          <div className="divider"/>

          <button className="btn-secondary" onClick={() => { setIsNew(n => !n); setError(""); }}>
            {isNew ? "יש לי חשבון – התחבר" : "משתמש חדש? הירשם"}
          </button>
        </div>
      </div>
    </>
  );
}
