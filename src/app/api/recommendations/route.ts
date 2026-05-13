import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { destination, lang } = await req.json();

    if (!destination) {
      return NextResponse.json({ error: "Missing destination" }, { status: 400 });
    }

    const isHe = lang === "he";

    const prompt = isHe
      ? `אתה מומחה טיולים. עבור היעד: "${destination}", תן המלצות בעברית.

החזר JSON בדיוק בפורמט הזה (ללא הסבר, ללא markdown):
{
  "attractions": [
    {"name": "שם האטרקציה", "description": "תיאור קצר של עד 60 תווים", "emoji": "🎭"},
    {"name": "...", "description": "...", "emoji": "..."},
    {"name": "...", "description": "...", "emoji": "..."},
    {"name": "...", "description": "...", "emoji": "..."},
    {"name": "...", "description": "...", "emoji": "..."}
  ],
  "restaurants": [
    {"name": "שם המסעדה", "description": "תיאור קצר של עד 60 תווים", "cuisine": "סוג מטבח", "emoji": "🍜"},
    {"name": "...", "description": "...", "cuisine": "...", "emoji": "..."},
    {"name": "...", "description": "...", "cuisine": "...", "emoji": "..."},
    {"name": "...", "description": "...", "cuisine": "...", "emoji": "..."},
    {"name": "...", "description": "...", "cuisine": "...", "emoji": "..."}
  ],
  "tip": "טיפ מקומי שימושי אחד של עד 100 תווים"
}`
      : `You are a travel expert. For the destination: "${destination}", provide recommendations in English.

Return JSON in exactly this format (no explanation, no markdown):
{
  "attractions": [
    {"name": "Attraction name", "description": "Short description up to 60 chars", "emoji": "🎭"},
    {"name": "...", "description": "...", "emoji": "..."},
    {"name": "...", "description": "...", "emoji": "..."},
    {"name": "...", "description": "...", "emoji": "..."},
    {"name": "...", "description": "...", "emoji": "..."}
  ],
  "restaurants": [
    {"name": "Restaurant name", "description": "Short description up to 60 chars", "cuisine": "Cuisine type", "emoji": "🍜"},
    {"name": "...", "description": "...", "cuisine": "...", "emoji": "..."},
    {"name": "...", "description": "...", "cuisine": "...", "emoji": "..."},
    {"name": "...", "description": "...", "cuisine": "...", "emoji": "..."},
    {"name": "...", "description": "...", "cuisine": "...", "emoji": "..."}
  ],
  "tip": "One useful local tip up to 100 chars"
}`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (response.content[0] as { type: string; text: string }).text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not parse recommendations" }, { status: 422 });
    }

    const data = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      attractions: Array.isArray(data.attractions) ? data.attractions.slice(0, 5) : [],
      restaurants: Array.isArray(data.restaurants) ? data.restaurants.slice(0, 5) : [],
      tip: typeof data.tip === "string" ? data.tip : null,
    });
  } catch (err: unknown) {
    console.error("recommendations error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
