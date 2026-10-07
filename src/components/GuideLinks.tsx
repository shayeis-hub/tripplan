"use client";
import { useLang } from "@/lib/LangContext";

// A quiet "guides" row for the homepage and /plan: contextual links to the
// three English SEO landing pages without adding anything to the main nav.
// The link text is English because the pages are; only the label localizes.
const LABEL = {
  he: "מדריכים (באנגלית)",
  en: "Guides",
  es: "Guías (en inglés)",
} as const;

const LINKS = [
  { href: "/group-trip-planner", text: "Group trip planner" },
  { href: "/group-travel-expense-tracker", text: "Group travel expense tracker" },
  { href: "/splitwise-alternative-for-travel", text: "Splitwise alternative for travel" },
];

export default function GuideLinks() {
  const { lang } = useLang();
  return (
    <nav
      aria-label={LABEL[lang]}
      style={{
        display: "flex", flexWrap: "wrap", gap: "6px 18px", justifyContent: "center",
        alignItems: "center", padding: "6px 24px 26px", fontFamily: "'Rubik',sans-serif",
      }}
    >
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{LABEL[lang]}:</span>
      {LINKS.map(l => (
        <a
          key={l.href}
          href={l.href}
          dir="ltr"
          style={{ fontSize: 13, color: "rgba(100,223,223,0.75)", textDecoration: "none", fontWeight: 500 }}
        >
          {l.text}
        </a>
      ))}
    </nav>
  );
}
