import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

function makeToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// owner is stored as userId (UID), sharedWith is stored as emails
function canAccess(tripData: any, userId: string, userEmail: string) {
  const normalized = userEmail.toLowerCase().trim();
  return (
    tripData.owner === userId ||
    (tripData.sharedWith || []).includes(normalized)
  );
}

// POST /api/invite — create an invite token for a trip
export async function POST(req: NextRequest) {
  try {
    const { tripId, role, userId, userEmail } = await req.json();
    if (!tripId || !userId || !userEmail) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const db = getAdminDb();

    const tripSnap = await db.collection("trips").doc(tripId).get();
    if (!tripSnap.exists) {
      return NextResponse.json({ error: "trip_not_found" }, { status: 404 });
    }

    if (!canAccess(tripSnap.data()!, userId, userEmail)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const token = makeToken().slice(0, 14);
    await db.collection("invites").doc(token).set({
      tripId,
      role: role || "edit",
      createdAt: Date.now(),
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
    const { token, userId, userEmail } = await req.json();
    if (!token || !userId || !userEmail) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const db = getAdminDb();

    const inviteSnap = await db.collection("invites").doc(token).get();
    if (!inviteSnap.exists) {
      return NextResponse.json({ ok: true }); // already gone
    }

    const { tripId } = inviteSnap.data()!;
    const tripSnap = await db.collection("trips").doc(tripId).get();
    if (tripSnap.exists && !canAccess(tripSnap.data()!, userId, userEmail)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    await db.collection("invites").doc(token).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("invite DELETE error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
