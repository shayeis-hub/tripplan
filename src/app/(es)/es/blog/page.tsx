import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import BlogIndexView from "@/components/BlogIndexView";
import LocalizedPage from "@/components/LocalizedPage";
import { LOCALIZED_PAGES, hreflang, pagePaths } from "@/lib/localizedPages";

const PAGE = LOCALIZED_PAGES.blog;

export const metadata: Metadata = pageMeta({
  title: "Blog de viajes de TUlon – Consejos, itinerarios y guías para planificar tu viaje",
  description:
    "Guías, itinerarios y consejos para planificar un viaje: gestión del presupuesto, reparto de gastos en grupo, destinos recomendados y listas de equipaje.",
  path: PAGE.es,
  locale: "es_ES",
  languages: hreflang(PAGE),
});

export default function BlogEsPage() {
  return (
    <LocalizedPage lang="es" paths={pagePaths(PAGE)}>
      <BlogIndexView />
    </LocalizedPage>
  );
}
