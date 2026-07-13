import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { destination, lang, kosher } = await req.json();

    if (!destination) {
      return NextResponse.json({ error: "Missing destination" }, { status: 400 });
    }

    const kosherNote = kosher
      ? (lang === "he"
          ? `\n\nחשוב מאוד: תחת "restaurants" כלול אך ורק מסעדות שהן כשרות באמת (בהשגחה/כשרות ידועה) ביעד הזה או בקרבתו, למשל ליד בית חב"ד. אם אינך בטוח לגבי מסעדה — אל תכלול אותה. עדיף להחזיר פחות מסעדות מאשר להמציא. הוסף בשדה cuisine את המילה "כשר".`
          : lang === "es"
          ? `\n\nMUY IMPORTANTE: en "restaurants" incluye SOLO restaurantes que sean realmente kosher (con certificación conocida) en o cerca de este destino, p. ej. cerca de una Casa Jabad. Si no estás seguro de un restaurante, NO lo incluyas. Es mejor devolver menos que inventar. Añade "kosher" en el campo cuisine.`
          : `\n\nVERY IMPORTANT: under "restaurants" include ONLY genuinely kosher restaurants (with known certification) in or near this destination, e.g. near a Chabad House. If you are unsure about a restaurant, do NOT include it. Returning fewer is better than inventing. Add "kosher" to the cuisine field.`)
      : "";

    const prompt =
      lang === "he"
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
        : lang === "es"
        ? `Eres un experto en viajes. Para el destino: "${destination}", proporciona recomendaciones en español.

Devuelve JSON exactamente en este formato (sin explicación, sin markdown):
{
  "attractions": [
    {"name": "Nombre de la atracción", "description": "Descripción corta hasta 60 caracteres", "emoji": "🎭"},
    {"name": "...", "description": "...", "emoji": "..."},
    {"name": "...", "description": "...", "emoji": "..."},
    {"name": "...", "description": "...", "emoji": "..."},
    {"name": "...", "description": "...", "emoji": "..."}
  ],
  "restaurants": [
    {"name": "Nombre del restaurante", "description": "Descripción corta hasta 60 caracteres", "cuisine": "Tipo de cocina", "emoji": "🍜"},
    {"name": "...", "description": "...", "cuisine": "...", "emoji": "..."},
    {"name": "...", "description": "...", "cuisine": "...", "emoji": "..."},
    {"name": "...", "description": "...", "cuisine": "...", "emoji": "..."},
    {"name": "...", "description": "...", "cuisine": "...", "emoji": "..."}
  ],
  "tip": "Un consejo local útil hasta 100 caracteres"
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
      messages: [{ role: "user", content: prompt + kosherNote }],
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
