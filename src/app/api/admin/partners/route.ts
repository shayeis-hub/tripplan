import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "shayeis@gmail.com";

async function assertAdmin(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    if (decoded.email !== ADMIN_EMAIL) {
      return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return { error: null };
  } catch {
    return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
  }
}

export async function GET(req: Request) {
  const a = await assertAdmin(req);
  if (a.error) return a.error;

  try {
    const db = getAdminDb();
    const [partnersSnap, clicksSnap] = await Promise.all([
      db.collection("partners").orderBy("createdAt", "desc").get(),
      db.collection("refClicks").get(),
    ]);

    const clicksByCode: Record<string, number> = {};
    const lastClickByCode: Record<string, number> = {};
    clicksSnap.forEach(d => {
      const { code, ts } = d.data() as { code: string; ts: number };
      if (!code) return;
      clicksByCode[code] = (clicksByCode[code] || 0) + 1;
      if (!lastClickByCode[code] || ts > lastClickByCode[code]) lastClickByCode[code] = ts;
    });

    const partners = partnersSnap.docs.map(d => {
      const data = d.data();
      return {
        code: d.id,
        name: data.name || "",
        contact: data.contact || "",
        platform: data.platform || "",
        commission: data.commission ?? null,
        notes: data.notes || "",
        active: data.active !== false,
        createdAt: data.createdAt || 0,
        clicks: clicksByCode[d.id] || 0,
        lastClick: lastClickByCode[d.id] || 0,
      };
    });

    return NextResponse.json({ partners });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

const CODE_RE = /^[A-Za-z0-9_-]{2,32}$/;

function slugify(name: string): string {
  const base = name.toLowerCase()
    .replace(/[֐-׿]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 10);
  const suffix = Math.floor(Math.random() * 900 + 100);
  return base ? `${base}${suffix}` : `p${Date.now().toString(36).slice(-6)}`;
}

export async function POST(req: Request) {
  const a = await assertAdmin(req);
  if (a.error) return a.error;

  try {
    const body = await req.json();
    const { name, contact, platform, commission, notes } = body;
    let { code } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const db = getAdminDb();

    if (code) {
      if (!CODE_RE.test(code)) {
        return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
      }
    } else {
      for (let i = 0; i < 5; i++) {
        const candidate = slugify(name);
        const exists = await db.collection("partners").doc(candidate).get();
        if (!exists.exists) { code = candidate; break; }
      }
      if (!code) return NextResponse.json({ error: "Could not generate code" }, { status: 500 });
    }

    const existing = await db.collection("partners").doc(code).get();
    if (existing.exists) {
      return NextResponse.json({ error: "Code already in use" }, { status: 409 });
    }

    await db.collection("partners").doc(code).set({
      name: name.trim(),
      contact: contact?.trim() || "",
      platform: platform?.trim() || "",
      commission: typeof commission === "number" ? commission : null,
      notes: notes?.trim() || "",
      active: true,
      createdAt: Date.now(),
    });

    return NextResponse.json({ code, success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
