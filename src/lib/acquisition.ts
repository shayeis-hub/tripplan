// Shared (client + server) pieces of first-touch acquisition tracking.
//
// What is stored, per NEW registration only, in userAcquisition/{uid}
// (written exclusively by /api/acquisition through the Admin SDK):
//   utmSource / utmMedium / utmCampaign - from the landing URL, if present
//   referrer   - origin + path of the first external document.referrer
//   landing    - path of the first page the visitor landed on (no query)
//   platform   - "web" or "app" (Capacitor shell)
//   firstSeenAt, registeredAt, recordedAt - epoch ms
// Nothing here is derived for users who registered before this shipped: the
// information was never stored, so the dashboard simply has no source for them.

export type SourceGroup =
  | "google_organic"
  | "product_hunt"
  | "alternativeto"
  | "direct"
  | "other";

export const SOURCE_LABELS: Record<SourceGroup, string> = {
  google_organic: "Google / Organic",
  product_hunt: "Product Hunt",
  alternativeto: "AlternativeTo",
  direct: "Direct",
  other: "Other / Referral",
};

export const SOURCE_ORDER: SourceGroup[] = [
  "google_organic",
  "product_hunt",
  "alternativeto",
  "direct",
  "other",
];

export interface FirstTouch {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  referrer?: string | null;
  landing?: string | null;
  platform?: string | null;
  firstSeenAt?: number | null;
}

const hostOf = (referrer?: string | null): string => {
  if (!referrer) return "";
  try {
    return new URL(referrer).hostname.toLowerCase();
  } catch {
    return "";
  }
};

// Explicit UTM tags win over the referrer: a link we tagged ourselves says
// more than whatever page the click happened to come from.
export function classifySource(t: FirstTouch): SourceGroup {
  const src = (t.utmSource || "").toLowerCase().trim();
  const med = (t.utmMedium || "").toLowerCase().trim();
  if (src) {
    if (/product[\s_-]?hunt/.test(src)) return "product_hunt";
    if (/alternative[\s_-]?to/.test(src)) return "alternativeto";
    if (src.startsWith("google")) {
      // Only organic counts as "Google / Organic"; paid tags are not organic.
      return /^(cpc|ppc|paid|display|ads?)/.test(med) ? "other" : "google_organic";
    }
    return "other";
  }
  const host = hostOf(t.referrer);
  if (!host) return "direct";
  if (/(^|\.)google\.[a-z.]+$/.test(host)) return "google_organic";
  if (/(^|\.)producthunt\.com$/.test(host)) return "product_hunt";
  if (/(^|\.)alternativeto\.net$/.test(host)) return "alternativeto";
  return "other";
}

const clean = (v: unknown, max: number): string | null => {
  if (typeof v !== "string") return null;
  // Strip control characters, trim and cap the length.
  const s = v.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);
  return s || null;
};

// Server-side validation of the client payload. Everything is optional and
// length-capped; nothing from it is ever rendered as HTML.
export function sanitizeFirstTouch(raw: unknown): FirstTouch {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const landing = clean(r.landing, 200);
  const platform = r.platform === "app" ? "app" : "web";
  const seen = typeof r.firstSeenAt === "number" && isFinite(r.firstSeenAt) ? r.firstSeenAt : null;
  return {
    utmSource: clean(r.utmSource, 100),
    utmMedium: clean(r.utmMedium, 100),
    utmCampaign: clean(r.utmCampaign, 100),
    referrer: clean(r.referrer, 300),
    landing: landing && landing.startsWith("/") ? landing : null,
    platform,
    firstSeenAt: seen,
  };
}
