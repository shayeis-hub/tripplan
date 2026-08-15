import { NextResponse } from "next/server";
import { requireAdmin, signedUrlFor } from "@/lib/admin-auth";
import { getAdminDb, getAdminStorage } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
};

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  try {
    const { id, imageBase64, contentType } = await req.json();
    if (!id || !imageBase64 || !contentType) {
      return NextResponse.json({ error: "Missing id/imageBase64/contentType" }, { status: 400 });
    }
    const ext = ALLOWED_TYPES[contentType];
    if (!ext) {
      return NextResponse.json({ error: "Unsupported image type — use JPEG or PNG" }, { status: 400 });
    }

    const buffer = Buffer.from(imageBase64, "base64");
    const bucket = getAdminStorage().bucket();
    const path = `instagram-posts/${id}.${ext}`;
    const file = bucket.file(path);

    await file.save(buffer, { contentType, metadata: { cacheControl: "public,max-age=3600" } });

    await getAdminDb().collection("instagramPosts").doc(id).update({
      imagePath: path,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ imageUrl: await signedUrlFor(path) });
  } catch (err: unknown) {
    console.error("instagram upload error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
