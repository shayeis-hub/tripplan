import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BRAND_CONTEXT = `Tulon (טיולון, www.tulon.app) is a free app for planning group trips together, in Hebrew (primary audience: Israeli travelers), with English and Spanish support. It is completely free, no ads, no premium tier.

Standout features to draw content ideas from:
- AI receipt scan: photograph a receipt, it auto-fills amount/currency/date/category
- Automatic group settlement: calculates the minimum number of transactions to settle up between friends
- Multi-currency auto-conversion with live rates
- Kosher restaurant filter in the Discover tab
- Optimal walking route planner between the day's places
- Daily weather forecast per trip day
- Full offline support
- Real-time sync between everyone in the group (Firebase-backed)
- 7 blog articles at tulon.app/blog with travel planning tips

Brand voice: warm, practical, friendly — like a well-organized friend who already planned five group trips. Speaks directly to the pain of group trip logistics (who owes who, lost receipts, arguing over the itinerary). No emojis. No hard selling — show, don't tell, focused on a single relatable trip-planning pain point per post.`;

interface Idea { topic: string; caption: string; hashtags: string[] }

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const adminDb = getAdminDb();

  try {
    const body = await req.json().catch(() => ({}));
    const topic: string | undefined = body?.topic;
    const count: number = Math.min(Math.max(Number(body?.count) || 3, 1), 6);

    const prompt = `${BRAND_CONTEXT}

Write ${count} distinct Instagram post ideas for Tulon${topic ? `, all centered on this specific topic/angle: "${topic}"` : ", each built around a different feature or pain point from the list above"}.

For each idea return:
- "topic": short internal label (2-4 words, Hebrew)
- "caption": the actual Instagram caption in Hebrew, 2-5 short lines, no emojis, no hashtags inline. End with a light call-to-action pointing at the free app (not pushy).
- "hashtags": 8-12 relevant hashtags as an array of strings (without the # symbol), mixing Hebrew and English, mixing broad travel tags with niche group-trip-planning tags.

Return ONLY a JSON array (no markdown fences, no commentary) of ${count} objects with exactly these three keys.`;

    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const textPart = response.content.find(c => c.type === "text") as { type: string; text: string } | undefined;
    const raw = (textPart?.text || "").trim();

    const firstOpen = raw.indexOf("[");
    const lastClose = raw.lastIndexOf("]");
    if (firstOpen === -1 || lastClose <= firstOpen) {
      return NextResponse.json({ error: "Could not parse generated ideas" }, { status: 502 });
    }

    const ideas = JSON.parse(raw.slice(firstOpen, lastClose + 1)) as Idea[];

    const batch = adminDb.batch();
    const created: Record<string, unknown>[] = [];
    for (const idea of ideas) {
      if (!idea?.caption) continue;
      const ref = adminDb.collection("instagramPosts").doc();
      const doc = {
        topic: idea.topic || topic || "",
        caption: idea.caption,
        hashtags: Array.isArray(idea.hashtags) ? idea.hashtags : [],
        imagePath: null,
        status: "draft" as const,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        publishedAt: null,
        igMediaId: null,
        igPermalink: null,
        error: null,
      };
      batch.set(ref, doc);
      created.push({ id: ref.id, ...doc, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    await batch.commit();

    return NextResponse.json({ created });
  } catch (err: unknown) {
    console.error("instagram generate error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
