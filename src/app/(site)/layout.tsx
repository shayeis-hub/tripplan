import type { Metadata } from "next";
import "../globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { LangProvider } from "@/lib/LangContext";
import RegisterSW from "@/components/RegisterSW";
import AcquisitionCapture from "@/components/AcquisitionCapture";
import DirSetter from "@/components/DirSetter";
import LegalViewer from "@/components/LegalViewer";
import RootHead from "@/components/RootHead";
import { Analytics } from "@vercel/analytics/next";
import { pageMeta } from "@/lib/seo";
import { rootBaseMetadata, rootViewport } from "@/lib/rootMeta";

// Root layout for the Hebrew-first site (everything except the English-only
// SEO landing pages, which have their own root layout in the (en) group).
// The homepage is a client component (the app itself mounts there), so its
// SEO metadata is set here. Every other route sets its own via its own
// layout.tsx, so this only ever describes "/".
export const metadata: Metadata = {
  ...rootBaseMetadata,
  ...pageMeta({
    title: "טיולון – אפליקציה לתכנון טיולים וניהול הוצאות | TUlon",
    description:
      "טיולון היא אפליקציה לתכנון טיולים: בונים מסלול יומי, מנהלים תקציב והוצאות, מחלקים תשלומים בין חברי הטיול ומגלים מה לעשות ביעד – כל הטיול במקום אחד.",
    path: "/",
  }),
};

export const viewport = rootViewport;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <RootHead />
      </head>
      <body><LangProvider><DirSetter /><AuthProvider><AcquisitionCapture /><RegisterSW />{children}<LegalViewer /><Analytics /></AuthProvider></LangProvider></body>
    </html>
  );
}
