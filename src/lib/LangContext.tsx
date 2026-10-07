"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Lang } from "./i18n";

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextType>({ lang: "he", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("he");

  useEffect(() => {
    const saved = localStorage.getItem("tulon_lang") as Lang | null;
    if (saved === "he" || saved === "en" || saved === "es") {
      setLangState(saved);
    } else {
      // Auto-detect from device language — Hebrew → he, Spanish → es, everything else → en
      const device = (navigator.language || "").toLowerCase();
      if (device.startsWith("he")) setLangState("he");
      else if (device.startsWith("es")) setLangState("es");
      else setLangState("en");
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("tulon_lang", l);
  };

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

// Pins everything beneath it to one language, ignoring the visitor's saved or
// device language. For single-language pages (the English SEO landing pages)
// that still reuse SiteNav/SiteFooter, so those render in English in the
// server-rendered HTML instead of defaulting to Hebrew.
export function ForcedLang({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={{ lang, setLang: () => {} }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
