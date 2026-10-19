// The marketing pages that exist in Hebrew (root) and in /en and /es, with the
// hreflang set they share. x-default points at the English version.
export interface LocalizedPage {
  key: "home" | "features" | "plan" | "about";
  he: string;
  en: string;
  es: string;
}

export const LOCALIZED_PAGES: Record<LocalizedPage["key"], LocalizedPage> = {
  home: { key: "home", he: "/", en: "/en", es: "/es" },
  features: { key: "features", he: "/features", en: "/en/features", es: "/es/features" },
  plan: { key: "plan", he: "/plan", en: "/en/plan", es: "/es/plan" },
  about: { key: "about", he: "/about", en: "/en/about", es: "/es/about" },
};

export const hreflang = (p: LocalizedPage): Record<string, string> => ({
  he: p.he,
  en: p.en,
  es: p.es,
  "x-default": p.en,
});

export const pagePaths = (p: LocalizedPage) => ({ he: p.he, en: p.en, es: p.es });
