import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "shayeis@gmail.com";

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

  try {
    // User count
    const userList = await adminAuth.listUsers(1000);
    const userCount = userList.users.length;

    // Count by registration date
    const now = Date.now();
    const day = 86400000;
    const newUsersToday  = userList.users.filter(u => now - new Date(u.metadata.creationTime).getTime() < day).length;
    const newUsersWeek   = userList.users.filter(u => now - new Date(u.metadata.creationTime).getTime() < 7 * day).length;
    const newUsersMonth  = userList.users.filter(u => now - new Date(u.metadata.creationTime).getTime() < 30 * day).length;
    const activeWeek     = userList.users.filter(u => u.metadata.lastSignInTime && now - new Date(u.metadata.lastSignInTime).getTime() < 7 * day).length;

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

    // Trips count
    const tripsSnap = await adminDb.collection("trips").get();
    const tripCount = tripsSnap.size;

    // Expenses count + total ILS + activated users (own at least one trip)
    let expenseCount = 0;
    let totalILS = 0;
    const owners = new Set<string>();
    tripsSnap.forEach(doc => {
      const data = doc.data();
      if (data.owner) owners.add(data.owner);
      const expenses = data.expenses || [];
      expenseCount += expenses.length;
      expenses.forEach((e: any) => { totalILS += e.amountILS || 0; });
    });
    const activationRate = userCount > 0 ? Math.round((owners.size / userCount) * 100) : 0;

    // Recent users (last 5)
    const recentUsers = userList.users
      .sort((a, b) => new Date(b.metadata.creationTime).getTime() - new Date(a.metadata.creationTime).getTime())
      .slice(0, 5)
      .map(u => ({
        email: u.email,
        created: u.metadata.creationTime,
        lastSignIn: u.metadata.lastSignInTime,
      }));

    return NextResponse.json({
      users: { total: userCount, today: newUsersToday, week: newUsersWeek, month: newUsersMonth, activeWeek, recent: recentUsers },
      trips: { total: tripCount, expenses: expenseCount, totalILS: Math.round(totalILS), activatedUsers: owners.size, activationRate },
      signupsByDay,
      activeByDay,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
