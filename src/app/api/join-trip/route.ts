import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    // Used to trust userEmail straight from the request body with no
    // token — anyone holding an invite link could "join" as any email
    // they typed, with no proof they actually own it. Now derived from a
    // verified Firebase ID token instead.
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    let userUid: string, userEmail: string;
    try {
      const decoded = await getAdminAuth().verifyIdToken(token);
      userUid = decoded.uid;
      userEmail = (decoded.email || "").toLowerCase().trim();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!userEmail) return NextResponse.json({ error: "no_email" }, { status: 400 });

    const { token: inviteToken } = await req.json();
    if (!inviteToken) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const db = getAdminDb();

    // 1. Find the invite document
    const inviteSnap = await db.collection("invites").doc(inviteToken).get();
    if (!inviteSnap.exists) {
      return NextResponse.json({ error: "invalid_token" }, { status: 404 });
    }

    const { tripId, role, expiresAt } = inviteSnap.data()!;
    // Older invites (created before expiresAt existed) have no field here
    // and stay valid indefinitely — only enforce it when present.
    if (expiresAt && Date.now() > expiresAt) {
      return NextResponse.json({ error: "expired_token" }, { status: 410 });
    }
    const tripRef = db.collection("trips").doc(tripId);
    const tripSnap = await tripRef.get();
    if (!tripSnap.exists) {
      return NextResponse.json({ error: "trip_not_found" }, { status: 404 });
    }

    const tripData = tripSnap.data()!;

    // 2. Don't add the owner to their own trip — owner is stored as a
    //    UID (like everywhere else in this app), so this must compare
    //    against the verified uid, never the email. Comparing owner to
    //    an email (as this used to) can never be true, so this branch
    //    silently never fired.
    if (tripData.owner === userUid) {
      return NextResponse.json({
        tripId,
        destination: tripData.destination,
        alreadyOwner: true,
      });
    }

    // 3. Add user to sharedWith (and set viewOnlyUsers membership to match
    //    this invite's role). arrayUnion/arrayRemove are atomic at the
    //    Firestore level — the old read-array-then-write-a-new-array
    //    pattern let two people joining at the same moment each write a
    //    version missing the other's addition, silently dropping one of
    //    them. Always applying the role (not just "if not already a
    //    member") also means an existing member opening a different-role
    //    invite link actually changes their role instead of silently
    //    doing nothing.
    await tripRef.update({
      sharedWith: FieldValue.arrayUnion(userEmail),
      viewOnlyUsers: role === "view" ? FieldValue.arrayUnion(userEmail) : FieldValue.arrayRemove(userEmail),
      updatedAt: Date.now(),
    });

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
