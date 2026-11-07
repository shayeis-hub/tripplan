import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { handleVerifyEmail } from "@/lib/email/verify";

// Called by the client right after an e-mail/password registration. The uid comes from the verified ID token,
// never from the body; the address is always the account's own. Answers with a small status; the registration
// never depends on this route.
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
    const r = await handleVerifyEmail({ uid, requestedLang: body?.lang });
    return NextResponse.json({ status: r.status });
  } catch (err) {
    console.error("verify-email error:", err instanceof Error ? err.name : "unknown");
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
