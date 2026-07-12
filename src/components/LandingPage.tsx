"use client";
import { useRouter } from "next/navigation";
import { Wallet, Users, Calendar, Building2, Backpack, Share2 } from "lucide-react";
import { useLang } from "@/lib/LangContext";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const T = {
  tag: { he: "מתכנן הטיולים שלי", en: "My Trip Planner", es: "Mi planificador de viajes" },
  desc: {
    he: "תכנן טיולים, עקוב אחרי הוצאות, ונהל התחשבנות עם חברי הטיול — הכל במקום אחד",
    en: "Plan trips, track expenses, and settle up with your travel buddies — all in one place",
    es: "Planifica viajes, registra gastos y ajusta cuentas con tus compañeros de viaje — todo en un solo lugar",
  },
  ctaStart: { he: "התחל בחינם", en: "Start free", es: "Empezar gratis" },
  ctaLogin: { he: "כניסה למשתמשים קיימים", en: "Existing user? Sign in", es: "¿Ya tienes cuenta? Inicia sesión" },
  featTitle: {
    he: "כל מה שצריך לטיול מושלם",
    en: "Everything you need for the perfect trip",
    es: "Todo lo que necesitas para un viaje perfecto",
  },
  featSub: {
    he: "מניהול תקציב ועד יומן פעילויות — הכל במקום אחד",
    en: "From budget management to activity calendar — all in one place",
    es: "Desde la gestión del presupuesto hasta el calendario de actividades — todo en un solo lugar",
  },
  feat1Title: { he: "ניהול הוצאות", en: "Expense tracking", es: "Gestión de gastos" },
  feat1Desc: {
    he: "רשום כל הוצאה בכל מטבע — האפליקציה ממירה למטבע ברירת המחדל שלך אוטומטית לפי שער חי",
    en: "Log expenses in any currency — automatic conversion to your default currency at live exchange rates",
    es: "Registra cualquier gasto en cualquier moneda — conversión automática a tu moneda predeterminada al tipo de cambio en vivo",
  },
  feat2Title: { he: "התחשבנות קבוצתית", en: "Group settlement", es: "Ajuste de cuentas grupal" },
  feat2Desc: {
    he: "בסוף הטיול — מי חייב כמה למי, חישוב אוטומטי מלא",
    en: "At the end of the trip — who owes whom, fully automatic calculation",
    es: "Al final del viaje — quién debe a quién, cálculo totalmente automático",
  },
  feat3Title: { he: "יומן ומסלול", en: "Calendar & itinerary", es: "Calendario e itinerario" },
  feat3Desc: {
    he: "תכנן פעילויות לכל יום, ראה מה קורה בכל שעה עם תחזית מזג אוויר",
    en: "Plan activities for each day, see what's happening hour by hour with weather forecasts",
    es: "Planifica actividades para cada día y consulta hora a hora con el pronóstico del tiempo",
  },
  feat4Title: { he: "המלצות מלונות ופעילויות", en: "Hotel & activity recommendations", es: "Recomendaciones de hoteles y actividades" },
  feat4Desc: {
    he: "חיפוש מלונות ב-Agoda ופעילויות ב-Viator — ישירות מתוך האפליקציה",
    en: "Search hotels on Agoda and activities on Viator — right from the app",
    es: "Busca hoteles en Agoda y actividades en Viator — directamente desde la app",
  },
  feat5Title: { he: "שיתוף קבוצתי", en: "Group sharing", es: "Compartir en grupo" },
  feat5Desc: {
    he: "שלח קישור הזמנה לוואטסאפ — כל חברי הטיול מצטרפים בלחיצה אחת",
    en: "Send an invite link via WhatsApp — everyone joins with one tap",
    es: "Envía un enlace de invitación por WhatsApp — todos se unen con un toque",
  },
  feat6Title: { he: "רשימת אריזה ומפה", en: "Packing list & map", es: "Lista de equipaje y mapa" },
  feat6Desc: {
    he: "ניהול ציוד לפני הטיול, וכל מקומות הטיול על מפה אחת",
    en: "Manage your gear before the trip, and view all places on one map",
    es: "Gestiona tu equipo antes del viaje y todos los lugares en un solo mapa",
  },
  band1: {
    he: "מתאים לטיולים משפחתיים, קבוצות חברים ונסיעות עסקיות —",
    en: "Great for family trips, groups of friends, and business travel —",
    es: "Ideal para viajes en familia, grupos de amigos y viajes de negocios —",
  },
  band2: { he: "חינמי לחלוטין, ללא הגבלה", en: "Completely free, no limits", es: "Totalmente gratis, sin límites" },
  howTitle: { he: "איך מתחילים?", en: "How does it work?", es: "¿Cómo empezar?" },
  howSub: { he: "שלושה צעדים פשוטים", en: "Three simple steps", es: "Tres pasos sencillos" },
  step1Title: { he: "נרשמים בחינם", en: "Sign up free", es: "Regístrate gratis" },
  step1Desc: { he: "עם Google בלחיצה אחת, או עם אימייל וסיסמה", en: "One-tap Google sign-in, or email & password", es: "Inicio con Google en un toque, o con correo y contraseña" },
  step2Title: { he: "יוצרים טיול ומוסיפים חברים", en: "Create a trip & add friends", es: "Crea un viaje y añade amigos" },
  step2Desc: { he: "שולחים קישור לכל הקבוצה — כולם רואים ומעדכנים בזמן אמת", en: "Share a link with the group — everyone sees and updates in real time", es: "Comparte un enlace con el grupo — todos ven y actualizan en tiempo real" },
  step3Title: { he: "נהנים מהטיול", en: "Enjoy the trip", es: "Disfruta del viaje" },
  step3Desc: { he: "מוסיפים הוצאות, מתכננים פעילויות — ובסוף מתחשבנים בלחיצה אחת", en: "Log expenses, plan activities — then settle up with one tap", es: "Registra gastos, planifica actividades — y al final ajusta cuentas con un toque" },
  ctaReadyTitle: { he: "מוכן לתכנן את הטיול הבא?", en: "Ready to plan your next trip?", es: "¿Listo para planificar tu próximo viaje?" },
  ctaReadySub: { he: "ללא עלות, ללא כרטיס אשראי", en: "No cost, no credit card", es: "Sin costo, sin tarjeta de crédito" },
  ctaReadyBtn: { he: "התחל עכשיו — בחינם", en: "Get started — free", es: "Empezar ahora — gratis" },
  footPrivacy: { he: "מדיניות פרטיות", en: "Privacy Policy", es: "Política de privacidad" },
  footTerms: { he: "תנאי שימוש", en: "Terms", es: "Términos" },
  footContact: { he: "צור קשר", en: "Contact", es: "Contacto" },
  footGuide: { he: "מדריך למשתמש", en: "User Guide", es: "Guía de usuario" },

  // Plan teaser
  planTitle: {
    he: "כל מה שצריך לתכנן טיול מושלם",
    en: "Everything You Need to Plan the Perfect Trip",
    es: "Todo lo que Necesitas para el Viaje Perfecto",
  },
  planSub: {
    he: "טיסות, מלונות, אטרקציות ו-eSIM — כל הקישורים הכי טובים במקום אחד",
    en: "Flights, hotels, activities & eSIM — all the best links in one place",
    es: "Vuelos, hoteles, actividades y eSIM — todos los mejores enlaces en un solo lugar",
  },
  planBtn: {
    he: "למדריך התכנון המלא",
    en: "Open the Trip Planning Hub",
    es: "Abrir el Centro de Planificación",
  },

  // Blog teaser
  blogTitle: { he: "📖 מהבלוג שלנו", en: "📖 From Our Blog", es: "📖 De Nuestro Blog" },
  blogSub: {
    he: "טיפים, מסלולים ומדריכים לטיולים מושלמים",
    en: "Tips, itineraries and guides for the perfect trip",
    es: "Consejos, itinerarios y guías para el viaje perfecto",
  },
  blogBtn: { he: "לכל המאמרים", en: "All Articles", es: "Todos los Artículos" },
  blogPost1Title: {
    he: "שלושה שבועות בתאילנד: זוג 50+, כשרות ושבת — סיפור אמיתי",
    en: "Three Weeks in Thailand: A 50+ Couple, Kosher & Shabbat — A True Story",
    es: "Tres Semanas en Tailandia: Pareja 50+, Kosher y Shabat — Historia Real",
  },
  blogPost2Title: {
    he: "איך לנהל תקציב טיול בלי לוותר על הכיף",
    en: "How to Manage Your Travel Budget Without Sacrificing Fun",
    es: "Cómo Gestionar tu Presupuesto de Viaje Sin Sacrificar la Diversión",
  },
  blogPost3Title: {
    he: "6 יעדים מומלצים לחורף 2026 — בכל תקציב",
    en: "6 Recommended Winter 2026 Destinations — For Every Budget",
    es: "6 Destinos Recomendados para el Invierno 2026 — Para Cada Presupuesto",
  },
} as const;

export default function LandingPage() {
  const router = useRouter();
  const { lang, setLang } = useLang();
  const isHe = lang === "he";
  const dir = isHe ? "rtl" : "ltr";
  const guideHref = lang === "he" ? "/guide-he.html" : lang === "es" ? "/guide-es.html" : "/guide-en.html";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Rubik', sans-serif; background: #0d2137; }
        .lp { font-family: 'Rubik', sans-serif; background: #0d2137; color: #fff; min-height: 100vh; }

        /* Hero */
        .hero {
          background: linear-gradient(160deg, #091928 0%, #0d2137 60%, #0a3050 100%);
          padding: 70px 24px 60px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          top: -100px; ${isHe ? "right" : "left"}: -100px;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(100,223,223,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-inner { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }
        .hero-logo { font-size: 56px; font-weight: 900; color: #fff; letter-spacing: -2px; line-height: 1; margin-bottom: 8px; }
        .hero-logo span { color: #64dfdf; }
        .hero-tag { font-size: 15px; font-weight: 300; color: rgba(255,255,255,0.45); letter-spacing: 0.5px; margin-bottom: 20px; }
        .hero-desc { font-size: 18px; font-weight: 600; color: rgba(255,255,255,0.85); line-height: 1.6; margin-bottom: 36px; max-width: 480px; margin-left: auto; margin-right: auto; }
        .btn-cta {
          display: inline-block;
          background: #64dfdf;
          color: #0d2137;
          font-family: 'Rubik', sans-serif;
          font-size: 17px;
          font-weight: 800;
          padding: 16px 44px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          margin-bottom: 16px;
          box-shadow: 0 8px 32px rgba(100,223,223,0.3);
          transition: all 0.2s;
        }
        .btn-cta:hover { background: #4fd4d4; transform: translateY(-1px); }
        .btn-login {
          display: inline-block;
          background: transparent;
          color: rgba(255,255,255,0.5);
          font-family: 'Rubik', sans-serif;
          font-size: 14px;
          font-weight: 400;
          padding: 10px 24px;
          border-radius: 999px;
          border: 0.5px solid rgba(255,255,255,0.15);
          cursor: pointer;
          margin-${isHe ? "right" : "left"}: 12px;
          transition: all 0.2s;
        }
        .btn-login:hover { color: rgba(255,255,255,0.8); border-color: rgba(255,255,255,0.3); }
        .hero-btns { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

        /* Features */
        .section { max-width: 700px; margin: 0 auto; padding: 56px 24px; }
        .section-title { font-size: 26px; font-weight: 800; color: #fff; text-align: center; margin-bottom: 8px; letter-spacing: -0.5px; }
        .section-sub { font-size: 14px; color: rgba(255,255,255,0.35); text-align: center; margin-bottom: 36px; }

        .features { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 520px) { .features { grid-template-columns: 1fr; } }
        .feat {
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(100,223,223,0.12);
          border-radius: 18px;
          padding: 22px 20px;
          transition: all 0.2s;
        }
        .feat:hover { background: rgba(100,223,223,0.06); border-color: rgba(100,223,223,0.25); }
        .feat-icon { display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 14px; margin-bottom: 10px; }
        .feat-title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .feat-desc { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.6; }

        /* Divider */
        .divider { height: 0.5px; background: rgba(100,223,223,0.1); max-width: 700px; margin: 0 auto; }

        /* How it works */
        .steps { display: flex; flex-direction: column; gap: 16px; }
        .step { display: flex; align-items: flex-start; gap: 16px; }
        .step-num {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(100,223,223,0.12); border: 0.5px solid rgba(100,223,223,0.3);
          color: #64dfdf; font-size: 16px; font-weight: 800;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .step-text { padding-top: 6px; }
        .step-title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 3px; }
        .step-desc { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.5; }

        /* Testimonial/highlight band */
        .band {
          background: linear-gradient(135deg, rgba(100,223,223,0.08), rgba(100,223,223,0.03));
          border-top: 0.5px solid rgba(100,223,223,0.12);
          border-bottom: 0.5px solid rgba(100,223,223,0.12);
          padding: 40px 24px;
          text-align: center;
        }
        .band-text { font-size: 20px; font-weight: 700; color: #fff; max-width: 500px; margin: 0 auto; line-height: 1.6; }
        .band-text span { color: #64dfdf; }

        /* Plan & Blog teasers */
        .teaser-card {
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 14px 16px;
          text-decoration: none; color: inherit;
          display: block; transition: all 0.15s;
        }
        .teaser-card:hover {
          background: rgba(100,223,223,0.05);
          border-color: rgba(100,223,223,0.18);
        }
      `}</style>

      <div className="lp" style={{ direction: dir }}>

        <SiteNav />

        {/* Hero */}
        <div className="hero">
          <div className="hero-inner">
            <div className="hero-logo">TU<span>lon</span></div>
            <div className="hero-tag">{T.tag[lang]}</div>
            <div className="hero-desc">{T.desc[lang]}</div>
            <div className="hero-btns">
              <button className="btn-cta" onClick={() => router.push("/login")}>{T.ctaStart[lang]}</button>
              <button className="btn-login" onClick={() => router.push("/login")}>{T.ctaLogin[lang]}</button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="section">
          <div className="section-title">{T.featTitle[lang]}</div>
          <div className="section-sub">{T.featSub[lang]}</div>
          <div className="features">
            <div className="feat">
              <div className="feat-icon" style={{background:"rgba(100,223,223,0.12)",border:"0.5px solid rgba(100,223,223,0.25)"}}><Wallet size={22} color="#64dfdf" strokeWidth={1.5}/></div>
              <div className="feat-title">{T.feat1Title[lang]}</div>
              <div className="feat-desc">{T.feat1Desc[lang]}</div>
            </div>
            <div className="feat">
              <div className="feat-icon" style={{background:"rgba(129,140,248,0.12)",border:"0.5px solid rgba(129,140,248,0.25)"}}><Share2 size={22} color="#818cf8" strokeWidth={1.5}/></div>
              <div className="feat-title">{T.feat2Title[lang]}</div>
              <div className="feat-desc">{T.feat2Desc[lang]}</div>
            </div>
            <div className="feat">
              <div className="feat-icon" style={{background:"rgba(244,114,182,0.12)",border:"0.5px solid rgba(244,114,182,0.25)"}}><Calendar size={22} color="#f472b6" strokeWidth={1.5}/></div>
              <div className="feat-title">{T.feat3Title[lang]}</div>
              <div className="feat-desc">{T.feat3Desc[lang]}</div>
            </div>
            <div className="feat">
              <div className="feat-icon" style={{background:"rgba(251,191,36,0.12)",border:"0.5px solid rgba(251,191,36,0.25)"}}><Building2 size={22} color="#fbbf24" strokeWidth={1.5}/></div>
              <div className="feat-title">{T.feat4Title[lang]}</div>
              <div className="feat-desc">{T.feat4Desc[lang]}</div>
            </div>
            <div className="feat">
              <div className="feat-icon" style={{background:"rgba(74,222,128,0.12)",border:"0.5px solid rgba(74,222,128,0.25)"}}><Users size={22} color="#4ade80" strokeWidth={1.5}/></div>
              <div className="feat-title">{T.feat5Title[lang]}</div>
              <div className="feat-desc">{T.feat5Desc[lang]}</div>
            </div>
            <div className="feat">
              <div className="feat-icon" style={{background:"rgba(100,223,223,0.12)",border:"0.5px solid rgba(100,223,223,0.25)"}}><Backpack size={22} color="#64dfdf" strokeWidth={1.5}/></div>
              <div className="feat-title">{T.feat6Title[lang]}</div>
              <div className="feat-desc">{T.feat6Desc[lang]}</div>
            </div>
          </div>
        </div>

        {/* Band */}
        <div className="band">
          <div className="band-text">
            {T.band1[lang]}<br/>
            <span>{T.band2[lang]}</span>
          </div>
        </div>

        {/* How it works */}
        <div className="section">
          <div className="section-title">{T.howTitle[lang]}</div>
          <div className="section-sub">{T.howSub[lang]}</div>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <div className="step-text">
                <div className="step-title">{T.step1Title[lang]}</div>
                <div className="step-desc">{T.step1Desc[lang]}</div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div className="step-text">
                <div className="step-title">{T.step2Title[lang]}</div>
                <div className="step-desc">{T.step2Desc[lang]}</div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div className="step-text">
                <div className="step-title">{T.step3Title[lang]}</div>
                <div className="step-desc">{T.step3Desc[lang]}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="divider"/>

        {/* CTA bottom */}
        <div className="section" style={{textAlign:"center", paddingTop:40, paddingBottom:56}}>
          <div style={{fontSize:22, fontWeight:800, color:"#fff", marginBottom:10}}>{T.ctaReadyTitle[lang]}</div>
          <div style={{fontSize:14, color:"rgba(255,255,255,0.35)", marginBottom:28}}>{T.ctaReadySub[lang]}</div>
          <button className="btn-cta" onClick={() => router.push("/login")}>{T.ctaReadyBtn[lang]}</button>
        </div>

        {/* Plan teaser — full-width band */}
        <div style={{
          background:"linear-gradient(135deg,#0a2a44 0%,#0d3358 50%,#0a2a44 100%)",
          borderTop:"0.5px solid rgba(100,223,223,0.18)",
          borderBottom:"0.5px solid rgba(100,223,223,0.18)",
          padding:"44px 24px",
          textAlign:"center",
        }}>
          <div style={{maxWidth:600,margin:"0 auto"}}>
            {/* Icon row */}
            <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:20,flexWrap:"wrap"}}>
              {["✈️","🏨","🎡","📶"].map(e=>(
                <div key={e} style={{
                  width:44,height:44,borderRadius:12,
                  background:"rgba(100,223,223,0.1)",
                  border:"0.5px solid rgba(100,223,223,0.25)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:22,
                }}>
                  {e}
                </div>
              ))}
            </div>
            <div style={{fontSize:24,fontWeight:900,color:"#fff",lineHeight:1.3,marginBottom:12,letterSpacing:-0.5}}>
              {T.planTitle[lang]}
            </div>
            <div style={{fontSize:15,color:"rgba(255,255,255,0.5)",lineHeight:1.7,marginBottom:28,maxWidth:460,margin:"0 auto 28px"}}>
              {T.planSub[lang]}
            </div>
            <a href="/plan" style={{
              display:"inline-block",
              background:"#64dfdf",
              color:"#0d2137",
              fontFamily:"'Rubik',sans-serif",
              fontSize:17,fontWeight:900,
              padding:"16px 44px",borderRadius:999,
              textDecoration:"none",
              boxShadow:"0 8px 32px rgba(100,223,223,0.3)",
              letterSpacing:-0.3,
            }}>
              {T.planBtn[lang]} →
            </a>
          </div>
        </div>

        {/* Blog teaser */}
        <div className="divider"/>
        <div className="section" style={{paddingTop:40,paddingBottom:52}}>
          <div className="section-title">{T.blogTitle[lang]}</div>
          <div className="section-sub" style={{marginBottom:22}}>{T.blogSub[lang]}</div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:22}}>
            {[
              {slug:"thailand-kosher-anniversary-trip", emoji:"💑", title:T.blogPost1Title[lang]},
              {slug:"budget-travel",      emoji:"💰", title:T.blogPost2Title[lang]},
              {slug:"winter-destinations-2026", emoji:"❄️", title:T.blogPost3Title[lang]},
            ].map(p=>(
              <a key={p.slug} className="teaser-card" href={`/blog/${p.slug}`}>
                <span style={{fontSize:15}}>{p.emoji}</span>
                {" "}
                <span style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,0.7)"}}>{p.title}</span>
                <span style={{float:isHe?"left":"right",fontSize:12,color:"rgba(100,223,223,0.55)",fontWeight:600}}>↗</span>
              </a>
            ))}
          </div>
          <div style={{textAlign:"center"}}>
            <a href="/blog" style={{
              display:"inline-block",
              background:"transparent",
              border:"0.5px solid rgba(100,223,223,0.25)",
              color:"rgba(100,223,223,0.7)",
              fontFamily:"'Rubik',sans-serif",
              fontSize:13,fontWeight:700,
              padding:"9px 22px",borderRadius:999,
              textDecoration:"none",
            }}>
              {T.blogBtn[lang]} →
            </a>
          </div>
        </div>

        <SiteFooter />

      </div>
    </>
  );
}
