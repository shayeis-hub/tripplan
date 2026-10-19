import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-posts";
import { SITE_URL } from "@/lib/seo";
import { DESTINATIONS, DESTINATIONS_PATH } from "@/lib/destinations";
import { LOCALIZED_PAGES, hreflang, blogPostPage } from "@/lib/localizedPages";

// Next.js serves this at /sitemap.xml. Only public, indexable routes —
// /login, /admin, /trip/* and internal pages are left out on purpose.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: {
    path: string;
    priority: number;
    changeFrequency: "weekly" | "monthly" | "yearly";
  }[] = [

    { path: "/group-trip-planner",              priority: 0.8, changeFrequency: "monthly" },
    { path: "/splitwise-alternative-for-travel", priority: 0.8, changeFrequency: "monthly" },
    { path: "/group-travel-expense-tracker",    priority: 0.8, changeFrequency: "monthly" },
    { path: DESTINATIONS_PATH, priority: 0.7, changeFrequency: "monthly" },
    { path: "/contact",  priority: 0.3, changeFrequency: "yearly"  },
    { path: "/privacy",  priority: 0.2, changeFrequency: "yearly"  },
    { path: "/terms",    priority: 0.2, changeFrequency: "yearly"  },
  ];

  // Hebrew, English and Spanish copies of the home, features and plan pages. Each
  // entry lists all alternates (and x-default), as Google expects.
  const localized = Object.values(LOCALIZED_PAGES).flatMap((p) => {
    const languages = Object.fromEntries(Object.entries(hreflang(p)).map(([k, v]) => [k, `${SITE_URL}${v}`]));
    const priority = p.key === "home" ? 1.0 : p.key === "about" ? 0.5 : p.key === "blog" ? 0.7 : 0.8;
    return ([p.he, p.en, p.es] as const).map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: (p.key === "home" || p.key === "blog" ? "weekly" : p.key === "about" ? "yearly" : "monthly") as "weekly" | "monthly" | "yearly",
      priority,
      alternates: { languages },
    }));
  });

  return [
    ...localized,
    ...staticRoutes.map((r) => ({
      url: `${SITE_URL}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...DESTINATIONS.map((d) => ({
      url: `${SITE_URL}${d.path}`,
      lastModified: new Date(`${d.updated}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...blogPosts.flatMap((p) => {
      const pg = blogPostPage(p.slug);
      const languages = Object.fromEntries(Object.entries(hreflang(pg)).map(([k, v]) => [k, `${SITE_URL}${v}`]));
      return ([pg.he, pg.en, pg.es] as const).map((path) => ({
        url: `${SITE_URL}${path}`,
        lastModified: p.date ? new Date(p.date) : now,
        changeFrequency: "yearly" as const,
        priority: 0.6,
        alternates: { languages },
      }));
    }),
  ];
}
