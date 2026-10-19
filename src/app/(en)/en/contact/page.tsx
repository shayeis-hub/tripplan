import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import ContactView from "@/components/ContactView";
import LocalizedPage from "@/components/LocalizedPage";
import { LOCALIZED_PAGES, hreflang, pagePaths } from "@/lib/localizedPages";

const PAGE = LOCALIZED_PAGES.contact;

export const metadata: Metadata = pageMeta({
  title: "Contact – TUlon",
  description:
    "A question, a feature request or a bug report? Write to the TUlon team and we will get back to you.",
  path: PAGE.en,
  locale: "en_US",
  languages: hreflang(PAGE),
});

export default function ContactEnPage() {
  return (
    <LocalizedPage lang="en" paths={pagePaths(PAGE)}>
      <ContactView />
    </LocalizedPage>
  );
}
