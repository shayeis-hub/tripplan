"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";

type Step = "info" | "auth" | "confirm" | "done" | "error";

export default function DeleteAccountPage() {
  const [step, setStep]     = useState<Step>("info");
  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");
  const [busy, setBusy]     = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [lang, setLang]     = useState<"he"|"en">("he");

  const isHe = lang === "he";
  const dir  = isHe ? "rtl" : "ltr";

  const doDelete = async () => {
    if (!email || !pass) return;
    setBusy(true);
    setErrMsg("");
    try {
      // Sign in to verify identity
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const user = cred.user;

      // Delete all user's Firestore trips
      const tripsQ = query(collection(db, "trips"), where("owner", "==", user.uid));
      const snap = await getDocs(tripsQ);
      await Promise.all(snap.docs.map(d => deleteDoc(doc(db, "trips", d.id))));

      // Re-authenticate then delete auth account
      const credential = EmailAuthProvider.credential(email, pass);
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);

      setStep("done");
    } catch (e: any) {
      const code = e?.code || "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setErrMsg(isHe ? "אימייל או סיסמה שגויים" : "Incorrect email or password");
      } else if (code === "auth/user-not-found") {
        setErrMsg(isHe ? "משתמש לא נמצא" : "User not found");
      } else {
        setErrMsg(isHe ? `שגיאה: ${code}` : `Error: ${code}`);
      }
      setBusy(false);
    }
  };

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
      `}</style>

      <div className="page" dir={dir}>
        <div className="card">
          {/* Language toggle */}
          <div className="lang-toggle">
            <button className={`lang-btn${lang==="he"?" active":""}`} onClick={()=>setLang("he")}>עב</button>
            <button className={`lang-btn${lang==="en"?" active":""}`} onClick={()=>setLang("en")}>EN</button>
          </div>

          <div className="logo">
            {isHe ? <>טיולון</> : <><span>TU</span>lon</>}
          </div>

          {step === "info" && (
            <>
              <div className="title">
                {isHe ? "🗑️ מחיקת חשבון" : "🗑️ Delete Account"}
              </div>
              <div className="desc">
                {isHe
                  ? "מחיקת החשבון תסיר לצמיתות את כל הנתונים שלך מהמערכת. פעולה זו אינה הפיכה."
                  : "Deleting your account will permanently remove all your data from our system. This action cannot be undone."}
              </div>
              <div className="warn-box">
                <strong>{isHe ? "מה יימחק:" : "What will be deleted:"}</strong>
                <ul style={{paddingRight: isHe?"18px":undefined, paddingLeft: isHe?undefined:"18px", marginTop:6}}>
                  <li>{isHe ? "כל הטיולים שלך" : "All your trips"}</li>
                  <li>{isHe ? "כל ההוצאות והפעילויות" : "All expenses and activities"}</li>
                  <li>{isHe ? "פרטי החשבון (אימייל וסיסמה)" : "Account credentials (email & password)"}</li>
                </ul>
              </div>
              <button className="btn-del" onClick={()=>setStep("auth")}>
                {isHe ? "המשך למחיקת חשבון" : "Continue to Delete Account"}
              </button>
              <a className="btn-sec" href="/">
                {isHe ? "ביטול – חזור לאפליקציה" : "Cancel – Back to App"}
              </a>
            </>
          )}

          {step === "auth" && (
            <>
              <div className="title">
                {isHe ? "אימות זהות" : "Verify Identity"}
              </div>
              <div className="desc">
                {isHe
                  ? "הכנס את פרטי הכניסה שלך כדי לאמת את זהותך לפני המחיקה."
                  : "Enter your login credentials to verify your identity before deletion."}
              </div>

              {errMsg && <div className="err">⚠️ {errMsg}</div>}

              <input className="inp" type="email" dir="ltr"
                placeholder={isHe ? "אימייל" : "Email"}
                value={email} onChange={e=>setEmail(e.target.value)}
                autoComplete="email"/>
              <input className="inp" type="password" dir="ltr"
                placeholder={isHe ? "סיסמה" : "Password"}
                value={pass} onChange={e=>setPass(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter") setStep("confirm"); }}
                autoComplete="current-password"/>

              <button className="btn-del" onClick={()=>{ if(email&&pass) setStep("confirm"); }} disabled={!email||!pass}>
                {isHe ? "המשך" : "Continue"}
              </button>
              <div className="divider"/>
              <button className="btn-sec" onClick={()=>setStep("info")}>
                {isHe ? "חזור" : "Back"}
              </button>
            </>
          )}

          {step === "confirm" && (
            <>
              <div className="title">
                {isHe ? "⚠️ אישור סופי" : "⚠️ Final Confirmation"}
              </div>
              <div className="desc">
                {isHe
                  ? `האם אתה בטוח שברצונך למחוק לצמיתות את החשבון של ${email}? לא ניתן לשחזר פעולה זו.`
                  : `Are you sure you want to permanently delete the account for ${email}? This cannot be undone.`}
              </div>

              {errMsg && <div className="err">⚠️ {errMsg}</div>}

              <button className="btn-del" onClick={doDelete} disabled={busy}>
                {busy ? "⏳" : isHe ? "כן, מחק את החשבון שלי לצמיתות" : "Yes, permanently delete my account"}
              </button>
              <div className="divider"/>
              <button className="btn-sec" onClick={()=>{ setStep("info"); setErrMsg(""); }}>
                {isHe ? "ביטול" : "Cancel"}
              </button>
            </>
          )}

          {step === "done" && (
            <div className="success">
              <div className="icon">✅</div>
              <h2>{isHe ? "החשבון נמחק" : "Account Deleted"}</h2>
              <p>
                {isHe
                  ? "החשבון וכל הנתונים המשויכים אליו נמחקו לצמיתות. תודה שהשתמשת בטיולון."
                  : "Your account and all associated data have been permanently deleted. Thank you for using TUlon."}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
