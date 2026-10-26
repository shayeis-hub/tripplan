import type { EmailLang } from "./constants";

// The welcome e-mail in three languages. One goal: get the person to open TUlon
// and create the first trip. No feature list. Plain text and HTML carry the same
// words; the HTML is inline-styled tables (what mail clients render reliably).

interface Copy {
  subject: string;
  preheader: string;
  hiNamed: (name: string) => string;
  hi: string;
  p1: string;
  p2: string;
  p3: string;
  cta: string;
  signoff: string;
  team: string;
  why: string;
  unsubscribe: string;
}

const COPY: Record<EmailLang, Copy> = {
  he: {
    subject: "ברוכים הבאים לטיולון",
    preheader: "בוחרים יעד, מוסיפים תאריכים ומתחילים לרכז את התכנון במקום אחד.",
    hiNamed: (n) => `היי ${n},`,
    hi: "היי,",
    p1: "ברוכים הבאים לטיולון.",
    p2: "הטיול הבא מתחיל ביצירת טיול חדש: בוחרים יעד, מוסיפים תאריכים ומתחילים לרכז את התכנון במקום אחד.",
    p3: "אחרי שהטיול נוצר אפשר להוסיף פעילויות, לנהל תקציב והוצאות ולשתף אותו עם מי שנוסע איתך.",
    cta: "יצירת הטיול הראשון שלי",
    signoff: "נסיעה טובה,",
    team: "צוות טיולון",
    why: "קיבלתם את המייל הזה כי נרשמתם לטיולון.",
    unsubscribe: "להפסקת קבלת מיילים מטיולון",
  },
  en: {
    subject: "Welcome to TUlon",
    preheader: "Pick a destination, add your dates and start planning in one place.",
    hiNamed: (n) => `Hi ${n},`,
    hi: "Hi,",
    p1: "Welcome to TUlon.",
    p2: "Your next trip starts with creating a new one: pick a destination, add your dates and start bringing the plan together in one place.",
    p3: "Once it's created, you can add activities, manage your budget and expenses, and share the trip with the people traveling with you.",
    cta: "Create my first trip",
    signoff: "Happy travels,",
    team: "The TUlon team",
    why: "You're receiving this email because you signed up for TUlon.",
    unsubscribe: "Stop receiving emails from TUlon",
  },
  es: {
    subject: "Te damos la bienvenida a TUlon",
    preheader: "Elige un destino, añade las fechas y empieza a reunir el plan en un solo lugar.",
    hiNamed: (n) => `Hola ${n},`,
    hi: "Hola,",
    p1: "Te damos la bienvenida a TUlon.",
    p2: "Tu próximo viaje empieza creando uno nuevo: elige un destino, añade las fechas y empieza a reunir todo el plan en un solo lugar.",
    p3: "Cuando esté creado, podrás añadir actividades, gestionar el presupuesto y los gastos, y compartir el viaje con quienes viajan contigo.",
    cta: "Crear mi primer viaje",
    signoff: "¡Buen viaje!",
    team: "El equipo de TUlon",
    why: "Recibes este correo porque te registraste en TUlon.",
    unsubscribe: "Dejar de recibir correos de TUlon",
  },
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

export interface WelcomeInput {
  lang: EmailLang;
  firstName: string | null;
  ctaUrl: string;
  unsubscribeUrl: string;
}

export interface Rendered {
  subject: string;
  html: string;
  text: string;
}

export function renderWelcome({ lang, firstName, ctaUrl, unsubscribeUrl }: WelcomeInput): Rendered {
  const c = COPY[lang];
  const rtl = lang === "he";
  const dir = rtl ? "rtl" : "ltr";
  const align = rtl ? "right" : "left";
  const greeting = firstName ? c.hiNamed(firstName) : c.hi;
  const font = "Arial,'Segoe UI',Helvetica,sans-serif";

  const text = [
    greeting,
    "",
    c.p1,
    "",
    c.p2,
    "",
    c.p3,
    "",
    `${c.cta}: ${ctaUrl}`,
    "",
    c.signoff,
    c.team,
    "",
    "--",
    c.why,
    `${c.unsubscribe}: ${unsubscribeUrl}`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(c.subject)}</title>
</head>
<body dir="ltr" style="margin:0;padding:0;background:#eef3f6;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#eef3f6;">${esc(c.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef3f6;">
<tr><td align="center" style="padding:28px 14px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#ffffff;border-radius:16px;">
<tr><td dir="${dir}" align="${align}" style="padding:28px 28px 8px 28px;font-family:${font};">
<span style="font-size:26px;font-weight:900;letter-spacing:-0.5px;color:#0d2137;">TU<span style="color:#1aa7a7;">lon</span></span>
</td></tr>
<tr><td dir="${dir}" align="${align}" style="padding:12px 28px 4px 28px;font-family:${font};font-size:16px;line-height:1.7;color:#1b2f40;text-align:${align};">
<p style="margin:0 0 14px 0;">${esc(greeting)}</p>
<p style="margin:0 0 14px 0;font-weight:700;">${esc(c.p1)}</p>
<p style="margin:0 0 14px 0;">${esc(c.p2)}</p>
<p style="margin:0 0 22px 0;">${esc(c.p3)}</p>
</td></tr>
<tr><td dir="${dir}" align="${align}" style="padding:0 28px 22px 28px;font-family:${font};">
<a href="${esc(ctaUrl)}" style="display:inline-block;background:#64dfdf;color:#0d2137;font-weight:800;font-size:16px;text-decoration:none;padding:14px 30px;border-radius:999px;font-family:${font};">${esc(c.cta)}</a>
</td></tr>
<tr><td dir="${dir}" align="${align}" style="padding:0 28px 26px 28px;font-family:${font};font-size:16px;line-height:1.6;color:#1b2f40;text-align:${align};">
${esc(c.signoff)}<br>${esc(c.team)}
</td></tr>
<tr><td dir="${dir}" align="${align}" style="padding:16px 28px 26px 28px;border-top:1px solid #e3eaef;font-family:${font};font-size:12px;line-height:1.6;color:#6b7f8e;text-align:${align};">
${esc(c.why)}<br>
<a href="${esc(unsubscribeUrl)}" style="color:#6b7f8e;text-decoration:underline;">${esc(c.unsubscribe)}</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  return { subject: c.subject, html, text };
}

// Texts of the unsubscribe page (GET shows the question, POST confirms).
export const UNSUB_COPY: Record<EmailLang, { title: string; ask: string; button: string; done: string; home: string }> = {
  he: {
    title: "הפסקת קבלת מיילים",
    ask: "להפסיק לשלוח אליך מיילים מטיולון?",
    button: "כן, להפסיק",
    done: "הסרנו אותך מרשימת התפוצה. לא נשלח אליך עוד מיילים כאלה.",
    home: "לטיולון",
  },
  en: {
    title: "Stop receiving emails",
    ask: "Stop sending you emails from TUlon?",
    button: "Yes, stop",
    done: "You're unsubscribed. We won't send you emails like this any more.",
    home: "Go to TUlon",
  },
  es: {
    title: "Dejar de recibir correos",
    ask: "¿Dejar de enviarte correos de TUlon?",
    button: "Sí, dejar de enviar",
    done: "Te has dado de baja. No te enviaremos más correos como este.",
    home: "Ir a TUlon",
  },
};
