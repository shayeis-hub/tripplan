import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { LOCALIZED_PAGES, hreflang } from "@/lib/localizedPages";

export const metadata: Metadata = pageMeta({
  title: "הבלוג של טיולון – טיפים, מסלולים ומדריכי טיולים",
  description:
    "מדריכים, מסלולים וטיפים לתכנון טיול: ניהול תקציב, חלוקת הוצאות בקבוצה, יעדים מומלצים ורשימות אריזה – מהצוות של טיולון.",
  path: "/blog",
  languages: hreflang(LOCALIZED_PAGES.blog),
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
