import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import AboutView from "@/components/AboutView";
import LocalizedPage from "@/components/LocalizedPage";
import { LOCALIZED_PAGES, hreflang, pagePaths } from "@/lib/localizedPages";

const PAGE = LOCALIZED_PAGES.about;

export const metadata: Metadata = pageMeta({
  title: "Acerca de TUlon – La app que reúne todo tu viaje | TUlon",
  description:
    "Por qué creamos TUlon: un planificador de viajes gratuito que sustituye el chat de WhatsApp y las capturas de Excel, con itinerario, presupuesto y gastos del grupo en un solo lugar. Conoce nuestra misión y valores.",
  path: PAGE.es,
  locale: "es_ES",
  languages: hreflang(PAGE),
});

export default function AboutEsPage() {
  return (
    <LocalizedPage lang="es" paths={pagePaths(PAGE)}>
      <AboutView />
    </LocalizedPage>
  );
}
