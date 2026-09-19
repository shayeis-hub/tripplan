"use client";
import { useRouter } from "next/navigation";
import { Wallet, Calendar, Users, RefreshCw, Backpack, Map, Check } from "lucide-react";
import { useLang } from "@/lib/LangContext";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/seo";
import { GOOGLE_PLAY_URL, APP_STORE_URL } from "@/lib/stores";

const T = {
  h1: {
    he: "מתכנן טיולים קבוצתי עם מסלול, תקציב וחלוקת הוצאות",
    en: "Group Travel Planner with Itinerary, Budget & Expense Splitting",
    es: "Planificador de Viajes en Grupo con Itinerario, Presupuesto y División de Gastos",
  },
  sub: {
    he: "טיולון היא אפליקציה חינמית לתכנון טיולים קבוצתיים שמשלבת מסלול משותף, מעקב הוצאות רב-מטבעי, התחשבנות אוטומטית, מפות, רשימת אריזה ושיתוף פעולה בזמן אמת — הכל במקום אחד.",
    en: "Tulon is a free group travel planning app that combines a shared itinerary, multi-currency expense tracking, automatic settlement, maps, packing lists and real-time collaboration in one place.",
    es: "Tulon es una app gratuita para planificar viajes en grupo que combina un itinerario compartido, seguimiento de gastos multi-moneda, liquidación automática, mapas, listas de equipaje y colaboración en tiempo real, todo en un solo lugar.",
  },
  ctaStart: { he: "התחל בחינם", en: "Start free", es: "Empezar gratis" },
  ctaFeatures: { he: "כל הפיצ'רים", en: "See all features", es: "Ver todas las funciones" },
  featuresTitle: {
    he: "מה כלול בתכנון טיול קבוצתי בטיולון",
    en: "What's Included for Group Trip Planning",
    es: "Qué Incluye la Planificación de Viajes en Grupo",
  },
  f1t: { he: "מסלול משותף יום אחר יום", en: "Shared day-by-day itinerary", es: "Itinerario compartido día a día" },
  f1d: { he: "פעילויות, הזמנות וטיסות לכל יום, עם תחזית מזג אוויר ומסלול הליכה מומלץ.", en: "Activities, reservations and flights for each day, with a weather forecast and a suggested walking route.", es: "Actividades, reservas y vuelos para cada día, con pronóstico del tiempo y ruta a pie sugerida." },
  f2t: { he: "הוצאות רב-מטבעיות", en: "Multi-currency expense tracking", es: "Seguimiento de gastos multi-moneda" },
  f2d: { he: "כל הוצאה, בכל מטבע, מומרת אוטומטית לפי שער חליפין חי.", en: "Every expense, in any currency, converts automatically at a live exchange rate.", es: "Cada gasto, en cualquier moneda, se convierte automáticamente al tipo de cambio en vivo." },
  f3t: { he: "התחשבנות אוטומטית", en: "Automatic settlement", es: "Liquidación automática" },
  f3d: { he: "מי חייב למי וכמה, במספר המינימלי של העברות — בלי אקסל.", en: "Who owes whom and how much, in the minimum number of transfers — no spreadsheets.", es: "Quién le debe a quién y cuánto, con el número mínimo de transferencias — sin hojas de cálculo." },
  f4t: { he: "שיתוף פעולה בזמן אמת", en: "Real-time group collaboration", es: "Colaboración en grupo en tiempo real" },
  f4d: { he: "כל חברי הקבוצה מצטרפים בקישור אחד ורואים את אותו הטיול, כולל מצב צפייה בלבד.", en: "Everyone joins with one link and sees the same trip update live, including a view-only mode.", es: "Todos se unen con un enlace y ven el mismo viaje actualizado en vivo, incluido un modo de solo lectura." },
  f5t: { he: "מפה משותפת", en: "One shared map", es: "Un mapa compartido" },
  f5d: { he: "כל המקומות של הטיול על מפה אחת, לכל הקבוצה.", en: "Every place in the trip on one map, for the whole group.", es: "Todos los lugares del viaje en un mapa, para todo el grupo." },
  f6t: { he: "רשימת אריזה משותפת", en: "Shared packing list", es: "Lista de equipaje compartida" },
  f6d: { he: "רשימה אחת שכל הקבוצה מעדכנת ומסמנת יחד.", en: "One list the whole group updates and checks off together.", es: "Una lista que todo el grupo actualiza y marca junto." },
  compareTitle: {
    he: "טיולון מול חלופות אחרות",
    en: "Tulon vs. Other Group Trip Tools",
    es: "Tulon frente a Otras Herramientas de Viaje en Grupo",
  },
  compareSub: {
    he: "ההשוואה הזו כנה — כל כלי טוב במשהו. הרחבה מלאה בפוסט הבלוג שלנו.",
    en: "This comparison is honest — every tool is good at something. Full breakdown in our blog post.",
    es: "Esta comparación es honesta — cada herramienta es buena en algo. Desglose completo en nuestro blog.",
  },
  compareLink: { he: "השוואה מלאה בין 5 אפליקציות ←", en: "Full 5-app comparison →", es: "Comparación completa de 5 apps →" },
  compareLink2: { he: "Wanderlog מול Splitwise מול טיולון ←", en: "Wanderlog vs Splitwise vs Tulon →", es: "Wanderlog vs Splitwise vs Tulon →" },
  featCol: { he: "יכולת", en: "Feature", es: "Función" },
  rowItin: { he: "מסלול יום אחר יום", en: "Day-by-day itinerary", es: "Itinerario día a día" },
  rowSplit: { he: "חלוקת הוצאות קבוצתית", en: "Group expense splitting", es: "División de gastos en grupo" },
  rowSettle: { he: "התחשבנות אוטומטית", en: "Automatic settlement", es: "Liquidación automática" },
  rowRealtime: { he: "שיתוף פעולה בזמן אמת", en: "Real-time collaboration", es: "Colaboración en tiempo real" },
  rowFree: { he: "חינמי לחלוטין", en: "Completely free", es: "Completamente gratis" },
  faqTitle: { he: "שאלות נפוצות", en: "Frequently Asked Questions", es: "Preguntas Frecuentes" },
  storeGoogleEyebrow: { he: "זמין ב־", en: "GET IT ON", es: "DISPONIBLE EN" },
  storeAppleEyebrow: { he: "הורידו מ־", en: "Download on the", es: "Descárgalo en" },
} as const;

type Localized = { he: string; en: string; es: string };
const FAQ: { q: Localized; a: Localized; link?: { href: string; label: Localized } }[] = [
  {
    q: { he: "האם טיולון היא אפליקציה לתכנון טיול קבוצתי?", en: "Is Tulon a group travel planner?", es: "¿Tulon es un planificador de viajes en grupo?" },
    a: {
      he: "כן. טיולון מאפשרת לקבוצה שלמה לתכנן טיול אחד יחד — מסלול יומי, תקציב משותף וחלוקת הוצאות, הכל מתעדכן בזמן אמת לכל המוזמנים.",
      en: "Yes. Tulon lets a whole group plan one shared trip together — a day-by-day itinerary, a group budget, and expense splitting, all updated in real time for everyone invited.",
      es: "Sí. Tulon permite que todo un grupo planifique un viaje compartido — itinerario día a día, presupuesto compartido y división de gastos, todo actualizado en tiempo real para todos los invitados.",
    },
  },
  {
    q: { he: "האם טיולון יודעת לחלק הוצאות בטיול?", en: "Can Tulon split travel expenses?", es: "¿Tulon puede dividir los gastos del viaje?" },
    a: {
      he: "כן. כל הוצאה נרשמת בכל מטבע וממומרת אוטומטית לפי שער חליפין חי. בסוף הטיול טיולון מחשבת מי חייב למי וכמה, במספר המינימלי של העברות.",
      en: "Yes. Every expense is logged in any currency and converted automatically at a live exchange rate. At the end of the trip, Tulon calculates who owes whom and how much, in the minimum number of transfers.",
      es: "Sí. Cada gasto se registra en cualquier moneda y se convierte automáticamente al tipo de cambio en vivo. Al final del viaje, Tulon calcula quién le debe a quién y cuánto, con el número mínimo de transferencias.",
    },
    link: {
      href: "/blog/manage-expenses-during-group-trip",
      label: { he: "איך לנהל הוצאות בזמן אמת →", en: "How to manage expenses in real time →", es: "Cómo gestionar los gastos en tiempo real →" },
    },
  },
  {
    q: { he: "האם כמה מטיילים יכולים לערוך את אותו הטיול?", en: "Can multiple travelers edit the same trip?", es: "¿Pueden varios viajeros editar el mismo viaje?" },
    a: {
      he: "כן. כל מי שמוזמן לטיול (למשל דרך קישור בוואטסאפ) יכול לצפות ולערוך את אותו המסלול וההוצאות בזמן אמת, או לקבל גישת צפייה בלבד.",
      en: "Yes. Anyone invited to a trip (via a link shared over WhatsApp, for example) can view and edit the same itinerary and expenses in real time, or be given view-only access.",
      es: "Sí. Cualquiera invitado a un viaje (por ejemplo, mediante un enlace compartido por WhatsApp) puede ver y editar el mismo itinerario y gastos en tiempo real, o recibir acceso de solo lectura.",
    },
    link: {
      href: "/blog/plan-group-trip-without-spreadsheets",
      label: { he: "למה זה עדיף על גיליון משותף →", en: "Why this beats a shared spreadsheet →", es: "Por qué esto es mejor que una planilla →" },
    },
  },
  {
    q: { he: "האם טיולון תומכת בכמה מטבעות?", en: "Does Tulon support multiple currencies?", es: "¿Tulon admite múltiples monedas?" },
    a: {
      he: "כן. כל הוצאה נרשמת במטבע שבו שילמתם בפועל, וטיולון ממירה אותה אוטומטית למטבע ברירת המחדל שלכם לפי שער חי.",
      en: "Yes. Every expense can be logged in the currency you actually paid in, and Tulon converts it automatically to your default currency at a live exchange rate.",
      es: "Sí. Cada gasto se puede registrar en la moneda en la que realmente pagaste, y Tulon lo convierte automáticamente a tu moneda predeterminada al tipo de cambio en vivo.",
    },
  },
  {
    q: { he: "האם טיולון היא חלופה ל-Splitwise לטיולים?", en: "Is Tulon a Splitwise alternative for travel?", es: "¿Tulon es una alternativa a Splitwise para viajes?" },
    a: {
      he: "כן, ועוד יותר. כמו Splitwise, טיולון מחשבת מי חייב למי במספר המינימלי של העברות. בשונה מ-Splitwise, טיולון כוללת גם מסלול יומי מלא, כך שלא צריך אפליקציה נפרדת לתכנון הטיול.",
      en: "Yes, and more. Like Splitwise, Tulon calculates who owes whom with the minimum number of transfers. Unlike Splitwise, Tulon also includes a full day-by-day itinerary, so you don't need a separate app for trip planning.",
      es: "Sí, y más. Como Splitwise, Tulon calcula quién le debe a quién con el número mínimo de transferencias. A diferencia de Splitwise, Tulon también incluye un itinerario completo día a día, así que no necesitas una app separada para planificar el viaje.",
    },
    link: {
      href: "/blog/best-splitwise-alternatives-group-travel",
      label: { he: "עוד חלופות ל-Splitwise →", en: "More Splitwise alternatives →", es: "Más alternativas a Splitwise →" },
    },
  },
  {
    q: { he: "האם טיולון חינמית?", en: "Is Tulon free?", es: "¿Tulon es gratis?" },
    a: {
      he: "כן. טיולון חינמית לחלוטין, בלי גרסת פרימיום, בלי צורך בכרטיס אשראי ובלי פרסומות.",
      en: "Yes. Tulon is completely free, with no premium tier, no credit card required, and no ads.",
      es: "Sí. Tulon es completamente gratis, sin nivel premium, sin necesidad de tarjeta de crédito y sin publicidad.",
    },
  },
];

// ✓ / partial / ✗ per row: [Tulon, Wanderlog, TripIt, Splitwise]. Kept to
// well-established, verifiable public facts — no competitor pricing claims.
const COMPARE_ROWS: { labelKey: keyof typeof T; cells: (boolean | "partial")[] }[] = [
  { labelKey: "rowItin",     cells: [true, true, true, false] },
  { labelKey: "rowSplit",    cells: [true, false, false, true] },
  { labelKey: "rowSettle",   cells: [true, false, false, true] },
  { labelKey: "rowRealtime", cells: [true, true, "partial", true] },
  { labelKey: "rowFree",     cells: [true, "partial", "partial", "partial"] },
];

function Cell({ v }: { v: boolean | "partial" }) {
  if (v === true) return <Check size={16} color="#4ade80" strokeWidth={2.5} style={{ margin: "0 auto" }} />;
  if (v === "partial") return <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>—</span>;
  return <span style={{ color: "rgba(255,107,107,0.6)", fontSize: 14 }}>✕</span>;
}

export default function GroupTravelPlannerPage() {
  const router = useRouter();
  const { lang } = useLang();
  const isHe = lang === "he";
  const dir = isHe ? "rtl" : "ltr";

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Tulon",
    applicationCategory: "TravelApplication",
    operatingSystem: "Web, Android, iOS",
    url: `${SITE_URL}/group-travel-planner`,
    description: T.sub.en,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isAccessibleForFree: true,
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(item => ({
      "@type": "Question",
      name: item.q.en,
      acceptedAnswer: { "@type": "Answer", text: item.a.en },
    })),
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Rubik', sans-serif; background: #0d2137; }
        .gtp { font-family: 'Rubik', sans-serif; background: #0d2137; color: #fff; min-height: 100vh; }
        .hero { background: linear-gradient(160deg, #091928 0%, #0d2137 60%, #0a3050 100%); padding: 60px 24px 50px; text-align: center; }
        .hero-inner { max-width: 640px; margin: 0 auto; }
        .h1 { font-size: 30px; font-weight: 900; color: #fff; line-height: 1.25; letter-spacing: -0.5px; margin-bottom: 16px; }
        @media (max-width: 520px) { .h1 { font-size: 24px; } }
        .sub { font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 30px; }
        .btns { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-bottom: 26px; }
        .btn-cta { display: inline-block; background: #64dfdf; color: #0d2137; font-size: 16px; font-weight: 800; padding: 14px 36px; border-radius: 999px; border: none; cursor: pointer; text-decoration: none; }
        .btn-ghost { display: inline-block; background: transparent; color: rgba(255,255,255,0.55); font-size: 14px; font-weight: 500; padding: 12px 24px; border-radius: 999px; border: 0.5px solid rgba(255,255,255,0.15); cursor: pointer; text-decoration: none; }
        .stores { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .store-badge { display: inline-flex; align-items: center; gap: 8px; background: #000; border: 0.5px solid rgba(255,255,255,0.2); border-radius: 11px; padding: 8px 14px; text-decoration: none; }
        .store-eyebrow { display: block; font-size: 9px; color: rgba(255,255,255,0.7); text-transform: uppercase; }
        .store-name { display: block; font-size: 14px; font-weight: 600; color: #fff; }

        .section { max-width: 760px; margin: 0 auto; padding: 50px 24px; }
        .section-title { font-size: 24px; font-weight: 800; color: #fff; text-align: center; margin-bottom: 30px; letter-spacing: -0.4px; }

        .feats { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 520px) { .feats { grid-template-columns: 1fr; } }
        .feat { background: rgba(255,255,255,0.04); border: 0.5px solid rgba(100,223,223,0.12); border-radius: 16px; padding: 18px; }
        .feat-icon { width: 38px; height: 38px; border-radius: 11px; background: rgba(100,223,223,0.12); border: 0.5px solid rgba(100,223,223,0.25); display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
        .feat-t { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .feat-d { font-size: 12.5px; color: rgba(255,255,255,0.45); line-height: 1.6; }

        .cmp-wrap { overflow-x: auto; border-radius: 14px; border: 0.5px solid rgba(255,255,255,0.1); }
        table.cmp { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 480px; }
        table.cmp th, table.cmp td { padding: 12px 10px; text-align: center; border-bottom: 0.5px solid rgba(255,255,255,0.08); }
        table.cmp th { background: rgba(255,255,255,0.04); font-weight: 700; color: rgba(255,255,255,0.7); font-size: 12px; }
        table.cmp td:first-child, table.cmp th:first-child { text-align: ${isHe ? "right" : "left"}; color: rgba(255,255,255,0.85); font-weight: 600; }
        table.cmp th:first-child { background: transparent; }
        table.cmp tr:last-child td { border-bottom: none; }
        .cmp-link { display: block; text-align: center; margin-top: 16px; font-size: 13px; color: #64dfdf; text-decoration: none; font-weight: 600; }

        .faq-item { border-bottom: 0.5px solid rgba(255,255,255,0.08); padding: 18px 0; }
        .faq-q { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 8px; }
        .faq-a { font-size: 14px; color: rgba(255,255,255,0.55); line-height: 1.7; }
        .faq-link { display: inline-block; margin-top: 8px; font-size: 13px; color: #64dfdf; text-decoration: none; font-weight: 600; }
      `}</style>

      <div className="gtp" style={{ direction: dir }}>
        <JsonLd data={pageSchema} />
        <JsonLd data={faqSchema} />
        <SiteNav />

        <div className="hero">
          <div className="hero-inner">
            <h1 className="h1">{T.h1[lang]}</h1>
            <p className="sub">{T.sub[lang]}</p>
            <div className="btns">
              <button className="btn-cta" onClick={() => router.push("/login")}>{T.ctaStart[lang]}</button>
              <a className="btn-ghost" href="/features">{T.ctaFeatures[lang]}</a>
            </div>
            <div className="stores">
              <a className="store-badge" href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer">
                <svg width="16" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#00D2FF" d="M3.9 1.8c-.3.3-.4.8-.4 1.4v17.6c0 .6.1 1.1.4 1.4l.1.1L14.2 12v-.1L4 1.7l-.1.1z" />
                  <path fill="#00E676" d="M17.6 15.6l-3.4-3.5v-.2l3.4-3.5.1.1 4.1 2.3c1.2.7 1.2 1.8 0 2.5l-4.1 2.3-.1.1z" />
                  <path fill="#FF3D00" d="M17.7 15.5 14.2 12 3.9 22.2c.4.4 1.1.5 1.8.1l12-6.8" />
                  <path fill="#FFC400" d="M17.7 8.5 5.7 1.7c-.7-.4-1.4-.4-1.8.1L14.2 12l3.5-3.5z" />
                </svg>
                <span><span className="store-eyebrow">{T.storeGoogleEyebrow[lang]}</span><span className="store-name">Google Play</span></span>
              </a>
              {APP_STORE_URL && (
                <a className="store-badge" href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
                  <svg width="15" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span><span className="store-eyebrow">{T.storeAppleEyebrow[lang]}</span><span className="store-name">App Store</span></span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-title">{T.featuresTitle[lang]}</div>
          <div className="feats">
            <div className="feat"><div className="feat-icon"><Calendar size={18} color="#64dfdf" strokeWidth={1.5}/></div><div className="feat-t">{T.f1t[lang]}</div><div className="feat-d">{T.f1d[lang]}</div></div>
            <div className="feat"><div className="feat-icon"><Wallet size={18} color="#64dfdf" strokeWidth={1.5}/></div><div className="feat-t">{T.f2t[lang]}</div><div className="feat-d">{T.f2d[lang]}</div></div>
            <div className="feat"><div className="feat-icon"><RefreshCw size={18} color="#64dfdf" strokeWidth={1.5}/></div><div className="feat-t">{T.f3t[lang]}</div><div className="feat-d">{T.f3d[lang]}</div></div>
            <div className="feat"><div className="feat-icon"><Users size={18} color="#64dfdf" strokeWidth={1.5}/></div><div className="feat-t">{T.f4t[lang]}</div><div className="feat-d">{T.f4d[lang]}</div></div>
            <div className="feat"><div className="feat-icon"><Map size={18} color="#64dfdf" strokeWidth={1.5}/></div><div className="feat-t">{T.f5t[lang]}</div><div className="feat-d">{T.f5d[lang]}</div></div>
            <div className="feat"><div className="feat-icon"><Backpack size={18} color="#64dfdf" strokeWidth={1.5}/></div><div className="feat-t">{T.f6t[lang]}</div><div className="feat-d">{T.f6d[lang]}</div></div>
          </div>
        </div>

        <div className="section">
          <div className="section-title">{T.compareTitle[lang]}</div>
          <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: -18, marginBottom: 22 }}>{T.compareSub[lang]}</p>
          <div className="cmp-wrap">
            <table className="cmp">
              <thead>
                <tr>
                  <th>{T.featCol[lang]}</th>
                  <th>Tulon</th>
                  <th>Wanderlog</th>
                  <th>TripIt</th>
                  <th>Splitwise</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map(row => (
                  <tr key={row.labelKey}>
                    <td>{T[row.labelKey][lang]}</td>
                    {row.cells.map((c, i) => <td key={i}><Cell v={c}/></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <a className="cmp-link" href="/blog/best-group-trip-planner-apps-2026">{T.compareLink[lang]}</a>
          <a className="cmp-link" href="/blog/wanderlog-vs-splitwise-vs-tulon">{T.compareLink2[lang]}</a>
        </div>

        <div className="section">
          <div className="section-title">{T.faqTitle[lang]}</div>
          {FAQ.map((item, i) => (
            <div className="faq-item" key={i}>
              <div className="faq-q">{item.q[lang]}</div>
              <div className="faq-a">{item.a[lang]}</div>
              {item.link && <a className="faq-link" href={item.link.href}>{item.link.label[lang]}</a>}
            </div>
          ))}
        </div>

        <div className="section" style={{ textAlign: "center", paddingTop: 10, paddingBottom: 56 }}>
          <button className="btn-cta" onClick={() => router.push("/login")}>{T.ctaStart[lang]}</button>
        </div>

        <SiteFooter />
      </div>
    </>
  );
}
