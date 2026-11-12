// Which push notifications a person wants. Stored on their pushSubscriptions/{uid} document (written only through
// the server), read by every route that sends one. A missing field means "on", so people who never opened the
// settings keep getting exactly what they got before.
export type NotifPrefs = { all: boolean; add: boolean; delete: boolean; system: boolean };
export type NotifKind = "add" | "delete" | "system";

export const DEFAULT_PREFS: NotifPrefs = { all: true, add: true, delete: true, system: true };

export function readPrefs(raw: unknown): NotifPrefs {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const pick = (k: keyof NotifPrefs) => (typeof r[k] === "boolean" ? (r[k] as boolean) : DEFAULT_PREFS[k]);
  return { all: pick("all"), add: pick("add"), delete: pick("delete"), system: pick("system") };
}

// The master switch turns everything off; otherwise the kind's own switch decides.
export function prefAllows(raw: unknown, kind: NotifKind): boolean {
  const p = readPrefs(raw);
  return p.all && p[kind];
}

// Body of a settings update: only known boolean fields are kept.
export function sanitizePrefsUpdate(body: unknown): Partial<NotifPrefs> {
  const out: Partial<NotifPrefs> = {};
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  for (const k of ["all", "add", "delete", "system"] as const) if (typeof b[k] === "boolean") out[k] = b[k] as boolean;
  return out;
}
