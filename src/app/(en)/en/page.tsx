import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import LandingPage from "@/components/LandingPage";
import LocalizedPage from "@/components/LocalizedPage";
import { LOCALIZED_PAGES, hreflang, pagePaths } from "@/lib/localizedPages";

const PAGE = LOCALIZED_PAGES.home;

export const metadata: Metadata = pageMeta({
  title: "TUlon – Trip Planner App for Itineraries, Budget and Group Expenses",
  description:
    "TUlon is a free trip planner: build a day-by-day itinerary, manage your budget and expenses, split payments between everyone in the group, and discover things to do at your destination.",
  path: PAGE.en,
  locale: "en_US",
  languages: hreflang(PAGE),
});

export default function HomeEnPage() {
  return (
    <LocalizedPage lang="en" paths={pagePaths(PAGE)}>
      <LandingPage />
    </LocalizedPage>
  );
}
