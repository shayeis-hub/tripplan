import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/email/tokens";
import { addSuppression } from "@/lib/email/suppression";
import { UNSUB_COPY } from "@/lib/email/templates";
import { isEmailLang, SITE_URL, type EmailLang } from "@/lib/email/constants";

// Unsubscribe (RFC 8058). GET only shows a confirmation page, because mail
// scanners and link previewers open every link and must not unsubscribe anyone.
// POST (the page's button, or a mail client's one-click request) performs it.
// The record is keyed by a keyed hash of the address and survives account
// deletion: it is an explicit instruction about the address.
export const dynamic = "force-dynamic";

const page = (lang: EmailLang, inner: string, status = 200) => {
  const c = UNSUB_COPY[lang];
  const dir = lang === "he" ? "rtl" : "ltr";
  const html = `<!doctype html><html lang="${lang}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${c.title}</title></head>
<body style="margin:0;background:#0d2137;color:#fff;font-family:Arial,'Segoe UI',sans-serif;">
<main style="max-width:420px;margin:12vh auto;padding:0 24px;text-align:center;">
<div style="font-size:30px;font-weight:900;margin-bottom:24px;">TU<span style="color:#64dfdf;">lon</span></div>
${inner}
</main></body></html>`;
  return new NextResponse(html, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
};

const langOf = (l: unknown): EmailLang => (isEmailLang(l) ? l : "en");

export async function GET(req: NextRequest) {
  const t = req.nextUrl.searchParams.get("t") ?? "";
  const p = verifyToken(t);
  if (p?.k !== "u") return page("en", `<p>This link is not valid.</p><p><a style="color:#64dfdf" href="${SITE_URL}/">TUlon</a></p>`, 400);
  const lang = langOf(p.l);
  const c = UNSUB_COPY[lang];
  return page(
    lang,
    `<h1 style="font-size:20px;margin:0 0 20px;">${c.ask}</h1>
<form method="post" action="/api/email/unsubscribe?t=${encodeURIComponent(t)}">
<button type="submit" style="background:#64dfdf;color:#0d2137;font-weight:800;font-size:16px;border:0;border-radius:999px;padding:12px 30px;cursor:pointer;">${c.button}</button>
</form>`,
  );
}

export async function POST(req: NextRequest) {
  const t = req.nextUrl.searchParams.get("t") ?? "";
  const p = verifyToken(t);
  if (p?.k !== "u") return new NextResponse("invalid", { status: 400 });
  try {
    const oneClick = (req.headers.get("content-type") ?? "").includes("application/x-www-form-urlencoded")
      ? (await req.text()).includes("List-Unsubscribe=One-Click")
      : false;
    await addSuppression(p.h, "unsubscribed", { source: oneClick ? "one_click" : "page", lastEvent: p.ev });
  } catch {
    return new NextResponse("error", { status: 500 });
  }
  const lang = langOf(p.l);
  const c = UNSUB_COPY[lang];
  // A mail client's one-click request only needs 200; a person gets a page.
  return page(lang, `<p style="font-size:17px;line-height:1.6;">${c.done}</p><p><a style="color:#64dfdf" href="${SITE_URL}/">${c.home}</a></p>`);
}
