import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "צור קשר – טיולון",
  description: "שאלה, בקשת פיצ'ר או דיווח על תקלה? כתבו לצוות טיולון ונחזור אליכם.",
  path: "/contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
