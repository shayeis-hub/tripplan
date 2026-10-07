"use client";
import { useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useTrips } from "@/lib/useTrips";
import TripPlan from "@/components/TripPlan";
import LandingPage from "@/components/LandingPage";
import OfflineBanner from "@/components/OfflineBanner";
import ErrorBoundary from "@/components/ErrorBoundary";
import RatePrompt from "@/components/RatePrompt";
import { useLang } from "@/lib/LangContext";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const { lang } = useLang();
  const {
    trips,
    loading: tripsLoading,
    saveTrip,
    updateTripFields,
    mutateTripField,
    deleteTrip,
    shareTrip,
    removeShare,
    syncFailed,
    retrySync,
  } = useTrips(user?.uid, user?.email ?? undefined);

  // Preserve invite token / quick-add intent across the sign-in redirect
  useEffect(() => {
    if (!loading && !user) {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("invite");
      if (token) localStorage.setItem("pendingInvite", token);
      const quickadd = params.get("quickadd");
      if (quickadd) {
        try { sessionStorage.setItem("pendingQuickAdd", quickadd); } catch {}
      }
    }
  }, [user, loading]);

  const loadingScreen = (
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

  // `loading` starts `true` on every render, including the server-rendered
  // pass and the very first client render before onAuthStateChanged has had
  // a chance to fire (Firebase can't resolve a session during SSR at all).
  // This used to gate LandingPage behind `loading`, so the HTML any
  // non-JS-executing fetcher (a plain fetch, a lot of what AI answer
  // engines actually retrieve) ever saw at "/" was just this loading
  // screen — "TUlon / טוען..." — never the actual marketing content. Now:
  // anything short of a *confirmed* signed-in user renders LandingPage
  // (real content, crawlable) instead of a blank loading state; the
  // loading spinner is reserved for the moment right after we already know
  // someone is logged in and are just waiting on their trips to load — a
  // state no crawler or first-time visitor is ever in.
  const showApp = !loading && !!user;

  return (
    <ErrorBoundary>
      {!showApp ? <LandingPage />
        : tripsLoading ? loadingScreen
        : (
          <>
            <TripPlan
              trips={trips}
              onSaveTrip={saveTrip}
              onUpdateTripFields={updateTripFields}
              onMutateTripField={mutateTripField}
              onDeleteTrip={deleteTrip}
              onShareTrip={shareTrip}
              onRemoveShare={removeShare}
              onLogout={logout}
              userEmail={user.email || ""}
              userId={user.uid}
              syncFailed={syncFailed}
              onRetrySync={retrySync}
            />
            <RatePrompt lang={lang} hasTrips={trips.length > 0} />
          </>
        )}
    </ErrorBoundary>
  );
}
