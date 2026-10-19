import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import PlanView from "@/components/PlanView";
import LocalizedPage from "@/components/LocalizedPage";
import { LOCALIZED_PAGES, hreflang, pagePaths } from "@/lib/localizedPages";

const PAGE = LOCALIZED_PAGES.plan;

export const metadata: Metadata = pageMeta({
  title: "Trip Planning Guide – Flights, Hotels, Activities and eSIM | TUlon",
  description:
    "TUlon's trip planning hub: direct links to book flights, hotels, activities and an eSIM, all in one place.",
  path: PAGE.en,
  locale: "en_US",
  languages: hreflang(PAGE),
});

export default function PlanEnPage() {
  return (
    <LocalizedPage lang="en" paths={pagePaths(PAGE)}>
      <PlanView />
    </LocalizedPage>
  );
}
