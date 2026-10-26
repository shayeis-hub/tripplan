import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import TripPlanningAppPage, {
  TRIP_APP_PATH,
  TRIP_APP_TITLE,
  TRIP_APP_DESCRIPTION,
} from "@/components/TripPlanningAppPage";

// Hebrew pillar page for "אפליקציה לתכנון טיול". There is no parallel page in
// another language, so no hreflang set: a self-referencing canonical only.
export const metadata: Metadata = pageMeta({
  title: TRIP_APP_TITLE,
  description: TRIP_APP_DESCRIPTION,
  path: TRIP_APP_PATH,
  locale: "he_IL",
  image: { url: "/icon-512.png", width: 512, height: 512, alt: "TUlon app icon" },
});

export default function TripPlanningAppRoute() {
  return <TripPlanningAppPage />;
}
