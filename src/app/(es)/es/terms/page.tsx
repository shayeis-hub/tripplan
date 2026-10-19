import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import TermsView from "@/components/TermsView";
import LocalizedPage from "@/components/LocalizedPage";
import { LOCALIZED_PAGES, hreflang, pagePaths } from "@/lib/localizedPages";

const PAGE = LOCALIZED_PAGES.terms;

export const metadata: Metadata = pageMeta({
  title: "Términos de servicio – TUlon",
  description:
    "Los términos de uso de la aplicación TUlon y del sitio tulon.app.",
  path: PAGE.es,
  locale: "es_ES",
  languages: hreflang(PAGE),
});

export default function TermsEsPage() {
  return (
    <LocalizedPage lang="es" paths={pagePaths(PAGE)}>
      <TermsView />
    </LocalizedPage>
  );
}
