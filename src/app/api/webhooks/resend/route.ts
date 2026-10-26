import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyWebhook } from "@/lib/email/provider";
import { emailHash } from "@/lib/email/tokens";
import { addSuppression } from "@/lib/email/suppression";

// Resend webhooks: https://resend.com/docs/webhooks/introduction. The signature
// is verified against the RAW body (svix-id / svix-timestamp / svix-signature).
// Subscribed events: email.delivered, email.bounced, email.complained,
// email.delivery_delayed, email.failed, email.suppressed.
//  - bounced (Permanent) -> suppression "bounce" (180 days, permanent on the 2nd)
//  - complained          -> suppression "complaint" (permanent)
// Delivery facts are stored on the matching emailEvents document. Nothing here
// logs an address or a payload.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const evt = verifyWebhook(raw, req.headers);
  if (!evt) return new NextResponse("invalid signature", { status: 400 });

  try {
    const data = ((evt as unknown as { data?: Record<string, unknown> }).data ?? {}) as Record<string, unknown>;
    const to = Array.isArray(data.to) ? (data.to as unknown[]).find((x): x is string => typeof x === "string") : undefined;
    const resendId = typeof data.email_id === "string" ? data.email_id : null;
    const db = getAdminDb();
    const now = Date.now();

    // The matching event, when we have one (an unrelated e-mail has none).
    let ref: FirebaseFirestore.DocumentReference | null = null;
    if (resendId) {
      const q = await db.collection("emailEvents").where("resendId", "==", resendId).limit(1).get();
      ref = q.empty ? null : q.docs[0].ref;
    }

    switch (evt.type) {
      case "email.delivered":
        if (ref) await ref.update({ deliveredAt: now });
        break;
      case "email.delivery_delayed":
        if (ref) await ref.update({ delayedAt: now });
        break;
      case "email.failed":
      case "email.suppressed":
        if (ref) await ref.update({ providerIssue: evt.type, providerIssueAt: now });
        break;
      case "email.bounced": {
        const bounce = (data.bounce ?? {}) as { type?: string; subType?: string };
        const permanent = String(bounce.type ?? "").toLowerCase() === "permanent";
        if (ref) await ref.update({ bouncedAt: now, bounceType: bounce.type ?? null, bounceSubType: bounce.subType ?? null });
        if (permanent && to) await addSuppression(emailHash(to), "bounce", { lastEvent: "email.bounced" });
        break;
      }
      case "email.complained":
        if (ref) await ref.update({ complainedAt: now });
        if (to) await addSuppression(emailHash(to), "complaint", { lastEvent: "email.complained" });
        break;
      default:
        break; // other events are not used
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("resend webhook error:", err instanceof Error ? err.name : "unknown");
    return new NextResponse("error", { status: 500 }); // Resend retries (8 attempts)
  }
}
