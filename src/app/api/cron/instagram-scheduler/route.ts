import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { publishInstagramPost } from "@/lib/instagram-publish";

export const dynamic = "force-dynamic";

// Runs every 10 minutes (Vercel Pro — see vercel.json). Publishes every
// approved post whose scheduledFor has come due since the last run.
// Naturally duplicate-safe: a published post's status flips away from
// "approved", so it drops out of the query on the next tick.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminDb = getAdminDb();
  const now = new Date();

  const snap = await adminDb
    .collection("instagramPosts")
    .where("status", "==", "approved")
    .get();

  const due = snap.docs.filter(doc => {
    const scheduledFor = doc.data().scheduledFor;
    return scheduledFor && new Date(scheduledFor) <= now;
  });

  const results = [];
  for (const doc of due) {
    const result = await publishInstagramPost(doc.id);
    results.push({ id: doc.id, ...result });
  }

  return NextResponse.json({ checked: snap.size, published: results.filter(r => r.ok).length, results });
}
