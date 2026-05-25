"use client";
import { useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useTrips } from "@/lib/useTrips";
import TripPlan from "@/components/TripPlan";
import LandingPage from "@/components/LandingPage";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const {
    trips,
    loading: tripsLoading,
    saveTrip,
    deleteTrip,
    shareTrip,
    removeShare,
  } = useTrips(user?.uid, user?.email ?? undefined);

  // Preserve invite token if present in URL
  useEffect(() => {
    if (!loading && !user) {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("invite");
      if (token) localStorage.setItem("pendingInvite", token);
    }
  }, [user, loading]);

  if (loading) return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(160deg,#091928,#0d2137)",
      fontFamily:"'Rubik',sans-serif",
    }}>
      <div style={{textAlign:"center",color:"white"}}>
        <div style={{fontSize:42,fontWeight:900,letterSpacing:"-1px",marginBottom:10}}>TU<span style={{color:"#64dfdf"}}>lon</span></div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.35)",fontWeight:300}}>טוען...</div>
      </div>
    </div>
  );

  if (!user) return <LandingPage />;

  if (tripsLoading) return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(160deg,#091928,#0d2137)",
      fontFamily:"'Rubik',sans-serif",
    }}>
      <div style={{textAlign:"center",color:"white"}}>
        <div style={{fontSize:42,fontWeight:900,letterSpacing:"-1px",marginBottom:10}}>TU<span style={{color:"#64dfdf"}}>lon</span></div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.35)",fontWeight:300}}>טוען...</div>
      </div>
    </div>
  );

  return (
    <TripPlan
      trips={trips}
      onSaveTrip={saveTrip}
      onDeleteTrip={deleteTrip}
      onShareTrip={shareTrip}
      onRemoveShare={removeShare}
      onLogout={logout}
      userEmail={user.email || ""}
      userId={user.uid}
    />
  );
}
