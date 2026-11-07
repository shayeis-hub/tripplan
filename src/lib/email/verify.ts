import { getAdminAuth } from "@/lib/firebase-admin";
import { VERIFY_FLOW, VERIFY_MAX_ACCOUNT_AGE_MS, VERIFY_VERSION, type EmailLang } from "./constants";
import { getVerifyConfig } from "./config";
import { emailHash, EmailConfigError } from "./tokens";
import { providerConfigured } from "./provider";
import { isAddressSuppressed } from "./suppression";
import { renderVerify } from "./templates";
import { deliver, readProfileLang, type WelcomeResult } from "./welcome";
import { firstNameOf, resolveEmailLang } from "./welcomeLogic";

// Address-verification e-mail for e-mail/password registrations. Google and Apple addresses arrive verified, a
// password address never was (nothing in the app sent a verification), so those people could not receive any
// lifecycle e-mail. The link is Firebase's own (Admin generateEmailVerificationLink), delivered through our Resend
// pipeline so it comes from hello@tulon.app, in the person's language, with the same exactly-once guard
// (emailEvents/{uid}__verify__v1). Only a very young, still unverified password account can ask for it, and only
// for its own address. Off unless emailConfig/lifecycle.verify.mode says otherwise. No log line has an address,
// a token or a uid.

export const verifyEventId = (uid: string) => `${uid}__${VERIFY_FLOW}__v${VERIFY_VERSION}`;

type Result = WelcomeResult | { status: "skipped"; reason: string; final: true };

export async function handleVerifyEmail(args: { uid: string; requestedLang: unknown; test?: boolean }): Promise<Result> {
  const cfg = await getVerifyConfig();
  const user = await getAdminAuth().getUser(args.uid);
  const email = user.email ?? null;
  if (!email) return { status: "skipped", reason: "no_email", final: true };
  // An admin test works whatever the switch says (it only ever goes to the admin's own address).
  if (!args.test && cfg.mode === "off") return { status: "skipped", reason: "disabled", final: true };
  if (!args.test && cfg.mode === "allowlist" && !cfg.allowlist.includes(email.trim().toLowerCase())) return { status: "skipped", reason: "not_allowlisted", final: true };
  if (!args.test && user.emailVerified) return { status: "skipped", reason: "already_verified", final: true };
  if (!args.test && !user.providerData.some((p) => p.providerId === "password")) return { status: "skipped", reason: "not_password", final: true };
  const created = Date.parse(user.metadata.creationTime);
  if (!args.test && (!created || Date.now() - created > VERIFY_MAX_ACCOUNT_AGE_MS)) return { status: "skipped", reason: "account_too_old", final: true };
  if (!providerConfigured()) return { status: "not_configured", final: false };

  let hash: string;
  try {
    hash = emailHash(email);
  } catch (e) {
    if (e instanceof EmailConfigError) return { status: "not_configured", final: false };
    throw e;
  }
  if (await isAddressSuppressed(hash)) return { status: "skipped", reason: "suppressed", final: true };

  const lang: EmailLang = resolveEmailLang(args.requestedLang, await readProfileLang(args.uid));
  const raw = await getAdminAuth().generateEmailVerificationLink(email, {
    // The apex is the authorized domain in Firebase Auth (www.tulon.app is not listed, and the Admin SDK rejects it
    // with "Domain not allowlisted by project"); it redirects to www.
    url: "https://tulon.app/?verified=1",
  });
  // Firebase's hosted page honours ?lang= for its own wording.
  const u = new URL(raw);
  u.searchParams.set("lang", lang);
  const verifyUrl = u.toString();

  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const eventId = args.test ? `${args.uid}__${VERIFY_FLOW}_test__${day}_${Date.now()}` : verifyEventId(args.uid);
  return deliver({
    eventId, uid: args.uid, email, firstName: firstNameOf(user.displayName), lang, hash,
    variantLabel: args.test ? "test" : "treatment", flow: args.test ? `${VERIFY_FLOW}_test` : VERIFY_FLOW, version: VERIFY_VERSION,
    render: () => renderVerify({ lang, firstName: firstNameOf(user.displayName), verifyUrl }),
  });
}
