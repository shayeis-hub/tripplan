import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import ViennaResources, { VIENNA_META, VIENNA_PATHS } from "@/components/ViennaResources";

export const metadata: Metadata = pageMeta({
  title: VIENNA_META.en.title,
  description: VIENNA_META.en.description,
  path: VIENNA_PATHS.en,
  locale: "en_US",
  languages: { en: VIENNA_PATHS.en, he: VIENNA_PATHS.he, "x-default": VIENNA_PATHS.en },
  image: { url: "/icon-512.png", width: 512, height: 512, alt: "TUlon app icon" },
});

export default function ViennaLakesTravelResourcesPage() {
  return <ViennaResources lang="en" />;
}
