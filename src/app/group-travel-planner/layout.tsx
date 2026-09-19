import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Group Travel Planner: Itinerary, Budget & Expense Splitting | Tulon",
  description:
    "Tulon is a free group travel planning app that combines a shared itinerary, multi-currency expense tracking, automatic settlement, maps, packing lists and real-time collaboration in one place.",
  path: "/group-travel-planner",
});

export default function GroupTravelPlannerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
