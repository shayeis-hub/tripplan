"use client";
import { useLang } from "@/lib/LangContext";
import { GOOGLE_PLAY_URL, APP_STORE_URL } from "@/lib/stores";

const T = {
  getApp:   { he: "הורידו את האפליקציה", en: "Get the app",       es: "Descarga la app"      },
  plan:     { he: "תכנן טיול",          en: "Plan a Trip",       es: "Planifica un viaje"   },
  features: { he: "פיצ'רים",             en: "Features",          es: "Funciones"            },
  blog:     { he: "בלוג",                en: "Blog",              es: "Blog"                 },
  about:    { he: "אודות",               en: "About",             es: "Nosotros"             },
  privacy:  { he: "מדיניות פרטיות",      en: "Privacy Policy",    es: "Privacidad"           },
  terms:    { he: "תנאי שימוש",          en: "Terms",             es: "Términos"             },
  contact:  { he: "צור קשר",             en: "Contact",           es: "Contacto"             },
  guide:    { he: "מדריך למשתמש",        en: "User Guide",        es: "Guía de usuario"      },
  tagline:  { he: "מתכנן הטיולים שלי",  en: "My Trip Planner",   es: "Mi planificador"      },
} as const;

export default function SiteFooter() {
  const { lang } = useLang();
  const guideHref = lang === "he" ? "/guide-he.html" : lang === "es" ? "/guide-es.html" : "/guide-en.html";
  const isHe = lang === "he";

  return (
    <>
      <style>{`
        .sitefooter {
          background: rgba(0,0,0,0.25);
          border-top: 0.5px solid rgba(255,255,255,0.05);
          padding: 28px 24px;
          font-family: 'Rubik', sans-serif;
          text-align: center;
        }
        .sitefooter-links {
          display: flex; flex-wrap: wrap; gap: 4px 0;
          justify-content: center; margin-bottom: 14px;
        }
        .sitefooter-link {
          font-size: 12px; color: rgba(255,255,255,0.22);
          text-decoration: none; padding: 3px 10px;
          transition: color 0.15s;
        }
        .sitefooter-link:hover { color: rgba(100,223,223,0.55); }
        .sitefooter-sep {
          color: rgba(255,255,255,0.1); font-size: 12px; padding: 3px 0;
        }
        .sitefooter-brand { color: #64dfdf; font-weight: 700; }
        .sitefooter-copy { font-size: 11px; color: rgba(255,255,255,0.16); }
        .sitefooter-stores {
          display: flex; flex-wrap: wrap; gap: 8px;
          justify-content: center; align-items: center; margin-bottom: 16px;
        }
        .sitefooter-store {
          font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.55);
          text-decoration: none; padding: 5px 12px; border-radius: 8px;
          border: 0.5px solid rgba(255,255,255,0.12); transition: all 0.15s;
        }
        .sitefooter-store:hover { color: #64dfdf; border-color: rgba(100,223,223,0.4); }
      `}</style>
      <footer className="sitefooter" dir={isHe ? "rtl" : "ltr"}>
        <div className="sitefooter-stores">
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)" }}>{T.getApp[lang]}:</span>
          <a className="sitefooter-store" href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer">Google Play</a>
          {APP_STORE_URL && (
            <a className="sitefooter-store" href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">App Store</a>
          )}
        </div>
        <div className="sitefooter-links">
          <a className="sitefooter-link" href="/plan">{T.plan[lang]}</a>
          <span className="sitefooter-sep">·</span>
          <a className="sitefooter-link" href="/features">{T.features[lang]}</a>
          <span className="sitefooter-sep">·</span>
          <a className="sitefooter-link" href="/blog">{T.blog[lang]}</a>
          <span className="sitefooter-sep">·</span>
          <a className="sitefooter-link" href="/about">{T.about[lang]}</a>
          <span className="sitefooter-sep">·</span>
          <a className="sitefooter-link" href="/privacy">{T.privacy[lang]}</a>
          <span className="sitefooter-sep">·</span>
          <a className="sitefooter-link" href="/terms">{T.terms[lang]}</a>
          <span className="sitefooter-sep">·</span>
          <a className="sitefooter-link" href="/contact">{T.contact[lang]}</a>
          <span className="sitefooter-sep">·</span>
          <a className="sitefooter-link" href={guideHref}>{T.guide[lang]}</a>
        </div>
        <div className="sitefooter-copy">
          <span className="sitefooter-brand">TUlon</span>
          {" – "}{T.tagline[lang]}{" · "}www.tulon.app
        </div>
      </footer>
    </>
  );
}
