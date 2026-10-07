import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SeoPage, Hero, Section, P, List, Steps, Faq, CtaBand, Link } from "@/components/SeoLanding";

const PATH = "/splitwise-alternative-for-travel";
const TITLE = "Splitwise Alternative for Group Travel | TUlon";
const DESCRIPTION =
  "Looking for a Splitwise alternative built around travel? TUlon combines group trip planning, shared budgets, expenses and settlement in one app.";

export const metadata: Metadata = pageMeta({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  locale: "en_US",
  image: { url: "/icon-512.png", width: 512, height: 512, alt: "TUlon app icon" },
});

export default function SplitwiseAlternativePage() {
  return (
    <SeoPage path={PATH} name={TITLE} description={DESCRIPTION}>
      <Hero
        h1="A Splitwise Alternative Built Around the Whole Trip"
        lead="Splitwise is useful when the main job is splitting expenses. TUlon is designed for travelers who also want to organize the trip around those expenses."
        cta="Try TUlon for Your Next Trip"
      />

      <Section title="Expense Splitting Is Only Part of a Group Trip">
        <P>
          Splitwise describes itself as a way to keep track of shared expenses and balances with housemates,
          trips, groups, friends and family. For a lot of situations, that is exactly what you need.
        </P>
        <P>
          A trip adds questions that are not only about money. Groups usually also need to know:
        </P>
        <List
          items={[
            "what they are doing, and when",
            "what the trip budget looks like",
            "what has already been spent",
            "who paid for what",
            "what remains to be settled",
          ]}
        />
        <P>
          If those answers live in different places, a chat for the plans, a spreadsheet for the budget and an
          expense app for the money, someone ends up copying information between them. TUlon is a{" "}
          <Link href="/group-trip-planner">group trip planner</Link> that keeps them together.
        </P>
      </Section>

      <Section title="When TUlon May Be a Better Fit for Your Trip">
        <List
          items={[
            "Your group wants the itinerary and the expenses in the same place.",
            "You are traveling internationally and paying in more than one currency. TUlon lets you record each expense in the currency you paid in and converts it automatically so the trip totals stay comparable.",
            "You prefer one trip-focused workspace over several tools.",
            "You want to manage the trip from planning through to settlement, rather than only the money part.",
          ]}
        />
        <P>
          It may not be the right choice for everything. If you only need to track shared costs, whether
          that is housemates, a regular dinner group or a trip where the plans are already sorted, a
          standalone expense-splitting app can be all you need. TUlon is not trying to replace Splitwise for
          every use case.
        </P>
      </Section>

      <Section title="TUlon vs. a Standalone Expense-Splitting App">
        <div className="seo-table-wrap">
          <table className="seo-table">
            <thead>
              <tr>
                <th scope="col">&nbsp;</th>
                <th scope="col">Splitwise</th>
                <th scope="col">TUlon</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Built around</th>
                <td>Shared expenses and balances</td>
                <td>Group trips: itinerary, budget and shared expenses</td>
              </tr>
              <tr>
                <th scope="row">Where people use it</th>
                <td>Housemates, trips, groups, friends and family</td>
                <td>Trips</td>
              </tr>
              <tr>
                <th scope="row">Shared expenses and who owes whom</th>
                <td>Yes</td>
                <td>Yes</td>
              </tr>
              <tr>
                <th scope="row">Simplified payments to settle up</th>
                <td>Yes</td>
                <td>Yes</td>
              </tr>
              <tr>
                <th scope="row">Platforms</th>
                <td>iPhone, Android and web</td>
                <td>iPhone, Android and web browser</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="seo-note">
          Splitwise details come from Splitwise&apos;s own website and public descriptions. Check splitwise.com
          for its current features. TUlon is an independent app and is not affiliated with Splitwise.
          Splitwise is a trademark of its owner.
        </p>
        <P>
          On top of expense tracking, TUlon adds the planning side of a trip: a day-by-day itinerary, a trip
          budget with spending by category, and a map of your places. For the details of
          the expense side, see{" "}
          <Link href="/group-travel-expense-tracker">how TUlon tracks group travel expenses</Link>.
        </P>
      </Section>

      <Section title="Plan First. Track Spending Along the Way.">
        <Steps
          items={[
            <><strong>Set up the trip.</strong> Add the destination, dates and a budget, then invite your group.</>,
            <><strong>Plan the days.</strong> Put flights, hotels and activities into the shared itinerary.</>,
            <><strong>Log expenses as you go.</strong> Record the amount, currency, who paid and who it was for.</>,
            <><strong>Settle up.</strong> TUlon shows who owes whom when the trip ends.</>,
          ]}
        />
      </Section>

      <Section title="One Trip, One Place">
        <P>
          When an expense sits inside the trip, with a date and a category next to the plans for that day, it
          is easier to remember what it was for. A payment dated Tuesday is less of a mystery when the plan for
          Tuesday says you were at the market that morning.
        </P>
        <P>
          It also means the budget reflects the same trip you are planning. You can see how much has been
          spent against the budget while there is still time to adjust the rest of the plan.
        </P>
      </Section>

      <Faq
        title="Splitwise Alternative FAQ"
        items={[
          {
            q: "Is TUlon a Splitwise replacement?",
            a: "Not for every use case. Splitwise is built around shared expenses in many situations. TUlon is an alternative for travelers who want trip planning and shared expenses in the same travel-focused app.",
          },
          {
            q: "How is TUlon different from Splitwise?",
            a: "The difference is scope. Splitwise focuses on shared expenses and balances. TUlon connects the trip itinerary and budget with group expenses and settlement.",
          },
          {
            q: "Can TUlon split travel expenses?",
            a: "Yes. For each expense you record who paid and who took part. Expenses can be marked as shared or personal, and TUlon calculates who owes whom for the shared ones.",
          },
          {
            q: "Does TUlon support multiple currencies?",
            a: "Yes. You can record each expense in the currency you paid in. TUlon converts them automatically so the trip totals stay comparable.",
          },
          {
            q: "Can my whole travel group use TUlon?",
            a: "Yes. You can invite people to a trip with a link, by email or through WhatsApp, and give view-only access to anyone who just wants to follow along.",
          },
        ]}
      />

      <CtaBand
        title="Planning a Group Trip?"
        text="Keep the itinerary, budget and shared expenses together with TUlon."
        cta="Try TUlon for Your Next Trip"
      />
    </SeoPage>
  );
}
