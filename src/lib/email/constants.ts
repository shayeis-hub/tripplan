// Lifecycle / onboarding e-mail: shared constants.
export const SITE_URL = "https://www.tulon.app";

// Sender. The domain must be verified in Resend. hello@ is the visible sender;
// replies go to Reply-To (a mailbox that actually exists).
export const EMAIL_FROM = "TUlon <hello@tulon.app>";
export const EMAIL_REPLY_TO = "shay@tulon.app";

export type EmailLang = "he" | "en" | "es";
export const isEmailLang = (v: unknown): v is EmailLang => v === "he" || v === "en" || v === "es";

export const WELCOME_FLOW = "welcome";
export const WELCOME_VERSION = 1;

// A welcome e-mail is only for an account that is still new. Beyond this the
// registration is "old" and nothing is sent, so a late retry or a returning
// user can never trigger it.
export const WELCOME_WINDOW_MS = 24 * 3600 * 1000;

// Retry policy for a send that definitely did NOT go out (provider rejected it
// with a transient error). An outcome we cannot know is never retried.
export const MAX_ATTEMPTS = 3;
export const RETRY_BACKOFF_MS = 10 * 60 * 1000;
export const STALE_RESERVATION_MS = 15 * 60 * 1000;

// Hard bounces suppress for this long; a second one is permanent.
export const BOUNCE_SUPPRESSION_MS = 180 * 24 * 3600 * 1000;

// The only page a tracked CTA ever leads to (fixed, so the redirect endpoint is
// not an open redirect). "start=newtrip" is handled in TripPlan.jsx.
export const CTA_TARGET = `${SITE_URL}/?start=newtrip&utm_source=email&utm_medium=lifecycle&utm_campaign=welcome`;
