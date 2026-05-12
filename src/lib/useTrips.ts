import { useState, useEffect } from "react";
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
      setTrips(Object.values(allTrips).sort((a: any, b: any) => b.updatedAt - a.updatedAt));
      setLoading(false);
    });

    return () => { unsub1(); unsub2(); };
  }, [userId, userEmail]);

  const saveTrip = async (trip: any) => {
    if (!userId) return;
    try {
      await setDoc(
        doc(db, "trips", trip.id),
        {
          ...trip,
          owner: trip.owner || userId,
          sharedWith: trip.sharedWith || [],
          updatedAt: Date.now(),
        }
      );
    } catch (err) {
      console.error("Firebase saveTrip error:", err);
    }
  };

  const deleteTrip = async (tripId: string) => {
    if (!userId) return;
    await deleteDoc(doc(db, "trips", tripId));
  };

  const shareTrip = async (tripId: string, email: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    const sharedWith = [...(trip.sharedWith || [])];
    if (!sharedWith.includes(email)) {
      sharedWith.push(email.toLowerCase().trim());
      await saveTrip({ ...trip, sharedWith });
    }
  };

  return { trips, loading, saveTrip, deleteTrip, shareTrip };
}
