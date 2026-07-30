import type { Metadata } from "next";

// Google Play's account-deletion policy requires the deletion page to clearly
// identify the app it belongs to — including in the page title/metadata.
export const metadata: Metadata = {
  title: "מחיקת חשבון | טיולון – מתכנן הטיולים שלי (Tulon)",
  description:
    "Request deletion of your Tulon account (טיולון – מתכנן הטיולים שלי, il.co.tulon.www.twa) and all associated data.",
};

export default function DeleteAccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
