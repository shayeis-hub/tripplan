import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => ({}));
  const caption: string = (body?.caption || "").trim();
  if (!caption) return NextResponse.json({ error: "Caption is required" }, { status: 400 });

  const hashtags: string[] = Array.isArray(body?.hashtags) ? body.hashtags : [];
  const topic: string = typeof body?.topic === "string" ? body.topic : "";
  const scheduledFor: string | null = typeof body?.scheduledFor === "string" && body.scheduledFor ? body.scheduledFor : null;
  const postToFacebook: boolean = !!body?.postToFacebook;

  const adminDb = getAdminDb();
  const ref = adminDb.collection("instagramPosts").doc();
  const doc = {
    topic,
    caption,
    hashtags,
    imageQuery: "",
    imagePath: null,
    status: "draft" as const,
    scheduledFor,
    postToFacebook,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    publishedAt: null,
    igMediaId: null,
    igPermalink: null,
    error: null,
  };
  await ref.set(doc);

  return NextResponse.json({
    id: ref.id,
    ...doc,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
