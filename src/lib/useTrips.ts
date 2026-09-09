import { useState, useEffect, useRef } from "react";
import {
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, runTransaction,
  arrayUnion, arrayRemove, query, orderBy, or, where
} from "firebase/firestore";
import { db } from "./firebase";

export function useTrips(userId: string | undefined, userEmail: string | undefined) {
  const [trips,   setTrips]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !userEmail) { setTrips([]); setLoading(false); return; }

    // Query 1: trips I own
    const myTripsQ = query(
      collection(db, "trips"),
      where("owner", "==", userId),
      orderBy("updatedAt", "desc")
    );

    // Query 2: trips shared with me
    const sharedTripsQ = query(
      collection(db, "trips"),
      where("sharedWith", "array-contains", userEmail),
      orderBy("updatedAt", "desc")
    );

    const allTrips: { [id: string]: any } = {};

    // Listen to both queries simultaneously
    const unsub1 = onSnapshot(myTripsQ, snap => {
      snap.docs.forEach(d => { allTrips[d.id] = { id: d.id, ...d.data() }; });
      // Remove deleted docs
      const ids = snap.docs.map(d => d.id);
      Object.keys(allTrips).forEach(id => {
        if (allTrips[id].owner === userId && !ids.includes(id)) {
          delete allTrips[id];
        }
      });
      setTrips(Object.values(allTrips).sort((a: any, b: any) => b.updatedAt - a.updatedAt));
      setLoading(false);
    });

    const unsub2 = onSnapshot(sharedTripsQ, snap => {
      snap.docs.forEach(d => { allTrips[d.id] = { id: d.id, ...d.data() }; });
      // Remove trips no longer shared with me (owner removed my email from
      // sharedWith, or deleted the trip). Previously only unsub1 (owned
      // trips) pruned docs that dropped out of its query results, so a
      // trip the owner un-shared stayed in this user's list until a full
      // page reload instead of disappearing live.
      const ids = snap.docs.map(d => d.id);
      Object.keys(allTrips).forEach(id => {
        if (allTrips[id].owner !== userId && !ids.includes(id)) {
          delete allTrips[id];
        }
      });
      setTrips(Object.values(allTrips).sort((a: any, b: any) => b.updatedAt - a.updatedAt));
      setLoading(false);
    });

    return () => { unsub1(); unsub2(); };
  }, [userId, userEmail]);

  // Remove undefined values recursively (Firebase doesn't accept undefined).
  // Only recurses into plain object literals — a Firestore sentinel
  // (deleteField(), arrayUnion(), a Timestamp, etc.) is a class instance,
  // not a plain object, and rebuilding it via Object.fromEntries(Object.
  // entries(...)) would silently strip its prototype, turning e.g.
  // deleteField() into an inert plain object instead of the special value
  // Firestore recognizes. Passing those through untouched keeps them working.
  const stripUndefined = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(stripUndefined);
    if (obj && typeof obj === 'object' && obj.constructor === Object) {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, stripUndefined(v)])
      );
    }
    return obj;
  };

  // Every trip edit (add an expense, tick a packing item, share the trip...)
  // goes through one of the three write functions below — but they used to
  // just log a failed write and return undefined either way, so the UI
  // (which already applied the change optimistically to local state before
  // this ran) had no way to tell a real save from a silently-dropped one.
  // A permission-denied write, an offline save, or a rejected rules check
  // all looked identical to success. Now: each returns whether it actually
  // succeeded, and on failure remembers how to retry itself (see
  // retrySync below), keyed by trip id so a successful save of a
  // *different* trip never hides a still-unresolved failure on another one.
  const [syncFailed, setSyncFailed] = useState(false);
  const lastFailedRef = useRef<{ tripId: string; retry: () => void } | null>(null);

  const clearFailureIfMatches = (tripId: string) => {
    if (lastFailedRef.current?.tripId === tripId) {
      lastFailedRef.current = null;
      setSyncFailed(false);
    }
  };
  const markFailure = (tripId: string, retry: () => void) => {
    lastFailedRef.current = { tripId, retry };
    setSyncFailed(true);
  };

  // Full-document overwrite. Only appropriate for creating a brand new trip
  // (setDoc on a doc that doesn't exist yet) or the rare case that really
  // does need to replace the whole document — every other edit should use
  // updateTripFields or mutateTripField below, which only touch the fields
  // they actually change instead of re-writing (and risking clobbering)
  // everything else a concurrent editor may have just changed.
  const saveTrip = async (trip: any): Promise<boolean> => {
    if (!userId) return false;
    try {
      const clean = stripUndefined({
        ...trip,
        owner: trip.owner || userId,
        sharedWith: trip.sharedWith || [],
        updatedAt: Date.now(),
      });
      await setDoc(doc(db, "trips", trip.id), clean);
      clearFailureIfMatches(trip.id);
      return true;
    } catch (err) {
      console.error("Firebase saveTrip error:", err);
      markFailure(trip.id, () => { saveTrip(trip); });
      return false;
    }
  };

  // Field-level update for an EXISTING trip doc — only touches the keys in
  // `patch`, unlike saveTrip's full-document overwrite. Two people editing
  // different fields of the same trip at the same moment (one ticks a
  // packing item, another edits the itinerary) no longer risk one write
  // silently erasing the other's, since Firestore only touches the field
  // paths named here. Still not safe for two edits to the SAME field at
  // the same moment (e.g. two different additions to `expenses`) — that
  // needs mutateTripField below, which reads the field's live value first.
  const updateTripFields = async (tripId: string, patch: Record<string, any>): Promise<boolean> => {
    if (!userId || !tripId) return false;
    try {
      await updateDoc(doc(db, "trips", tripId), { ...stripUndefined(patch), updatedAt: Date.now() });
      clearFailureIfMatches(tripId);
      return true;
    } catch (err) {
      console.error("Firebase updateTripFields error:", err);
      markFailure(tripId, () => { updateTripFields(tripId, patch); });
      return false;
    }
  };

  // Read-modify-write a single field (an array like `expenses`, or a map
  // like `activities`) inside a Firestore transaction, so `mutator` always
  // starts from that field's actual current value on the server — never
  // from whatever this tab's local state happened to have — and Firestore
  // automatically retries the transaction if another write lands in
  // between. Two people adding different expenses (or ticking different
  // packing items) at the same instant both survive; two edits to the
  // exact same array element still resolve last-write-wins on that one
  // element, but never at the cost of dropping the rest of the array.
  const mutateTripField = async (tripId: string, field: string, mutator: (current: any) => any): Promise<boolean> => {
    if (!userId || !tripId) return false;
    try {
      await runTransaction(db, async (tx) => {
        const ref = doc(db, "trips", tripId);
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error("trip_not_found");
        const current = (snap.data() as any)[field];
        const next = mutator(current);
        tx.update(ref, { [field]: stripUndefined(next), updatedAt: Date.now() });
      });
      clearFailureIfMatches(tripId);
      return true;
    } catch (err) {
      console.error(`Firebase mutateTripField(${field}) error:`, err);
      markFailure(tripId, () => { mutateTripField(tripId, field, mutator); });
      return false;
    }
  };

  // Retries whatever the last failed write was, exactly as it was
  // attempted. Exposed so a global banner can offer "try again" instead of
  // the user having to redo whatever edit triggered the failure (which
  // they may not even know happened).
  const retrySync = () => {
    lastFailedRef.current?.retry();
  };

  const deleteTrip = async (tripId: string) => {
    if (!userId) return;
    await deleteDoc(doc(db, "trips", tripId));
  };

  // arrayUnion/arrayRemove are atomic at the Firestore level and need no
  // read first — unlike the old version, which built the next sharedWith/
  // viewOnlyUsers arrays from this tab's local `trips` state and then
  // overwrote the whole array. Two people sharing the same trip with
  // different emails (or from two devices) at the same moment could
  // silently drop one addition under that version; they can't here, since
  // Firestore merges each array op server-side against the live value.
  const shareTrip = async (tripId: string, email: string, viewOnly = false): Promise<boolean> => {
    if (!userId) return false;
    const normalizedEmail = email.toLowerCase().trim();
    try {
      await updateDoc(doc(db, "trips", tripId), {
        sharedWith: arrayUnion(normalizedEmail),
        viewOnlyUsers: viewOnly ? arrayUnion(normalizedEmail) : arrayRemove(normalizedEmail),
        updatedAt: Date.now(),
      });
      clearFailureIfMatches(tripId);
      return true;
    } catch (err) {
      console.error("Firebase shareTrip error:", err);
      markFailure(tripId, () => { shareTrip(tripId, email, viewOnly); });
      return false;
    }
  };

  const removeShare = async (tripId: string, email: string): Promise<boolean> => {
    if (!userId) return false;
    try {
      await updateDoc(doc(db, "trips", tripId), {
        sharedWith: arrayRemove(email),
        viewOnlyUsers: arrayRemove(email),
        updatedAt: Date.now(),
      });
      clearFailureIfMatches(tripId);
      return true;
    } catch (err) {
      console.error("Firebase removeShare error:", err);
      markFailure(tripId, () => { removeShare(tripId, email); });
      return false;
    }
  };

  return {
    trips, loading, saveTrip, updateTripFields, mutateTripField, deleteTrip,
    shareTrip, removeShare, syncFailed, retrySync,
  };
}
