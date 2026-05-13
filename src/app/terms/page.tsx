"use client";
import { useState } from "react";
import Link from "next/link";

export default function TermsPage() {
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
          {isHe ? "תנאי שימוש" : "Terms of Service"}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 40 }}>
          {isHe ? "עודכן לאחרונה: מאי 2025" : "Last updated: May 2025"}
        </p>

        {isHe ? <HeContent /> : <EnContent />}

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "0.5px solid rgba(255,255,255,0.1)", display: "flex", gap: 24, flexWrap: "wrap" }}>
          <Link href="/privacy" style={{ color: "#64dfdf", fontSize: 13 }}>{isHe ? "מדיניות פרטיות" : "Privacy Policy"}</Link>
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
        ברוך הבא לטיולון. השימוש באפליקציה מהווה הסכמה לתנאים הבאים. אם אינך מסכים — אנא הפסק את השימוש.
      </p>

      <Section title="1. השירות">
        <p>טיולון היא אפליקציית ניהול טיולים המאפשרת תכנון יעדים, מעקב הוצאות, לוח שנה, המלצות ושיתוף עם חברי טיול. השירות ניתן &quot;כפי שהוא&quot; (As-Is).</p>
      </Section>

      <Section title="2. חשבון משתמש">
        <ul style={{ paddingRight: 20, margin: 0 }}>
          <li>עליך להיות בן 13 ומעלה לשימוש בשירות</li>
          <li>אתה אחראי לשמירת סיסמתך בסוד</li>
          <li>חשבון אחד לאדם אחד — אין לשתף גישה</li>
          <li>אנו שומרים לעצמנו הזכות לחסום חשבונות שמפרים את התנאים</li>
        </ul>
      </Section>

      <Section title="3. שימוש מותר">
        <p>מותר להשתמש בשירות לצורכים אישיים ולא מסחריים. אסור:</p>
        <ul style={{ paddingRight: 20, margin: "8px 0 0" }}>
          <li>להשתמש בשירות לפעילות בלתי חוקית</li>
          <li>לנסות לפרוץ, לסרוק או להפריע לתפקוד השירות</li>
          <li>להעלות תוכן פוגעני, מזויף או המפר זכויות יוצרים</li>
          <li>למכור גישה לשירות לאחרים</li>
        </ul>
      </Section>

      <Section title="4. קניין רוחני">
        <p>כל הקוד, העיצוב והתוכן של האפליקציה שייכים לטיולון. המידע שאתה מזין (יעדים, הוצאות וכד&apos;) שייך לך.</p>
      </Section>

      <Section title="5. תשלום ומנוי">
        <p>השירות ניתן כרגע ללא תשלום. אם בעתיד יתווספו תכניות בתשלום, תישלח הודעה מראש ותינתן האפשרות לבחור.</p>
      </Section>

      <Section title="6. ביטול וסיום">
        <p>תוכל להפסיק את השימוש בכל עת. לבקשת מחיקת חשבון פנה אלינו ב-<a href="mailto:contact@tulon.co.il" style={{ color: "#64dfdf" }}>contact@tulon.co.il</a>. נמחק את הנתונים שלך תוך 30 יום.</p>
        <p style={{ marginTop: 8 }}>אנו שומרים לעצמנו הזכות לסגור חשבונות שמפרים את התנאים, לאחר התראה.</p>
      </Section>

      <Section title="7. הגבלת אחריות">
        <p>טיולון אינה אחראית לנזקים ישירים או עקיפים הנובעים מהשימוש באפליקציה, כולל:</p>
        <ul style={{ paddingRight: 20, margin: "8px 0 0" }}>
          <li>אובדן נתונים עקב תקלה טכנית</li>
          <li>אי-דיוקים בנתוני מטבע, מזג אוויר או המלצות AI</li>
          <li>קישורים חיצוניים (Booking.com, Agoda וכד&apos;)</li>
        </ul>
        <p style={{ marginTop: 8 }}>ההמלצות המוצגות (מסעדות, אטרקציות) מבוססות על AI ואינן מהוות אחריות מקצועית.</p>
      </Section>

      <Section title="8. שינויים בשירות">
        <p>אנו עשויים לשנות, להשעות או להפסיק חלקים מהשירות בכל עת. נודיע על שינויים מהותיים מראש ככל האפשר.</p>
      </Section>

      <Section title="9. דין חל">
        <p>תנאים אלה כפופים לחוקי מדינת ישראל. כל מחלוקת תידון בבתי המשפט המוסמכים בישראל.</p>
      </Section>

      <Section title="10. יצירת קשר">
        <p>שאלות בנוגע לתנאים: <a href="mailto:contact@tulon.co.il" style={{ color: "#64dfdf" }}>contact@tulon.co.il</a></p>
      </Section>
    </>
  );
}

function EnContent() {
  return (
    <>
      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>
        Welcome to TUlon. By using the app, you agree to the following terms. If you disagree, please stop using the service.
      </p>

      <Section title="1. The Service">
        <p>TUlon is a trip management app that allows destination planning, expense tracking, calendar management, recommendations, and sharing with travel companions. The service is provided &quot;As-Is&quot;.</p>
      </Section>

      <Section title="2. User Account">
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>You must be 13 years or older to use the service</li>
          <li>You are responsible for keeping your password confidential</li>
          <li>One account per person — access sharing is not permitted</li>
          <li>We reserve the right to suspend accounts that violate these terms</li>
        </ul>
      </Section>

      <Section title="3. Permitted Use">
        <p>You may use the service for personal, non-commercial purposes. You may not:</p>
        <ul style={{ paddingLeft: 20, margin: "8px 0 0" }}>
          <li>Use the service for illegal activities</li>
          <li>Attempt to hack, scan, or disrupt the service</li>
          <li>Upload harmful, fraudulent, or copyright-infringing content</li>
          <li>Resell or sublicense access to the service</li>
        </ul>
      </Section>

      <Section title="4. Intellectual Property">
        <p>All code, design, and content of the application belongs to TUlon. The data you enter (destinations, expenses, etc.) belongs to you.</p>
      </Section>

      <Section title="5. Payment & Subscription">
        <p>The service is currently provided free of charge. If paid plans are introduced in the future, advance notice will be given and you will have the option to choose.</p>
      </Section>

      <Section title="6. Cancellation & Termination">
        <p>You may stop using the service at any time. To request account deletion, contact us at <a href="mailto:contact@tulon.co.il" style={{ color: "#64dfdf" }}>contact@tulon.co.il</a>. We will delete your data within 30 days.</p>
        <p style={{ marginTop: 8 }}>We reserve the right to close accounts that violate these terms, following notice where possible.</p>
      </Section>

      <Section title="7. Limitation of Liability">
        <p>TUlon is not liable for direct or indirect damages arising from use of the app, including:</p>
        <ul style={{ paddingLeft: 20, margin: "8px 0 0" }}>
          <li>Data loss due to technical failure</li>
          <li>Inaccuracies in currency rates, weather data, or AI recommendations</li>
          <li>External links (Booking.com, Agoda, etc.)</li>
        </ul>
        <p style={{ marginTop: 8 }}>Recommendations shown (restaurants, attractions) are AI-generated and do not constitute professional advice.</p>
      </Section>

      <Section title="8. Service Changes">
        <p>We may modify, suspend, or discontinue parts of the service at any time. We will provide advance notice of material changes where possible.</p>
      </Section>

      <Section title="9. Governing Law">
        <p>These terms are governed by the laws of the State of Israel. Any disputes shall be handled by the competent courts of Israel.</p>
      </Section>

      <Section title="10. Contact">
        <p>Questions about these terms: <a href="mailto:contact@tulon.co.il" style={{ color: "#64dfdf" }}>contact@tulon.co.il</a></p>
      </Section>
    </>
  );
}
