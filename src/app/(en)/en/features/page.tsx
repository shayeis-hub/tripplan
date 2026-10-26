import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import FeaturesView from "@/components/FeaturesView";
import LocalizedPage from "@/components/LocalizedPage";
import { LOCALIZED_PAGES, hreflang, pagePaths } from "@/lib/localizedPages";

const PAGE = LOCALIZED_PAGES.features;

export const metadata: Metadata = pageMeta({
  title: "TUlon Features – Itinerary, Expenses, Budget and Group Settlement | TUlon",
  description:
    "Everything you need to plan a trip in one place: a day-by-day itinerary with activities, expense and budget tracking, group payment splitting and more. TUlon is currently free to use.",
  path: PAGE.en,
  locale: "en_US",
  languages: hreflang(PAGE),
});

export default function FeaturesEnPage() {
  return (
    <LocalizedPage lang="en" paths={pagePaths(PAGE)}>
      <FeaturesView />
    </LocalizedPage>
  );
}
