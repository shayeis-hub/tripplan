// Renders a schema.org JSON-LD block. Used inside client components
// ("use client" pages) — Next still includes their initial output in the
// server-rendered HTML (only the *interactivity* is client-only), so this
// script tag reaches crawlers and non-JS fetchers the same as any other
// server-rendered markup, same as the rest of the page since the SSR fix.
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
