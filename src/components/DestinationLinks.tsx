import { DESTINATIONS, DESTINATIONS_PATH } from "@/lib/destinations";
import { Section } from "@/components/SeoLanding";

type PageLang = "en" | "he";

// Breadcrumb shown above the H1 of a destination page.
export function DestinationCrumb({ city, lang = "en" }: { city: string; lang?: PageLang }) {
  return (
    <nav className="res-crumb" aria-label={lang === "he" ? "ניווט" : "Breadcrumb"}>
      <a href={DESTINATIONS_PATH} {...(lang === "he" ? { hrefLang: "en", lang: "en" } : {})}>Destinations</a>
      <span aria-hidden="true">/</span>
      <span>{city}</span>
    </nav>
  );
}

// "More destinations" block at the bottom of a destination page. The other
// destination pages exist in English only, so the Hebrew block says so.
export function MoreDestinations({ current, lang = "en" }: { current: string; lang?: PageLang }) {
  const others = DESTINATIONS.filter((d) => d.slug !== current);
  return (
    <Section title={lang === "he" ? "יעדים נוספים" : "More destinations"}>
      <div className="res-more">
        {others.map((d) => (
          <a className="res-more-card" href={d.path} key={d.slug} {...(lang === "he" ? { hrefLang: "en", lang: "en", dir: "ltr" } : {})}>
            <span className="res-more-city">{d.city}</span>
            <span className="res-more-sub">{d.sub}</span>
          </a>
        ))}
      </div>
      <p className="seo-p">
        <a href={DESTINATIONS_PATH} {...(lang === "he" ? { hrefLang: "en", lang: "en" } : {})}>See all destinations</a>
        {lang === "he" && " (העמודים באנגלית)"}
      </p>
    </Section>
  );
}
