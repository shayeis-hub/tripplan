"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithCredential,
  type User,
} from "firebase/auth";
import { useLang } from "@/lib/LangContext";

type Step = "info" | "auth" | "confirm" | "done" | "error";
type L = "he" | "en" | "es";

export default function DeleteAccountPage() {
  const { lang: appLang } = useLang();
  const [step, setStep]     = useState<Step>("info");
  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");
  const [signedInUser, setSignedInUser] = useState<User | null>(null);
  const [busy, setBusy]     = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [lang, setLang]     = useState<L>(() => appLang as L);

  const isHe = lang === "he";
  const dir  = isHe ? "rtl" : "ltr";
  const tr = (he: string, en: string, es: string) => lang === "he" ? he : lang === "es" ? es : en;

  // Used to only accept email/password — a Google- or Apple-only account
  // (no password ever set) could never get past this page at all. Every
  // provider now lands here the same way: sign in, then move to confirm.
  const doEmailAuth = async () => {
    if (!email || !pass) return;
    setBusy(true); setErrMsg("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      setSignedInUser(cred.user);
      setStep("confirm");
    } catch (e: any) {
      const code = e?.code || "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setErrMsg(tr("אימייל או סיסמה שגויים", "Incorrect email or password", "Correo o contraseña incorrectos"));
      } else if (code === "auth/user-not-found") {
        setErrMsg(tr("משתמש לא נמצא", "User not found", "Usuario no encontrado"));
      } else {
        setErrMsg(tr(`שגיאה: ${code}`, `Error: ${code}`, `Error: ${code}`));
      }
    } finally {
      setBusy(false);
    }
  };

  // Same native-vs-web branching as the regular login page (Capacitor has
  // no OAuth popup support inside its WebView).
  const doProviderAuth = async (which: "google" | "apple") => {
    setBusy(true); setErrMsg("");
    const cap = (window as any).Capacitor;
    try {
      if (cap?.isNativePlatform?.()) {
        const { FirebaseAuthentication } = cap.Plugins;
        const result = which === "google"
          ? await FirebaseAuthentication.signInWithGoogle()
          : await FirebaseAuthentication.signInWithApple();
        const idToken = result?.credential?.idToken;
        if (!idToken) throw new Error("no-id-token");
        const credential = which === "google"
          ? GoogleAuthProvider.credential(idToken)
          : new OAuthProvider("apple.com").credential({ idToken, rawNonce: result?.credential?.nonce });
        const cred = await signInWithCredential(auth, credential);
        setSignedInUser(cred.user);
        setStep("confirm");
      } else {
        const provider = which === "google" ? new GoogleAuthProvider() : new OAuthProvider("apple.com");
        const cred = await signInWithPopup(auth, provider);
        setSignedInUser(cred.user);
        setStep("confirm");
      }
    } catch (e: any) {
      const code = e?.code || e?.message || String(e);
      if (!/cancel|canceled|closed/i.test(code)) {
        setErrMsg(tr(`שגיאה: ${code}`, `Error: ${code}`, `Error: ${code}`));
      }
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    if (!signedInUser) return;
    setBusy(true);
    setErrMsg("");
    try {
      const idToken = await signedInUser.getIdToken();
      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStep("done");
    } catch (e: any) {
      setErrMsg(tr("מחיקת החשבון נכשלה. נסה שוב.", "Account deletion failed. Please try again.", "No se pudo eliminar la cuenta. Inténtalo de nuevo."));
      setBusy(false);
    }
  };

  const identityLabel = signedInUser?.email || signedInUser?.displayName || "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Rubik',sans-serif;background:#0d2137;min-height:100vh;}
        .page{min-height:100vh;background:linear-gradient(160deg,#091928,#0d2137,#0a2a40);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 20px;}
        .card{background:rgba(255,255,255,0.05);border:0.5px solid rgba(100,223,223,0.2);border-radius:24px;padding:36px 28px;width:100%;max-width:460px;}
        .logo{font-size:28px;font-weight:900;color:#fff;letter-spacing:-1px;margin-bottom:4px;}
        .logo span{color:#64dfdf;}
        .title{font-size:20px;font-weight:800;color:#ff6b6b;margin:20px 0 8px;}
        .desc{font-size:13px;color:rgba(255,255,255,0.5);line-height:1.7;margin-bottom:20px;}
        .warn-box{background:rgba(255,107,107,0.08);border:0.5px solid rgba(255,107,107,0.25);border-radius:12px;padding:14px 16px;margin-bottom:20px;font-size:12px;color:rgba(255,107,107,0.85);line-height:1.7;}
        .warn-box ul{padding-${isHe?"right":"left"}:18px;margin-top:6px;}
        .inp{width:100%;padding:14px 16px;border-radius:14px;border:0.5px solid rgba(100,223,223,0.2);font-size:15px;margin-bottom:12px;background:rgba(255,255,255,0.07);color:#fff;outline:none;display:block;font-family:'Rubik',sans-serif;}
        .inp:focus{border-color:#64dfdf;}
        .inp::placeholder{color:rgba(255,255,255,0.25);}
        .btn-del{width:100%;padding:15px;border-radius:14px;border:none;background:#ff6b6b;color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:'Rubik',sans-serif;margin-bottom:10px;}
        .btn-del:disabled{opacity:0.5;cursor:default;}
        .btn-provider{width:100%;padding:13px;border-radius:14px;border:0.5px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:'Rubik',sans-serif;margin-bottom:10px;}
        .btn-sec{width:100%;padding:13px;border-radius:14px;border:0.5px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.4);font-size:13px;cursor:pointer;font-family:'Rubik',sans-serif;display:block;text-align:center;text-decoration:none;}
        .err{background:rgba(255,107,107,0.1);border:0.5px solid rgba(255,107,107,0.3);border-radius:12px;padding:10px 14px;margin-bottom:14px;color:#ff6b6b;font-size:13px;}
        .success{text-align:center;padding:20px 0;}
        .success .icon{font-size:56px;margin-bottom:16px;}
        .success h2{font-size:20px;font-weight:800;color:#4ade80;margin-bottom:8px;}
        .success p{font-size:13px;color:rgba(255,255,255,0.45);line-height:1.6;}
        .lang-toggle{display:flex;gap:6px;margin-bottom:20px;}
        .lang-btn{padding:4px 10px;border-radius:20px;border:0.5px solid rgba(100,223,223,0.3);background:transparent;color:rgba(255,255,255,0.5);font-size:12px;cursor:pointer;font-family:'Rubik',sans-serif;}
        .lang-btn.active{background:rgba(100,223,223,0.15);color:#64dfdf;border-color:#64dfdf;}
        .divider{height:0.5px;background:rgba(255,255,255,0.07);margin:16px 0;}
        .divider-or{display:flex;align-items:center;gap:10px;margin:14px 0;font-size:11px;color:rgba(255,255,255,0.3);}
        .divider-or::before,.divider-or::after{content:"";flex:1;height:0.5px;background:rgba(255,255,255,0.1);}
        .ident{border-bottom:0.5px solid rgba(255,255,255,0.08);padding-bottom:14px;margin-bottom:4px;direction:ltr;text-align:${isHe?"right":"left"};}
        .ident-name{font-size:13px;font-weight:700;color:rgba(255,255,255,0.75);line-height:1.5;}
        .ident-row{font-size:11px;color:rgba(255,255,255,0.35);margin-top:3px;}
        .retain{font-size:11.5px;color:rgba(255,255,255,0.35);line-height:1.7;margin-bottom:18px;}
        .retain strong{color:rgba(255,255,255,0.55);}
      `}</style>

      <div className="page" dir={dir}>
        <div className="card">
          {/* Language toggle */}
          <div className="lang-toggle">
            {(["he","en","es"] as L[]).map(L => (
              <button key={L} className={`lang-btn${lang===L?" active":""}`} onClick={()=>setLang(L)}>
                {L === "he" ? "עב" : L === "en" ? "EN" : "ES"}
              </button>
            ))}
          </div>

          {/* App identity — required by Google Play's account-deletion policy:
              the page must clearly reference the app/developer as named in the
              Play listing. Kept static (not language-dependent) so it is always
              visible to a reviewer regardless of locale. */}
          <div className="logo">
            <span>TU</span>lon
          </div>
          <div className="ident">
            <div className="ident-name">טיולון – מתכנן הטיולים שלי (Tulon – My Trip Planner)</div>
            <div className="ident-row">Google Play package: il.co.tulon.www.twa</div>
            <div className="ident-row">www.tulon.app · contact@tulon.app</div>
          </div>

          {step === "info" && (
            <>
              <div className="title">
                {tr("מחיקת חשבון", "Delete Account", "Eliminar cuenta")}
              </div>
              <div className="desc">
                {tr(
                  "מחיקת החשבון תסיר לצמיתות את כל הנתונים שלך מהמערכת. פעולה זו אינה הפיכה.",
                  "Deleting your account will permanently remove all your data from our system. This action cannot be undone.",
                  "Eliminar tu cuenta borrará permanentemente todos tus datos del sistema. Esta acción no se puede deshacer."
                )}
              </div>
              <div className="warn-box">
                <strong>{tr("מה יימחק:", "What will be deleted:", "Qué se eliminará:")}</strong>
                <ul style={{paddingRight: isHe?"18px":undefined, paddingLeft: isHe?undefined:"18px", marginTop:6}}>
                  <li>{tr("כל הטיולים שלך", "All your trips", "Todos tus viajes")}</li>
                  <li>{tr("כל ההוצאות והפעילויות", "All expenses and activities", "Todos los gastos y actividades")}</li>
                  <li>{tr("פרופיל המטייל ומנוי ההתראות שלך", "Your traveler profile and notification subscription", "Tu perfil de viajero y suscripción de notificaciones")}</li>
                  <li>{tr("פרטי החשבון (בכל שיטת התחברות)", "Account credentials (any sign-in method)", "Datos de la cuenta (cualquier método de acceso)")}</li>
                </ul>
              </div>
              <div className="retain">
                <strong>{tr("שמירת נתונים:", "Data retention:", "Retención de datos:")}</strong>{" "}
                {tr(
                  "המחיקה מתבצעת מיד ולצמיתות. לא נשמרים אצלנו נתונים נוספים לאחר המחיקה, למעט רשומות שאנו מחויבים לשמור על פי חוק. טיולים ששותפו איתך על ידי משתמשים אחרים נשארים בבעלותם, אך כבר לא יהיו משותפים עם החשבון שנמחק.",
                  "Deletion is immediate and permanent. No further data is retained after deletion, except records we are legally required to keep. Trips that other users shared with you remain owned by them, but are no longer shared with the deleted account.",
                  "La eliminación es inmediata y permanente. No conservamos más datos tras la eliminación, salvo los registros que estemos legalmente obligados a mantener. Los viajes que otros usuarios compartieron contigo siguen siendo de su propiedad, pero dejarán de estar compartidos con la cuenta eliminada."
                )}
              </div>
              <button className="btn-del" onClick={()=>setStep("auth")}>
                {tr("המשך למחיקת חשבון", "Continue to Delete Account", "Continuar con la eliminación")}
              </button>
              <a className="btn-sec" href="/">
                {tr("ביטול – חזור לאפליקציה", "Cancel – Back to App", "Cancelar – Volver a la app")}
              </a>
            </>
          )}

          {step === "auth" && (
            <>
              <div className="title">
                {tr("אימות זהות", "Verify Identity", "Verificar identidad")}
              </div>
              <div className="desc">
                {tr(
                  "התחבר עם שיטת ההתחברות שבה נרשמת, כדי לאמת את זהותך לפני המחיקה.",
                  "Sign in with whichever method you originally used, to verify your identity before deletion.",
                  "Inicia sesión con el método que usaste originalmente, para verificar tu identidad antes de eliminar la cuenta."
                )}
              </div>

              {errMsg && <div className="err">{errMsg}</div>}

              <button className="btn-provider" disabled={busy} onClick={()=>doProviderAuth("google")}>
                {tr("המשך עם Google", "Continue with Google", "Continuar con Google")}
              </button>
              <button className="btn-provider" disabled={busy} onClick={()=>doProviderAuth("apple")}>
                {tr("המשך עם Apple", "Continue with Apple", "Continuar con Apple")}
              </button>

              <div className="divider-or">{tr("או עם אימייל וסיסמה", "or with email & password", "o con correo y contraseña")}</div>

              <input className="inp" type="email" dir="ltr"
                placeholder={tr("אימייל", "Email", "Correo electrónico")}
                value={email} onChange={e=>setEmail(e.target.value)}
                autoComplete="email"/>
              <input className="inp" type="password" dir="ltr"
                placeholder={tr("סיסמה", "Password", "Contraseña")}
                value={pass} onChange={e=>setPass(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter") doEmailAuth(); }}
                autoComplete="current-password"/>

              <button className="btn-del" onClick={doEmailAuth} disabled={!email||!pass||busy}>
                {tr("המשך", "Continue", "Continuar")}
              </button>
              <div className="divider"/>
              <button className="btn-sec" onClick={()=>{ setStep("info"); setErrMsg(""); }}>
                {tr("חזור", "Back", "Atrás")}
              </button>
            </>
          )}

          {step === "confirm" && (
            <>
              <div className="title">
                {tr("אישור סופי", "Final Confirmation", "Confirmación final")}
              </div>
              <div className="desc">
                {tr(
                  `האם אתה בטוח שברצונך למחוק לצמיתות את החשבון של ${identityLabel}? לא ניתן לשחזר פעולה זו.`,
                  `Are you sure you want to permanently delete the account for ${identityLabel}? This cannot be undone.`,
                  `¿Estás seguro de que deseas eliminar permanentemente la cuenta de ${identityLabel}? Esta acción no se puede deshacer.`
                )}
              </div>

              {errMsg && <div className="err">{errMsg}</div>}

              <button className="btn-del" onClick={doDelete} disabled={busy}>
                {busy ? tr("מוחק...", "Deleting...", "Eliminando...") : tr("כן, מחק את החשבון שלי לצמיתות", "Yes, permanently delete my account", "Sí, eliminar mi cuenta permanentemente")}
              </button>
              <div className="divider"/>
              <button className="btn-sec" onClick={()=>{ setStep("info"); setErrMsg(""); setSignedInUser(null); }}>
                {tr("ביטול", "Cancel", "Cancelar")}
              </button>
            </>
          )}

          {step === "done" && (
            <div className="success">
              <h2>{tr("החשבון נמחק", "Account Deleted", "Cuenta eliminada")}</h2>
              <p>
                {tr(
                  "החשבון וכל הנתונים המשויכים אליו נמחקו לצמיתות. תודה שהשתמשת בטיולון.",
                  "Your account and all associated data have been permanently deleted. Thank you for using TUlon.",
                  "Tu cuenta y todos los datos asociados se han eliminado permanentemente. Gracias por usar TUlon."
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
