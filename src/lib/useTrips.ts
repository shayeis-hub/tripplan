import { useState, useEffect } from "react";
import {
  collection, doc, onSnapshot, setDoc, deleteDoc, query, orderBy
} from "firebase/firestore";
import { db } from "./firebase";

export function useTrips(userId: string | undefined) {
  const [trips,   setTrips]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setTrips([]); setLoading(false); return; }
    const q = query(
      collection(db, "users", userId, "trips"),
      orderBy("updatedAt", "desc")
    );
    const unsub = onSnapshot(q, snap => {
      setTrips(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [userId]);

  const saveTrip = async (trip: any) => {
    if (!userId) return;
    await setDoc(
      doc(db, "users", userId, "trips", trip.id),
      { ...trip, updatedAt: Date.now() }
    );
  };

  const deleteTrip = async (tripId: string) => {
    if (!userId) return;
    await deleteDoc(doc(db, "users", userId, "trips", tripId));
  };

  return { trips, loading, saveTrip, deleteTrip };
}