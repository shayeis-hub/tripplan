import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SeoPage, Hero, Section, P, List, Shots, Faq, CtaBand, Link } from "@/components/SeoLanding";

const PATH = "/group-travel-expense-tracker";
const TITLE = "Group Travel Expense Tracker | TUlon";
const DESCRIPTION =
  "Track group travel expenses with TUlon. Keep your trip budget, shared spending, payments and settlement organized while you travel together.";

export const metadata: Metadata = pageMeta({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  locale: "en_US",
  image: { url: "/icon-512.png", width: 512, height: 512, alt: "TUlon app icon" },
});

export default function GroupTravelExpenseTrackerPage() {
  return (
    <SeoPage path={PATH} name={TITLE} description={DESCRIPTION}>
      <Hero
        h1="Track Group Travel Expenses Without Losing Track of the Trip"
        lead="Keep shared spending connected to the trip itself. TUlon helps groups organize travel expenses, budgets and settlement alongside their plans."
        cta="Track Your Next Trip with TUlon"
      />

      <Section title="Shared Travel Expenses Get Complicated Fast">
        <P>It rarely goes evenly. A group trip usually looks more like this:</P>
        <List
          items={[
            "One person pays for the hotel when booking.",
            "Someone else buys the train tickets.",
            "A third person covers dinner, and the next night it is someone different.",
            "Some costs are for everyone and some are only for a few people.",
          ]}
        />
        <P>
          When those records are spread across messages, notes and memory, working out who owes whom at the
          end becomes a guessing exercise, and it is easy for someone to end up quietly paying more than their
          share.
        </P>
      </Section>

      <Section title="Record Who Paid and Keep the Group Organized">
        <P>
          In TUlon you add an expense when it happens. For each one you enter:
        </P>
        <List
          items={[
            "the amount and the currency you paid in",
            "a short description and a category, such as flight, hotel, food or attraction",
            "the date",
            "who paid, and who took part in the expense",
          ]}
        />
        <P>
          Expenses can be marked as shared or personal. Personal ones stay in your trip record but are left out
          of the group settlement. You can also mark each expense as paid or not yet paid.
        </P>
        <P>
          If you would rather not type everything, you can photograph a receipt and TUlon fills in the amount,
          currency, date and category for you to check.
        </P>
        <Shots
          shots={[
            {
              src: "/guide-images/03_budget.png",
              alt: "TUlon budget overview with totals, budget progress and spending by category (Hebrew interface)",
              caption: "Totals and spending by category.",
            },
            {
              src: "/guide-images/05_budget_and_settlement.png",
              alt: "TUlon budget screen with the settlement card showing who owes whom (Hebrew interface)",
              caption: "Settlement at the bottom of the budget screen.",
            },
          ]}
        />
      </Section>

      <Section title="Keep Spending Connected to Your Trip Budget">
        <P>
          Recording expenses and understanding them are different things. A list of payments tells you what
          happened. A budget tells you whether that is a problem.
        </P>
        <P>
          In TUlon you set a budget for the trip, and every expense counts against it. The budget screen shows
          the total spent, how much is left and how spending splits across categories, so you can notice early
          that food is running ahead of plan while there is still time to adjust.
        </P>
      </Section>

      <Section title="Travel Across Currencies">
        <P>
          On a trip abroad, you rarely pay in a single currency. In TUlon you record each expense in the
          currency you actually paid in, and the trip&apos;s totals and budget are shown in one currency.
        </P>
        <P>
          TUlon converts the amounts using exchange rates it retrieves online. Treat the result as a good
          estimate for tracking, since a card statement may use a slightly different rate.
        </P>
      </Section>

      <Section title="Settle Up at the End">
        <P>
          When the trip is over, TUlon works out who owes whom, based on who paid and who took part in each
          shared expense. Instead of everyone sending money to everyone, you get a short list of payments that
          settles the balance.
        </P>
        <P>
          You can also export a trip expense report if you want a copy to keep or share with the group.
        </P>
      </Section>

      <Section title="More Than an Expense Tracker">
        <P>
          TUlon is a trip planner first, so the expenses sit next to the plans. You can build a shared
          itinerary, invite the group and keep the budget in view in the same app. See how it works as a{" "}
          <Link href="/group-trip-planner">group trip planner</Link>.
        </P>
        <P>
          If you are comparing it with an expense-only app, we wrote a fair look at TUlon as a{" "}
          <Link href="/splitwise-alternative-for-travel">Splitwise alternative for travel</Link>.
        </P>
      </Section>

      <Faq
        title="Group Travel Expenses FAQ"
        items={[
          {
            q: "How do you track expenses on a group trip?",
            a: "Record each expense as it happens, with the amount, who paid and who it was for. Doing it at the time of payment is far easier than rebuilding it later. TUlon keeps the record for the whole group in one place.",
          },
          {
            q: "Can TUlon split expenses between travelers?",
            a: "Yes. For each expense you choose who took part, and TUlon uses that, along with who paid, to work out who owes whom at the end of the trip.",
          },
          {
            q: "Can I track a travel budget and actual expenses?",
            a: "Yes. You set a budget for the trip, and TUlon shows how much has been spent, how much is left and how spending breaks down by category.",
          },
          {
            q: "Does TUlon work with multiple currencies?",
            a: "Yes. You can record an expense in the currency you paid in. TUlon converts it using exchange rates it retrieves online, so totals and the budget stay in a single currency.",
          },
          {
            q: "Can I use TUlon for a trip with friends?",
            a: "Yes. Invite your friends with a link, by email or through WhatsApp, and everyone can see the same trip. You can give view-only access to anyone who just wants to follow along.",
          },
        ]}
      />

      <CtaBand
        title="Spend Less Time Calculating. More Time Traveling."
        text="Keep the budget, the shared expenses and the plans for your next trip in one place."
        cta="Start Your Trip in TUlon"
      />
    </SeoPage>
  );
}
