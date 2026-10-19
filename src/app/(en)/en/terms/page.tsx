import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import TermsView from "@/components/TermsView";
import LocalizedPage from "@/components/LocalizedPage";
import { LOCALIZED_PAGES, hreflang, pagePaths } from "@/lib/localizedPages";

const PAGE = LOCALIZED_PAGES.terms;

export const metadata: Metadata = pageMeta({
  title: "Terms of Service – TUlon",
  description:
    "The terms of use of the TUlon app and the tulon.app website.",
  path: PAGE.en,
  locale: "en_US",
  languages: hreflang(PAGE),
});

export default function TermsEnPage() {
  return (
    <LocalizedPage lang="en" paths={pagePaths(PAGE)}>
      <TermsView />
    </LocalizedPage>
  );
}
