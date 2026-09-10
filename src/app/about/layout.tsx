import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "אודות טיולון – האפליקציה שמרכזת את כל הטיול | Tulon",
  description:
    "טיולון נולדה כדי לפתור את הכאב של תכנון טיול בקבוצה: מי שילם, מי חייב, ומה עושים מחר. הכירו את הסיפור והמשימה שמאחורי האפליקציה.",
  path: "/about",
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
