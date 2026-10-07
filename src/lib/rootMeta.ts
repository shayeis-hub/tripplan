import type { Metadata, Viewport } from "next";
import { SITE_URL } from "@/lib/seo";

// Metadata/viewport shared by both root layouts: (site) — the Hebrew-first
// site — and (en) — the English-only SEO landing pages, which need their own
// <html lang="en" dir="ltr"> in the server-rendered HTML. Per-page title,
// description, canonical and OG tags are set by each page via pageMeta().
export const rootBaseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "טיולון",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "טיולון",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-512.png",      sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const rootViewport: Viewport = {
  themeColor: "#0d2137",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  // Capacitor's iOS StatusBar plugin defaults to overlaysWebView: true, so the
  // WebView content already extends under the notch/status bar and home
  // indicator. Without viewport-fit=cover, env(safe-area-inset-*) always
  // evaluates to 0 — this is the prerequisite for the padding added below to
  // do anything at all, not a redundant flag.
  viewportFit: "cover",
};
