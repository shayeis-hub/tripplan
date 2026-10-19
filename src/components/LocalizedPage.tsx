"use client";
import type { ReactNode } from "react";
import { ForcedLang } from "@/lib/LangContext";
import { PageLinksProvider } from "@/lib/pageLinks";
import type { Lang } from "@/lib/i18n";

export interface LangPaths {
  he: string;
  en: string;
  es: string;
}

// A marketing page whose language is fixed by its URL (/en/..., /es/...).
export default function LocalizedPage({
  lang,
  paths,
  children,
}: {
  lang: "en" | "es";
  paths: LangPaths;
  children: ReactNode;
}) {
  return (
    <ForcedLang lang={lang as Lang}>
      <PageLinksProvider value={{ prefix: `/${lang}`, langLinks: paths }}>{children}</PageLinksProvider>
    </ForcedLang>
  );
}
