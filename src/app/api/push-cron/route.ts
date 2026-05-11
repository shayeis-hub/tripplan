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
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  // Temporary debug - remove after fix
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET not set", env_keys: Object.keys(process.env).filter(k=>k.includes("CRON")) }, { status: 500 });
  }
  if (authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized", received_length: authHeader?.length, expected_length: expected.length }, { status: 401 });
  }

  try {
    const now = new Date();
    const nowHour = now.getHours();
    const nowMin = now.getMinutes();
    const today = now.toISOString().slice(0, 10);

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
          const remM = fh * 60 + fm - 300; // 5 hours before
          const curM = nowHour * 60 + nowMin;
          if (remM >= curM && remM < curM + 60) {
            const remTime = `${String(Math.floor(remM/60)).padStart(2,"0")}:${String(remM%60).padStart(2,"0")}`;
            await sendPush(userId, "✈️ תזכורת טיסה!", `טיסתך ב-${exp.departureTime} – הגיע הזמן להתכונן לנסיעה לשדה`);
            notifications.push(`flight-${userId}`);
          }
        }

        // ── Hotel check-in: 8am ──
        if (exp.category === "hotel" && exp.checkIn === today && nowHour === 8) {
          await sendPush(userId, "🏨 היום צ׳ק אין!", `צ׳ק אין ב${exp.description || "מלון"} – שיהיה נסיעה טובה!`);
          notifications.push(`hotel-in-${userId}`);
        }

        // ── Hotel check-out: 8am ──
        if (exp.category === "hotel" && exp.checkOut === today && nowHour === 8) {
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
