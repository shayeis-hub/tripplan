import { NextResponse } from "next/server";
import { requireAdmin, signedUrlFor } from "@/lib/admin-auth";
import { getAdminDb, getAdminStorage } from "@/lib/firebase-admin";
import { searchStockPhotos, isPexelsImageUrl } from "@/lib/pexels";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

// GET ?q=... — search Pexels for candidate photos
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ error: "Missing q" }, { status: 400 });

  try {
    return NextResponse.json({ photos: await searchStockPhotos(q) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

// POST { id, photoUrl } — fetch the chosen photo and attach it to the post
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  try {
    const { id, photoUrl, credit } = await req.json();
    if (!id || !photoUrl) return NextResponse.json({ error: "Missing id/photoUrl" }, { status: 400 });
    if (!isPexelsImageUrl(photoUrl)) {
      return NextResponse.json({ error: "Only Pexels image URLs are allowed" }, { status: 400 });
    }

    const imgRes = await fetch(photoUrl);
    if (!imgRes.ok) return NextResponse.json({ error: `Fetch failed (${imgRes.status})` }, { status: 502 });

    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "URL did not return an image" }, { status: 400 });
    }
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    const path = `instagram-posts/${id}.jpg`;
    await getAdminStorage().bucket().file(path).save(buffer, {
      contentType,
      metadata: { cacheControl: "public,max-age=3600" },
    });

    await getAdminDb().collection("instagramPosts").doc(id).update({
      imagePath: path,
      imageCredit: credit || null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ imageUrl: await signedUrlFor(path) });
  } catch (err: unknown) {
    console.error("instagram stock error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
