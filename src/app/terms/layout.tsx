import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "תנאי שימוש – טיולון",
  description: "תנאי השימוש באפליקציית טיולון ובאתר tulon.app.",
  path: "/terms",
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
