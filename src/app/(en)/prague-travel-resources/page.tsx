import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SeoPage, Section, P, CtaBand } from "@/components/SeoLanding";
import { RES_CSS, AFFILIATE_REL } from "@/components/resourcePageStyles";
import { buildAgodaPropertyUrl, buildAiraloUrl, buildKiwiUrl } from "@/lib/affiliate";

const PATH = "/prague-travel-resources";
const TITLE = "Prague Travel Resources | TUlon";
const DESCRIPTION =
  "A first-timer's shortlist for Prague: where to stay by neighborhood, the official sites for the main sights and public transport, plus flights and an eSIM for the Czech Republic.";

export const metadata: Metadata = pageMeta({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  locale: "en_US",
  image: { url: "/icon-512.png", width: 512, height: 512, alt: "TUlon app icon" },
});

const HOTELS = [
  {
    name: "Hotel Josef",
    area: "Old Town",
    text: "Central base for the Old Town and Jewish Quarter.",
    url: "https://www.agoda.com/hotel-josef/hotel/prague-cz.html",
  },
  {
    name: "Hotel Pod Věží",
    area: "Malá Strana",
    text: "Near Charles Bridge, good for a walkable sightseeing base.",
    url: "https://www.agoda.com/hotel-pod-vezi/hotel/prague-cz.html",
  },
  {
    name: "Mosaic House Design Hotel",
    area: "New Town",
    text: "Alternative base with access to central Prague.",
    url: "https://www.agoda.com/mosaic-house/hotel/prague-cz.html",
  },
  {
    name: "NYX Hotel Prague",
    area: "New Town / near Wenceslas Square",
    text: "Central urban base near transport and shopping.",
    url: "https://www.agoda.com/nyx-hotel-prague-by-leonardo-hotels/hotel/prague-cz.html",
  },
];

const SITES = [
  {
    name: "Prague Castle and St Vitus Cathedral",
    tag: "Castle day",
    text: "Visitor information from the official castle website.",
    url: "https://www.hrad.cz/en/prague-castle-for-visitors",
  },
  {
    name: "Jewish Museum in Prague",
    tag: "Jewish Quarter",
    text: "Official site for the museum, with tickets and opening details.",
    url: "https://www.jewishmuseum.cz/en/",
  },
  {
    name: "Prague public transport",
    tag: "All days",
    text: "Official routes, timetables and fares.",
    url: "https://pid.cz/en/",
  },
  {
    name: "Prague tourism",
    tag: "General planning",
    text: "The city's official tourism site, for general planning.",
    url: "https://www.prague.eu/en",
  },
  {
    name: "National Museum",
    tag: "Optional visit",
    text: "Exhibitions and admission information.",
    url: "https://www.nm.cz/en",
  },
  {
    name: "Prague City Gallery",
    tag: "Optional art",
    text: "Exhibitions and opening details.",
    url: "https://www.ghmp.cz/en/",
  },
];

export default function PragueTravelResourcesPage() {
  return (
    <SeoPage path={PATH} name={TITLE} description={DESCRIPTION}>
      <style>{RES_CSS}</style>

      <header className="seo-hero">
        <div className="seo-hero-inner">
          <h1 className="seo-h1">Prague Travel Resources</h1>
          <p className="seo-lead">
            Prague is a city best explored in walkable neighborhoods, with time to enjoy its bridges, courtyards,
            and historic streets. This page gathers useful places to stay, key sights, and practical booking links
            to complement <em>Prague for First-Timers</em>.
          </p>
        </div>
      </header>

      <div className="res-note">
        <div className="res-note-box">
          <strong>Affiliate disclosure.</strong> Some links on this page may be affiliate links. If you book
          through them, we may earn a commission at no extra cost to you.
        </div>
      </div>

      <Section title="Where to stay">
        <P>
          Four hotels in different neighborhoods. Each link opens the hotel&apos;s own page on Agoda, where you can
          enter your dates and see current prices.
        </P>
        <div className="res-grid">
          {HOTELS.map((h) => (
            <article className="res-card" key={h.name}>
              <h3>{h.name}</h3>
              <div className="res-meta">
                <span className="res-pill">{h.area}</span>
              </div>
              <p>{h.text}</p>
              <a
                className="res-btn"
                href={buildAgodaPropertyUrl(h.url, "prague-resources")}
                target="_blank"
                rel={AFFILIATE_REL}
              >
                View on Agoda
              </a>
            </article>
          ))}
        </div>
        <P>
          Before you book, check each hotel&apos;s exact neighborhood, step-free access, room air-conditioning,
          cancellation terms and price.
        </P>
      </Section>

      <Section title="Attractions and official sites">
        <P>
          Opening hours, ticket details and fares change, so use the official sites below for the latest
          information before you go.
        </P>
        <div className="res-grid">
          {SITES.map((s) => (
            <article className="res-card" key={s.name}>
              <h3>{s.name}</h3>
              <div className="res-meta">
                <span className="res-pill">{s.tag}</span>
              </div>
              <p>{s.text}</p>
              <a className="res-btn" href={s.url} target="_blank" rel="noopener noreferrer">
                Official website
              </a>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Flights and mobile data">
        <div className="res-two">
          <article className="res-card">
            <h3>Flights to Prague</h3>
            <p>
              Compare fares on Kiwi.com. When the search opens, enter your departure city and Prague
              as the destination.
            </p>
            <a
              className="res-btn"
              href={buildKiwiUrl({ source: "prague-flights" })}
              target="_blank"
              rel={AFFILIATE_REL}
            >
              Compare flights on Kiwi.com
            </a>
          </article>
          <article className="res-card">
            <h3>eSIM for the Czech Republic</h3>
            <p>
              Land with mobile data already working: install an eSIM before you fly and skip roaming charges
              and airport SIM queues.
            </p>
            <a
              className="res-btn"
              href={buildAiraloUrl({ source: "prague-esim", landing: "https://www.airalo.com/czech-republic-esim" })}
              target="_blank"
              rel={AFFILIATE_REL}
            >
              Get a Czech Republic eSIM on Airalo
            </a>
          </article>
        </div>
      </Section>

      <CtaBand
        title="Plan your Prague trip in TUlon"
        text="Build a day-by-day Prague itinerary, keep your bookings and budget in one place, and split expenses with the people you travel with."
        cta="Start planning"
      />
    </SeoPage>
  );
}
