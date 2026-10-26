import { getAdminDb } from "@/lib/firebase-admin";
import { BOUNCE_SUPPRESSION_MS } from "./constants";
import { isSuppressed, mergeSuppression, type SuppressionDoc, type SuppressionReason } from "./welcomeLogic";

// emailSuppressions/{emailHash}: addresses we must not send lifecycle e-mail to.
// The key is a keyed hash, never the address. Deleting an account does NOT
// remove these records: an explicit unsubscribe, a complaint or a hard bounce is
// about the address, not the account.
const col = () => getAdminDb().collection("emailSuppressions");

export async function readSuppression(hash: string): Promise<SuppressionDoc | null> {
  const s = await col().doc(hash).get();
  return s.exists ? (s.data() as SuppressionDoc) : null;
}

export async function isAddressSuppressed(hash: string, now = Date.now()): Promise<boolean> {
  return isSuppressed(await readSuppression(hash), now);
}

export async function addSuppression(hash: string, reason: SuppressionReason, extra: Record<string, unknown> = {}) {
  const ref = col().doc(hash);
  await getAdminDb().runTransaction(async (tx) => {
    const cur = await tx.get(ref);
    const next = mergeSuppression(cur.exists ? (cur.data() as SuppressionDoc) : null, reason, Date.now(), BOUNCE_SUPPRESSION_MS);
    tx.set(ref, { ...next, ...extra, updatedAt: Date.now() });
  });
}
