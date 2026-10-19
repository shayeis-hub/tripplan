import PrivacyView from "@/components/PrivacyView";
import HebrewGate from "@/components/HebrewGate";
import { LOCALIZED_PAGES, pagePaths } from "@/lib/localizedPages";

export default function PrivacyPage() {
  return (
    <HebrewGate paths={pagePaths(LOCALIZED_PAGES.privacy)}>
      <PrivacyView />
    </HebrewGate>
  );
}
