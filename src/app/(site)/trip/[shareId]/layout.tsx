import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

// Public "trip inspiration" share pages — user-generated and ephemeral, so
// they carry a title for anyone who opens the link but stay out of the
// search index.
export const metadata: Metadata = pageMeta({
  title: "טיול משותף – טיולון",
  description: "מסלול טיול ששותף איתך דרך טיולון.",
  path: "/trip",
  noindex: true,
});

export default function SharedTripLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
