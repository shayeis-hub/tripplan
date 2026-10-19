import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import LandingPage from "@/components/LandingPage";
import LocalizedPage from "@/components/LocalizedPage";
import { LOCALIZED_PAGES, hreflang, pagePaths } from "@/lib/localizedPages";

const PAGE = LOCALIZED_PAGES.home;

export const metadata: Metadata = pageMeta({
  title: "TUlon – App para planificar viajes: itinerario, presupuesto y gastos en grupo",
  description:
    "TUlon es un planificador de viajes gratuito: crea un itinerario día a día, gestiona tu presupuesto y tus gastos, reparte los pagos entre todo el grupo y descubre qué hacer en tu destino.",
  path: PAGE.es,
  locale: "es_ES",
  languages: hreflang(PAGE),
});

export default function HomeEsPage() {
  return (
    <LocalizedPage lang="es" paths={pagePaths(PAGE)}>
      <LandingPage />
    </LocalizedPage>
  );
}
