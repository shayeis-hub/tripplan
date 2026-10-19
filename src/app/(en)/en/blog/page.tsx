import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import BlogIndexView from "@/components/BlogIndexView";
import LocalizedPage from "@/components/LocalizedPage";
import { LOCALIZED_PAGES, hreflang, pagePaths } from "@/lib/localizedPages";

const PAGE = LOCALIZED_PAGES.blog;

export const metadata: Metadata = pageMeta({
  title: "TUlon Travel Blog – Tips, Itineraries and Trip Planning Guides",
  description:
    "Guides, itineraries and tips for planning a trip: budgeting, splitting group expenses, recommended destinations and packing lists.",
  path: PAGE.en,
  locale: "en_US",
  languages: hreflang(PAGE),
});

export default function BlogEnPage() {
  return (
    <LocalizedPage lang="en" paths={pagePaths(PAGE)}>
      <BlogIndexView />
    </LocalizedPage>
  );
}
