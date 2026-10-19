import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import AboutView from "@/components/AboutView";
import LocalizedPage from "@/components/LocalizedPage";
import { LOCALIZED_PAGES, hreflang, pagePaths } from "@/lib/localizedPages";

const PAGE = LOCALIZED_PAGES.about;

export const metadata: Metadata = pageMeta({
  title: "About TUlon – The App That Keeps Your Whole Trip in One Place | TUlon",
  description:
    "Why we built TUlon: a free trip planner that replaces the WhatsApp chat and the Excel screenshots, with the itinerary, budget and group expenses in one place. Learn about our mission and values.",
  path: PAGE.en,
  locale: "en_US",
  languages: hreflang(PAGE),
});

export default function AboutEnPage() {
  return (
    <LocalizedPage lang="en" paths={pagePaths(PAGE)}>
      <AboutView />
    </LocalizedPage>
  );
}
