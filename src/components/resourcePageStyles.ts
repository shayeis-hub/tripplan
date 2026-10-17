// Shared styles for the editorial "<City> Travel Resources" pages
// (app/(en)/paris-travel-resources, prague-travel-resources, ...). They sit
// inside <SeoPage>, which already provides the .seo-* theme classes.
export const RES_CSS = `
  .res-note { max-width: 720px; margin: 28px auto 0; padding: 0 24px; }
  .res-note-box { background: rgba(255,255,255,0.04); border: 0.5px solid rgba(100,223,223,0.22); border-radius: 14px; padding: 14px 18px; font-size: 14px; line-height: 1.65; color: rgba(255,255,255,0.78); }
  .res-note-box strong { color: #fff; font-weight: 700; }
  .res-grid { display: grid; gap: 14px; margin: 6px 0 12px; }
  .res-card { background: rgba(255,255,255,0.04); border: 0.5px solid rgba(100,223,223,0.14); border-radius: 16px; padding: 18px 20px; display: flex; flex-direction: column; gap: 8px; }
  .res-card h3 { font-size: 17px; font-weight: 700; line-height: 1.35; color: #fff; }
  .res-meta { display: flex; flex-wrap: wrap; gap: 6px 10px; font-size: 12.5px; color: rgba(255,255,255,0.6); }
  .res-pill { display: inline-block; background: rgba(100,223,223,0.12); border: 0.5px solid rgba(100,223,223,0.3); color: #64dfdf; border-radius: 999px; padding: 2px 10px; font-size: 12px; font-weight: 600; }
  .res-card p { font-size: 14.5px; line-height: 1.7; color: rgba(255,255,255,0.68); }
  .seo .res-btn { align-self: flex-start; display: inline-block; margin-top: 4px; background: #64dfdf; color: #0d2137; font-size: 14px; font-weight: 800; padding: 10px 22px; border-radius: 999px; text-decoration: none; }
  .seo .res-btn:hover { background: #4fd4d4; }
  .seo .res-btn:focus-visible { outline: 2px solid #64dfdf; outline-offset: 3px; }
  .res-links { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 18px; margin-top: 4px; }
  .res-links .res-btn { margin-top: 0; }
  .seo .res-alt { font-size: 13.5px; font-weight: 600; }
  .res-lead-strong { font-size: 16px; font-weight: 600; color: rgba(255,255,255,0.92); margin-bottom: 14px; }
  .res-lead-strong em { font-style: italic; }
  .res-two { display: grid; gap: 14px; grid-template-columns: 1fr; }
  @media (min-width: 640px) { .res-two { grid-template-columns: 1fr 1fr; } }
`;

// Paid/affiliate links. Official, non-commercial links use plain noopener.
export const AFFILIATE_REL = "sponsored nofollow noopener noreferrer";
