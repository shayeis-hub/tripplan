import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType, lang, currencies } = await req.json();

    if (!imageBase64 || !mediaType) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    const currencyHint = currencies?.length
      ? `The trip uses these currencies: ${currencies.join(", ")}. Prefer one of them if it matches the receipt.`
      : "";

    const prompt = `You are a receipt scanning assistant. Analyze this receipt image and extract the key information.

Return ONLY a valid JSON object with these fields (no explanation, no markdown):
{
  "amount": <total amount as a number, null if not readable>,
  "currency": "<ISO 4217 code: ILS for ₪, USD for $, EUR for €, GBP for £, THB for ฿, JPY for ¥, AUD for A$, CAD for C$, CHF, SGD, NOK, SEK, DKK, HUF, CZK, PLN, TRY, MXN, INR, CNY, HKD, KRW, NZD — detect from symbol/text on receipt>",
  "description": "<merchant name or brief description, max 40 chars>",
  "category": "<one of: flight | hotel | attraction | food | taxi | other>",
  "date": "<YYYY-MM-DD if clearly visible on the receipt, otherwise null>"
}

Category rules:
- food: restaurants, cafes, bars, supermarkets, food delivery
- hotel: hotels, hostels, Airbnb, accommodation
- flight: airlines, airports
- taxi: taxis, Uber, Lyft, ride-share, car rental
- attraction: museums, tours, activities, theme parks, tickets
- other: anything else

${currencyHint}

Important: amount should be the FINAL TOTAL on the receipt (after tax, tips, discounts). Return null for any field you cannot determine with reasonable confidence.`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: imageBase64,
              },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const raw = (response.content[0] as { type: string; text: string }).text.trim();

    // Extract JSON even if Claude wraps it in markdown
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not parse receipt" }, { status: 422 });
    }

    const data = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      amount: typeof data.amount === "number" ? data.amount : null,
      currency: typeof data.currency === "string" ? data.currency.toUpperCase() : null,
      description: typeof data.description === "string" ? data.description : null,
      category: ["flight","hotel","attraction","food","taxi","other"].includes(data.category)
        ? data.category : "other",
      date: typeof data.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.date)
        ? data.date : null,
    });
  } catch (err: unknown) {
    console.error("scan-receipt error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
