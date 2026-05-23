import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

function makeToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// POST /api/invite — create an invite token for a trip
export async function POST(req: NextRequest) {
  try {
    const { tripId, role, userEmail } = await req.json();
    if (!tripId || !userEmail) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const db = getAdminDb();

    // Verify the caller owns or has access to the trip
    const tripSnap = await db.collection("trips").doc(tripId).get();
    if (!tripSnap.exists) {
      return NextResponse.json({ error: "trip_not_found" }, { status: 404 });
    }
    const tripData = tripSnap.data()!;
    const normalized = userEmail.toLowerCase().trim();
    if (
      tripData.owner !== normalized &&
      !(tripData.sharedWith || []).includes(normalized)
    ) {
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
    const { token, userEmail } = await req.json();
    if (!token || !userEmail) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const db = getAdminDb();

    // Verify token exists
    const inviteSnap = await db.collection("invites").doc(token).get();
    if (!inviteSnap.exists) {
      return NextResponse.json({ ok: true }); // already gone — that's fine
    }

    const { tripId } = inviteSnap.data()!;

    // Verify the caller owns or has access to the trip
    const tripSnap = await db.collection("trips").doc(tripId).get();
    if (tripSnap.exists) {
      const tripData = tripSnap.data()!;
      const normalized = userEmail.toLowerCase().trim();
      if (
        tripData.owner !== normalized &&
        !(tripData.sharedWith || []).includes(normalized)
      ) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
    }

    await db.collection("invites").doc(token).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("invite DELETE error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
