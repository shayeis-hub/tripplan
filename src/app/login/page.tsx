"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/i18n";

const ERROR_CODES: Record<string, "login_err_not_found" | "login_err_password" | "login_err_credential" | "login_err_in_use" | "login_err_weak" | "login_err_email"> = {
  "auth/user-not-found":       "login_err_not_found",
  "auth/wrong-password":       "login_err_password",
  "auth/invalid-credential":   "login_err_credential",
  "auth/email-already-in-use": "login_err_in_use",
  "auth/weak-password":        "login_err_weak",
  "auth/invalid-email":        "login_err_email",
};

export default function LoginPage() {
  const { lang, setLang } = useLang();
  const router = useRouter();
  const [emailVal, setEmailVal] = useState("");
  const [passVal,  setPassVal]  = useState("");
  const [isNew,    setIsNew]    = useState(false);
  const [errMsg,   setErrMsg]   = useState("");
  const [busy,     setBusy]     = useState(false);

  const dir = lang === "he" ? "rtl" : "ltr";

  useEffect(() => {
    try { const s = localStorage.getItem("tayalon_email"); if (s) setEmailVal(s); } catch {}
  }, []);

  const doGoogle = async () => {
    setBusy(true); setErrMsg("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      window.location.href = "/";
    } catch (firebaseErr: any) {
      if (firebaseErr.code !== "auth/popup-closed-by-user") {
        setErrMsg(lang === "he" ? `שגיאה: ${firebaseErr.code}` : `Error: ${firebaseErr.code}`);
      }
      setBusy(false);
    }
  };

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
      window.location.href = "/";
    } catch (firebaseErr: any) {
      const key = ERROR_CODES[firebaseErr.code];
      setErrMsg(key ? t(key, lang) : (lang === "he" ? `שגיאה: ${firebaseErr.code}` : `Error: ${firebaseErr.code}`));
      setBusy(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Rubik',sans-serif;background:#0d2137;}
        .page{min-height:100vh;background:linear-gradient(160deg,#091928,#0d2137,#0a2a40);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:24px 20px;}
        .card{background:rgba(255,255,255,0.05);border:0.5px solid rgba(100,223,223,0.2);border-radius:24px;padding:36px 28px;width:100%;max-width:420px;position:relative;}
        .logo{text-align:center;margin-bottom:32px;}
        .logo-name{font-size:44px;font-weight:900;color:#fff;letter-spacing:-1.5px;}
        .logo-sub{font-size:12px;font-weight:300;color:rgba(255,255,255,0.3);margin-top:6px;}
        .greeting{font-size:14px;color:rgba(100,223,223,0.7);margin-top:14px;}
        .inp{width:100%;padding:14px 16px;border-radius:14px;border:0.5px solid rgba(100,223,223,0.2);font-size:15px;margin-bottom:12px;background:rgba(255,255,255,0.07);color:#fff;outline:none;display:block;font-family:'Rubik',sans-serif;}
        .inp:focus{border-color:#64dfdf;}
        .inp::placeholder{color:rgba(255,255,255,0.25);}
        .btn-main{width:100%;padding:15px;border-radius:14px;border:none;background:#64dfdf;color:#0d2137;font-size:15px;font-weight:700;cursor:pointer;font-family:'Rubik',sans-serif;margin-bottom:10px;display:block;}
        .btn-main:disabled{opacity:0.5;cursor:default;}
        .btn-sec{width:100%;padding:13px;border-radius:14px;border:0.5px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.4);font-size:13px;cursor:pointer;font-family:'Rubik',sans-serif;display:block;}
        .err{background:rgba(255,107,107,0.1);border:0.5px solid rgba(255,107,107,0.3);border-radius:12px;padding:10px 14px;margin-bottom:14px;color:#ff6b6b;font-size:13px;}
        .div{height:0.5px;background:rgba(255,255,255,0.07);margin:18px 0;}
        .lang-toggle{position:absolute;top:16px;left:16px;display:flex;gap:6px;}
        .lang-btn{padding:4px 10px;border-radius:20px;border:0.5px solid rgba(100,223,223,0.3);background:transparent;color:rgba(255,255,255,0.5);font-size:12px;cursor:pointer;font-family:'Rubik',sans-serif;transition:all 0.15s;}
        .lang-btn.active{background:rgba(100,223,223,0.15);color:#64dfdf;border-color:#64dfdf;}
        .legal{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:20px;}
        .legal a{color:rgba(255,255,255,0.25);font-size:11px;text-decoration:none;font-family:'Rubik',sans-serif;transition:color 0.15s;}
        .legal a:hover{color:rgba(100,223,223,0.6);}
        .legal span{color:rgba(255,255,255,0.1);font-size:11px;}
        .btn-google{width:100%;padding:14px;border-radius:14px;border:0.5px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.95);color:#1f1f1f;font-size:15px;font-weight:600;cursor:pointer;font-family:'Rubik',sans-serif;margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:10px;transition:background 0.15s;}
        .btn-google:hover{background:#fff;}
        .btn-google:disabled{opacity:0.5;cursor:default;}
        .or-divider{display:flex;align-items:center;gap:10px;margin-bottom:16px;}
        .or-divider span{color:rgba(255,255,255,0.2);font-size:12px;white-space:nowrap;}
        .or-divider::before,.or-divider::after{content:'';flex:1;height:0.5px;background:rgba(255,255,255,0.08);}
      `}</style>
      <div className="page" dir={dir}>
        <div className="card">
          {/* Language toggle */}
          <div className="lang-toggle">
            <button className={`lang-btn${lang === "he" ? " active" : ""}`} onClick={() => setLang("he")}>עב</button>
            <button className={`lang-btn${lang === "en" ? " active" : ""}`} onClick={() => setLang("en")}>EN</button>
          </div>

          <div className="logo">
            <div className="logo-name">{t("login_title", lang)}</div>
            <div className="logo-sub">{t("login_subtitle", lang)}</div>
            <div className="greeting">{isNew ? t("login_greeting_new", lang) : t("login_greeting_existing", lang)}</div>
          </div>

          <input className="inp" type="email" value={emailVal}
            onChange={ev => setEmailVal(ev.target.value)}
            placeholder={t("login_email", lang)}
            dir="ltr"
            autoComplete="email"/>
          <input className="inp" type="password" value={passVal}
            onChange={ev => setPassVal(ev.target.value)}
            placeholder={t("login_password", lang)}
            dir="ltr"
            onKeyDown={ev => { if (ev.key === "Enter") doSubmit(); }}
            autoComplete={isNew ? "new-password" : "current-password"}/>

          {errMsg && <div className="err">⚠️ {errMsg}</div>}

          <button className="btn-main" onClick={doSubmit} disabled={busy}>
            {busy ? "⏳" : isNew ? t("login_register_btn", lang) : t("login_btn", lang)}
          </button>

          <div className="or-divider"><span>{t("login_or", lang)}</span></div>

          <button className="btn-google" onClick={doGoogle} disabled={busy}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.1-6.1C34.46 3.09 29.53 1 24 1 14.82 1 7.07 6.48 3.62 14.22l7.14 5.54C12.44 13.61 17.76 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.1 24.5c0-1.64-.15-3.22-.42-4.74H24v8.98h12.42c-.54 2.9-2.17 5.36-4.63 7.01l7.14 5.54C43.19 37.26 46.1 31.33 46.1 24.5z"/>
              <path fill="#FBBC05" d="M10.76 28.24A14.54 14.54 0 0 1 9.5 24c0-1.48.25-2.91.7-4.24l-7.14-5.54A23.93 23.93 0 0 0 0 24c0 3.87.92 7.53 2.56 10.78l8.2-6.54z"/>
              <path fill="#34A853" d="M24 47c5.53 0 10.17-1.83 13.56-4.97l-7.14-5.54C28.65 38.1 26.45 39 24 39c-6.24 0-11.56-4.11-13.24-9.76l-8.2 6.54C6.07 43.52 14.43 47 24 47z"/>
            </svg>
            {t("login_google", lang)}
          </button>

          <div className="div"/>
          <button className="btn-sec" onClick={() => { setIsNew(n => !n); setErrMsg(""); }}>
            {isNew ? t("login_switch_existing", lang) : t("login_switch_new", lang)}
          </button>

          {/* Legal footer – inside card so it's always below */}
          <div className="legal">
            <a href="/privacy">{lang === "he" ? "מדיניות פרטיות" : "Privacy Policy"}</a>
            <span>·</span>
            <a href="/terms">{lang === "he" ? "תנאי שימוש" : "Terms of Service"}</a>
            <span>·</span>
            <a href="/contact">{lang === "he" ? "צור קשר" : "Contact"}</a>
          </div>
        </div>
      </div>
    </>
  );
}
