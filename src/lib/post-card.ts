// Renders a branded 1080x1080 Instagram card from a caption, in the browser.
//
// This runs client-side on purpose. Canvas uses the browser's own text engine,
// which shapes Hebrew and handles RTL correctly out of the box; server-side
// renderers need an explicitly loaded Hebrew font and handle bidi less reliably.

const BG_DARK = "#091928";
const BG_MID = "#0d2137";
const BG_LIGHT = "#12304d";
const TEAL = "#64dfdf";

const SIZE = 1080;
const MARGIN = 96;

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (!paragraph.trim()) { lines.push(""); continue; }
    let line = "";
    for (const word of paragraph.trim().split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Draws the card and returns bare base64 PNG data (no data: prefix),
 * ready to hand to the existing upload route.
 */
export async function renderPostCard(caption: string): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // background
  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, BG_DARK);
  grad.addColorStop(0.55, BG_MID);
  grad.addColorStop(1, BG_LIGHT);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // teal glow, top-left
  const glow = ctx.createRadialGradient(SIZE * 0.78, SIZE * 0.14, 0, SIZE * 0.78, SIZE * 0.14, SIZE * 0.72);
  glow.addColorStop(0, "rgba(100,223,223,0.16)");
  glow.addColorStop(1, "rgba(100,223,223,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // dashed route line with two stops — same motif as the Facebook cover
  ctx.save();
  ctx.strokeStyle = "rgba(100,223,223,0.30)";
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 14]);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-40, SIZE * 0.94);
  ctx.bezierCurveTo(SIZE * 0.10, SIZE * 0.88, SIZE * 0.12, SIZE * 0.86, SIZE * 0.16, SIZE * 0.845);
  ctx.bezierCurveTo(SIZE * 0.52, SIZE * 0.72, SIZE * 0.62, SIZE * 0.30, SIZE * 0.84, SIZE * 0.155);
  ctx.bezierCurveTo(SIZE * 0.92, SIZE * 0.10, SIZE * 0.98, SIZE * 0.07, SIZE + 40, SIZE * 0.04);
  ctx.stroke();
  ctx.restore();

  // stops sit in the corners, clear of the centred caption block
  for (const [px, py] of [[SIZE * 0.84, SIZE * 0.155], [SIZE * 0.16, SIZE * 0.845]]) {
    ctx.fillStyle = "rgba(100,223,223,0.18)";
    ctx.beginPath(); ctx.arc(px, py, 21, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = TEAL;
    ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill();
  }

  // caption — RTL, right-aligned, auto-shrinking to fit
  ctx.direction = "rtl";
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";

  const maxWidth = SIZE - MARGIN * 2;
  const maxTextHeight = SIZE - MARGIN * 2 - 150; // leave room for the footer
  let fontSize = 62;
  let lines: string[] = [];
  let lineHeight = 0;

  // shrink until the whole caption fits; keeps long captions from overflowing
  while (fontSize >= 30) {
    ctx.font = `700 ${fontSize}px Rubik, 'Segoe UI', Arial, sans-serif`;
    lines = wrapLines(ctx, caption, maxWidth);
    lineHeight = fontSize * 1.42;
    if (lines.length * lineHeight <= maxTextHeight) break;
    fontSize -= 3;
  }

  const blockHeight = lines.length * lineHeight;
  let y = (SIZE - blockHeight) / 2 + fontSize - 40;
  ctx.shadowColor = "rgba(0,0,0,0.34)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 3;
  for (const line of lines) {
    ctx.fillText(line, SIZE - MARGIN, y);
    y += lineHeight;
  }
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // footer: logo + url
  const footerY = SIZE - MARGIN - 8;
  const logo = await loadImage("/icon-512.png");
  if (logo) {
    const s = 76;
    ctx.save();
    ctx.beginPath();
    const r = 18, lx = SIZE - MARGIN - s, ly = footerY - s + 14;
    ctx.moveTo(lx + r, ly);
    ctx.arcTo(lx + s, ly, lx + s, ly + s, r);
    ctx.arcTo(lx + s, ly + s, lx, ly + s, r);
    ctx.arcTo(lx, ly + s, lx, ly, r);
    ctx.arcTo(lx, ly, lx + s, ly, r);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(logo, lx, ly, s, s);
    ctx.restore();
  }

  ctx.direction = "ltr";
  ctx.textAlign = "right";
  ctx.font = `700 34px Rubik, 'Segoe UI', Arial, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText("tulon.app", SIZE - MARGIN - (logo ? 100 : 0), footerY);

  return canvas.toDataURL("image/png").split(",")[1];
}
