import type { Metadata } from "next";
import "../globals.css";
import RegisterSW from "@/components/RegisterSW";
import AcquisitionCapture from "@/components/AcquisitionCapture";
import RootHead from "@/components/RootHead";
import { Analytics } from "@vercel/analytics/next";
import { rootBaseMetadata, rootViewport } from "@/lib/rootMeta";

// Root layout for the Spanish copies of the marketing pages (/es/...). A
// separate root layout is what ships <html lang="es" dir="ltr"> in the
// server-rendered HTML. Each page supplies its own title, description,
// canonical and hreflang set.
export const metadata: Metadata = rootBaseMetadata;
export const viewport = rootViewport;

export default function SpanishRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" dir="ltr">
      <head>
        <RootHead />
      </head>
      <body><AcquisitionCapture /><RegisterSW />{children}<Analytics /></body>
    </html>
  );
}
