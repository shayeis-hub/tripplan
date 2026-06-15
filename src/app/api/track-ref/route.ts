import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

const CODE_RE = /^[A-Za-z0-9_-]{2,32}$/;

export async function POST(req: NextRequest) {
  try {
    const { code, landingPath } = await req.json();
    if (!code || typeof code !== "string" || !CODE_RE.test(code)) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const ua = req.headers.get("user-agent") || "";
    if (/bot|crawler|spider|preview|whatsapp|facebookexternalhit|telegram/i.test(ua)) {
      return NextResponse.json({ skipped: true });
    }

    await getAdminDb().collection("refClicks").add({
      code,
      ts: Date.now(),
      landingPath: typeof landingPath === "string" ? landingPath.slice(0, 200) : "",
      userAgent: ua.slice(0, 200),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
