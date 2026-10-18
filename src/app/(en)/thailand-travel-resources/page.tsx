import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMeta } from "@/lib/seo";
import { SeoPage, Section, P, List, CtaBand } from "@/components/SeoLanding";
import { RES_CSS, AFFILIATE_REL } from "@/components/resourcePageStyles";
import {
  buildAgodaPropertyUrl,
  buildGygActivityUrl,
  buildAiraloUrl,
  buildKiwiUrl,
} from "@/lib/affiliate";

const PATH = "/thailand-travel-resources";
const TITLE = "Thailand Travel Resources | TUlon";
const DESCRIPTION =
  "A companion to Thailand for First-Timers: hotels for Bangkok, Chiang Mai, Chiang Rai and the Gulf or Andaman coast, tours to compare, official sites and transport links, plus flights and an eSIM for Thailand.";

export const metadata: Metadata = pageMeta({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  locale: "en_US",
  image: { url: "/icon-512.png", width: 512, height: 512, alt: "TUlon app icon" },
});

type Hotel = {
  name: string;
  area: string;
  nights: string;
  why: string;
  agoda: string;
  site?: { label: string; url: string };
  note?: string;
};

const BANGKOK: Hotel[] = [
  {
    name: "Chillax Resort",
    area: "Samsen / Banglamphu, Bangkok",
    nights: "Nights 1–5",
    why: "Old-town access for the historic Bangkok days. Check that you are booking this property, as other hotels have similar names.",
    agoda: "https://www.agoda.com/en-us/chillax-resort/hotel/bangkok-th.html",
    site: { label: "Hotel website", url: "https://www.chillaxresort.com/" },
  },
];

const CHIANG_MAI: Hotel[] = [
  {
    name: "Empress Premier Hotel Chiang Mai",
    area: "Chang Khlan / Night Bazaar side",
    nights: "Nights 6–11",
    why: "A larger-hotel alternative to a lane in the Old City. Verify the full property name when you book.",
    agoda: "https://www.agoda.com/empress-premier-hotel-chiang-mai/hotel/chiang-mai-th.html",
    note: "Confirm location, facilities, and room terms with the hotel through the listing.",
  },
];

const CHIANG_RAI: Hotel[] = [
  {
    name: "Nak Nakara Hotel",
    area: "Central Chiang Rai",
    nights: "Nights 12–13",
    why: "Convenient for a two-night city stay and arranged temple transport.",
    agoda: "https://www.agoda.com/nak-nakara-hotel/hotel/chiang-rai-th.html",
    site: { label: "Hotel website", url: "https://www.naknakarahotel.com/" },
  },
];

const GULF: Hotel[] = [
  {
    name: "Synergy Samui Resort",
    area: "Chaweng Beach, Koh Samui",
    nights: "Gulf nights 14–17",
    why: "A beachfront option with services nearby. Make sure you open the Koh Samui listing.",
    agoda: "https://www.agoda.com/en-ie/synergy-samui-resort/hotel/koh-samui-th.html",
    site: { label: "Hotel website", url: "https://www.synergysamui.com/" },
  },
  {
    name: "Buri Rasa Village Phangan",
    area: "Thong Nai Pan Noi, Koh Phangan",
    nights: "Gulf nights 18–19",
    why: "A beach-centered stay that requires an arranged pier transfer. Check room-specific age conditions.",
    agoda: "https://www.agoda.com/buri-rasa-koh-phangan/hotel/ko-pha-ngan-th.html",
    site: { label: "Accommodation information", url: "https://www.burirasa.com/phangan/accommodation/" },
  },
];

const ANDAMAN: Hotel[] = [
  {
    name: "Panan Krabi Resort",
    area: "Ao Nang, Krabi",
    nights: "Andaman nights 14–16",
    why: "A practical road-access base for the Krabi part of the route.",
    agoda: "https://www.agoda.com/en-us/panan-krabi-resort_2/hotel/krabi-th.html",
    note: "Use the hotel’s contact in the listing for current access and room details.",
  },
  {
    name: "Long Beach Chalet",
    area: "Long Beach, Koh Lanta",
    nights: "Andaman nights 17–19",
    why: "A beach stay. Check which room zone you are booking and the actual approach to the beach.",
    agoda: "https://www.agoda.com/long-beach-chalet/hotel/koh-lanta-th.html",
    note: "Confirm the room category and the transfer with the property through the listing.",
  },
];

type Experience = {
  day: string;
  name: string;
  fit: string;
  note: string;
  gyg: string;
};

const BANGKOK_TOURS: Experience[] = [
  {
    day: "Day 2",
    name: "Bangkok: City Highlights Temple and Market Walking Tour",
    fit: "Guided palace context",
    note: "Compare the option that covers the Grand Palace and Wat Pho. Confirm admissions and the option you choose.",
    gyg: "https://www.getyourguide.com/bangkok-l169/bangkok-city-highlights-temple-and-market-walking-tour-t158046/",
  },
  {
    day: "Day 4",
    name: "From Bangkok: Ayutthaya Temples Guided Tour with Lunch",
    fit: "Return excursion",
    note: "This package covers more sites than a slower two-site visit, so choose it only if that pace suits you; private transport can keep the route smaller.",
    gyg: "https://www.getyourguide.com/bangkok-l169/from-bangkok-ayutthaya-temples-guided-tour-with-lunch-t383879/",
  },
  {
    day: "Day 5",
    name: "Jim Thompson House Museum Ticket and Tour",
    fit: "Optional museum anchor",
    note: "A museum-operated listing, reached from the museum’s own authorized-booking link. Direct visitor information is also linked below.",
    gyg: "https://www.getyourguide.com/bangkok-l169/jim-thompson-house-museum-entry-ticket-and-tour-t1403383/",
  },
];

const CHIANG_MAI_TOURS: Experience[] = [
  {
    day: "Day 7",
    name: "Chiang Mai: 3 Hour Old City and Temples Guided Walking Tour",
    fit: "Optional guided context",
    note: "Includes an additional temple beyond the two core anchors. Confirm admission exclusions and the meeting point; independent entry remains an option.",
    gyg: "https://www.getyourguide.com/chiang-mai-l271/chiang-mai-3-hour-old-city-and-temples-guided-walking-tour-t431600/",
  },
  {
    day: "Day 8",
    name: "Chiang Mai: Doi Suthep, Wat Umong, and Pha Lat Sunrise Tour",
    fit: "Optional organized alternative",
    note: "An earlier start and an extra temple compared with a lighter plan. Confirm the actual date and option before booking.",
    gyg: "https://www.getyourguide.com/chiang-mai-l271/chiang-mai-doi-suthep-wat-umong-and-pha-lat-sunrise-tour-t370746/",
  },
  {
    day: "Day 9",
    name: "Chiang Mai: Doi Inthanon Park and Pha Dok Siew Trail Trek",
    fit: "Walking-focused version",
    note: "A substantial trail component. Choose a scenic-drive alternative if the walking requirement is unsuitable.",
    gyg: "https://www.getyourguide.com/chiang-mai-l271/chiang-mai-doi-inthanon-park-and-pha-dok-siew-trail-trek-t483768/",
  },
  {
    day: "Day 10",
    name: "Chiang Mai: Mae Kampong Jungle Hike and Cooking Class",
    fit: "One full village-based experience",
    note: "Combines walking and cooking. It is meant to be the day’s single main experience, so avoid stacking it with an elephant visit or another cooking class.",
    gyg: "https://www.getyourguide.com/chiang-mai-l271/chiang-mai-mae-kampong-jungle-hike-and-cooking-class-t1118415/",
  },
  {
    day: "Day 11",
    name: "Chiang Mai: Thai Cooking Class and Farm Visit",
    fit: "Optional cooking anchor",
    note: "Check dietary adaptation and pickup before booking.",
    gyg: "https://www.getyourguide.com/chiang-mai-l271/chiang-mai-authentic-cooking-class-with-market-farm-visit-t187629/",
  },
];

const CHIANG_RAI_TOURS: Experience[] = [
  {
    day: "Day 13",
    name: "Chiang Rai: Half-Day Private Bespoke Sightseeing",
    fit: "Customizable local transport and guiding",
    note: "Confirm the selected date and your custom route with the provider. Ask for the Blue Temple plus one other stop; a four-stop offer is not a requirement.",
    gyg: "https://www.getyourguide.com/chiang-rai-l913/chiang-rai-half-day-private-bespoke-sightseeing-t758242/",
  },
];

const GULF_TOURS: Experience[] = [
  {
    day: "Day 16",
    name: "Samui: Ang Thong Marine Park Boat Tour with Transfer and Meals",
    fit: "Gulf branch only",
    note: "Match the boat type, walking, kayaking, meal and park-fee terms to the option you select. Access and sea conditions govern the day.",
    gyg: "https://www.getyourguide.com/ko-samui-l898/samui-angthong-marine-park-boat-tour-w-transfer-and-meals-t475368/",
  },
];

const ANDAMAN_TOURS: Experience[] = [
  {
    day: "Day 16",
    name: "Krabi: Hong Islands Day Trip by Speedboat with Lunch",
    fit: "Andaman branch only",
    note: "An alternative to Ang Thong, not an additional day on the other coast. Confirm fees, the pickup area and the suitability of the boat.",
    gyg: "https://www.getyourguide.com/krabi-l2174/krabi-hong-islands-day-trip-by-speedboat-with-lunch-t144153/",
  },
];

type Link = { label: string; url: string; text: string };

const SIGHTS: Link[] = [
  { label: "Wat Pho official site", url: "https://www.watpho.com/en/home", text: "its own visitor notices and temple information." },
  {
    label: "Jim Thompson House visitor information",
    url: "https://jimthompsonhouse.org/visitor-information/",
    text: "direct visitor information for the optional Day 5 museum; follow the museum’s current authorized-booking links rather than an unverified reseller.",
  },
  {
    label: "Grand Palace visitor information",
    url: "https://www.royalgrandpalace.th/en/visit/practical-information",
    text: "official access and dress information for an independent visit.",
  },
  {
    label: "Ayutthaya historical park",
    url: "https://www.thailandtourismdirectory.go.th/en/attraction/1461",
    text: "site context and current visitor information. See also the UNESCO context below.",
  },
  { label: "UNESCO: Ayutthaya", url: "https://whc.unesco.org/en/list/576", text: "World Heritage context for the historic city." },
];

const PLANNING: Link[] = [
  {
    label: "Tourism Authority of Thailand",
    url: "https://www.tourismthailand.org/",
    text: "regional destination information, including individual temple, island, and national-park entries.",
  },
  { label: "Thai Meteorological Department", url: "https://www.tmd.go.th/en/", text: "warnings, weather, and marine information." },
];

const TRANSPORT: Link[] = [
  { label: "BTS map", url: "https://www.bts.co.th/eng/routemap.html", text: "Bangkok Skytrain routes." },
  { label: "MRT operator", url: "https://metro.bemplc.co.th/", text: "Bangkok metro information and tickets." },
  { label: "Chao Phraya Express Boat", url: "https://www.chaophrayaexpressboat.com/", text: "river boat service and current tickets." },
  { label: "Chao Phraya Tourist Boat", url: "https://chaophrayatouristboat.com/", text: "a separate tourist boat service and current tickets." },
  { label: "GreenBus routes", url: "https://web.greenbusthailand.com/en/routes", text: "northern bus routes to compare." },
  { label: "Lomprayah", url: "https://www.lomprayah.com/", text: "lower-Gulf ferry comparisons." },
  {
    label: "State Railway of Thailand D-Ticket",
    url: "https://dticket.railway.co.th/DTicketPublicWeb/home/",
    text: "actual train, station, date, and fare search.",
  },
];

const ENTRY: Link[] = [
  { label: "Official TDAC", url: "https://tdac.immigration.go.th/", text: "the Thailand Digital Arrival Card, part of the official arrival process." },
  { label: "Thai e-Visa", url: "https://www.thaievisa.go.th/", text: "nationality-specific preparation and the official process." },
];

function HotelCard({ h }: { h: Hotel }) {
  return (
    <article className="res-card">
      <h3>{h.name}</h3>
      <div className="res-meta">
        <span className="res-pill">{h.nights}</span>
        <span>{h.area}</span>
      </div>
      <p>{h.why}</p>
      <div className="res-links">
        <a
          className="res-btn"
          href={buildAgodaPropertyUrl(h.agoda, "thailand-resources")}
          target="_blank"
          rel={AFFILIATE_REL}
        >
          View on Agoda
        </a>
        {h.site && (
          <a className="res-alt" href={h.site.url} target="_blank" rel="noopener noreferrer">
            {h.site.label}
          </a>
        )}
      </div>
      {h.note && <p className="res-info">{h.note}</p>}
    </article>
  );
}

function TourCard({ t }: { t: Experience }) {
  return (
    <article className="res-card">
      <div className="res-meta">
        <span className="res-pill">{t.day}</span>
        <span>{t.fit}</span>
      </div>
      <h3>{t.name}</h3>
      <p>{t.note}</p>
      <div className="res-links">
        <a
          className="res-btn"
          href={buildGygActivityUrl(t.gyg, "thailand-resources")}
          target="_blank"
          rel={AFFILIATE_REL}
        >
          View on GetYourGuide
        </a>
      </div>
    </article>
  );
}

function LinkList({ title, items }: { title: string; items: Link[] }): ReactNode {
  return (
    <>
      <h3 className="res-sec-h">{title}</h3>
      <List
        items={items.map((l) => (
          <span key={l.url}>
            <a href={l.url} target="_blank" rel="noopener noreferrer">
              {l.label}
            </a>
            : {l.text}
          </span>
        ))}
      />
    </>
  );
}

export default function ThailandTravelResourcesPage() {
  return (
    <SeoPage path={PATH} name={TITLE} description={DESCRIPTION}>
      <style>{RES_CSS}</style>

      <header className="seo-hero">
        <div className="seo-hero-inner">
          <h1 className="seo-h1">Thailand Travel Resources</h1>
          <p className="res-lead-strong">
            A companion to <em>Thailand for First-Timers</em> by Shay Eisenberg
          </p>
          <p className="seo-lead">
            Plan three weeks around Bangkok, the north, and one seasonal coastal route. Choose the lower Gulf or
            the Andaman branch before booking hotels. The options below support the book’s geography; they are
            comparisons rather than promises of availability or a guarantee that every room or tour suits every
            traveler. Check the actual dates, room category, pickup point, and cancellation terms.
          </p>
          <p className="res-updated">Updated 18 October 2026</p>
        </div>
      </header>

      <div className="res-note">
        <div className="res-note-box">
          <strong>Affiliate disclosure.</strong> Some booking links may be affiliate links. If you book through
          them, we may earn a commission. Choose the option that best suits your trip.
        </div>
      </div>

      <Section title="Where to stay">
        <P>
          Compare the specific setting with the alternatives in the book rather than treating every hotel as a
          recommendation for every reader. The nights shown follow the book’s route.
        </P>

        <h3 className="res-sec-h">Bangkok</h3>
        <div className="res-grid">
          {BANGKOK.map((h) => (
            <HotelCard h={h} key={h.name} />
          ))}
        </div>

        <h3 className="res-sec-h">Chiang Mai</h3>
        <div className="res-grid">
          {CHIANG_MAI.map((h) => (
            <HotelCard h={h} key={h.name} />
          ))}
        </div>

        <h3 className="res-sec-h">Chiang Rai</h3>
        <div className="res-grid">
          {CHIANG_RAI.map((h) => (
            <HotelCard h={h} key={h.name} />
          ))}
        </div>

        <h3 className="res-sec-h">Choose your coast</h3>
        <div className="res-note-box">
          The last part of the route follows one of two seasonal coastal branches. Choose the lower Gulf (Koh
          Samui and Koh Phangan) or the Andaman coast (Krabi and Koh Lanta) before you book, and use only that
          group of hotels.
          <div className="res-coast">
            <a className="res-btn" href="#gulf">
              Lower Gulf hotels
            </a>
            <a className="res-btn" href="#andaman">
              Andaman hotels
            </a>
          </div>
        </div>

        <h3 className="res-sec-h res-anchor" id="gulf">
          Lower Gulf: Koh Samui and Koh Phangan
        </h3>
        <div className="res-grid">
          {GULF.map((h) => (
            <HotelCard h={h} key={h.name} />
          ))}
        </div>

        <h3 className="res-sec-h res-anchor" id="andaman">
          Andaman: Krabi and Koh Lanta
        </h3>
        <div className="res-grid">
          {ANDAMAN.map((h) => (
            <HotelCard h={h} key={h.name} />
          ))}
        </div>
      </Section>

      <Section title="Bookable experiences">
        <P>
          These are useful comparisons, not a requirement to use an intermediary. Package routes may be fuller
          than the book’s preferred pace, so you can also arrange a simpler private route or buy site admission
          directly. Inclusions, pickups, fees, and availability depend on the option and date you select.
        </P>

        <h3 className="res-sec-h">Bangkok</h3>
        <div className="res-grid">
          {BANGKOK_TOURS.map((t) => (
            <TourCard t={t} key={t.name} />
          ))}
        </div>

        <h3 className="res-sec-h">Chiang Mai</h3>
        <div className="res-grid">
          {CHIANG_MAI_TOURS.map((t) => (
            <TourCard t={t} key={t.name} />
          ))}
        </div>

        <h3 className="res-sec-h">Chiang Rai</h3>
        <div className="res-grid">
          {CHIANG_RAI_TOURS.map((t) => (
            <TourCard t={t} key={t.name} />
          ))}
        </div>

        <h3 className="res-sec-h">Lower Gulf branch</h3>
        <div className="res-grid">
          {GULF_TOURS.map((t) => (
            <TourCard t={t} key={t.name} />
          ))}
        </div>

        <h3 className="res-sec-h">Andaman branch</h3>
        <div className="res-grid">
          {ANDAMAN_TOURS.map((t) => (
            <TourCard t={t} key={t.name} />
          ))}
        </div>
      </Section>

      <Section title="Official resources and independent visits">
        <LinkList title="Sights and museums" items={SIGHTS} />
        <LinkList title="Planning and weather" items={PLANNING} />
        <LinkList title="Getting around" items={TRANSPORT} />
        <LinkList title="Entering Thailand" items={ENTRY} />
        <P>
          For ordinary temple entry, grounds, markets, and beach time, an organized tour is not compulsory.
          Admission and guided transport are separate decisions. No particular elephant provider is endorsed:
          assess current practices before selecting any experience.
        </P>
      </Section>

      <Section title="Flights and mobile data">
        <div className="res-two">
          <article className="res-card">
            <h3>Flights to Thailand</h3>
            <p>
              Compare fares on Kiwi.com. When the search opens, enter your departure city and your arrival
              airport as the destination.
            </p>
            <a
              className="res-btn"
              href={buildKiwiUrl({ source: "thailand-flights" })}
              target="_blank"
              rel={AFFILIATE_REL}
            >
              Compare flights on Kiwi.com
            </a>
          </article>
          <article className="res-card">
            <h3>eSIM for Thailand</h3>
            <p>
              Land with mobile data already working: install an eSIM before you fly and skip roaming charges and
              airport SIM queues.
            </p>
            <a
              className="res-btn"
              href={buildAiraloUrl({ source: "thailand-esim", landing: "https://www.airalo.com/thailand-esim" })}
              target="_blank"
              rel={AFFILIATE_REL}
            >
              Get a Thailand eSIM on Airalo
            </a>
          </article>
        </div>
      </Section>

      <Section title="Affiliate disclosure">
        <P>
          Some booking links may be affiliate links. If you book through them, we may earn a commission. Choose
          the option that best suits your trip.
        </P>
      </Section>

      <CtaBand
        title="Plan your Thailand trip in TUlon"
        text="Build a day-by-day itinerary, keep your bookings and budget in one place, and split expenses with the people you travel with."
        cta="Start planning"
      />
    </SeoPage>
  );
}
