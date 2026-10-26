import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import BudapestResources, { BUDAPEST_META, BUDAPEST_PATHS } from "@/components/BudapestResources";

export const metadata: Metadata = pageMeta({
  title: BUDAPEST_META.en.title,
  description: BUDAPEST_META.en.description,
  path: BUDAPEST_PATHS.en,
  locale: "en_US",
  languages: { en: BUDAPEST_PATHS.en, he: BUDAPEST_PATHS.he, "x-default": BUDAPEST_PATHS.en },
  image: { url: "/icon-512.png", width: 512, height: 512, alt: "TUlon app icon" },
});

export default function BudapestTravelResourcesPage() {
  return <BudapestResources lang="en" />;
}
