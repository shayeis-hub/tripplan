import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "הבלוג של טיולון – טיפים, מסלולים ומדריכי טיולים",
  description:
    "מדריכים, מסלולים וטיפים לתכנון טיול: ניהול תקציב, חלוקת הוצאות בקבוצה, יעדים מומלצים ורשימות אריזה – מהצוות של טיולון.",
  path: "/blog",
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
