import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SeoPage, Hero, Section, P, H3, List, Steps, Shots, Faq, CtaBand, Link } from "@/components/SeoLanding";

const PATH = "/group-trip-planner";
const TITLE = "Group Trip Planner for Friends | TUlon";
const DESCRIPTION =
  "Plan group trips together with TUlon. Build a shared itinerary, organize activities, manage budgets and track group expenses in one place.";

export const metadata: Metadata = pageMeta({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  locale: "en_US",
  image: { url: "/icon-512.png", width: 512, height: 512, alt: "TUlon app icon" },
});

export default function GroupTripPlannerPage() {
  return (
    <SeoPage path={PATH} name={TITLE} description={DESCRIPTION}>
      <Hero
        h1="Plan Group Trips Together, Without the Chaos"
        lead="TUlon brings your group itinerary, plans, budget and shared expenses together in one place, so everyone knows what is happening and what they owe."
        cta="Plan a Trip with TUlon"
      />

      <Section title="One Place for the Whole Group Trip">
        <P>
          Most group trips start in a chat. Someone posts a flight, someone else shares a list of restaurants,
          a spreadsheet appears for the budget, and a few weeks later nobody can remember which message had the
          hotel address.
        </P>
        <P>
          TUlon is a group trip planner built to keep the important parts of a trip together: the itinerary,
          the budget and the money you spend as a group. Instead of searching through old messages, everyone
          opens the trip and sees where things stand.
        </P>
      </Section>

      <Section title="Build a Shared Trip Itinerary">
        <P>
          Create a trip with its destination and dates, then fill in the days. Add flights and hotel stays,
          and plan activities for the time in between. Everything planned for a given day shows up together.
        </P>
        <List
          items={[
            "A day-by-day view of the whole trip, so you can see what is planned for each date",
            "Flights, hotel stays and activities in the same schedule",
            "A map of the places in your trip",
            "A printable itinerary you can export and share",
          ]}
        />
        <P>
          Invite your group with a link, by email or through WhatsApp. When someone makes a change, it syncs to
          everyone else&apos;s devices, so the plan stays current. If a person only needs to follow along, you
          can give them view-only access.
        </P>
      </Section>

      <Section title="Keep the Trip Budget Visible">
        <P>
          Planning and spending are connected. A hotel you booked or a tour you added changes how much room is
          left in the budget.
        </P>
        <P>
          Set a budget for the trip, then watch it fill up as you add expenses. TUlon shows what has been
          spent, what is left, and how spending splits across categories such as flights, hotels, food and
          attractions. If you want the detail, see how{" "}
          <Link href="/group-travel-expense-tracker">group travel expense tracking</Link> works in TUlon.
        </P>
      </Section>

      <Section title="Track Shared Expenses While You Travel">
        <P>
          Add an expense when it happens: the amount, the currency, who paid and who it was for. TUlon keeps a
          running record, so nobody has to reconstruct the week from memory at the end.
        </P>
        <P>
          Expenses can be entered in the currency you actually paid in. TUlon converts them
          automatically so the trip totals and the budget stay comparable. When the trip is over, TUlon
          works out who owes whom and shows a short list of payments to settle up.
        </P>
        <P>
          Already use a standalone expense-splitting app? Here is how TUlon compares as a{" "}
          <Link href="/splitwise-alternative-for-travel">Splitwise alternative for travel</Link>.
        </P>
      </Section>

      <Section title="Made for Trips with Friends, Couples and Groups">
        <H3>Friends traveling abroad</H3>
        <P>
          One person books the apartment, another pays for the train, a third covers dinner. With a shared
          itinerary and a shared expense record, nobody has to keep the whole picture in their head.
        </P>
        <H3>Couples traveling with other couples</H3>
        <P>
          Split by person rather than by couple, or keep some purchases personal. Expenses can be marked as
          shared or personal, and only the shared ones go into the final settlement.
        </P>
        <H3>Family trips</H3>
        <P>
          Keep flights, hotel stays and day plans in one schedule, and share it with relatives who are
          joining part of the trip. Relatives who just want to check the plan can have view-only access.
        </P>
        <H3>Small groups organizing a vacation</H3>
        <P>
          Group trips work best when the planning does not depend on one person. Everyone
          invited to the trip can see the same itinerary and budget.
        </P>
      </Section>

      <Section title="From Planning to the Final Settlement">
        <Steps
          items={[
            <><strong>Plan.</strong> Create the trip, set the dates and add a budget.</>,
            <><strong>Organize.</strong> Add flights, hotels and activities, and invite the group.</>,
            <><strong>Travel.</strong> Check each day&apos;s schedule and the map as you go.</>,
            <><strong>Record expenses.</strong> Log what you spend, who paid and who it was for.</>,
            <><strong>Settle.</strong> See who owes whom when the trip ends.</>,
          ]}
        />
        <Shots
          shots={[
            {
              src: "/guide-images/04_itinerary.png",
              alt: "TUlon trip calendar showing a month of planned days with markers for flights, hotels, expenses and activities (Hebrew interface)",
              caption: "The trip calendar, with each day's plans and costs.",
            },
            {
              src: "/guide-images/05_budget_and_settlement.png",
              alt: "TUlon budget screen showing total spent, budget progress, spending by category and the settlement between two travelers (Hebrew interface)",
              caption: "Budget, spending by category and settlement.",
            },
          ]}
        />
      </Section>

      <Faq
        title="Group Trip Planning FAQ"
        items={[
          {
            q: "What is a group trip planner?",
            a: "A group trip planner is an app that lets several people plan a trip together in one shared place instead of across chats and documents. TUlon combines a shared itinerary with a trip budget and group expense tracking.",
          },
          {
            q: "Can several people use TUlon for the same trip?",
            a: "Yes. You can invite people to a trip with a link, by email or through WhatsApp. Changes sync across devices, and you can give someone view-only access if they only need to follow the plan.",
          },
          {
            q: "Can TUlon track shared travel expenses?",
            a: (
              <>
                Yes. You record each expense with who paid and who it was for, and TUlon calculates who owes
                whom at the end. More on{" "}
                <Link href="/group-travel-expense-tracker">tracking group travel expenses</Link>.
              </>
            ),
          },
          {
            q: "Can I use TUlon for international trips?",
            a: "Yes. You can record expenses in different currencies, and TUlon converts them automatically so the trip totals stay comparable.",
          },
          {
            q: "Is TUlon available on iPhone and Android?",
            a: "Yes. TUlon is available for iPhone on the App Store and for Android on Google Play. You can also open it in a web browser at tulon.app.",
          },
        ]}
      />

      <CtaBand
        title="Ready to plan your next trip together?"
        text="Plan the itinerary, keep track of the budget and manage group expenses with TUlon."
        cta="Start Planning Your Trip"
      />
    </SeoPage>
  );
}
