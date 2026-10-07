import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { classifySource, sanitizeFirstTouch } from "@/lib/acquisition";

// Records the FIRST acquisition source of a brand-new registration.
//  - Authenticated: the uid comes from the verified ID token.
//  - Only accounts created in the last 24h are accepted, so this can never
//    be used to attach an invented source to an older account.
//  - create() (not set) makes the write first-wins: a later call for the same
//    uid fails with ALREADY_EXISTS and nothing is overwritten.
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let uid: string;
    try {
      uid = (await getAdminAuth().verifyIdToken(token)).uid;
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authUser = await getAdminAuth().getUser(uid);
    const registeredAt = Date.parse(authUser.metadata.creationTime);
    if (!registeredAt || Date.now() - registeredAt > 24 * 3600 * 1000) {
      return NextResponse.json({ ok: true, skipped: "not_new" });
    }

    const body = await req.json().catch(() => ({}));
    const ft = sanitizeFirstTouch(body);
    const now = Date.now();

    try {
      await getAdminDb().collection("userAcquisition").doc(uid).create({
        utmSource: ft.utmSource ?? null,
        utmMedium: ft.utmMedium ?? null,
        utmCampaign: ft.utmCampaign ?? null,
        referrer: ft.referrer ?? null,
        landing: ft.landing ?? null,
        platform: ft.platform ?? "web",
        firstSeenAt: ft.firstSeenAt && ft.firstSeenAt <= now ? ft.firstSeenAt : null,
        registeredAt,
        recordedAt: now,
        sourceGroup: classifySource(ft),
      });
    } catch (e) {
      // gRPC code 6 = ALREADY_EXISTS: the first touch is kept, as intended.
      const err = e as { code?: number; message?: string };
      if (err?.code === 6 || /already exists/i.test(err?.message || "")) {
        return NextResponse.json({ ok: true, existing: true });
      }
      throw e;
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("acquisition error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
