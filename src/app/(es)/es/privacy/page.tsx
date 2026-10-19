import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import PrivacyView from "@/components/PrivacyView";
import LocalizedPage from "@/components/LocalizedPage";
import { LOCALIZED_PAGES, hreflang, pagePaths } from "@/lib/localizedPages";

const PAGE = LOCALIZED_PAGES.privacy;

export const metadata: Metadata = pageMeta({
  title: "Política de privacidad – TUlon",
  description:
    "Cómo recopila, usa y protege TUlon tu información.",
  path: PAGE.es,
  locale: "es_ES",
  languages: hreflang(PAGE),
});

export default function PrivacyEsPage() {
  return (
    <LocalizedPage lang="es" paths={pagePaths(PAGE)}>
      <PrivacyView />
    </LocalizedPage>
  );
}
