import { useState, useEffect, useRef } from "react";
import {
  collection, doc, onSnapshot, setDoc, deleteDoc,
  query, orderBy, or, where
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

  // Remove undefined values recursively (Firebase doesn't accept undefined)
  const stripUndefined = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(stripUndefined);
    if (obj && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, stripUndefined(v)])
      );
    }
    return obj;
  };

  // Every trip edit (add an expense, tick a packing item, share the trip...)
  // goes through this — but it used to just log a failed write and return
  // undefined either way, so the UI (which already applied the change
  // optimistically to local state before this ran) had no way to tell a
  // real save from a silently-dropped one. A permission-denied write, an
  // offline save, or a rejected rules check all looked identical to
  // success. Now: returns whether it actually succeeded, and remembers the
  // failed payload so a caller (see retrySync below) can retry the exact
  // same write without the user having to redo their edit.
  const [syncFailed, setSyncFailed] = useState(false);
  const lastFailedTripRef = useRef<any>(null);

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
      // Only clear the banner if this save resolves the specific failure
      // it's showing — a successful save of a DIFFERENT trip shouldn't
      // hide a still-unresolved failure on another one.
      if (lastFailedTripRef.current?.id === trip.id) {
        lastFailedTripRef.current = null;
        setSyncFailed(false);
      }
      return true;
    } catch (err) {
      console.error("Firebase saveTrip error:", err);
      lastFailedTripRef.current = trip;
      setSyncFailed(true);
      return false;
    }
  };

  // Retries the last failed write verbatim. Exposed so a global banner can
  // offer "try again" instead of the user having to redo whatever edit
  // triggered the failure (which they may not even know happened).
  const retrySync = () => {
    if (lastFailedTripRef.current) saveTrip(lastFailedTripRef.current);
  };

  const deleteTrip = async (tripId: string) => {
    if (!userId) return;
    await deleteDoc(doc(db, "trips", tripId));
  };

  const shareTrip = async (tripId: string, email: string, viewOnly = false) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    const normalizedEmail = email.toLowerCase().trim();
    const sharedWith = [...(trip.sharedWith || [])];
    if (!sharedWith.includes(normalizedEmail)) sharedWith.push(normalizedEmail);

    // viewOnlyUsers: add or remove based on flag
    let viewOnlyUsers: string[] = [...(trip.viewOnlyUsers || [])];
    if (viewOnly) {
      if (!viewOnlyUsers.includes(normalizedEmail)) viewOnlyUsers.push(normalizedEmail);
    } else {
      viewOnlyUsers = viewOnlyUsers.filter(e => e !== normalizedEmail);
    }

    await saveTrip({ ...trip, sharedWith, viewOnlyUsers });
  };

  const removeShare = async (tripId: string, email: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    const sharedWith = (trip.sharedWith || []).filter((e: string) => e !== email);
    const viewOnlyUsers = (trip.viewOnlyUsers || []).filter((e: string) => e !== email);
    await saveTrip({ ...trip, sharedWith, viewOnlyUsers });
  };

  return { trips, loading, saveTrip, deleteTrip, shareTrip, removeShare, syncFailed, retrySync };
}
