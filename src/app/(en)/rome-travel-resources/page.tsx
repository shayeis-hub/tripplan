import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { DestinationCrumb, MoreDestinations } from "@/components/DestinationLinks";
import { SeoPage, Section, P, List, CtaBand } from "@/components/SeoLanding";
import { RES_CSS, AFFILIATE_REL } from "@/components/resourcePageStyles";
import {
  buildAgodaPropertyUrl,
  buildGygActivityUrl,
  buildAiraloUrl,
  buildKiwiUrl,
} from "@/lib/affiliate";

const PATH = "/rome-travel-resources";
const TITLE = "Rome Travel Resources: Where to Stay and What to Book | TUlon";
const DESCRIPTION =
  "Where to stay in Rome and what to book: four hotels by neighborhood, tours that fit a four-day first visit, official ticket and transport links, plus flights and an eSIM for Italy.";

export const metadata: Metadata = pageMeta({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  locale: "en_US",
  image: { url: "/icon-512.png", width: 512, height: 512, alt: "TUlon app icon" },
});

const HOTELS = [
  {
    name: "Hotel Navona",
    subtitle: "A Historic-Center Base for Walking",
    area: "Pantheon / Piazza Navona",
    address: "Via dei Sediari 8",
    bestFor: "Travelers who want to explore the historic center on foot and return easily after dinner.",
    budget: "Midrange, with location a major part of the value.",
    text: "Between the Pantheon and Piazza Navona, Hotel Navona is a useful base for the guide’s second day and for evening walks through the center. Choose it if being near the squares matters more than staying beside a metro station.",
    tip: "Confirm the exact room category, building location, and access to your floor, especially if stairs or luggage handling are concerns.",
    agoda: "https://www.agoda.com/hotel-navona/hotel/rome-it.html",
    agodaLabel: "View Hotel Navona on Agoda",
    official: "https://www.hotelnavona.com/",
  },
  {
    name: "Hotel Duca d’Alba",
    subtitle: "Stay in Monti",
    area: "Monti",
    address: "Via Leonina 14",
    bestFor: "Visitors who want a neighborhood base convenient for ancient Rome.",
    budget: "Midrange to upper-midrange.",
    text: "Hotel Duca d’Alba suits a first visit centered on the Colosseum and the streets of Monti. Its location works particularly well for the ancient-Rome day, with nearby neighborhood streets for breakfast and dinner.",
    tip: "The Agoda listing includes annex room categories. Check which building and room you are reserving, along with the route from the street to the room.",
    agoda: "https://www.agoda.com/hotel-duca-d-alba-chateaux-et-hotels-collection/hotel/rome-it.html",
    agodaLabel: "View Hotel Duca d’Alba on Agoda",
    official: "https://www.hotelducadalba.com/en/",
  },
  {
    name: "Hotel Artemide",
    subtitle: "A Convenient Via Nazionale Base",
    area: "Via Nazionale / Termini side of the center",
    address: "Via Nazionale 22",
    bestFor: "Travelers who value transport connections while retaining access toward Monti and the center.",
    budget: "Upper-midrange.",
    text: "Hotel Artemide is a useful option when arrival and onward travel are important to the choice of base. The Via Nazionale location offers a different balance from a hotel tucked into the narrow lanes around Piazza Navona.",
    tip: "Compare the complete room offer, breakfast terms, and cancellation policy. Check your final journey from Termini to the hotel with luggage rather than assuming a station-area label means no transfer is needed.",
    agoda: "https://www.agoda.com/en-us/hotel-artemide_6/hotel/rome-it.html",
    agodaLabel: "View Hotel Artemide on Agoda",
    official: "",
  },
  {
    name: "Hotel dei Mellini",
    subtitle: "A Prati-Side Base",
    area: "Prati, near the Tiber",
    address: "Via Muzio Clementi 81",
    bestFor: "Visitors who prefer wider streets and a base on the Vatican side of the river.",
    budget: "Upper-midrange.",
    text: "Hotel dei Mellini offers a base in eastern Prati, useful for combining the Vatican side with walks across the river toward the historic center. It suits travelers who want to spend evenings in a different setting from the busiest monument squares.",
    tip: "Map the separate journeys to the Vatican Museums entrance and St. Peter’s Square. They are different destinations, and a hotel’s Vatican-area description does not mean it stands beside both entrances.",
    agoda: "https://www.agoda.com/en-sg/dei-mellini-hotel/hotel/rome-it.html",
    agodaLabel: "View Hotel dei Mellini on Agoda",
    official: "https://www.hotelmellini.com/",
  },
];

const EXPERIENCES = [
  {
    day: "Day 1",
    name: "Guided Tour of the Colosseum, Roman Forum, and Palatine Hill",
    bestFor: "First-time visitors who want historical context while visiting the ancient core.",
    text: "A guided visit can connect the amphitheater with the surrounding archaeological landscape. If you choose a combined tour, follow its sequence and meeting instructions; it may bring the Forum and Palatine into the same continuous outing before lunch instead of the guide’s independent morning-and-afternoon arrangement.",
    before: "Confirm that the selected option includes all the sites you want. Arena and underground access are separate inclusions and must not be assumed. Check the walking demands and meeting point.",
    gyg: "https://www.getyourguide.com/rome-l33/rome-skip-the-line-group-tour-colosseum-forum-palatine-hill-t405524/",
    official: [
      {
        label: "Colosseum, Roman Forum, and Palatine ticket information",
        url: "https://colosseo.it/en/tickets/colosseum-roman-forum-palatine/",
      },
    ],
    officialNote: "Follow the park’s official purchase link for an independent admission option.",
  },
  {
    day: "Day 2",
    name: "Pantheon Entry Ticket and Official Audioguide",
    bestFor: "Visitors who want a compact, self-paced introduction to the Pantheon’s architecture and history.",
    text: "This product combines the Pantheon visit with audio interpretation. It fits the historic-center walking day without committing the afternoon to another large museum.",
    before:
      "Read the selected option’s entry inclusions and collection instructions. The listing directs visitors to OhMyGuide - Roma Museum Store on Via dei Bergamaschi 49 for collection. Do not assume that the booking starts at the monument’s entrance or that the URL’s older “fast-track” wording removes all queues. Tourist visits remain subject to the building’s religious use.",
    gyg: "https://www.getyourguide.com/rome-l33/pantheon-rome-fast-track-ticket-and-only-official-audioguide-t122912/",
    official: [
      {
        label: "Italian Ministry of Culture: Pantheon information and official ticket purchase route",
        url: "https://cultura.gov.it/luogo/pantheon",
      },
    ],
    officialNote: "Compare ordinary admission if you do not want an audio package.",
  },
  {
    day: "Day 3",
    name: "Vatican Museums and Sistine Chapel Guided Tour",
    bestFor: "Travelers who want guidance through a large collection and context for a selection of highlights.",
    text: "A guided tour can help organize the museum morning, leaving lunch in Prati and a flexible afternoon. Keep St. Peter’s Basilica a separate decision instead of assuming the museum booking provides a passage into it.",
    before:
      "Check the language, duration, group size, meeting point, and actual inclusions. Confirm the visiting date against the Vatican Museums calendar and allow time after the tour before another appointment.",
    gyg: "https://www.getyourguide.com/rome-l33/rome-vatican-museums-and-sistine-chapel-guided-tour-t831051/",
    official: [
      { label: "Vatican Museums booking portal", url: "https://tickets.museivaticani.va" },
      {
        label: "official opening calendar",
        url: "https://www.museivaticani.va/content/museivaticani/en/info/orari-musei-vaticani.html",
      },
    ],
    officialNote: "",
  },
  {
    day: "Day 4",
    name: "Rome All in One: Trastevere Food Tour, Dinner & Wine",
    bestFor: "Visitors who want a food-focused evening in Trastevere.",
    text: "This guided food experience is an alternative to a separate dinner. It can fit a shorter Trastevere day; keep the Aventine and Testaccio extensions optional so the evening remains enjoyable.",
    before:
      "Confirm the departure time and meeting point for your chosen option. The current listing describes vegetarian and alcohol-free options but says it cannot accommodate vegan or gluten-free diets and is not suitable for people with food allergies or wheelchair users. Contact the operator about any specific requirement before paying.",
    gyg: "https://www.getyourguide.com/rome-l33/rome-all-in-one-trastevere-food-tour-dinner-drinks-t420045/",
    official: [],
    officialNote: "",
  },
];

const FREE_VISITS = [
  {
    name: "Piazza Navona",
    text: "A natural pause on the historic-center day. Enjoy the fountains and the square’s shape without making another booking.",
    label: "Official city visitor information",
    url: "https://www.turismoroma.it/en/places/navona-square",
  },
  {
    name: "Trevi Fountain",
    text: "You can see the fountain from outside its controlled closest viewing area without buying admission to that area. If you want to enter the monumental area, consult the official access system and its exemptions.",
    label: "Official Trevi Fountain visitor information",
    url: "https://www.fontanaditrevi.roma.it/en",
  },
  {
    name: "St. Peter’s Basilica",
    text: "Ordinary entry is free, with security checks and access subject to services and events. Optional paid reservation or audio services are separate choices.",
    label: "Official basilica visitor information",
    url: "https://www.basilicasanpietro.va/en/help/the-basilica",
  },
  {
    name: "Orange Garden / Parco Savello",
    text: "An optional Aventine viewpoint on the fourth day. Check the posted park hours and allow time for the uphill approach.",
    label: "Official city visitor information",
    url: "https://turismoroma.it/en/node/1925",
  },
  {
    name: "Mercato Testaccio",
    text: "A food-focused alternative to the Aventine extension. Use the market’s own information to choose a stall and confirm when it operates.",
    label: "Official market website",
    url: "https://www.mercatoditestaccio.it/",
  },
];

const PLANNING = [
  { label: "Rome public transport maps - ATAC", url: "https://www.atac.roma.it/en/utility/maps" },
  { label: "Rome urban tickets - ATAC", url: "https://www.atac.roma.it/en/tickets-and-passes" },
  { label: "Leonardo Express airport rail information - Trenitalia", url: "https://www.trenitalia.com/en/connections/leonardo-express.html" },
  { label: "Official Rome tourism website", url: "https://www.turismoroma.it/en" },
];

export default function RomeTravelResourcesPage() {
  return (
    <SeoPage path={PATH} name={TITLE} description={DESCRIPTION}>
      <style>{RES_CSS}</style>

      <header className="seo-hero">
        <div className="seo-hero-inner">
          <DestinationCrumb city="Rome" />
          <h1 className="seo-h1">Rome Travel Resources: Where to Stay and What to Book</h1>
          <p className="seo-lead">
            Plan a first visit to Rome around a comfortable base and a few well-chosen reservations. These
            accommodation options cover the historic center, Monti, the Via Nazionale area, and Prati. The
            experiences below fit the four neighborhood-based days in <em>Rome for First-Timers</em>. Choose the
            visits that interest you, compare the options, and leave time between major bookings.
          </p>
          <p className="res-updated">Updated 18 October 2026</p>
        </div>
      </header>

      <div className="res-note">
        <div className="res-note-box">
          <strong>Affiliate disclosure.</strong> Some links on this page may be affiliate links. If you book
          through them, we may earn a commission at no additional cost to you.
        </div>
      </div>

      <Section title="Where to Stay in Rome">
        <P>
          The budget descriptions below are relative positioning, not quoted room rates. Compare the total price
          for your dates, room category, cancellation terms, breakfast, local taxes, and access requirements
          before booking. These are researched suggestions rather than accounts of personal stays.
        </P>
        <div className="res-grid">
          {HOTELS.map((h) => (
            <article className="res-card" key={h.name}>
              <h3>{h.name}</h3>
              <div className="res-sub">{h.subtitle}</div>
              <div className="res-meta">
                <span className="res-pill">{h.area}</span>
                <span>{h.address}</span>
              </div>
              <p>
                <strong>Best for:</strong> {h.bestFor}
              </p>
              <p>
                <strong>Budget positioning:</strong> {h.budget}
              </p>
              <p>{h.text}</p>
              <p>
                <strong>Booking tip:</strong> {h.tip}
              </p>
              <div className="res-links">
                <a
                  className="res-btn"
                  href={buildAgodaPropertyUrl(h.agoda, "rome-resources")}
                  target="_blank"
                  rel={AFFILIATE_REL}
                >
                  {h.agodaLabel}
                </a>
                {h.official && (
                  <a className="res-alt" href={h.official} target="_blank" rel="noopener noreferrer">
                    Hotel’s official website
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Experiences That Fit the Four-Day Guide">
        <P>
          These are optional ways to add interpretation or organize a visit. Match the exact option to your
          interests, language, access needs, and available time. Prices, departure times, inclusions, and
          cancellation conditions depend on the selected date and product.
        </P>
        <div className="res-grid">
          {EXPERIENCES.map((e) => (
            <article className="res-card" key={e.name}>
              <div className="res-meta">
                <span className="res-pill">{e.day}</span>
              </div>
              <h3>{e.name}</h3>
              <p>
                <strong>Best for:</strong> {e.bestFor}
              </p>
              <p>{e.text}</p>
              <p>
                <strong>Before booking:</strong> {e.before}
              </p>
              <div className="res-links">
                <a
                  className="res-btn"
                  href={buildGygActivityUrl(e.gyg, "rome-resources")}
                  target="_blank"
                  rel={AFFILIATE_REL}
                >
                  View on GetYourGuide
                </a>
              </div>
              {e.official.length > 0 && (
                <p>
                  <strong>Official alternative{e.official.length > 1 ? "s" : ""}:</strong>{" "}
                  {e.official.map((o, i) => (
                    <span key={o.url}>
                      {i > 0 && " and "}
                      <a href={o.url} target="_blank" rel="noopener noreferrer">
                        {o.label}
                      </a>
                    </span>
                  ))}
                  .{e.officialNote ? ` ${e.officialNote}` : ""}
                </p>
              )}
            </article>
          ))}
        </div>
      </Section>

      <Section title="Places You Can Enjoy Without Buying a Guided Tour">
        <div className="res-grid">
          {FREE_VISITS.map((v) => (
            <article className="res-card" key={v.name}>
              <h3>{v.name}</h3>
              <p>{v.text}</p>
              <div className="res-links">
                <a className="res-alt" href={v.url} target="_blank" rel="noopener noreferrer">
                  {v.label}
                </a>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Practical Planning Links">
        <List
          items={PLANNING.map((p) => (
            <span key={p.url}>
              <a href={p.url} target="_blank" rel="noopener noreferrer">
                {p.label}
              </a>
            </span>
          ))}
        />
      </Section>

      <Section title="Flights and mobile data">
        <div className="res-two">
          <article className="res-card">
            <h3>Flights to Rome</h3>
            <p>
              Compare fares on Kiwi.com. When the search opens, enter your departure city and Rome as the
              destination.
            </p>
            <a
              className="res-btn"
              href={buildKiwiUrl({ source: "rome-flights" })}
              target="_blank"
              rel={AFFILIATE_REL}
            >
              Compare flights on Kiwi.com
            </a>
          </article>
          <article className="res-card">
            <h3>eSIM for Italy</h3>
            <p>
              Land with mobile data already working: install an eSIM before you fly and skip roaming charges and
              airport SIM queues.
            </p>
            <a
              className="res-btn"
              href={buildAiraloUrl({ source: "rome-esim", landing: "https://www.airalo.com/italy-esim" })}
              target="_blank"
              rel={AFFILIATE_REL}
            >
              Get an Italy eSIM on Airalo
            </a>
          </article>
        </div>
      </Section>

      <Section title="Affiliate Disclosure">
        <P>
          Some links on this page may be affiliate links. If you book through them, we may earn a commission at no
          additional cost to you. We recommend comparing the options, including official admission where
          appropriate, and choosing the booking method that suits your trip.
        </P>
      </Section>

      <MoreDestinations current="rome" />

      <CtaBand
        title="Plan your Rome trip in TUlon"
        text="Build a day-by-day Rome itinerary, keep your bookings and budget in one place, and split expenses with the people you travel with."
        cta="Start planning"
      />
    </SeoPage>
  );
}
