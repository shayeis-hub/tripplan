"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [emailVal, setEmailVal] = useState("");
  const [passVal,  setPassVal]  = useState("");
  const [isNew,    setIsNew]    = useState(false);
  const [errMsg,   setErrMsg]   = useState("");
  const [busy,     setBusy]     = useState(false);

  useEffect(() => {
    try { const s = localStorage.getItem("tayalon_email"); if (s) setEmailVal(s); } catch {}
  }, []);

  const doSubmit = async () => {
    if (!emailVal || !passVal) return;
    setBusy(true); setErrMsg("");
    try {
      if (isNew) {
        await createUserWithEmailAndPassword(auth, emailVal, passVal);
      } else {
        await signInWithEmailAndPassword(auth, emailVal, passVal);
      }
      try { localStorage.setItem("tayalon_email", emailVal); } catch {}
      setTimeout(() => router.replace("/"), 500);
    } catch (firebaseErr: any) {
      const codes: Record<string,string> = {
        "auth/user-not-found":       "משתמש לא נמצא",
        "auth/wrong-password":       "סיסמה שגויה",
        "auth/invalid-credential":   "אימייל או סיסמה שגויים",
        "auth/email-already-in-use": "האימייל כבר רשום",
        "auth/weak-password":        "סיסמה חלשה מדי",
        "auth/invalid-email":        "אימייל לא תקין",
      };
      setErrMsg(codes[firebaseErr.code] || `שגיאה: ${firebaseErr.code || firebaseErr.message}`);
      setBusy(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Rubik',sans-serif;background:#0d2137;direction:rtl;}
        .page{min-height:100vh;background:linear-gradient(160deg,#091928,#0d2137,#0a2a40);display:flex;align-items:center;justify-content:center;padding:24px 20px;}
        .card{background:rgba(255,255,255,0.05);border:0.5px solid rgba(100,223,223,0.2);border-radius:24px;padding:36px 28px;width:100%;max-width:420px;}
        .logo{text-align:center;margin-bottom:32px;}
        .logo-name{font-size:44px;font-weight:900;color:#fff;letter-spacing:-1.5px;}
        .logo-sub{font-size:12px;font-weight:300;color:rgba(255,255,255,0.3);margin-top:6px;}
        .greeting{font-size:14px;color:rgba(100,223,223,0.7);margin-top:14px;}
        .inp{width:100%;padding:14px 16px;border-radius:14px;border:0.5px solid rgba(100,223,223,0.2);font-size:15px;margin-bottom:12px;direction:rtl;background:rgba(255,255,255,0.07);color:#fff;outline:none;display:block;font-family:'Rubik',sans-serif;}
        .inp:focus{border-color:#64dfdf;}
        .inp::placeholder{color:rgba(255,255,255,0.25);}
        .btn-main{width:100%;padding:15px;border-radius:14px;border:none;background:#64dfdf;color:#0d2137;font-size:15px;font-weight:700;cursor:pointer;font-family:'Rubik',sans-serif;margin-bottom:10px;display:block;}
        .btn-main:disabled{opacity:0.5;cursor:default;}
        .btn-sec{width:100%;padding:13px;border-radius:14px;border:0.5px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.4);font-size:13px;cursor:pointer;font-family:'Rubik',sans-serif;display:block;}
        .err{background:rgba(255,107,107,0.1);border:0.5px solid rgba(255,107,107,0.3);border-radius:12px;padding:10px 14px;margin-bottom:14px;color:#ff6b6b;font-size:13px;}
        .div{height:0.5px;background:rgba(255,255,255,0.07);margin:18px 0;}
      `}</style>
      <div className="page">
        <div className="card">
          <div className="logo">
            <div className="logo-name">טיולון</div>
            <div className="logo-sub">מתכנן הטיולים שלי</div>
            <div className="greeting">{isNew ? "צור חשבון חדש ✨" : "ברוך השב 👋"}</div>
          </div>
          <input className="inp" type="email" value={emailVal}
            onChange={ev => setEmailVal(ev.target.value)}
            placeholder="אימייל" autoComplete="email"/>
          <input className="inp" type="password" value={passVal}
            onChange={ev => setPassVal(ev.target.value)}
            placeholder="סיסמה (מינימום 6 תווים)"
            onKeyDown={ev => { if (ev.key === "Enter") doSubmit(); }}
            autoComplete={isNew ? "new-password" : "current-password"}/>
          {errMsg && <div className="err">⚠️ {errMsg}</div>}
          <button className="btn-main" onClick={doSubmit} disabled={busy}>
            {busy ? "⏳ רגע..." : isNew ? "צור חשבון ✓" : "התחבר ←"}
          </button>
          <div className="div"/>
          <button className="btn-sec" onClick={() => { setIsNew(n => !n); setErrMsg(""); }}>
            {isNew ? "יש לי חשבון – התחבר" : "משתמש חדש? הירשם"}
          </button>
        </div>
      </div>
    </>
  );
}
