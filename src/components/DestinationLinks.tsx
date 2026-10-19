import { DESTINATIONS, DESTINATIONS_PATH } from "@/lib/destinations";
import { Section } from "@/components/SeoLanding";

// Breadcrumb shown above the H1 of a destination page.
export function DestinationCrumb({ city }: { city: string }) {
  return (
    <nav className="res-crumb" aria-label="Breadcrumb">
      <a href={DESTINATIONS_PATH}>Destinations</a>
      <span aria-hidden="true">/</span>
      <span>{city}</span>
    </nav>
  );
}

// "More destinations" block at the bottom of a destination page.
export function MoreDestinations({ current }: { current: string }) {
  const others = DESTINATIONS.filter((d) => d.slug !== current);
  return (
    <Section title="More destinations">
      <div className="res-more">
        {others.map((d) => (
          <a className="res-more-card" href={d.path} key={d.slug}>
            <span className="res-more-city">{d.city}</span>
            <span className="res-more-sub">{d.sub}</span>
          </a>
        ))}
      </div>
      <p className="seo-p">
        <a href={DESTINATIONS_PATH}>See all destinations</a>
      </p>
    </Section>
  );
}
