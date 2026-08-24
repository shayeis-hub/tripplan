import { NextResponse } from "next/server";
import { requireAdmin, signedUrlFor } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { createMediaContainer, publishContainer, getMediaPermalink, postToFacebookPage } from "@/lib/instagram";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const ref = getAdminDb().collection("instagramPosts").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const post = snap.data()!;
  if (post.status !== "approved") {
    return NextResponse.json({ error: "Post must be approved before publishing" }, { status: 409 });
  }
  if (!post.imagePath) {
    return NextResponse.json({ error: "Post has no image attached" }, { status: 409 });
  }

  const fullCaption = [post.caption, (post.hashtags || []).map((h: string) => `#${h}`).join(" ")]
    .filter(Boolean)
    .join("\n\n");

  try {
    const imageUrl = await signedUrlFor(post.imagePath);
    const containerId = await createMediaContainer(imageUrl, fullCaption);
    const mediaId = await publishContainer(containerId);
    const permalink = await getMediaPermalink(mediaId).catch(() => null);

    const update: Record<string, unknown> = {
      status: "published",
      igMediaId: mediaId,
      igPermalink: permalink,
      publishedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      error: null,
    };

    // Facebook cross-post is opt-in per post and best-effort: a failure here
    // doesn't roll back the Instagram publish, which already succeeded.
    if (post.postToFacebook) {
      try {
        const fb = await postToFacebookPage(imageUrl, fullCaption);
        update.fbPostId = fb.postId;
        update.fbPermalink = fb.permalink;
        update.fbError = null;
      } catch (fbErr: unknown) {
        update.fbError = fbErr instanceof Error ? fbErr.message : "Unknown Facebook error";
      }
    }

    await ref.update(update);

    return NextResponse.json({ ok: true, mediaId, permalink });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("instagram publish error:", message);
    await ref.update({ status: "failed", error: message, updatedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
