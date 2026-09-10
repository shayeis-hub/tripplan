import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Sentry example",
  description: "Internal error-reporting test page.",
  path: "/sentry-example-page",
  noindex: true,
});

export default function SentryExampleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
