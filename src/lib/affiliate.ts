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
//   NEXT_PUBLIC_AIRALO_PARTNER_ID  (Impact.com identifier — sets affiliate base URL)

export type AffSource =
  | "discover"       // The "Discover" / "גלה" screen — primary recommendations page
  | "trip-cta"       // CTA banner shown on the trip splash screen when a booking is missing
  | "calendar-empty" // Suggestion on an empty calendar day
  | "calendar-flight"// Transfer banner on a calendar day that has a flight
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
const AIRALO_PID   = process.env.NEXT_PUBLIC_AIRALO_PARTNER_ID|| "";

// Maps common cities and countries to Airalo country slugs.
// Add more as needed — unknown destinations fall back to the local-esims search page.
// Source destination is assumed already translated to English by translateDest().
const AIRALO_COUNTRY_SLUG: Record<string, string> = {
  // Europe
  "France":"france","Paris":"france","Lyon":"france","Nice":"france","Marseille":"france",
  "United Kingdom":"united-kingdom","UK":"united-kingdom","England":"united-kingdom","London":"united-kingdom","Manchester":"united-kingdom","Edinburgh":"united-kingdom",
  "Italy":"italy","Rome":"italy","Milan":"italy","Venice":"italy","Florence":"italy","Naples":"italy",
  "Spain":"spain","Madrid":"spain","Barcelona":"spain","Seville":"spain","Valencia":"spain",
  "Germany":"germany","Berlin":"germany","Munich":"germany","Frankfurt":"germany","Hamburg":"germany",
  "Netherlands":"netherlands","Amsterdam":"netherlands",
  "Greece":"greece","Athens":"greece","Santorini":"greece","Mykonos":"greece","Crete":"greece",
  "Portugal":"portugal","Lisbon":"portugal","Porto":"portugal",
  "Czech Republic":"czech-republic","Prague":"czech-republic",
  "Austria":"austria","Vienna":"austria","Salzburg":"austria",
  "Hungary":"hungary","Budapest":"hungary",
  "Poland":"poland","Warsaw":"poland","Krakow":"poland",
  "Belgium":"belgium","Brussels":"belgium",
  "Switzerland":"switzerland","Zurich":"switzerland","Geneva":"switzerland",
  "Denmark":"denmark","Copenhagen":"denmark",
  "Sweden":"sweden","Stockholm":"sweden",
  "Norway":"norway","Oslo":"norway",
  "Finland":"finland","Helsinki":"finland",
  "Ireland":"ireland","Dublin":"ireland",
  "Iceland":"iceland","Reykjavik":"iceland",
  "Croatia":"croatia","Zagreb":"croatia","Split":"croatia","Dubrovnik":"croatia",
  // Middle East
  "UAE":"united-arab-emirates","Dubai":"united-arab-emirates","Abu Dhabi":"united-arab-emirates","United Arab Emirates":"united-arab-emirates",
  "Israel":"israel","Tel Aviv":"israel","Jerusalem":"israel","Eilat":"israel",
  "Turkey":"turkey","Istanbul":"turkey","Antalya":"turkey",
  "Jordan":"jordan","Amman":"jordan","Petra":"jordan",
  "Saudi Arabia":"saudi-arabia","Riyadh":"saudi-arabia",
  "Qatar":"qatar","Doha":"qatar",
  "Egypt":"egypt","Cairo":"egypt","Sharm El Sheikh":"egypt",
  // Asia
  "Thailand":"thailand","Bangkok":"thailand","Phuket":"thailand","Chiang Mai":"thailand","Koh Samui":"thailand",
  "Japan":"japan","Tokyo":"japan","Kyoto":"japan","Osaka":"japan",
  "South Korea":"south-korea","Seoul":"south-korea","Korea":"south-korea",
  "China":"china","Beijing":"china","Shanghai":"china","Hong Kong":"hong-kong",
  "Taiwan":"taiwan","Taipei":"taiwan",
  "Singapore":"singapore",
  "Indonesia":"indonesia","Bali":"indonesia","Jakarta":"indonesia",
  "Vietnam":"vietnam","Hanoi":"vietnam","Ho Chi Minh":"vietnam","Da Nang":"vietnam",
  "Malaysia":"malaysia","Kuala Lumpur":"malaysia",
  "Philippines":"philippines","Manila":"philippines","Cebu":"philippines",
  "India":"india","Mumbai":"india","Delhi":"india","Goa":"india",
  "Sri Lanka":"sri-lanka","Colombo":"sri-lanka",
  "Nepal":"nepal","Kathmandu":"nepal",
  // Americas
  "United States":"united-states","USA":"united-states","US":"united-states",
  "New York":"united-states","Los Angeles":"united-states","Miami":"united-states","Las Vegas":"united-states","Chicago":"united-states","San Francisco":"united-states",
  "Canada":"canada","Toronto":"canada","Vancouver":"canada","Montreal":"canada",
  "Mexico":"mexico","Cancun":"mexico","Mexico City":"mexico","Tulum":"mexico",
  "Brazil":"brazil","Rio de Janeiro":"brazil","Sao Paulo":"brazil",
  "Argentina":"argentina","Buenos Aires":"argentina",
  "Chile":"chile","Santiago":"chile",
  "Peru":"peru","Lima":"peru","Cusco":"peru",
  "Colombia":"colombia","Bogota":"colombia","Cartagena":"colombia",
  // Oceania
  "Australia":"australia","Sydney":"australia","Melbourne":"australia",
  "New Zealand":"new-zealand","Auckland":"new-zealand",
  // Africa
  "Morocco":"morocco","Marrakech":"morocco","Casablanca":"morocco",
  "South Africa":"south-africa","Cape Town":"south-africa","Johannesburg":"south-africa",
  "Kenya":"kenya","Nairobi":"kenya",
  "Tanzania":"tanzania","Zanzibar":"tanzania",
};

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

// Airalo eSIM — TravelPayouts SmartLink (all tracking built-in).
// The SmartLink handles affiliate attribution; we add subid1 for source tracking.
const AIRALO_TP_URL = "https://airalo.tpk.ro/A5T0EOcn";

export function buildAiraloUrl({ source }: Pick<BuildParams, "source">): string {
  return `${AIRALO_TP_URL}?subid1=tulon&subid2=${source}`;
}

// GetTransfer airport transfers — TravelPayouts SmartLink (all tracking built-in).
const GETTRANSFER_TP_URL = "https://gettransfer.tpk.ro/Ge13JWCO";

export function buildGetTransferUrl({ source }: Pick<BuildParams, "source">): string {
  return `${GETTRANSFER_TP_URL}?subid1=tulon&subid2=${source}`;
}

// One-stop helper if you want all five URLs at once for a given trip context.
export function buildAllAffiliateUrls(params: BuildParams) {
  return {
    agoda:   buildAgodaUrl(params),
    booking: buildBookingUrl(params),
    viator:  buildViatorUrl(params),
    gyg:     buildGygUrl(params),
    airalo:  buildAiraloUrl(params),
  };
}
