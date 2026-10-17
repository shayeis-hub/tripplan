import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SeoPage, Section, P, List } from "@/components/SeoLanding";
import { RES_CSS, AFFILIATE_REL } from "@/components/resourcePageStyles";
import {
  buildAgodaPropertyUrl,
  buildGygActivityUrl,
  buildAiraloUrl,
  buildKiwiUrl,
} from "@/lib/affiliate";

const PATH = "/prague-travel-resources";
const TITLE = "Prague Travel Resources | TUlon";
const DESCRIPTION =
  "A practical companion to Prague for First-Timers: four well-placed hotels, selected tours and experiences, and official resources for tickets and transport.";

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
    area: "Old Town / Josefov",
    text: "A contemporary base near the Old Town and Jewish Quarter, especially convenient for exploring on foot.",
    url: "https://www.agoda.com/hotel-josef/hotel/prague-cz.html",
  },
  {
    name: "Hotel Pod Věží",
    area: "Malá Strana / Charles Bridge",
    text: "A small hotel in the Lesser Town, close to the western end of Charles Bridge. Useful for early walks and quieter evenings.",
    url: "https://www.agoda.com/hotel-pod-vezi/hotel/prague-cz.html",
  },
  {
    name: "MOSAIC HOUSE Design Hotel",
    area: "New Town",
    text: "A design-led option near Karlovo náměstí, with good access to the riverside and public transport.",
    url: "https://www.agoda.com/mosaic-house_2/hotel/prague-cz.html",
  },
  {
    name: "NYX Hotel Prague by Leonardo Hotels",
    area: "Central New Town",
    text: "A lively central base near Wenceslas Square, shopping and transport connections.",
    url: "https://www.agoda.com/nyx-hotel-prague-by-leonardo-hotels/hotel/prague-cz.html",
  },
];

const TOURS = [
  {
    name: "Prague Jewish Town Walking Tour",
    text: "A guided introduction to Josefov and its history, with a route that includes important Jewish heritage sites. Confirm exactly which synagogue and museum admissions are included, and note that Jewish Museum sites close on Saturdays and Jewish holidays.",
    gygLabel: "View on GetYourGuide",
    gyg: "https://www.getyourguide.com/prague-l10/jewish-town-walking-tour-in-prague-t8815/",
    altLabel: "Official Jewish Museum",
    alt: "https://www.jewishmuseum.cz/en/",
  },
  {
    name: "Prague Castle and St. Vitus Cathedral",
    text: "Explore the castle complex and its historic buildings. Check language and admission conditions carefully before booking a tour: the linked guided tour is conducted in German, and the listing describes entrance tickets separately.",
    gygLabel: "View on GetYourGuide (German-language guided tour)",
    gyg: "https://www.getyourguide.com/prague-l10/guided-tour-of-st-vitus-cathedral-royal-palace-st-george-s-basilica-t610182/",
    altLabel: "Official castle tickets and visitor information",
    alt: "https://www.hrad.cz/en/prague-castle-for-visitors",
  },
  {
    name: "Vltava River sightseeing cruise",
    text: "A relaxed view of the city from the river. The linked afternoon cruise includes drinks and lasts about 45 minutes; it is an optional extra rather than an essential part of the itinerary.",
    gygLabel: "View on GetYourGuide",
    gyg: "https://www.getyourguide.com/prague-l10/prague-vltava-river-sightseeing-beer-cruise-t450142/",
    altLabel: "",
    alt: "",
  },
];

const OFFICIAL = [
  { label: "Prague City Tourism", url: "https://prague.eu/en/" },
  { label: "Public transport, routes and fares", url: "https://pid.cz/en/" },
  { label: "Prague Castle visitor information", url: "https://www.hrad.cz/en/prague-castle-for-visitors" },
  { label: "Jewish Museum in Prague", url: "https://www.jewishmuseum.cz/en/" },
  { label: "National Museum", url: "https://www.nm.cz/en" },
  { label: "Petřín funicular updates", url: "https://pid.cz/en/funicular/" },
];

export default function PragueTravelResourcesPage() {
  return (
    <SeoPage path={PATH} name={TITLE} description={DESCRIPTION}>
      <style>{RES_CSS}</style>

      <header className="seo-hero">
        <div className="seo-hero-inner">
          <h1 className="seo-h1">Prague Travel Resources</h1>
          <p className="res-lead-strong">
            A practical companion to <em>Prague for First-Timers</em> by Shay Eisenberg
          </p>
          <p className="seo-lead">
            Plan your Prague stay without turning every day into a race. Below are four well-placed hotel
            options, selected experiences that fit a relaxed four-day itinerary, and official resources for
            tickets and transport. Prices, schedules and availability change, so always confirm details for
            your dates.
          </p>
        </div>
      </header>

      <div className="res-note">
        <div className="res-note-box">
          <strong>Affiliate disclosure.</strong> Some links on this page may be affiliate links. If you book
          through them, we may earn a commission at no additional cost to you.
        </div>
      </div>

      <Section title="Where to stay">
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
          <strong>Choosing a location:</strong> Old Town is ideal for a first visit; Malá Strana has atmosphere
          and bridge access; New Town can offer more options while remaining walkable. Compare cancellation
          policies, accessibility, air conditioning and room details for your dates.
        </P>
      </Section>

      <Section title="Tours and experiences">
        <div className="res-grid">
          {TOURS.map((t) => (
            <article className="res-card" key={t.name}>
              <h3>{t.name}</h3>
              <p>{t.text}</p>
              <div className="res-links">
                <a
                  className="res-btn"
                  href={buildGygActivityUrl(t.gyg, "prague-resources")}
                  target="_blank"
                  rel={AFFILIATE_REL}
                >
                  {t.gygLabel}
                </a>
                {t.alt && (
                  <a className="res-alt" href={t.alt} target="_blank" rel="noopener noreferrer">
                    {t.altLabel}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
        <P>
          <strong>Prefer independent sightseeing?</strong> Charles Bridge, Old Town Square, Kampa and many
          riverside walks can be enjoyed without a paid tour.
        </P>
      </Section>

      <Section title="Official planning links">
        <List
          items={OFFICIAL.map((o) => (
            <span key={o.url}>
              <a href={o.url} target="_blank" rel="noopener noreferrer">
                {o.label}
              </a>
            </span>
          ))}
        />
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

      <Section title="Organize your trip with TUlon">
        <P>
          Keep your hotel, sightseeing ideas, bookings and shared plans in one place with{" "}
          <a href="https://www.tulon.app/">
            <strong>TUlon</strong>
          </a>
          , a free group travel-planning app created by the author.
        </P>
      </Section>

      <Section title="Disclosure">
        <P>
          Some links on this page may be affiliate links. If you book through them, we may earn a commission at
          no additional cost to you. Recommendations are editorial selections, not a guarantee of availability,
          suitability or the lowest price.
        </P>
      </Section>
      <div style={{ height: 56 }} />
    </SeoPage>
  );
}
