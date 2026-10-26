import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import BudapestResources, { BUDAPEST_META, BUDAPEST_PATHS } from "@/components/BudapestResources";

export const metadata: Metadata = pageMeta({
  title: BUDAPEST_META.he.title,
  description: BUDAPEST_META.he.description,
  path: BUDAPEST_PATHS.he,
  locale: "he_IL",
  languages: { en: BUDAPEST_PATHS.en, he: BUDAPEST_PATHS.he, "x-default": BUDAPEST_PATHS.en },
  image: { url: "/icon-512.png", width: 512, height: 512, alt: "TUlon app icon" },
});

export default function BudapestTravelResourcesHebrewPage() {
  return <BudapestResources lang="he" />;
}
