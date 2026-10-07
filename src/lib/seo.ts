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

const SITE_NAME = "טיולון – TUlon";

export function pageMeta({
  title,
  description,
  path = "/",
  noindex = false,
  locale,
  image,
}: {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
  // Defaults keep every existing caller unchanged (Hebrew-first site). The
  // English-only landing pages pass locale "en_US" and an explicit image.
  locale?: "en_US";
  image?: { url: string; width: number; height: number; alt: string };
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const isEn = locale === "en_US";
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
      locale: isEn ? "en_US" : "he_IL",
      alternateLocale: isEn ? ["he_IL", "es_ES"] : ["en_US", "es_ES"],
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      // A square app icon reads badly in a large-image card, so pages that
      // pass an image use the compact "summary" card.
      card: image ? "summary" : "summary_large_image",
      title,
      description,
      ...(image ? { images: [image.url] } : {}),
    },
  };
}
