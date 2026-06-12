"use client";
import { useLang } from "@/lib/LangContext";
import { useRouter, usePathname } from "next/navigation";

const T = {
  plan:     { he: "תכנן טיול",  en: "Plan a Trip",  es: "Planifica" },
  features: { he: "פיצ'רים",    en: "Features",     es: "Funciones" },
  blog:     { he: "בלוג",       en: "Blog",          es: "Blog"      },
  about:    { he: "אודות",      en: "About",         es: "Nosotros"  },
  cta:      { he: "התחל בחינם", en: "Start free",   es: "Empezar"   },
} as const;

export default function SiteNav() {
  const { lang, setLang } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const isHe = lang === "he";

  const navLinks = [
    { href: "/plan",     label: T.plan[lang]     },
    { href: "/features", label: T.features[lang] },
    { href: "/blog",     label: T.blog[lang]     },
    { href: "/about",    label: T.about[lang]    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap');
        .sitenav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(9,25,40,0.97);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 0.5px solid rgba(100,223,223,0.09);
          padding: 0 20px;
          height: 54px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          font-family: 'Rubik', sans-serif;
        }
        .sitenav-logo {
          font-size: 21px; font-weight: 900; color: #fff; cursor: pointer;
          letter-spacing: -1px; text-decoration: none; flex-shrink: 0;
        }
        .sitenav-logo span { color: #64dfdf; }
        .sitenav-links {
          display: flex; gap: 2px; align-items: center; flex: 1;
          justify-content: center;
        }
        @media (max-width: 600px) { .sitenav-links { display: none; } }
        .sitenav-link {
          padding: 6px 11px; border-radius: 8px;
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.48);
          cursor: pointer; transition: all 0.15s;
          border: none; background: transparent;
          font-family: 'Rubik', sans-serif;
          text-decoration: none; white-space: nowrap;
        }
        .sitenav-link:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.05); }
        .sitenav-link.active { color: #64dfdf; background: rgba(100,223,223,0.08); }
        .sitenav-right {
          display: flex; gap: 7px; align-items: center; flex-shrink: 0;
        }
        .sitenav-lang {
          display: flex; gap: 3px;
        }
        .sitenav-lang-btn {
          padding: 4px 7px; border-radius: 6px;
          border: 0.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.35);
          font-family: 'Rubik', sans-serif; font-weight: 700; font-size: 11px;
          cursor: pointer; transition: all 0.15s;
        }
        .sitenav-lang-btn.active {
          background: rgba(100,223,223,0.1);
          border-color: rgba(100,223,223,0.3);
          color: #64dfdf;
        }
        .sitenav-cta {
          padding: 7px 16px; border-radius: 999px;
          background: #64dfdf; color: #0d2137;
          font-family: 'Rubik', sans-serif; font-size: 13px; font-weight: 800;
          border: none; cursor: pointer; transition: all 0.15s;
          white-space: nowrap;
        }
        .sitenav-cta:hover { background: #4fd4d4; transform: translateY(-0.5px); }
        @media (max-width: 480px) { .sitenav-cta { padding: 7px 13px; font-size: 12px; } }
      `}</style>
      <nav className="sitenav" dir={isHe ? "rtl" : "ltr"}>
        <a className="sitenav-logo" href="/">TU<span>lon</span></a>

        <div className="sitenav-links">
          {navLinks.map(l => (
            <a
              key={l.href}
              className={`sitenav-link${pathname === l.href ? " active" : ""}`}
              href={l.href}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="sitenav-right">
          <div className="sitenav-lang">
            <button className={`sitenav-lang-btn${lang==="he"?" active":""}`} onClick={()=>setLang("he")}>עב</button>
            <button className={`sitenav-lang-btn${lang==="en"?" active":""}`} onClick={()=>setLang("en")}>EN</button>
            <button className={`sitenav-lang-btn${lang==="es"?" active":""}`} onClick={()=>setLang("es")}>ES</button>
          </div>
          <button className="sitenav-cta" onClick={()=>router.push("/login")}>{T.cta[lang]}</button>
        </div>
      </nav>
    </>
  );
}
