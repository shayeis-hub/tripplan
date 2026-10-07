import type { Metadata } from "next";
import { blogPosts } from "@/lib/blog-posts";
import { pageMeta } from "@/lib/seo";

// The post page itself is a client component (language switching), so its
// per-post <title>/<meta> is built here from the same blog-posts data.
// Served metadata is Hebrew, matching the SSR language.
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) {
    return pageMeta({
      title: "מאמר לא נמצא – הבלוג של טיולון",
      description: "המאמר המבוקש אינו קיים.",
      path: `/blog/${slug}`,
      noindex: true,
    });
  }
  return pageMeta({
    title: `${post.title.he} | הבלוג של טיולון`,
    description: post.excerpt.he,
    path: `/blog/${post.slug}`,
  });
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
