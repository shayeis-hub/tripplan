"use client";
import { useState } from "react";
import Link from "next/link";

export default function PrivacyPage() {
  const [lang, setLang] = useState<"he" | "en">("he");
  const isHe = lang === "he";
  const dir = isHe ? "rtl" : "ltr";

  return (
    <div style={{ minHeight: "100vh", background: "#0a1628", color: "#ffffff", fontFamily: "'Rubik',sans-serif", direction: dir }}>
      {/* Header */}
      <div style={{ background: "rgba(0,0,0,0.3)", borderBottom: "0.5px solid rgba(100,223,223,0.15)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ color: "#64dfdf", textDecoration: "none", fontWeight: 700, fontSize: 18 }}>
          {isHe ? "← טיולון" : "← TUlon"}
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setLang("he")} style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: lang === "he" ? "#64dfdf" : "rgba(255,255,255,0.08)", color: lang === "he" ? "#0a1628" : "#ffffff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>עב</button>
          <button onClick={() => setLang("en")} style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: lang === "en" ? "#64dfdf" : "rgba(255,255,255,0.08)", color: lang === "en" ? "#0a1628" : "#ffffff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>EN</button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#64dfdf", marginBottom: 8 }}>
          {isHe ? "מדיניות פרטיות" : "Privacy Policy"}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 40 }}>
          {isHe ? "עודכן לאחרונה: מאי 2025" : "Last updated: May 2025"}
        </p>

        {isHe ? <HeContent /> : <EnContent />}

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "0.5px solid rgba(255,255,255,0.1)", display: "flex", gap: 24, flexWrap: "wrap" }}>
          <Link href="/terms" style={{ color: "#64dfdf", fontSize: 13 }}>{isHe ? "תנאי שימוש" : "Terms of Service"}</Link>
          <Link href="/contact" style={{ color: "#64dfdf", fontSize: 13 }}>{isHe ? "צור קשר" : "Contact"}</Link>
          <Link href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{isHe ? "חזרה לאפליקציה" : "Back to App"}</Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", marginBottom: 12, paddingBottom: 8, borderBottom: "0.5px solid rgba(100,223,223,0.2)" }}>{title}</h2>
      <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}

function HeContent() {
  return (
    <>
      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>
        טיולון (&quot;השירות&quot;, &quot;האפליקציה&quot;) מפעיל אתר האינטרנט tulon.co.il ואפליקציית מתכנן הטיולים. דף זה מסביר כיצד אנו אוספים, משתמשים ומגנים על המידע שלך.
      </p>

      <Section title="1. מידע שאנו אוספים">
        <p><strong style={{ color: "#ffffff" }}>פרטי חשבון:</strong> כתובת אימייל וסיסמה מוצפנת, המשמשים לצורך הזדהות בלבד.</p>
        <p style={{ marginTop: 8 }}><strong style={{ color: "#ffffff" }}>נתוני טיול:</strong> יעדים, תאריכים, הוצאות, פעילויות ופרטי משתתפים שאתה מזין באפליקציה.</p>
        <p style={{ marginTop: 8 }}><strong style={{ color: "#ffffff" }}>תמונות קבלות:</strong> תמונות שתבחר לסרוק מועברות לשרת לצורך עיבוד ואינן נשמרות.</p>
        <p style={{ marginTop: 8 }}><strong style={{ color: "#ffffff" }}>התראות:</strong> אם תאשר, נשמר token להתראות push. לא נשלח ספאם.</p>
      </Section>

      <Section title="2. כיצד אנו משתמשים במידע">
        <ul style={{ paddingRight: 20, margin: 0 }}>
          <li>הפעלת השירות, שמירה וסנכרון נתוני הטיול שלך</li>
          <li>שיתוף טיול עם משתתפים שהזמנת</li>
          <li>שליחת תזכורות טיסה שביקשת</li>
          <li>המלצות מבוססות AI על יעד הטיול (ללא שמירת השיחה)</li>
        </ul>
        <p style={{ marginTop: 12 }}>אנחנו <strong style={{ color: "#ffffff" }}>לא מוכרים, לא משתפים ולא מסחרים</strong> את המידע שלך עם צדדים שלישיים.</p>
      </Section>

      <Section title="3. אחסון ואבטחה">
        <p>המידע מאוחסן ב-<strong style={{ color: "#ffffff" }}>Google Firebase</strong> עם הצפנה בתעבורה ובאחסון. הגישה מוגנת בחשבון המשתמש שלך בלבד.</p>
        <p style={{ marginTop: 8 }}>עיבוד תמונות קבלות מבוצע דרך <strong style={{ color: "#ffffff" }}>Anthropic API</strong> — התמונה מועברת לעיבוד בלבד ואינה נשמרת על שרתינו או שרתי Anthropic.</p>
      </Section>

      <Section title="4. שיתוף נתונים">
        <p>הנתונים שלך לא משותפים עם צדדים שלישיים, למעט:</p>
        <ul style={{ paddingRight: 20, margin: "8px 0 0" }}>
          <li><strong style={{ color: "#ffffff" }}>Google Firebase</strong> — תשתית האחסון</li>
          <li><strong style={{ color: "#ffffff" }}>Anthropic</strong> — עיבוד תמונות קבלות והמלצות בלבד</li>
          <li><strong style={{ color: "#ffffff" }}>Vercel</strong> — אירוח האפליקציה</li>
          <li>משתמשים שבחרת לשתף איתם טיול ספציפי</li>
        </ul>
      </Section>

      <Section title="5. זכויות המשתמש">
        <p>בכל עת תוכל:</p>
        <ul style={{ paddingRight: 20, margin: "8px 0 0" }}>
          <li>לצפות ולערוך את כל המידע שלך ישירות באפליקציה</li>
          <li>למחוק טיולים והוצאות</li>
          <li>לבקש מחיקת חשבונך המלאה בפנייה אלינו</li>
          <li>לבטל הרשמה לתזכורות push בכל עת</li>
        </ul>
      </Section>

      <Section title="6. קובצי Cookie ואחסון מקומי">
        <p>האפליקציה משתמשת ב-localStorage לשמירת העדפות שפה בלבד. אנחנו לא משתמשים ב-cookies למעקב.</p>
      </Section>

      <Section title="7. ילדים">
        <p>השירות אינו מיועד לילדים מתחת לגיל 13. איננו אוספים ביודעין מידע מקטינים.</p>
      </Section>

      <Section title="8. שינויים במדיניות">
        <p>שינויים מהותיים יפורסמו באפליקציה. המשך השימוש לאחר הפרסום מהווה הסכמה למדיניות המעודכנת.</p>
      </Section>

      <Section title="9. יצירת קשר">
        <p>לכל שאלה בנוגע לפרטיות: <a href="mailto:contact@tulon.co.il" style={{ color: "#64dfdf" }}>contact@tulon.co.il</a></p>
      </Section>
    </>
  );
}

function EnContent() {
  return (
    <>
      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>
        TUlon (&quot;the Service&quot;, &quot;the App&quot;) operates tulon.co.il and the TUlon trip planner application. This page explains how we collect, use, and protect your information.
      </p>

      <Section title="1. Information We Collect">
        <p><strong style={{ color: "#ffffff" }}>Account details:</strong> Email address and encrypted password, used solely for authentication.</p>
        <p style={{ marginTop: 8 }}><strong style={{ color: "#ffffff" }}>Trip data:</strong> Destinations, dates, expenses, activities, and participant details you enter in the app.</p>
        <p style={{ marginTop: 8 }}><strong style={{ color: "#ffffff" }}>Receipt images:</strong> Photos you choose to scan are sent to the server for processing only and are not stored.</p>
        <p style={{ marginTop: 8 }}><strong style={{ color: "#ffffff" }}>Notifications:</strong> If you consent, we store a push notification token. We do not send spam.</p>
      </Section>

      <Section title="2. How We Use Your Information">
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>Operating the service, saving and syncing your trip data</li>
          <li>Sharing a trip with participants you invite</li>
          <li>Sending flight reminders you requested</li>
          <li>AI-based recommendations for your destination (conversations are not stored)</li>
        </ul>
        <p style={{ marginTop: 12 }}>We <strong style={{ color: "#ffffff" }}>do not sell, share, or commercialize</strong> your data with third parties.</p>
      </Section>

      <Section title="3. Storage & Security">
        <p>Data is stored on <strong style={{ color: "#ffffff" }}>Google Firebase</strong> with encryption in transit and at rest. Access is protected by your user account only.</p>
        <p style={{ marginTop: 8 }}>Receipt image processing is handled via <strong style={{ color: "#ffffff" }}>Anthropic API</strong> — images are transferred for processing only and are not stored on our servers or Anthropic&apos;s servers.</p>
      </Section>

      <Section title="4. Data Sharing">
        <p>Your data is not shared with third parties, except:</p>
        <ul style={{ paddingLeft: 20, margin: "8px 0 0" }}>
          <li><strong style={{ color: "#ffffff" }}>Google Firebase</strong> — storage infrastructure</li>
          <li><strong style={{ color: "#ffffff" }}>Anthropic</strong> — receipt processing and recommendations only</li>
          <li><strong style={{ color: "#ffffff" }}>Vercel</strong> — app hosting</li>
          <li>Users you explicitly chose to share a specific trip with</li>
        </ul>
      </Section>

      <Section title="5. Your Rights">
        <p>At any time you may:</p>
        <ul style={{ paddingLeft: 20, margin: "8px 0 0" }}>
          <li>View and edit all your data directly in the app</li>
          <li>Delete trips and expenses</li>
          <li>Request full account deletion by contacting us</li>
          <li>Unsubscribe from push notifications at any time</li>
        </ul>
      </Section>

      <Section title="6. Cookies & Local Storage">
        <p>The app uses localStorage to save language preferences only. We do not use tracking cookies.</p>
      </Section>

      <Section title="7. Children">
        <p>The service is not intended for children under 13. We do not knowingly collect information from minors.</p>
      </Section>

      <Section title="8. Policy Changes">
        <p>Material changes will be announced in the app. Continued use after publication constitutes acceptance of the updated policy.</p>
      </Section>

      <Section title="9. Contact">
        <p>For any privacy questions: <a href="mailto:contact@tulon.co.il" style={{ color: "#64dfdf" }}>contact@tulon.co.il</a></p>
      </Section>
    </>
  );
}
