// The marketing pages that exist in Hebrew (root) and in /en and /es, with the
// hreflang set they share. x-default points at the English version.
export interface LocalizedPage {
  key: "home" | "features" | "plan" | "about" | "blog";
  he: string;
  en: string;
  es: string;
}

export const LOCALIZED_PAGES: Record<LocalizedPage["key"], LocalizedPage> = {
  home: { key: "home", he: "/", en: "/en", es: "/es" },
  features: { key: "features", he: "/features", en: "/en/features", es: "/es/features" },
  plan: { key: "plan", he: "/plan", en: "/en/plan", es: "/es/plan" },
  about: { key: "about", he: "/about", en: "/en/about", es: "/es/about" },
  blog: { key: "blog", he: "/blog", en: "/en/blog", es: "/es/blog" },
};

export const hreflang = (p: LocalizedPage): Record<string, string> => ({
  he: p.he,
  en: p.en,
  es: p.es,
  "x-default": p.en,
});

export const pagePaths = (p: LocalizedPage) => ({ he: p.he, en: p.en, es: p.es });

// Blog posts: the same post in three languages, each on its own URL.
export const blogPostPage = (slug: string): LocalizedPage => ({
  key: "blog",
  he: `/blog/${slug}`,
  en: `/en/blog/${slug}`,
  es: `/es/blog/${slug}`,
});
