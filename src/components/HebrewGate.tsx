"use client";
import { useEffect, useState, type ReactNode } from "react";
import { ForcedLang, useLang } from "@/lib/LangContext";
import { PageLinksProvider } from "@/lib/pageLinks";
import type { LangPaths } from "@/components/LocalizedPage";
import type { Lang } from "@/lib/i18n";

const BAR = {
  en: { text: "This page is also available in English.", link: "View in English" },
  es: { text: "Esta página también está disponible en español.", link: "Ver en español" },
} as const;

// The Hebrew marketing pages (/, /features, /plan). They render in Hebrew for
// everyone who has not chosen a language, so the server HTML, a crawler and a
// first-time visitor all see the same Hebrew page; English and Spanish live at
// /en and /es. A visitor's own saved choice, and the device language inside the
// native app, still win. Visitors on the web whose browser is English or Spanish
// get a dismissible bar instead of an automatic redirect, which would also send
// crawlers away from the Hebrew URL.
export default function HebrewGate({ paths, children }: { paths: LangPaths; children: ReactNode }) {
  const { lang, source } = useLang();
  const [native, setNative] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    setNative(!!cap?.isNativePlatform?.());
    try {
      setDismissed(sessionStorage.getItem("tulon_langbar_off") === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const keepVisitorLang = source === "saved" || native;
  const pinned: Lang = keepVisitorLang ? lang : "he";

  // Keep <html lang/dir> in step with the pinned language (DirSetter honours this).
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.langPinned = pinned;
    root.lang = pinned;
    root.dir = pinned === "he" ? "rtl" : "ltr";
    return () => {
      delete root.dataset.langPinned;
      root.lang = lang;
      root.dir = lang === "he" ? "rtl" : "ltr";
    };
  }, [pinned, lang]);
  const offer = !native && source === "device" && (lang === "en" || lang === "es") ? lang : null;

  const close = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("tulon_langbar_off", "1");
    } catch {
      /* storage blocked: the bar just comes back next page */
    }
  };

  return (
    <ForcedLang lang={pinned}>
      <PageLinksProvider value={{ prefix: "", langLinks: paths }}>
        {offer && !dismissed && (
          <div
            dir="ltr"
            style={{
              background: "#0a3050",
              color: "rgba(255,255,255,0.85)",
              fontFamily: "'Rubik',sans-serif",
              fontSize: 13,
              padding: "8px 14px",
              display: "flex",
              gap: 12,
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              borderBottom: "0.5px solid rgba(100,223,223,0.2)",
            }}
          >
            <span>{BAR[offer].text}</span>
            <a href={paths[offer]} style={{ color: "#64dfdf", fontWeight: 700 }}>
              {BAR[offer].link}
            </a>
            <button
              onClick={close}
              aria-label="Close"
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 16 }}
            >
              ×
            </button>
          </div>
        )}
        {children}
      </PageLinksProvider>
    </ForcedLang>
  );
}
