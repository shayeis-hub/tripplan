import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import ContactView from "@/components/ContactView";
import LocalizedPage from "@/components/LocalizedPage";
import { LOCALIZED_PAGES, hreflang, pagePaths } from "@/lib/localizedPages";

const PAGE = LOCALIZED_PAGES.contact;

export const metadata: Metadata = pageMeta({
  title: "Contacto – TUlon",
  description:
    "¿Una pregunta, una sugerencia de función o un error? Escribe al equipo de TUlon y te responderemos.",
  path: PAGE.es,
  locale: "es_ES",
  languages: hreflang(PAGE),
});

export default function ContactEsPage() {
  return (
    <LocalizedPage lang="es" paths={pagePaths(PAGE)}>
      <ContactView />
    </LocalizedPage>
  );
}
