// "My World" share card, drawn client-side with Canvas (same approach as post-card.ts: the browser's own
// text engine shapes Hebrew and handles RTL correctly). Three designs x two formats.
// PRIVACY: the card contains only the map, numbers and the TUlon brand. No name, e-mail, city, year or home country.
import { MAP_DOTS, MAP_H, MAP_PATHS, MAP_W } from "./geo";

export type CardLang = "he" | "en" | "es";
export type CardDesign = "night" | "sky" | "ticket";
export type CardFormat = "post" | "story";
export const CARD_DESIGNS: CardDesign[] = ["ticket", "night", "sky"];
export const CARD_FORMATS: CardFormat[] = ["post", "story"];

export type ShareCardInput = {
  lang: CardLang;
  design: CardDesign;
  format: CardFormat;
  visited: Set<string>;
  countries: number;
  continents: number;
  pctWorld: number;
  km: number | null; // null (no home country) hides the km figure
  languages: number;
  // Yearly summary ("2026 in the world"): `visited` is then the countries visited IN that year, `prev` the ones from earlier years.
  kind?: "world" | "year";
  year?: number;
  prev?: Set<string>;
  visits?: number; // entries in that year
  newCountries?: number; // countries whose first visit was that year
};

const W = 1080;
const MARGIN = 72;
const NAVY = "#091928";
const FONT = "Rubik, 'Segoe UI', Arial, sans-serif";

// DRAFT COPY: every string below is pending the owner's approval before this ships.
const TXT = {
  he: { title: "העולם שלי", brand: "טיולון", continents: "יבשות", ofWorld: "מהעולם", km: "ק״מ בטיסה", langs: "שפות רשמיות שכנראה שמעתי", q: "בכמה מדינות ביקרתם?", cta: "צרו את המפה שלכם חינם", ticketWord: "העולם שלי", yearTitle: (y: number) => `${y} שלי בעולם`, visitsLabel: "ביקורים השנה", newLabel: (n: number) => (n === 1 ? "מדינה חדשה" : "מדינות חדשות") },
  en: { title: "My World", brand: "TUlon", continents: "continents", ofWorld: "of the world", km: "km flown", langs: "Official languages I probably heard", q: "How many countries have you visited?", cta: "Make your own map for free", ticketWord: "My World", yearTitle: (y: number) => `My ${y} in the world`, visitsLabel: "visits this year", newLabel: (n: number) => (n === 1 ? "new country" : "new countries") },
  es: { title: "Mi mundo", brand: "TUlon", continents: "continentes", ofWorld: "del mundo", km: "km volados", langs: "Idiomas oficiales que probablemente oí", q: "¿Cuántos países has visitado?", cta: "Crea tu mapa gratis", ticketWord: "Mi mundo", yearTitle: (y: number) => `Mi ${y} en el mundo`, visitsLabel: "visitas este año", newLabel: (n: number) => (n === 1 ? "país nuevo" : "países nuevos") },
};

type Run = { t: string; accent?: boolean };
function headline(lang: CardLang, n: number): { l1: string; runs: Run[]; noun: string; visited: string } {
  if (lang === "he") {
    return n === 1
      ? { l1: "ביקרתי", runs: [{ t: "במדינה אחת" }], noun: "מדינה", visited: "ביקרתי בה" }
      : { l1: "ביקרתי", runs: [{ t: "ב-" }, { t: String(n), accent: true }, { t: " מדינות" }], noun: "מדינות", visited: "ביקרתי בהן" };
  }
  if (lang === "es") {
    return { l1: "He estado en", runs: [{ t: String(n), accent: true }, { t: n === 1 ? " país" : " países" }], noun: n === 1 ? "país" : "países", visited: "que he visitado" };
  }
  return { l1: "I've been to", runs: [{ t: String(n), accent: true }, { t: n === 1 ? " country" : " countries" }], noun: n === 1 ? "country" : "countries", visited: "I've visited" };
}

function headlineYear(lang: CardLang, n: number): { l1: string; runs: Run[]; noun: string; visited: string } {
  if (lang === "he") {
    return n === 1
      ? { l1: "ביקרתי", runs: [{ t: "במדינה אחת השנה" }], noun: "מדינה", visited: "ביקרתי בה השנה" }
      : { l1: "ביקרתי", runs: [{ t: "ב-" }, { t: String(n), accent: true }, { t: " מדינות השנה" }], noun: "מדינות", visited: "ביקרתי בהן השנה" };
  }
  if (lang === "es") {
    return { l1: "Visité", runs: [{ t: String(n), accent: true }, { t: n === 1 ? " país este año" : " países este año" }], noun: n === 1 ? "país" : "países", visited: "que visité este año" };
  }
  return { l1: "I visited", runs: [{ t: String(n), accent: true }, { t: n === 1 ? " country this year" : " countries this year" }], noun: n === 1 ? "country" : "countries", visited: "I visited this year" };
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const PLANE = "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z";

export async function renderWorldCard(input: ShareCardInput): Promise<Blob> {
  // Make sure the web font is ready before measuring/drawing (Hebrew included), or canvas falls back silently.
  try {
    await Promise.all([document.fonts.load(`900 60px Rubik`, "Aא"), document.fonts.load(`700 60px Rubik`, "Aא"), document.fonts.load(`500 30px Rubik`, "Aא")]);
  } catch { /* fall back to the system font stack */ }

  const { design, format, lang } = input;
  const tx = TXT[lang];
  const rtl = lang === "he";
  const H = format === "story" ? 1920 : 1350;
  const e = H - 1350; // extra height a story has over a post, spread over the gaps below

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.direction = rtl ? "rtl" : "ltr";
  ctx.textBaseline = "alphabetic";

  // ---- helpers. "start" is the reading-start edge (right in Hebrew), "end" the opposite one.
  const S = (inset: number) => (rtl ? W - inset : inset);
  const E = (inset: number) => (rtl ? inset : W - inset);
  const alignStart: CanvasTextAlign = rtl ? "right" : "left";
  const alignEnd: CanvasTextAlign = rtl ? "left" : "right";
  const font = (w: number, size: number) => `${w} ${Math.round(size)}px ${FONT}`;
  const text = (s: string, x: number, y: number, f: string, color: string | CanvasGradient, align: CanvasTextAlign = alignStart) => {
    ctx.font = f; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(s, x, y);
  };
  const width = (s: string, f: string) => { ctx.font = f; return ctx.measureText(s).width; };
  const fit = (s: string, weight: number, maxW: number, size: number, min: number) => {
    let z = size;
    while (z > min && width(s, font(weight, z)) > maxW) z -= 2;
    return z;
  };
  const rr = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };
  // Draws runs one after another in reading direction, from the start anchor. Returns the end coordinate.
  const runs = (list: Run[], x: number, y: number, f: string, color: string, accent: string, accentShadow?: string) => {
    let cur = x;
    ctx.font = f;
    ctx.textAlign = alignStart;
    for (const r of list) {
      const w = ctx.measureText(r.t).width;
      if (r.accent && accentShadow) { ctx.fillStyle = accentShadow; ctx.fillText(r.t, cur, y + 7); }
      ctx.fillStyle = r.accent ? accent : color;
      ctx.fillText(r.t, cur, y);
      cur += rtl ? -w : w;
    }
    return cur;
  };
  const drawMap = (x: number, y: number, w: number, c: { base: string; vis: string; stroke: string; glow?: string; blur?: number; prevFill?: string; dotBase: string; dotVis: string; bg?: string }) => {
    const k = w / MAP_W;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(k, k);
    if (c.bg) { ctx.fillStyle = c.bg; ctx.fillRect(0, 0, MAP_W, MAP_H); }
    ctx.lineJoin = "round";
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = c.stroke;
    const entries = Object.entries(MAP_PATHS);
    for (const [cc, d] of entries) {
      if (input.visited.has(cc)) continue;
      const p = new Path2D(d);
      ctx.fillStyle = input.prev?.has(cc) && c.prevFill ? c.prevFill : c.base; ctx.fill(p); ctx.stroke(p);
    }
    for (const [cc, d] of entries) {
      if (!input.visited.has(cc)) continue;
      const p = new Path2D(d);
      if (c.glow) { ctx.shadowColor = c.glow; ctx.shadowBlur = (c.blur ?? 12) / k; }
      ctx.fillStyle = c.vis; ctx.fill(p);
      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
      ctx.stroke(p);
    }
    for (const [cc, [dx, dy]] of Object.entries(MAP_DOTS)) {
      const v = input.visited.has(cc);
      if (v && c.glow) { ctx.shadowColor = c.glow; ctx.shadowBlur = (c.blur ?? 12) / k; }
      ctx.fillStyle = v ? c.dotVis : input.prev?.has(cc) && c.prevFill ? c.prevFill : c.dotBase;
      ctx.beginPath(); ctx.arc(dx, dy, v ? 5.5 : 3, 0, Math.PI * 2); ctx.fill();
      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
    }
    ctx.restore();
    return (MAP_H * w) / MAP_W;
  };
  const logo = await loadImage("/icon-512.png");
  const drawLogo = (x: number, y: number, s: number) => {
    if (!logo) return;
    ctx.save(); rr(x, y, s, s, s * 0.22); ctx.clip(); ctx.drawImage(logo, x, y, s, s); ctx.restore();
  };
  const logoX = (size: number, inset = MARGIN) => (rtl ? W - inset - size : inset);

  const isYear = input.kind === "year" && input.year != null;
  type Field = { v: string; l: string };
  const kmField: Field[] = input.km != null && input.km > 0 ? [{ v: input.km.toLocaleString(lang), l: tx.km }] : [];
  const main: Field[] = isYear
    ? [{ v: String(input.visits ?? 0), l: tx.visitsLabel }, { v: String(input.continents), l: tx.continents }, ...kmField]
    : [{ v: String(input.continents), l: tx.continents }, { v: `${input.pctWorld}%`, l: tx.ofWorld }, ...kmField];
  const extra: Field | null = isYear
    ? (input.newCountries ?? 0) > 0 ? { v: String(input.newCountries), l: tx.newLabel(input.newCountries ?? 0) } : null
    : { v: String(input.languages), l: tx.langs };
  const title = isYear ? tx.yearTitle(input.year as number) : tx.title;
  const hl = isYear ? headlineYear(lang, input.countries) : headline(lang, input.countries);

  // ================= NIGHT =================
  if (design === "night") {
    const g = ctx.createLinearGradient(0, 0, W * 0.5, H);
    g.addColorStop(0, "#091928"); g.addColorStop(0.55, "#0d2137"); g.addColorStop(1, "#12304d");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const gl = ctx.createRadialGradient(W * 0.85, H * 0.06, 0, W * 0.85, H * 0.06, W * 0.8);
    gl.addColorStop(0, "rgba(100,223,223,0.22)"); gl.addColorStop(1, "rgba(100,223,223,0)");
    ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);

    drawLogo(logoX(84), 64, 84);
    text(title, rtl ? logoX(84) - 22 : logoX(84) + 84 + 22, 64 + 58, font(800, 40), "#fff");

    const numStr = String(input.countries);
    const labW = 430;
    const nz = fit(numStr, 900, W - MARGIN * 2 - labW - 30, 430, 220);
    const ng = ctx.createLinearGradient(0, 150, 0, 150 + nz);
    ng.addColorStop(0, "#9ff5f0"); ng.addColorStop(1, "#37c3c3");
    text(numStr, S(MARGIN - 12), 150 + nz * 0.8, font(900, nz), ng);
    const nounZ = fit(hl.noun, 900, labW, 104, 56);
    const visZ = fit(hl.visited, 600, labW, 56, 34);
    text(hl.noun, E(MARGIN), 150 + nz * 0.8 - nz * 0.4, font(900, nounZ), "#fff", alignStart === "right" ? "left" : "right");
    text(hl.visited, E(MARGIN), 150 + nz * 0.8 - nz * 0.4 + visZ * 1.35, font(600, visZ), "rgba(255,255,255,0.75)", alignStart === "right" ? "left" : "right");

    const mapTop = 560 + e * 0.3;
    drawMap(MARGIN, mapTop, W - MARGIN * 2, { base: "rgba(255,255,255,0.13)", vis: "#64dfdf", stroke: "#0d2137", glow: "rgba(100,223,223,0.7)", blur: 18, prevFill: "rgba(100,223,223,0.32)", dotBase: "rgba(255,255,255,0.25)", dotVis: "#64dfdf" });

    // stat cards (+ languages), weights keep long values inside their card
    const cards = extra ? [...main, extra] : main;
    const weights = cards.length === 4 ? [0.8, 0.9, 1.45, 1.15] : [0.9, 1, 1.4];
    const gap = 16;
    const total = W - MARGIN * 2 - gap * (cards.length - 1);
    const wsum = weights.slice(0, cards.length).reduce((a, b) => a + b, 0);
    const top = 1000 + e * 0.72;
    let cur = S(MARGIN);
    cards.forEach((c, i) => {
      const cw = (total * weights[i]) / wsum;
      const x = rtl ? cur - cw : cur;
      ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 2;
      rr(x, top, cw, 180, 26); ctx.fill(); ctx.stroke();
      const tx0 = rtl ? x + cw - 20 : x + 20;
      const vz = fit(c.v, 900, cw - 40, 58, 30);
      text(c.v, tx0, top + 40 + vz * 0.8, font(900, vz), "#64dfdf");
      ctx.font = font(500, 25);
      // wrap label to the card width (max 3 lines)
      const words = c.l.split(" "); let line = ""; let ly = top + 40 + vz * 0.8 + 38;
      for (const w of words) {
        const cand = line ? `${line} ${w}` : w;
        if (width(cand, font(500, 25)) > cw - 40 && line) { text(line, tx0, ly, font(500, 25), "rgba(255,255,255,0.8)"); ly += 30; line = w; } else line = cand;
      }
      text(line, tx0, ly, font(500, 25), "rgba(255,255,255,0.8)");
      cur += rtl ? -(cw + gap) : cw + gap;
    });

    // CTA bar
    ctx.fillStyle = "#64dfdf"; ctx.fillRect(0, H - 150, W, 150);
    const qz = fit(tx.q, 800, W - MARGIN * 2 - 230, 40, 26);
    text(tx.q, S(MARGIN), H - 150 + 66, font(800, qz), NAVY);
    text(tx.cta, S(MARGIN), H - 150 + 114, font(600, 32), "rgba(9,25,40,0.82)");
    ctx.direction = "ltr"; text("tulon.app", E(MARGIN), H - 150 + 90, font(700, 32), NAVY, alignEnd); ctx.direction = rtl ? "rtl" : "ltr";
  }

  // ================= SKY =================
  if (design === "sky") {
    const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
    g.addColorStop(0, "#7ff0ea"); g.addColorStop(0.6, "#46cfd0"); g.addColorStop(1, "#2fb8bd");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    drawLogo(logoX(84), 64, 84);
    text(tx.brand, rtl ? logoX(84) - 18 : logoX(84) + 84 + 18, 64 + 58, font(800, 38), "#08202f");
    const pillZ = 30; const pw = width(title, font(700, pillZ)) + 52;
    const px = rtl ? MARGIN : W - MARGIN - pw;
    ctx.fillStyle = "#08202f"; rr(px, 78, pw, 56, 28); ctx.fill();
    text(title, px + pw / 2, 78 + 39, font(700, pillZ), "#7ff0ea", "center");

    // headline: two lines, shrunk until both fit
    const l2 = hl.runs.map((r) => r.t).join("");
    let hz = 140;
    while (hz > 70 && Math.max(width(hl.l1, font(900, hz)), width(l2, font(900, hz))) > W - MARGIN * 2) hz -= 4;
    text(hl.l1, S(MARGIN), 165 + hz * 0.9, font(900, hz), "#08202f");
    runs(hl.runs, S(MARGIN), 165 + hz * 0.9 + hz * 0.98, font(900, hz), "#08202f", "#ffffff", "rgba(8,32,47,0.18)");

    drawMap(MARGIN, 490 + e * 0.32, W - MARGIN * 2, { base: "rgba(8,32,47,0.2)", vis: "#ffffff", stroke: "#46cfd0", glow: "rgba(8,32,47,0.4)", blur: 10, prevFill: "rgba(255,255,255,0.5)", dotBase: "rgba(8,32,47,0.3)", dotVis: "#fff" });

    // chips flow from the start edge, wrapping
    let cx = S(MARGIN), cy = 900 + e * 0.72;
    const chipW = (c: { v: string; l: string }) => width(c.v, font(900, 56)) + 14 + width(c.l, font(500, 32)) + 64;
    for (const c of main) {
      const cw = chipW(c);
      if (rtl ? cx - cw < MARGIN : cx + cw > W - MARGIN) { cx = S(MARGIN); cy += 108; }
      const x = rtl ? cx - cw : cx;
      ctx.fillStyle = "rgba(8,32,47,0.15)"; rr(x, cy + 8, cw, 92, 46); ctx.fill();
      ctx.fillStyle = "#fff"; rr(x, cy, cw, 92, 46); ctx.fill();
      const ex = runs([{ t: c.v }], rtl ? x + cw - 32 : x + 32, cy + 65, font(900, 56), "#08202f", "#08202f");
      text(c.l, rtl ? ex - 14 : ex + 14, cy + 65, font(500, 32), "#08202f");
      cx += rtl ? -(cw + 16) : cw + 16;
    }
    if (extra) {
      const ly = cy + 92 + 56;
      const lend = runs([{ t: extra.v }], S(MARGIN), ly, font(900, 36), "#08202f", "#08202f");
      text(extra.l, rtl ? lend - 12 : lend + 12, ly, font(600, 34), "#08202f");
    }

    ctx.fillStyle = "#08202f"; ctx.fillRect(0, H - 150, W, 150);
    const qz = fit(tx.q, 800, W - MARGIN * 2 - 230, 40, 26);
    text(tx.q, S(MARGIN), H - 150 + 66, font(800, qz), "#7ff0ea");
    text(tx.cta, S(MARGIN), H - 150 + 114, font(600, 32), "#ffffff");
    ctx.direction = "ltr"; text("tulon.app", E(MARGIN), H - 150 + 90, font(700, 32), "#ffffff", alignEnd); ctx.direction = rtl ? "rtl" : "ltr";
  }

  // ================= TICKET =================
  if (design === "ticket") {
    const g = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, H * 0.9);
    g.addColorStop(0, "#12304d"); g.addColorStop(0.7, "#091928"); g.addColorStop(1, "#091928");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const tx0 = 60, ty = 70 + e * 0.16, tw = W - 120, th = 1090 + e * 0.62;
    ctx.save();
    rr(tx0, ty, tw, th, 44); ctx.clip();
    ctx.fillStyle = "#f2f6f8"; ctx.fillRect(tx0, ty, tw, th);
    ctx.fillStyle = "#0d2137"; ctx.fillRect(tx0, ty, tw, 130);
    const lg = logoX(70, tx0 + 48);
    drawLogo(lg, ty + 30, 70);
    text(isYear ? title : tx.ticketWord, rtl ? lg - 20 : lg + 70 + 20, ty + 82, font(900, isYear ? fit(title, 900, tw - 96 - 70 - 20 - 80, 46, 30) : 46), "#fff");
    // plane icon on the end side
    ctx.save();
    const sc = 46 / 24;
    ctx.translate(rtl ? tx0 + 48 : tx0 + tw - 48 - 46, ty + 42);
    ctx.scale(sc, sc);
    ctx.strokeStyle = "#64dfdf"; ctx.lineWidth = 1.8; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.stroke(new Path2D(PLANE));
    ctx.restore();

    const mapW = tw - 72;
    const mapTop = ty + 130 + 34 + e * 0.14;
    const mh = drawMap(tx0 + 36, mapTop, mapW, { base: "#d3dee5", vis: "#12b3b3", stroke: "#f2f6f8", prevFill: "#9fdcdc", dotBase: "#aebdc7", dotVis: "#12b3b3" });

    const full = `${hl.l1} ${hl.runs.map((r) => r.t).join("")}`;
    const hz = fit(full, 900, tw - 96, 112, 54);
    const hy = mapTop + mh + 105 + e * 0.2;
    text(full, S(tx0 + 48), hy, font(900, hz), "#08202f");

    const py = hy + 50;
    ctx.strokeStyle = "#b8c6cf"; ctx.lineWidth = 5; ctx.setLineDash([16, 12]);
    ctx.beginPath(); ctx.moveTo(tx0 + 44, py); ctx.lineTo(tx0 + tw - 44, py); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    // notches (drawn over the paper edge in the background colour)
    ctx.fillStyle = "#0a1b2c";
    ctx.beginPath(); ctx.arc(tx0, py, 30, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(tx0 + tw, py, 30, 0, Math.PI * 2); ctx.fill();

    // fields
    const colW = (tw - 96) / 3;
    const colX = (i: number) => (rtl ? tx0 + tw - 48 - i * colW : tx0 + 48 + i * colW);
    main.forEach((c, i) => {
      text(c.l, colX(i), py + 52, font(600, 24), "#6a8394");
      const z = fit(c.v, 900, colW - 16, 64, 36);
      text(c.v, colX(i), py + 52 + 58, font(900, z), "#0d2137");
    });
    const ry = py + 52 + 58 + 62 + e * 0.12;
    if (extra) {
      text(extra.l, S(tx0 + 48), ry, font(600, 24), "#6a8394");
      text(extra.v, S(tx0 + 48), ry + 58, font(900, 52), "#0d2137");
    }

    // barcode
    ctx.fillStyle = "#0d2137";
    let bx = tx0 + 48; const by = ty + th - 34 - 58;
    const widths = [3, 6, 2, 8, 4];
    for (let i = 0; i < 44; i++) { const bw = widths[i % 5]; ctx.fillRect(bx, by, bw, 58); bx += bw + 5; }

    const cy = ty + th + 90;
    const qz = fit(tx.q, 900, W - 120, 50, 30);
    text(tx.q, W / 2, cy, font(900, qz), "#fff", "center");
    const ctaLine = `${tx.cta}  ·  tulon.app`;
    const cz = fit(ctaLine, 500, W - 120, 34, 22);
    ctx.direction = rtl ? "rtl" : "ltr";
    text(ctaLine, W / 2, cy + 54, font(500, cz), "#64dfdf", "center");
  }

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
  );
}

type CapPlugins = {
  Filesystem?: { writeFile: (o: { path: string; data: string; directory: string }) => Promise<{ uri: string }> | { uri: string } };
  Share?: { share: (o: { title?: string; files?: string[] }) => Promise<unknown> | unknown };
};
const cap = () => (typeof window !== "undefined" ? (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean; Plugins?: CapPlugins } }).Capacitor : undefined);
export const isNativeShell = () => !!cap()?.isNativePlatform?.();

export type ShareOutcome = "shared" | "cancelled" | "unsupported";

const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result).split(",")[1] || "");
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(blob);
  });

// Opens the system share sheet with the image. Capacitor plugin calls are awaited inside try/catch
// (they may return a plain value instead of a Promise, and must never throw out of an event handler).
export async function shareImage(blob: Blob, filename: string, title: string): Promise<ShareOutcome> {
  try {
    const plugins = cap()?.Plugins;
    if (isNativeShell() && plugins?.Filesystem && plugins?.Share) {
      const written = await plugins.Filesystem.writeFile({ path: filename, data: await blobToBase64(blob), directory: "CACHE" });
      await plugins.Share.share({ title, files: [written.uri] });
      return "shared";
    }
    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title });
      return "shared";
    }
    return "unsupported";
  } catch (e) {
    const msg = String((e as { message?: string })?.message || e);
    if ((e as { name?: string })?.name === "AbortError" || /cancel/i.test(msg)) return "cancelled";
    throw e;
  }
}

export function downloadImage(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
