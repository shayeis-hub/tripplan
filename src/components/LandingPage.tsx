"use client";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Rubik', sans-serif; background: #0d2137; }
        .lp { font-family: 'Rubik', sans-serif; background: #0d2137; color: #fff; min-height: 100vh; direction: rtl; }

        /* Hero */
        .hero {
          background: linear-gradient(160deg, #091928 0%, #0d2137 60%, #0a3050 100%);
          padding: 70px 24px 60px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          top: -100px; right: -100px;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(100,223,223,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-inner { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }
        .hero-logo { font-size: 56px; font-weight: 900; color: #fff; letter-spacing: -2px; line-height: 1; margin-bottom: 8px; }
        .hero-logo span { color: #64dfdf; }
        .hero-tag { font-size: 15px; font-weight: 300; color: rgba(255,255,255,0.45); letter-spacing: 0.5px; margin-bottom: 20px; }
        .hero-desc { font-size: 18px; font-weight: 600; color: rgba(255,255,255,0.85); line-height: 1.6; margin-bottom: 36px; max-width: 480px; margin-left: auto; margin-right: auto; }
        .btn-cta {
          display: inline-block;
          background: #64dfdf;
          color: #0d2137;
          font-family: 'Rubik', sans-serif;
          font-size: 17px;
          font-weight: 800;
          padding: 16px 44px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          margin-bottom: 16px;
          box-shadow: 0 8px 32px rgba(100,223,223,0.3);
          transition: all 0.2s;
        }
        .btn-cta:hover { background: #4fd4d4; transform: translateY(-1px); }
        .btn-login {
          display: inline-block;
          background: transparent;
          color: rgba(255,255,255,0.5);
          font-family: 'Rubik', sans-serif;
          font-size: 14px;
          font-weight: 400;
          padding: 10px 24px;
          border-radius: 999px;
          border: 0.5px solid rgba(255,255,255,0.15);
          cursor: pointer;
          margin-right: 12px;
          transition: all 0.2s;
        }
        .btn-login:hover { color: rgba(255,255,255,0.8); border-color: rgba(255,255,255,0.3); }
        .hero-btns { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

        /* Features */
        .section { max-width: 700px; margin: 0 auto; padding: 56px 24px; }
        .section-title { font-size: 26px; font-weight: 800; color: #fff; text-align: center; margin-bottom: 8px; letter-spacing: -0.5px; }
        .section-sub { font-size: 14px; color: rgba(255,255,255,0.35); text-align: center; margin-bottom: 36px; }

        .features { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 520px) { .features { grid-template-columns: 1fr; } }
        .feat {
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(100,223,223,0.12);
          border-radius: 18px;
          padding: 22px 20px;
          transition: all 0.2s;
        }
        .feat:hover { background: rgba(100,223,223,0.06); border-color: rgba(100,223,223,0.25); }
        .feat-icon { font-size: 30px; margin-bottom: 10px; }
        .feat-title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .feat-desc { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.6; }

        /* Divider */
        .divider { height: 0.5px; background: rgba(100,223,223,0.1); max-width: 700px; margin: 0 auto; }

        /* How it works */
        .steps { display: flex; flex-direction: column; gap: 16px; }
        .step { display: flex; align-items: flex-start; gap: 16px; }
        .step-num {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(100,223,223,0.12); border: 0.5px solid rgba(100,223,223,0.3);
          color: #64dfdf; font-size: 16px; font-weight: 800;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .step-text { padding-top: 6px; }
        .step-title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 3px; }
        .step-desc { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.5; }

        /* Testimonial/highlight band */
        .band {
          background: linear-gradient(135deg, rgba(100,223,223,0.08), rgba(100,223,223,0.03));
          border-top: 0.5px solid rgba(100,223,223,0.12);
          border-bottom: 0.5px solid rgba(100,223,223,0.12);
          padding: 40px 24px;
          text-align: center;
        }
        .band-text { font-size: 20px; font-weight: 700; color: #fff; max-width: 500px; margin: 0 auto; line-height: 1.6; }
        .band-text span { color: #64dfdf; }

        /* Footer */
        .lp-footer {
          background: rgba(0,0,0,0.3);
          padding: 24px;
          text-align: center;
          font-size: 12px;
          color: rgba(255,255,255,0.2);
          border-top: 0.5px solid rgba(255,255,255,0.06);
        }
        .lp-footer a { color: rgba(255,255,255,0.25); text-decoration: none; margin: 0 10px; }
        .lp-footer a:hover { color: rgba(100,223,223,0.6); }
        .lp-footer .brand { color: #64dfdf; font-weight: 700; }
      `}</style>

      <div className="lp">

        {/* Hero */}
        <div className="hero">
          <div className="hero-inner">
            <div className="hero-logo">TU<span>lon</span></div>
            <div className="hero-tag">מתכנן הטיולים שלי</div>
            <div className="hero-desc">
              תכנן טיולים, עקוב אחרי הוצאות, ונהל התחשבנות עם חברי הטיול — הכל במקום אחד
            </div>
            <div className="hero-btns">
              <button className="btn-cta" onClick={() => router.push("/login")}>התחל בחינם</button>
              <button className="btn-login" onClick={() => router.push("/login")}>כניסה למשתמשים קיימים</button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="section">
          <div className="section-title">כל מה שצריך לטיול מושלם</div>
          <div className="section-sub">מניהול תקציב ועד יומן פעילויות — הכל במקום אחד</div>
          <div className="features">
            <div className="feat">
              <div className="feat-icon">💳</div>
              <div className="feat-title">ניהול הוצאות</div>
              <div className="feat-desc">רשום כל הוצאה בכל מטבע — האפליקציה ממירה לשקלים אוטומטית לפי שער חי</div>
            </div>
            <div className="feat">
              <div className="feat-icon">💸</div>
              <div className="feat-title">התחשבנות קבוצתית</div>
              <div className="feat-desc">בסוף הטיול — מי חייב כמה למי, חישוב אוטומטי מלא</div>
            </div>
            <div className="feat">
              <div className="feat-icon">📅</div>
              <div className="feat-title">יומן ומסלול</div>
              <div className="feat-desc">תכנן פעילויות לכל יום, ראה מה קורה בכל שעה עם תחזית מזג אוויר</div>
            </div>
            <div className="feat">
              <div className="feat-icon">🏨</div>
              <div className="feat-title">המלצות מלונות ופעילויות</div>
              <div className="feat-desc">חיפוש מלונות ב-Agoda ופעילויות ב-Viator — ישירות מתוך האפליקציה</div>
            </div>
            <div className="feat">
              <div className="feat-icon">👥</div>
              <div className="feat-title">שיתוף קבוצתי</div>
              <div className="feat-desc">שלח קישור הזמנה לוואטסאפ — כל חברי הטיול מצטרפים בלחיצה אחת</div>
            </div>
            <div className="feat">
              <div className="feat-icon">🎒</div>
              <div className="feat-title">רשימת אריזה ומפה</div>
              <div className="feat-desc">ניהול ציוד לפני הטיול, וכל מקומות הטיול על מפה אחת</div>
            </div>
          </div>
        </div>

        {/* Band */}
        <div className="band">
          <div className="band-text">
            מתאים לטיולים משפחתיים, קבוצות חברים ונסיעות עסקיות —<br/>
            <span>חינמי לחלוטין, ללא הגבלה</span>
          </div>
        </div>

        {/* How it works */}
        <div className="section">
          <div className="section-title">איך מתחילים?</div>
          <div className="section-sub">שלושה צעדים פשוטים</div>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <div className="step-text">
                <div className="step-title">נרשמים בחינם</div>
                <div className="step-desc">עם Google בלחיצה אחת, או עם אימייל וסיסמה</div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div className="step-text">
                <div className="step-title">יוצרים טיול ומוסיפים חברים</div>
                <div className="step-desc">שולחים קישור לכל הקבוצה — כולם רואים ומעדכנים בזמן אמת</div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div className="step-text">
                <div className="step-title">נהנים מהטיול</div>
                <div className="step-desc">מוסיפים הוצאות, מתכננים פעילויות — ובסוף מתחשבנים בלחיצה אחת</div>
              </div>
            </div>
          </div>
        </div>

        <div className="divider"/>

        {/* CTA bottom */}
        <div className="section" style={{textAlign:"center", paddingTop:40, paddingBottom:56}}>
          <div style={{fontSize:22, fontWeight:800, color:"#fff", marginBottom:10}}>מוכן לתכנן את הטיול הבא?</div>
          <div style={{fontSize:14, color:"rgba(255,255,255,0.35)", marginBottom:28}}>ללא עלות, ללא כרטיס אשראי</div>
          <button className="btn-cta" onClick={() => router.push("/login")}>התחל עכשיו — בחינם</button>
        </div>

        {/* Footer */}
        <div className="lp-footer">
          <div style={{marginBottom:10}}>
            <a href="/privacy">מדיניות פרטיות</a>
            <a href="/terms">תנאי שימוש</a>
            <a href="/contact">צור קשר</a>
            <a href="/guide-he.html">מדריך למשתמש</a>
          </div>
          <div><span className="brand">TUlon</span> – מתכנן הטיולים שלי &nbsp;·&nbsp; www.tulon.co.il</div>
        </div>

      </div>
    </>
  );
}
