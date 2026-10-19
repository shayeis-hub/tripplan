import { notFound } from "next/navigation";
import BlogPostView from "@/components/BlogPostView";
import HebrewGate from "@/components/HebrewGate";
import { blogPosts } from "@/lib/blog-posts";
import { blogPostPage, pagePaths } from "@/lib/localizedPages";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!blogPosts.some((p) => p.slug === slug)) notFound();
  return (
    <HebrewGate paths={pagePaths(blogPostPage(slug))}>
      <BlogPostView slug={slug} />
    </HebrewGate>
  );
}
