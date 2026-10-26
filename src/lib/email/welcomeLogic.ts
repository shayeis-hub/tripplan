import {
  MAX_ATTEMPTS,
  RETRY_BACKOFF_MS,
  STALE_RESERVATION_MS,
  WELCOME_WINDOW_MS,
  isEmailLang,
  type EmailLang,
} from "./constants";

// Pure decisions for the welcome e-mail (no I/O), so they can be tested.

export type SkipReason =
  | "disabled"
  | "not_allowlisted"
  | "before_eligible_since"
  | "account_too_old"
  | "no_email"
  | "unverified"
  | "apple_relay"
  | "suppressed";

// Reasons that are final for this account and worth recording on the event
// (the others are re-evaluated on a later call, or are configuration).
export const RECORDED_SKIPS: SkipReason[] = ["unverified", "apple_relay", "suppressed"];

export interface WelcomeConfig {
  mode: "off" | "allowlist" | "all";
  allowlist: string[]; // lower-cased addresses
  eligibleSince: number; // epoch ms; only used in "all" mode
  controlPct: number; // 0-100 holdout, 0 = everyone eligible gets it
}

export const DEFAULT_WELCOME_CONFIG: WelcomeConfig = {
  mode: "off",
  allowlist: [],
  eligibleSince: Number.MAX_SAFE_INTEGER,
  controlPct: 0,
};

export interface AccountFacts {
  email: string | null;
  emailVerified: boolean;
  createdAtMs: number | null;
  now: number;
}

// Apple "Hide My Email" addresses only receive mail from senders registered with
// Apple; unregistered mail is dropped and counts against our reputation.
const APPLE_RELAY = /@privaterelay\.appleid\.com$/i;

export function evaluateEligibility(
  f: AccountFacts,
  cfg: WelcomeConfig,
): { ok: true } | { ok: false; reason: SkipReason } {
  if (!f.email) return { ok: false, reason: "no_email" };
  if (cfg.mode === "off") return { ok: false, reason: "disabled" };
  if (cfg.mode === "allowlist" && !cfg.allowlist.includes(f.email.trim().toLowerCase())) {
    return { ok: false, reason: "not_allowlisted" };
  }
  if (f.createdAtMs == null || f.now - f.createdAtMs > WELCOME_WINDOW_MS) return { ok: false, reason: "account_too_old" };
  if (cfg.mode === "all" && f.createdAtMs < cfg.eligibleSince) return { ok: false, reason: "before_eligible_since" };
  if (!f.emailVerified) return { ok: false, reason: "unverified" };
  if (APPLE_RELAY.test(f.email)) return { ok: false, reason: "apple_relay" };
  return { ok: true };
}

// First name only when it is reliably a name: the first word of the provider's
// display name, letters (and ' - ) only. Never guessed from the address.
export function firstNameOf(displayName: string | null | undefined): string | null {
  const first = (displayName ?? "").trim().split(/\s+/)[0] ?? "";
  return /^[\p{L}][\p{L}'’-]{0,29}$/u.test(first) ? first : null;
}

// Language of the e-mail: what the user was using at registration; else the
// profile value; else English. Never guessed from country or address.
export function resolveEmailLang(requested: unknown, stored: unknown): EmailLang {
  if (isEmailLang(requested)) return requested;
  if (isEmailLang(stored)) return stored;
  return "en";
}

export type EventStatus = "reserved" | "sent" | "failed" | "unknown" | "skipped" | "held_out";

export interface ExistingEvent {
  status: EventStatus;
  attempts: number;
  reservedAt?: number;
  lastAttemptAt?: number;
  retryable?: boolean;
}

export type NextAction =
  | { action: "create" }
  | { action: "retry" }
  | { action: "mark_unknown" }
  | {
      action: "stop";
      reason: "sent" | "unknown" | "skipped" | "held_out" | "in_flight" | "backoff" | "max_attempts" | "not_retryable";
    };

export function decideNext(ex: ExistingEvent | null, now: number): NextAction {
  if (!ex) return { action: "create" };
  switch (ex.status) {
    case "sent":
    case "unknown":
    case "skipped":
    case "held_out":
      return { action: "stop", reason: ex.status };
    case "reserved":
      // A reservation that never became sent/failed: the process died after
      // (maybe) calling the provider. Never resend an unknown outcome.
      return now - (ex.reservedAt ?? 0) > STALE_RESERVATION_MS
        ? { action: "mark_unknown" }
        : { action: "stop", reason: "in_flight" };
    case "failed":
      if (ex.retryable === false) return { action: "stop", reason: "not_retryable" };
      if (ex.attempts >= MAX_ATTEMPTS) return { action: "stop", reason: "max_attempts" };
      if (now - (ex.lastAttemptAt ?? 0) < RETRY_BACKOFF_MS) return { action: "stop", reason: "backoff" };
      return { action: "retry" };
  }
}

// Provider error -> did the e-mail definitely not go out, and is a retry sensible?
export function classifyProviderError(e: {
  name?: string;
  statusCode?: number | null;
}): "unknown" | "transient" | "permanent" {
  // No HTTP status: the request may or may not have reached the provider.
  if (e.statusCode == null) return "unknown";
  if (e.statusCode >= 500) return "transient";
  if (
    e.name === "rate_limit_exceeded" ||
    e.name === "daily_quota_exceeded" ||
    e.name === "concurrent_idempotent_requests"
  ) {
    return "transient";
  }
  return "permanent";
}

export type SuppressionReason = "unsubscribed" | "bounce" | "complaint";
const PRIORITY: Record<SuppressionReason, number> = { bounce: 1, unsubscribed: 2, complaint: 3 };

export interface SuppressionDoc {
  reason: SuppressionReason;
  createdAt: number;
  expiresAt?: number | null;
  bounceCount?: number;
}

export const isSuppressed = (d: SuppressionDoc | null | undefined, now: number): boolean =>
  !!d && !(d.expiresAt != null && d.expiresAt <= now);

// Merge a new suppression event into the existing record: the strongest reason
// wins; bounces expire after a while, a repeated bounce does not.
export function mergeSuppression(
  existing: SuppressionDoc | null,
  reason: SuppressionReason,
  now: number,
  bounceExpiryMs: number,
): SuppressionDoc {
  const bounceCount = (existing?.bounceCount ?? 0) + (reason === "bounce" ? 1 : 0);
  const strongest = existing && PRIORITY[existing.reason] > PRIORITY[reason] ? existing.reason : reason;
  let expiresAt: number | null = null;
  if (strongest === "bounce") expiresAt = bounceCount >= 2 ? null : now + bounceExpiryMs;
  return { reason: strongest, createdAt: existing?.createdAt ?? now, expiresAt, bounceCount };
}
