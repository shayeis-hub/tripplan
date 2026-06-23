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
      ? `\nThe trip uses these currencies: ${currencies.join(", ")}. If the receipt's currency is ambiguous (e.g. a bare "$" that could be USD/AUD/CAD/SGD), prefer whichever of these the receipt's country/language best matches.`
      : "";

    const prompt = `You are an expert receipt-scanning assistant. Carefully read this receipt image — it may be a faded thermal print, photographed at an angle, or in a foreign language. Extract the key information.

First think briefly, then return a single JSON object as the LAST thing in your reply (no markdown fences):
{
  "amount": <final total as a number, null if not readable>,
  "currency": "<ISO 4217 code: ILS for ₪, USD for $, EUR for €, GBP for £, THB for ฿, JPY for ¥, AUD for A$, CAD for C$, CHF, SGD, NOK, SEK, DKK, HUF, CZK, PLN, TRY, MXN, INR, CNY, HKD, KRW, NZD — detect from symbol/text/country>",
  "description": "<merchant name, max 40 chars>",
  "category": "<one of: flight | hotel | attraction | food | taxi | shopping | other>",
  "date": "<YYYY-MM-DD if clearly visible, otherwise null>"
}

Amount rules:
- Use the FINAL grand total actually paid (after tax, tip, service charge and discounts) — usually the largest, bottom-most "Total"/"סה״כ"/"Total a pagar" line. Do NOT use a subtotal, an item price, "amount due before tip", or a change-given figure.
- Read digits carefully: respect the local decimal separator (e.g. "1.234,56" in Europe = 1234.56; "1,234.56" = 1234.56). Never include the currency symbol in the number.

Currency rules:
- Detect from the symbol AND surrounding text/language/country, not the symbol alone.${currencyHint}

Category rules:
- food: restaurants, cafes, bars, supermarkets, food delivery
- hotel: hotels, hostels, Airbnb, accommodation
- flight: airlines, airports
- taxi: taxis, Uber, Lyft, ride-share, car rental, fuel
- attraction: museums, tours, activities, theme parks, tickets
- shopping: clothing, electronics, souvenirs, retail stores, duty-free
- other: anything that fits none of the above

Date rules:
- Convert to YYYY-MM-DD. Watch DD/MM vs MM/DD: a European/Israeli receipt is almost always DD/MM/YYYY; a US receipt is MM/DD/YYYY. If a part is >12 it disambiguates the order.

Return null for any field you cannot read with reasonable confidence — a wrong guess is worse than null.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
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

    const textPart = response.content.find(c => c.type === "text") as { type: string; text: string } | undefined;
    const raw = (textPart?.text || "").trim();

    // Grab the LAST {...} block, since the model may reason before emitting JSON.
    const lastOpen = raw.lastIndexOf("{");
    const lastClose = raw.lastIndexOf("}");
    if (lastOpen === -1 || lastClose <= lastOpen) {
      return NextResponse.json({ error: "Could not parse receipt" }, { status: 422 });
    }

    const data = JSON.parse(raw.slice(lastOpen, lastClose + 1));

    return NextResponse.json({
      amount: typeof data.amount === "number" ? data.amount : null,
      currency: typeof data.currency === "string" ? data.currency.toUpperCase() : null,
      description: typeof data.description === "string" ? data.description : null,
      category: ["flight","hotel","attraction","food","taxi","shopping","other"].includes(data.category)
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
