"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Lang } from "./i18n";

// Where the current language came from:
//  "saved"   the visitor picked it (localStorage)
//  "device"  guessed from the browser language
//  "default" nothing known yet (first render, server render)
//  "forced"  pinned by the page (language-specific URLs)
export type LangSource = "saved" | "device" | "default" | "forced";

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  source: LangSource;
}

const LangContext = createContext<LangContextType>({ lang: "he", setLang: () => {}, source: "default" });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("he");
  const [source, setSource] = useState<LangSource>("default");

  useEffect(() => {
    const saved = localStorage.getItem("tulon_lang") as Lang | null;
    if (saved === "he" || saved === "en" || saved === "es") {
      setLangState(saved);
      setSource("saved");
    } else {
      // Auto-detect from device language — Hebrew → he, Spanish → es, everything else → en
      const device = (navigator.language || "").toLowerCase();
      if (device.startsWith("he")) setLangState("he");
      else if (device.startsWith("es")) setLangState("es");
      else setLangState("en");
      setSource("device");
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    setSource("saved");
    localStorage.setItem("tulon_lang", l);
  };

  return <LangContext.Provider value={{ lang, setLang, source }}>{children}</LangContext.Provider>;
}

// Pins everything beneath it to one language, ignoring the visitor's saved or
// device language. For pages whose language is decided by the URL (the English
// SEO landing pages, /en/*, /es/*, and the Hebrew marketing pages) so the
// server-rendered HTML and what a crawler sees match what a visitor gets.
export function ForcedLang({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={{ lang, setLang: () => {}, source: "forced" }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
