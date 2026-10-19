import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { LOCALIZED_PAGES, hreflang } from "@/lib/localizedPages";

export const metadata: Metadata = pageMeta({
  title: "אודות טיולון – האפליקציה שמרכזת את כל הטיול | TUlon",
  description:
    "טיולון נולדה כדי לפתור את הכאב של תכנון טיול בקבוצה: מי שילם, מי חייב, ומה עושים מחר. הכירו את הסיפור והמשימה שמאחורי האפליקציה.",
  path: "/about",
  languages: hreflang(LOCALIZED_PAGES.about),
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
