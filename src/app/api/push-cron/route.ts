import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { getAdminDb, getAdminMessaging } from "@/lib/firebase-admin";

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

// Mirrors /api/push-send's dual-channel logic — this used to only attempt
// web-push, so a native-app user (whose pushSubscriptions doc holds an
// fcmToken, not a web `subscription`) could never actually receive a cron
// reminder even when the timing logic correctly fired: `subscription` was
// undefined, webpush.sendNotification(undefined, ...) threw, and the bare
// catch swallowed it silently.
//
// Uses the ADMIN SDK, not the client SDK — there is no signed-in user in a
// cron invocation, and firestore.rules has no rule at all for
// pushSubscriptions (or an unauthenticated-friendly one for trips below),
// so every client-SDK read/write this route ever made was silently denied
// by security rules. That's the real reason reminders never fired: this
// function never got past its first Firestore call, cron run after cron
// run, regardless of what the timing logic below says.
async function sendPush(userId: string, title: string, body: string) {
  try {
    const subDoc = await getAdminDb().collection("pushSubscriptions").doc(userId).get();
    if (!subDoc.exists) return;
    const { subscription, fcmToken } = subDoc.data() as { subscription?: any; fcmToken?: string };

    if (fcmToken) {
      try {
        await getAdminMessaging().send({
          token: fcmToken,
          notification: { title, body },
          data: { url: "/" },
          android: { notification: { icon: "ic_launcher", color: "#0d2137" }, priority: "high" },
        });
      } catch (e) {
        // Was a bare catch — a failed send here was completely invisible.
        // Logged so a future missed reminder shows up in Vercel logs
        // instead of requiring manual forensics to even confirm it tried.
        console.error(`push-cron: FCM send failed for ${userId}`, e);
      }
    }
    if (subscription) {
      try {
        await webpush.sendNotification(subscription, JSON.stringify({ title, body }));
      } catch (e) {
        console.error(`push-cron: web-push send failed for ${userId}`, e);
      }
    }
  } catch (e) {
    console.error(`push-cron: sendPush failed for ${userId}`, e);
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tripsSnap = await getAdminDb().collection("trips").get();
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

      // Idempotency: a matching window can be hit by more than one cron
      // tick (retries, clock jitter, or just this run overlapping the
      // previous one) — without this, the same reminder fires repeatedly
      // instead of once. Keyed on the trip doc itself (expenseId+type+date)
      // rather than the expenses array, so marking "sent" never risks
      // clobbering a concurrent client edit to the expense list.
      const alreadySent: Record<string, boolean> = trip.remindersSent || {};
      const newlySent: Record<string, boolean> = {};

      for (const exp of expenses) {
        if (!exp.id) continue; // can't dedupe without a stable key — skip rather than risk spamming

        // ── Flight: reminderHours before departure ──
        if (exp.category === "flight" && exp.departureTime) {
          const tz = exp.date === outboundDate ? ORIGIN_TZ : destTz;
          const { hour: nowHour, min: nowMin, date: today } = nowInZone(tz);
          const key = `${exp.id}-flight-${today}`;
          if (exp.date === today && !alreadySent[key] && !newlySent[key]) {
            const [fh, fm] = exp.departureTime.split(":").map(Number);
            const remHours = exp.reminderHours || 5;
            const remM = fh * 60 + fm - (remHours * 60);
            const curM = nowHour * 60 + nowMin;
            if (remM >= curM && remM < curM + 10) {
              await sendPush(userId, "✈️ תזכורת טיסה!", `טיסתך ב-${exp.departureTime} – עוד ${remHours} שעות, הגיע הזמן להתכונן!`);
              notifications.push(`flight-${userId}`);
              newlySent[key] = true;
            }
          }
        }

        // Hotels are always at the destination.
        if (exp.category === "hotel") {
          const { hour: nowHour, min: nowMin, date: today } = nowInZone(destTz);
          const keyIn = `${exp.id}-hotelIn-${today}`;
          const keyOut = `${exp.id}-hotelOut-${today}`;
          // ── Hotel check-in: 8:00-8:09am (fires once per day at the 10-minute cron tick that covers 8am) ──
          if (exp.checkIn === today && nowHour === 8 && nowMin < 10 && !alreadySent[keyIn] && !newlySent[keyIn]) {
            await sendPush(userId, "🏨 היום צ׳ק אין!", `צ׳ק אין ב${exp.description || "מלון"} – שיהיה נסיעה טובה!`);
            notifications.push(`hotel-in-${userId}`);
            newlySent[keyIn] = true;
          }
          // ── Hotel check-out: 8:00-8:09am ──
          if (exp.checkOut === today && nowHour === 8 && nowMin < 10 && !alreadySent[keyOut] && !newlySent[keyOut]) {
            await sendPush(userId, "🏨 היום צ׳ק אאוט!", `אל תשכח לפנות את החדר ב${exp.description || "מלון"}`);
            notifications.push(`hotel-out-${userId}`);
            newlySent[keyOut] = true;
          }
        }
      }

      if (Object.keys(newlySent).length > 0) {
        try {
          await tripDoc.ref.update(
            Object.fromEntries(Object.keys(newlySent).map(k => [`remindersSent.${k}`, true]))
          );
        } catch (e) {
          console.error(`push-cron: failed to record remindersSent for trip ${tripDoc.id}`, e);
        }
      }
    }

    return NextResponse.json({ success: true, sent: notifications.length, notifications });
  } catch (err) {
    console.error("push-cron: run failed", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
