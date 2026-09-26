import type { Metadata } from "next";

// Google Play's account-deletion policy requires the deletion page to clearly
// identify the app it belongs to — including in the page title/metadata — and
// the name must match the Play listing (currently "Tulon – Smart Trip Planner"
// / "טיולון – מתכנן טיולים").
export const metadata: Metadata = {
  title: "Delete Account | Tulon – Smart Trip Planner (טיולון – מתכנן טיולים)",
  description:
    "Request deletion of your Tulon – Smart Trip Planner account (טיולון – מתכנן טיולים, il.co.tulon.www.twa) and all associated data.",
};

export default function DeleteAccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
