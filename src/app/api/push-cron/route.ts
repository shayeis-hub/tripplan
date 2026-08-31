import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Trip.country is already captured when the destination is picked (see
// pickCity() in TripPlan.jsx). Flights/hotels store naive local time-of-day
// strings with no timezone of their own — the traveler enters everything as
// printed on the ticket/booking, in whatever timezone that leg is actually
// in. Approximation: the outbound flight (earliest flight date in the trip)
// is assumed to depart from Israel; everything else — the return flight,
// any internal flights, and every hotel — is assumed to be at the
// destination. One representative zone per country (not per city) — wrong
// for the rare traveler crossing internal timezones within a huge country,
// right for the vast majority of trips.
const COUNTRY_TIMEZONE: Record<string, string> = {
  "Israel": "Asia/Jerusalem", "United States": "America/New_York", "Canada": "America/Toronto", "Mexico": "America/Mexico_City",
  "United Kingdom": "Europe/London", "Switzerland": "Europe/Zurich", "Sweden": "Europe/Stockholm", "Norway": "Europe/Oslo",
  "Denmark": "Europe/Copenhagen", "Poland": "Europe/Warsaw", "Hungary": "Europe/Budapest", "Czechia": "Europe/Prague", "Czech Republic": "Europe/Prague",
  "Romania": "Europe/Bucharest", "Bulgaria": "Europe/Sofia", "Turkey": "Europe/Istanbul", "Türkiye": "Europe/Istanbul",
  "Iceland": "Atlantic/Reykjavik", "Russia": "Europe/Moscow", "Ukraine": "Europe/Kyiv", "Georgia": "Asia/Tbilisi",
  "France": "Europe/Paris", "Germany": "Europe/Berlin", "Italy": "Europe/Rome", "Spain": "Europe/Madrid", "Netherlands": "Europe/Amsterdam",
  "Greece": "Europe/Athens", "Portugal": "Europe/Lisbon", "Austria": "Europe/Vienna", "Belgium": "Europe/Brussels", "Ireland": "Europe/Dublin",
  "Finland": "Europe/Helsinki", "Croatia": "Europe/Zagreb", "Slovakia": "Europe/Bratislava", "Slovenia": "Europe/Ljubljana",
  "Cyprus": "Asia/Nicosia", "Estonia": "Europe/Tallinn", "Latvia": "Europe/Riga", "Lithuania": "Europe/Vilnius",
  "Thailand": "Asia/Bangkok", "Japan": "Asia/Tokyo", "China": "Asia/Shanghai", "Hong Kong": "Asia/Hong_Kong", "Singapore": "Asia/Singapore",
  "Malaysia": "Asia/Kuala_Lumpur", "Indonesia": "Asia/Jakarta", "Vietnam": "Asia/Ho_Chi_Minh", "Philippines": "Asia/Manila",
  "India": "Asia/Kolkata", "South Korea": "Asia/Seoul", "Taiwan": "Asia/Taipei", "Sri Lanka": "Asia/Colombo", "Nepal": "Asia/Kathmandu",
  "Cambodia": "Asia/Phnom_Penh", "Laos": "Asia/Vientiane", "Maldives": "Indian/Maldives",
  "United Arab Emirates": "Asia/Dubai", "Qatar": "Asia/Qatar", "Saudi Arabia": "Asia/Riyadh", "Jordan": "Asia/Amman",
  "Egypt": "Africa/Cairo", "Morocco": "Africa/Casablanca", "Bahrain": "Asia/Bahrain", "Oman": "Asia/Muscat", "Kuwait": "Asia/Kuwait", "Lebanon": "Asia/Beirut",
  "South Africa": "Africa/Johannesburg", "Kenya": "Africa/Nairobi", "Tanzania": "Africa/Dar_es_Salaam", "Ethiopia": "Africa/Addis_Ababa",
  "Mauritius": "Indian/Mauritius", "Seychelles": "Indian/Mahe",
  "Australia": "Australia/Sydney", "New Zealand": "Pacific/Auckland", "Fiji": "Pacific/Fiji",
  "Brazil": "America/Sao_Paulo", "Argentina": "America/Argentina/Buenos_Aires", "Chile": "America/Santiago", "Peru": "America/Lima",
  "Colombia": "America/Bogota", "Uruguay": "America/Montevideo", "Costa Rica": "America/Costa_Rica", "Panama": "America/Panama", "Ecuador": "America/Guayaquil",
};
const ORIGIN_TZ = "Asia/Jerusalem";

const nowCache = new Map<string, { hour: number; min: number; date: string }>();
function nowInZone(tz: string) {
  const cached = nowCache.get(tz);
  if (cached) return cached;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date()).map(p => [p.type, p.value])
  );
  const result = { hour: Number(parts.hour), min: Number(parts.minute), date: `${parts.year}-${parts.month}-${parts.day}` };
  nowCache.set(tz, result);
  return result;
}

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
    const tripsSnap = await getDocs(collection(db, "trips"));
    const notifications: string[] = [];

    for (const tripDoc of tripsSnap.docs) {
      const trip = tripDoc.data();
      const userId = trip.owner;
      if (!userId) continue;

      const expenses: any[] = trip.expenses || [];
      const destTz = COUNTRY_TIMEZONE[trip.country] || ORIGIN_TZ;
      // The outbound leg (earliest-dated flight) departs from Israel;
      // everything else — return/internal flights, all hotels — is
      // assumed to already be at the destination. See COUNTRY_TIMEZONE
      // comment above for the reasoning and its limits.
      const outboundDate = expenses
        .filter(e => e.category === "flight" && e.date)
        .reduce((min: string | null, e) => (min === null || e.date < min ? e.date : min), null as string | null);

      for (const exp of expenses) {
        // ── Flight: reminderHours before departure ──
        if (exp.category === "flight" && exp.departureTime) {
          const tz = exp.date === outboundDate ? ORIGIN_TZ : destTz;
          const { hour: nowHour, min: nowMin, date: today } = nowInZone(tz);
          if (exp.date === today) {
            const [fh, fm] = exp.departureTime.split(":").map(Number);
            const remHours = exp.reminderHours || 5;
            const remM = fh * 60 + fm - (remHours * 60);
            const curM = nowHour * 60 + nowMin;
            if (remM >= curM && remM < curM + 10) {
              const remHoursLabel = exp.reminderHours || 5;
              await sendPush(userId, "✈️ תזכורת טיסה!", `טיסתך ב-${exp.departureTime} – עוד ${remHoursLabel} שעות, הגיע הזמן להתכונן!`);
              notifications.push(`flight-${userId}`);
            }
          }
        }

        // Hotels are always at the destination.
        if (exp.category === "hotel") {
          const { hour: nowHour, min: nowMin, date: today } = nowInZone(destTz);
          // ── Hotel check-in: 8:00-8:09am (fires once per day at the 10-minute cron tick that covers 8am) ──
          if (exp.checkIn === today && nowHour === 8 && nowMin < 10) {
            await sendPush(userId, "🏨 היום צ׳ק אין!", `צ׳ק אין ב${exp.description || "מלון"} – שיהיה נסיעה טובה!`);
            notifications.push(`hotel-in-${userId}`);
          }
          // ── Hotel check-out: 8:00-8:09am ──
          if (exp.checkOut === today && nowHour === 8 && nowMin < 10) {
            await sendPush(userId, "🏨 היום צ׳ק אאוט!", `אל תשכח לפנות את החדר ב${exp.description || "מלון"}`);
            notifications.push(`hotel-out-${userId}`);
          }
        }
      }
    }

    return NextResponse.json({ success: true, sent: notifications.length });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
