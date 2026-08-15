import { NextResponse } from "next/server";
import { requireAdmin, signedUrlFor } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  try {
    const snap = await getAdminDb()
      .collection("instagramPosts")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const posts = await Promise.all(snap.docs.map(async doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        imageUrl: data.imagePath ? await signedUrlFor(data.imagePath) : null,
        createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
        updatedAt: data.updatedAt?.toDate?.().toISOString() ?? null,
        publishedAt: data.publishedAt?.toDate?.().toISOString() ?? null,
      };
    }));

    return NextResponse.json({ posts });
  } catch (err: unknown) {
    console.error("instagram queue error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
