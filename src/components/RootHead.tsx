import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/seo";

// Site-wide identity schema — the sitewide baseline; SoftwareApplication
// (homepage) and per-page schema live next to the content they describe.
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TUlon",
  alternateName: "טיולון",
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  sameAs: ["https://www.instagram.com/tulonapp"],
};
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "TUlon",
  alternateName: "טיולון",
  url: SITE_URL,
  inLanguage: ["he", "en", "es"],
};

// The <head> contents both root layouts share, so the two stay identical.
export default function RootHead() {
  return (
    <>
      <script dangerouslySetInnerHTML={{__html:`(function(){var script=document.createElement("script");script.async=1;script.src='https://tp-em.com/NTM1MDI0.js?t=535024';document.head.appendChild(script);})();`}}/>
      <link rel="manifest" href="/manifest.json" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="טיולון" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <JsonLd data={orgSchema} />
      <JsonLd data={websiteSchema} />
    </>
  );
}
