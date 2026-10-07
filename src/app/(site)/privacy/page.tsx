"use client";
import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";

type L = "he" | "en" | "es";

export default function PrivacyPage() {
  const { lang: appLang } = useLang();
  const [lang, setLang] = useState<L>(() => appLang as L);
  const dir = lang === "he" ? "rtl" : "ltr";
  const tr = (he: string, en: string, es: string) => lang === "he" ? he : lang === "es" ? es : en;

  return (
    <div style={{ minHeight: "100vh", background: "#0a1628", color: "#ffffff", fontFamily: "'Rubik',sans-serif", direction: dir }}>
      {/* Header */}
      <div style={{ background: "rgba(0,0,0,0.3)", borderBottom: "0.5px solid rgba(100,223,223,0.15)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ color: "#64dfdf", textDecoration: "none", fontWeight: 700, fontSize: 18 }}>
          {tr("← טיולון", "← TUlon", "← TUlon")}
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          {(["he","en","es"] as L[]).map(L => (
            <button key={L} onClick={() => setLang(L)} style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: lang === L ? "#64dfdf" : "rgba(255,255,255,0.08)", color: lang === L ? "#0a1628" : "#ffffff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              {L === "he" ? "עב" : L === "en" ? "EN" : "ES"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#64dfdf", marginBottom: 8 }}>
          {tr("מדיניות פרטיות", "Privacy Policy", "Política de privacidad")}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 40 }}>
          {tr("עודכן לאחרונה: מאי 2025", "Last updated: May 2025", "Última actualización: mayo de 2025")}
        </p>

        {lang === "he" ? <HeContent /> : lang === "es" ? <EsContent /> : <EnContent />}

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "0.5px solid rgba(255,255,255,0.1)", display: "flex", gap: 24, flexWrap: "wrap" }}>
          <Link href="/terms" style={{ color: "#64dfdf", fontSize: 13 }}>{tr("תנאי שימוש", "Terms of Service", "Términos de servicio")}</Link>
          <Link href="/contact" style={{ color: "#64dfdf", fontSize: 13 }}>{tr("צור קשר", "Contact", "Contacto")}</Link>
          <Link href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{tr("חזרה לאפליקציה", "Back to App", "Volver a la app")}</Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", marginBottom: 12, paddingBottom: 8, borderBottom: "0.5px solid rgba(100,223,223,0.2)" }}>{title}</h2>
      <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}

function HeContent() {
  return (
    <>
      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>
        טיולון (&quot;השירות&quot;, &quot;האפליקציה&quot;) מפעיל אתר האינטרנט tulon.app ואפליקציית מתכנן הטיולים. דף זה מסביר כיצד אנו אוספים, משתמשים ומגנים על המידע שלך.
      </p>

      <Section title="1. מידע שאנו אוספים">
        <p><strong style={{ color: "#ffffff" }}>פרטי חשבון:</strong> כתובת אימייל וסיסמה מוצפנת, המשמשים לצורך הזדהות בלבד.</p>
        <p style={{ marginTop: 8 }}><strong style={{ color: "#ffffff" }}>נתוני טיול:</strong> יעדים, תאריכים, הוצאות, פעילויות ופרטי משתתפים שאתה מזין באפליקציה.</p>
        <p style={{ marginTop: 8 }}><strong style={{ color: "#ffffff" }}>תמונות קבלות:</strong> תמונות שתבחר לסרוק מועברות לשרת לצורך עיבוד ואינן נשמרות.</p>
        <p style={{ marginTop: 8 }}><strong style={{ color: "#ffffff" }}>התראות:</strong> אם תאשר, נשמר token להתראות push. לא נשלח ספאם.</p>
      </Section>

      <Section title="2. כיצד אנו משתמשים במידע">
        <ul style={{ paddingRight: 20, margin: 0 }}>
          <li>הפעלת השירות, שמירה וסנכרון נתוני הטיול שלך</li>
          <li>שיתוף טיול עם משתתפים שהזמנת</li>
          <li>שליחת תזכורות טיסה שביקשת</li>
          <li>המלצות מבוססות AI על יעד הטיול (ללא שמירת השיחה)</li>
        </ul>
        <p style={{ marginTop: 12 }}>אנחנו <strong style={{ color: "#ffffff" }}>לא מוכרים, לא משתפים ולא מסחרים</strong> את המידע שלך עם צדדים שלישיים.</p>
      </Section>

      <Section title="3. אחסון ואבטחה">
        <p>המידע מאוחסן ב-<strong style={{ color: "#ffffff" }}>Google Firebase</strong> עם הצפנה בתעבורה ובאחסון. הגישה מוגנת בחשבון המשתמש שלך בלבד.</p>
        <p style={{ marginTop: 8 }}>עיבוד תמונות קבלות מבוצע דרך <strong style={{ color: "#ffffff" }}>Anthropic API</strong> — התמונה מועברת לעיבוד בלבד ואינה נשמרת על שרתינו או שרתי Anthropic.</p>
      </Section>

      <Section title="4. שיתוף נתונים">
        <p>הנתונים שלך לא משותפים עם צדדים שלישיים, למעט:</p>
        <ul style={{ paddingRight: 20, margin: "8px 0 0" }}>
          <li><strong style={{ color: "#ffffff" }}>Google Firebase</strong> — תשתית האחסון</li>
          <li><strong style={{ color: "#ffffff" }}>Anthropic</strong> — עיבוד תמונות קבלות והמלצות בלבד</li>
          <li><strong style={{ color: "#ffffff" }}>Vercel</strong> — אירוח האפליקציה</li>
          <li>משתמשים שבחרת לשתף איתם טיול ספציפי</li>
        </ul>
      </Section>

      <Section title="5. זכויות המשתמש">
        <p>בכל עת תוכל:</p>
        <ul style={{ paddingRight: 20, margin: "8px 0 0" }}>
          <li>לצפות ולערוך את כל המידע שלך ישירות באפליקציה</li>
          <li>למחוק טיולים והוצאות</li>
          <li>לבקש מחיקת חשבונך המלאה בפנייה אלינו</li>
          <li>לבטל הרשמה לתזכורות push בכל עת</li>
        </ul>
      </Section>

      <Section title="6. קובצי Cookie ואחסון מקומי">
        <p>האפליקציה משתמשת ב-localStorage לשמירת העדפות שפה בלבד. אנחנו לא משתמשים ב-cookies למעקב.</p>
      </Section>

      <Section title="7. ילדים">
        <p>השירות אינו מיועד לילדים מתחת לגיל 13. איננו אוספים ביודעין מידע מקטינים.</p>
      </Section>

      <Section title="8. שינויים במדיניות">
        <p>שינויים מהותיים יפורסמו באפליקציה. המשך השימוש לאחר הפרסום מהווה הסכמה למדיניות המעודכנת.</p>
      </Section>

      <Section title="9. יצירת קשר">
        <p>לכל שאלה בנוגע לפרטיות: <a href="mailto:contact@tulon.app" style={{ color: "#64dfdf" }}>contact@tulon.app</a></p>
      </Section>
    </>
  );
}

function EnContent() {
  return (
    <>
      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>
        TUlon (&quot;the Service&quot;, &quot;the App&quot;) operates tulon.app and the TUlon trip planner application. This page explains how we collect, use, and protect your information.
      </p>

      <Section title="1. Information We Collect">
        <p><strong style={{ color: "#ffffff" }}>Account details:</strong> Email address and encrypted password, used solely for authentication.</p>
        <p style={{ marginTop: 8 }}><strong style={{ color: "#ffffff" }}>Trip data:</strong> Destinations, dates, expenses, activities, and participant details you enter in the app.</p>
        <p style={{ marginTop: 8 }}><strong style={{ color: "#ffffff" }}>Receipt images:</strong> Photos you choose to scan are sent to the server for processing only and are not stored.</p>
        <p style={{ marginTop: 8 }}><strong style={{ color: "#ffffff" }}>Notifications:</strong> If you consent, we store a push notification token. We do not send spam.</p>
      </Section>

      <Section title="2. How We Use Your Information">
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>Operating the service, saving and syncing your trip data</li>
          <li>Sharing a trip with participants you invite</li>
          <li>Sending flight reminders you requested</li>
          <li>AI-based recommendations for your destination (conversations are not stored)</li>
        </ul>
        <p style={{ marginTop: 12 }}>We <strong style={{ color: "#ffffff" }}>do not sell, share, or commercialize</strong> your data with third parties.</p>
      </Section>

      <Section title="3. Storage & Security">
        <p>Data is stored on <strong style={{ color: "#ffffff" }}>Google Firebase</strong> with encryption in transit and at rest. Access is protected by your user account only.</p>
        <p style={{ marginTop: 8 }}>Receipt image processing is handled via <strong style={{ color: "#ffffff" }}>Anthropic API</strong> — images are transferred for processing only and are not stored on our servers or Anthropic&apos;s servers.</p>
      </Section>

      <Section title="4. Data Sharing">
        <p>Your data is not shared with third parties, except:</p>
        <ul style={{ paddingLeft: 20, margin: "8px 0 0" }}>
          <li><strong style={{ color: "#ffffff" }}>Google Firebase</strong> — storage infrastructure</li>
          <li><strong style={{ color: "#ffffff" }}>Anthropic</strong> — receipt processing and recommendations only</li>
          <li><strong style={{ color: "#ffffff" }}>Vercel</strong> — app hosting</li>
          <li>Users you explicitly chose to share a specific trip with</li>
        </ul>
      </Section>

      <Section title="5. Your Rights">
        <p>At any time you may:</p>
        <ul style={{ paddingLeft: 20, margin: "8px 0 0" }}>
          <li>View and edit all your data directly in the app</li>
          <li>Delete trips and expenses</li>
          <li>Request full account deletion by contacting us</li>
          <li>Unsubscribe from push notifications at any time</li>
        </ul>
      </Section>

      <Section title="6. Cookies & Local Storage">
        <p>The app uses localStorage to save language preferences only. We do not use tracking cookies.</p>
      </Section>

      <Section title="7. Children">
        <p>The service is not intended for children under 13. We do not knowingly collect information from minors.</p>
      </Section>

      <Section title="8. Policy Changes">
        <p>Material changes will be announced in the app. Continued use after publication constitutes acceptance of the updated policy.</p>
      </Section>

      <Section title="9. Contact">
        <p>For any privacy questions: <a href="mailto:contact@tulon.app" style={{ color: "#64dfdf" }}>contact@tulon.app</a></p>
      </Section>
    </>
  );
}

function EsContent() {
  return (
    <>
      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>
        TUlon (&quot;el Servicio&quot;, &quot;la App&quot;) opera tulon.app y la aplicación planificadora de viajes TUlon. Esta página explica cómo recopilamos, usamos y protegemos tu información.
      </p>

      <Section title="1. Información que recopilamos">
        <p><strong style={{ color: "#ffffff" }}>Datos de la cuenta:</strong> Dirección de correo electrónico y contraseña cifrada, utilizadas únicamente para la autenticación.</p>
        <p style={{ marginTop: 8 }}><strong style={{ color: "#ffffff" }}>Datos del viaje:</strong> Destinos, fechas, gastos, actividades y datos de participantes que introduces en la app.</p>
        <p style={{ marginTop: 8 }}><strong style={{ color: "#ffffff" }}>Imágenes de recibos:</strong> Las fotos que decides escanear se envían al servidor solo para su procesamiento y no se almacenan.</p>
        <p style={{ marginTop: 8 }}><strong style={{ color: "#ffffff" }}>Notificaciones:</strong> Si lo consientes, almacenamos un token de notificación push. No enviamos spam.</p>
      </Section>

      <Section title="2. Cómo usamos tu información">
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>Operar el servicio, guardar y sincronizar los datos de tu viaje</li>
          <li>Compartir un viaje con los participantes que invitas</li>
          <li>Enviar recordatorios de vuelo que solicitaste</li>
          <li>Recomendaciones basadas en IA para tu destino (las conversaciones no se almacenan)</li>
        </ul>
        <p style={{ marginTop: 12 }}><strong style={{ color: "#ffffff" }}>No vendemos, compartimos ni comercializamos</strong> tus datos con terceros.</p>
      </Section>

      <Section title="3. Almacenamiento y seguridad">
        <p>Los datos se almacenan en <strong style={{ color: "#ffffff" }}>Google Firebase</strong> con cifrado en tránsito y en reposo. El acceso está protegido únicamente por tu cuenta de usuario.</p>
        <p style={{ marginTop: 8 }}>El procesamiento de imágenes de recibos se realiza a través de la <strong style={{ color: "#ffffff" }}>API de Anthropic</strong> — las imágenes se transfieren solo para su procesamiento y no se almacenan en nuestros servidores ni en los de Anthropic.</p>
      </Section>

      <Section title="4. Compartir datos">
        <p>Tus datos no se comparten con terceros, excepto:</p>
        <ul style={{ paddingLeft: 20, margin: "8px 0 0" }}>
          <li><strong style={{ color: "#ffffff" }}>Google Firebase</strong> — infraestructura de almacenamiento</li>
          <li><strong style={{ color: "#ffffff" }}>Anthropic</strong> — procesamiento de recibos y recomendaciones solamente</li>
          <li><strong style={{ color: "#ffffff" }}>Vercel</strong> — alojamiento de la app</li>
          <li>Usuarios con los que decides compartir explícitamente un viaje específico</li>
        </ul>
      </Section>

      <Section title="5. Tus derechos">
        <p>En cualquier momento puedes:</p>
        <ul style={{ paddingLeft: 20, margin: "8px 0 0" }}>
          <li>Ver y editar todos tus datos directamente en la app</li>
          <li>Eliminar viajes y gastos</li>
          <li>Solicitar la eliminación completa de tu cuenta contactándonos</li>
          <li>Cancelar la suscripción a las notificaciones push en cualquier momento</li>
        </ul>
      </Section>

      <Section title="6. Cookies y almacenamiento local">
        <p>La app utiliza localStorage únicamente para guardar las preferencias de idioma. No utilizamos cookies de seguimiento.</p>
      </Section>

      <Section title="7. Menores">
        <p>El servicio no está dirigido a menores de 13 años. No recopilamos información de menores de forma consciente.</p>
      </Section>

      <Section title="8. Cambios en la política">
        <p>Los cambios importantes se anunciarán en la app. El uso continuado tras la publicación constituye la aceptación de la política actualizada.</p>
      </Section>

      <Section title="9. Contacto">
        <p>Para cualquier consulta sobre privacidad: <a href="mailto:contact@tulon.app" style={{ color: "#64dfdf" }}>contact@tulon.app</a></p>
      </Section>
    </>
  );
}
