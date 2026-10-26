import { Resend } from "resend";
import { EMAIL_FROM, EMAIL_REPLY_TO } from "./constants";
import { classifyProviderError } from "./welcomeLogic";

// The only place that talks to Resend. API shape per Resend's Node SDK:
// emails.send(payload, { idempotencyKey }) resolves to { data, error } and does
// not throw on API errors (https://resend.com/docs/send-with-nextjs).

export type SendOutcome =
  | { kind: "sent"; id: string }
  | { kind: "failed"; retryable: boolean; errorName: string; statusCode: number | null }
  | { kind: "unknown"; errorName: string };

let client: Resend | null = null;
const getClient = (): Resend | null => {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return (client ??= new Resend(key));
};

export const providerConfigured = () => !!process.env.RESEND_API_KEY;

export interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
  unsubscribeUrl: string;
  idempotencyKey: string; // per attempt, max 256 chars, valid 24h at Resend
  tags: { name: string; value: string }[]; // ASCII letters, digits, _ and - only
}

export async function sendEmail(a: SendArgs): Promise<SendOutcome> {
  const resend = getClient();
  if (!resend) return { kind: "failed", retryable: false, errorName: "not_configured", statusCode: null };
  try {
    const { data, error } = await resend.emails.send(
      {
        from: EMAIL_FROM,
        to: [a.to],
        replyTo: EMAIL_REPLY_TO,
        subject: a.subject,
        html: a.html,
        text: a.text,
        headers: {
          "List-Unsubscribe": `<${a.unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
        tags: a.tags,
      },
      { idempotencyKey: a.idempotencyKey },
    );
    if (error) {
      const kind = classifyProviderError(error);
      if (kind === "unknown") return { kind: "unknown", errorName: error.name };
      return { kind: "failed", retryable: kind === "transient", errorName: error.name, statusCode: error.statusCode };
    }
    if (!data?.id) return { kind: "unknown", errorName: "no_id" };
    return { kind: "sent", id: data.id };
  } catch {
    // Thrown (network): the request may have reached Resend.
    return { kind: "unknown", errorName: "exception" };
  }
}

// Webhook signature check (raw body required): resend.webhooks.verify throws on
// an invalid signature (https://resend.com/docs/webhooks/verify-webhooks-requests).
export function verifyWebhook(payload: string, headers: { get(name: string): string | null }) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return null;
  // The key is not used for verification, but the SDK needs an instance.
  const r = new Resend(process.env.RESEND_API_KEY || "re_unused");
  try {
    return r.webhooks.verify({
      payload,
      headers: {
        id: headers.get("svix-id") ?? "",
        timestamp: headers.get("svix-timestamp") ?? "",
        signature: headers.get("svix-signature") ?? "",
      },
      webhookSecret: secret,
    });
  } catch {
    return null;
  }
}
