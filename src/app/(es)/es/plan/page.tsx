import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import PlanView from "@/components/PlanView";
import LocalizedPage from "@/components/LocalizedPage";
import { LOCALIZED_PAGES, hreflang, pagePaths } from "@/lib/localizedPages";

const PAGE = LOCALIZED_PAGES.plan;

export const metadata: Metadata = pageMeta({
  title: "Guía para planificar tu viaje – vuelos, hoteles, actividades y eSIM | TUlon",
  description:
    "El centro de planificación de TUlon: enlaces directos para reservar vuelos, hoteles, actividades y una eSIM, todo en un solo lugar.",
  path: PAGE.es,
  locale: "es_ES",
  languages: hreflang(PAGE),
});

export default function PlanEsPage() {
  return (
    <LocalizedPage lang="es" paths={pagePaths(PAGE)}>
      <PlanView />
    </LocalizedPage>
  );
}
