"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Globe, Plus, X, Trash2, Check, Search, MapPin, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/LangContext";
import { COUNTRY_ALIASES, COUNTRY_NAMES, norm } from "@/lib/world/countries";
import { CONTINENT, MAP_DOTS, MAP_H, MAP_PATHS, MAP_W } from "@/lib/world/geo";
import { computeStats, type VisitMap } from "@/lib/world/stats";

const RF = "'Rubik',sans-serif";
const TEAL = "#64dfdf";
const BG = "#0a1628";
const W40 = "rgba(255,255,255,0.4)";
const W60 = "rgba(255,255,255,0.6)";
const CARD = "rgba(255,255,255,0.05)";
const LINE = "0.5px solid rgba(255,255,255,0.1)";

type Lang = "he" | "en" | "es";

// DRAFT COPY: every string below is pending the owner's approval before this ships.
const T = {
  title: { he: "העולם שלי", en: "My World", es: "Mi mundo" },
  emptyCta: { he: "הוסיפו את המדינות שביקרתם בהן", en: "Add the countries you've visited", es: "Añade los países que has visitado" },
  emptyHint: { he: "בחרו מדינה ושנה. זה לוקח כמה שניות לכל מדינה.", en: "Pick a country and a year. It takes a few seconds each.", es: "Elige un país y un año. Toma unos segundos por país." },
  addMore: { he: "הוסיפו מדינות", en: "Add countries", es: "Añadir países" },
  suggest: {
    he: (n: number) => (n === 1 ? "מצאנו מדינה אחת בטיולים שלכם. להוסיף?" : `מצאנו ${n} מדינות בטיולים שלכם. להוסיף?`),
    en: (n: number) => (n === 1 ? "We found 1 country in your trips. Add it?" : `We found ${n} countries in your trips. Add them?`),
    es: (n: number) => (n === 1 ? "Encontramos 1 país en tus viajes. ¿Añadirlo?" : `Encontramos ${n} países en tus viajes. ¿Añadirlos?`),
  },
  suggestAdd: { he: "הוסיפו", en: "Add", es: "Añadir" },
  suggestNo: { he: "לא עכשיו", en: "Not now", es: "Ahora no" },
  searchPh: { he: "חפשו מדינה", en: "Search a country", es: "Busca un país" },
  year: { he: "שנה", en: "Year", es: "Año" },
  cityPh: { he: "עיר (לא חובה)", en: "City (optional)", es: "Ciudad (opcional)" },
  done: { he: "סיום", en: "Done", es: "Listo" },
  added: { he: "נוספה", en: "Added", es: "Añadido" },
  noResults: { he: "לא נמצאה מדינה", en: "No country found", es: "No se encontró ningún país" },
  homeQ: { he: "מאיפה אתם יוצאים?", en: "Where do you travel from?", es: "¿Desde dónde viajas?" },
  homeHint: { he: "משמש רק להערכת מרחקי טיסה.", en: "Used only to estimate flight distances.", es: "Solo se usa para estimar distancias de vuelo." },
  homeChange: { he: "שינוי", en: "Change", es: "Cambiar" },
  homeLabel: { he: "מדינת מוצא", en: "Home country", es: "País de origen" },
  countries: { he: "מדינות", en: "Countries", es: "Países" },
  continents: { he: "יבשות", en: "Continents", es: "Continentes" },
  ofContinents: { he: "מתוך 6", en: "of 6", es: "de 6" },
  ofWorld: { he: "מהעולם", en: "of the world", es: "del mundo" },
  ofCountries: { he: "מתוך 195 מדינות", en: "of 195 countries", es: "de 195 países" },
  km: { he: "ק״מ בטיסה (משוער)", en: "km flown (estimate)", es: "km volados (estimación)" },
  kmNote: {
    he: "קו אווירי בין הבירות, הלוך וחזור, לכל ביקור שהוזן.",
    en: "Straight line between capitals, round trip, for each visit you entered.",
    es: "Línea recta entre capitales, ida y vuelta, por cada visita ingresada.",
  },
  lapsMany: { he: (n: string) => `פי ${n} סביב כדור הארץ`, en: (n: string) => `${n} times around the Earth`, es: (n: string) => `${n} vueltas a la Tierra` },
  lapsPart: { he: (n: number) => `${n}% מהדרך סביב כדור הארץ`, en: (n: number) => `${n}% of the way around the Earth`, es: (n: number) => `${n}% de la vuelta a la Tierra` },
  languages: { he: "שפות רשמיות שכנראה שמעתם", en: "Official languages you probably heard", es: "Idiomas oficiales que probablemente oíste" },
  continentNames: {
    AF: { he: "אפריקה", en: "Africa", es: "África" },
    AS: { he: "אסיה", en: "Asia", es: "Asia" },
    EU: { he: "אירופה", en: "Europe", es: "Europa" },
    NA: { he: "צפון אמריקה", en: "North America", es: "Norteamérica" },
    SA: { he: "דרום אמריקה", en: "South America", es: "Sudamérica" },
    OC: { he: "אוקיאניה", en: "Oceania", es: "Oceanía" },
  },
  territories: {
    he: (n: number) => (n === 1 ? "עוד שטח אחד מסומן במפה ואינו נכלל בסך המדינות." : `עוד ${n} שטחים מסומנים במפה ואינם נכללים בסך המדינות.`),
    en: (n: number) => (n === 1 ? "1 more territory is on the map and not counted in the totals." : `${n} more territories are on the map and not counted in the totals.`),
    es: (n: number) => (n === 1 ? "1 territorio más está en el mapa y no se cuenta en los totales." : `${n} territorios más están en el mapa y no se cuentan en los totales.`),
  },
  noHomeKm: { he: "הגדירו מדינת מוצא כדי לראות מרחק טיסה.", en: "Set a home country to see flight distance.", es: "Define un país de origen para ver la distancia de vuelo." },
  listTitle: { he: "הביקורים שלי", en: "My visits", es: "Mis visitas" },
  remove: { he: "הסרה", en: "Remove", es: "Quitar" },
  loadError: { he: "לא הצלחנו לטעון. נסו שוב.", en: "Couldn't load. Try again.", es: "No se pudo cargar. Inténtalo de nuevo." },
  retry: { he: "נסו שוב", en: "Try again", es: "Reintentar" },
  saveError: { he: "השמירה נכשלה. נסו שוב.", en: "Couldn't save. Try again.", es: "No se pudo guardar. Inténtalo de nuevo." },
  close: { he: "סגירה", en: "Close", es: "Cerrar" },
  loading: { he: "טוען...", en: "Loading...", es: "Cargando..." },
} as const;

type SearchEntry = { cc: string; name: string; hay: string };

function buildSearch(lang: Lang): SearchEntry[] {
  const collator = new Intl.Collator(lang);
  return Object.entries(COUNTRY_NAMES)
    .map(([cc, n]) => ({
      cc,
      name: n[lang],
      hay: [n.he, n.en, n.es, ...(COUNTRY_ALIASES[cc] || [])].map(norm).join("|"),
    }))
    .sort((a, b) => collator.compare(a.name, b.name));
}

type Data = { home: string | null; visits: VisitMap; suggestions: { cc: string; year: number }[] };

export default function MyWorld({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { lang: rawLang } = useLang();
  const lang = (["he", "en", "es"].includes(rawLang as string) ? rawLang : "en") as Lang;
  const tr = <K extends keyof typeof T>(k: K) => (T[k] as Record<Lang, any>)[lang];
  const dir = lang === "he" ? "rtl" : "ltr";

  const [data, setData] = useState<Data | null>(null);
  const [loadErr, setLoadErr] = useState(false);
  const [saveErr, setSaveErr] = useState(false);
  const [mode, setMode] = useState<"view" | "add" | "home">("view");
  const [hideSuggest, setHideSuggest] = useState(false);

  const api = useCallback(
    async (method: "GET" | "POST", body?: unknown) => {
      if (!user) throw new Error("no user");
      const token = await user.getIdToken();
      const res = await fetch("/api/world", {
        method,
        headers: { authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    [user],
  );

  const load = useCallback(async () => {
    setLoadErr(false);
    try {
      const d = await api("GET");
      setData({ home: d.home ?? null, visits: d.visits || {}, suggestions: d.suggestions || [] });
    } catch {
      setLoadErr(true);
    }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const search = useMemo(() => buildSearch(lang), [lang]);
  const nameOf = (cc: string) => COUNTRY_NAMES[cc]?.[lang] || cc;
  const stats = useMemo(() => (data ? computeStats(data.home, data.visits) : null), [data]);

  const addItems = async (items: { cc: string; year: number; city?: string; source?: "manual" | "trip" }[]) => {
    setSaveErr(false);
    try {
      const r = await api("POST", { action: "add", items });
      setData((d) => (d ? { ...d, visits: { ...d.visits, ...(r.added || {}) }, suggestions: d.suggestions.filter((s) => !items.some((i) => i.cc === s.cc && i.year === s.year)) } : d));
      return true;
    } catch {
      setSaveErr(true);
      return false;
    }
  };
  const removeVisit = async (id: string) => {
    const prev = data;
    setData((d) => { if (!d) return d; const v = { ...d.visits }; delete v[id]; return { ...d, visits: v }; });
    try { await api("POST", { action: "remove", id }); } catch { setData(prev); setSaveErr(true); }
  };
  const setHome = async (cc: string) => {
    setSaveErr(false);
    try { await api("POST", { action: "setHome", cc }); setData((d) => (d ? { ...d, home: cc } : d)); setMode("view"); }
    catch { setSaveErr(true); }
  };

  const hasVisits = !!data && Object.keys(data.visits).length > 0;
  const suggestCountries = data ? new Set(data.suggestions.map((s) => s.cc)).size : 0;

  return (
    <div role="dialog" aria-modal="true" dir={dir}
      style={{ position: "fixed", inset: 0, zIndex: 500, background: BG, color: "#fff", fontFamily: RF, overflowY: "auto", paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "16px 16px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 800 }}>
            <Globe size={22} color={TEAL} strokeWidth={1.75} />{tr("title")}
          </div>
          <button onClick={onClose} aria-label={tr("close")}
            style={{ background: "rgba(255,255,255,0.06)", border: LINE, borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: W60 }}>
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {!data && !loadErr && <div style={{ color: W40, padding: "60px 0", textAlign: "center" }}>{tr("loading")}</div>}
        {loadErr && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ color: "#ff8a8a", marginBottom: 12 }}>{tr("loadError")}</div>
            <button onClick={load} style={btn(true)}>{tr("retry")}</button>
          </div>
        )}

        {data && stats && mode === "home" && (
          <CountryPicker title={tr("homeQ")} hint={tr("homeHint")} search={search} placeholder={tr("searchPh")} noResults={tr("noResults")}
            onPick={setHome} onCancel={() => setMode("view")} cancelLabel={tr("close")} />
        )}

        {data && stats && mode === "add" && (
          <AddPanel search={search} T={tr} data={data} nameOf={nameOf} addItems={addItems} onDone={() => setMode("view")} />
        )}

        {data && stats && mode === "view" && (
          <>
            <WorldMap visited={new Set(stats.visited)} />

            {!hasVisits && (
              <div style={{ textAlign: "center", padding: "20px 8px 8px" }}>
                <button onClick={() => setMode("add")} style={{ ...btn(true), padding: "14px 22px", fontSize: 16 }}>
                  <Plus size={18} strokeWidth={2} />{tr("emptyCta")}
                </button>
                <div style={{ color: W40, fontSize: 13, marginTop: 10 }}>{tr("emptyHint")}</div>
              </div>
            )}

            {data.suggestions.length > 0 && !hideSuggest && (
              <div style={{ background: "rgba(100,223,223,0.08)", border: "0.5px solid rgba(100,223,223,0.3)", borderRadius: 14, padding: 14, marginTop: 14 }}>
                <div style={{ fontSize: 14, marginBottom: 10 }}>{tr("suggest")(suggestCountries)}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={btn(true)} onClick={() => addItems(data.suggestions.map((s) => ({ ...s, source: "trip" as const })))}>{tr("suggestAdd")}</button>
                  <button style={btn(false)} onClick={() => setHideSuggest(true)}>{tr("suggestNo")}</button>
                </div>
              </div>
            )}

            {hasVisits && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginTop: 14 }}>
                  <Stat big={stats.countries} label={tr("countries")} sub={tr("ofCountries")} />
                  <Stat big={stats.continents} label={tr("continents")} sub={tr("ofContinents")} />
                  <Stat big={`${stats.pctWorld}%`} label={tr("ofWorld")} sub={tr("ofCountries")} />
                  <Stat big={stats.languages} label={tr("languages")} />
                </div>

                <div style={{ background: CARD, border: LINE, borderRadius: 14, padding: 14, marginTop: 10 }}>
                  {stats.km != null ? (
                    <>
                      <div style={{ fontSize: 28, fontWeight: 800, color: TEAL, fontVariantNumeric: "tabular-nums" }}>
                        {stats.km.toLocaleString(lang)} <span style={{ fontSize: 14, fontWeight: 500, color: W60 }}>{tr("km")}</span>
                      </div>
                      {stats.earthLaps != null && stats.km > 0 && (
                        <div style={{ fontSize: 14, marginTop: 4 }}>
                          {stats.earthLaps >= 1 ? tr("lapsMany")(stats.earthLaps.toFixed(1)) : tr("lapsPart")(Math.round(stats.earthLaps * 100))}
                        </div>
                      )}
                      <div style={{ color: W40, fontSize: 12, marginTop: 6 }}>{tr("kmNote")}</div>
                    </>
                  ) : (
                    <button onClick={() => setMode("home")} style={{ ...btn(false), width: "100%", justifyContent: "center" }}>{tr("noHomeKm")}</button>
                  )}
                </div>

                {stats.territories > 0 && <div style={{ color: W40, fontSize: 12, marginTop: 8 }}>{tr("territories")(stats.territories)}</div>}

                <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                  <button onClick={() => setMode("add")} style={btn(true)}><Plus size={16} strokeWidth={2} />{tr("addMore")}</button>
                  {data.home && (
                    <button onClick={() => setMode("home")} style={btn(false)}>
                      <MapPin size={15} strokeWidth={1.75} />{tr("homeLabel")}: {nameOf(data.home)} · {tr("homeChange")}
                    </button>
                  )}
                </div>

                <VisitList visits={data.visits} nameOf={nameOf} onRemove={removeVisit} removeLabel={tr("remove")} title={tr("listTitle")}
                  contName={(c: string) => (T.continentNames as Record<string, Record<Lang, string>>)[c][lang]} />
              </>
            )}
          </>
        )}

        {saveErr && <div style={{ color: "#ff8a8a", fontSize: 13, marginTop: 12 }}>{tr("saveError")}</div>}
      </div>
    </div>
  );
}

function btn(primary: boolean): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 12, cursor: "pointer", fontFamily: RF, fontSize: 14, fontWeight: 700,
    border: primary ? "none" : LINE, background: primary ? TEAL : "rgba(255,255,255,0.06)", color: primary ? BG : "rgba(255,255,255,0.8)",
  };
}

function Stat({ big, label, sub }: { big: string | number; label: string; sub?: string }) {
  return (
    <div style={{ background: CARD, border: LINE, borderRadius: 14, padding: 14 }}>
      <div style={{ fontSize: 30, fontWeight: 800, color: TEAL, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>{big}</div>
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: W40, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function WorldMap({ visited }: { visited: Set<string> }) {
  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-hidden="true" style={{ width: "100%", height: "auto", display: "block", background: "rgba(255,255,255,0.03)", borderRadius: 14 }}>
      {Object.entries(MAP_PATHS).map(([cc, d]) => (
        <path key={cc} d={d} fill={visited.has(cc) ? TEAL : "rgba(255,255,255,0.1)"} stroke={BG} strokeWidth={0.6} strokeLinejoin="round" />
      ))}
      {Object.entries(MAP_DOTS).map(([cc, [x, y]]) => (
        <circle key={cc} cx={x} cy={y} r={visited.has(cc) ? 4.5 : 2.5} fill={visited.has(cc) ? TEAL : "rgba(255,255,255,0.22)"} />
      ))}
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return <ChevronDown size={18} strokeWidth={1.75} style={{ transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "none", flexShrink: 0 }} />;
}

// All visits live under one collapsible header; inside, one collapsible section per continent.
function VisitList({ visits, nameOf, onRemove, removeLabel, title, contName }: {
  visits: VisitMap; nameOf: (cc: string) => string; onRemove: (id: string) => void; removeLabel: string; title: string; contName: (c: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const [openCont, setOpenCont] = useState<Record<string, boolean>>({});
  const groups = new Map<string, [string, VisitMap[string]][]>();
  for (const e of Object.entries(visits)) {
    const c = CONTINENT[e[1].cc] || "AS";
    const arr = groups.get(c) || [];
    arr.push(e);
    groups.set(c, arr);
  }
  const conts = [...groups.keys()].sort((a, b) => groups.get(b)!.length - groups.get(a)!.length);
  const total = Object.keys(visits).length;
  const head: React.CSSProperties = { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, cursor: "pointer", fontFamily: RF, textAlign: "start", color: "#fff" };
  return (
    <div style={{ marginTop: 18 }}>
      <button onClick={() => setOpen(!open)} aria-expanded={open} style={{ ...head, padding: "13px 14px", background: CARD, border: LINE, borderRadius: 12, fontSize: 15, fontWeight: 700 }}>
        <span>{title} <span style={{ color: W40, fontWeight: 500 }}>({total})</span></span>
        <Chevron open={open} />
      </button>
      {open && (
        <div style={{ marginTop: 8 }}>
          {conts.map((c) => {
            const rows = groups.get(c)!.sort((a, b) => b[1].year - a[1].year || nameOf(a[1].cc).localeCompare(nameOf(b[1].cc)));
            const isOpen = !!openCont[c];
            return (
              <div key={c} style={{ marginBottom: 6 }}>
                <button onClick={() => setOpenCont((o) => ({ ...o, [c]: !o[c] }))} aria-expanded={isOpen}
                  style={{ ...head, padding: "10px 12px", background: "none", border: "none", borderBottom: LINE, fontSize: 14, fontWeight: 600, color: TEAL }}>
                  <span>{contName(c)} <span style={{ color: W40, fontWeight: 500 }}>({rows.length})</span></span>
                  <Chevron open={isOpen} />
                </button>
                {isOpen && rows.map(([id, v]) => (
                  <div key={id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: CARD, border: LINE, borderRadius: 10, marginTop: 4 }}>
                    <div style={{ fontSize: 14 }}>
                      {nameOf(v.cc)}{v.city ? <span style={{ color: W40 }}> · {v.city}</span> : null}
                      <span style={{ color: W40 }}> · {v.year}</span>
                    </div>
                    <button onClick={() => onRemove(id)} aria-label={removeLabel}
                      style={{ background: "none", border: "none", cursor: "pointer", color: W40, display: "flex", padding: 4 }}>
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CountrySearch({ search, placeholder, noResults, onPick, disabledFor, autoFocus }: {
  search: SearchEntry[]; placeholder: string; noResults: string; onPick: (cc: string) => void; disabledFor?: (cc: string) => string | null; autoFocus?: boolean;
}) {
  const [q, setQ] = useState("");
  const nq = norm(q);
  const results = nq ? search.filter((e) => e.hay.includes(nq)).slice(0, 8) : [];
  return (
    <div>
      <div style={{ position: "relative" }}>
        <Search size={16} color={W40} strokeWidth={1.75} style={{ position: "absolute", insetInlineStart: 12, top: 13 }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} autoFocus={autoFocus} autoComplete="off"
          style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", paddingInlineStart: 36, borderRadius: 12, border: "0.5px solid rgba(100,223,223,0.3)", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 15, fontFamily: RF, outline: "none" }} />
      </div>
      {nq && results.length === 0 && <div style={{ color: W40, fontSize: 13, padding: "10px 4px" }}>{noResults}</div>}
      {results.map((r) => {
        const note = disabledFor?.(r.cc) ?? null;
        return (
          <button key={r.cc} disabled={!!note} onClick={() => { onPick(r.cc); setQ(""); }}
            style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 12px", marginTop: 4, background: CARD, border: LINE, borderRadius: 10, color: note ? W40 : "#fff", fontFamily: RF, fontSize: 15, cursor: note ? "default" : "pointer", textAlign: "start" }}>
            <span>{r.name}</span>
            {note && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: TEAL }}><Check size={14} />{note}</span>}
          </button>
        );
      })}
    </div>
  );
}

function CountryPicker({ title, hint, search, placeholder, noResults, onPick, onCancel, cancelLabel }: {
  title: string; hint: string; search: SearchEntry[]; placeholder: string; noResults: string; onPick: (cc: string) => void; onCancel: () => void; cancelLabel: string;
}) {
  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{title}</div>
      <div style={{ color: W40, fontSize: 13, marginBottom: 12 }}>{hint}</div>
      <CountrySearch search={search} placeholder={placeholder} noResults={noResults} onPick={onPick} autoFocus />
      <button onClick={onCancel} style={{ ...btn(false), marginTop: 14 }}>{cancelLabel}</button>
    </div>
  );
}

function AddPanel({ search, T: tr, data, nameOf, addItems, onDone }: {
  search: SearchEntry[]; T: (k: any) => any; data: Data; nameOf: (cc: string) => string;
  addItems: (items: { cc: string; year: number; city?: string }[]) => Promise<boolean>; onDone: () => void;
}) {
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const [city, setCity] = useState("");
  const [session, setSession] = useState<string[]>([]); // "cc:year" added in this sitting

  const has = (cc: string) =>
    Object.values(data.visits).some((v) => v.cc === cc && v.year === year) || session.includes(`${cc}:${year}`);

  const pick = async (cc: string) => {
    if (has(cc)) return;
    const ok = await addItems([{ cc, year, ...(city.trim() ? { city: city.trim() } : {}) }]);
    if (ok) { setSession((s) => [...s, `${cc}:${year}`]); setCity(""); }
  };

  const years: number[] = [];
  for (let y = thisYear; y >= 1950; y--) years.push(y);

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <label style={{ flex: "0 0 110px" }}>
          <div style={{ fontSize: 12, color: W40, marginBottom: 4 }}>{tr("year")}</div>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}
            style={{ width: "100%", padding: "11px 10px", borderRadius: 12, border: "0.5px solid rgba(100,223,223,0.3)", background: "#0d2137", color: "#fff", fontSize: 15, fontFamily: RF }}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: W40, marginBottom: 4 }}>&nbsp;</div>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder={tr("cityPh")} maxLength={60}
            style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 12, border: LINE, background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, fontFamily: RF, outline: "none" }} />
        </label>
      </div>
      <CountrySearch search={search} placeholder={tr("searchPh")} noResults={tr("noResults")} onPick={pick} autoFocus
        disabledFor={(cc) => (has(cc) ? tr("added") : null)} />
      {session.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
          {session.map((k) => {
            const [cc, y] = k.split(":");
            return (
              <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 999, background: "rgba(100,223,223,0.12)", color: TEAL, fontSize: 13 }}>
                <Check size={13} strokeWidth={2} />{nameOf(cc)} {y}
              </span>
            );
          })}
        </div>
      )}
      <button onClick={onDone} style={{ ...btn(true), marginTop: 18 }}>{tr("done")}</button>
    </div>
  );
}
