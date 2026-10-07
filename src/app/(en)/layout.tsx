import type { Metadata } from "next";
import "../globals.css";
import RegisterSW from "@/components/RegisterSW";
import RootHead from "@/components/RootHead";
import { Analytics } from "@vercel/analytics/next";
import { rootBaseMetadata, rootViewport } from "@/lib/rootMeta";

// Root layout for the English-only SEO landing pages. A separate root layout
// is what lets these pages ship <html lang="en" dir="ltr"> in the
// server-rendered HTML: the Hebrew site's single root layout hardcodes
// lang="he" dir="rtl", and a client-side fix after load is too late for
// crawlers. Each page supplies its own title, description, canonical and OG.
export const metadata: Metadata = rootBaseMetadata;
export const viewport = rootViewport;

export default function EnglishRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <RootHead />
      </head>
      <body><RegisterSW />{children}<Analytics /></body>
    </html>
  );
}
