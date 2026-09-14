"use client";
import { useState } from "react";
import { Mail, Copy, Check } from "lucide-react";
import { useLang } from "@/lib/LangContext";

const T = {
  label: { he: "שתפו את הכתבה", en: "Share this post", es: "Comparte este artículo" },
} as const;

// Brand glyphs — lucide dropped its brand icons (Facebook/Twitter/etc. are
// trademarked logos), so these two are small inline SVGs, same approach as
// the store badges on the homepage.
function WhatsAppGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.48 1.32 5L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.46 17.5 2 12.04 2Zm5.8 14.16c-.25.7-1.24 1.28-2.02 1.44-.55.11-1.26.2-3.67-.79-3.08-1.28-5.07-4.4-5.22-4.6-.15-.2-1.24-1.65-1.24-3.15s.79-2.24 1.07-2.54c.27-.31.6-.38.8-.38h.58c.19 0 .44-.07.68.53.25.6.85 2.1.93 2.25.08.15.13.33.02.53-.11.2-.16.33-.32.5-.15.18-.32.4-.46.53-.15.15-.31.31-.13.61.18.31.79 1.31 1.7 2.12 1.17 1.05 2.16 1.37 2.47 1.52.31.15.49.13.68-.08.19-.2.79-.92.99-1.24.2-.31.4-.26.68-.15.27.1 1.73.82 2.02.97.29.15.49.23.56.35.08.13.08.75-.17 1.45Z"/>
    </svg>
  );
}
function FacebookGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
      <path d="M13.5 21v-8.02h2.69l.4-3.12h-3.09V7.85c0-.9.25-1.52 1.54-1.52h1.65V3.51C15.96 3.44 15.02 3.35 13.9 3.35c-2.34 0-3.94 1.43-3.94 4.05v2.46H7.25v3.12h2.71V21h3.54Z"/>
    </svg>
  );
}

const btnBase: React.CSSProperties = {
  width: 36, height: 36, borderRadius: "50%",
  display: "flex", alignItems: "center", justifyContent: "center",
  border: "none", cursor: "pointer", flexShrink: 0,
  transition: "transform 0.15s, opacity 0.15s",
};

// url should be the post's full canonical URL (e.g. `${SITE_URL}/blog/${slug}`),
// not window.location.href — keeps it stable and query-string-free.
export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const { lang } = useLang();
  const [copied, setCopied] = useState(false);

  const waHref = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const mailHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable — button just won't confirm */ }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: 0.3 }}>
        {T.label[lang]}
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        <a href={waHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
           style={{ ...btnBase, background: "#25D366" }}
           onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
           onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
          <WhatsAppGlyph />
        </a>
        <a href={fbHref} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
           style={{ ...btnBase, background: "#1877F2" }}
           onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
           onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
          <FacebookGlyph />
        </a>
        <a href={mailHref} aria-label="Email"
           style={{ ...btnBase, background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.15)" }}
           onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
           onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
          <Mail size={15} color="rgba(255,255,255,0.75)" strokeWidth={2}/>
        </a>
        <button onClick={copyLink} aria-label="Copy link"
           style={{ ...btnBase, background: copied ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.06)", border: `0.5px solid ${copied ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.15)"}` }}
           onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
           onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
          {copied ? <Check size={15} color="#4ade80" strokeWidth={2.5}/> : <Copy size={15} color="rgba(255,255,255,0.75)" strokeWidth={2}/>}
        </button>
      </div>
    </div>
  );
}
