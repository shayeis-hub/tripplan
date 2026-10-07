import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "מדריך תכנון טיול – טיסות, מלונות, אטרקציות ו-eSIM | טיולון",
  description:
    "מרכז תכנון הטיול של טיולון: קישורים ישירים להזמנת טיסות, מלונות, אטרקציות וכרטיסי eSIM – כל השירותים הטובים במקום אחד.",
  path: "/plan",
});

export default function PlanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
