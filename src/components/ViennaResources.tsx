import { DestinationCrumb, MoreDestinations } from "@/components/DestinationLinks";
import { SeoPage, Section, P, List } from "@/components/SeoLanding";
import { RES_CSS, AFFILIATE_REL } from "@/components/resourcePageStyles";
import { buildAgodaPropertyUrl, buildGygActivityUrl } from "@/lib/affiliate";

// Body of the "Vienna & the Lakes" resources page, shared by the English page
// (/vienna-lakes-travel-resources) and the Hebrew one
// (/he/vienna-lakes-travel-resources). Links are identical in both; only the
// copy differs. Only links that were checked are used: the HOMEBOUND Agoda
// listing and several marketplace products were never confirmed, so those
// attractions link to the official operator only.

export type ViennaLang = "en" | "he";

export const VIENNA_PATHS: Record<ViennaLang, string> = {
  en: "/vienna-lakes-travel-resources",
  he: "/he/vienna-lakes-travel-resources",
};

export const VIENNA_META: Record<ViennaLang, { title: string; description: string }> = {
  en: {
    title: "Vienna and the Lakes Travel Resources | TUlon",
    description:
      "A practical companion to Vienna & the Lakes for First-Timers: where to stay in Bad Goisern and Vienna, official links for each attraction, and selected booking options.",
  },
  he: {
    title: "המלצות לטיול בווינה ובאגמים | TUlon",
    description:
      "ליווי מעשי למדריך וינה והאגמים למטיילים בפעם הראשונה: איפה לישון בבד גויזרן ובווינה, קישורים רשמיים לכל אטרקציה ואפשרויות הזמנה נבחרות.",
  },
};

type L = { en: string; he: string };
interface Link { label: L; url: string }

const HOTELS: { name: string; area: L; text: L; buttons: { label: L; url: string; agoda?: boolean }[] }[] = [
  {
    name: "HOMEBOUND APARTMENTS Bad Goisern",
    area: { en: "Bad Goisern, Days 1-2", he: "בד גויזרן, ימים 1-2" },
    text: {
      en: "Central Bad Goisern (Schmiedgasse 15) and the regional base in the guide. A kitchen, parking and two nights in the same place suit families and small groups, and it supports the Hallstatt and Obertraun cluster without daily checkout. Apartment categories differ, and the operator lists units with and without air conditioning, so read the exact category and the contactless-arrival instructions. Compare the total apartment rate with room-based alternatives.",
      he: "במרכז בד גויזרן (Schmiedgasse 15), והבסיס האזורי במדריך. מטבח, חניה ושני לילות באותו מקום מתאימים למשפחות ולקבוצות קטנות, ומאפשרים לטייל באזור הלשטאט ואוברטראון בלי צ'ק-אאוט יומי. סוגי הדירות שונים זה מזה, והמפעיל מפרט יחידות עם מיזוג ובלי, ולכן קראו את הקטגוריה המדויקת ואת הוראות ההגעה ללא מגע. השוו את המחיר הכולל של הדירה לחלופות של חדרי מלון.",
    },
    buttons: [{ label: { en: "Official property and booking", he: "האתר הרשמי וההזמנה" }, url: "https://www.homebound-apartments.com/en/location/bad-goisern/" }],
  },
  {
    name: "Hotel Beethoven Wien",
    area: { en: "Mariahilf / Naschmarkt, Vienna", he: "מריאהילף / נאשמרקט, וינה" },
    text: {
      en: "A central boutique-style base near the Naschmarkt and Theater an der Wien, with easy access to the Karlsplatz area and the U4 line to Schönbrunn, and a city evening nearby. Check cooling, breakfast, luggage storage and parking separately, and plan the rental-car return before the hotel arrival. Compare the actual nightly total and room conditions for your dates.",
      he: "בסיס מרכזי בסגנון בוטיק ליד הנאשמרקט ותיאטרון אן דר וין, עם גישה נוחה לאזור קרלספלאץ ולקו U4 לשנברון, וערב עירוני בהישג יד. בדקו בנפרד מיזוג, ארוחת בוקר, אחסון מזוודות וחניה, ותכננו את החזרת הרכב השכור לפני ההגעה למלון. השוו את המחיר הכולל ללילה ואת תנאי החדר לתאריכים שלכם.",
    },
    buttons: [
      { label: { en: "View on Agoda", he: "לצפייה ב-Agoda" }, url: "https://www.agoda.com/hotel-beethoven-wien/hotel/vienna-at.html", agoda: true },
      { label: { en: "Official property", he: "האתר הרשמי של המלון" }, url: "https://www.hotel-beethoven.at/en/" },
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
    name: { en: "Melk Abbey", he: "מנזר מלק (Melk Abbey)" },
    day: { en: "Day 1", he: "יום 1" },
    text: {
      en: "The architectural anchor of the first day. Prioritize the abbey over extra Wachau stops when continuing to Bad Goisern. Direct official planning suits this self-drive visit best.",
      he: "עוגן האדריכלות של היום הראשון. העדיפו את המנזר על פני עצירות נוספות בוואכאו כשממשיכים לבד גויזרן. תכנון ישיר מול האתר הרשמי מתאים ביותר לביקור הזה ברכב עצמאי.",
    },
    links: [
      { label: { en: "Official visitor information", he: "מידע רשמי למבקרים" }, url: "https://www.stiftmelk.at/en/" },
      { label: { en: "Visit options and schedules", he: "אפשרויות ביקור ושעות" }, url: "https://www.stiftmelk.at/en/visit-experience/opening-hours-prices-guided-tours/" },
    ],
  },
  {
    name: { en: "Ysperklamm gorge", he: "ערוץ יספר (Ysperklamm)" },
    day: { en: "Day 1", he: "יום 1" },
    text: {
      en: "A stepped woodland gorge walk. Skip it after a late arrival or in unsuitable conditions, and do not pair the longer Druidenweg with this transfer day. Admission follows the site's current on-site arrangements.",
      he: "הליכה בערוץ יער עם מדרגות. דלגו עליה אם מגיעים מאוחר או אם התנאים לא מתאימים, ואל תשלבו את שביל הדרואידים הארוך יותר ביום הנסיעה הזה. הכניסה נעשית לפי ההסדרים העדכניים באתר.",
    },
    links: [
      { label: { en: "Official route descriptions", he: "תיאורי המסלולים (אתר רשמי)" }, url: "https://www.ysperklamm.info/ysperklamm/" },
      { label: { en: "Access and ticket information", he: "גישה וכרטיסים" }, url: "https://www.ysperklamm.info/oeffnungszeiten/" },
    ],
  },
  {
    name: { en: "Dachstein Krippenstein, Giant Ice Cave and 5fingers", he: "דכשטיין קריפנשטיין, מערת הקרח הענקית ו-5fingers" },
    day: { en: "Day 2", he: "יום 2" },
    text: {
      en: "This is the Obertraun and Krippenstein system, not another attraction elsewhere in the Dachstein massif. Select the cable-car sections and cave inclusions carefully. An online purchase does not replace cave registration at Schönbergalm. Official direct booking is the useful choice here.",
      he: "זו מערכת אוברטראון וקריפנשטיין, ולא אטרקציה אחרת במסיב הדכשטיין. בחרו בקפידה את קטעי הרכבל ואת מה שכלול בכניסה למערה. רכישה מקוונת אינה מחליפה את הרישום למערה בשנברגאלם. כאן ההזמנה הישירה מול המפעיל היא הבחירה השימושית.",
    },
    links: [
      { label: { en: "Operating information", he: "שעות פעילות (אתר רשמי)" }, url: "https://www.dachstein-salzkammergut.com/en/news/operation-times" },
      { label: { en: "Giant Ice Cave details", he: "פרטי מערת הקרח" }, url: "https://www.dachstein-salzkammergut.com/en/summer/below-ground/dachstein-giant-ice-cave" },
      { label: { en: "5fingers path", he: "שביל 5fingers" }, url: "https://www.dachstein-salzkammergut.com/en/summer/above-ground/5fingers" },
      { label: { en: "Operator ticket shop", he: "חנות הכרטיסים של המפעיל" }, url: "https://shop.dachstein-salzkammergut.com/" },
    ],
  },
  {
    name: { en: "Hallstatt village", he: "הכפר הלשטאט (Hallstatt)" },
    day: { en: "Day 3", he: "יום 3" },
    text: {
      en: "The village walk is the core experience and needs no marketplace ticket. A boat ride or the salt attraction must replace another commitment or use an additional day, so treat the Salzwelten visit as an extension, not an added stop in the standard transfer morning.",
      he: "הטיול בכפר הוא עיקר החוויה ואינו דורש כרטיס. שייט או אטרקציית המלח חייבים להחליף מחויבות אחרת או לקחת יום נוסף, ולכן התייחסו לביקור ב-Salzwelten כהרחבה ולא כעצירה נוספת בבוקר הנסיעה הרגיל.",
    },
    links: [
      { label: { en: "Visitor parking and arrival", he: "חניה והגעה" }, url: "https://www.hallstatt.net/parking-in-hallstatt/cars/" },
      { label: { en: "Regional arrival, stations and local transport", he: "הגעה אזורית, תחנות ותחבורה מקומית" }, url: "https://dachstein.salzkammergut.at/en/visitor-information/arrival.html" },
      { label: { en: "Salzwelten Hallstatt admissions (optional)", he: "כניסה ל-Salzwelten הלשטאט (אופציונלי)" }, url: "https://salzwelten.at/en/hallstatt/prices-opening-hours" },
    ],
  },
  {
    name: { en: "Giant Ferris Wheel at the Prater", he: "הגלגל הענק בפראטר (Prater)" },
    day: { en: "Day 3", he: "יום 3" },
    text: {
      en: "A flexible evening after hotel check-in and the regional transfer. Check the operator's hours before buying an evening ticket. The linked activity includes a wheel ride and cashier-desk queue bypass; it does not promise zero boarding wait. Keep the booking flexible after the transfer.",
      he: "ערב גמיש אחרי הצ'ק-אין במלון והנסיעה מהאזור. בדקו את שעות הפעילות של המפעיל לפני שרוכשים כרטיס ערב. הפעילות המקושרת כוללת נסיעה בגלגל ודילוג על תור הקופה, ואינה מבטיחה אפס המתנה בעלייה. השאירו את ההזמנה גמישה אחרי הנסיעה.",
    },
    gyg: {
      label: { en: "View on GetYourGuide", he: "לצפייה ב-GetYourGuide" },
      url: "https://www.getyourguide.com/vienna-l7/vienna-skip-the-cashier-desk-line-giant-ferris-wheel-ride-t41837/",
    },
    links: [
      { label: { en: "Wheel visit and ticket guidance", he: "ביקור וכרטיסים (אתר רשמי)" }, url: "https://wienerriesenrad.com/en/faqs/" },
      { label: { en: "Prater visitor information", he: "מידע למבקרים בפראטר" }, url: "https://www.praterwien.com/en/visit/" },
    ],
  },
  {
    name: { en: "Schönbrunn Palace", he: "ארמון שנברון (Schönbrunn)" },
    day: { en: "Day 4", he: "יום 4" },
    text: {
      en: "Choose a timed interior visit with enough room for lunch and the gardens. Direct official admission is usually the simplest independent option; a guided visit helps readers who want an organized explanation. Compare interior coverage, guide language, meeting point, date and cancellation conditions before booking. The general park is not a paid attraction, and a tour does not necessarily include every garden attraction.",
      he: "בחרו כניסה לפנים הארמון בשעה קבועה, עם מספיק זמן לארוחת צהריים ולגנים. כניסה ישירה דרך האתר הרשמי היא בדרך כלל האפשרות העצמאית הפשוטה ביותר; סיור מודרך מתאים למי שרוצה הסבר מסודר. השוו מה מכוסה בפנים הארמון, שפת המדריך, נקודת המפגש, התאריך ותנאי הביטול לפני ההזמנה. הפארק הכללי אינו אטרקציה בתשלום, וסיור אינו כולל בהכרח כל אטרקציה בגנים.",
    },
    gyg: {
      label: { en: "View guided tour on GetYourGuide", he: "לסיור מודרך ב-GetYourGuide" },
      url: "https://www.getyourguide.com/vienna-l7/vienna-schonbrunn-palace-gardens-skip-the-line-tour-t397843/",
    },
    links: [
      { label: { en: "Palace visitor information and tickets", he: "מידע וכרטיסים (אתר רשמי)" }, url: "https://www.schoenbrunn.at/en/" },
      { label: { en: "Directions, including U4 Schönbrunn", he: "הוראות הגעה, כולל תחנת U4 Schönbrunn" }, url: "https://www.schoenbrunn.at/en/visitor-information/how-to-get-here" },
    ],
  },
];

const FOOD: { label: string; url: string; note: L }[] = [
  { label: "Forellenhof, Ysperklamm", url: "https://www.forellenhof-ysperklamm.at/", note: { en: "confirm kitchen timing before relying on a gorge-arrival lunch.", he: "אשרו את שעות המטבח לפני שמסתמכים על ארוחת צהריים בהגעה לערוץ." } },
  { label: "Lodge am Krippenstein", url: "https://www.lodge.at/en/restaurant/", note: { en: "a mountain meal candidate; carry a snack as backup.", he: "אפשרות לארוחה על ההר; קחו חטיף כגיבוי." } },
  { label: "Bräugasthof Hallstatt", url: "https://www.brauhaus-lobisser.com/en/restaurant-en/", note: { en: "a village lunch candidate; keep the Vienna transfer departure time.", he: "אפשרות לארוחת צהריים בכפר; שמרו על שעת היציאה לוינה." } },
  { label: "Schweizerhaus", url: "https://www.schweizerhaus.at/", note: { en: "traditional Prater food when it is open and suits your party.", he: "אוכל מסורתי בפראטר, כשהמקום פתוח ומתאים לקבוצה שלכם." } },
  { label: "Gerstner at Schönbrunn", url: "https://www.gerstner.at/en/schloss-schoenbrunn/cafe-restaurant-shop/", note: { en: "an on-site seated meal or café break.", he: "ארוחה בישיבה או הפסקת קפה במקום." } },
];

const T = {
  crumbCity: { en: "Vienna & the Lakes", he: "וינה והאגמים" },
  h1: { en: "Vienna & the Lakes Travel Resources", he: "המלצות לטיול בווינה ובאגמים" },
  altLangLabel: { en: "עברית", he: "English" },
  lead: {
    en: "Plan four days of imperial architecture, woodland water, mountain scenery and lakeside villages. This page brings together places to stay, official links for each attraction and selected booking options for the route in the guide: two nights around Bad Goisern, a return to Vienna after Hallstatt, and a flexible evening at the Prater. Prices, schedules and availability change, so always confirm details for your dates.",
    he: "תכננו ארבעה ימים של אדריכלות קיסרית, מים בין עצים, נופי הרים וכפרים לחוף האגמים. בעמוד הזה מרוכזים מקומות לינה, קישורים רשמיים לכל אטרקציה ואפשרויות הזמנה נבחרות למסלול שבמדריך: שני לילות באזור בד גויזרן, חזרה לוינה אחרי הלשטאט וערב גמיש בפראטר. מחירים, שעות פעילות וזמינות משתנים, ולכן כדאי תמיד לוודא את הפרטים לתאריכים שלכם.",
  },
  stay: { en: "Where to stay", he: "איפה לישון" },
  stayLabel: { en: "Two bases:", he: "שני בסיסים:" },
  stayNote: {
    en: "stay two nights around Bad Goisern for Days 1-2, then return to Vienna after Hallstatt.",
    he: "שני לילות באזור בד גויזרן בימים 1-2, ואז חזרה לוינה אחרי הלשטאט.",
  },
  stops: { en: "Attractions and booking choices", he: "אטרקציות ואפשרויות הזמנה" },
  stopsLead: {
    en: "In itinerary order. Where direct admission is preferable, the official link comes first and no marketplace product is offered.",
    he: "לפי סדר המסלול. במקום שבו עדיף להזמין ישירות, הקישור הרשמי מופיע ראשון ואין מוצר ממקום שיווק חיצוני.",
  },
  updateTitle: { en: "Before you travel", he: "לפני הנסיעה" },
  update: {
    en: "Cable cars, cave tours and mountain trails depend on weather and season, so check the operator's current times on the day. Also check your flight and airport-transfer details for recent changes.",
    he: "רכבלים, סיורי מערות ושבילי הר תלויים במזג האוויר ובעונה, ולכן בדקו את שעות הפעילות העדכניות של המפעיל ביום עצמו. בדקו גם את פרטי הטיסה וההעברה משדה התעופה לשינויים אחרונים.",
  },
  food: { en: "Food along the route", he: "אוכל לאורך המסלול" },
  organize: { en: "Organize your trip with TUlon", he: "ארגנו את הטיול עם טיולון" },
  disclosureTitle: { en: "Disclosure", he: "גילוי נאות" },
};

export default function ViennaResources({ lang }: { lang: ViennaLang }) {
  const meta = VIENNA_META[lang];
  const other: ViennaLang = lang === "en" ? "he" : "en";
  const he = lang === "he";
  return (
    <SeoPage path={VIENNA_PATHS[lang]} name={meta.title} description={meta.description} lang={lang}>
      <style>{RES_CSS}</style>

      <header className="seo-hero">
        <div className="seo-hero-inner">
          <DestinationCrumb city={T.crumbCity[lang]} lang={lang} />
          <h1 className="seo-h1">{T.h1[lang]}</h1>
          <p className="res-lead-strong">
            {he ? (
              <>ליווי מעשי למדריך וינה והאגמים למטיילים בפעם הראשונה</>
            ) : (
              <>
                A practical companion to <em>Vienna &amp; the Lakes for First-Timers</em> by Shay Eisenberg
              </>
            )}
          </p>
          <p className="seo-lead">{T.lead[lang]}</p>
          <p className="res-altlang">
            <a href={VIENNA_PATHS[other]} hrefLang={other} lang={other}>
              {T.altLangLabel[lang]}
            </a>
          </p>
        </div>
      </header>

      <div className="res-note">
        <div className="res-note-box">
          {he ? (
            <>
              <strong>גילוי נאות.</strong> חלק מהקישורים בעמוד זה עשויים להיות קישורי שותפים. אם תזמינו דרכם,
              ייתכן שנקבל עמלה, ללא עלות נוספת עבורכם.
            </>
          ) : (
            <>
              <strong>Affiliate disclosure.</strong> Some links on this page may be affiliate links. If you book
              through them, we may earn a commission at no additional cost to you.
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
                      href={buildAgodaPropertyUrl(b.url, "vienna-resources")}
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
        <div className="res-note-box" style={{ margin: "0 0 14px" }}>
          <strong>{T.updateTitle[lang]}.</strong> {T.update[lang]}
        </div>
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
                    href={buildGygActivityUrl(s.gyg.url, "vienna-resources")}
                    target="_blank"
                    rel={AFFILIATE_REL}
                  >
                    {s.gyg.label[lang]}
                  </a>
                )}
                {s.links.map((l) => (
                  <a key={l.url} className="res-alt" href={l.url} target="_blank" rel="noopener noreferrer">
                    {l.label[lang]}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title={T.food[lang]}>
        <List
          items={FOOD.map((f) => (
            <span key={f.url}>
              <a href={f.url} target="_blank" rel="noopener noreferrer">
                {f.label}
              </a>
              {he ? " – " : ": "}
              {f.note[lang]}
            </span>
          ))}
        />
      </Section>

      <MoreDestinations current="vienna" lang={lang} />

      <Section title={T.organize[lang]}>
        <P>
          {he ? (
            <>
              שמרו את המלונות, רעיונות הביקור, ההזמנות והתוכניות המשותפות במקום אחד עם{" "}
              <a href="https://www.tulon.app/">
                <strong>טיולון</strong>
              </a>
              , אפליקציה חינמית לתכנון טיולים קבוצתיים שנוצרה על ידי מחבר המדריך.
            </>
          ) : (
            <>
              Keep your hotels, sightseeing ideas, bookings and shared plans in one place with{" "}
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
            ? "חלק מקישורי ההזמנה בעמוד זה עשויים להיות קישורי שותפים. אם תזמינו דרכם, ייתכן שנקבל עמלה, ללא עלות נוספת עבורכם. ההמלצות נבחרו לפי התועלת שלהן למסלול הזה. השוו מחירים עדכניים, מה כלול ותנאי ביטול לפני ההזמנה."
            : "Some booking links on this page may be affiliate links. If you book through them, we may earn a commission at no additional cost to you. Recommendations are selected for their usefulness to this itinerary. Please compare current prices, inclusions and cancellation terms before booking."}
        </P>
      </Section>
      <div style={{ height: 56 }} />
    </SeoPage>
  );
}
