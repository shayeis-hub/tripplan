import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/email/tokens";
import { ANNUAL_CTA_TARGET, ANNUAL_FLOW, CTA_TARGET, SITE_URL } from "@/lib/email/constants";

// Click on the e-mail's button. The token names only the e-mail event (no uid,
// no address). We record the click and always redirect to the one fixed
// destination per flow (a fixed constant, never taken from the request), so this cannot be used as an open redirect. Mail scanners also
// "click" links, so clicks are a rough signal; created_trip is the real metric.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const p = verifyToken(req.nextUrl.searchParams.get("t"));
  if (p?.k !== "c") return NextResponse.redirect(`${SITE_URL}/`, 302);
  let target = CTA_TARGET;
  try {
    const ref = getAdminDb().collection("emailEvents").doc(p.ev);
    const snap = await ref.get();
    if (snap.exists) {
      const now = Date.now();
      const d = snap.data() ?? {};
      if (typeof d.flow === "string" && d.flow.startsWith(ANNUAL_FLOW)) target = ANNUAL_CTA_TARGET;
      await ref.update({
        clickCount: (d.clickCount ?? 0) + 1,
        ...(d.firstClickAt ? {} : { firstClickAt: now }),
        lastClickAt: now,
      });
    }
  } catch (err) {
    // A tracking problem must never stop the person from reaching the app.
    console.error("email click record failed:", err instanceof Error ? err.name : "unknown");
  }
  const res = NextResponse.redirect(target, 302);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
