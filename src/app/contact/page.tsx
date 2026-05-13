"use client";
import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [lang, setLang] = useState<"he" | "en">("he");
  const [copied, setCopied] = useState(false);
  const isHe = lang === "he";
  const dir = isHe ? "rtl" : "ltr";

  const copy = () => {
    navigator.clipboard.writeText("contact@tulon.co.il");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 24px 80px" }}>
        {/* Icon */}
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(100,223,223,0.1)", border: "0.5px solid rgba(100,223,223,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 24 }}>
          ✉️
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#64dfdf", marginBottom: 12 }}>
          {isHe ? "צור קשר" : "Contact Us"}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.8, marginBottom: 40 }}>
          {isHe
            ? "שמחים לשמוע ממך — שאלות, בעיות, רעיונות או כל דבר אחר."
            : "We'd love to hear from you — questions, issues, ideas, or anything else."}
        </p>

        {/* Email card */}
        <div style={{ background: "rgba(100,223,223,0.06)", border: "0.5px solid rgba(100,223,223,0.25)", borderRadius: 16, padding: "20px 24px", marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(100,223,223,0.6)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>
            {isHe ? "אימייל" : "Email"}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <a href="mailto:contact@tulon.co.il" style={{ color: "#ffffff", fontSize: 18, fontWeight: 700, textDecoration: "none", letterSpacing: "-0.3px" }}>
              contact@tulon.co.il
            </a>
            <button onClick={copy} style={{ padding: "7px 14px", borderRadius: 8, border: "0.5px solid rgba(100,223,223,0.3)", background: copied ? "rgba(100,223,223,0.2)" : "rgba(100,223,223,0.08)", color: "#64dfdf", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Rubik',sans-serif", transition: "all 0.2s", whiteSpace: "nowrap" }}>
              {copied ? (isHe ? "✓ הועתק" : "✓ Copied") : (isHe ? "📋 העתק" : "📋 Copy")}
            </button>
          </div>
        </div>

        {/* Response time */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 18px", marginBottom: 40, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>⏱</span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
            {isHe ? "זמן תגובה ממוצע: עד 48 שעות" : "Average response time: up to 48 hours"}
          </span>
        </div>

        {/* Topics */}
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 14 }}>
          {isHe ? "במה נוכל לעזור?" : "How can we help?"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(isHe ? [
            { icon: "🐛", title: "דיווח על תקלה", desc: "משהו לא עובד כמו שצריך" },
            { icon: "💡", title: "רעיון לפיצ'ר", desc: "יש לך רעיון שישפר את האפליקציה" },
            { icon: "🔒", title: "פרטיות ומחיקת חשבון", desc: "בקשה למחיקת נתוניך" },
            { icon: "🤝", title: "שיתוף פעולה", desc: "עסקי, שיווקי או אחר" },
          ] : [
            { icon: "🐛", title: "Bug report", desc: "Something isn't working as expected" },
            { icon: "💡", title: "Feature idea", desc: "You have an idea to improve the app" },
            { icon: "🔒", title: "Privacy & account deletion", desc: "Request to delete your data" },
            { icon: "🤝", title: "Partnership", desc: "Business, marketing, or other" },
          ]).map(item => (
            <a key={item.title} href={`mailto:contact@tulon.co.il?subject=${encodeURIComponent(item.title)}`}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", textDecoration: "none", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(100,223,223,0.3)"; (e.currentTarget as HTMLElement).style.background = "rgba(100,223,223,0.05)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ color: "#ffffff", fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>{item.desc}</div>
              </div>
              <span style={{ color: "rgba(100,223,223,0.5)", fontSize: 16, marginRight: "auto", marginLeft: "auto" }}>←</span>
            </a>
          ))}
        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "0.5px solid rgba(255,255,255,0.1)", display: "flex", gap: 24, flexWrap: "wrap" }}>
          <Link href="/privacy" style={{ color: "#64dfdf", fontSize: 13 }}>{isHe ? "מדיניות פרטיות" : "Privacy Policy"}</Link>
          <Link href="/terms" style={{ color: "#64dfdf", fontSize: 13 }}>{isHe ? "תנאי שימוש" : "Terms of Service"}</Link>
          <Link href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{isHe ? "חזרה לאפליקציה" : "Back to App"}</Link>
        </div>
      </div>
    </div>
  );
}
