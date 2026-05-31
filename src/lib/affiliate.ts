// Centralized builders for affiliate / partner deep-links.
// Every URL produced here carries UTM params so we can measure
// which surface inside the app drove the click — see Vercel / GA dashboards
// filter by utm_campaign to know where the revenue is coming from.
//
// Replace the partner IDs by setting these env vars in Vercel:
//   NEXT_PUBLIC_AGODA_CID
//   NEXT_PUBLIC_BOOKING_AID
//   NEXT_PUBLIC_VIATOR_PID
//   NEXT_PUBLIC_GYG_PARTNER_ID

export type AffSource =
  | "discover"       // The "Discover" / "גלה" screen — primary recommendations page
  | "trip-cta"       // CTA banner shown on the trip splash screen when a booking is missing
  | "calendar-empty" // Suggestion on an empty calendar day
  | "splash";        // Landing / pre-login surfaces

interface BuildParams {
  destination: string;       // raw destination name (will be URL-encoded)
  checkIn?: string;          // YYYY-MM-DD
  checkOut?: string;         // YYYY-MM-DD
  source: AffSource;
}

const AGODA_CID    = process.env.NEXT_PUBLIC_AGODA_CID        || "";
const BOOKING_AID  = process.env.NEXT_PUBLIC_BOOKING_AID      || "";
const VIATOR_PID   = process.env.NEXT_PUBLIC_VIATOR_PID       || "";
const VIATOR_MCID  = "42383"; // public Viator default — safe even without partner ID
const GYG_ID       = process.env.NEXT_PUBLIC_GYG_PARTNER_ID   || "";

const utm = (source: AffSource) =>
  `utm_source=tulon&utm_medium=app&utm_campaign=${source}`;

const dates = (checkIn?: string, checkOut?: string, agoda = false) => {
  if (!checkIn || !checkOut) return "";
  return agoda
    ? `&checkIn=${checkIn}&checkOut=${checkOut}`
    : `&checkin=${checkIn}&checkout=${checkOut}`;
};

export function buildAgodaUrl({ destination, checkIn, checkOut, source }: BuildParams): string {
  const q   = encodeURIComponent(destination);
  const cid = AGODA_CID ? `&cid=${AGODA_CID}` : "";
  return `https://www.agoda.com/search?q=${q}${dates(checkIn, checkOut, true)}&adults=2&rooms=1${cid}&${utm(source)}`;
}

export function buildBookingUrl({ destination, checkIn, checkOut, source }: BuildParams): string {
  const q   = encodeURIComponent(destination);
  const aid = BOOKING_AID ? `&aid=${BOOKING_AID}` : "";
  return `https://www.booking.com/searchresults.html?ss=${q}${dates(checkIn, checkOut)}${aid}&${utm(source)}`;
}

export function buildViatorUrl({ destination, source }: BuildParams): string {
  const q = encodeURIComponent(destination);
  // Viator uses ? as the query starter — if no partner_id, still need to attach UTM
  const partner = VIATOR_PID ? `?pid=${VIATOR_PID}&mcid=${VIATOR_MCID}&` : "?";
  return `https://www.viator.com/search/${q}${partner}${utm(source)}`;
}

export function buildGygUrl({ destination, source }: BuildParams): string {
  const q = encodeURIComponent(destination);
  const partner = GYG_ID ? `&partner_id=${GYG_ID}&cmp=share_to_earn` : "";
  return `https://www.getyourguide.com/s/?q=${q}${partner}&${utm(source)}`;
}

// One-stop helper if you want all four URLs at once for a given trip context.
export function buildAllAffiliateUrls(params: BuildParams) {
  return {
    agoda:   buildAgodaUrl(params),
    booking: buildBookingUrl(params),
    viator:  buildViatorUrl(params),
    gyg:     buildGygUrl(params),
  };
}
