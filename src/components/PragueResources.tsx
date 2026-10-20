import { DestinationCrumb, MoreDestinations } from "@/components/DestinationLinks";
import { SeoPage, Section, P, List } from "@/components/SeoLanding";
import { RES_CSS, AFFILIATE_REL } from "@/components/resourcePageStyles";
import {
  buildAgodaPropertyUrl,
  buildGygActivityUrl,
  buildAiraloUrl,
  buildKiwiUrl,
} from "@/lib/affiliate";

// Body of the Prague resources page, shared by the English page
// (/prague-travel-resources) and the Hebrew one (/he/prague-travel-resources).
// Links, affiliate builders and tracking sources are the same in both; only the
// copy differs. Hotel and tour names stay as they appear on the booking sites.

export type PragueLang = "en" | "he";

export const PRAGUE_PATHS: Record<PragueLang, string> = {
  en: "/prague-travel-resources",
  he: "/he/prague-travel-resources",
};

export const PRAGUE_META: Record<PragueLang, { title: string; description: string }> = {
  en: {
    title: "Prague Travel Resources | TUlon",
    description:
      "A practical companion to Prague for First-Timers: four well-placed hotels, selected tours and experiences, and official resources for tickets and transport.",
  },
  he: {
    title: "המלצות לטיול בפראג | TUlon",
    description:
      "ליווי מעשי למדריך פראג למטיילים בפעם הראשונה: ארבעה מלונות במיקומים נוחים, סיורים וחוויות נבחרים וקישורים רשמיים לכרטיסים ולתחבורה.",
  },
};

const HOTELS = [
  {
    name: "Hotel Josef",
    area: { en: "Old Town / Josefov", he: "העיר העתיקה / יוזפוב" },
    text: {
      en: "A contemporary base near the Old Town and Jewish Quarter, especially convenient for exploring on foot.",
      he: "בסיס מודרני ליד העיר העתיקה והרובע היהודי, נוח במיוחד להכרת העיר ברגל.",
    },
    url: "https://www.agoda.com/hotel-josef/hotel/prague-cz.html",
  },
  {
    name: "Hotel Pod Věží",
    area: { en: "Malá Strana / Charles Bridge", he: "מאלה סטראנה / גשר קרל" },
    text: {
      en: "A small hotel in the Lesser Town, close to the western end of Charles Bridge. Useful for early walks and quieter evenings.",
      he: "מלון קטן ברובע הקטן (מאלה סטראנה), קרוב לקצה המערבי של גשר קרל. מתאים לטיולי בוקר מוקדמים ולערבים שקטים יותר.",
    },
    url: "https://www.agoda.com/hotel-pod-vezi/hotel/prague-cz.html",
  },
  {
    name: "MOSAIC HOUSE Design Hotel",
    area: { en: "New Town", he: "העיר החדשה" },
    text: {
      en: "A design-led option near Karlovo náměstí, with good access to the riverside and public transport.",
      he: "אפשרות בעיצוב מיוחד ליד כיכר קרלובו נמסטי, עם גישה טובה לגדת הנהר ולתחבורה ציבורית.",
    },
    url: "https://www.agoda.com/mosaic-house_2/hotel/prague-cz.html",
  },
  {
    name: "NYX Hotel Prague by Leonardo Hotels",
    area: { en: "Central New Town", he: "מרכז העיר החדשה" },
    text: {
      en: "A lively central base near Wenceslas Square, shopping and transport connections.",
      he: "בסיס תוסס במרכז, ליד כיכר ואצלב, אזורי הקניות וצמתי התחבורה.",
    },
    url: "https://www.agoda.com/nyx-hotel-prague-by-leonardo-hotels/hotel/prague-cz.html",
  },
];

const TOURS = [
  {
    name: "Prague Jewish Town Walking Tour",
    text: {
      en: "A guided introduction to Josefov and its history, with a route that includes important Jewish heritage sites. Confirm exactly which synagogue and museum admissions are included, and note that Jewish Museum sites close on Saturdays and Jewish holidays.",
      he: "היכרות מודרכת עם יוזפוב ועם ההיסטוריה שלה, במסלול שכולל אתרי מורשת יהודית חשובים. בררו בדיוק אילו כניסות לבתי כנסת ולמוזיאון כלולות, וזכרו שאתרי המוזיאון היהודי סגורים בשבתות ובחגים יהודיים.",
    },
    gygLabel: { en: "View on GetYourGuide", he: "לצפייה ב-GetYourGuide" },
    gyg: "https://www.getyourguide.com/prague-l10/jewish-town-walking-tour-in-prague-t8815/",
    altLabel: { en: "Official Jewish Museum", he: "המוזיאון היהודי (אתר רשמי)" },
    alt: "https://www.jewishmuseum.cz/en/",
  },
  {
    name: "Prague Castle and St. Vitus Cathedral",
    text: {
      en: "Explore the castle complex and its historic buildings. Check language and admission conditions carefully before booking a tour: the linked guided tour is conducted in German, and the listing describes entrance tickets separately.",
      he: "סיור במתחם טירת פראג ובמבנים ההיסטוריים שלו. בדקו היטב שפה ותנאי כניסה לפני ההזמנה: הסיור המודרך המקושר מתקיים בגרמנית, ובמודעה כרטיסי הכניסה מתוארים בנפרד.",
    },
    gygLabel: {
      en: "View on GetYourGuide (German-language guided tour)",
      he: "לצפייה ב-GetYourGuide (סיור מודרך בגרמנית)",
    },
    gyg: "https://www.getyourguide.com/prague-l10/guided-tour-of-st-vitus-cathedral-royal-palace-st-george-s-basilica-t610182/",
    altLabel: {
      en: "Official castle tickets and visitor information",
      he: "כרטיסים ומידע למבקרים באתר הרשמי של הטירה",
    },
    alt: "https://www.hrad.cz/en/prague-castle-for-visitors",
  },
  {
    name: "Vltava River sightseeing cruise",
    text: {
      en: "A relaxed view of the city from the river. The linked cruise lasts about 45 minutes, departs near Charles Bridge, and lists a drink and Charles Bridge Museum entry among its inclusions; it is an optional extra rather than an essential part of the itinerary.",
      he: "מבט רגוע על העיר מהנהר. השיט המקושר נמשך כ-45 דקות, יוצא ליד גשר קרל, ובין הדברים הכלולים בו משקה וכניסה למוזיאון גשר קרל. זו תוספת אופציונלית ולא חלק הכרחי מהמסלול.",
    },
    gygLabel: { en: "View on GetYourGuide", he: "לצפייה ב-GetYourGuide" },
    gyg: "https://www.getyourguide.com/prague-l10/prague-canal-cruise-around-charles-bridge-t382608/",
    altLabel: { en: "", he: "" },
    alt: "",
  },
];

const OFFICIAL = [
  { label: { en: "Prague City Tourism", he: "תיירות פראג (אתר העיר)" }, url: "https://prague.eu/en/" },
  { label: { en: "Public transport, routes and fares", he: "תחבורה ציבורית, קווים ותעריפים" }, url: "https://pid.cz/en/" },
  { label: { en: "Prague Castle visitor information", he: "מידע למבקרים בטירת פראג" }, url: "https://www.hrad.cz/en/prague-castle-for-visitors" },
  { label: { en: "Jewish Museum in Prague", he: "המוזיאון היהודי בפראג" }, url: "https://www.jewishmuseum.cz/en/" },
  { label: { en: "National Museum", he: "המוזיאון הלאומי" }, url: "https://www.nm.cz/en" },
  { label: { en: "Petřín funicular updates", he: "עדכונים על רכבל פטרשין" }, url: "https://pid.cz/en/funicular/" },
];

const T = {
  crumbCity: { en: "Prague", he: "פראג" },
  h1: { en: "Prague Travel Resources", he: "המלצות לטיול בפראג" },
  altLangLabel: { en: "עברית", he: "English" },
  lead: {
    en: "Plan your Prague stay without turning every day into a race. Below are four well-placed hotel options, selected experiences that fit a relaxed four-day itinerary, and official resources for tickets and transport. Prices, schedules and availability change, so always confirm details for your dates.",
    he: "תכננו את השהות בפראג בלי להפוך כל יום למרוץ. להלן ארבע אפשרויות לינה במיקומים נוחים, חוויות נבחרות שמתאימות למסלול רגוע של ארבעה ימים, וקישורים רשמיים לכרטיסים ולתחבורה. מחירים, שעות פעילות וזמינות משתנים, ולכן כדאי תמיד לוודא את הפרטים לתאריכים שלכם.",
  },
  stay: { en: "Where to stay", he: "איפה לישון" },
  viewAgoda: { en: "View on Agoda", he: "לצפייה ב-Agoda" },
  tours: { en: "Tours and experiences", he: "סיורים וחוויות" },
  official: { en: "Official planning links", he: "קישורים רשמיים לתכנון" },
  officialNote: {
    en: "",
    he: "האתרים הרשמיים כתובים באנגלית.",
  },
  flights: { en: "Flights and mobile data", he: "טיסות וגלישה" },
  flightsTitle: { en: "Flights to Prague", he: "טיסות לפראג" },
  flightsText: {
    en: "Compare fares on Kiwi.com. When the search opens, enter your departure city and Prague as the destination.",
    he: "השוו מחירים ב-Kiwi.com. כשהחיפוש ייפתח, הזינו את עיר היציאה שלכם ואת פראג כיעד.",
  },
  flightsBtn: { en: "Compare flights on Kiwi.com", he: "השוואת טיסות ב-Kiwi.com" },
  esimTitle: { en: "eSIM for the Czech Republic", he: "eSIM לצ'כיה" },
  esimText: {
    en: "Land with mobile data already working: install an eSIM before you fly and skip roaming charges and airport SIM queues.",
    he: "נחתו עם גלישה שכבר עובדת: התקינו eSIM לפני הטיסה וחסכו דמי נדידה ותורים לכרטיסי SIM בשדה התעופה.",
  },
  esimBtn: { en: "Get a Czech Republic eSIM on Airalo", he: "eSIM לצ'כיה ב-Airalo" },
  organize: { en: "Organize your trip with TUlon", he: "ארגנו את הטיול עם טיולון" },
  disclosureTitle: { en: "Disclosure", he: "גילוי נאות" },
};

export default function PragueResources({ lang }: { lang: PragueLang }) {
  const meta = PRAGUE_META[lang];
  const other: PragueLang = lang === "en" ? "he" : "en";
  const he = lang === "he";
  return (
    <SeoPage path={PRAGUE_PATHS[lang]} name={meta.title} description={meta.description} lang={lang}>
      <style>{RES_CSS}</style>

      <header className="seo-hero">
        <div className="seo-hero-inner">
          <DestinationCrumb city={T.crumbCity[lang]} lang={lang} />
          <h1 className="seo-h1">{T.h1[lang]}</h1>
          <p className="res-lead-strong">
            {he ? (
              <>
                ליווי מעשי למדריך פראג למטיילים בפעם הראשונה
              </>
            ) : (
              <>
                A practical companion to <em>Prague for First-Timers</em> by Shay Eisenberg
              </>
            )}
          </p>
          <p className="seo-lead">{T.lead[lang]}</p>
          <p className="res-altlang">
            <a href={PRAGUE_PATHS[other]} hrefLang={other} lang={other}>
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
        <div className="res-grid">
          {HOTELS.map((h) => (
            <article className="res-card" key={h.name}>
              <h3>{h.name}</h3>
              <div className="res-meta">
                <span className="res-pill">{h.area[lang]}</span>
              </div>
              <p>{h.text[lang]}</p>
              <a
                className="res-btn"
                href={buildAgodaPropertyUrl(h.url, "prague-resources")}
                target="_blank"
                rel={AFFILIATE_REL}
              >
                {T.viewAgoda[lang]}
              </a>
            </article>
          ))}
        </div>
        <P>
          {he ? (
            <>
              <strong>איך בוחרים אזור:</strong> העיר העתיקה אידיאלית לביקור ראשון; מאלה סטראנה מציעה אווירה
              וגישה לגשר; העיר החדשה יכולה להציע יותר אפשרויות ועדיין נוחה להליכה. השוו מדיניות ביטול, נגישות,
              מיזוג אוויר ופרטי החדר לתאריכים שלכם.
            </>
          ) : (
            <>
              <strong>Choosing a location:</strong> Old Town is ideal for a first visit; Malá Strana has atmosphere
              and bridge access; New Town can offer more options while remaining walkable. Compare cancellation
              policies, accessibility, air conditioning and room details for your dates.
            </>
          )}
        </P>
      </Section>

      <Section title={T.tours[lang]}>
        <div className="res-grid">
          {TOURS.map((t) => (
            <article className="res-card" key={t.name}>
              <h3>{t.name}</h3>
              <p>{t.text[lang]}</p>
              <div className="res-links">
                <a
                  className="res-btn"
                  href={buildGygActivityUrl(t.gyg, "prague-resources")}
                  target="_blank"
                  rel={AFFILIATE_REL}
                >
                  {t.gygLabel[lang]}
                </a>
                {t.alt && (
                  <a className="res-alt" href={t.alt} target="_blank" rel="noopener noreferrer">
                    {t.altLabel[lang]}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
        <P>
          {he ? (
            <>
              <strong>מעדיפים לטייל בעצמכם?</strong> את גשר קרל, כיכר העיר העתיקה, קמפה והליכות רבות לאורך
              הנהר אפשר ליהנות גם בלי סיור בתשלום.
            </>
          ) : (
            <>
              <strong>Prefer independent sightseeing?</strong> Charles Bridge, Old Town Square, Kampa and many
              riverside walks can be enjoyed without a paid tour.
            </>
          )}
        </P>
      </Section>

      <Section title={T.official[lang]}>
        {T.officialNote[lang] && <P>{T.officialNote[lang]}</P>}
        <List
          items={OFFICIAL.map((o) => (
            <span key={o.url}>
              <a href={o.url} target="_blank" rel="noopener noreferrer">
                {o.label[lang]}
              </a>
            </span>
          ))}
        />
      </Section>

      <Section title={T.flights[lang]}>
        <div className="res-two">
          <article className="res-card">
            <h3>{T.flightsTitle[lang]}</h3>
            <p>{T.flightsText[lang]}</p>
            <a
              className="res-btn"
              href={buildKiwiUrl({ source: "prague-flights" })}
              target="_blank"
              rel={AFFILIATE_REL}
            >
              {T.flightsBtn[lang]}
            </a>
          </article>
          <article className="res-card">
            <h3>{T.esimTitle[lang]}</h3>
            <p>{T.esimText[lang]}</p>
            <a
              className="res-btn"
              href={buildAiraloUrl({ source: "prague-esim", landing: "https://www.airalo.com/czech-republic-esim" })}
              target="_blank"
              rel={AFFILIATE_REL}
            >
              {T.esimBtn[lang]}
            </a>
          </article>
        </div>
      </Section>

      <MoreDestinations current="prague" lang={lang} />

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
            ? "חלק מהקישורים בעמוד זה עשויים להיות קישורי שותפים. אם תזמינו דרכם, ייתכן שנקבל עמלה, ללא עלות נוספת עבורכם. ההמלצות הן בחירות עריכה, ואינן מבטיחות זמינות, התאמה או את המחיר הנמוך ביותר."
            : "Some links on this page may be affiliate links. If you book through them, we may earn a commission at no additional cost to you. Recommendations are editorial selections, not a guarantee of availability, suitability or the lowest price."}
        </P>
      </Section>
      <div style={{ height: 56 }} />
    </SeoPage>
  );
}
