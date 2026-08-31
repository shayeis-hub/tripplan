import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

async function sendPush(userId: string, title: string, body: string) {
  try {
    const subDoc = await getDoc(doc(db, "pushSubscriptions", userId));
    if (!subDoc.exists()) return;
    const { subscription } = subDoc.data();
    await webpush.sendNotification(subscription, JSON.stringify({ title, body }));
  } catch (e) {}
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // exp.date/departureTime are naive Israel-local strings, but this
    // function runs on Vercel's Node runtime in UTC — new Date().getHours()
    // here returns UTC hour, not Israel hour. Comparing that against
    // Israel-local reminder minutes silently offset every check by Israel's
    // UTC offset (+2/+3h depending on DST), so reminders fired ~3 hours late
    // instead of not firing at all. Read the clock through Asia/Jerusalem
    // explicitly instead of trusting the server's own timezone.
    const nowParts = Object.fromEntries(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jerusalem",
        year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
      }).formatToParts(new Date()).map(p => [p.type, p.value])
    );
    const nowHour = Number(nowParts.hour);
    const nowMin = Number(nowParts.minute);
    const today = `${nowParts.year}-${nowParts.month}-${nowParts.day}`;

    const tripsSnap = await getDocs(collection(db, "trips"));
    const notifications: string[] = [];

    for (const tripDoc of tripsSnap.docs) {
      const trip = tripDoc.data();
      const userId = trip.owner;
      if (!userId) continue;

      const expenses: any[] = trip.expenses || [];

      for (const exp of expenses) {
        // ── Flight: 3 hours before ──
        if (exp.category === "flight" && exp.date === today && exp.departureTime) {
          const [fh, fm] = exp.departureTime.split(":").map(Number);
          const remHours = exp.reminderHours || 5;
          const remM = fh * 60 + fm - (remHours * 60);
          const curM = nowHour * 60 + nowMin;
          if (remM >= curM && remM < curM + 10) {
            const remTime = `${String(Math.floor(remM/60)).padStart(2,"0")}:${String(remM%60).padStart(2,"0")}`;
            const remHoursLabel = exp.reminderHours || 5;
            await sendPush(userId, "✈️ תזכורת טיסה!", `טיסתך ב-${exp.departureTime} – עוד ${remHoursLabel} שעות, הגיע הזמן להתכונן!`);
            notifications.push(`flight-${userId}`);
          }
        }

        // ── Hotel check-in: 8:00-8:09am (fires once per day at the 10-minute cron tick that covers 8am) ──
        if (exp.category === "hotel" && exp.checkIn === today && nowHour === 8 && nowMin < 10) {
          await sendPush(userId, "🏨 היום צ׳ק אין!", `צ׳ק אין ב${exp.description || "מלון"} – שיהיה נסיעה טובה!`);
          notifications.push(`hotel-in-${userId}`);
        }

        // ── Hotel check-out: 8:00-8:09am ──
        if (exp.category === "hotel" && exp.checkOut === today && nowHour === 8 && nowMin < 10) {
          await sendPush(userId, "🏨 היום צ׳ק אאוט!", `אל תשכח לפנות את החדר ב${exp.description || "מלון"}`);
          notifications.push(`hotel-out-${userId}`);
        }
      }
    }

    return NextResponse.json({ success: true, sent: notifications.length });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
