import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { isEmailLang } from "@/lib/email/constants";
import { saveProfileLang } from "@/lib/email/welcome";

// Stores the user's language (he / en / es) on their profile: the single source
// of truth for the language of every e-mail, independent of push permission.
// Written through the Admin SDK, so no Firestore rules are involved.
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
  if (!isEmailLang(body?.lang)) return NextResponse.json({ error: "bad_lang" }, { status: 400 });
  try {
    await saveProfileLang(uid, body.lang, body?.source === "saved" ? "saved" : "device");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
