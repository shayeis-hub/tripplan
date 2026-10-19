import TermsView from "@/components/TermsView";
import HebrewGate from "@/components/HebrewGate";
import { LOCALIZED_PAGES, pagePaths } from "@/lib/localizedPages";

export default function TermsPage() {
  return (
    <HebrewGate paths={pagePaths(LOCALIZED_PAGES.terms)}>
      <TermsView />
    </HebrewGate>
  );
}
