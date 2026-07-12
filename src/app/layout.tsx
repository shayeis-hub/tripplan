import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { LangProvider } from "@/lib/LangContext";
import RegisterSW from "@/components/RegisterSW";
import RefCapture from "@/components/RefCapture";
import DirSetter from "@/components/DirSetter";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "טיולון – מתכנן הטיולים שלי",
  description: "תכנן טיולים, עקוב אחר הוצאות ותאם עם חברי הטיול",
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

export const viewport: Viewport = {
  themeColor: "#0d2137",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <script dangerouslySetInnerHTML={{__html:`(function(){var script=document.createElement("script");script.async=1;script.src='https://tp-em.com/NTM1MDI0.js?t=535024';document.head.appendChild(script);})();`}}/>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="טיולון" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </head>
      <body><LangProvider><DirSetter /><AuthProvider><RegisterSW /><RefCapture />{children}<Analytics /></AuthProvider></LangProvider></body>
    </html>
  );
}
