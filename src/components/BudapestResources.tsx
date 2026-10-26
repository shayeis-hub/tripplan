import { DestinationCrumb, MoreDestinations } from "@/components/DestinationLinks";
import { SeoPage, Section, P, List } from "@/components/SeoLanding";
import { RES_CSS, AFFILIATE_REL } from "@/components/resourcePageStyles";
import { buildAgodaPropertyUrl, buildGygActivityUrl } from "@/lib/affiliate";

// Body of the Budapest resources page, shared by the English page
// (/budapest-travel-resources) and the Hebrew one
// (/he/budapest-travel-resources). Links are identical in both; only the copy
// differs. Only checked links are used. Official institutions that have a
// ticket office of their own are linked directly, with no reseller product.

export type BudapestLang = "en" | "he";

export const BUDAPEST_PATHS: Record<BudapestLang, string> = {
  en: "/budapest-travel-resources",
  he: "/he/budapest-travel-resources",
};

export const BUDAPEST_META: Record<BudapestLang, { title: string; description: string }> = {
  en: {
    title: "Budapest Travel Resources | TUlon",
    description:
      "A practical companion to Budapest for First-Timers: three hotels in different parts of the city, selected bookings, official tickets, free sights and transport links.",
  },
  he: {
    title: "המלצות לטיול בבודפשט | TUlon",
    description:
      "ליווי מעשי למדריך בודפשט למטיילים בפעם הראשונה: שלושה מלונות באזורים שונים, הזמנות נבחרות, כרטיסים רשמיים, אתרים בחינם וקישורי תחבורה.",
  },
};

type L = { en: string; he: string };
interface Link {
  label: L;
  url: string;
}

const HOTELS: { name: string; area: L; text: L; buttons: { label: L; url: string; agoda?: boolean }[] }[] = [
  {
    name: "Hotel Moments Budapest",
    area: { en: "Andrássy Avenue, District VI", he: "שדרות אנדראשי, מחוז 6" },
    text: {
      en: "A central Pest base (Andrássy út 8) for the Basilica, the Opera area, restaurants and the M1 line. It cuts the need to cross the river for everyday meals and suits Days 1 and 4 particularly well. Upper midrange; prices vary. Ask about room orientation and noise, and confirm accessibility and the facilities of the room you book.",
      he: "בסיס מרכזי בצד פשט (Andrássy út 8), קרוב לבזיליקה, לאזור האופרה, למסעדות ולקו M1. הוא חוסך חציית נהר לארוחות היומיום ומתאים במיוחד לימים 1 ו-4. טווח מחירים בינוני-גבוה, והמחירים משתנים. שאלו על כיוון החדר ורעש, ובדקו נגישות ומתקני החדר שהזמנתם.",
    },
    buttons: [
      { label: { en: "View on Agoda", he: "לצפייה ב-Agoda" }, url: "https://www.agoda.com/hotel-moments-budapest/hotel/budapest-hu.html", agoda: true },
      { label: { en: "Official address and contact", he: "כתובת ויצירת קשר (אתר רשמי)" }, url: "https://hotelmoments.hu/contact" },
    ],
  },
  {
    name: "Bohem Art Hotel",
    area: { en: "Southern inner Pest, District V", he: "דרום מרכז פשט, מחוז 5" },
    text: {
      en: "A practical base (Molnár utca 35) near the market, the southern promenade and the Fővám tér side of the itinerary, without choosing a hotel for its nightlife. Midrange, depending on dates and room type. Compare actual room dimensions and bed arrangements: the hotel's site shows different capacities and layouts rather than one standard size.",
      he: "בסיס מעשי (Molnár utca 35) ליד השוק, הטיילת הדרומית וצד Fővám tér במסלול, בלי לבחור מלון בגלל חיי הלילה. טווח מחירים בינוני, בהתאם לתאריכים ולסוג החדר. השוו מידות חדר ומיטות בפועל: באתר המלון מופיעים חדרים בקיבולות ובפריסות שונות ולא גודל אחד קבוע.",
    },
    buttons: [
      { label: { en: "View on Agoda", he: "לצפייה ב-Agoda" }, url: "https://www.agoda.com/bohem-art-hotel/hotel/budapest-hu.html", agoda: true },
      { label: { en: "Official information", he: "מידע באתר הרשמי" }, url: "https://bohemarthotel.hu/contact/" },
    ],
  },
  {
    name: "Park Plaza Budapest",
    area: { en: "Buda riverfront, Bem rakpart", he: "גדת בודה, Bem rakpart" },
    text: {
      en: "For travelers who prefer the Buda side and accept transport connections for evenings in Pest, with a convenient relationship to the Buda waterfront. Compare the exact room location with Batthyány tér and Castle Hill access. Upper midrange; river-view rooms may be a separate category, and a river-facing photo does not guarantee that the room you book has that view. Check the exact category and lift access.",
      he: "למי שמעדיף את צד בודה ומוכן להסתמך על תחבורה לערבים בפשט, עם קרבה נוחה לגדת בודה. השוו את מיקום החדר המדויק מול Batthyány tér והגישה לגבעת הטירה. טווח מחירים בינוני-גבוה. חדרים עם נוף לנהר עשויים להיות קטגוריה נפרדת, ותמונה הפונה לנהר אינה מבטיחה שלחדר שהזמנתם יש נוף כזה. בדקו את הקטגוריה המדויקת ואת הגישה למעלית.",
    },
    buttons: [
      { label: { en: "View on Agoda", he: "לצפייה ב-Agoda" }, url: "https://www.agoda.com/artotel-budapest/hotel/budapest-hu.html", agoda: true },
    ],
  },
];

interface Stop {
  name: L;
  day: L;
  text: L;
  gyg?: { label: L; url: string };
  links: Link[];
}

const STOPS: Stop[] = [
  {
    name: { en: "Evening Danube cruise", he: "שייט ערב בדנובה" },
    day: { en: "Day 3", he: "יום 3" },
    text: {
      en: "The single evening anchor of Day 3: ordinary sightseeing, not a party or a multi-course dinner. The operator is Legenda City Cruises, and the listing and the operator's directions identify Dock 7, Jane Haining rakpart; follow your booking confirmation for the actual departure. Choose a departure that matches sunset on your date, since \"evening\" does not guarantee darkness in summer, and compare covered seating and cancellation conditions.",
      he: "עוגן הערב היחיד של יום 3: שייט תיירותי רגיל, לא מסיבה ולא ארוחה מרובת מנות. המפעיל הוא Legenda City Cruises, ובמודעה ובהוראות ההגעה של המפעיל מצוין רציף 7, Jane Haining rakpart. פעלו לפי אישור ההזמנה לגבי היציאה בפועל. בחרו יציאה שמתאימה לשקיעה בתאריך שלכם, כי \"ערב\" אינו מבטיח חושך בקיץ, והשוו ישיבה מקורה ותנאי ביטול.",
    },
    gyg: {
      label: { en: "View on GetYourGuide", he: "לצפייה ב-GetYourGuide" },
      url: "https://www.getyourguide.com/budapest-l29/budapest-1-hour-evening-sightseeing-cruise-with-drink-t105820/",
    },
    links: [{ label: { en: "Operator directions", he: "הוראות הגעה של המפעיל" }, url: "https://legenda.hu/en/directions" }],
  },
  {
    name: { en: "Széchenyi Thermal Bath", he: "מרחצאות סצ'ני (Széchenyi)" },
    day: { en: "Day 4", he: "יום 4" },
    text: {
      en: "Day 4's long afternoon block, in place of an exhibition rather than alongside several interiors. Compare the date, entrance, locker or cabin provision and cancellation conditions with booking directly; direct booking is a good choice when its terms and ticket fit you better. Check the current admission rules: at the time of writing, children under 14 are not admitted. Bring a towel and slippers, and check any pool-specific cap requirements.",
      he: "בלוק אחר הצהריים הארוך של יום 4, במקום תערוכה ולא בנוסף למספר אתרים סגורים. השוו תאריך, כניסה, מה כלול בארונית או בקבינה ותנאי ביטול מול הזמנה ישירה. הזמנה ישירה היא בחירה טובה כשהתנאים והכרטיס שלה מתאימים לכם יותר. בדקו את כללי הכניסה העדכניים: נכון לזמן הכתיבה לא מתקבלים ילדים מתחת לגיל 14. הביאו מגבת וכפכפים, ובדקו אם יש דרישת כובע שחייה בבריכות מסוימות.",
    },
    gyg: {
      label: { en: "View on GetYourGuide", he: "לצפייה ב-GetYourGuide" },
      url: "https://www.getyourguide.com/budapest-l29/szechenyi-spa-full-day-entrance-pass-t4139/",
    },
    links: [
      { label: { en: "Official site", he: "האתר הרשמי" }, url: "https://www.szechenyibath.hu/" },
      { label: { en: "Direct tickets", he: "כרטיסים ישירות" }, url: "https://tickets.szechenyibath.hu/" },
    ],
  },
  {
    name: { en: "Parliament", he: "בניין הפרלמנט" },
    day: { en: "Day 3", he: "יום 3" },
    text: {
      en: "Day 3's morning interior, if you want it; the exterior is a free alternative. Official booking is the primary route, so check tickets, prices and release dates on the official page. Avoid \"Parliament tour\" resellers whose inclusions, entry status and language are unclear.",
      he: "פנים הבניין בבוקר של יום 3, אם תרצו; החזית החיצונית היא חלופה חינמית. ההזמנה הרשמית היא הדרך המומלצת, ולכן בדקו כרטיסים, מחירים ומועדי פתיחת מכירה בעמוד הרשמי. הימנעו ממשווקים של \"סיור בפרלמנט\" שלא ברור בהם מה כלול, האם יש כניסה ובאיזו שפה.",
    },
    links: [{ label: { en: "Official tickets", he: "כרטיסים באתר הרשמי" }, url: "https://www.parlament.hu/web/visitors/purchasing-tickets" }],
  },
  {
    name: { en: "Basilica and Matthias Church", he: "הבזיליקה וכנסיית מתיאס" },
    day: { en: "Days 1 and 2", he: "ימים 1 ו-2" },
    text: {
      en: "Prefer official tickets. The Basilica's optional panorama fits Day 1, and its interior's Sunday sightseeing window starts later. The Matthias Church interior fits Day 2, and the church and the tower are separate choices. A tower or terrace is optional, not another mandatory admission.",
      he: "עדיפים כרטיסים רשמיים. תצפית הפנורמה של הבזיליקה מתאימה ליום 1, וחלון הביקור של יום ראשון בפנים הבניין מתחיל מאוחר יותר. הפנים של כנסיית מתיאס מתאים ליום 2, והכנסייה והמגדל הם שתי בחירות נפרדות. מגדל או מרפסת הם רשות ולא עוד כניסה חובה.",
    },
    links: [
      { label: { en: "Basilica: official visitor page", he: "הבזיליקה: עמוד מבקרים רשמי" }, url: "https://bazilikabudapest.hu/en/" },
      { label: { en: "Matthias Church: official tickets", he: "כנסיית מתיאס: כרטיסים רשמיים" }, url: "https://matyas-templom.hu/en/buy-tickets/" },
    ],
  },
  {
    name: { en: "Opera and park museums (optional)", he: "האופרה ומוזיאוני הפארק (אופציונלי)" },
    day: { en: "Optional", he: "אופציונלי" },
    text: {
      en: "These replace another substantial activity and are not additional essential paid attractions. The Opera auditorium may be inaccessible during rehearsals, so do not count on it on every tour. Book directly with the institution.",
      he: "אלה מחליפים פעילות משמעותית אחרת, ואינם אטרקציות בתשלום נוספות שחובה לבקר בהן. אולם האופרה עשוי להיות סגור בזמן חזרות, ולכן אל תסתמכו על כך בכל סיור. הזמינו ישירות מול המוסד.",
    },
    links: [
      { label: { en: "Hungarian State Opera tours", he: "סיורים באופרה הממלכתית ההונגרית" }, url: "https://www.opera.hu/en/about-us/guided-tours/" },
      { label: { en: "City Park cultural directory", he: "מדריך התרבות של הפארק העירוני" }, url: "https://ligetbudapest.hu/en" },
    ],
  },
];

const FREE: Link[] = [
  { label: { en: "Central Market Hall (operator)", he: "השוק המרכזי (המפעיל)" }, url: "https://piaconline.hu/nagycsarnok/" },
  { label: { en: "Margaret Island (official tourism information)", he: "אי מרגרט (מידע תיירות רשמי)" }, url: "https://www.budapestinfo.hu/en/margaret-island" },
  { label: { en: "Castle District (district tourism)", he: "רובע הטירה (תיירות המחוז)" }, url: "https://visitbudavar.com/en/attractions" },
  { label: { en: "Shoes on the Danube Promenade (historical context)", he: "הנעליים על טיילת הדנובה (הקשר היסטורי)" }, url: "https://www.memorialmuseums.org/memorialmuseum/shoes-on-the-danube-promenade?locale=en" },
  { label: { en: "Central riverfront and squares", he: "גדת הנהר המרכזית והכיכרות" }, url: "https://www.budapestinfo.hu/en/top-sights" },
];

const FOOD: { day: L; label: string; url: string }[] = [
  { day: { en: "Day 1", he: "יום 1" }, label: "Gerbeaud, Vörösmarty tér", url: "https://gerbeaud.hu/" },
  { day: { en: "Day 2", he: "יום 2" }, label: "Pest-Buda Bistro, Fortuna utca 3", url: "https://pestbudahotel.com/dining/" },
  { day: { en: "Day 3", he: "יום 3" }, label: "Retro Lángos, Vécsey utca 3", url: "https://retrolangos.hu/en/table-reservation/" },
  { day: { en: "Day 4", he: "יום 4" }, label: "Menza, Liszt Ferenc tér", url: "https://menzaetterem.hu/en/" },
  { day: { en: "Day 5", he: "יום 5" }, label: "Fakanál (Central Market Hall restaurant directory)", url: "https://piaconline.hu/nagycsarnok/" },
];

const TRANSPORT: Link[] = [
  { label: { en: "Airport Express", he: "Airport Express (אקספרס לשדה התעופה)" }, url: "https://bkk.hu/en/travel-information/airport-express/" },
  { label: { en: "Fares", he: "תעריפים" }, url: "https://bkk.hu/en/tickets-and-passes/prices/" },
  { label: { en: "72-hour Budapest Travelcard rules", he: "כללי כרטיס 72 השעות (Travelcard)" }, url: "https://bkk.hu/en/tickets-and-passes/prices/72-hour-budapest-travelcard" },
  { label: { en: "Live route directory and timetables", he: "מדריך קווים ולוחות זמנים" }, url: "https://bkk.hu/en/timetables" },
  { label: { en: "Accessibility", he: "נגישות" }, url: "https://bkk.hu/en/travel-information/accessibility/" },
  { label: { en: "Szentendre by the H5 suburban railway", he: "סנטנדרה ברכבת הפרברים H5" }, url: "https://www.mavcsoport.hu/mav-szemelyszallitas/belfoldi-utazas/hev-menetrendek" },
];

const T = {
  crumbCity: { en: "Budapest", he: "בודפשט" },
  h1: { en: "Budapest Travel Resources", he: "המלצות לטיול בבודפשט" },
  altLangLabel: { en: "עברית", he: "English" },
  lead: {
    en: "Plan four or five relaxed days in Budapest, with a convenient base, a few well-chosen reservations and time beside the Danube. These resources match the neighborhoods and activities in the guide. Choose the experiences that suit your trip: you do not need to book everything. Prices, schedules and availability change, so always confirm details for your dates.",
    he: "תכננו ארבעה או חמישה ימים רגועים בבודפשט, עם בסיס נוח, כמה הזמנות שנבחרו היטב וזמן על גדות הדנובה. המשאבים כאן מתאימים לשכונות ולפעילויות שבמדריך. בחרו את החוויות שמתאימות לטיול שלכם, ואין צורך להזמין הכול. מחירים, שעות פעילות וזמינות משתנים, ולכן כדאי תמיד לוודא את הפרטים לתאריכים שלכם.",
  },
  stay: { en: "Where to stay", he: "איפה לישון" },
  stayNote: {
    en: "three different locations, so choose by the part of the city you want to wake up in. Prices are relative positioning, not quoted rates: compare the full price for your dates, occupancy, taxes, room type and cancellation terms.",
    he: "שלושה מיקומים שונים, ולכן בחרו לפי החלק בעיר שבו תרצו להתעורר. המחירים הם מיצוב יחסי ולא תעריף שצוטט: השוו את המחיר המלא לתאריכים, למספר האורחים, למיסים, לסוג החדר ולתנאי הביטול.",
  },
  stayLabel: { en: "Where to base yourself:", he: "איפה להתמקם:" },
  stops: { en: "Experiences worth planning", he: "חוויות שכדאי לתכנן" },
  stopsLead: {
    en: "In itinerary order. Where official booking is the better route, the official link comes first and no reseller product is offered.",
    he: "לפי סדר המסלול. במקום שבו ההזמנה הרשמית עדיפה, הקישור הרשמי מופיע ראשון ואין מוצר ממשווק חיצוני.",
  },
  free: { en: "Free sights and ordinary walks", he: "אתרים בחינם וטיולים רגליים" },
  freeNote: {
    en: "Public outdoor stops do not need a ticket. Some upper Bastion terraces and church or tower sections have separate charges, so tell them apart from ordinary public walking areas.",
    he: "אתרים ציבוריים פתוחים אינם דורשים כרטיס. למרפסות עליונות מסוימות בביצורים ולחלקי כנסיות או מגדלים יש תשלום נפרד, ולכן הבחינו ביניהם לבין אזורי הליכה ציבוריים רגילים.",
  },
  food: { en: "Meals that fit the route", he: "ארוחות שמתאימות למסלול" },
  foodNote: {
    en: "Route-fitting suggestions, not a claim that we have eaten there. Dietary suitability and menu prices are not guaranteed; check before you go.",
    he: "הצעות שמתאימות למסלול, ולא טענה שאכלנו שם. התאמה תזונתית ומחירי תפריט אינם מובטחים, ולכן בדקו לפני שמגיעים.",
  },
  transport: { en: "Transport and excursions", he: "תחבורה וטיולי יום" },
  transportNote: {
    en: "The Gellért Bath has a closure notice on its site: check it and do not assume it is open.",
    he: "באתר מרחצאות גלרט יש הודעת סגירה: בדקו אותה ואל תניחו שהוא פתוח.",
  },
  gellert: { en: "Gellért Bath (check the notice)", he: "מרחצאות גלרט (בדקו את ההודעה)" },
  organize: { en: "Organize your trip with TUlon", he: "ארגנו את הטיול עם טיולון" },
  disclosureTitle: { en: "Disclosure", he: "גילוי נאות" },
};

export default function BudapestResources({ lang }: { lang: BudapestLang }) {
  const meta = BUDAPEST_META[lang];
  const other: BudapestLang = lang === "en" ? "he" : "en";
  const he = lang === "he";
  return (
    <SeoPage path={BUDAPEST_PATHS[lang]} name={meta.title} description={meta.description} lang={lang}>
      <style>{RES_CSS}</style>

      <header className="seo-hero">
        <div className="seo-hero-inner">
          <DestinationCrumb city={T.crumbCity[lang]} lang={lang} />
          <h1 className="seo-h1">{T.h1[lang]}</h1>
          <p className="res-lead-strong">
            {he ? (
              <>ליווי מעשי למדריך בודפשט למטיילים בפעם הראשונה</>
            ) : (
              <>
                A practical companion to <em>Budapest for First-Timers</em> by Shay Eisenberg
              </>
            )}
          </p>
          <p className="seo-lead">{T.lead[lang]}</p>
          <p className="res-altlang">
            <a href={BUDAPEST_PATHS[other]} hrefLang={other} lang={other}>
              {T.altLangLabel[lang]}
            </a>
          </p>
        </div>
      </header>

      <div className="res-note">
        <div className="res-note-box">
          {he ? (
            <>
              <strong>גילוי נאות.</strong> קישורי ההזמנה ל-Agoda ול-GetYourGuide בעמוד זה הם קישורי שותפים. אם
              תזמינו דרכם, ייתכן שנקבל עמלה, ללא עלות נוספת עבורכם. קישורי האתרים הרשמיים הם הפניות רגילות.
            </>
          ) : (
            <>
              <strong>Affiliate disclosure.</strong> The Agoda and GetYourGuide booking links on this page are
              affiliate links. If you book through them, we may earn a commission at no additional cost to you.
              Links to official sites are ordinary references.
            </>
          )}
        </div>
      </div>

      <Section title={T.stay[lang]}>
        <P>
          <strong>{T.stayLabel[lang]}</strong> {T.stayNote[lang]}
        </P>
        <div className="res-grid">
          {HOTELS.map((h) => (
            <article className="res-card" key={h.name}>
              <h3>{h.name}</h3>
              <div className="res-meta">
                <span className="res-pill">{h.area[lang]}</span>
              </div>
              <p>{h.text[lang]}</p>
              <div className="res-links">
                {h.buttons.map((b, i) =>
                  b.agoda ? (
                    <a
                      key={b.url}
                      className="res-btn"
                      href={buildAgodaPropertyUrl(b.url, "budapest-resources")}
                      target="_blank"
                      rel={AFFILIATE_REL}
                    >
                      {b.label[lang]}
                    </a>
                  ) : (
                    <a
                      key={b.url}
                      className={i === 0 ? "res-btn" : "res-alt"}
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {b.label[lang]}
                    </a>
                  )
                )}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title={T.stops[lang]}>
        <P>{T.stopsLead[lang]}</P>
        <div className="res-grid">
          {STOPS.map((s) => (
            <article className="res-card" key={s.name.en}>
              <h3>{s.name[lang]}</h3>
              <div className="res-meta">
                <span className="res-pill">{s.day[lang]}</span>
              </div>
              <p>{s.text[lang]}</p>
              <div className="res-links">
                {s.gyg && (
                  <a
                    className="res-btn"
                    href={buildGygActivityUrl(s.gyg.url, "budapest-resources")}
                    target="_blank"
                    rel={AFFILIATE_REL}
                  >
                    {s.gyg.label[lang]}
                  </a>
                )}
                {s.links.map((l, i) => (
                  <a
                    key={l.url}
                    className={!s.gyg && i === 0 ? "res-btn" : "res-alt"}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {l.label[lang]}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title={T.free[lang]}>
        <P>{T.freeNote[lang]}</P>
        <List
          items={FREE.map((f) => (
            <span key={f.url}>
              <a href={f.url} target="_blank" rel="noopener noreferrer">
                {f.label[lang]}
              </a>
            </span>
          ))}
        />
      </Section>

      <Section title={T.food[lang]}>
        <P>{T.foodNote[lang]}</P>
        <List
          items={FOOD.map((f) => (
            <span key={f.day.en}>
              <strong>{f.day[lang]}:</strong>{" "}
              <a href={f.url} target="_blank" rel="noopener noreferrer">
                {f.label}
              </a>
            </span>
          ))}
        />
      </Section>

      <Section title={T.transport[lang]}>
        <P>{T.transportNote[lang]}</P>
        <List
          items={[
            ...TRANSPORT.map((x) => (
              <span key={x.url}>
                <a href={x.url} target="_blank" rel="noopener noreferrer">
                  {x.label[lang]}
                </a>
              </span>
            )),
            <span key="gellert">
              <a href="https://www.gellertbath.hu/" target="_blank" rel="noopener noreferrer">
                {T.gellert[lang]}
              </a>
            </span>,
          ]}
        />
      </Section>

      <MoreDestinations current="budapest" lang={lang} />

      <Section title={T.organize[lang]}>
        <P>
          {he ? (
            <>
              שמרו את המלון, רעיונות הביקור, ההזמנות והתוכניות המשותפות במקום אחד עם{" "}
              <a href="https://www.tulon.app/">
                <strong>טיולון</strong>
              </a>
              , אפליקציה חינמית לתכנון טיולים קבוצתיים שנוצרה על ידי מחבר המדריך.
            </>
          ) : (
            <>
              Keep your hotel, sightseeing ideas, bookings and shared plans in one place with{" "}
              <a href="https://www.tulon.app/">
                <strong>TUlon</strong>
              </a>
              , a free group travel-planning app created by the author.
            </>
          )}
        </P>
      </Section>

      <Section title={T.disclosureTitle[lang]}>
        <P>
          {he
            ? "קישורי ההזמנה ל-Agoda ול-GetYourGuide בעמוד זה הם קישורי שותפים. אם תזמינו דרכם, ייתכן שנקבל עמלה, ללא עלות נוספת עבורכם. ההמלצות נבחרו לפי התועלת שלהן למסלול. השוו מחירים עדכניים, מה כלול ותנאי ביטול לפני ההזמנה. קישורי האתרים הרשמיים הם הפניות רגילות."
            : "The Agoda and GetYourGuide booking links on this page are affiliate links. If you book through them, we may earn a commission at no additional cost to you. Recommendations are selected for their usefulness to the itinerary. Please compare current prices, inclusions and cancellation terms before booking. Links to official sites are ordinary references."}
        </P>
      </Section>
      <div style={{ height: 56 }} />
    </SeoPage>
  );
}
