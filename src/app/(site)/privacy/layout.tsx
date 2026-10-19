import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { LOCALIZED_PAGES, hreflang } from "@/lib/localizedPages";

export const metadata: Metadata = pageMeta({
  title: "מדיניות פרטיות – טיולון",
  description: "כיצד טיולון אוספת, משתמשת ומגנה על המידע שלכם.",
  path: "/privacy",
  languages: hreflang(LOCALIZED_PAGES.privacy),
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
