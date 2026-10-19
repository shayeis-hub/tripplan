import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import PrivacyView from "@/components/PrivacyView";
import LocalizedPage from "@/components/LocalizedPage";
import { LOCALIZED_PAGES, hreflang, pagePaths } from "@/lib/localizedPages";

const PAGE = LOCALIZED_PAGES.privacy;

export const metadata: Metadata = pageMeta({
  title: "Privacy Policy – TUlon",
  description:
    "How TUlon collects, uses and protects your information.",
  path: PAGE.en,
  locale: "en_US",
  languages: hreflang(PAGE),
});

export default function PrivacyEnPage() {
  return (
    <LocalizedPage lang="en" paths={pagePaths(PAGE)}>
      <PrivacyView />
    </LocalizedPage>
  );
}
