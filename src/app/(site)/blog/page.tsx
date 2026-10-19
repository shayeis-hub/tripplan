import BlogIndexView from "@/components/BlogIndexView";
import HebrewGate from "@/components/HebrewGate";
import { LOCALIZED_PAGES, pagePaths } from "@/lib/localizedPages";

export default function BlogPage() {
  return (
    <HebrewGate paths={pagePaths(LOCALIZED_PAGES.blog)}>
      <BlogIndexView />
    </HebrewGate>
  );
}
