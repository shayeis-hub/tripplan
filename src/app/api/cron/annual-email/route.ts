import { NextRequest, NextResponse } from "next/server";
import { runAnnualBatch } from "@/lib/email/annual";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Daily from Dec 17 to Dec 31 (see vercel.json). Sends the yearly "My World" summary e-mail, at most 60 a run,
// exactly once per user per year. Does nothing unless emailConfig/lifecycle.annual.mode is "allowlist" or "all".
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const r = await runAnnualBatch();
  return NextResponse.json(r);
}
