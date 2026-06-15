"use client";
import { useState } from "react";
import { useLang } from "@/lib/LangContext";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const T = {
  heroTitle: {
    he: "תוכנית השותפים של טיולון",
    en: "Tulon Partner Program",
    es: "Programa de Socios de Tulon",
  },
  heroSub: {
    he: "שתפו את האפליקציה — ותרוויחו מכל הזמנה",
    en: "Share the app — earn from every booking",
    es: "Comparte la app — gana con cada reserva",
  },

  howTitle: { he: "איך זה עובד?", en: "How It Works", es: "Cómo Funciona" },
  step1: {
    he: "מקבלים קישור אישי בפורמט tulon.app/?ref=הקוד-שלך",
    en: "You get a personal link in the format tulon.app/?ref=YOUR_CODE",
    es: "Recibes un enlace personal con el formato tulon.app/?ref=TU_CODIGO",
  },
  step2: {
    he: "כל מי שנכנס דרך הקישור משויך אליכם ל-90 יום",
    en: "Anyone landing through your link is attributed to you for 90 days",
    es: "Cualquiera que entre por tu enlace queda asociado a ti durante 90 días",
  },
  step3: {
    he: "כשהמשתמש מזמין טיסה, מלון, אטרקציה או eSIM דרך האפליקציה — אתם מקבלים אחוז",
    en: "When the user books a flight, hotel, activity or eSIM through the app — you earn a commission",
    es: "Cuando el usuario reserva un vuelo, hotel, actividad o eSIM en la app — recibes una comisión",
  },

  benefitsTitle: { he: "מה מקבלים?", en: "What You Get", es: "Qué Recibes" },
  benefit1: { he: "אחוז מכל הזמנה ששותפים בה", en: "A cut of every qualifying booking", es: "Un porcentaje de cada reserva calificada" },
  benefit2: { he: "האפליקציה נשארת חינמית למשתמש שלכם", en: "The app stays free for your users", es: "La app sigue siendo gratuita para tu audiencia" },
  benefit3: { he: "דשבורד דרך Travelpayouts לראות סטטיסטיקות", en: "A Travelpayouts dashboard to track stats", es: "Panel de Travelpayouts para ver estadísticas" },
  benefit4: { he: "תשלום ישיר ל-PayPal או העברה בנקאית", en: "Direct payout via PayPal or wire transfer", es: "Pago directo por PayPal o transferencia bancaria" },

  whoTitle: { he: "מי מתאים?", en: "Who Is This For", es: "Para Quién" },
  who1: { he: "משפיענים בתחום הטיולים", en: "Travel influencers", es: "Influencers de viajes" },
  who2: { he: "בלוגרים ויוצרי תוכן", en: "Bloggers and content creators", es: "Bloggers y creadores de contenido" },
  who3: { he: "סוכני נסיעות ויועצים", en: "Travel agents and consultants", es: "Agentes y asesores de viajes" },
  who4: { he: "מנהלי קהילות מטיילים", en: "Travel community managers", es: "Administradores de comunidades de viajes" },

  ctaTitle: { he: "מעוניינים להצטרף?", en: "Want to Join?", es: "¿Quieres Unirte?" },
  ctaBody: {
    he: "מלאו את הטופס וניצור איתכם קשר תוך כמה ימים עם קוד אישי.",
    en: "Fill out the form and we'll get back to you within a few days with a personal code.",
    es: "Completa el formulario y te responderemos en pocos días con un código personal.",
  },

  fName:    { he: "שם",                  en: "Name",                  es: "Nombre" },
  fEmail:   { he: "אימייל",               en: "Email",                 es: "Correo" },
  fAud:     { he: "איפה אתם מפרסמים? (אופציונלי)", en: "Where do you publish? (optional)", es: "¿Dónde publicas? (opcional)" },
  fAudPh:   { he: "אינסטגרם, יוטיוב, בלוג, קהילה...", en: "Instagram, YouTube, blog, community...", es: "Instagram, YouTube, blog, comunidad..." },
  fMsg:     { he: "ספרו לנו עליכם", en: "Tell us about yourself", es: "Cuéntanos sobre ti" },
  fMsgPh:   { he: "כמה עוקבים, סוג התוכן, למה כדאי שנעבוד יחד...", en: "Audience size, content type, why we should work together...", es: "Tamaño de audiencia, tipo de contenido, por qué deberíamos trabajar juntos..." },
  send:     { he: "שלח", en: "Send", es: "Enviar" },
  sending:  { he: "שולח...", en: "Sending...", es: "Enviando..." },
  ok:       { he: "תודה! נחזור אליכם בקרוב.", en: "Thanks! We'll be in touch soon.", es: "¡Gracias! Te contactaremos pronto." },
  err:      { he: "אופס, משהו השתבש. נסו שוב או שלחו מייל ל-contact@tulon.app", en: "Oops, something went wrong. Try again or email contact@tulon.app", es: "Ups, algo salió mal. Inténtalo de nuevo o escribe a contact@tulon.app" },
} as const;

export default function PartnerPage() {
  const { lang } = useLang();
  const isHe = lang === "he";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [audience, setAudience] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle"|"sending"|"ok"|"err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setState("sending");
    try {
      const res = await fetch("/api/partner-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, audience, message }),
      });
      setState(res.ok ? "ok" : "err");
    } catch { setState("err"); }
  }

  const steps = [T.step1[lang], T.step2[lang], T.step3[lang]];
  const benefits = [T.benefit1[lang], T.benefit2[lang], T.benefit3[lang], T.benefit4[lang]];
  const who = [T.who1[lang], T.who2[lang], T.who3[lang], T.who4[lang]];

  const inputStyle: React.CSSProperties = {
    width:"100%",padding:"12px 14px",borderRadius:12,
    border:"0.5px solid rgba(255,255,255,0.12)",
    background:"rgba(255,255,255,0.04)",color:"#fff",
    fontFamily:"'Rubik',sans-serif",fontSize:14,outline:"none",
  };
  const labelStyle: React.CSSProperties = {
    display:"block",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.55)",
    letterSpacing:"0.6px",textTransform:"uppercase",marginBottom:7,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Rubik', sans-serif; background: #0d2137; }
        .partner-input:focus { border-color: #64dfdf !important; background: rgba(100,223,223,0.06) !important; }
      `}</style>
      <div style={{fontFamily:"'Rubik',sans-serif",background:"#0d2137",color:"#fff",minHeight:"100vh"}} dir={isHe?"rtl":"ltr"}>
        <SiteNav />

        {/* Hero */}
        <div style={{
          background:"linear-gradient(160deg,#091928 0%,#0d2137 60%,#0a3050 100%)",
          padding:"56px 24px 48px",textAlign:"center",
        }}>
          <div style={{maxWidth:560,margin:"0 auto"}}>
            <div style={{
              display:"inline-block",
              padding:"6px 14px",borderRadius:999,
              background:"rgba(100,223,223,0.1)",
              border:"0.5px solid rgba(100,223,223,0.3)",
              color:"#64dfdf",fontSize:11,fontWeight:800,letterSpacing:1,
              textTransform:"uppercase",marginBottom:18,
            }}>
              Partners
            </div>
            <div style={{fontSize:32,fontWeight:900,color:"#fff",lineHeight:1.2,marginBottom:12,letterSpacing:-0.5}}>
              {T.heroTitle[lang]}
            </div>
            <div style={{fontSize:16,color:"rgba(255,255,255,0.5)",lineHeight:1.6}}>
              {T.heroSub[lang]}
            </div>
          </div>
        </div>

        <div style={{maxWidth:680,margin:"0 auto",padding:"48px 24px 60px"}}>

          {/* How */}
          <Section title={T.howTitle[lang]}>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {steps.map((s,i)=>(
                <div key={i} style={{
                  display:"flex",alignItems:"flex-start",gap:14,
                  background:"rgba(255,255,255,0.03)",
                  border:"0.5px solid rgba(255,255,255,0.07)",
                  borderRadius:12,padding:"16px 18px",
                }}>
                  <div style={{
                    width:30,height:30,borderRadius:10,flexShrink:0,
                    background:"rgba(100,223,223,0.12)",
                    border:"0.5px solid rgba(100,223,223,0.3)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:13,fontWeight:800,color:"#64dfdf",
                  }}>{i+1}</div>
                  <span style={{fontSize:14.5,color:"rgba(255,255,255,0.7)",lineHeight:1.6,paddingTop:5}}>{s}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Benefits */}
          <Section title={T.benefitsTitle[lang]}>
            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",
              gap:10,
            }}>
              {benefits.map((b,i)=>(
                <div key={i} style={{
                  background:"linear-gradient(135deg,rgba(100,223,223,0.08),rgba(100,223,223,0.03))",
                  border:"0.5px solid rgba(100,223,223,0.2)",
                  borderRadius:14,padding:"16px 18px",
                  fontSize:14,color:"rgba(255,255,255,0.75)",lineHeight:1.55,fontWeight:600,
                }}>
                  {b}
                </div>
              ))}
            </div>
          </Section>

          {/* Who */}
          <Section title={T.whoTitle[lang]}>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {who.map((w,i)=>(
                <div key={i} style={{
                  padding:"9px 14px",borderRadius:999,
                  background:"rgba(255,255,255,0.04)",
                  border:"0.5px solid rgba(255,255,255,0.1)",
                  fontSize:13,color:"rgba(255,255,255,0.6)",fontWeight:500,
                }}>
                  {w}
                </div>
              ))}
            </div>
          </Section>

          {/* CTA — form */}
          <Section title={T.ctaTitle[lang]}>
            <p style={{fontSize:15,color:"rgba(255,255,255,0.55)",lineHeight:1.7,marginBottom:22}}>
              {T.ctaBody[lang]}
            </p>

            {state==="ok"?(
              <div style={{
                padding:"22px 24px",borderRadius:14,
                background:"rgba(74,222,128,0.08)",
                border:"0.5px solid rgba(74,222,128,0.35)",
                color:"#bbf7d0",fontSize:15,fontWeight:700,textAlign:"center",
              }}>
                ✓ {T.ok[lang]}
              </div>
            ):(
              <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:14}}>
                <div>
                  <label style={labelStyle}>{T.fName[lang]}</label>
                  <input className="partner-input" required value={name} onChange={e=>setName(e.target.value)} style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>{T.fEmail[lang]}</label>
                  <input className="partner-input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>{T.fAud[lang]}</label>
                  <input className="partner-input" value={audience} onChange={e=>setAudience(e.target.value)} placeholder={T.fAudPh[lang]} style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>{T.fMsg[lang]}</label>
                  <textarea className="partner-input" required value={message} onChange={e=>setMessage(e.target.value)} placeholder={T.fMsgPh[lang]}
                    rows={4} style={{...inputStyle,resize:"vertical",minHeight:100}}/>
                </div>

                {state==="err"&&(
                  <div style={{
                    padding:"10px 14px",borderRadius:10,
                    background:"rgba(255,107,107,0.08)",
                    border:"0.5px solid rgba(255,107,107,0.3)",
                    color:"#fca5a5",fontSize:13,
                  }}>{T.err[lang]}</div>
                )}

                <button type="submit" disabled={state==="sending"} style={{
                  marginTop:6,padding:"13px 32px",borderRadius:999,border:"none",
                  background:state==="sending"?"rgba(100,223,223,0.4)":"#64dfdf",
                  color:"#0d2137",fontFamily:"'Rubik',sans-serif",
                  fontSize:15,fontWeight:800,cursor:state==="sending"?"default":"pointer",
                  alignSelf:"flex-start",
                }}>
                  {state==="sending"?T.sending[lang]:T.send[lang]}
                </button>
              </form>
            )}
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
