import FeaturesView from "@/components/FeaturesView";
import HebrewGate from "@/components/HebrewGate";
import { LOCALIZED_PAGES, pagePaths } from "@/lib/localizedPages";

export default function FeaturesPage() {
  return (
    <HebrewGate paths={pagePaths(LOCALIZED_PAGES.features)}>
      <FeaturesView />
    </HebrewGate>
  );
}
