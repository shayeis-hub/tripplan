"use client";
import { useLang } from "@/lib/LangContext";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { buildAgodaUrl, buildBookingUrl, buildViatorUrl, buildGygUrl, buildAiraloUrl, getPartnerRef } from "@/lib/affiliate";

const UTM = "utm_source=tulon&utm_medium=web&utm_campaign=plan-page";

// Generic plain destinations get a ref attached at click time so partner attribution
// works even from the marketing page (no need to wait for a render after RefCapture).
function withRef(base: string): string {
  const ref = getPartnerRef();
  const sep = base.includes("?") ? "&" : "?";
  return ref ? `${base}${sep}utm_content=${encodeURIComponent(ref)}&aff_sub=${encodeURIComponent(ref)}` : base;
}

const linkBuilders = {
  agoda:      () => buildAgodaUrl({source:"plan-page", destination:""}),
  booking:    () => buildBookingUrl({source:"plan-page", destination:""}),
  viator:     () => buildViatorUrl({source:"plan-page", destination:""}),
  gyg:        () => buildGygUrl({source:"plan-page", destination:""}),
  airalo:     () => buildAiraloUrl({source:"plan-page"}),
  kiwi:       () => withRef(`https://www.kiwi.com/?${UTM}`),
  skyscanner: () => withRef(`https://www.skyscanner.net/?${UTM}`),
  gflights:   () => withRef(`https://flights.google.com/?${UTM}`),
  maps:       () => withRef(`https://maps.google.com/?${UTM}`),
};

const T = {
  heroTitle: {
    he: "כל הכלים לתכנון הטיול — במקום אחד",
    en: "All the Tools to Plan Your Trip — In One Place",
    es: "Todas las Herramientas para Planificar tu Viaje — En un Solo Lugar",
  },
  heroSub: {
    he: "טיסות, מלונות, אטרקציות ועוד — מקושרים ישירות לשירותים הטובים בעולם",
    en: "Flights, hotels, activities and more — linked directly to the best services in the world",
    es: "Vuelos, hoteles, actividades y más — enlazados directamente con los mejores servicios del mundo",
  },
  flightsTitle: { he: "✈️ חיפוש טיסות", en: "✈️ Flight Search", es: "✈️ Búsqueda de Vuelos" },
  flightsSub: {
    he: "השוו מחירים ומצאו את הטיסה הטובה ביותר",
    en: "Compare prices and find the best flight",
    es: "Compara precios y encuentra el mejor vuelo",
  },
  hotelsTitle: { he: "🏨 מלונות ואירוח", en: "🏨 Hotels & Accommodation", es: "🏨 Hoteles y Alojamiento" },
  hotelsSub: {
    he: "מלונות, אפרטמנטים ווילות — במחירים הטובים ביותר",
    en: "Hotels, apartments and villas — at the best prices",
    es: "Hoteles, apartamentos y villas — a los mejores precios",
  },
  activitiesTitle: { he: "🎡 אטרקציות ופעילויות", en: "🎡 Attractions & Activities", es: "🎡 Atracciones y Actividades" },
  activitiesSub: {
    he: "סיורים מודרכים, כרטיסים לאטרקציות, חוויות מיוחדות",
    en: "Guided tours, attraction tickets, unique experiences",
    es: "Tours guiados, entradas a atracciones, experiencias únicas",
  },
  esimTitle: { he: "📶 eSIM לנסיעה", en: "📶 Travel eSIM", es: "📶 eSIM de Viaje" },
  esimSub: {
    he: "גלישה בחו\"ל בלי להחליף כרטיס — פשוט מוריד ומתחבר",
    en: "Browse abroad without swapping your SIM — just download and connect",
    es: "Navega en el extranjero sin cambiar SIM — solo descarga y conéctate",
  },
  airaloDesc: {
    he: "מגוון רחב של eSIM לכל יעד בעולם — רכישה מהירה ישירות לטלפון",
    en: "Wide range of eSIMs for every destination worldwide — quick purchase directly to your phone",
    es: "Amplia variedad de eSIMs para cada destino del mundo — compra rápida directamente a tu teléfono",
  },
  appTitle: {
    he: "📱 רוצים לתכנן הכל במקום אחד?",
    en: "📱 Want to Plan Everything in One Place?",
    es: "📱 ¿Quieres Planificar Todo en un Solo Lugar?",
  },
  appSub: {
    he: "עם טיולון, לוח השנה, ההוצאות, ורשימת האריזה — הכל מסונכרן עם כל חברי הטיול",
    en: "With Tulon, the calendar, expenses, and packing list — all synced with every trip member",
    es: "Con Tulon, el calendario, los gastos y la lista de equipaje — todo sincronizado con cada miembro del viaje",
  },
  appBtn: { he: "פתח את טיולון — בחינם", en: "Open Tulon — Free", es: "Abrir Tulon — Gratis" },
  visit: { he: "כנסו", en: "Visit", es: "Visitar" },
  agodaDesc: {
    he: "מיליוני מלונות ברחבי העולם עם תמחור תחרותי וביקורות אמיתיות",
    en: "Millions of hotels worldwide with competitive pricing and real reviews",
    es: "Millones de hoteles en todo el mundo con precios competitivos y reseñas reales",
  },
  bookingDesc: {
    he: "אחד הסייטים הגדולים בעולם לאירוח — עם אפשרות ביטול חינמי",
    en: "One of the world's largest accommodation sites — with free cancellation options",
    es: "Uno de los sitios de alojamiento más grandes del mundo — con opción de cancelación gratuita",
  },
  viatorDesc: {
    he: "אלפי טיולים, סיורים ואטרקציות מקומיות עם ביקורות אמיתיות",
    en: "Thousands of tours, excursions and local attractions with real reviews",
    es: "Miles de tours, excursiones y atracciones locales con reseñas reales",
  },
  gygDesc: {
    he: "מגוון רחב של חוויות מקומיות ייחודיות בכל יעד",
    en: "Wide variety of unique local experiences at every destination",
    es: "Amplia variedad de experiencias locales únicas en cada destino",
  },
  kiwiDesc: {
    he: "מנוע חיפוש טיסות עם אלגוריתמים חכמים למציאת המחירים הנמוכים ביותר",
    en: "Flight search engine with smart algorithms to find the lowest prices",
    es: "Motor de búsqueda de vuelos con algoritmos inteligentes para encontrar los precios más bajos",
  },
  skyscannerDesc: {
    he: "השוואת מחירי טיסות, מלונות ורכב להשכרה מכל האתרים",
    en: "Compare flight, hotel and car rental prices from all sites",
    es: "Compara precios de vuelos, hoteles y alquiler de coches de todos los sitios",
  },
  gflightsDesc: {
    he: "כלי החיפוש של גוגל עם מפת מחירים ועוקב מחירים",
    en: "Google's search tool with price map and price tracker",
    es: "La herramienta de búsqueda de Google con mapa de precios y seguimiento de precios",
  },
  sectionNote: {
    he: "* חלק מהקישורים הם קישורי שותפים — אנחנו עשויים לקבל עמלה ללא עלות נוספת לכם",
    en: "* Some links are affiliate links — we may earn a commission at no extra cost to you",
    es: "* Algunos enlaces son de afiliados — podemos ganar una comisión sin costo adicional para ti",
  },
} as const;

function LinkCard({
  logo, title, desc, builder, lang,
}: {
  logo: string; title: string; desc: string; builder: () => string; lang: "he"|"en"|"es";
}) {
  const visitText = T.visit[lang];
  // Rendered as a <button>, not an <a>: the TravelPayouts page script rewrites
  // anchor hrefs asynchronously and drops our subid3 partner ref. Buttons are
  // left alone, so window.open(builder()) always carries full attribution.
  const handleClick = () => {
    window.open(builder(), "_blank", "noopener,noreferrer");
  };
  return (
    <button onClick={handleClick} style={{
      display: "block", width: "100%", textAlign: "inherit", fontFamily: "inherit",
      background: "rgba(255,255,255,0.04)",
      border: "0.5px solid rgba(255,255,255,0.09)",
      borderRadius: 16, padding: "18px 20px",
      transition: "all 0.18s", cursor: "pointer",
    }}
      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(100,223,223,0.06)";(e.currentTarget as HTMLElement).style.borderColor="rgba(100,223,223,0.25)";}}
      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.04)";(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.09)";}}
    >
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
        <div>
          <div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:5}}>{logo} {title}</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.42)",lineHeight:1.55}}>{desc}</div>
        </div>
        <div style={{
          flexShrink:0, padding:"6px 14px",
          background:"rgba(100,223,223,0.12)",
          border:"0.5px solid rgba(100,223,223,0.3)",
          borderRadius:999, color:"#64dfdf",
          fontSize:12,fontWeight:700,whiteSpace:"nowrap",
        }}>
          {visitText} ↗
        </div>
      </div>
    </button>
  );
}

export default function PlanPage() {
  const { lang } = useLang();
  const isHe = lang === "he";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Rubik', sans-serif; background: #0d2137; }
      `}</style>
      <div style={{fontFamily:"'Rubik',sans-serif",background:"#0d2137",color:"#fff",minHeight:"100vh"}} dir={isHe?"rtl":"ltr"}>
        <SiteNav />

        {/* Hero */}
        <div style={{
          background:"linear-gradient(160deg,#091928 0%,#0d2137 60%,#0a3050 100%)",
          padding:"56px 24px 48px", textAlign:"center",
        }}>
          <div style={{maxWidth:620,margin:"0 auto"}}>
            <div style={{fontSize:30,fontWeight:900,color:"#fff",lineHeight:1.25,marginBottom:12,letterSpacing:-0.5}}>
              {T.heroTitle[lang]}
            </div>
            <div style={{fontSize:15,color:"rgba(255,255,255,0.45)",lineHeight:1.6}}>
              {T.heroSub[lang]}
            </div>
          </div>
        </div>

        <div style={{maxWidth:700,margin:"0 auto",padding:"0 20px 60px"}}>

          {/* Flights */}
          <div style={{marginTop:48}}>
            <div style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:6}}>{T.flightsTitle[lang]}</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.35)",marginBottom:18}}>{T.flightsSub[lang]}</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <LinkCard logo="🟢" title="Google Flights"   desc={T.gflightsDesc[lang]} builder={linkBuilders.gflights} lang={lang}/>
              <LinkCard logo="🟠" title="Kiwi.com"         desc={T.kiwiDesc[lang]}     builder={linkBuilders.kiwi}     lang={lang}/>
              <LinkCard logo="🔵" title="Skyscanner"       desc={T.skyscannerDesc[lang]} builder={linkBuilders.skyscanner} lang={lang}/>
            </div>
          </div>

          {/* Hotels */}
          <div style={{marginTop:44}}>
            <div style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:6}}>{T.hotelsTitle[lang]}</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.35)",marginBottom:18}}>{T.hotelsSub[lang]}</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <LinkCard logo="🟡" title="Agoda"       desc={T.agodaDesc[lang]}   builder={linkBuilders.agoda}   lang={lang}/>
              <LinkCard logo="🔵" title="Booking.com" desc={T.bookingDesc[lang]} builder={linkBuilders.booking} lang={lang}/>
            </div>
          </div>

          {/* Activities */}
          <div style={{marginTop:44}}>
            <div style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:6}}>{T.activitiesTitle[lang]}</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.35)",marginBottom:18}}>{T.activitiesSub[lang]}</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <LinkCard logo="🟣" title="Viator"          desc={T.viatorDesc[lang]} builder={linkBuilders.viator} lang={lang}/>
              <LinkCard logo="🟠" title="GetYourGuide"    desc={T.gygDesc[lang]}    builder={linkBuilders.gyg}    lang={lang}/>
            </div>
          </div>

          {/* eSIM */}
          <div style={{marginTop:44}}>
            <div style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:6}}>{T.esimTitle[lang]}</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.35)",marginBottom:18}}>{T.esimSub[lang]}</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <LinkCard logo="📶" title="Airalo" desc={T.airaloDesc[lang]} builder={linkBuilders.airalo} lang={lang}/>
            </div>
          </div>

          {/* Affiliate disclaimer */}
          <div style={{marginTop:28,fontSize:11,color:"rgba(255,255,255,0.2)",lineHeight:1.5}}>
            {T.sectionNote[lang]}
          </div>

          {/* App CTA */}
          <div style={{
            marginTop:52,
            background:"linear-gradient(135deg,rgba(100,223,223,0.1),rgba(100,223,223,0.04))",
            border:"0.5px solid rgba(100,223,223,0.2)",
            borderRadius:20,
            padding:"32px 28px",
            textAlign:"center",
          }}>
            <div style={{fontSize:22,fontWeight:800,color:"#fff",marginBottom:10,lineHeight:1.3}}>
              {T.appTitle[lang]}
            </div>
            <div style={{fontSize:14,color:"rgba(255,255,255,0.45)",marginBottom:24,lineHeight:1.6}}>
              {T.appSub[lang]}
            </div>
            <a href="/login" style={{
              display:"inline-block",
              background:"#64dfdf",color:"#0d2137",
              fontFamily:"'Rubik',sans-serif",
              fontSize:16,fontWeight:800,
              padding:"14px 36px",borderRadius:999,
              textDecoration:"none",
              boxShadow:"0 8px 28px rgba(100,223,223,0.25)",
            }}>
              {T.appBtn[lang]}
            </a>
          </div>
        </div>

        <SiteFooter />
      </div>
    </>
  );
}
