import type { Metadata } from "next";

// One place that builds a consistent, self-referencing metadata block for
// every marketing page. Next.js does NOT merge `openGraph` field-by-field
// across nested layouts — a child that sets only `title` keeps the
// parent's (now-stale) `openGraph.title` — so each page layout builds its
// own complete block through this helper instead of relying on inheritance.
//
// Deliberately no `keywords`: Google treats a stuffed keyword list as a
// negative signal and ignores the meta keywords tag anyway. The target
// terms live naturally in the page copy instead.

export const SITE_URL = "https://www.tulon.app";
const SITE_NAME = "טיולון – Tulon";

export function pageMeta({
  title,
  description,
  path = "/",
  noindex = false,
}: {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: "he_IL",
      alternateLocale: ["en_US", "es_ES"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
