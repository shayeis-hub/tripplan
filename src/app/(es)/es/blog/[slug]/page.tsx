import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMeta } from "@/lib/seo";
import BlogPostView from "@/components/BlogPostView";
import LocalizedPage from "@/components/LocalizedPage";
import { blogPosts } from "@/lib/blog-posts";
import { blogPostPage, hreflang, pagePaths } from "@/lib/localizedPages";

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  const page = blogPostPage(post.slug);
  return pageMeta({
    title: `${post.title.es} | Blog de TUlon`,
    description: post.excerpt.es,
    path: page.es,
    locale: "es_ES",
    languages: hreflang(page),
  });
}

export default async function BlogEsPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!blogPosts.some((p) => p.slug === slug)) notFound();
  return (
    <LocalizedPage lang="es" paths={pagePaths(blogPostPage(slug))}>
      <BlogPostView slug={slug} />
    </LocalizedPage>
  );
}
