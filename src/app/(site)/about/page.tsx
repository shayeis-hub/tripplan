import AboutView from "@/components/AboutView";
import HebrewGate from "@/components/HebrewGate";
import { LOCALIZED_PAGES, pagePaths } from "@/lib/localizedPages";

export default function AboutPage() {
  return (
    <HebrewGate paths={pagePaths(LOCALIZED_PAGES.about)}>
      <AboutView />
    </HebrewGate>
  );
}
