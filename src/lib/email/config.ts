import { getAdminDb } from "@/lib/firebase-admin";
import { DEFAULT_WELCOME_CONFIG, type WelcomeConfig } from "./welcomeLogic";

// emailConfig/lifecycle in Firestore. Missing or malformed = everything off.
// { welcome: { mode: "off"|"allowlist"|"all", allowlist: string[],
//              eligibleSince: epoch ms, controlPct: 0-100 } }
const TTL_MS = 60 * 1000;
let cache: { at: number; cfg: WelcomeConfig } | null = null;

export async function getWelcomeConfig(fresh = false): Promise<WelcomeConfig> {
  if (!fresh && cache && Date.now() - cache.at < TTL_MS) return cache.cfg;
  let cfg = DEFAULT_WELCOME_CONFIG;
  try {
    const snap = await getAdminDb().collection("emailConfig").doc("lifecycle").get();
    const w = snap.exists ? (snap.data()?.welcome as Record<string, unknown> | undefined) : undefined;
    if (w) {
      const mode = w.mode === "all" || w.mode === "allowlist" ? w.mode : "off";
      cfg = {
        mode,
        allowlist: Array.isArray(w.allowlist)
          ? (w.allowlist as unknown[]).filter((x): x is string => typeof x === "string").map((x) => x.trim().toLowerCase())
          : [],
        eligibleSince: typeof w.eligibleSince === "number" ? w.eligibleSince : Number.MAX_SAFE_INTEGER,
        controlPct: typeof w.controlPct === "number" ? Math.min(100, Math.max(0, w.controlPct)) : 0,
      };
    }
  } catch {
    cfg = DEFAULT_WELCOME_CONFIG; // on any read problem, send nothing
  }
  cache = { at: Date.now(), cfg };
  return cfg;
}

export const clearConfigCache = () => {
  cache = null;
};

// emailConfig/lifecycle.annual = { mode: "off"|"allowlist"|"all", allowlist: string[] }. Missing = off.
export interface AnnualConfig {
  mode: "off" | "allowlist" | "all";
  allowlist: string[];
}
export const DEFAULT_ANNUAL_CONFIG: AnnualConfig = { mode: "off", allowlist: [] };

export async function getAnnualConfig(): Promise<AnnualConfig> {
  try {
    const snap = await getAdminDb().collection("emailConfig").doc("lifecycle").get();
    const a = snap.exists ? (snap.data()?.annual as Record<string, unknown> | undefined) : undefined;
    if (!a) return DEFAULT_ANNUAL_CONFIG;
    return {
      mode: a.mode === "all" || a.mode === "allowlist" ? a.mode : "off",
      allowlist: Array.isArray(a.allowlist)
        ? (a.allowlist as unknown[]).filter((x): x is string => typeof x === "string").map((x) => x.trim().toLowerCase())
        : [],
    };
  } catch {
    return DEFAULT_ANNUAL_CONFIG; // on any read problem, send nothing
  }
}

// emailConfig/lifecycle.verify = { mode: "off"|"allowlist"|"all", allowlist: string[] }. Missing = off.
export async function getVerifyConfig(): Promise<AnnualConfig> {
  try {
    const snap = await getAdminDb().collection("emailConfig").doc("lifecycle").get();
    const a = snap.exists ? (snap.data()?.verify as Record<string, unknown> | undefined) : undefined;
    if (!a) return DEFAULT_ANNUAL_CONFIG;
    return {
      mode: a.mode === "all" || a.mode === "allowlist" ? a.mode : "off",
      allowlist: Array.isArray(a.allowlist)
        ? (a.allowlist as unknown[]).filter((x): x is string => typeof x === "string").map((x) => x.trim().toLowerCase())
        : [],
    };
  } catch {
    return DEFAULT_ANNUAL_CONFIG;
  }
}
