import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminDb, getAdminStorage } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

const EDITABLE_FIELDS = ["caption", "hashtags", "topic", "status"] as const;
const ALLOWED_STATUSES = ["draft", "approved", "published", "failed"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  for (const key of EDITABLE_FIELDS) {
    if (key in body) update[key] = body[key];
  }
  if (typeof update.status === "string" && !ALLOWED_STATUSES.includes(update.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const ref = getAdminDb().collection("instagramPosts").doc(id);
    await ref.update(update);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("instagram patch error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const { id } = await params;

  try {
    const ref = getAdminDb().collection("instagramPosts").doc(id);
    const snap = await ref.get();
    const imagePath = snap.data()?.imagePath as string | undefined;

    if (imagePath) {
      await getAdminStorage().bucket().file(imagePath).delete({ ignoreNotFound: true });
    }
    await ref.delete();

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("instagram delete error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
