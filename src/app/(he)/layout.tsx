import type { Metadata } from "next";
import "../globals.css";
import RegisterSW from "@/components/RegisterSW";
import AcquisitionCapture from "@/components/AcquisitionCapture";
import RootHead from "@/components/RootHead";
import { Analytics } from "@vercel/analytics/next";
import { rootBaseMetadata, rootViewport } from "@/lib/rootMeta";

// Root layout for the Hebrew copies of the destination pages (/he/...). The
// Hebrew site proper lives in the (site) group, whose layout carries the app
// providers; these static pages only need <html lang="he" dir="rtl"> in the
// server-rendered HTML, like the English and Spanish groups. Each page supplies
// its own title, description, canonical and hreflang set.
export const metadata: Metadata = rootBaseMetadata;
export const viewport = rootViewport;

export default function HebrewDestinationsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <RootHead />
      </head>
      <body><AcquisitionCapture /><RegisterSW />{children}<Analytics /></body>
    </html>
  );
}
