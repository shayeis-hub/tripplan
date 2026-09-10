import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "הפיצ'רים של טיולון – מסלול, הוצאות, תקציב וחלוקה | Tulon",
  description:
    "כל הכלים לתכנון טיול במקום אחד: מסלול יומי עם פעילויות, ניהול הוצאות ותקציב, חלוקת תשלומים בין חברים, המלצות מלונות ואטרקציות, רשימת אריזה ומפה.",
  path: "/features",
});

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
