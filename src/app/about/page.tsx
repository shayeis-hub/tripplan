"use client";
import { useLang } from "@/lib/LangContext";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const T = {
  heroTitle: {
    he: "אודות טיולון",
    en: "About Tulon",
    es: "Sobre Tulon",
  },
  heroSub: {
    he: "המסע שמאחורי האפליקציה",
    en: "The journey behind the app",
    es: "El viaje detrás de la app",
  },

  whyTitle: { he: "למה בנינו את זה?", en: "Why Did We Build This?", es: "¿Por Qué Lo Construimos?" },
  whyBody: {
    he: "כל מי שטייל עם קבוצה מכיר את הכאב: ה'שיחת הוואטסאפ עם הצילומי מסך של ה-Excel', מי שילם מה, מי חייב כמה, ואיך לא שוכחים אף פעילות. טיולון נולדה מהרצון לפתור בדיוק את הכאבים האלה — ולעשות את תכנון הטיול כיפי, ולא מעיק.",
    en: "Anyone who has traveled with a group knows the pain: the 'WhatsApp chat with Excel screenshots,' who paid what, who owes how much, and how not to forget any activity. Tulon was born from the desire to solve exactly these pain points — and make trip planning fun, not stressful.",
    es: "Cualquiera que haya viajado con un grupo conoce el dolor: el 'chat de WhatsApp con capturas de pantalla de Excel', quién pagó qué, quién debe cuánto, y cómo no olvidar ninguna actividad. Tulon nació del deseo de resolver exactamente estos puntos de dolor — y hacer que planificar viajes sea divertido, no estresante.",
  },

  missionTitle: { he: "המשימה שלנו", en: "Our Mission", es: "Nuestra Misión" },
  missionBody: {
    he: "לתת לכל קבוצת מטיילים — משפחה, חברים, זוג — כלי חינמי, פשוט וחזק שיהפוך את תכנון הטיול מטרחה לחלק מהחוויה.",
    en: "To give every group of travelers — family, friends, couples — a free, simple and powerful tool that transforms trip planning from a chore into part of the experience.",
    es: "Dar a cada grupo de viajeros — familia, amigos, parejas — una herramienta gratuita, sencilla y poderosa que transforma la planificación de viajes de una tarea en parte de la experiencia.",
  },

  valuesTitle: { he: "הערכים שלנו", en: "Our Values", es: "Nuestros Valores" },
  val1: { he: "פשטות — תיכנון טיולים לא צריך להיות מסובך", en: "Simplicity — trip planning shouldn't be complicated", es: "Simplicidad — planificar viajes no debería ser complicado" },
  val2: { he: "שקיפות — כל ההוצאות גלויות לכולם", en: "Transparency — all expenses visible to everyone", es: "Transparencia — todos los gastos visibles para todos" },
  val3: { he: "חינמיות — ללא תשלום, ללא פרימיום, ללא הגבלות", en: "Free forever — no payment, no premium, no limits", es: "Gratis para siempre — sin pago, sin premium, sin límites" },
  val4: { he: "פרטיות — הנתונים שלכם שייכים רק לכם", en: "Privacy — your data belongs only to you", es: "Privacidad — tus datos pertenecen solo a ti" },

  techTitle: { he: "הטכנולוגיה", en: "The Technology", es: "La Tecnología" },
  techBody: {
    he: "טיולון בנויה כ-Progressive Web App (PWA) — אפליקציה שעובדת ישירות בדפדפן, גם ללא חיבור לאינטרנט, בכל מכשיר. אנחנו משתמשים ב-Firebase לסנכרון נתונים בזמן אמת בין כל חברי הטיול.",
    en: "Tulon is built as a Progressive Web App (PWA) — an app that works directly in the browser, even offline, on any device. We use Firebase for real-time data synchronization between all trip members.",
    es: "Tulon está construida como Progressive Web App (PWA) — una app que funciona directamente en el navegador, incluso sin conexión, en cualquier dispositivo. Usamos Firebase para la sincronización de datos en tiempo real entre todos los miembros del viaje.",
  },

  contactTitle: { he: "צור קשר", en: "Contact Us", es: "Contáctanos" },
  contactBody: {
    he: "יש לכם שאלות, הצעות, או פידבק? נשמח לשמוע מכם.",
    en: "Have questions, suggestions, or feedback? We'd love to hear from you.",
    es: "¿Tienes preguntas, sugerencias o comentarios? Nos encantaría escucharte.",
  },
  contactBtn: { he: "כתבו לנו", en: "Write to Us", es: "Escríbenos" },
} as const;

export default function AboutPage() {
  const { lang } = useLang();
  const isHe = lang === "he";

  const values = [T.val1[lang], T.val2[lang], T.val3[lang], T.val4[lang]];

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
          <div style={{maxWidth:500,margin:"0 auto"}}>
            <div style={{fontSize:30,fontWeight:900,color:"#fff",lineHeight:1.25,marginBottom:10,letterSpacing:-0.5}}>
              {T.heroTitle[lang]}
            </div>
            <div style={{fontSize:15,color:"rgba(255,255,255,0.4)",lineHeight:1.6}}>
              {T.heroSub[lang]}
            </div>
          </div>
        </div>

        <div style={{maxWidth:680,margin:"0 auto",padding:"48px 24px 60px"}}>

          {/* Why */}
          <Section title={T.whyTitle[lang]}>
            <p style={{fontSize:15,color:"rgba(255,255,255,0.6)",lineHeight:1.8}}>
              {T.whyBody[lang]}
            </p>
          </Section>

          {/* Mission */}
          <Section title={T.missionTitle[lang]}>
            <div style={{
              background:"linear-gradient(135deg,rgba(100,223,223,0.08),rgba(100,223,223,0.03))",
              border:"0.5px solid rgba(100,223,223,0.2)",
              borderRadius:16,padding:"20px 22px",
            }}>
              <p style={{fontSize:16,fontWeight:600,color:"rgba(255,255,255,0.8)",lineHeight:1.7}}>
                {T.missionBody[lang]}
              </p>
            </div>
          </Section>

          {/* Values */}
          <Section title={T.valuesTitle[lang]}>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {values.map((v, i) => (
                <div key={i} style={{
                  display:"flex",alignItems:"flex-start",gap:12,
                  background:"rgba(255,255,255,0.03)",
                  border:"0.5px solid rgba(255,255,255,0.07)",
                  borderRadius:12,padding:"14px 18px",
                }}>
                  <div style={{
                    width:28,height:28,borderRadius:8,flexShrink:0,
                    background:"rgba(100,223,223,0.12)",border:"0.5px solid rgba(100,223,223,0.25)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:12,fontWeight:800,color:"#64dfdf",
                  }}>{i+1}</div>
                  <span style={{fontSize:14,color:"rgba(255,255,255,0.6)",lineHeight:1.6,paddingTop:4}}>{v}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Tech */}
          <Section title={T.techTitle[lang]}>
            <p style={{fontSize:15,color:"rgba(255,255,255,0.55)",lineHeight:1.8}}>
              {T.techBody[lang]}
            </p>
          </Section>

          {/* Contact */}
          <Section title={T.contactTitle[lang]}>
            <p style={{fontSize:15,color:"rgba(255,255,255,0.55)",lineHeight:1.7,marginBottom:20}}>
              {T.contactBody[lang]}
            </p>
            <a href="/contact" style={{
              display:"inline-block",
              background:"#64dfdf",color:"#0d2137",
              fontFamily:"'Rubik',sans-serif",
              fontSize:15,fontWeight:800,
              padding:"12px 30px",borderRadius:999,
              textDecoration:"none",
            }}>
              {T.contactBtn[lang]} →
            </a>
          </Section>

        </div>

        <SiteFooter />
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{marginBottom:44}}>
      <h2 style={{fontSize:21,fontWeight:800,color:"#fff",marginBottom:16,letterSpacing:-0.3}}>
        {title}
      </h2>
      {children}
    </div>
  );
}
