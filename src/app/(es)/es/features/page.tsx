import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import FeaturesView from "@/components/FeaturesView";
import LocalizedPage from "@/components/LocalizedPage";
import { LOCALIZED_PAGES, hreflang, pagePaths } from "@/lib/localizedPages";

const PAGE = LOCALIZED_PAGES.features;

export const metadata: Metadata = pageMeta({
  title: "Funciones de TUlon – Itinerario, gastos, presupuesto y reparto de pagos | TUlon",
  description:
    "Todo lo que necesitas para planificar un viaje en un solo lugar: itinerario día a día con actividades, control de gastos y presupuesto, reparto de pagos en grupo y más. Completamente gratis, sin premium y sin límites.",
  path: PAGE.es,
  locale: "es_ES",
  languages: hreflang(PAGE),
});

export default function FeaturesEsPage() {
  return (
    <LocalizedPage lang="es" paths={pagePaths(PAGE)}>
      <FeaturesView />
    </LocalizedPage>
  );
}
