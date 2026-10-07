import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { computeProductMetrics, toTripLite } from "@/lib/adminMetrics";
import { classifySource, SOURCE_ORDER } from "@/lib/acquisition";
import { buildReminderPreview, notificationEventId, type EventSummary, type PushChannel } from "@/lib/preTripReminder";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "shayeis@gmail.com";

// The stats need a full scan of the trips collection (every trip embeds its
// own expenses/activities, so there is no cheaper aggregate). To avoid paying
// that on every dashboard render, the computed payload is kept in memory for a
// few minutes per server instance; the Refresh button bypasses it (?fresh=1).
const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { at: number; data: unknown } | null = null;

export async function GET(req: Request) {
  const adminAuth = getAdminAuth();
  const adminDb   = getAdminDb();

  // Verify Firebase ID token
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const fresh = new URL(req.url).searchParams.get("fresh") === "1";
  if (!fresh && cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return NextResponse.json(cache.data);
  }

  try {
    // User count. listUsers returns at most 1000 per page, so follow the page
    // token (Auth reads are not Firestore reads) instead of silently stopping
    // at the first 1000.
    const allUsers: Awaited<ReturnType<typeof adminAuth.listUsers>>["users"] = [];
    let pageToken: string | undefined;
    do {
      const page = await adminAuth.listUsers(1000, pageToken);
      allUsers.push(...page.users);
      pageToken = page.pageToken;
    } while (pageToken);
    const userList = { users: allUsers };
    const userCount = userList.users.length;

    // Count by registration date
    const now = Date.now();
    const day = 86400000;
    const newUsersToday  = userList.users.filter(u => now - new Date(u.metadata.creationTime).getTime() < day).length;
    const newUsersWeek   = userList.users.filter(u => now - new Date(u.metadata.creationTime).getTime() < 7 * day).length;
    const newUsersMonth  = userList.users.filter(u => now - new Date(u.metadata.creationTime).getTime() < 30 * day).length;

    // Per-day series for the last 30 days (signups + active/returning users)
    const DAYS = 30;
    const key = (t: string | number | Date) => {
      const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    };
    const signupMap: Record<string, number> = {};
    const activeMap: Record<string, number> = {};
    for (let i = DAYS - 1; i >= 0; i--) { const kk = key(now - i * day); signupMap[kk] = 0; activeMap[kk] = 0; }
    userList.users.forEach(u => {
      const c = key(u.metadata.creationTime); if (c in signupMap) signupMap[c]++;
      if (u.metadata.lastSignInTime) { const l = key(u.metadata.lastSignInTime); if (l in activeMap) activeMap[l]++; }
    });
    const signupsByDay = Object.keys(signupMap).map(date => ({ date, count: signupMap[date] }));
    const activeByDay  = Object.keys(activeMap).map(date => ({ date, count: activeMap[date] }));

    // Trips count (the one full scan; the product metrics below reuse it)
    const tripsSnap = await adminDb.collection("trips").get();
    const tripCount = tripsSnap.size;

    // Expenses count + total ILS
    let expenseCount = 0;
    let totalILS = 0;
    tripsSnap.forEach(doc => {
      const data = doc.data();
      const expenses = data.expenses || [];
      expenseCount += expenses.length;
      expenses.forEach((e: any) => { totalILS += e.amountILS || 0; });
    });
    // Product-usage metrics + funnel, from the same scan (no extra reads).
    // lastRefreshTime moves whenever the app refreshes the session token, so it
    // reflects real use far better than lastSignInTime, which only changes on
    // an explicit sign-in.
    const t = (s?: string | null) => (s ? new Date(s).getTime() : NaN);
    const usersLite = userList.users.map(u => {
      const seen = [t(u.metadata.lastSignInTime), t(u.metadata.lastRefreshTime)].filter(x => !isNaN(x));
      return {
        uid: u.uid,
        email: u.email ? u.email.toLowerCase() : null,
        created: new Date(u.metadata.creationTime).getTime(),
        lastActive: seen.length ? Math.max(...seen) : null,
      };
    });
    const tripsLite: ReturnType<typeof toTripLite>[] = [];
    tripsSnap.forEach(doc => tripsLite.push(toTripLite(doc.id, doc.data())));
    const product = computeProductMetrics(usersLite, tripsLite);

    // "Active this week" and the activation KPI use the same definitions as the
    // rest of the dashboard: last activity = later of lastRefreshTime and
    // lastSignInTime; activated = owns at least one real (non-draft) trip.
    const activeWeekUnified = usersLite.filter(u => u.lastActive != null && now - u.lastActive < 7 * day).length;
    const activatedUsers = product.tripCreators.count;
    const activationRate = Math.round(product.tripCreators.pct);

    // Acquisition: only records written since tracking shipped exist; one read
    // per NEW registration (not per trip), and nothing is invented for older
    // users. The section stays hidden in the UI while total is 0.
    const acqSnap = await adminDb.collection("userAcquisition").get();
    const creatorSet = new Set(product.creatorUids);
    const groupAgg: Record<string, { count: number; creators: number }> = {};
    SOURCE_ORDER.forEach(k => { groupAgg[k] = { count: 0, creators: 0 }; });
    const campaigns: Record<string, number> = {};
    acqSnap.forEach(d => {
      const a = d.data();
      const g = classifySource({ utmSource: a.utmSource, utmMedium: a.utmMedium, referrer: a.referrer });
      groupAgg[g].count++;
      if (creatorSet.has(d.id)) groupAgg[g].creators++;
      if (a.utmCampaign) campaigns[a.utmCampaign] = (campaigns[a.utmCampaign] || 0) + 1;
    });
    const acquisition = {
      total: acqSnap.size,
      groups: SOURCE_ORDER.map(key => ({ key, ...groupAgg[key] })),
      campaigns: Object.entries(campaigns).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count })),
    };

    // Recent users (last 5)
    const recentUsers = userList.users
      .sort((a, b) => new Date(b.metadata.creationTime).getTime() - new Date(a.metadata.creationTime).getTime())
      .slice(0, 5)
      .map(u => {
        const lite = usersLite.find(x => x.uid === u.uid);
        return {
          email: u.email,
          created: u.metadata.creationTime,
          lastSignIn: u.metadata.lastSignInTime,
          lastActive: lite?.lastActive ? new Date(lite.lastActive).toISOString() : null,
          usage: product.perUser[u.uid],
        };
      });

    // "Departing soon" list (next 7 days) with a PREVIEW of the 7-day reminder.
    // Read-only: looks up, for just these few trips, whether the owner has a
    // push token (booleans only, never the token) and whether an event doc
    // already exists. Nothing is sent or written here.
    const soonRows = product.tripRows.filter(
      r => r.phase !== "past" && r.daysToStart != null && r.daysToStart >= 0 && r.daysToStart <= 7,
    );
    const subByOwner = new Map<string, { channel: PushChannel; lang: unknown }>();
    const eventByTrip = new Map<string, EventSummary | null>();
    if (soonRows.length > 0) {
      const owners = [...new Set(soonRows.map(r => r.owner))];
      const subSnaps = await adminDb.getAll(...owners.map(o => adminDb.collection("pushSubscriptions").doc(o)));
      subSnaps.forEach((s, i) => {
        const d = s.exists ? (s.data() as { fcmToken?: string; subscription?: unknown; lang?: unknown }) : null;
        const fcm = !!d?.fcmToken;
        const web = !!d?.subscription;
        subByOwner.set(owners[i], { channel: fcm && web ? "both" : fcm ? "fcm" : web ? "web" : "none", lang: d?.lang });
      });
      const evSnaps = await adminDb.getAll(...soonRows.map(r => adminDb.collection("notificationEvents").doc(notificationEventId(r.id))));
      evSnaps.forEach((s, i) => {
        const e = s.exists ? (s.data() as EventSummary) : null;
        eventByTrip.set(soonRows[i].id, e && {
          status: e.status, attemptCount: e.attemptCount, reservedAt: e.reservedAt, sentAt: e.sentAt ?? null,
          failedAt: e.failedAt ?? null, openedAt: e.openedAt ?? null, permanent: !!e.permanent, lastError: e.lastError ?? null,
        });
      });
    }
    const soon = soonRows.map(({ owner, ...row }) => ({
      ...row,
      preview: buildReminderPreview(
        { id: row.id, startDate: row.startDate, endDate: row.endDate, isCreated: true, archived: row.archived, hasContent: row.hasContent, activityCount: row.activities, destination: row.destination, city: row.city },
        product.lifecycle.today,
        { channel: subByOwner.get(owner)?.channel ?? "none", storedLang: subByOwner.get(owner)?.lang, event: eventByTrip.get(row.id) ?? null, nowMs: Date.now() },
      ),
    }));

    const payload = {
      users: { total: userCount, today: newUsersToday, week: newUsersWeek, month: newUsersMonth, activeWeek: activeWeekUnified, recent: recentUsers },
      trips: { total: tripCount, expenses: expenseCount, totalILS: Math.round(totalILS), activatedUsers, activationRate },
      signupsByDay,
      activeByDay,
      product: {
        ...product,
        perUser: undefined,
        creatorUids: undefined,
        tripRows: product.tripRows.map(({ owner: _owner, ...row }) => row), // owner uid never leaves the server
      },
      soon,
      acquisition,
    };
    cache = { at: Date.now(), data: payload };
    return NextResponse.json(payload);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
