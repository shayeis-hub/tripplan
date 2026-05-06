"use client";
import { useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useTrips } from "@/lib/useTrips";
import { useRouter } from "next/navigation";
import TripPlan from "@/components/TripPlan";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { trips, loading: tripsLoading, saveTrip, deleteTrip } = useTrips(user?.uid);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading]);

  if (loading || tripsLoading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
      background:"linear-gradient(135deg,#1A5C6B,#2A7B8C)",fontFamily:"'Nunito',sans-serif"}}>
      <div style={{textAlign:"center",color:"white"}}>
        <div style={{fontSize:48,marginBottom:12}}>🌺</div>
        <div style={{fontSize:18,fontWeight:700}}>טוען...</div>
      </div>
    </div>
  );

  if (!user) return null;

  return <TripPlan trips={trips} onSaveTrip={saveTrip} onDeleteTrip={deleteTrip} onLogout={logout} userEmail={user.email||""}/>;
}