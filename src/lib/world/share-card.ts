// "My World" share card: one 1080x1920 (story format) PNG drawn client-side with Canvas.
// Same approach as post-card.ts: the browser's own text engine shapes Hebrew and handles RTL correctly.
// PRIVACY: the card contains only the map, numbers and the TUlon brand. No name, e-mail, city, year or home country.
import { MAP_DOTS, MAP_H, MAP_PATHS, MAP_W } from "./geo";

const W = 1080;
const H = 1920;
const MARGIN = 72;
const BG_DARK = "#091928";
const BG_MID = "#0d2137";
const BG_LIGHT = "#12304d";
const TEAL = "#64dfdf";
const FONT = "Rubik, 'Segoe UI', Arial, sans-serif";

export type ShareCardInput = {
  rtl: boolean;
  visited: Set<string>;
  title: string; // "My World"
  headline: string; // "9 countries. 6 continents."
  footer: string; // "My world on TUlon"
  stats: { value: string; label: string }[]; // rendered as stacked cards, in order
};

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const cand = line ? `${line} ${w}` : w;
    if (ctx.measureText(cand).width > maxWidth && line) { lines.push(line); line = w; } else line = cand;
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderWorldCard(input: ShareCardInput): Promise<Blob> {
  // Make sure the web font is ready before measuring/drawing (Hebrew included), or canvas falls back silently.
  try {
    await Promise.all([document.fonts.load(`700 60px Rubik`, "Aא"), document.fonts.load(`400 30px Rubik`, "Aא")]);
  } catch { /* fall back to the system font stack */ }

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, BG_DARK);
  grad.addColorStop(0.55, BG_MID);
  grad.addColorStop(1, BG_LIGHT);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.8, H * 0.12, 0, W * 0.8, H * 0.12, W * 0.9);
  glow.addColorStop(0, "rgba(100,223,223,0.16)");
  glow.addColorStop(1, "rgba(100,223,223,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const rtl = input.rtl;
  ctx.direction = rtl ? "rtl" : "ltr";
  ctx.textAlign = "start"; // "start" follows direction, so the anchor below is always the reading-start edge
  ctx.textBaseline = "alphabetic";
  const startX = rtl ? W - MARGIN : MARGIN;
  const logoX = rtl ? W - MARGIN - 84 : MARGIN;

  // Brand row: logo + title
  const logo = await loadImage("/icon-512.png");
  const roundedLogo = (x: number, y: number, s: number) => {
    if (!logo) return;
    ctx.save();
    ctx.beginPath();
    const r = s * 0.22;
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + s, y, x + s, y + s, r);
    ctx.arcTo(x + s, y + s, x, y + s, r);
    ctx.arcTo(x, y + s, x, y, r);
    ctx.arcTo(x, y, x + s, y, r);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(logo, x, y, s, s);
    ctx.restore();
  };
  roundedLogo(logoX, 120, 84);
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 58px ${FONT}`;
  ctx.fillText(input.title, rtl ? logoX - 24 : logoX + 84 + 24, 120 + 62);

  // Map
  const mapW = W - MARGIN * 2;
  const k = mapW / MAP_W;
  const mapTop = 290;
  ctx.save();
  ctx.translate(MARGIN, mapTop);
  ctx.scale(k, k);
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.fillRect(0, 0, MAP_W, MAP_H);
  ctx.lineJoin = "round";
  ctx.lineWidth = 0.6;
  ctx.strokeStyle = BG_DARK;
  for (const [cc, d] of Object.entries(MAP_PATHS)) {
    const p = new Path2D(d);
    ctx.fillStyle = input.visited.has(cc) ? TEAL : "rgba(255,255,255,0.11)";
    ctx.fill(p);
    ctx.stroke(p);
  }
  for (const [cc, [x, y]] of Object.entries(MAP_DOTS)) {
    const v = input.visited.has(cc);
    ctx.fillStyle = v ? TEAL : "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.arc(x, y, v ? 5 : 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  const mapBottom = mapTop + MAP_H * k;

  // Headline, wrapped
  ctx.fillStyle = "#ffffff";
  let size = 92;
  let lines: string[] = [];
  while (size >= 56) {
    ctx.font = `800 ${size}px ${FONT}`;
    lines = wrap(ctx, input.headline, W - MARGIN * 2);
    if (lines.length <= 2) break;
    size -= 4;
  }
  let y = mapBottom + 130;
  for (const l of lines) { ctx.fillText(l, startX, y); y += size * 1.2; }

  // Stat cards
  let cy = y + 30;
  const cardH = 176;
  for (const s of input.stats) {
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    const x = MARGIN, w = W - MARGIN * 2, r = 28;
    ctx.beginPath();
    ctx.moveTo(x + r, cy);
    ctx.arcTo(x + w, cy, x + w, cy + cardH, r);
    ctx.arcTo(x + w, cy + cardH, x, cy + cardH, r);
    ctx.arcTo(x, cy + cardH, x, cy, r);
    ctx.arcTo(x, cy, x + w, cy, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    const tx = rtl ? W - MARGIN - 40 : MARGIN + 40;
    ctx.fillStyle = TEAL;
    ctx.font = `800 76px ${FONT}`;
    ctx.fillText(s.value, tx, cy + 82);
    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.font = `500 34px ${FONT}`;
    ctx.fillText(s.label, tx, cy + 138);
    cy += cardH + 20;
  }

  // Footer
  const fy = H - 120;
  roundedLogo(logoX, fy - 62, 72);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = `600 38px ${FONT}`;
  ctx.fillText(input.footer, rtl ? logoX - 22 : logoX + 72 + 22, fy - 10);
  ctx.fillStyle = TEAL;
  ctx.font = `500 30px ${FONT}`;
  ctx.fillText("tulon.app", rtl ? logoX - 22 : logoX + 72 + 22, fy + 28);

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
