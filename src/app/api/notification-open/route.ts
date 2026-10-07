import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { EVENT_ID_PATTERN } from "@/lib/preTripReminder";

// Records that the owner opened a pre-trip reminder, ONCE.
//  - Authenticated: the uid comes only from the verified ID token.
//  - Authorized: the event must exist AND belong to that uid (event.userId).
//    A caller who merely knows or guesses an event id gets the same 404 as for
//    an id that does not exist, so ids cannot be probed.
//  - Write-once: openedAt is set inside a transaction only if it is still null,
//    so refreshes, back/forward and repeated taps never move it.
//  - notificationEvents is Admin-SDK only: clients have no read or write path.
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    let uid: string;
    try {
      uid = (await getAdminAuth().verifyIdToken(token)).uid;
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await req.json().catch(() => ({}));
    if (typeof eventId !== "string" || !EVENT_ID_PATTERN.test(eventId)) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const ref = getAdminDb().collection("notificationEvents").doc(eventId);
    const result = await getAdminDb().runTransaction(async tx => {
      const snap = await tx.get(ref);
      const d = snap.data() as { userId?: string; openedAt?: number | null } | undefined;
      if (!d || d.userId !== uid) return "not_found" as const;
      if (d.openedAt != null) return "already" as const;
      tx.update(ref, { openedAt: Date.now() });
      return "recorded" as const;
    });

    if (result === "not_found") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, recorded: result === "recorded" });
  } catch (err) {
    console.error("notification-open error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
