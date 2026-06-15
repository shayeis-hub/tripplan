import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "shayeis@gmail.com";

async function assertAdmin(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    if (decoded.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return null;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const err = await assertAdmin(req);
  if (err) return err;

  try {
    const body = await req.json();
    const update: Record<string, unknown> = {};
    if (typeof body.name === "string")       update.name       = body.name.trim();
    if (typeof body.contact === "string")    update.contact    = body.contact.trim();
    if (typeof body.platform === "string")   update.platform   = body.platform.trim();
    if (typeof body.notes === "string")      update.notes      = body.notes.trim();
    if (typeof body.active === "boolean")    update.active     = body.active;
    if (typeof body.commission === "number" || body.commission === null) {
      update.commission = body.commission;
    }

    if (!Object.keys(update).length) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const { code } = await params;
    await getAdminDb().collection("partners").doc(code).update(update);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const err = await assertAdmin(req);
  if (err) return err;

  try {
    const { code } = await params;
    await getAdminDb().collection("partners").doc(code).delete();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
