import { getAdminDb } from "@/lib/firebase-admin";
import { signedUrlFor } from "@/lib/admin-auth";
import { createMediaContainer, publishContainer, getMediaPermalink, postToFacebookPage } from "@/lib/instagram";
import { FieldValue } from "firebase-admin/firestore";

// Flat shape (not a discriminated union) on purpose: this project's tsconfig
// has strictNullChecks off, under which `if (!result.ok)` control-flow
// narrowing on a `{ok:true;...}|{ok:false;...}` union silently fails to pick
// the right branch (verified in isolation — same failure with no Next.js
// involved at all). Optional fields checked directly sidestep that entirely.
export type PublishResult = {
  ok: boolean;
  mediaId?: string;
  permalink?: string | null;
  error?: string;
  status?: number;
};

// Shared by the manual "publish now" button and the scheduled cron — one
// place for the actual Instagram (+ optional Facebook) publish flow so both
// callers can't drift out of sync.
export async function publishInstagramPost(id: string): Promise<PublishResult> {
  const adminDb = getAdminDb();
  const ref = adminDb.collection("instagramPosts").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, error: "Post not found", status: 404 };

  const post = snap.data()!;
  if (post.status !== "approved") {
    return { ok: false, error: "Post must be approved before publishing", status: 409 };
  }
  if (!post.imagePath) {
    return { ok: false, error: "Post has no image attached", status: 409 };
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

    return { ok: true, mediaId, permalink };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("instagram publish error:", message);
    await ref.update({ status: "failed", error: message, updatedAt: FieldValue.serverTimestamp() });
    return { ok: false, error: message, status: 502 };
  }
}
