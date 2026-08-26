import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { publishInstagramPost } from "@/lib/instagram-publish";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const result = await publishInstagramPost(id);
  if (!result.ok) return NextResponse.json({ error: result.error || "Unknown error" }, { status: result.status || 500 });
  return NextResponse.json({ ok: true, mediaId: result.mediaId, permalink: result.permalink });
}
