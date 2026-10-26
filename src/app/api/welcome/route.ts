import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { handleWelcome } from "@/lib/email/welcome";

// Called (fire-and-forget) by the client after a new sign-in. The uid comes
// from the verified ID token, never from the body. Always answers quickly with a
// small status; the registration never depends on this route.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let uid: string;
  try {
    uid = (await getAdminAuth().verifyIdToken(token)).uid;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  try {
    const r = await handleWelcome({
      uid,
      requestedLang: body?.lang,
      langSource: body?.langSource === "saved" ? "saved" : "device",
    });
    return NextResponse.json({ status: r.status, final: r.final });
  } catch (err) {
    console.error("welcome error:", err instanceof Error ? err.name : "unknown");
    return NextResponse.json({ status: "error", final: false }, { status: 500 });
  }
}
