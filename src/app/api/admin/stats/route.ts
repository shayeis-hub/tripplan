import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Verify admin
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // User count
    const userList = await adminAuth.listUsers(1000);
    const userCount = userList.users.length;

    // Count by registration date (last 30 days)
    const now = Date.now();
    const day = 86400000;
    const newUsersToday    = userList.users.filter(u => now - new Date(u.metadata.creationTime).getTime() < day).length;
    const newUsersWeek     = userList.users.filter(u => now - new Date(u.metadata.creationTime).getTime() < 7 * day).length;
    const newUsersMonth    = userList.users.filter(u => now - new Date(u.metadata.creationTime).getTime() < 30 * day).length;

    // Trips count
    const tripsSnap = await adminDb.collection("trips").get();
    const tripCount = tripsSnap.size;

    // Expenses count + total ILS
    let expenseCount = 0;
    let totalILS = 0;
    tripsSnap.forEach(doc => {
      const expenses = doc.data().expenses || [];
      expenseCount += expenses.length;
      expenses.forEach((e: any) => { totalILS += e.amountILS || 0; });
    });

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
      users: { total: userCount, today: newUsersToday, week: newUsersWeek, month: newUsersMonth, recent: recentUsers },
      trips: { total: tripCount, expenses: expenseCount, totalILS: Math.round(totalILS) },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
