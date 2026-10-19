import ContactView from "@/components/ContactView";
import HebrewGate from "@/components/HebrewGate";
import { LOCALIZED_PAGES, pagePaths } from "@/lib/localizedPages";

export default function ContactPage() {
  return (
    <HebrewGate paths={pagePaths(LOCALIZED_PAGES.contact)}>
      <ContactView />
    </HebrewGate>
  );
}
