"use client";
// Admin-only panels for the trip lifecycle drill-down and the "departing soon"
// preview of the 7-day reminder. Pure presentation over data the stats route
// already returns: no fetching here, and no send action of any kind.
import { useState } from "react";
import { diagnosticText, heCount, sortRows, summarizeSignals, type SortKey, type TripRow } from "@/lib/tripDrilldown";
import type { EligibilityReason, ReminderPreview } from "@/lib/preTripReminder";
import type { DateIssue, Phase } from "@/lib/tripLifecycle";

const TEAL = "#64dfdf";
const MUTED = "rgba(255,255,255,0.5)";
const FAINT = "rgba(255,255,255,0.3)";

const DATE_ISSUE_LABELS: Record<DateIssue, string> = {
  missing_both: "תאריכי יציאה וחזרה חסרים",
  missing_start: "תאריך יציאה חסר",
  missing_end: "תאריך חזרה חסר",
  invalid_start: "תאריך יציאה לא תקין",
  invalid_end: "תאריך חזרה לא תקין",
  end_before_start: "תאריך החזרה לפני תאריך היציאה",
};

// "2026-10-14" -> "14.10.2026" without going through Date (no timezone shift).
const fmtDate = (s: string | null) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s.split("-").reverse().join(".") : s || "—");
const fmtStamp = (ms: number | null) =>
  ms == null
    ? "לא ידוע"
    : new Date(ms).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const fmtDay = (ms: number | null) =>
  ms == null ? "לא ידוע" : new Date(ms).toLocaleDateString("he-IL", { timeZone: "Asia/Jerusalem" });

const plural = (n: number, one: string, many: string) => (n === 1 ? one : `${n} ${many}`);

function timing(r: TripRow): string {
  if (r.phase === "unknown") return r.dateIssue ? DATE_ISSUE_LABELS[r.dateIssue] : "תאריכים לא ברורים";
  if (r.phase === "past") return `חזר לפני ${plural(-(r.daysToEnd as number), "יום", "ימים")}`;
  if (r.phase === "now") {
    const e = r.daysToEnd as number;
    return e === 0 ? "מתרחש עכשיו, מסתיים היום" : `מתרחש עכשיו, מסתיים בעוד ${plural(e, "יום", "ימים")}`;
  }
  const d = r.daysToStart as number;
  return `יוצא בעוד ${plural(d, "יום", "ימים")}`;
}

function Chip({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 10, background: strong ? "rgba(100,223,223,0.14)" : "rgba(255,255,255,0.06)", color: strong ? TEAL : "rgba(255,255,255,0.65)" }}>
      {children}
    </span>
  );
}

export function ContentBadge({ has }: { has: boolean }) {
  return (
    <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 10, background: has ? "rgba(74,222,128,0.14)" : "rgba(255,255,255,0.06)", color: has ? "#4ade80" : "rgba(255,255,255,0.55)" }}>
      {has ? "עם תוכן משמעותי" : "ללא תוכן משמעותי"}
    </span>
  );
}

function TripCard({ r, diagnostic }: { r: TripRow; diagnostic: boolean }) {
  return (
    <div style={{ padding: "12px 0", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
          {r.destination || "ללא יעד"}
          <span style={{ fontWeight: 400, color: FAINT, fontSize: 10, marginInlineStart: 8 }} dir="ltr">{r.id.slice(0, 8)}</span>
        </div>
        <ContentBadge has={r.hasContent} />
      </div>
      <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>
        {r.phase === "unknown" ? (
          <span style={{ color: "#fbbf24" }}>{timing(r)}</span>
        ) : (
          <>
            יציאה {fmtDate(r.startDate)} · חזרה {fmtDate(r.endDate)} · <b style={{ color: "#fff" }}>{timing(r)}</b>
          </>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
        <Chip>{heCount(r.travelers, "נוסע אחד", "נוסעים")}</Chip>
        <Chip strong={r.activities > 0}>{heCount(r.activities, "פעילות אחת", "פעילויות")}</Chip>
        <Chip strong={r.flights > 0}>{heCount(r.flights, "טיסה אחת", "טיסות")}</Chip>
        <Chip strong={r.hotels > 0}>{heCount(r.hotels, "מלון אחד", "מלונות")}</Chip>
        <Chip>{heCount(r.expenses, "הוצאה אחת", "הוצאות")} ({r.otherExpenses} מלבד טיסה/מלון)</Chip>
        <Chip>{r.packingItems > 0 ? `רשימת אריזה: ${r.packingChecked}/${r.packingItems} סומנו` : "אין רשימת אריזה"}</Chip>
        <Chip>{r.shared ? "משותף עם חשבון נוסף" : "לא משותף"}</Chip>
      </div>
      {diagnostic && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>{diagnosticText(r)}{r.shared ? " · משותף" : ""}{r.recentlyUpdated ? " · עודכן ב-7 הימים האחרונים" : ""}</div>}
      <div style={{ fontSize: 11, color: FAINT, marginTop: 6 }}>
        נוצר: {r.createdAt != null ? fmtDay(r.createdAt) : "לא ידוע"} · עודכן לאחרונה: {fmtStamp(r.updatedAt)}
      </div>
    </div>
  );
}

const SORT_LABELS: Record<string, string> = { default: "ברירת מחדל", start: "תאריך יציאה", created: "תאריך יצירה", updated: "עדכון אחרון" };

// The trips behind one lifecycle row. `group` is the lifecycle row that was
// opened; for the parent "future" row it covers every future bucket.
export function TripDrilldown({ rows, group }: { rows: TripRow[]; group: Phase | "future" }) {
  const [key, setKey] = useState<SortKey | "default">("default");
  const [dir, setDir] = useState<1 | -1>(1);
  const sorted = sortRows(rows, group, key, dir);
  const isNear = group === "future30";
  const noContent = rows.filter(r => !r.hasContent);
  const sig = isNear && noContent.length > 0 ? summarizeSignals(noContent) : null;
  return (
    <div style={{ background: "rgba(0,0,0,0.18)", border: "0.5px solid rgba(100,223,223,0.18)", borderRadius: 12, padding: "10px 16px", margin: "8px 0 4px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6, fontSize: 12, color: MUTED }}>
        <span>מיון:</span>
        <select value={key} onChange={e => setKey(e.target.value as SortKey | "default")}
          style={{ background: "rgba(255,255,255,0.07)", color: "#fff", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 8px", fontSize: 12 }}>
          {Object.entries(SORT_LABELS).map(([k, l]) => <option key={k} value={k} style={{ color: "#000" }}>{l}</option>)}
        </select>
        {key !== "default" && (
          <button onClick={() => setDir(d => (d === 1 ? -1 : 1))}
            style={{ background: "rgba(255,255,255,0.07)", color: "#fff", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>
            {dir === 1 ? "עולה" : "יורד"}
          </button>
        )}
        <span style={{ marginInlineStart: "auto" }}>{rows.length} טיולים</span>
      </div>
      {sig && (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, padding: "6px 0 8px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
          מבין {sig.trips} הטיולים ללא תוכן משמעותי שיוצאים בקרוב: {sig.withOtherExpenses} עם הוצאות מלבד טיסה/מלון · {sig.withTravelers} עם נוסעים רשומים · {sig.withPacking} עם רשימת אריזה · {sig.shared} משותפים · {sig.recentlyUpdated} עודכנו ב-7 הימים האחרונים
        </div>
      )}
      {rows.length === 0 ? (
        <div style={{ padding: "14px 0", fontSize: 12, color: MUTED }}>אין טיולים בקבוצה הזו.</div>
      ) : (
        sorted.map(r => <TripCard key={r.id} r={r} diagnostic={isNear} />)
      )}
    </div>
  );
}

// ---------- departing soon + reminder preview ----------

export interface SoonTrip extends TripRow {
  preview: ReminderPreview;
}

const REASON_TEXT: Record<EligibilityReason, (d: number | null) => string> = {
  eligible: () => "זכאי: היציאה בעוד 7 ימים בדיוק",
  not_created: () => "לא זכאי: לא טיול שנוצר",
  invalid_dates: () => "לא זכאי: תאריכים לא תקינים",
  past: () => "לא זכאי: הטיול כבר עבר",
  in_progress: () => "לא זכאי: הטיול כבר החל",
  too_early: d => `לא זכאי: היציאה בעוד ${d} ימים, התזכורת מיועדת ל-7 ימים לפני`,
  too_late: d => `לא זכאי: נותרו ${d} ימים, רגע ה-7 ימים כבר עבר`,
  already_sent: () => "לא זכאי: התזכורת כבר נשלחה",
  no_token: () => "לא זכאי: אין token לשליחה",
};

const CHANNEL_TEXT = { fcm: "Android (FCM)", web: "Web push", both: "Android + Web push", none: "אין token" } as const;

export function SoonSection({ trips }: { trips: SoonTrip[] }) {
  const sorted = [...trips].sort((a, b) => (a.daysToStart as number) - (b.daysToStart as number) || a.id.localeCompare(b.id));
  return (
    <>
      <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>טיולים שיוצאים בקרוב</div>
      <div style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "6px 20px 16px", marginBottom: 28 }}>
        <div style={{ margin: "12px 0 4px", padding: "8px 12px", borderRadius: 10, background: "rgba(251,191,36,0.1)", border: "0.5px solid rgba(251,191,36,0.3)", fontSize: 12, color: "#fbbf24", lineHeight: 1.6 }}>
          תצוגה מקדימה בלבד. לא נשלחות הודעות מכאן, ואין פעולת שליחה. כל שורה מראה מה היה נשלח ולמי, אילו הייתה פעילה תזכורת 7 ימים לפני יציאה.
        </div>
        {sorted.length === 0 ? (
          <div style={{ padding: "18px 0 6px", fontSize: 13, color: MUTED }}>אין טיולים שיוצאים ב-7 הימים הקרובים.</div>
        ) : (
          sorted.map(t => {
            const p = t.preview;
            const d = t.daysToStart as number;
            return (
              <div key={t.id} style={{ padding: "14px 0", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                    {t.destination || "ללא יעד"}
                    <span style={{ fontWeight: 400, color: FAINT, fontSize: 10, marginInlineStart: 8 }} dir="ltr">{t.id.slice(0, 8)}</span>
                  </div>
                  <ContentBadge has={t.hasContent} />
                </div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>
                  יציאה {fmtDate(t.startDate)} · <b style={{ color: "#fff" }}>{d === 0 ? "יוצא היום" : `בעוד ${plural(d, "יום", "ימים")}`}</b>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  <Chip strong={t.activities > 0}>{heCount(t.activities, "פעילות אחת", "פעילויות")}</Chip>
                  <Chip strong={t.flights > 0}>טיסה: {t.flights > 0 ? "יש" : "אין"}</Chip>
                  <Chip strong={t.hotels > 0}>מלון: {t.hotels > 0 ? "יש" : "אין"}</Chip>
                  <Chip>{heCount(t.expenses, "הוצאה אחת", "הוצאות")}</Chip>
                  <Chip>עודכן: {fmtStamp(t.updatedAt)}</Chip>
                </div>
                <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(0,0,0,0.2)", border: `0.5px solid ${p.eligible ? "rgba(74,222,128,0.35)" : "rgba(255,255,255,0.1)"}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: p.eligible ? "#4ade80" : MUTED, marginBottom: 6 }}>{REASON_TEXT[p.reason](p.daysToStart)}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: p.eligible ? "#fff" : "rgba(255,255,255,0.6)" }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: p.eligible ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.45)", marginTop: 2, lineHeight: 1.6 }}>{p.body}</div>
                  <div style={{ fontSize: 11, color: FAINT, marginTop: 6, lineHeight: 1.6 }} dir="ltr">
                    EN: {p.titleEn} / {p.bodyEn}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    <Chip>שפה: {p.lang === "he" ? "עברית" : "אנגלית"}{p.langStored ? "" : " (ברירת מחדל, השפה לא נשמרת בשרת)"}</Chip>
                    <Chip strong={p.channel !== "none"}>token: {CHANNEL_TEXT[p.channel]}</Chip>
                    <Chip>{p.alreadySent ? "תזכורת 7 ימים כבר נשלחה" : "תזכורת 7 ימים טרם נשלחה"}</Chip>
                    {p.sendDate && <Chip>מועד מתוכנן: {fmtDate(p.sendDate)}</Chip>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
