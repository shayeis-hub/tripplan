import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { DestinationCrumb, MoreDestinations } from "@/components/DestinationLinks";
import { RES_CSS, AFFILIATE_REL as REL } from "@/components/resourcePageStyles";
import { SeoPage, Section, P, CtaBand } from "@/components/SeoLanding";
import {
  buildAgodaPropertyUrl,
  buildGygActivityUrl,
  buildAiraloUrl,
  buildKiwiUrl,
} from "@/lib/affiliate";

const PATH = "/paris-travel-resources";
const TITLE = "Paris Travel Resources | TUlon";
const DESCRIPTION =
  "A first-timer's shortlist for Paris: hotels from budget to luxury, guided tours and skip-the-line tickets, plus flights and an eSIM for France.";

export const metadata: Metadata = pageMeta({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  locale: "en_US",
  image: { url: "/icon-512.png", width: 512, height: 512, alt: "TUlon app icon" },
});

const HOTELS = [
  {
    name: "Hôtel de Roubaix",
    stars: "2 stars",
    area: "3rd arrondissement / Arts et Métiers",
    text: "Practical budget-oriented base with convenient metro access; good for central sightseeing.",
    url: "https://www.agoda.com/en-ie/hotel-de-roubaix-h10288272/hotel/paris-fr.html",
  },
  {
    name: "Hotel des Artistes",
    stars: "2 stars",
    area: "9th arrondissement / Pigalle-Montmartre",
    text: "Budget category near Pigalle and Montmartre; check room facilities and recent reviews carefully.",
    url: "https://www.agoda.com/hotel-des-artistes/hotel/paris-fr.html",
  },
  {
    name: "Hotel Eiffel Seine",
    stars: "3 stars",
    area: "15th arrondissement / Bir-Hakeim",
    text: "Mid-range option beside the metro and convenient for the Eiffel Tower.",
    url: "https://www.agoda.com/hotel-eiffel-seine/hotel/paris-fr.html",
  },
  {
    name: "Hotel Le Six",
    stars: "4 stars",
    area: "6th arrondissement / Montparnasse-Luxembourg",
    text: "Boutique-style stay on the Left Bank, useful for cafés, Luxembourg Gardens and walking.",
    url: "https://www.agoda.com/fr-fr/hotel-le-six/hotel/paris-fr.html",
  },
  {
    name: "Pullman Paris Tour Eiffel",
    stars: "4 stars",
    area: "15th arrondissement / Eiffel Tower",
    text: "Higher-end landmark location; Eiffel views depend on the specific room category.",
    url: "https://www.agoda.com/pullman-paris-tour-eiffel_11/hotel/paris-fr.html",
  },
  {
    name: "Shangri-La Paris",
    stars: "5 stars",
    area: "16th arrondissement / Trocadéro",
    text: "Luxury splurge close to Trocadéro; Eiffel views must be checked by room type.",
    url: "https://www.agoda.com/shangri-la-hotel-paris/hotel/paris-fr.html",
  },
];

const TOURS = [
  {
    name: "Seine evening sightseeing cruise",
    tag: "Suggested for Day 1",
    text: "Relaxed one-hour introduction to illuminated Paris landmarks. Operator: Vedettes de Paris; departure details are on the listing.",
    url: "https://www.getyourguide.com/paris-l16/paris-night-cruise-on-the-seine-river-with-aperitif-t405257/",
  },
  {
    name: "Eiffel Tower second-floor / optional summit access",
    tag: "Suggested for Day 1",
    text: "Timed entry with hosted guidance; summit access only if the selected option includes it.",
    url: "https://www.getyourguide.com/paris-l16/eiffel-tower-access-to-2nd-floor-by-elevator-t403458/",
  },
  {
    name: "Louvre guided tour",
    tag: "Suggested for Day 2",
    text: "A guided visit helps first-time visitors navigate a very large museum. The listing describes a roughly two-hour tour with skip-the-line entry that meets at the Arc de Triomphe du Carrousel; check the languages, group type and exact inclusions before booking.",
    url: "https://www.getyourguide.com/paris-l16/paris-louvre-museum-skip-the-line-tour-t43833/",
  },
  {
    name: "Best of Paris small-group bike tour",
    tag: "Optional active alternative",
    text: "Guided outdoor orientation past major landmarks; suitable only for readers comfortable cycling in an urban setting.",
    url: "https://www.getyourguide.com/paris-l16/paris-landmarks-4-hour-bike-tour-t46330/",
  },
  {
    name: "Palace of Versailles guided visit",
    tag: "Optional extra day",
    text: "Classic palace and Hall of Mirrors visit; travel from Paris and seasonal garden admission need separate planning.",
    url: "https://www.getyourguide.com/paris-l16/versailles-palace-of-versailles-skip-the-line-guided-tour-t398191/",
  },
];

export default function ParisTravelResourcesPage() {
  return (
    <SeoPage path={PATH} name={TITLE} description={DESCRIPTION}>
      <style>{RES_CSS}</style>

      <header className="seo-hero">
        <div className="seo-hero-inner">
          <DestinationCrumb city="Paris" />
          <h1 className="seo-h1">Paris Travel Resources</h1>
          <p className="seo-lead">
            A shortlist for first-time visitors: places to stay in different neighbourhoods and budgets,
            guided experiences worth booking ahead, and the practical extras, flights and a data eSIM for France.
          </p>
        </div>
      </header>

      <div className="res-note">
        <div className="res-note-box">
          <strong>Affiliate disclosure.</strong> Some links on this page are affiliate links. If you book through
          them, I may earn a commission at no extra cost to you. I recommend options based on their relevance to
          first-time visitors, not on commission rates.
        </div>
      </div>

      <Section title="Where to stay">
        <P>
          Six hotels across Paris, from a budget base near the metro to a luxury splurge by the Trocadéro.
          Each link opens the hotel&apos;s own page on Agoda, where you can enter your dates and see current prices.
        </P>
        <div className="res-grid">
          {HOTELS.map((h) => (
            <article className="res-card" key={h.name}>
              <h3>{h.name}</h3>
              <div className="res-meta">
                <span className="res-pill">{h.stars}</span>
                <span>{h.area}</span>
              </div>
              <p>{h.text}</p>
              <a
                className="res-btn"
                href={buildAgodaPropertyUrl(h.url, "paris-resources")}
                target="_blank"
                rel={REL}
              >
                View on Agoda
              </a>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Tours and tickets">
        <P>
          Five experiences that suit a first visit. Timed and skip-the-line options can sell out in busy
          seasons, so it is worth booking these before you travel.
        </P>
        <div className="res-grid">
          {TOURS.map((t) => (
            <article className="res-card" key={t.name}>
              <h3>{t.name}</h3>
              <div className="res-meta">
                <span className="res-pill">{t.tag}</span>
              </div>
              <p>{t.text}</p>
              <a
                className="res-btn"
                href={buildGygActivityUrl(t.url, "paris-resources")}
                target="_blank"
                rel={REL}
              >
                View on GetYourGuide
              </a>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Flights and mobile data">
        <div className="res-two">
          <article className="res-card">
            <h3>Flights to Paris</h3>
            <p>
              Compare fares on Kiwi.com. When the search opens, enter your departure city and Paris
              as the destination.
            </p>
            <a
              className="res-btn"
              href={buildKiwiUrl({ source: "paris-flights" })}
              target="_blank"
              rel={REL}
            >
              Compare flights on Kiwi.com
            </a>
          </article>
          <article className="res-card">
            <h3>eSIM for France</h3>
            <p>
              Land with mobile data already working: install an eSIM before you fly and skip roaming charges
              and airport SIM queues.
            </p>
            <a
              className="res-btn"
              href={buildAiraloUrl({ source: "paris-esim", landing: "https://www.airalo.com/france-esim" })}
              target="_blank"
              rel={REL}
            >
              Get a France eSIM on Airalo
            </a>
          </article>
        </div>
      </Section>

      <Section title="Before you book">
        <P>
          Ratings, prices, availability, cancellation terms and inclusions change, so check the details on the
          booking page before you pay. If an Eiffel Tower view matters to you, confirm it for the specific room
          category, as it is not guaranteed by the hotel alone.
        </P>
      </Section>

      <MoreDestinations current="paris" />

      <CtaBand
        title="Plan your Paris trip in TUlon"
        text="Build a day-by-day Paris itinerary, keep your bookings and budget in one place, and split expenses with the people you travel with."
        cta="Start planning"
      />
    </SeoPage>
  );
}
