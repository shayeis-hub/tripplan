import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { LOCALIZED_PAGES, hreflang } from "@/lib/localizedPages";

export const metadata: Metadata = pageMeta({
  title: "תנאי שימוש – טיולון",
  description: "תנאי השימוש באפליקציית טיולון ובאתר tulon.app.",
  path: "/terms",
  languages: hreflang(LOCALIZED_PAGES.terms),
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
