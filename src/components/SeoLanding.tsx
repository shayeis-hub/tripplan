import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ForcedLang } from "@/lib/LangContext";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/seo";
import { GOOGLE_PLAY_URL, APP_STORE_URL } from "@/lib/stores";

// Building blocks for the English-only SEO landing pages. Everything here is
// a server component (no hooks, no client JS of its own) so the full copy is
// in the first HTML response; the only client pieces are the existing
// SiteNav/SiteFooter, pinned to English via ForcedLang.

// Same entry point every other "start" button on the site uses.
export const START_HREF = "/login";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap');
  .seo * { box-sizing: border-box; margin: 0; padding: 0; }
  .seo { font-family: 'Rubik', sans-serif; background: #0d2137; color: #fff; min-height: 100vh; direction: ltr; text-align: left; }
  .seo a { color: #64dfdf; }
  .seo-hero { background: linear-gradient(160deg, #091928 0%, #0d2137 60%, #0a3050 100%); padding: 64px 24px 54px; text-align: center; }
  .seo-hero-inner { max-width: 680px; margin: 0 auto; }
  .seo-h1 { font-size: 34px; font-weight: 900; line-height: 1.2; letter-spacing: -0.6px; margin-bottom: 18px; text-wrap: balance; }
  .seo-lead { font-size: 17px; line-height: 1.7; color: rgba(255,255,255,0.72); margin-bottom: 30px; }
  @media (max-width: 520px) { .seo-h1 { font-size: 26px; } .seo-lead { font-size: 15.5px; } .seo-hero { padding: 48px 20px 42px; } }
  .seo .btn-cta { display: inline-block; background: #64dfdf; color: #0d2137; font-size: 16px; font-weight: 800; padding: 14px 36px; border-radius: 999px; text-decoration: none; box-shadow: 0 8px 28px rgba(100,223,223,0.25); transition: background .2s, transform .2s; }
  .seo .btn-cta:hover { background: #4fd4d4; transform: translateY(-1px); }
  .seo .btn-cta:focus-visible, .seo a:focus-visible { outline: 2px solid #64dfdf; outline-offset: 3px; }
  .seo-stores { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 22px; }
  .seo .store-badge { display: inline-flex; align-items: center; gap: 8px; background: #000; border: 0.5px solid rgba(255,255,255,0.2); border-radius: 11px; padding: 8px 14px; text-decoration: none; color: #fff; }
  .seo .store-eyebrow { display: block; font-size: 9px; color: rgba(255,255,255,0.7); text-transform: uppercase; line-height: 1.1; }
  .seo .store-name { display: block; font-size: 14px; font-weight: 600; color: #fff; line-height: 1.2; }

  .seo-section { max-width: 720px; margin: 0 auto; padding: 46px 24px 6px; }
  .seo-section + .seo-section { padding-top: 40px; }
  .seo-h2 { font-size: 24px; font-weight: 800; line-height: 1.3; letter-spacing: -0.4px; margin-bottom: 16px; text-wrap: balance; }
  .seo-h3 { font-size: 16px; font-weight: 700; line-height: 1.4; margin: 22px 0 6px; color: #fff; }
  .seo-p { font-size: 15.5px; line-height: 1.8; color: rgba(255,255,255,0.68); margin-bottom: 14px; }
  .seo-p strong { color: rgba(255,255,255,0.92); font-weight: 600; }
  .seo-list { list-style: none; margin: 4px 0 16px; display: grid; gap: 9px; }
  .seo-list li { position: relative; padding-left: 22px; font-size: 15px; line-height: 1.7; color: rgba(255,255,255,0.68); }
  .seo-list li::before { content: ""; position: absolute; left: 2px; top: 11px; width: 7px; height: 7px; border-radius: 50%; background: #64dfdf; }
  .seo-steps { list-style: none; counter-reset: step; margin: 6px 0 20px; display: grid; gap: 12px; }
  .seo-steps li { counter-increment: step; display: flex; gap: 14px; align-items: flex-start; background: rgba(255,255,255,0.04); border: 0.5px solid rgba(100,223,223,0.14); border-radius: 14px; padding: 14px 16px; font-size: 15px; line-height: 1.65; color: rgba(255,255,255,0.68); }
  .seo-steps li::before { content: counter(step); flex: 0 0 28px; height: 28px; border-radius: 9px; background: rgba(100,223,223,0.12); border: 0.5px solid rgba(100,223,223,0.3); color: #64dfdf; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; }
  .seo-steps strong { color: #fff; font-weight: 700; }
  .seo-shots { display: grid; grid-template-columns: repeat(2, minmax(0, 220px)); gap: 18px; justify-content: center; margin: 22px 0 8px; }
  .seo-shot { margin: 0; text-align: center; }
  .seo-shot img { width: 100%; height: auto; border-radius: 16px; border: 0.5px solid rgba(100,223,223,0.2); }
  .seo-shot figcaption { font-size: 12.5px; color: rgba(255,255,255,0.6); margin-top: 8px; line-height: 1.5; }
  @media (max-width: 420px) { .seo-shots { gap: 12px; } }
  .seo-table-wrap { overflow-x: auto; border-radius: 14px; border: 0.5px solid rgba(255,255,255,0.1); margin: 14px 0 10px; }
  .seo-table { width: 100%; border-collapse: collapse; font-size: 14px; table-layout: fixed; }
  .seo-table th, .seo-table td { overflow-wrap: break-word; }
  @media (max-width: 560px) {
    .seo-table { font-size: 12.5px; }
    .seo-table th, .seo-table td { padding: 10px 8px; }
    .seo-table tbody th { width: 34%; }
  }
  .seo-table th, .seo-table td { padding: 13px 14px; text-align: left; vertical-align: top; border-bottom: 0.5px solid rgba(255,255,255,0.08); line-height: 1.55; }
  .seo-table thead th { background: rgba(255,255,255,0.05); font-size: 13px; color: #fff; }
  .seo-table tbody th { font-weight: 600; color: rgba(255,255,255,0.88); width: 30%; }
  .seo-table td { color: rgba(255,255,255,0.68); }
  .seo-table tr:last-child th, .seo-table tr:last-child td { border-bottom: none; }
  .seo-note { font-size: 12.5px; line-height: 1.6; color: rgba(255,255,255,0.6); margin-bottom: 14px; }
  .seo-faq-item { border-bottom: 0.5px solid rgba(255,255,255,0.08); padding: 4px 0 14px; }
  .seo-faq-item:last-child { border-bottom: none; }
  .seo-cta { max-width: 720px; margin: 54px auto 0; padding: 0 24px 64px; }
  .seo-cta-box { background: linear-gradient(135deg, rgba(100,223,223,0.1), rgba(100,223,223,0.04)); border: 0.5px solid rgba(100,223,223,0.22); border-radius: 20px; padding: 34px 24px; text-align: center; }
  .seo-cta-box .seo-h2 { margin-bottom: 10px; }
  .seo-cta-box .seo-p { margin-bottom: 22px; }
`;

function GooglePlayGlyph() {
  return (
    <svg width="16" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#00D2FF" d="M3.9 1.8c-.3.3-.4.8-.4 1.4v17.6c0 .6.1 1.1.4 1.4l.1.1L14.2 12v-.1L4 1.7l-.1.1z" />
      <path fill="#00E676" d="M17.6 15.6l-3.4-3.5v-.2l3.4-3.5.1.1 4.1 2.3c1.2.7 1.2 1.8 0 2.5l-4.1 2.3-.1.1z" />
      <path fill="#FF3D00" d="M17.7 15.5 14.2 12 3.9 22.2c.4.4 1.1.5 1.8.1l12-6.8" />
      <path fill="#FFC400" d="M17.7 8.5 5.7 1.7c-.7-.4-1.4-.4-1.8.1L14.2 12l3.5-3.5z" />
    </svg>
  );
}
function AppleGlyph() {
  return (
    <svg width="15" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true" focusable="false">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

export function StoreBadges() {
  return (
    <div className="seo-stores">
      <a className="store-badge" href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer">
        <GooglePlayGlyph />
        <span><span className="store-eyebrow">Get it on</span><span className="store-name">Google Play</span></span>
      </a>
      {APP_STORE_URL && (
        <a className="store-badge" href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
          <AppleGlyph />
          <span><span className="store-eyebrow">Download on the</span><span className="store-name">App Store</span></span>
        </a>
      )}
    </div>
  );
}

// Page frame: English-pinned nav/footer, styles, and the page's JSON-LD.
export function SeoPage({ path, name, description, children }: {
  path: string; name: string; description: string; children: ReactNode;
}) {
  const url = `${SITE_URL}${path}`;
  // WebPage only, pointing at the one SoftwareApplication already declared on
  // the homepage (by @id) — no second app entity, no rating/review/price.
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", url: SITE_URL },
    about: { "@id": `${SITE_URL}/#software` },
  };
  return (
    <ForcedLang lang="en">
      <style>{CSS}</style>
      <div className="seo" dir="ltr">
        <JsonLd data={pageSchema} />
        <SiteNav hideLang />
        <main>{children}</main>
        <SiteFooter />
      </div>
    </ForcedLang>
  );
}

export function Hero({ h1, lead, cta }: { h1: string; lead: string; cta: string }) {
  return (
    <header className="seo-hero">
      <div className="seo-hero-inner">
        <h1 className="seo-h1">{h1}</h1>
        <p className="seo-lead">{lead}</p>
        <Link className="btn-cta" href={START_HREF}>{cta}</Link>
        <StoreBadges />
      </div>
    </header>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="seo-section">
      <h2 className="seo-h2">{title}</h2>
      {children}
    </section>
  );
}

export const P = ({ children }: { children: ReactNode }) => <p className="seo-p">{children}</p>;
export const H3 = ({ children }: { children: ReactNode }) => <h3 className="seo-h3">{children}</h3>;
export const List = ({ items }: { items: ReactNode[] }) => (
  <ul className="seo-list">{items.map((it, i) => <li key={i}>{it}</li>)}</ul>
);
export const Steps = ({ items }: { items: ReactNode[] }) => (
  <ol className="seo-steps">{items.map((it, i) => <li key={i}><span>{it}</span></li>)}</ol>
);

// Existing in-repo product screenshots (public/guide-images). They show the
// Hebrew interface — the alt text says so rather than implying otherwise.
export function Shots({ shots }: { shots: { src: string; alt: string; caption: string }[] }) {
  return (
    <div className="seo-shots">
      {shots.map(s => (
        <figure className="seo-shot" key={s.src}>
          <Image src={s.src} alt={s.alt} width={480} height={1043} sizes="(max-width: 520px) 45vw, 220px" loading="lazy" />
          <figcaption>{s.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export function Faq({ title, items }: { title: string; items: { q: string; a: ReactNode }[] }) {
  return (
    <Section title={title}>
      {items.map((it, i) => (
        <div className="seo-faq-item" key={i}>
          <h3 className="seo-h3">{it.q}</h3>
          <p className="seo-p">{it.a}</p>
        </div>
      ))}
    </Section>
  );
}

export function CtaBand({ title, text, cta }: { title: string; text: string; cta: string }) {
  return (
    <div className="seo-cta">
      <div className="seo-cta-box">
        <h2 className="seo-h2">{title}</h2>
        <p className="seo-p">{text}</p>
        <Link className="btn-cta" href={START_HREF}>{cta}</Link>
      </div>
    </div>
  );
}

export { Link };
