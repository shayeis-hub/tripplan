import { NextResponse } from "next/server";
import { getAdminAuth, getAdminStorage } from "@/lib/firebase-admin";

export const ADMIN_EMAIL = "shayeis@gmail.com";

// Instagram must be able to fetch the image over plain HTTP at publish time, and
// the admin UI needs a preview. A signed URL works whether or not the bucket has
// uniform bucket-level access, unlike making individual objects public.
export async function signedUrlFor(path: string, hours = 24): Promise<string> {
  const [url] = await getAdminStorage().bucket().file(path).getSignedUrl({
    action: "read",
    expires: Date.now() + hours * 3600 * 1000,
  });
  return url;
}

// Verifies the Firebase ID token on the Authorization header belongs to the
// single admin account. Same check used by /api/admin/stats.
export async function requireAdmin(req: Request): Promise<{ uid: string } | { error: NextResponse }> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    if (decoded.email !== ADMIN_EMAIL) {
      return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return { uid: decoded.uid };
  } catch {
    return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
  }
}
