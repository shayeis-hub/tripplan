import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "ניהול – טיולון",
  description: "אזור ניהול פנימי.",
  path: "/admin",
  noindex: true,
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
