import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { token, userEmail } = await req.json();
    if (!token || !userEmail) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const db = getAdminDb();

    // 1. Find the invite document
    const inviteSnap = await db.collection("invites").doc(token).get();
    if (!inviteSnap.exists) {
      return NextResponse.json({ error: "invalid_token" }, { status: 404 });
    }

    const { tripId, role } = inviteSnap.data()!;

    // 2. Get the trip
    const tripSnap = await db.collection("trips").doc(tripId).get();
    if (!tripSnap.exists) {
      return NextResponse.json({ error: "trip_not_found" }, { status: 404 });
    }

    const tripData = tripSnap.data()!;
    const normalizedEmail = userEmail.toLowerCase().trim();

    // 3. Don't add the owner to their own trip
    if (tripData.owner === normalizedEmail) {
      return NextResponse.json({
        tripId,
        destination: tripData.destination,
        alreadyOwner: true,
      });
    }

    // 4. Add user to sharedWith if not already there
    const sharedWith: string[] = tripData.sharedWith || [];
    const viewOnlyUsers: string[] = tripData.viewOnlyUsers || [];

    if (!sharedWith.includes(normalizedEmail)) {
      const updates: Record<string, any> = {
        sharedWith: [...sharedWith, normalizedEmail],
        updatedAt: Date.now(),
      };
      if (role === "view" && !viewOnlyUsers.includes(normalizedEmail)) {
        updates.viewOnlyUsers = [...viewOnlyUsers, normalizedEmail];
      }
      await db.collection("trips").doc(tripId).update(updates);
    }

    return NextResponse.json({
      tripId,
      destination: tripData.destination,
      role: role || "edit",
    });
  } catch (err) {
    console.error("join-trip error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
