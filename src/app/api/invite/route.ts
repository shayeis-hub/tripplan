import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

// Math.random() is not cryptographically secure and the old token had no
// expiry at all — a capability that grants edit access to a trip forever,
// guessable-in-principle, until the owner remembers to revoke it manually.
// randomBytes is actually unguessable; INVITE_TTL_MS bounds how long a
// link keeps working even if the owner never revokes it. Links stay
// reusable by design (the UI calls this an "open invite link" for the
// whole group to join with), so this isn't single-use — just time-bounded.
function makeToken() {
  return randomBytes(16).toString("hex");
}
const INVITE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Used to trust userId/userEmail straight from the request body with no
// token verification at all, and treated ANY sharedWith member (including
// view-only ones) as allowed to create or revoke invite links — someone
// who knew a tripId and the owner's uid/email could impersonate them, and
// a view-only member could mint their own edit-access invite. Now: caller
// identity comes only from a verified Firebase ID token, and only the
// trip's actual owner manages invites — matches the intended policy
// ("only the owner manages invites and roles").
async function requireOwner(req: NextRequest, tripId: string) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  let userId: string;
  try {
    userId = (await getAdminAuth().verifyIdToken(token)).uid;
  } catch {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  }

  const tripSnap = await getAdminDb().collection("trips").doc(tripId).get();
  if (!tripSnap.exists) {
    return { error: NextResponse.json({ error: "trip_not_found" }, { status: 404 }) } as const;
  }
  if (tripSnap.data()!.owner !== userId) {
    return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) } as const;
  }
  return { userId } as const;
}

// POST /api/invite — create an invite token for a trip
export async function POST(req: NextRequest) {
  try {
    const { tripId, role } = await req.json();
    if (!tripId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const auth = await requireOwner(req, tripId);
    if ("error" in auth) return auth.error;

    const token = makeToken();
    const now = Date.now();
    await getAdminDb().collection("invites").doc(token).set({
      tripId,
      role: role || "edit",
      createdAt: now,
      expiresAt: now + INVITE_TTL_MS,
    });

    return NextResponse.json({ token });
  } catch (err) {
    console.error("invite POST error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// DELETE /api/invite — revoke an invite token
export async function DELETE(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const inviteSnap = await getAdminDb().collection("invites").doc(token).get();
    if (!inviteSnap.exists) {
      return NextResponse.json({ ok: true }); // already gone
    }
    const { tripId } = inviteSnap.data()!;

    const auth = await requireOwner(req, tripId);
    if ("error" in auth) return auth.error;

    await getAdminDb().collection("invites").doc(token).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("invite DELETE error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
