"use client";
import { createContext, useContext, ReactNode } from "react";

// Where the language-aware marketing chrome (SiteNav, SiteFooter, LandingPage)
// should link. Default (no provider) is the original behaviour: Hebrew-root
// paths and client-side language buttons.
export interface PageLinks {
  // "" for the Hebrew root pages, "/en" or "/es" on the language-specific copies.
  prefix: string;
  // When set, the language buttons become real links to this page in each language.
  langLinks?: { he: string; en: string; es: string };
}

const PageLinksContext = createContext<PageLinks>({ prefix: "" });

export function PageLinksProvider({ value, children }: { value: PageLinks; children: ReactNode }) {
  return <PageLinksContext.Provider value={value}>{children}</PageLinksContext.Provider>;
}

export const usePageLinks = () => useContext(PageLinksContext);
