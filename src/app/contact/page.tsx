"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, Clock, Copy, Check, Bug, Lightbulb, Lock, Users } from "lucide-react";
import { useLang } from "@/lib/LangContext";

export default function ContactPage() {
  const { lang: appLang } = useLang();
  const [lang, setLang] = useState<"he" | "en">(() => appLang as "he" | "en");
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
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(100,223,223,0.1)", border: "0.5px solid rgba(100,223,223,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <Mail size={32} color="#64dfdf" strokeWidth={1.5}/>
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
              {copied ? <><Check size={13} strokeWidth={2.5}/> {isHe ? "הועתק" : "Copied"}</> : <><Copy size={13} strokeWidth={1.5}/> {isHe ? "העתק" : "Copy"}</>}
            </button>
          </div>
        </div>

        {/* Response time */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 18px", marginBottom: 40, display: "flex", alignItems: "center", gap: 12 }}>
          <Clock size={18} color="rgba(255,255,255,0.3)" strokeWidth={1.5}/>
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
            { Icon: Bug,         color: "#f472b6", bg: "rgba(244,114,182,0.12)", title: "דיווח על תקלה",       desc: "משהו לא עובד כמו שצריך" },
            { Icon: Lightbulb,   color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  title: "רעיון לפיצ'ר",      desc: "יש לך רעיון שישפר את האפליקציה" },
            { Icon: Lock,        color: "#818cf8", bg: "rgba(129,140,248,0.12)", title: "פרטיות ומחיקת חשבון", desc: "בקשה למחיקת נתוניך" },
            { Icon: Users,       color: "#4ade80", bg: "rgba(74,222,128,0.12)",  title: "שיתוף פעולה",        desc: "עסקי, שיווקי או אחר" },
          ] : [
            { Icon: Bug,         color: "#f472b6", bg: "rgba(244,114,182,0.12)", title: "Bug report",              desc: "Something isn't working as expected" },
            { Icon: Lightbulb,   color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  title: "Feature idea",            desc: "You have an idea to improve the app" },
            { Icon: Lock,        color: "#818cf8", bg: "rgba(129,140,248,0.12)", title: "Privacy & account deletion", desc: "Request to delete your data" },
            { Icon: Users,       color: "#4ade80", bg: "rgba(74,222,128,0.12)",  title: "Partnership",             desc: "Business, marketing, or other" },
          ]).map(item => (
            <a key={item.title} href={`mailto:contact@tulon.co.il?subject=${encodeURIComponent(item.title)}`}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", textDecoration: "none", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(100,223,223,0.3)"; (e.currentTarget as HTMLElement).style.background = "rgba(100,223,223,0.05)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: item.bg, border: `0.5px solid ${item.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <item.Icon size={20} color={item.color} strokeWidth={1.5}/>
              </div>
              <div>
                <div style={{ color: "#ffffff", fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>{item.desc}</div>
              </div>
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
