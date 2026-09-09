import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// The client page used to do all of this itself with the regular Firestore
// SDK, only for trips it owns (trips.owner == uid), then delete the Auth
// user — with two real gaps:
//  - It only supported email/password reauth, so a Google/Apple-only user
//    (no password to enter) could never actually get through the flow at
//    all.
//  - It never touched travelProfiles, pushSubscriptions, invites for the
//    deleted trips, or this user's email left behind in OTHER people's
//    trips.sharedWith/viewOnlyUsers — a partial delete that still called
//    itself "done".
// Doing it here instead: the client just proves identity (any provider —
// see delete-account/page.tsx) and hands over a fresh ID token; every
// write below runs as a trusted server identity via the Admin SDK, which
// can also touch other users' trip docs to strip this uid's traces out of
// their sharing lists (something the client's own Firestore rules would
// never allow it to do directly).
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let uid: string, email: string;
    try {
      const decoded = await getAdminAuth().verifyIdToken(token);
      uid = decoded.uid;
      email = (decoded.email || "").toLowerCase().trim();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();

    // 1. Trips this user owns.
    const ownedSnap = await db.collection("trips").where("owner", "==", uid).get();
    const ownedTripIds = ownedSnap.docs.map(d => d.id);

    // 2. Invites for those trips (otherwise left pointing at a trip that no
    //    longer exists — harmless functionally, but not actually deleted).
    for (let i = 0; i < ownedTripIds.length; i += 30) {
      const chunk = ownedTripIds.slice(i, i + 30);
      if (chunk.length === 0) continue;
      const invitesSnap = await db.collection("invites").where("tripId", "in", chunk).get();
      await Promise.all(invitesSnap.docs.map(d => d.ref.delete()));
    }

    // 3. Delete the owned trips themselves.
    await Promise.all(ownedSnap.docs.map(d => d.ref.delete()));

    // 4. Strip this user's email out of every OTHER trip's sharedWith /
    //    viewOnlyUsers — otherwise a deleted account's email lingers on
    //    trips they no longer have an account to see.
    if (email) {
      const sharedSnap = await db.collection("trips").where("sharedWith", "array-contains", email).get();
      await Promise.all(sharedSnap.docs.map(d => d.ref.update({
        sharedWith: FieldValue.arrayRemove(email),
        viewOnlyUsers: FieldValue.arrayRemove(email),
      })));
    }

    // 5. Everything else keyed directly by uid.
    await Promise.all([
      db.collection("travelProfiles").doc(uid).delete(),
      db.collection("pushSubscriptions").doc(uid).delete(),
    ]);

    // 6. The Auth account itself — works regardless of sign-in provider,
    //    since this runs with Admin privileges rather than requiring the
    //    client to reauthenticate with a password that an OAuth-only user
    //    never had in the first place.
    await getAdminAuth().deleteUser(uid);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("delete-account error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
