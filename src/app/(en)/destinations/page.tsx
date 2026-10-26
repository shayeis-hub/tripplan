import type { Metadata } from "next";
import { pageMeta, SITE_URL } from "@/lib/seo";
import { SeoPage, CtaBand } from "@/components/SeoLanding";
import JsonLd from "@/components/JsonLd";
import { RES_CSS } from "@/components/resourcePageStyles";
import { DESTINATIONS, DESTINATIONS_PATH, formatUpdated } from "@/lib/destinations";

const TITLE = "Destinations: Where to Stay and What to Book | TUlon";
const DESCRIPTION =
  "Travel resources for first-time visitors: hotels, guided tours and tickets, official sites, flights and eSIMs for Paris, Prague, Rome, Thailand, Vienna & the Lakes and Budapest.";

export const metadata: Metadata = pageMeta({
  title: TITLE,
  description: DESCRIPTION,
  path: DESTINATIONS_PATH,
  locale: "en_US",
  image: { url: "/icon-512.png", width: 512, height: 512, alt: "TUlon app icon" },
});

export default function DestinationsPage() {
  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "TUlon destinations",
    itemListElement: DESTINATIONS.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${d.city} travel resources`,
      url: `${SITE_URL}${d.path}`,
    })),
  };

  return (
    <SeoPage path={DESTINATIONS_PATH} name={TITLE} description={DESCRIPTION}>
      <style>{RES_CSS}</style>
      <JsonLd data={listSchema} />

      <header className="seo-hero">
        <div className="seo-hero-inner">
          <h1 className="seo-h1">Destinations</h1>
          <p className="seo-lead">
            Where to stay and what to book for a first visit: hotels, guided tours and tickets, official sites,
            flights and an eSIM. Each page is a companion to a <em>First-Timers</em> travel guide by Shay
            Eisenberg.
          </p>
        </div>
      </header>

      <div className="res-note">
        <div className="res-note-box">
          <strong>Affiliate disclosure.</strong> Some links on the destination pages may be affiliate links. If you
          book through them, we may earn a commission at no additional cost to you.
        </div>
      </div>

      <section className="seo-section">
        <div className="res-index">
          {DESTINATIONS.map((d) => (
            <article className="res-card" key={d.slug}>
              <h2>{d.city}</h2>
              <div className="res-meta">
                <span>{d.sub}</span>
              </div>
              <p>{d.blurb}</p>
              <div className="res-pills">
                {d.includes.map((i) => (
                  <span className="res-pill" key={i}>
                    {i}
                  </span>
                ))}
              </div>
              <p className="res-info">Updated {formatUpdated(d.updated)}</p>
              <a className="res-btn" href={d.path}>
                Open {d.city} guide
              </a>
            </article>
          ))}
        </div>
      </section>

      <CtaBand
        title="Plan your trip in TUlon"
        text="Build a day-by-day itinerary, keep your bookings and budget in one place, and split expenses with the people you travel with."
        cta="Start planning"
      />
    </SeoPage>
  );
}
