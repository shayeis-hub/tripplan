import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import PragueResources, { PRAGUE_META, PRAGUE_PATHS } from "@/components/PragueResources";

export const metadata: Metadata = pageMeta({
  title: PRAGUE_META.en.title,
  description: PRAGUE_META.en.description,
  path: PRAGUE_PATHS.en,
  locale: "en_US",
  languages: { en: PRAGUE_PATHS.en, he: PRAGUE_PATHS.he, "x-default": PRAGUE_PATHS.en },
  image: { url: "/icon-512.png", width: 512, height: 512, alt: "TUlon app icon" },
});

export default function PragueTravelResourcesPage() {
  return <PragueResources lang="en" />;
}
