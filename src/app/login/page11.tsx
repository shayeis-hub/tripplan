"use client";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [isNew,    setIsNew]    = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handle = async () => {
    if (!email || !password) return;
    setLoading(true); setError("");
    try {
      if (isNew) await register(email, password);
      else       await login(email, password);
      router.push("/");
    } catch (e: any) {
      const msg: Record<string,string> = {
        "auth/user-not-found":       "משתמש לא נמצא",
        "auth/wrong-password":       "סיסמה שגויה",
        "auth/invalid-credential":   "אימייל או סיסמה שגויים",
        "auth/email-already-in-use": "האימייל כבר רשום",
        "auth/weak-password":        "סיסמה חלשה מדי (מינימום 6 תווים)",
        "auth/invalid-email":        "אימייל לא תקין",
      };
      setError(msg[e.code] || `שגיאה: ${e.code}`);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Nunito', 'Segoe UI', sans-serif; }
        .login-wrap {
          min-height: 100vh;
          background: linear-gradient(135deg, #1A5C6B, #2A7B8C, #3A9BAE);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .login-card {
          background: #fff;
          border-radius: 24px;
          padding: 32px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          direction: rtl;
        }
        .login-input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 12px;
          border: 2px solid #EAD9B5;
          font-family: 'Nunito', sans-serif;
          font-size: 16px;
          margin-bottom: 12px;
          direction: rtl;
          background: #F8F3EA;
          outline: none;
          display: block;
          color: #1A2B35;
        }
        .login-input:focus { border-color: #2A7B8C; }
        .login-btn-primary {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #2A7B8C, #3A9BAE);
          color: #fff;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          font-family: 'Nunito', sans-serif;
          margin-bottom: 12px;
          display: block;
        }
        .login-btn-primary:disabled { opacity: 0.6; cursor: default; }
        .login-btn-secondary {
          width: 100%;
          padding: 11px;
          border-radius: 12px;
          border: 2px solid #EAD9B5;
          background: transparent;
          color: #7A9BAA;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Nunito', sans-serif;
          display: block;
        }
        .login-error {
          background: #E8704A20;
          border: 1.5px solid #E8704A;
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 14px;
          color: #E8704A;
          font-size: 13px;
          font-weight: 700;
        }
      `}</style>

      <div className="login-wrap">
        <div className="login-card">
          <div style={{textAlign:"center", marginBottom:28}}>
            <div style={{fontSize:48}}>🌺</div>
            <h1 style={{fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, color:"#1A5C6B", margin:"8px 0 4px"}}>
              TripPlan
            </h1>
            <p style={{color:"#7A9BAA", fontSize:14}}>
              {isNew ? "צור חשבון חדש" : "ברוך השב!"}
            </p>
          </div>

          <input
            className="login-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="אימייל"
            autoComplete="email"
          />
          <input
            className="login-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="סיסמה (מינימום 6 תווים)"
            onKeyDown={e => e.key === "Enter" && handle()}
            autoComplete={isNew ? "new-password" : "current-password"}
          />

          {error && <div className="login-error">⚠️ {error}</div>}

          <button className="login-btn-primary" onClick={handle} disabled={loading}>
            {loading ? "⏳ רגע..." : isNew ? "צור חשבון ✓" : "התחבר ←"}
          </button>

          <button className="login-btn-secondary" onClick={() => { setIsNew(n => !n); setError(""); }}>
            {isNew ? "יש לי חשבון – התחבר" : "משתמש חדש? הירשם"}
          </button>
        </div>
      </div>
    </>
  );
}
