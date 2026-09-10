import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-posts";
import { SITE_URL } from "@/lib/seo";

// Next.js serves this at /sitemap.xml. Only public, indexable routes —
// /login, /admin, /trip/* and internal pages are left out on purpose.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: {
    path: string;
    priority: number;
    changeFrequency: "weekly" | "monthly" | "yearly";
  }[] = [
    { path: "/",         priority: 1.0, changeFrequency: "weekly"  },
    { path: "/features", priority: 0.8, changeFrequency: "monthly" },
    { path: "/plan",     priority: 0.8, changeFrequency: "monthly" },
    { path: "/blog",     priority: 0.7, changeFrequency: "weekly"  },
    { path: "/about",    priority: 0.5, changeFrequency: "yearly"  },
    { path: "/contact",  priority: 0.3, changeFrequency: "yearly"  },
    { path: "/privacy",  priority: 0.2, changeFrequency: "yearly"  },
    { path: "/terms",    priority: 0.2, changeFrequency: "yearly"  },
  ];

  return [
    ...staticRoutes.map((r) => ({
      url: `${SITE_URL}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...blogPosts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.date ? new Date(p.date) : now,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
