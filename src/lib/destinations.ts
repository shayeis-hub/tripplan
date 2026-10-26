// Registry of the destination resource pages (app/(en)/<slug>-travel-resources).
// Adding a destination here puts it on /destinations, in the sitemap, in the
// "More destinations" block of every other destination page and in the home
// page section. The page itself still has to be created at `path`.
export interface Destination {
  slug: string; // short id used for "current page" checks
  city: string;
  sub: string; // country or region line
  path: string;
  blurb: string;
  includes: string[];
  updated: string; // ISO date of the last content update
  he?: string; // path of the Hebrew copy, when there is one (hreflang pair of `path`)
}

export const DESTINATIONS: Destination[] = [
  {
    slug: "paris",
    city: "Paris",
    sub: "France",
    path: "/paris-travel-resources",
    blurb: "Six hotels from budget to luxury, guided tours and tickets, plus flights and an eSIM for France.",
    includes: ["Hotels", "Tours and tickets", "Flights and eSIM"],
    updated: "2026-10-18",
  },
  {
    slug: "prague",
    city: "Prague",
    sub: "Czech Republic",
    path: "/prague-travel-resources",
    he: "/he/prague-travel-resources",
    blurb: "Four hotels by neighborhood, guided tours, and official sites for sights and transport.",
    includes: ["Hotels", "Tours", "Official links", "Flights and eSIM"],
    updated: "2026-10-18",
  },
  {
    slug: "rome",
    city: "Rome",
    sub: "Italy",
    path: "/rome-travel-resources",
    blurb: "Four hotels across the historic center, Monti and Prati, experiences by itinerary day, and official ticket links.",
    includes: ["Hotels", "Tours", "Official links", "Flights and eSIM"],
    updated: "2026-10-18",
  },
  {
    slug: "thailand",
    city: "Thailand",
    sub: "Bangkok, the north and the islands",
    path: "/thailand-travel-resources",
    blurb: "Hotels for Bangkok, Chiang Mai and Chiang Rai, a Gulf or Andaman coast, and tours to compare.",
    includes: ["Hotels", "Tours", "Official links", "Flights and eSIM"],
    updated: "2026-10-18",
  },
  {
    slug: "vienna",
    city: "Vienna & the Lakes",
    sub: "Austria",
    path: "/vienna-lakes-travel-resources",
    he: "/he/vienna-lakes-travel-resources",
    blurb: "Where to stay in Bad Goisern and Vienna, official links for every stop from Melk to Hallstatt, and tickets for Schönbrunn and the Prater.",
    includes: ["Hotels", "Official links", "Tours and tickets", "Food stops"],
    updated: "2026-10-20",
  },
  {
    slug: "budapest",
    city: "Budapest",
    sub: "Hungary",
    path: "/budapest-travel-resources",
    he: "/he/budapest-travel-resources",
    blurb: "Three hotels in different parts of the city, a Danube cruise and the Széchenyi baths, official tickets, free sights and transport links.",
    includes: ["Hotels", "Tours and tickets", "Official links", "Food and transport"],
    updated: "2026-10-26",
  },
];

export const DESTINATIONS_PATH = "/destinations";

export const isDestinationPath = (p: string | null | undefined): boolean =>
  !!p && (p === DESTINATIONS_PATH || DESTINATIONS.some((d) => d.path === p));

// "18 October 2026", independent of the server's locale or timezone.
export const formatUpdated = (iso: string): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
