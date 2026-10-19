import PlanView from "@/components/PlanView";
import HebrewGate from "@/components/HebrewGate";
import { LOCALIZED_PAGES, pagePaths } from "@/lib/localizedPages";

export default function PlanPage() {
  return (
    <HebrewGate paths={pagePaths(LOCALIZED_PAGES.plan)}>
      <PlanView />
    </HebrewGate>
  );
}
