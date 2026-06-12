"use client";
import { useLang } from "@/lib/LangContext";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { Wallet, Users, Calendar, Building2, Backpack, Share2, Globe, Bell } from "lucide-react";

const T = {
  heroTitle: {
    he: "הפיצ'רים שיהפכו כל טיול לחוויה",
    en: "Features That Make Every Trip an Experience",
    es: "Funciones que Hacen de Cada Viaje una Experiencia",
  },
  heroSub: {
    he: "כל מה שתכנן בנינו כדי שתתמקדו בטיול — ולא בלוגיסטיקה",
    en: "Everything we built so you can focus on the trip — not the logistics",
    es: "Todo lo que construimos para que te concentres en el viaje — no en la logística",
  },
  free: {
    he: "חינמי לחלוטין — ללא פרימיום, ללא מגבלות",
    en: "Completely Free — No Premium, No Limits",
    es: "Completamente Gratis — Sin Premium, Sin Límites",
  },
  ctaTitle: { he: "מוכן לנסות?", en: "Ready to Try?", es: "¿Listo para Probar?" },
  ctaBtn: { he: "פתח את טיולון — בחינם", en: "Open Tulon — Free", es: "Abrir Tulon — Gratis" },

  feat1Title: { he: "ניהול הוצאות מתקדם", en: "Advanced Expense Tracking", es: "Seguimiento de Gastos Avanzado" },
  feat1Body: {
    he: "רשמו כל הוצאה בכל מטבע — האפליקציה ממירה למטבע ברירת המחדל שלכם אוטומטית לפי שער חי. ראו סיכום לפי קטגוריות, לפי ימים, ולפי משתתפים.",
    en: "Log every expense in any currency — the app converts to your default currency automatically at live exchange rates. View summaries by category, by day, and by participant.",
    es: "Registra cada gasto en cualquier moneda — la app convierte a tu moneda predeterminada automáticamente al tipo de cambio en vivo. Ve resúmenes por categoría, por día y por participante.",
  },
  feat2Title: { he: "התחשבנות קבוצתית אוטומטית", en: "Automatic Group Settlement", es: "Liquidación de Grupo Automática" },
  feat2Body: {
    he: "בסוף הטיול, לחצו 'התחשבן' — האפליקציה מחשבת מי חייב כמה למי ומציגה את המינימום מספר העברות הדרושות. אין יותר חישובים ידניים.",
    en: "At the end of the trip, tap 'Settle Up' — the app calculates who owes what to whom and shows the minimum number of transfers needed. No more manual calculations.",
    es: "Al final del viaje, toca 'Ajustar cuentas' — la app calcula quién debe qué a quién y muestra el número mínimo de transferencias necesarias. No más cálculos manuales.",
  },
  feat3Title: { he: "יומן ומסלול יומי", en: "Daily Calendar & Itinerary", es: "Calendario Diario e Itinerario" },
  feat3Body: {
    he: "תכננו פעילויות לכל יום — עם שעות, מיקומים ותיאורים. ראו את המסלול היומי בתצוגת ציר זמן, עם תחזית מזג אוויר לכל יום.",
    en: "Plan activities for each day — with times, locations and descriptions. View the daily itinerary in a timeline view, with weather forecast for each day.",
    es: "Planifica actividades para cada día — con horarios, ubicaciones y descripciones. Ve el itinerario diario en vista de línea de tiempo, con pronóstico del tiempo para cada día.",
  },
  feat4Title: { he: "גלה מלונות ואטרקציות", en: "Discover Hotels & Activities", es: "Descubre Hoteles y Actividades" },
  feat4Body: {
    he: "ישירות מהאפליקציה, חפשו מלונות ב-Agoda ו-Booking.com ואטרקציות ב-Viator ו-GetYourGuide — עם לינקים ישירים ליעד הספציפי שלכם.",
    en: "Directly from the app, search for hotels on Agoda and Booking.com and activities on Viator and GetYourGuide — with direct links to your specific destination.",
    es: "Directamente desde la app, busca hoteles en Agoda y Booking.com y actividades en Viator y GetYourGuide — con enlaces directos a tu destino específico.",
  },
  feat5Title: { he: "שיתוף קבוצתי בזמן אמת", en: "Real-Time Group Sharing", es: "Compartir en Grupo en Tiempo Real" },
  feat5Body: {
    he: "שלחו קישור הזמנה לוואטסאפ — כל חברי הטיול מצטרפים בלחיצה אחת. כולם רואים את אותו לוח שנה, אותן הוצאות, ויכולים לעדכן בזמן אמת.",
    en: "Send a WhatsApp invite link — all trip members join with one tap. Everyone sees the same calendar, the same expenses, and can update in real time.",
    es: "Envía un enlace de invitación por WhatsApp — todos los miembros del viaje se unen con un toque. Todos ven el mismo calendario, los mismos gastos, y pueden actualizar en tiempo real.",
  },
  feat6Title: { he: "רשימת אריזה ומפה", en: "Packing List & Map", es: "Lista de Equipaje y Mapa" },
  feat6Body: {
    he: "נהלו רשימת ציוד לפני הטיול — עם הצעות לפי יעד ועונה. ראו את כל מקומות הטיול על מפה אחת.",
    en: "Manage your gear list before the trip — with suggestions based on destination and season. View all trip locations on one map.",
    es: "Gestiona tu lista de equipo antes del viaje — con sugerencias basadas en el destino y la temporada. Ve todos los lugares del viaje en un solo mapa.",
  },
  feat7Title: { he: "תמיכה רב-לשונית", en: "Multi-Language Support", es: "Soporte Multilingüe" },
  feat7Body: {
    he: "האפליקציה זמינה בעברית, אנגלית וספרדית — עם תמיכה מלאה בכיוון RTL לתצוגה נוחה בעברית.",
    en: "The app is available in Hebrew, English and Spanish — with full RTL support for comfortable Hebrew display.",
    es: "La app está disponible en hebreo, inglés y español — con soporte RTL completo para una visualización cómoda en hebreo.",
  },
  feat8Title: { he: "PWA — ללא הורדה", en: "PWA — No Download Needed", es: "PWA — Sin Descarga" },
  feat8Body: {
    he: "טיולון היא אפליקציית PWA — עובדת ישירות בדפדפן, גם ללא חיבור לאינטרנט. ניתן להוסיף לסמל הבית בלחיצה אחת.",
    en: "Tulon is a PWA — works directly in the browser, even offline. Add to home screen with one tap.",
    es: "Tulon es una PWA — funciona directamente en el navegador, incluso sin conexión. Añade a la pantalla de inicio con un toque.",
  },
} as const;

const features = [
  { key: "feat1", Icon: Wallet,    color: "#64dfdf", bg: "rgba(100,223,223,0.12)" },
  { key: "feat2", Icon: Share2,    color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
  { key: "feat3", Icon: Calendar,  color: "#f472b6", bg: "rgba(244,114,182,0.12)" },
  { key: "feat4", Icon: Building2, color: "#fbbf24", bg: "rgba(251,191,36,0.12)"  },
  { key: "feat5", Icon: Users,     color: "#4ade80", bg: "rgba(74,222,128,0.12)"  },
  { key: "feat6", Icon: Backpack,  color: "#64dfdf", bg: "rgba(100,223,223,0.12)" },
  { key: "feat7", Icon: Globe,     color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  { key: "feat8", Icon: Bell,      color: "#fb923c", bg: "rgba(251,146,60,0.12)"  },
] as const;

export default function FeaturesPage() {
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
          padding:"56px 24px 48px",textAlign:"center",
        }}>
          <div style={{maxWidth:580,margin:"0 auto"}}>
            <div style={{fontSize:30,fontWeight:900,color:"#fff",lineHeight:1.25,marginBottom:12,letterSpacing:-0.5}}>
              {T.heroTitle[lang]}
            </div>
            <div style={{fontSize:15,color:"rgba(255,255,255,0.45)",lineHeight:1.6,marginBottom:20}}>
              {T.heroSub[lang]}
            </div>
            <div style={{
              display:"inline-block",
              background:"rgba(100,223,223,0.1)",
              border:"0.5px solid rgba(100,223,223,0.25)",
              borderRadius:999,padding:"8px 20px",
              fontSize:13,fontWeight:700,color:"#64dfdf",
            }}>
              ✨ {T.free[lang]}
            </div>
          </div>
        </div>

        {/* Features grid */}
        <div style={{maxWidth:700,margin:"0 auto",padding:"48px 20px 60px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {features.map(({key, Icon, color, bg}) => {
              const titleKey = `${key}Title` as keyof typeof T;
              const bodyKey  = `${key}Body`  as keyof typeof T;
              return (
                <div key={key} style={{
                  background:"rgba(255,255,255,0.04)",
                  border:"0.5px solid rgba(100,223,223,0.1)",
                  borderRadius:18,padding:"22px 20px",
                }}>
                  <div style={{
                    width:46,height:46,borderRadius:13,
                    background:bg,border:`0.5px solid ${color}44`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    marginBottom:12,
                  }}>
                    <Icon size={22} color={color} strokeWidth={1.5}/>
                  </div>
                  <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:7}}>
                    {(T[titleKey] as Record<string,string>)[lang]}
                  </div>
                  <div style={{fontSize:13,color:"rgba(255,255,255,0.42)",lineHeight:1.65}}>
                    {(T[bodyKey] as Record<string,string>)[lang]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div style={{marginTop:52,textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:800,color:"#fff",marginBottom:22}}>
              {T.ctaTitle[lang]}
            </div>
            <a href="/login" style={{
              display:"inline-block",
              background:"#64dfdf",color:"#0d2137",
              fontFamily:"'Rubik',sans-serif",
              fontSize:16,fontWeight:800,
              padding:"14px 40px",borderRadius:999,
              textDecoration:"none",
              boxShadow:"0 8px 28px rgba(100,223,223,0.25)",
            }}>
              {T.ctaBtn[lang]}
            </a>
          </div>
        </div>

        <SiteFooter />
      </div>
    </>
  );
}
