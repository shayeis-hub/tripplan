"use client";

// ─── STYLE CONSTANTS ──────────────────────────────────────────────────────────
const RF = "'Rubik',sans-serif";
const W05 = "rgba(255,255,255,0.05)";
const W07 = "rgba(255,255,255,0.07)";
const W08 = "rgba(255,255,255,0.08)";
const W12 = "rgba(255,255,255,0.12)";
const W15 = "rgba(255,255,255,0.15)";
const W25 = "rgba(255,255,255,0.25)";
const W35 = "rgba(255,255,255,0.35)";
const W40 = "rgba(255,255,255,0.4)";
const W50 = "rgba(255,255,255,0.5)";
const W55 = "rgba(255,255,255,0.55)";
const W60 = "rgba(255,255,255,0.6)";
const W70 = "rgba(255,255,255,0.7)";
const TB  = "rgba(100,223,223,0.15)";
const TBB = "rgba(100,223,223,0.2)";
const TBL = "rgba(100,223,223,0.12)";
const TEAL = "#64dfdf";
const DARK_BG = "#0d2137";

import { useState, useEffect, useCallback, useMemo, useRef, useReducer } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { setDoc, doc } from "firebase/firestore";
import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/i18n";
import {
  MapPin, Receipt, Wallet, Calendar, Sparkles, Backpack, Map,
  Trash2, Plus, BookOpen, Check, X, Filter, Share2, Plane, Send,
  Users, User, ChevronRight, Shirt, FileText, Zap, Heart, Package,
  AlertCircle, Loader, Link as LinkIcon, Ticket, Utensils, Car,
  Building2, Search, Clock, Menu, ArrowLeftRight, FileDown, BarChart2,
  Moon, Copy, Lock, Bug, Lightbulb,
} from "lucide-react";

const catLabel=(id,lang)=>t(`cat_${id}`,lang)||id;

const C = {
  // backgrounds
  bg:DARK_BG, bgCard:"rgba(255,255,255,0.06)", bgCardHover:"rgba(255,255,255,0.09)",
  bgInput:W07, bgNav:"rgba(0,0,0,0.3)", bgSection:"rgba(100,223,223,0.07)",
  // accent
  teal:TEAL, tealDim:TB, tealBorder:"rgba(100,223,223,0.25)",
  tealDeep:"#48b5c4",
  // text
  white:"#ffffff", textPrimary:"#ffffff", textSecondary:W55,
  textMuted:"rgba(255,255,255,0.3)", textHint:"rgba(255,255,255,0.18)",
  // status
  green:"#4ade80", greenDim:"rgba(74,222,128,0.12)",
  red:"#ff6b6b", redDim:"rgba(255,107,107,0.12)",
  amber:"#fbbf24", amberDim:"rgba(251,191,36,0.12)",
  // borders
  border:W08, borderAccent:TBB,
  // legacy aliases (keep backward compat)
  ocean:TEAL, oceanLight:"#48b5c4", oceanDeep:"#0a3050",
  coral:"#ff6b6b", palm:"#4ade80", palmLight:"#6ee7a0",
  sunset:"#fbbf24", dark:DARK_BG, darkMid:"#0a3050",
  muted:W35, lightBg:DARK_BG, sandDark:W08,
  sky:TEAL, purple:"#a78bfa",
};
const F={d:"'Rubik',sans-serif",b:"'Rubik',sans-serif"};
const CATS=[
  {id:"flight",    label:"טיסה",     icon:"✈️", Icon:Plane,     color:"#64dfdf", bg:"rgba(100,223,223,0.13)"},
  {id:"hotel",     label:"מלון",     icon:"🏨", Icon:Building2, color:"#818cf8", bg:"rgba(129,140,248,0.13)"},
  {id:"attraction",label:"אטרקציות",icon:"🎡", Icon:Ticket,    color:"#f472b6", bg:"rgba(244,114,182,0.13)"},
  {id:"food",      label:"אוכל",     icon:"🍜", Icon:Utensils,  color:"#fbbf24", bg:"rgba(251,191,36,0.13)"},
  {id:"taxi",      label:"מונית",    icon:"🚕", Icon:Car,       color:"#4ade80", bg:"rgba(74,222,128,0.13)"},
  {id:"other",     label:"אחר",      icon:"📦", Icon:Package,   color:"#94a3b8", bg:"rgba(148,163,184,0.13)"},
];
// ברירת מחדל – תמיד זמינים
const DEFAULT_CURRENCIES=[
  {code:"ILS",label:"שקל ישראלי",symbol:"₪"},
  {code:"USD",label:"דולר אמריקאי",symbol:"$"},
  {code:"EUR",label:"יורו",symbol:"€"},
];
const CURRENCY_NAMES={
  ILS:"שקל ישראלי",USD:"דולר אמריקאי",EUR:"יורו",GBP:"לירה שטרלינג",
  JPY:"ין יפני",THB:"בהט תאילנדי",TRY:"לירה טורקית",AED:"דירהם אמירתי",
  CHF:"פרנק שוויצרי",CAD:"דולר קנדי",AUD:"דולר אוסטרלי",INR:"רופי הודי",
  MXN:"פסו מקסיקני",BRL:"ריאל ברזילאי",SGD:"דולר סינגפורי",HKD:"דולר הונג קונגי",
  SEK:"כתר שוודי",NOK:"כתר נורווגי",DKK:"כתר דני",PLN:"זלוטי פולני",
  CNY:"יואן סיני",KRW:"וון קוריאני",MYR:"רינגיט מלזי",
  IDR:"רופיה אינדונזית",PHP:"פסו פיליפיני",EGP:"לירה מצרית",ZAR:"ראנד ד.א.",
  MAD:"דירהם מרוקאי",JOD:"דינר ירדני",
};
const CURRENCY_NAMES_EN={
  ILS:"Israeli Shekel",USD:"US Dollar",EUR:"Euro",GBP:"British Pound",
  JPY:"Japanese Yen",THB:"Thai Baht",TRY:"Turkish Lira",AED:"UAE Dirham",
  CHF:"Swiss Franc",CAD:"Canadian Dollar",AUD:"Australian Dollar",INR:"Indian Rupee",
  MXN:"Mexican Peso",BRL:"Brazilian Real",SGD:"Singapore Dollar",HKD:"Hong Kong Dollar",
  SEK:"Swedish Krona",NOK:"Norwegian Krone",DKK:"Danish Krone",PLN:"Polish Zloty",
  CNY:"Chinese Yuan",KRW:"South Korean Won",MYR:"Malaysian Ringgit",
  IDR:"Indonesian Rupiah",PHP:"Philippine Peso",EGP:"Egyptian Pound",ZAR:"South African Rand",
  MAD:"Moroccan Dirham",JOD:"Jordanian Dinar",
};
const CURR_SYMBOLS={
  ILS:"₪",USD:"$",EUR:"€",GBP:"£",JPY:"¥",THB:"฿",TRY:"₺",
  CHF:"Fr",CAD:"C$",AUD:"A$",INR:"₹",BRL:"R$",SGD:"S$",HKD:"HK$",
  SEK:"kr",NOK:"kr",DKK:"kr",PLN:"zł",CNY:"¥",KRW:"₩",RUB:"₽",
};
const getCurrLabel=(code,lang="he")=>(lang==="en"?CURRENCY_NAMES_EN[code]:CURRENCY_NAMES[code])||code;
const getCurrSymbol=(code)=>CURR_SYMBOLS[code]||code;
// Common Hebrew destination names to English
const HE_TO_EN_DEST={
  "פריז":"Paris","צרפת":"France","לונדון":"London","אנגליה":"England",
  "רומא":"Rome","איטליה":"Italy","ברלין":"Berlin","גרמניה":"Germany",
  "מדריד":"Madrid","ספרד":"Spain","אמסטרדם":"Amsterdam","הולנד":"Netherlands",
  "ברצלונה":"Barcelona","ליסבון":"Lisbon","פורטוגל":"Portugal",
  "אתונה":"Athens","יוון":"Greece","פראג":"Prague","וינה":"Vienna",
  "בודפשט":"Budapest","וורשה":"Warsaw","ברוסל":"Brussels","בלגיה":"Belgium",
  "ציריך":"Zurich","ז'נבה":"Geneva","שוויץ":"Switzerland",
  "קופנהגן":"Copenhagen","דנמרק":"Denmark","סטוקהולם":"Stockholm","שוודיה":"Sweden",
  "אוסלו":"Oslo","נורווגיה":"Norway","הלסינקי":"Helsinki","פינלנד":"Finland",
  "דובאי":"Dubai","אבו דאבי":"Abu Dhabi","איחוד האמירויות":"UAE",
  "בנגקוק":"Bangkok","תאילנד":"Thailand","פוקט":"Phuket","צ'יאנג מאי":"Chiang Mai",
  "בלי":"Bali","אינדונזיה":"Indonesia","סינגפור":"Singapore",
  "טוקיו":"Tokyo","יפן":"Japan","קיוטו":"Kyoto","אוסקה":"Osaka",
  "ניו יורק":"New York","לוס אנג'לס":"Los Angeles","מיאמי":"Miami",
  "שיקגו":"Chicago","לס וגאס":"Las Vegas","סן פרנסיסקו":"San Francisco",
  "קנקון":"Cancun","מקסיקו":"Mexico","ברזיל":"Brazil","ריו דה ז'ניירו":"Rio de Janeiro",
  "קהיר":"Cairo","מרוקו":"Morocco","מרקש":"Marrakech","תל אביב":"Tel Aviv",
  "ירושלים":"Jerusalem","אילת":"Eilat","ישראל":"Israel",
  "מוסקבה":"Moscow","רוסיה":"Russia","איסטנבול":"Istanbul","טורקיה":"Turkey",
  "הודו":"India","מומבאי":"Mumbai","דלהי":"Delhi","גואה":"Goa",
  "סידני":"Sydney","אוסטרליה":"Australia","מלבורן":"Melbourne",
  "טורונטו":"Toronto","קנדה":"Canada","ונקובר":"Vancouver",
  "קייפטאון":"Cape Town","דרום אפריקה":"South Africa",
  "ריאד":"Riyadh","ערב הסעודית":"Saudi Arabia","קטר":"Qatar","דוחא":"Doha",
};
const translateDest=(name)=>HE_TO_EN_DEST[name]||name;

const WMO={0:"☀️ בהיר",1:"🌤️ בהיר חלקית",2:"⛅ מעונן חלקית",3:"☁️ מעונן",45:"🌫️ ערפל",48:"🌫️ ערפל",51:"🌦️ טפטוף קל",53:"🌦️ טפטוף",55:"🌧️ טפטוף כבד",61:"🌧️ גשם קל",63:"🌧️ גשם",65:"🌧️ גשם כבד",80:"🌦️ ממטרים",81:"🌧️ ממטרים",82:"⛈️ ממטרים כבדים",95:"⛈️ סערה",96:"⛈️ סערה+ברד",99:"⛈️ סערה חזקה"};
const PERSON_COLORS=[C.ocean,C.coral,C.palm,C.sunset,C.purple,C.oceanLight,"#C0392B","#8E44AD"];

const fmtDate=(d)=>d?new Date(d).toLocaleDateString("he-IL",{day:"2-digit",month:"2-digit",year:"numeric"}):"";
const localDateStr=(d)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const getRange=(s,e)=>{const a=[];if(!s||!e)return a;const c=new Date(s),l=new Date(e);while(c<=l){a.push(localDateStr(c));c.setDate(c.getDate()+1);}return a;};
const uid=()=>Math.random().toString(36).slice(2)+Date.now().toString(36);
const remTime=(t,hrs=5)=>{if(!t)return null;const[h,m]=t.split(":").map(Number),tot=h*60+m-(hrs*60);if(tot<0)return null;return`${String(Math.floor(tot/60)).padStart(2,"0")}:${String(tot%60).padStart(2,"0")}`;};

function useRates(){
  // rates: { CODE: ILS_value } — e.g. rates.USD = 3.7 means 1 USD = 3.7 ILS
  const[rates,setRates]=useState({ILS:1,USD:3.7,EUR:4.0,THB:0.105});
  const[allCodes,setAllCodes]=useState([]); // all available codes from API
  const[info,setInfo]=useState({updated:null,error:null});
  useEffect(()=>{
    fetch("https://open.er-api.com/v6/latest/ILS")
      .then(r=>r.json())
      .then(d=>{
        if(d?.rates){
          // convert: 1 ILS = d.rates[CODE] => 1 CODE = 1/d.rates[CODE] ILS
          const r={ILS:1};
          Object.keys(d.rates).forEach(code=>{ r[code]=1/d.rates[code]; });
          setRates(r);
          setAllCodes(Object.keys(d.rates).sort());
          setInfo({updated:new Date().toLocaleTimeString("he-IL"),error:null});
        }
      })
      .catch(()=>setInfo({updated:null,error:"שערים קבועים (API לא זמין בתצוגה מקדימה)"}));
  },[]);
  const toILS=useCallback((amt,cur)=>amt*(rates[cur]??1),[rates]);
  return{rates,allCodes,info,toILS};
}

// ── Currency display helpers ──────────────────────────────────────────────────
const DISPLAY_SYMS={ILS:"₪",USD:"$",EUR:"€"};
const symFor=cur=>DISPLAY_SYMS[cur]||(cur+" ");
// Convert a stored ILS amount to the trip's display currency
const fromILS=(amtILS,displayCur,rates)=>
  (!displayCur||displayCur==="ILS")?amtILS:amtILS/(rates[displayCur]||1);
// Format a display amount with symbol
const fmtAmt=(amtILS,displayCur,rates,decimals=0)=>
  `${symFor(displayCur??'ILS')}${fromILS(amtILS,displayCur??'ILS',rates).toFixed(decimals)}`;

function useWeather(destination,startDate,endDate){
  const[wx,setWx]=useState(null);const[loading,setLoading]=useState(false);const[wxError,setWxError]=useState(null);
  useEffect(()=>{
    if(!destination||!startDate||!endDate)return;
    const today=new Date();today.setHours(0,0,0,0);
    const diff=Math.round((new Date(startDate).getTime()-today.getTime())/86400000);
    if(diff>16){setWxError("תחזית זמינה רק עד 16 יום קדימה");return;}
    setLoading(true);setWxError(null);setWx(null);
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(translateDest(destination))}&count=1&language=en`)
      .then(r=>r.json()).then(geo=>{
        if(!geo.results?.length)throw new Error("יעד לא נמצא");
        const{latitude:lat,longitude:lon,name,country}=geo.results[0];
        const maxDate=localDateStr(new Date(today.getTime()+16*86400000));
        const end2=endDate>maxDate?maxDate:endDate;
        const start2=startDate<localDateStr(today)?localDateStr(today):startDate;
        return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&start_date=${start2}&end_date=${end2}&timezone=auto`)
          .then(r=>r.json()).then(fc=>({name,country,daily:fc.daily}));
      }).then(d=>{setWx(d);setLoading(false);}).catch(e=>{setWxError(e.message||"שגיאה");setLoading(false);});
  },[destination,startDate,endDate]);
  return{wx,loading,error:wxError};
}

const GS=`
  @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Rubik',sans-serif;background:#0d2137;color:#ffffff;direction:rtl}
  ::-webkit-scrollbar{width:5px}
  ::-webkit-scrollbar-track{background:rgba(255,255,255,0.04)}
  ::-webkit-scrollbar-thumb{background:rgba(100,223,223,0.3);border-radius:4px}
  input,select,textarea,button{font-family:'Rubik',sans-serif}
`;

function WaveHeader({title,subtitle,action}){
  return(
    <div style={{background:"linear-gradient(160deg,#0d2137 0%,#0a3050 100%)",padding:"22px 20px 18px",borderBottom:"0.5px solid rgba(100,223,223,0.12)"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div>
          <h1 style={{fontFamily:RF,color:"#ffffff",fontSize:24,fontWeight:800,letterSpacing:"-0.3px",lineHeight:1}}>{title}</h1>
          {subtitle&&<p style={{color:W40,marginTop:5,fontSize:12,fontWeight:400,letterSpacing:"0.2px"}}>{subtitle}</p>}
        </div>
        {action&&<div>{action}</div>}
      </div>
    </div>
  );
}

const NAV_CFG={
  destination:{Icon:MapPin,   he:"יעד",    en:"Destination"},
  expenses:   {Icon:Receipt,  he:"הוצאות", en:"Expenses"},
  budget:     {Icon:Wallet,   he:"תקציב",  en:"Budget"},
  calendar:   {Icon:Calendar, he:"יומן",   en:"Calendar"},
  discover:   {Icon:Sparkles, he:"המלצות", en:"Tips"},
  packing:    {Icon:Backpack, he:"אריזה",  en:"Packing"},
  map:        {Icon:Map,      he:"מפה",    en:"Map"},
};

function NavBar({screens,current,onNav}){
  const{lang}=useLang();
  return(
    <div style={{display:"flex",background:"rgba(5,16,30,0.97)",borderTop:"0.5px solid rgba(100,223,223,0.1)",position:"sticky",bottom:0,zIndex:100,backdropFilter:"blur(12px)",paddingBottom:6}}>
      {screens.map(s=>{
        const cfg=NAV_CFG[s]||{Icon:MapPin,he:s,en:s};
        const on=current===s;
        return(
          <button key={s} onClick={()=>{haptic();onNav(s);}} className="nav-btn" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"0 2px 3px",paddingTop:8,border:"none",background:"transparent",cursor:"pointer",borderTop:on?"2px solid #64dfdf":"2px solid transparent",transition:"border-color 0.18s"}}>
            {cfg.Icon&&<cfg.Icon size={on?19:17} color={on?"#64dfdf":"rgba(255,255,255,0.27)"} strokeWidth={on?2:1.5} style={{transition:"all 0.18s"}}/>}
            <span style={{fontSize:9,fontWeight:on?700:400,color:on?"#64dfdf":"rgba(255,255,255,0.22)",fontFamily:RF}}>{lang==="he"?cfg.he:cfg.en}</span>
          </button>
        );
      })}
    </div>
  );
}

const Card=({children,style})=><div style={{background:W05,border:"0.5px solid rgba(100,223,223,0.18)",borderRadius:16,padding:"16px",...style}}>{children}</div>;

// ── Haptic helper ─────────────────────────────────────────────────
const haptic=()=>{try{if(typeof navigator!=="undefined"&&navigator.vibrate)navigator.vibrate(8);}catch{}};

// ── Animated counter hook ─────────────────────────────────────────
function useCountUp(target,duration=750){
  const[val,setVal]=useState(0);
  const prev=useRef(0);
  useEffect(()=>{
    const from=prev.current;
    prev.current=target;
    if(from===target)return;
    const start=performance.now();
    let raf;
    const tick=now=>{
      const p=Math.min((now-start)/duration,1);
      const ease=1-Math.pow(1-p,3); // ease-out cubic
      setVal(from+(target-from)*ease);
      if(p<1)raf=requestAnimationFrame(tick);
      else setVal(target);
    };
    raf=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(raf);
  },[target,duration]);
  return val;
}

// ── KPI card with animated counter ───────────────────────────────
function KpiCard({label,value,color,icon,Icon,noFmt,sym="₪"}){
  const animated=useCountUp(value);
  const display=noFmt?Math.round(animated):`${sym}${animated.toFixed(0)}`;
  return(
    <div style={{background:"rgba(255,255,255,0.04)",border:`0.5px solid ${color}30`,borderRadius:16,padding:"14px 16px",display:"flex",flexDirection:"column",justifyContent:"space-between",minHeight:88}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{fontSize:11,fontWeight:500,color:"rgba(255,255,255,0.4)",fontFamily:RF}}>{label}</div>
        <div style={{width:28,height:28,borderRadius:8,background:`${color}20`,border:`0.5px solid ${color}50`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          {Icon?<Icon size={13} color={color} strokeWidth={1.5}/>:<span style={{fontSize:13}}>{icon}</span>}
        </div>
      </div>
      <div style={{fontFamily:RF,fontSize:22,fontWeight:800,color,marginTop:8,letterSpacing:"-0.5px"}}>{display}</div>
    </div>
  );
}

// ── Skeleton rows for recommendations loading ─────────────────────
function SkeletonRec(){
  const rows=[{w:"65%",w2:"40%"},{w:"55%",w2:"50%"},{w:"70%",w2:"35%"},{w:"60%",w2:"45%"},{w:"50%",w2:"55%"}];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {rows.map((r,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:12,background:W05}}>
          <div className="skeleton" style={{width:36,height:36,borderRadius:10,flexShrink:0}}/>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
            <div className="skeleton" style={{height:12,width:r.w}}/>
            <div className="skeleton" style={{height:9,width:r.w2}}/>
          </div>
          <div className="skeleton" style={{width:48,height:26,borderRadius:8,flexShrink:0}}/>
        </div>
      ))}
    </div>
  );
}
const FL=({children})=><label style={{display:"block",fontWeight:500,fontSize:12,marginBottom:6,color:W40,letterSpacing:"0.5px",textTransform:"uppercase"}}>{children}</label>;

function SI({label,value,onChange,type="text",placeholder,min,max,style}){
  return(
    <div style={{marginBottom:14,...style}}>
      {label&&<FL>{label}</FL>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} min={min} max={max}
        style={{width:"100%",padding:"11px 14px",borderRadius:12,border:`2px solid ${C.sandDark}`,fontFamily:RF,fontSize:15,color:"#ffffff",background:"rgba(255,255,255,0.04)",outline:"none",direction:"rtl",transition:"border 0.2s"}}
        onFocus={e=>(e.target.style.borderColor=C.ocean)} onBlur={e=>(e.target.style.borderColor=C.sandDark)}/>
    </div>
  );
}

function SS({label,value,onChange,children,style}){
  return(
    <div style={{marginBottom:14,...style}}>
      {label&&<FL>{label}</FL>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",padding:"11px 12px",borderRadius:12,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:RF,fontSize:14,background:W07,color:"#ffffff",direction:"rtl",outline:"none"}}>
        {children}
      </select>
    </div>
  );
}

function Btn({children,onClick,color,outline,small,disabled,style}){
  const bg=outline?"transparent":color||C.ocean;
  const border=outline?`2px solid ${color||C.sandDark}`:"none";
  const col=outline?(color||C.muted):C.white;
  return(
    <button onClick={e=>{if(!disabled){haptic();onClick&&onClick(e);}} } disabled={disabled} className={disabled?"":"tap-btn"} style={{padding:small?"8px 14px":"13px 20px",borderRadius:12,border,background:disabled?C.sandDark:bg,color:disabled?C.muted:col,fontFamily:RF,fontWeight:700,fontSize:small?13:15,cursor:disabled?"default":"pointer",opacity:disabled?0.6:1,...style}}>
      {children}
    </button>
  );
}

function PieChart({data}){
  const total=data.reduce((s,d)=>s+d.value,0);
  if(!total)return null;
  let cum=-Math.PI/2;
  const slices=data.map(d=>{const a=(d.value/total)*2*Math.PI,s=cum;cum+=a;return{...d,s,e:cum};});
  const R=80,r=48,cx=100,cy=100;
  // donut arc: outer arc + inner arc
  const arc=(s,e,outerR,innerR)=>{
    if(e-s>=2*Math.PI-0.001)e=s+2*Math.PI-0.001;
    const x1=cx+outerR*Math.cos(s),y1=cy+outerR*Math.sin(s);
    const x2=cx+outerR*Math.cos(e),y2=cy+outerR*Math.sin(e);
    const x3=cx+innerR*Math.cos(e),y3=cy+innerR*Math.sin(e);
    const x4=cx+innerR*Math.cos(s),y4=cy+innerR*Math.sin(s);
    const lg=e-s>Math.PI?1:0;
    return`M${x1},${y1} A${outerR},${outerR} 0 ${lg} 1 ${x2},${y2} L${x3},${y3} A${innerR},${innerR} 0 ${lg} 0 ${x4},${y4} Z`;
  };
  const[hov,setHov]=useState(null);
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
      <svg viewBox="0 0 200 200" style={{width:170,height:170}}>
        {slices.map((s,i)=>(
          <path key={i} d={arc(s.s,s.e,hov===i?R+5:R,r)} fill={s.color} stroke="#0d2137" strokeWidth={2}
            style={{cursor:"pointer",transition:"all 0.15s",filter:hov===i?"drop-shadow(0 2px 6px rgba(0,0,0,0.25))":"none"}}
            onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
            onTouchStart={()=>setHov(i)} onTouchEnd={()=>setTimeout(()=>setHov(null),1200)}/>
        ))}
        <text x={cx} y={cy-8} textAnchor="middle" fontFamily="Rubik,sans-serif" fontSize={11} fill={W40} fontWeight={600}>{hov!==null?slices[hov].label:'סה"כ'}</text>
        <text x={cx} y={cy+10} textAnchor="middle" fontFamily="Rubik,sans-serif" fontSize={14} fill={TEAL} fontWeight={900}>{hov!==null?`${slices[hov].value.toFixed(0)}`:`${total.toFixed(0)}`}</text>
        {hov!==null&&<text x={cx} y={cy+26} textAnchor="middle" fontFamily="Rubik,sans-serif" fontSize={9} fill={W35}>{((slices[hov].value/total)*100).toFixed(1)}%</text>}
      </svg>
      <div style={{display:"flex",flexWrap:"wrap",gap:"6px 12px",justifyContent:"center",maxWidth:260}}>
        {slices.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",opacity:hov!==null&&hov!==i?0.4:1,transition:"opacity 0.15s"}}
            onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}>
            <div style={{width:11,height:11,borderRadius:3,background:s.color,flexShrink:0}}/>
            <span style={{fontSize:12,fontWeight:700}}>{s.label}</span>
            <span style={{fontSize:11,color:W35}}>{((s.value/total)*100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PUSH NOTIFICATIONS ──────────────────────────────────────────────────────
function usePushNotifications(userId){
  const[permission,setPermission]=useState(typeof Notification!=="undefined"?Notification.permission:"default");
  const[subscribed,setSubscribed]=useState(false);

  const subscribe=async()=>{
    if(!userId||typeof Notification==="undefined") return;
    try{
      const perm=await Notification.requestPermission();
      setPermission(perm);
      if(perm!=="granted") return;

      const reg=await navigator.serviceWorker.ready;
      const existing=await reg.pushManager.getSubscription();
      if(existing){await saveSubscription(existing,userId);setSubscribed(true);return;}

      const sub=await reg.pushManager.subscribe({
        userVisibleOnly:true,
        applicationServerKey:urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY||""),
      });
      await saveSubscription(sub,userId);
      setSubscribed(true);
    }catch(e){console.error("Push subscribe error:",e);}
  };

  const saveSubscription=async(sub,uid)=>{
    await fetch("/api/push-subscribe",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({subscription:sub.toJSON(),userId:uid}),
    });
  };

  useEffect(()=>{
    if(!userId||typeof navigator==="undefined"||!navigator.serviceWorker) return;
    navigator.serviceWorker.register("/sw.js").catch(()=>{});
    navigator.serviceWorker.ready.then(reg=>{
      reg.pushManager.getSubscription().then(sub=>{
        if(sub){saveSubscription(sub,userId);setSubscribed(true);}
      });
    });
  },[userId]);

  return{permission,subscribed,subscribe};
}

function urlBase64ToUint8Array(base64String){
  const padding="=".repeat((4-base64String.length%4)%4);
  const base64=(base64String+padding).replace(/-/g,"+").replace(/_/g,"/");
  const rawData=window.atob(base64);
  const outputArray=new Uint8Array(rawData.length);
  for(let i=0;i<rawData.length;++i) outputArray[i]=rawData.charCodeAt(i);
  return outputArray;
}

async function sendPushToUser(userId,title,body,url="/"){
  try{
    await fetch("/api/push-send",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({userId,title,body,url}),
    });
  }catch(e){}
}

function CurrencyConverter({rates,onClose,tripCurrencies}){
  const{lang}=useLang();
  const[amount,setAmount]=useState("");
  const[from,setFrom]=useState(tripCurrencies?.[1]||"USD");
  const[to,setTo]=useState("ILS");

  const allCodes=Object.keys(rates).filter(c=>rates[c]>0).sort();
  const converted=amount&&!isNaN(amount)
    ? (parseFloat(amount)*rates[from]/rates[to]).toFixed(2)
    : "";

  const swap=()=>{setFrom(to);setTo(from);};

  return(
    <div style={{margin:"0 0 0",background:"rgba(100,223,223,0.06)",border:"0.5px solid rgba(100,223,223,0.2)",borderBottom:"0.5px solid rgba(100,223,223,0.15)"}}>
      <div style={{padding:"12px 18px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontFamily:RF,fontSize:13,fontWeight:700,color:TEAL}}>{t("conv_title",lang)}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:W40,fontSize:16,cursor:"pointer"}}>✕</button>
        </div>
        {/* Amount input */}
        <input value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder={t("conv_ph",lang)} min="0"
          style={{width:"100%",padding:"11px 14px",borderRadius:10,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:RF,fontSize:16,color:"#ffffff",background:W07,outline:"none",direction:"ltr",marginBottom:10}}
          onFocus={e=>(e.target.style.borderColor=TEAL)} onBlur={e=>(e.target.style.borderColor=TBB)}/>
        {/* From / swap / To */}
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <select value={from} onChange={e=>setFrom(e.target.value)}
            style={{flex:1,padding:"10px 8px",borderRadius:10,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:RF,fontSize:14,color:"#ffffff",background:"#0d2f4a",outline:"none"}}>
            {allCodes.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={swap} style={{padding:"8px 12px",borderRadius:10,border:"0.5px solid rgba(100,223,223,0.2)",background:"rgba(100,223,223,0.08)",color:TEAL,fontSize:16,cursor:"pointer",flexShrink:0}}>⇄</button>
          <select value={to} onChange={e=>setTo(e.target.value)}
            style={{flex:1,padding:"10px 8px",borderRadius:10,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:RF,fontSize:14,color:"#ffffff",background:"#0d2f4a",outline:"none"}}>
            {allCodes.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {converted&&(
          <div style={{marginTop:10,padding:"10px 14px",background:"rgba(100,223,223,0.1)",borderRadius:10,textAlign:"center"}}>
            <span style={{fontFamily:RF,fontSize:22,fontWeight:800,color:TEAL}}>{converted} {to}</span>
            <div style={{fontSize:11,color:W35,marginTop:3,fontFamily:RF}}>
              1 {from} = {rates[from]&&rates[to]?(rates[from]/rates[to]).toFixed(4):""} {to}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function exportTripPDF(trip,expenses,lang="he"){
  if(!trip) return;
  const isHe=lang==="he";
  const dir=isHe?"rtl":"ltr";
  const CATS_MAP=Object.fromEntries(CATS.map(c=>[c.id,c]));
  const catLbl=id=>t(`cat_${id}`,lang)||id;
  const getAmt=e=>e.paid&&e.amountILSLocked?e.amountILSLocked:e.amountILS;
  const total=expenses.reduce((s,e)=>s+getAmt(e),0);
  const paid=expenses.filter(e=>e.paid).reduce((s,e)=>s+getAmt(e),0);
  const unpaid=total-paid;
  const sharedExp=expenses.filter(e=>e.isShared!==false);
  const sharedTotal=sharedExp.reduce((s,e)=>s+getAmt(e),0);
  const byCat=CATS.map(cat=>{
    const ce=expenses.filter(e=>e.category===cat.id);
    return{...cat,total:ce.reduce((s,e)=>s+getAmt(e),0),count:ce.length};
  }).filter(c=>c.count>0);
  const byDate={};
  expenses.forEach(e=>{
    const d=e.category==="hotel"?e.checkIn:e.date;
    if(!byDate[d]) byDate[d]=[];
    byDate[d].push(e);
  });
  const sortedDates=Object.keys(byDate).sort();
  const people=trip.people||[];
  const balances={};
  sharedExp.forEach(exp=>{
    if(!exp.paidBy) return;
    const participants=[exp.paidBy,...(exp.splitWith||[])];
    if(participants.length<2) return;
    const share=getAmt(exp)/participants.length;
    balances[exp.paidBy]=(balances[exp.paidBy]||0)+getAmt(exp)-share;
    (exp.splitWith||[]).forEach(id=>{balances[id]=(balances[id]||0)-share;});
  });
  const creditors=[],debtors=[];
  Object.entries(balances).forEach(([id,bal])=>{
    const name=people.find(p=>p.id===id)?.name||id;
    if(bal>0.5) creditors.push({name,amount:bal});
    else if(bal<-0.5) debtors.push({name,amount:-bal});
  });
  const settlements=[];
  const creds=[...creditors],depts=[...debtors];
  while(creds.length&&depts.length){
    const c=creds[0],d=depts[0];
    const amt=Math.min(c.amount,d.amount);
    settlements.push({from:d.name,to:c.name,amount:amt});
    c.amount-=amt; d.amount-=amt;
    if(c.amount<0.5) creds.shift();
    if(d.amount<0.5) depts.shift();
  }
  const budget=trip.budget?parseFloat(trip.budget):null;
  const budgetPct=budget?Math.min((total/budget)*100,100):null;
  const budgetColor=budgetPct?budgetPct<70?"#4ade80":budgetPct<90?"#fbbf24":"#ff6b6b":"#64dfdf";
  const appName=isHe?"טיולון":"TUlon";
  const appSub=isHe?"מתכנן הטיולים שלי":"My Trip Planner";
  const fallbackDest=isHe?"טיול":"Trip";

  const html=`<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head>
<meta charset="UTF-8">
<title>${appName} – ${trip.destination||fallbackDest}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Rubik',Arial,sans-serif;background:#f8fafc;color:#1a2b35;direction:${dir};font-size:14px;line-height:1.5;}
  .cover{background:linear-gradient(160deg,#091928,#0d2137,#0a3050);padding:36px 28px;color:white;}
  .logo{font-size:38px;font-weight:900;letter-spacing:-1.5px;}
  .logo-sub{font-size:11px;font-weight:300;color:rgba(255,255,255,0.3);letter-spacing:1px;margin-top:3px;}
  .dest{font-size:22px;font-weight:700;margin-top:18px;}
  .dates{font-size:12px;color:rgba(255,255,255,0.4);margin-top:5px;}
  .badge{display:inline-block;background:#64dfdf;color:#0d2137;font-size:11px;font-weight:700;padding:5px 16px;border-radius:999px;margin-top:12px;}
  .content{padding:24px 20px;max-width:800px;margin:0 auto;}
  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:22px;}
  .kpi{background:white;border-radius:12px;padding:12px;text-align:center;border-top:3px solid #64dfdf;box-shadow:0 2px 6px rgba(0,0,0,0.05);}
  .kpi-val{font-size:18px;font-weight:800;color:#0d2137;}
  .kpi-lbl{font-size:10px;color:#7a9baa;margin-top:4px;}
  .budget-box{background:white;border-radius:12px;padding:14px;margin-bottom:20px;box-shadow:0 2px 6px rgba(0,0,0,0.05);}
  .budget-header{display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin-bottom:10px;}
  .budget-track{height:8px;background:#e8f4f8;border-radius:999px;overflow:hidden;margin-bottom:6px;}
  .budget-fill{height:100%;border-radius:999px;}
  .budget-footer{display:flex;justify-content:space-between;font-size:12px;font-weight:600;}
  .section-title{font-size:14px;font-weight:700;color:#0d2137;border-bottom:2px solid #64dfdf;padding-bottom:6px;margin:20px 0 12px;}
  .bar-row{margin-bottom:9px;}
  .bar-header{display:flex;justify-content:space-between;font-size:12px;font-weight:500;margin-bottom:4px;}
  .bar-track{height:6px;background:#e8f4f8;border-radius:999px;overflow:hidden;}
  .bar-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#64dfdf,#48b5c4);}
  .day-header{background:#e8f4f8;font-weight:700;padding:8px 12px;border-radius:8px;margin:14px 0 6px;font-size:12px;color:#0d2137;border-right:3px solid #64dfdf;}
  table{width:100%;border-collapse:collapse;font-size:11px;border-radius:8px;overflow:hidden;margin-bottom:4px;}
  th{background:#0d2137;color:white;padding:7px 10px;text-align:right;font-weight:600;font-size:10px;}
  td{padding:7px 10px;border-bottom:1px solid #f0f4f8;vertical-align:middle;}
  tr:nth-child(even) td{background:#fafbfc;}
  .b{padding:2px 7px;border-radius:999px;font-size:9px;font-weight:600;}
  .bp{background:#dcfce7;color:#166534;}
  .bu{background:#fef2f2;color:#991b1b;}
  .bs{background:#e0f2fe;color:#0369a1;}
  .bn{background:#f3e8ff;color:#7c3aed;}
  .settlement-row{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:white;border-radius:10px;margin-bottom:8px;box-shadow:0 1px 4px rgba(0,0,0,0.06);}
  .settle-amount{font-size:16px;font-weight:800;color:#ff6b6b;}
  .footer{background:#0d2137;color:rgba(255,255,255,0.35);text-align:center;padding:14px;font-size:10px;margin-top:28px;}
  .footer span{color:#64dfdf;}
  @media print{
    body{background:white;}
    .cover,.budget-fill,.day-header{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  }
</style>
</head>
<body>
<div class="cover">
  <div class="logo">${appName}</div>
  <div class="logo-sub">${appSub}</div>
  <div class="dest">🌍 ${trip.destination||fallbackDest}</div>
  <div class="dates">${fmtDate(trip.startDate)} – ${fmtDate(trip.endDate)}</div>
  <div class="badge">${isHe?"דוח הוצאות":"Expense Report"}</div>
</div>
<div class="content">
  <div class="kpi-grid">
    <div class="kpi"><div class="kpi-val">₪${total.toFixed(0)}</div><div class="kpi-lbl">${isHe?'סה"כ הוצאות':"Total Expenses"}</div></div>
    <div class="kpi" style="border-top-color:#4ade80"><div class="kpi-val" style="color:#166534">₪${paid.toFixed(0)}</div><div class="kpi-lbl">${isHe?"שולם":"Paid"}</div></div>
    <div class="kpi" style="border-top-color:#ff6b6b"><div class="kpi-val" style="color:#991b1b">₪${unpaid.toFixed(0)}</div><div class="kpi-lbl">${isHe?"טרם שולם":"Unpaid"}</div></div>
    <div class="kpi" style="border-top-color:#fbbf24"><div class="kpi-val" style="color:#92400e">${expenses.length}</div><div class="kpi-lbl">${isHe?"הוצאות":"Expenses"}</div></div>
  </div>
  ${budget?`<div class="budget-box">
    <div class="budget-header"><span>💰 ${isHe?"עמידה בתקציב":"Budget Progress"}</span><span style="color:#64dfdf">₪${budget.toLocaleString()}</span></div>
    <div class="budget-track"><div class="budget-fill" style="width:${budgetPct.toFixed(0)}%;background:${budgetColor}"></div></div>
    <div class="budget-footer">
      <span style="color:${budgetColor}">${budgetPct.toFixed(1)}% ${isHe?"מהתקציב":"of budget"}</span>
      <span style="color:${total>budget?"#ff6b6b":"#4ade80"}">${total>budget?(isHe?`חריגה: ₪${(total-budget).toFixed(0)}`:`Over: ₪${(total-budget).toFixed(0)}`):(isHe?`נותרו: ₪${(budget-total).toFixed(0)}`:`Remaining: ₪${(budget-total).toFixed(0)}`)}</span>
    </div>
  </div>`:""}
  <div class="section-title">📊 ${isHe?"פירוט לפי קטגוריה":"By Category"}</div>
  ${byCat.map(cat=>`<div class="bar-row">
    <div class="bar-header"><span>${cat.icon} ${catLbl(cat.id)} (${cat.count})</span><span style="font-weight:700">₪${cat.total.toFixed(0)}</span></div>
    <div class="bar-track"><div class="bar-fill" style="width:${total>0?(cat.total/total*100).toFixed(0):0}%"></div></div>
  </div>`).join("")}
  <div class="section-title">📅 ${isHe?"הוצאות לפי יום":"Expenses by Day"}</div>
  ${sortedDates.map(d=>`
    <div class="day-header">${fmtDate(d)}</div>
    <table>
      <tr><th>${isHe?"קטגוריה":"Category"}</th><th>${isHe?"תיאור":"Description"}</th><th>${isHe?"סכום מקורי":"Original amount"}</th><th>₪</th><th>${isHe?"סטטוס":"Status"}</th><th>${isHe?"סוג":"Type"}</th></tr>
      ${byDate[d].map(e=>`<tr>
        <td>${CATS_MAP[e.category]?.icon||""} ${catLbl(e.category)}</td>
        <td>${e.description||"—"}${e.address?`<br><span style="color:#7a9baa;font-size:10px">📍 ${e.address}</span>`:""}</td>
        <td style="direction:ltr;text-align:left">${e.amount?.toFixed(2)||""} ${e.currency||""}</td>
        <td style="font-weight:700">₪${getAmt(e).toFixed(0)}</td>
        <td><span class="b ${e.paid?"bp":"bu"}">${e.paid?(isHe?"✓ שולם":"✓ Paid"):(isHe?"⏳ טרם":"⏳ Unpaid")}</span></td>
        <td><span class="b ${e.isShared===false?"bn":"bs"}">${e.isShared===false?(isHe?"👤 אישית":"👤 Personal"):(isHe?"👥 משותפת":"👥 Shared")}</span></td>
      </tr>`).join("")}
    </table>
  `).join("")}
  ${sharedExp.length>0?`
  <div class="section-title">💸 ${isHe?"התחשבנות סופית":"Final Settlement"}</div>
  <p style="font-size:11px;color:#7a9baa;margin-bottom:10px">${isHe?`מבוסס על הוצאות משותפות בלבד (₪${sharedTotal.toFixed(0)})`:`Based on shared expenses only (₪${sharedTotal.toFixed(0)})`}</p>
  ${settlements.length>0?settlements.map(s=>`
    <div class="settlement-row">
      <span style="font-size:14px;font-weight:600">${s.from}</span>
      <span style="color:#7a9baa;font-size:12px">${isHe?`חייב ל ← ${s.to}`:`owes → ${s.to}`}</span>
      <span class="settle-amount">₪${s.amount.toFixed(0)}</span>
    </div>`).join("")
  :`<div style="text-align:center;color:#4ade80;padding:16px;font-weight:700">${isHe?"✅ אין חובות – כולם שווה!":"✅ No debts – all settled!"}</div>`}
  `:""}
</div>
<div class="footer">${isHe?`נוצר על ידי <span>${appName}</span> – ${appSub}`:`Created with <span>${appName}</span> – ${appSub}`} &nbsp;|&nbsp; ${new Date().toLocaleDateString(isHe?"he-IL":"en-US")}</div>
</body></html>`;

  const w=window.open("","_blank");
  if(!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(()=>w.print(),800);
}

function TripSelectorScreen({trips,onSelect,onCreate,onDelete,userId,rates={}}){
  const{lang}=useLang();
  const[showJoin,setShowJoin]=useState(false);
  const[joinLink,setJoinLink]=useState("");

  const handleJoin=()=>{
    if(!joinLink.trim())return;
    // Extract shareId from URL or use raw value
    const match=joinLink.trim().match(/\/trip\/([^/?#]+)/);
    const shareId=match?match[1]:joinLink.trim();
    window.location.href=`/trip/${shareId}`;
  };

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#091928 0%,#0d2137 60%,#0a2a40 100%)"}}>
      {/* Header */}
      <div style={{padding:"44px 22px 28px"}}>
        <div style={{fontSize:10,fontWeight:400,color:"rgba(255,255,255,0.25)",letterSpacing:"1.8px",textTransform:"uppercase",marginBottom:10}}>{t("welcome_back",lang)}</div>
        <h1 style={{fontFamily:RF,color:"#ffffff",fontSize:42,fontWeight:900,letterSpacing:"-1.5px",lineHeight:1,marginBottom:6}}>{t("app_name",lang)}</h1>
        <p style={{fontFamily:RF,color:"rgba(255,255,255,0.3)",fontSize:13,fontWeight:300}}>{t("app_subtitle",lang)}</p>
      </div>

      <div style={{padding:"0 18px 20px",display:"flex",flexDirection:"column",gap:10}}>
        {trips.length===0&&(
          <div style={{textAlign:"center",padding:"40px 0 32px",color:W35}}>
            <div style={{width:100,height:100,borderRadius:26,background:"rgba(100,223,223,0.07)",border:"0.5px solid rgba(100,223,223,0.18)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>
              <Send size={44} color="rgba(100,223,223,0.5)" strokeWidth={1}/>
            </div>
            <div style={{fontSize:22,fontWeight:800,color:"#ffffff",letterSpacing:"-0.5px",marginBottom:8}}>{t("no_trips",lang)}</div>
            <div style={{fontSize:13,color:W35,lineHeight:1.6,maxWidth:240,margin:"0 auto"}}>{t("no_trips_sub",lang)}</div>
          </div>
        )}

        {trips.map((trip,idx)=>{
          const ACCENTS=["#64dfdf","#818cf8","#f472b6","#fbbf24","#4ade80"];
          const accent=ACCENTS[idx%ACCENTS.length];
          const nights=trip.startDate&&trip.endDate?Math.round((new Date(trip.endDate).getTime()-new Date(trip.startDate).getTime())/86400000)+1:0;
          const dc=trip.displayCurrency||"ILS";
          const total=trip.expenses?.reduce((s,e)=>s+e.amountILS,0)||0;
          return(
            <div key={trip.id} style={{borderRadius:18,overflow:"hidden",border:"0.5px solid rgba(255,255,255,0.07)",cursor:"pointer",display:"flex"}}
              onClick={()=>onSelect(trip.id)}>
              {/* Vertical accent bar on left */}
              <div style={{width:4,flexShrink:0,background:`linear-gradient(180deg,${accent}ee,${accent}44)`}}/>
              <div style={{flex:1,background:W05,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,transition:"background 0.2s",minWidth:0}}
                onMouseEnter={e=>e.currentTarget.style.background=W08}
                onMouseLeave={e=>e.currentTarget.style.background=W05}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <div style={{fontFamily:RF,fontSize:16,fontWeight:700,color:"#ffffff",letterSpacing:"-0.2px"}}>{trip.destination||(lang==="he"?"יעד לא מוגדר":"No destination")}</div>
                    {trip.owner!==userId&&trip.owner&&<span style={{fontSize:9,background:TBL,color:TEAL,border:"0.5px solid rgba(100,223,223,0.3)",borderRadius:999,padding:"2px 7px",fontWeight:600}}>{t("shared_badge",lang)}</span>}
                    {trip.owner===userId&&trip.sharedWith?.length>0&&<span style={{fontSize:9,background:"rgba(100,223,223,0.08)",color:"rgba(100,223,223,0.6)",border:"0.5px solid rgba(100,223,223,0.2)",borderRadius:999,padding:"2px 7px",fontWeight:600}}>{trip.sharedWith.length} {lang==="he"?"משתתפים":"members"}</span>}
                  </div>
                  <div style={{fontSize:11,color:W35,marginTop:3,fontWeight:400,display:"flex",alignItems:"center",gap:4}}>
                    <Calendar size={10} color="rgba(255,255,255,0.28)"/>
                    <span>{trip.startDate?`${fmtDate(trip.startDate)} – ${fmtDate(trip.endDate)}`:(lang==="he"?"תאריכים לא מוגדרים":"Dates not set")}{nights>0&&` · ${nights} ${t("days",lang)}`}</span>
                  </div>
                  {total>0&&<div style={{fontSize:12,color:accent,fontWeight:600,marginTop:4}}>{fmtAmt(total,dc,rates)}</div>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                  <div style={{width:44,height:44,borderRadius:14,background:`${accent}18`,border:`0.5px solid ${accent}38`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <MapPin size={20} color={accent} strokeWidth={1.5}/>
                  </div>
                  <button onClick={ev=>{ev.stopPropagation();if(window.confirm(t("confirm_delete",lang)))onDelete(trip.id);}} style={{padding:"7px 8px",borderRadius:8,border:"none",background:"rgba(255,107,107,0.12)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Trash2 size={13} color="#ff6b6b"/>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Action buttons */}
        <button onClick={onCreate}
          style={{width:"100%",padding:"16px",borderRadius:16,border:"none",background:TEAL,color:DARK_BG,fontSize:16,fontWeight:700,fontFamily:RF,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginTop:4}}>
          <Plus size={18} color={DARK_BG} strokeWidth={2.5}/> {t("new_trip",lang)}
        </button>

        {/* OR divider */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1,height:"0.5px",background:"rgba(255,255,255,0.08)"}}/>
          <span style={{fontFamily:RF,fontSize:12,color:"rgba(255,255,255,0.2)"}}>{lang==="he"?"או":"or"}</span>
          <div style={{flex:1,height:"0.5px",background:"rgba(255,255,255,0.08)"}}/>
        </div>

        <button onClick={()=>setShowJoin(v=>!v)}
          style={{width:"100%",padding:"14px",borderRadius:16,border:"0.5px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.5)",fontSize:14,fontWeight:600,fontFamily:RF,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          <Share2 size={16} color="rgba(255,255,255,0.4)" strokeWidth={1.5}/>
          {lang==="he"?"הצטרף לטיול משותף":"Join a shared trip"}
        </button>

        {showJoin&&(
          <div style={{background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(100,223,223,0.2)",borderRadius:14,padding:"14px"}}>
            <div style={{fontSize:12,color:W35,marginBottom:8,fontFamily:RF}}>{lang==="he"?"הדבק קישור שיתוף:":"Paste share link:"}</div>
            <input value={joinLink} onChange={e=>setJoinLink(e.target.value)}
              placeholder="https://tulon.co.il/trip/..."
              dir="ltr"
              style={{width:"100%",padding:"11px 14px",borderRadius:12,border:"0.5px solid rgba(100,223,223,0.25)",background:"rgba(255,255,255,0.06)",color:"#ffffff",fontFamily:RF,fontSize:13,outline:"none",marginBottom:8}}/>
            <button onClick={handleJoin} disabled={!joinLink.trim()}
              style={{width:"100%",padding:"12px",borderRadius:12,border:"none",background:joinLink.trim()?TEAL:"rgba(255,255,255,0.1)",color:joinLink.trim()?DARK_BG:W25,fontFamily:RF,fontWeight:700,fontSize:14,cursor:joinLink.trim()?"pointer":"default"}}>
              {lang==="he"?"הצטרף":"Join"}
            </button>
          </div>
        )}

        {/* Legal footer */}
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",paddingTop:8,paddingBottom:4,marginTop:4}}>
          {[
            {href:"/privacy",label:lang==="he"?"מדיניות פרטיות":"Privacy Policy"},
            {href:"/terms",label:lang==="he"?"תנאי שימוש":"Terms"},
            {href:"/contact",label:lang==="he"?"צור קשר":"Contact"},
            {href:"/delete-account",label:lang==="he"?"מחיקת חשבון":"Delete Account"},
          ].map(l=>(
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
              style={{color:"rgba(255,255,255,0.2)",fontSize:11,textDecoration:"none",fontFamily:RF,transition:"color 0.15s"}}
              onMouseEnter={e=>(e.currentTarget.style.color="rgba(100,223,223,0.5)")}
              onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.2)")}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CURRENCY MANAGER COMPONENT ─────────────────────────────────────────────
function CurrencyManager({trip,onUpdate,allCodes,rates}){
  const{lang}=useLang();
  const tripCurrencies = trip.currencies || ["ILS","USD","EUR"];
  const[search,setSearch]=useState("");
  const[showPicker,setShowPicker]=useState(false);

  const addCurrency=code=>{
    if(tripCurrencies.includes(code))return;
    onUpdate({currencies:[...tripCurrencies,code]});
    setSearch("");setShowPicker(false);
  };
  const removeCurrency=code=>{
    if(tripCurrencies.length<=1)return;
    const next=tripCurrencies.filter(c=>c!==code);
    onUpdate({
      currencies:next,
      defaultCurrency:trip.defaultCurrency===code?next[0]:trip.defaultCurrency,
    });
  };

  // filtered search results
  const filtered=allCodes.filter(code=>{
    if(tripCurrencies.includes(code))return false;
    const label=getCurrLabel(code,lang).toLowerCase();
    const q=search.toLowerCase();
    return !q||code.toLowerCase().includes(q)||label.includes(q);
  }).slice(0,40);

  return(
    <Card>
      <h2 style={{fontFamily:RF,fontSize:20,fontWeight:700,marginBottom:4,color:"#0a3050"}}>{t("dest_currencies",lang)}</h2>
      <p style={{fontSize:12,color:W35,marginBottom:12}}>{t("dest_curr_sub",lang)}</p>

      {/* Active currencies */}
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>
        {tripCurrencies.map(code=>{
          const isDefault=trip.defaultCurrency===code;
          const rate=rates[code];
          return(
            <div key={code} onClick={()=>onUpdate({defaultCurrency:code})}
              style={{display:"flex",alignItems:"center",gap:7,padding:"9px 13px",borderRadius:14,border:`2px solid ${isDefault?C.ocean:C.sandDark}`,background:isDefault?`${C.ocean}15`:C.white,cursor:"pointer",transition:"all 0.15s"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:RF,fontSize:18,fontWeight:900,color:isDefault?C.ocean:C.dark,lineHeight:1}}>{getCurrSymbol(code)}</div>
                <div style={{fontSize:11,fontWeight:700,color:isDefault?C.ocean:C.darkMid}}>{code}</div>
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:isDefault?C.ocean:C.dark}}>{getCurrLabel(code,lang)}</div>
                {rate&&code!=="ILS"&&<div style={{fontSize:10,color:W35}}>1 {code} = ₪{rate.toFixed(3)}</div>}
                {isDefault&&<div style={{fontSize:10,color:TEAL,fontWeight:700}}>{t("dest_curr_default",lang)}</div>}
              </div>
              {tripCurrencies.length>1&&(
                <button onClick={e=>{e.stopPropagation();removeCurrency(code);}}
                  style={{background:"none",border:"none",cursor:"pointer",fontSize:15,color:W35,padding:"0 0 0 4px",lineHeight:1}}>×</button>
              )}
            </div>
          );
        })}
        <button onClick={()=>setShowPicker(p=>!p)}
          style={{padding:"9px 14px",borderRadius:14,border:`2px dashed ${C.ocean}`,background:`${C.ocean}08`,color:TEAL,fontFamily:RF,fontWeight:700,fontSize:13,cursor:"pointer"}}>
          {t("dest_curr_add",lang)}
        </button>
      </div>

      {/* Currency picker */}
      {showPicker&&(
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:"12px",border:"0.5px solid rgba(100,223,223,0.15)"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t("dest_curr_search",lang)}
            style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`2px solid ${C.sandDark}`,fontFamily:RF,fontSize:14,direction:lang==="he"?"rtl":"ltr",background:W05,outline:"none",marginBottom:10}}
            onFocus={e=>(e.target.style.borderColor=C.ocean)} onBlur={e=>(e.target.style.borderColor=C.sandDark)} autoFocus/>
          {allCodes.length===0&&(
            <div style={{textAlign:"center",color:W35,fontSize:13,padding:"8px 0"}}>
              {t("loading",lang)}
            </div>
          )}
          {/* Popular first if no search */}
          {!search&&(
            <div style={{marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:700,color:W35,marginBottom:6}}>{t("dest_curr_popular",lang)}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {["THB","GBP","JPY","AED","TRY","AUD","CAD","CHF","SGD","INR","EGP","MAD","JOD"]
                  .filter(c=>!tripCurrencies.includes(c))
                  .slice(0,10)
                  .map(code=>(
                    <button key={code} onClick={()=>addCurrency(code)}
                      style={{padding:"5px 11px",borderRadius:999,border:`1.5px solid ${C.sandDark}`,background:W05,fontFamily:RF,fontWeight:700,fontSize:12,cursor:"pointer",color:"#ffffff"}}>
                      {getCurrSymbol(code)} {code} <span style={{color:W35,fontWeight:400}}>{getCurrLabel(code,lang)}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
          {/* Search results */}
          {search&&(
            <div style={{maxHeight:180,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
              {filtered.length===0?<div style={{color:W35,fontSize:13,textAlign:"center",padding:"8px"}}>{t("exp_no_results",lang)}</div>
              :filtered.map(code=>(
                <button key={code} onClick={()=>addCurrency(code)}
                  style={{padding:"8px 12px",borderRadius:10,border:"none",background:W05,fontFamily:RF,fontSize:13,cursor:"pointer",textAlign:"right",display:"flex",alignItems:"center",gap:10,transition:"background 0.1s"}}
                  onMouseEnter={e=>(e.target.style.background=C.sandDark)} onMouseLeave={e=>(e.target.style.background=C.white)}>
                  <span style={{fontWeight:800,color:TEAL,minWidth:36}}>{getCurrSymbol(code)}</span>
                  <span style={{fontWeight:700}}>{code}</span>
                  <span style={{color:W35,fontSize:12}}>{getCurrLabel(code,lang)}</span>
                  {rates[code]&&code!=="ILS"&&<span style={{color:W35,fontSize:11,marginRight:"auto"}}>₪{rates[code].toFixed(3)}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function DestinationScreen({trip,onUpdate,onNext,allCodes,rates}){
  const{lang}=useLang();
  const valid=trip.destination&&trip.startDate&&trip.endDate&&new Date(trip.endDate)>=new Date(trip.startDate);
  const people=trip.people||[];
  const[newName,setNewName]=useState("");

  const addPerson=()=>{
    const name=newName.trim();
    if(!name)return;
    onUpdate({people:[...people,{id:uid(),name,color:PERSON_COLORS[people.length%PERSON_COLORS.length]}]});
    setNewName("");
  };
  const removePerson=id=>onUpdate({people:people.filter(p=>p.id!==id)});

  return(
    <div>
      <WaveHeader title={t("dest_title",lang)} subtitle={t("dest_subtitle",lang)}/>
      <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:16}}>
        <Card>
          <h2 style={{fontFamily:RF,fontSize:20,fontWeight:700,marginBottom:16,color:"#0a3050"}}>{t("dest_details",lang)}</h2>
          <SI label={t("dest_field",lang)} value={trip.destination} onChange={v=>onUpdate({destination:v})} placeholder={t("dest_placeholder",lang)}/>
          <SI label={t("dest_depart",lang)} value={trip.startDate} onChange={v=>onUpdate({startDate:v})} type="date"/>
          <SI label={t("dest_return",lang)}  value={trip.endDate}   onChange={v=>onUpdate({endDate:v})}   type="date" min={trip.startDate}/>
          {valid&&(
            <div style={{padding:"12px 16px",background:"rgba(100,223,223,0.08)",border:"0.5px solid rgba(100,223,223,0.2)",borderRadius:12,textAlign:"center"}}>
              <span style={{fontFamily:RF,fontSize:26,fontWeight:800,color:TEAL}}>{Math.round((new Date(trip.endDate).getTime()-new Date(trip.startDate).getTime())/86400000)+1}</span>
              <span style={{fontSize:14,fontWeight:600,color:W70,marginRight:6}}>{t("days",lang)}</span>
              <div style={{fontSize:12,color:W35,marginTop:2,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><Calendar size={11} color={W35}/>{fmtDate(trip.startDate)} – {fmtDate(trip.endDate)}</div>
            </div>
          )}
        </Card>

        <CurrencyManager trip={trip} onUpdate={onUpdate} allCodes={allCodes} rates={rates}/>

        {/* People */}
        <Card>
          <h2 style={{fontFamily:RF,fontSize:20,fontWeight:700,marginBottom:4,color:"#0a3050"}}>{t("dest_people",lang)}</h2>
          <p style={{fontSize:13,color:W35,marginBottom:14}}>{t("dest_people_sub",lang)}</p>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder={t("dest_people_ph",lang)} onKeyDown={e=>e.key==="Enter"&&addPerson()}
              style={{flex:1,padding:"10px 14px",borderRadius:12,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:RF,fontSize:14,direction:"rtl",background:W07,color:"#ffffff",outline:"none"}}
              onFocus={e=>(e.target.style.borderColor=C.ocean)} onBlur={e=>(e.target.style.borderColor=C.sandDark)}/>
            <button onClick={addPerson} style={{padding:"10px 16px",borderRadius:12,border:"none",background:TEAL,color:DARK_BG,cursor:"pointer",display:"flex",alignItems:"center"}}><Plus size={16} color={DARK_BG} strokeWidth={2.5}/></button>
          </div>
          {people.length===0?(
            <div style={{textAlign:"center",color:W35,padding:"12px 0",fontSize:13}}>{t("dest_solo",lang)}</div>
          ):(
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {people.map(p=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:14,background:p.color+"15",border:`0.5px solid ${p.color}40`}}>
                  <div style={{width:34,height:34,borderRadius:10,background:p.color+"22",border:`0.5px solid ${p.color}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:14,fontWeight:800,color:p.color}}>{p.name[0]}</span>
                  </div>
                  <span style={{fontSize:13,fontWeight:700,color:"#ffffff"}}>{p.name}</span>
                  <button onClick={()=>removePerson(p.id)} style={{background:"none",border:"none",cursor:"pointer",padding:"2px",display:"flex",alignItems:"center",marginRight:"auto"}}><X size={13} color={W35}/></button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Display currency selector */}
        <Card>
          <h2 style={{fontFamily:RF,fontSize:18,fontWeight:700,marginBottom:4,color:"rgba(255,255,255,0.85)"}}>💱 {lang==="he"?"מטבע תצוגה":"Display Currency"}</h2>
          <p style={{fontSize:12,color:W35,marginBottom:12,fontFamily:RF}}>{lang==="he"?"סיכומים, סה\"כ והתחשבנות יוצגו במטבע זה":"Totals, summaries and settlement shown in this currency"}</p>
          <div style={{display:"flex",gap:8}}>
            {[{code:"ILS",label:"₪ שקל",labelEn:"₪ ILS"},{code:"USD",label:"$ דולר",labelEn:"$ USD"},{code:"EUR",label:"€ יורו",labelEn:"€ EUR"}].map(({code,label,labelEn})=>{
              const active=(trip.displayCurrency||"ILS")===code;
              return(
                <button key={code} onClick={()=>onUpdate({displayCurrency:code})}
                  style={{flex:1,padding:"10px 6px",borderRadius:12,border:`1.5px solid ${active?"#64dfdf":"rgba(100,223,223,0.2)"}`,background:active?"rgba(100,223,223,0.15)":"rgba(255,255,255,0.03)",color:active?TEAL:W35,fontFamily:RF,fontWeight:700,fontSize:14,cursor:"pointer",transition:"all 0.15s"}}>
                  {lang==="he"?label:labelEn}
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 style={{fontFamily:RF,fontSize:18,fontWeight:700,marginBottom:14,color:"rgba(255,255,255,0.85)"}}>{t("dest_budget",lang)}</h2>
          <p style={{fontSize:12,color:W35,marginBottom:12,fontFamily:RF}}>{t("dest_budget_sub",lang)}</p>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <input type="number" value={trip.budget||""} onChange={e=>onUpdate({budget:e.target.value?parseFloat(e.target.value):null})}
              placeholder={t("dest_budget_ph",lang)}
              style={{flex:1,padding:"11px 14px",borderRadius:12,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:RF,fontSize:15,color:"#ffffff",background:W07,outline:"none",direction:"ltr"}}
              onFocus={e=>(e.target.style.borderColor=TEAL)} onBlur={e=>(e.target.style.borderColor=TBB)}/>
            <span style={{color:W50,fontFamily:RF,fontSize:15,flexShrink:0}}>{symFor(trip.displayCurrency||"ILS")}</span>
          </div>
          {trip.budget>0&&<div style={{fontSize:12,color:TEAL,marginTop:8,fontFamily:RF}}>{t("dest_budget_set",lang)}: {symFor(trip.displayCurrency||"ILS")}{parseFloat(trip.budget).toLocaleString()}</div>}
        </Card>

        <Btn onClick={onNext} disabled={!valid} style={{width:"100%",fontSize:17,padding:"16px",borderRadius:16,boxShadow:valid?`0 6px 20px ${C.ocean}40`:"none"}}>
          {t("dest_next",lang)}
        </Btn>
      </div>
    </div>
  );
}

const mkForm=(dates,cur,people=[])=>({category:"food",amount:"",currency:cur||"ILS",description:"",paid:false,date:dates[0]||"",checkIn:dates[0]||"",checkOut:dates[1]||dates[0]||"",flightNumber:"",departureTime:"",landingTime:"",time:"",timeEnd:"",address:"",reminderHours:5,paidBy:"",splitWith:[],splitType:"equal",isShared:true,participants:people.map(p=>p.id),payers:[]});

function ExpensesScreen({trip,expenses,onAdd,onEdit,onTogglePaid,onDelete,toILS,rates,ratesInfo}){
  const{lang}=useLang();
  const dates=getRange(trip.startDate,trip.endDate);
  const people=trip.people||[];
  const[sel,setSel]=useState(dates[0]||"");
  const[form,setForm]=useState(()=>mkForm(dates,trip.defaultCurrency,trip.people||[]));
  const[show,setShow]=useState(false);
  const[editId,setEditId]=useState(null); // expense being edited
  // search & filter
  const[search,setSearch]=useState("");
  const[filterCat,setFilterCat]=useState("all");
  const[filterPaid,setFilterPaid]=useState("all");
  const[showFilters,setShowFilters]=useState(false);
  const[scanning,setScanning]=useState(false);
  const[scanMsg,setScanMsg]=useState(null); // {type:"ok"|"err", text}

  const set=p=>setForm(f=>({...f,...p}));

  const handleScan=async(file)=>{
    if(!file)return;
    setScanning(true);setScanMsg(null);
    try{
      const reader=new FileReader();
      reader.onload=async(ev)=>{
        const dataUrl=ev.target.result;
        const base64=dataUrl.split(",")[1];
        const mediaType=file.type||"image/jpeg";
        const res=await fetch("/api/scan-receipt",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({imageBase64:base64,mediaType,lang,currencies:trip.currencies||["ILS"]}),
        });
        const data=await res.json();
        if(!res.ok||data.error){
          setScanMsg({type:"err",text:t("scan_error",lang)});
          setScanning(false);
          return;
        }
        // Pre-fill form and open it
        const patch={};
        if(data.amount)     patch.amount=String(data.amount);
        if(data.currency&&(trip.currencies||["ILS"]).includes(data.currency)) patch.currency=data.currency;
        if(data.description) patch.description=data.description;
        if(data.category)    patch.category=data.category;
        if(data.date&&dates.includes(data.date)) patch.date=data.date;
        else patch.date=sel;
        if(data.category==="hotel"){ patch.checkIn=patch.date||sel; patch.checkOut=patch.date||sel; }
        set(patch);
        setScanMsg({type:"ok",text:t("scan_success",lang)});
        setShow(true);
        setScanning(false);
      };
      reader.readAsDataURL(file);
    }catch(e){
      setScanMsg({type:"err",text:t("scan_error",lang)});
      setScanning(false);
    }
  };

  const toggleSplitPerson=id=>{
    const sw=form.splitWith.includes(id)?form.splitWith.filter(x=>x!==id):[...form.splitWith,id];
    set({splitWith:sw});
  };
  const toggleParticipant=id=>set({participants:form.participants.includes(id)?form.participants.filter(x=>x!==id):[...form.participants,id]});
  const addPayer=()=>set({payers:[...form.payers,{id:"",amount:""}]});
  const removePayer=i=>set({payers:form.payers.filter((_,j)=>j!==i)});
  const updatePayer=(i,field,val)=>set({payers:form.payers.map((p,j)=>j===i?{...p,[field]:val}:p)});

  const handleAdd=()=>{
    if(!form.amount)return;
    const date=form.category==="hotel"?form.checkIn:form.date;
    onAdd({id:uid(),...form,date,amount:parseFloat(form.amount),amountILS:toILS(parseFloat(form.amount),form.currency),amountILSLocked:form.paid?toILS(parseFloat(form.amount),form.currency):undefined});
    setForm(mkForm(dates,trip.defaultCurrency,people));
    setShow(false);
    setEditId(null);
  };

  const handleEdit=(exp)=>{
    // Derive participants & payers: support new format, fall back to old paidBy/splitWith
    const expParticipants=exp.participants?.length>0
      ?exp.participants
      :exp.paidBy?[exp.paidBy,...(exp.splitWith||[])]:people.map(p=>p.id);
    const expPayers=exp.payers?.length>0
      ?exp.payers
      :exp.paidBy?[{id:exp.paidBy,amount:exp.amountILS}]:[];
    setForm({
      category:exp.category,amount:String(exp.amount),currency:exp.currency,
      description:exp.description||"",paid:exp.paid,date:exp.date,
      checkIn:exp.checkIn||"",checkOut:exp.checkOut||"",
      flightNumber:exp.flightNumber||"",departureTime:exp.departureTime||"",landingTime:exp.landingTime||"",
      time:exp.time||"",timeEnd:exp.timeEnd||"",
      address:exp.address||"",reminderHours:exp.reminderHours||5,
      paidBy:exp.paidBy||"",splitWith:exp.splitWith||[],
      splitType:exp.splitType||"equal",isShared:exp.isShared!==false,
      participants:expParticipants,payers:expPayers,
    });
    setEditId(exp.id);
    setShow(true);
    setSel(exp.date||exp.checkIn||sel);
  };

  const handleSaveEdit=()=>{
    if(!form.amount)return;
    const date=form.category==="hotel"?form.checkIn:form.date;
    onEdit(editId,{...form,date,amount:parseFloat(form.amount),amountILS:toILS(parseFloat(form.amount),form.currency)});
    setForm(mkForm(dates,trip.defaultCurrency,people));
    setShow(false);
    setEditId(null);
  };

  // all expenses for selected day (for display in list)
  const dayExp=expenses.filter(e=>e.category==="hotel"?e.checkIn<=sel&&e.checkOut>=sel:e.date===sel);

  // filtered for search view
  const allFiltered=useMemo(()=>{
    return expenses.filter(e=>{
      const matchSearch=!search||(e.description||"").includes(search)||(CATS.find(c=>c.id===e.category)?.label||"").includes(search);
      const matchCat=filterCat==="all"||e.category===filterCat;
      const matchPaid=filterPaid==="all"||(filterPaid==="paid"&&e.paid)||(filterPaid==="unpaid"&&!e.paid);
      return matchSearch&&matchCat&&matchPaid;
    });
  },[expenses,search,filterCat,filterPaid]);

  const isFiltering=search||filterCat!=="all"||filterPaid!=="all";
  const sym=code=>getCurrSymbol(code);
  const personName=id=>people.find(p=>p.id===id)?.name||"";
  const personColor=id=>people.find(p=>p.id===id)?.color||C.muted;

  const ExpenseRow=({exp})=>{
    const cat=CATS.find(c=>c.id===exp.category);
    return(
      <div onClick={()=>handleEdit(exp)}
        style={{background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"14px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"background 0.15s"}}
        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.07)"}
        onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}>
        {/* Icon + paid badge — RTL start (physical RIGHT) */}
        <div style={{position:"relative",flexShrink:0}}>
          <div style={{width:46,height:46,borderRadius:13,background:cat?.bg||W05,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {cat?.Icon?<cat.Icon size={22} color={cat?.color} strokeWidth={1.5}/>:<Package size={22} color={W35} strokeWidth={1.5}/>}
          </div>
          <div onClick={e=>{e.stopPropagation();onTogglePaid(exp.id);}}
            style={{position:"absolute",bottom:-3,right:-3,width:17,height:17,borderRadius:5,background:exp.paid?"#4ade80":"#ff6b6b",border:"2.5px solid #0d2137",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            {exp.paid?<Check size={8} color="#0d2137" strokeWidth={3}/>:<X size={8} color="#0d2137" strokeWidth={3}/>}
          </div>
        </div>
        {/* Text — middle */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,fontSize:14,color:"#ffffff",fontFamily:RF}}>{catLabel(cat?.id,lang)}</div>
          {exp.description&&<div style={{fontSize:12,color:W40,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{exp.description}</div>}
          {exp.payers?.length>0&&(
            <div style={{marginTop:4,display:"flex",gap:4,flexWrap:"wrap"}}>
              {exp.payers.map((py,i)=>(
                <span key={i} style={{fontSize:10,background:personColor(py.id)+"25",color:personColor(py.id),borderRadius:6,padding:"2px 6px",fontWeight:700,display:"inline-flex",alignItems:"center",gap:3}}>
                  <Wallet size={8} strokeWidth={2}/>{personName(py.id)}
                </span>
              ))}
            </div>
          )}
        </div>
        {/* Amount + delete — RTL end (physical LEFT) */}
        <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
          <div style={{fontWeight:700,fontSize:17,color:"#ffffff",fontFamily:RF,letterSpacing:"-0.3px"}}>{fmtAmt(exp.amountILS,trip.displayCurrency||"ILS",rates)}</div>
          <button onClick={e=>{e.stopPropagation();onDelete(exp.id);}}
            style={{padding:"3px 7px",borderRadius:6,border:"none",background:"rgba(255,107,107,0.1)",cursor:"pointer",display:"flex",alignItems:"center"}}>
            <Trash2 size={11} color="#ff6b6b"/>
          </button>
        </div>
      </div>
    );
  };

  const nights=trip.startDate&&trip.endDate?Math.round((new Date(trip.endDate).getTime()-new Date(trip.startDate).getTime())/86400000)+1:0;
  const totalILS=expenses.reduce((s,e)=>s+e.amountILS,0);

  return(
    <div>
      <WaveHeader title={t("exp_title",lang)}
        subtitle={trip.destination?`${trip.destination}${nights>0?` · ${nights} ${t("days",lang)}`:""}`:""}
        action={
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>document.getElementById("receipt-input").click()} disabled={scanning}
              style={{width:36,height:36,borderRadius:10,border:"0.5px solid rgba(255,255,255,0.15)",background:scanning?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",cursor:scanning?"default":"pointer",opacity:scanning?0.5:1}}>
              {scanning?<Loader size={16} color={W40} strokeWidth={1.5} style={{animation:"spin 1s linear infinite"}}/>:<Search size={16} color={W40} strokeWidth={1.5}/>}
            </button>
            <button onClick={()=>{setForm(f=>({...mkForm(dates,trip.defaultCurrency,people),date:dates[0]||"",checkIn:dates[0]||""}));setShow(true);setEditId(null);}}
              style={{width:36,height:36,borderRadius:10,border:"0.5px solid rgba(100,223,223,0.3)",background:"rgba(100,223,223,0.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
              <Plus size={18} color={TEAL} strokeWidth={2.5}/>
            </button>
          </div>
        }
      />

      {/* hidden file input for camera */}
      <input id="receipt-input" type="file" accept="image/*" capture="environment"
        style={{display:"none"}}
        onChange={e=>{const f=e.target.files?.[0];e.target.value="";if(f)handleScan(f);}}/>

      {/* Total card */}
      <div style={{margin:"14px 16px 0",padding:"16px 18px",background:"rgba(100,223,223,0.06)",border:"0.5px solid rgba(100,223,223,0.2)",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:12,color:W40,fontFamily:RF}}>{lang==="he"?"סה\"כ הוצאות":"Total expenses"}</div>
        <div style={{fontSize:22,fontWeight:800,color:TEAL,letterSpacing:"-0.5px",fontFamily:RF}}>{fmtAmt(totalILS,trip.displayCurrency||"ILS",rates)}</div>
      </div>

      {/* Category filter tabs — always visible */}
      <div style={{padding:"12px 16px 4px",display:"flex",gap:8,overflowX:"auto",scrollbarWidth:"none"}}>
        <style>{`.exp-tabs::-webkit-scrollbar{display:none}`}</style>
        {[{id:"all",label:lang==="he"?"הכל":"All",Icon:null,color:TEAL,bg:"rgba(100,223,223,0.12)"},...CATS].map(cat=>{
          const isActive=filterCat===cat.id;
          const color=cat.color||TEAL;
          const bg=cat.bg||"rgba(100,223,223,0.12)";
          return(
            <button key={cat.id} onClick={()=>setFilterCat(cat.id)}
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"10px 13px",borderRadius:14,
                border:`0.5px solid ${isActive?color+"80":"rgba(255,255,255,0.08)"}`,
                background:isActive?bg:"rgba(255,255,255,0.04)",
                flexShrink:0,cursor:"pointer",
                boxShadow:isActive?`0 0 14px ${color}30`:"none",
                transition:"all 0.15s"}}>
              {cat.Icon?<cat.Icon size={20} color={isActive?color:W35} strokeWidth={1.5}/>:<Receipt size={20} color={isActive?TEAL:W35} strokeWidth={1.5}/>}
              <span style={{fontFamily:RF,fontSize:10,fontWeight:700,color:isActive?color:W35,whiteSpace:"nowrap"}}>{cat.label||(lang==="he"?"הכל":"All")}</span>
            </button>
          );
        })}
      </div>

      {scanMsg&&(
        <div style={{margin:"8px 16px 0",borderRadius:10,padding:"8px 14px",fontSize:12,fontFamily:RF,
          background:scanMsg.type==="ok"?"rgba(74,222,128,0.1)":"rgba(255,107,107,0.1)",
          border:`0.5px solid ${scanMsg.type==="ok"?"rgba(74,222,128,0.4)":"rgba(255,107,107,0.4)"}`,
          color:scanMsg.type==="ok"?"#4ade80":"#ff6b6b"}}>
          {scanMsg.text}
        </div>
      )}

      <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:10}}>
        {/* hidden date selector kept for form */}
        <div style={{display:"none"}}>
          <select value={sel} onChange={e=>setSel(e.target.value)}>{dates.map(d=><option key={d} value={d}>{d}</option>)}</select>
        </div>

            {show&&(
              <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.65)",zIndex:1000,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}
                onClick={e=>{if(e.target===e.currentTarget){setShow(false);setEditId(null);}}}>
                <div style={{background:"#0d2137",borderRadius:"24px 24px 0 0",maxHeight:"92vh",overflowY:"auto",direction:"rtl",fontFamily:RF}}>
                  {/* Handle */}
                  <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px"}}>
                    <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,0.18)"}}/>
                  </div>
                  {/* Sheet header */}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 20px 16px"}}>
                    <button onClick={()=>{setShow(false);setEditId(null);}}
                      style={{width:32,height:32,borderRadius:10,border:"none",background:"rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                      <X size={17} color={W50} strokeWidth={2}/>
                    </button>
                    <div style={{fontSize:17,fontWeight:700,color:"#ffffff"}}>{editId?t("exp_edit",lang):t("exp_new",lang)}</div>
                    <div style={{width:32}}/>
                  </div>

                  <div style={{padding:"0 20px 32px"}}>

                {/* category */}
                <div style={{marginBottom:18}}>
                  <div style={{fontSize:11,fontWeight:600,color:W40,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:10}}>{t("exp_category",lang)}</div>
                  <div style={{display:"flex",gap:8,overflowX:"auto",scrollbarWidth:"none",paddingBottom:4}}>
                    {CATS.map(cat=>{
                      const isActive=form.category===cat.id;
                      return(
                        <button key={cat.id} onClick={()=>set({category:cat.id})}
                          style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"10px 14px",borderRadius:16,flexShrink:0,
                            border:`1.5px solid ${isActive?cat.color:"rgba(255,255,255,0.1)"}`,
                            background:isActive?cat.bg:"rgba(255,255,255,0.04)",cursor:"pointer",
                            boxShadow:isActive?`0 0 16px ${cat.color}30`:"none",transition:"all 0.15s"}}>
                          <div style={{width:38,height:38,borderRadius:12,background:isActive?cat.bg:"rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                            <cat.Icon size={20} color={isActive?cat.color:W35} strokeWidth={1.5}/>
                          </div>
                          <span style={{fontSize:11,fontWeight:700,color:isActive?cat.color:W35,whiteSpace:"nowrap"}}>{catLabel(cat.id,lang)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hotel */}
                {form.category==="hotel"&&(
                  <div style={{marginBottom:14,padding:"12px",background:`${C.oceanLight}12`,borderRadius:14,border:`1.5px solid ${C.oceanLight}40`}}>
                    <div style={{fontWeight:700,fontSize:13,color:"#0a3050",marginBottom:10}}>{t("hotel_dates",lang)}</div>
                    <SI label={t("hotel_checkin",lang)}  value={form.checkIn}  onChange={v=>set({checkIn:v})}  type="date" min={trip.startDate} max={trip.endDate}/>
                    <SI label={t("hotel_checkout",lang)} value={form.checkOut} onChange={v=>set({checkOut:v})} type="date" min={form.checkIn}  max={trip.endDate}/>
                    {form.checkIn&&form.checkOut&&form.checkOut>form.checkIn&&(
                      <div style={{fontSize:12,color:TEAL,fontWeight:700,marginTop:-8,marginBottom:6,display:"flex",alignItems:"center",gap:5}}><Moon size={12} color={TEAL} strokeWidth={1.5}/> {Math.round((new Date(form.checkOut).getTime()-new Date(form.checkIn).getTime())/86400000)} {t("nights",lang)}</div>
                    )}
                    <div style={{fontSize:11,color:W35}}>{t("hotel_total",lang)}</div>
                  </div>
                )}

                {/* Flight */}
                {form.category==="flight"&&(
                  <div style={{marginBottom:14,padding:"12px",background:`${C.ocean}0D`,borderRadius:14,border:`1.5px solid ${C.ocean}30`}}>
                    <div style={{fontWeight:700,fontSize:13,color:"#0a3050",marginBottom:10}}>{t("flight_details",lang)}</div>
                    <SI label={t("flight_number",lang)} value={form.flightNumber} onChange={v=>set({flightNumber:v.toUpperCase()})} placeholder={t("flight_number_ph",lang)}/>
                    <div style={{display:"flex",gap:10}}>
                      <div style={{flex:1}}><SI label={t("flight_depart",lang)} value={form.departureTime} onChange={v=>set({departureTime:v})} type="time"/></div>
                      <div style={{flex:1}}><SI label={t("flight_landing",lang)} value={form.landingTime} onChange={v=>set({landingTime:v})} type="time"/></div>
                    </div>
                    <SS label={t("flight_date",lang)} value={form.date} onChange={v=>set({date:v})}>
                      {dates.map(d=><option key={d} value={d}>{fmtDate(d)}</option>)}
                    </SS>
                    {form.departureTime&&(
                      <div style={{marginBottom:14}}>
                        <label style={{display:"block",fontWeight:500,fontSize:12,marginBottom:8,color:W40,letterSpacing:"0.5px",textTransform:"uppercase"}}>{t("flight_reminder",lang)}</label>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                          {[2,3,4,5,6,8].map(h=>(
                            <button key={h} onClick={()=>set({reminderHours:h})}
                              style={{padding:"6px 12px",borderRadius:8,border:`0.5px solid ${(form.reminderHours||5)===h?TEAL:TBB}`,background:(form.reminderHours||5)===h?TBL:W05,color:(form.reminderHours||5)===h?TEAL:W40,fontFamily:RF,fontWeight:600,fontSize:12,cursor:"pointer"}}>
                              {h} {t("flight_hours",lang)}
                            </button>
                          ))}
                        </div>
                        {remTime(form.departureTime,form.reminderHours||5)&&(
                          <div style={{fontSize:11,color:"#ff6b6b",fontWeight:600}}>{t("flight_reminder_at",lang)}{remTime(form.departureTime,form.reminderHours||5)}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Amount */}
                <div style={{display:"flex",gap:10}}>
                  <div style={{flex:2}}><SI label={t("exp_amount",lang)} value={form.amount} onChange={v=>set({amount:v})} type="number" placeholder="0" min="0"/></div>
                  <div style={{flex:1}}><SS label={t("exp_currency",lang)} value={form.currency} onChange={v=>set({currency:v})}>{(trip.currencies||["ILS","USD","EUR"]).map(code=><option key={code} value={code}>{getCurrSymbol(code)} {code} – {getCurrLabel(code,lang)}</option>)}</SS></div>
                </div>
                {form.amount&&<div style={{marginBottom:12,padding:"9px 12px",background:`${C.palm}15`,borderRadius:10,fontSize:13,color:"#6ee7a0",fontWeight:700}}>≈ {toILS(parseFloat(form.amount)||0,form.currency).toFixed(2)} ₪</div>}

                <SI label={t("exp_desc",lang)} value={form.description} onChange={v=>set({description:v})} placeholder={t("exp_desc_ph",lang)}/>
                {["hotel","attraction","food","other"].includes(form.category)&&(
                  <SI label={t("exp_address",lang)} value={form.address||""} onChange={v=>set({address:v})} placeholder="e.g. 123 Sukhumvit Rd, Bangkok"/>
                )}

                {form.category!=="hotel"&&form.category!=="flight"&&(
                  <div style={{marginBottom:14}}>
                    <div style={{display:"flex",gap:10}}>
                      <div style={{flex:1}}>
                        <label style={{display:"block",fontWeight:500,fontSize:12,marginBottom:6,color:W40,letterSpacing:"0.5px",textTransform:"uppercase"}}>{t("exp_time",lang)}</label>
                        <input type="time" value={form.time} onChange={e=>set({time:e.target.value})}
                          style={{width:"100%",padding:"11px 14px",borderRadius:12,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:RF,fontSize:15,color:"#ffffff",background:W07,outline:"none"}}
                          onFocus={e=>(e.target.style.borderColor=TEAL)} onBlur={e=>(e.target.style.borderColor=TBB)}/>
                      </div>
                      <div style={{flex:1}}>
                        <label style={{display:"block",fontWeight:500,fontSize:12,marginBottom:6,color:W40,letterSpacing:"0.5px",textTransform:"uppercase"}}>{t("exp_time_end",lang)}</label>
                        <input type="time" value={form.timeEnd} onChange={e=>set({timeEnd:e.target.value})}
                          style={{width:"100%",padding:"11px 14px",borderRadius:12,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:RF,fontSize:15,color:"#ffffff",background:W07,outline:"none"}}
                          onFocus={e=>(e.target.style.borderColor=TEAL)} onBlur={e=>(e.target.style.borderColor=TBB)}/>
                      </div>
                    </div>
                    {form.time&&form.timeEnd&&form.timeEnd>form.time&&(
                      <div style={{fontSize:11,color:TEAL,fontWeight:600,marginTop:6,display:"flex",alignItems:"center",gap:4}}>
                        <Clock size={11} color={TEAL} strokeWidth={2}/> {(()=>{const[sh,sm]=form.time.split(":").map(Number);const[eh,em]=form.timeEnd.split(":").map(Number);const diff=(eh*60+em)-(sh*60+sm);const h=Math.floor(diff/60),m=diff%60;return h>0?`${h}${lang==="he"?"ש׳":"h"} ${m>0?`${m}${lang==="he"?"ד׳":"m"}`:""}`.trim():`${m}${lang==="he"?"ד׳":"m"}`;})()}
                      </div>
                    )}
                  </div>
                )}

                {form.category!=="hotel"&&form.category!=="flight"&&(
                  <SS label={t("exp_date",lang)} value={form.date} onChange={v=>set({date:v})}>
                    {dates.map(d=><option key={d} value={d}>{fmtDate(d)}</option>)}
                  </SS>
                )}

                {/* People split – only if people defined and isShared */}
                {people.length>0&&form.isShared&&(
                  <div style={{marginBottom:14,padding:"14px",background:"rgba(167,139,250,0.06)",borderRadius:14,border:"1.5px solid rgba(167,139,250,0.2)"}}>
                    {/* Who participates */}
                    <div style={{fontWeight:700,fontSize:13,color:"#a78bfa",marginBottom:8,display:"flex",alignItems:"center",gap:6}}><Users size={13} strokeWidth={2}/>{lang==="he"?"מי משתתף?":"Who participates?"}</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:14}}>
                      {people.map(p=>{
                        const inPart=form.participants.includes(p.id);
                        return(
                          <button key={p.id} onClick={()=>toggleParticipant(p.id)}
                            style={{padding:"7px 14px",borderRadius:999,border:`2px solid ${inPart?p.color:"rgba(255,255,255,0.15)"}`,background:inPart?p.color+"22":"transparent",color:inPart?p.color:"rgba(255,255,255,0.4)",fontFamily:RF,fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.15s"}}>
                            {inPart?"✓ ":""}{p.name}
                          </button>
                        );
                      })}
                    </div>
                    {/* Who paid */}
                    <div style={{fontWeight:700,fontSize:13,color:"#a78bfa",marginBottom:8,display:"flex",alignItems:"center",gap:6}}><Wallet size={13} strokeWidth={2}/>{lang==="he"?"מי שילם?":"Who paid?"}</div>
                    {form.payers.map((payer,i)=>{
                      const pc=people.find(p=>p.id===payer.id)?.color||"rgba(255,255,255,0.3)";
                      return(
                        <div key={i} style={{display:"flex",gap:6,alignItems:"center",marginBottom:7}}>
                          <select value={payer.id} onChange={e=>updatePayer(i,"id",e.target.value)}
                            style={{flex:1,padding:"8px 10px",borderRadius:10,border:`1.5px solid ${payer.id?pc:"rgba(255,255,255,0.15)"}`,background:"rgba(0,0,0,0.2)",color:"#ffffff",fontFamily:RF,fontSize:13,outline:"none",cursor:"pointer"}}>
                            <option value="">{lang==="he"?"בחר...":"Select..."}</option>
                            {people.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                          <div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(0,0,0,0.2)",border:"1.5px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"0 10px",flex:1}}>
                            <span style={{color:"rgba(255,255,255,0.3)",fontSize:13}}>₪</span>
                            <input type="number" value={payer.amount} onChange={e=>updatePayer(i,"amount",e.target.value)}
                              placeholder="0" style={{flex:1,border:"none",background:"transparent",color:"#ffffff",fontFamily:RF,fontSize:13,outline:"none",padding:"8px 0"}}/>
                          </div>
                          <button onClick={()=>removePayer(i)} style={{background:"rgba(255,107,107,0.12)",border:"none",color:"#ff6b6b",borderRadius:8,padding:"8px 10px",cursor:"pointer",fontSize:13,flexShrink:0}}>✕</button>
                        </div>
                      );
                    })}
                    <button onClick={addPayer}
                      style={{width:"100%",padding:"8px",borderRadius:10,border:"1px dashed rgba(167,139,250,0.4)",background:"rgba(167,139,250,0.05)",color:"#a78bfa",fontFamily:RF,fontWeight:600,fontSize:13,cursor:"pointer",marginBottom:form.payers.length>0?8:0}}>
                      + {lang==="he"?"הוסף משלם":"Add payer"}
                    </button>
                    {/* Total validation */}
                    {form.payers.length>0&&form.amount&&(()=>{
                      const totalPaid=form.payers.reduce((s,p)=>s+parseFloat(p.amount||0),0);
                      const expAmt=toILS(parseFloat(form.amount),form.currency);
                      const diff=Math.abs(totalPaid-expAmt);
                      const ok=diff<1;
                      return(
                        <div style={{fontSize:12,color:ok?"#4ade80":"#fbbf24",fontFamily:RF,marginTop:4,textAlign:"center"}}>
                          {ok?"✓ ":"⚠️ "}{lang==="he"?"שולם":"Paid"}: ₪{totalPaid.toFixed(0)} / ₪{expAmt.toFixed(0)}
                          {!ok&&<span style={{opacity:0.7}}> ({lang==="he"?"הפרש":"diff"}: ₪{diff.toFixed(0)})</span>}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Shared / Personal toggle */}
                <div style={{display:"flex",gap:8,marginBottom:12}}>
                  <button onClick={()=>set({isShared:false})}
                    style={{flex:1,padding:"11px 10px",borderRadius:13,border:`0.5px solid ${!form.isShared?"#a78bfa":W12}`,background:!form.isShared?"rgba(167,139,250,0.12)":"rgba(255,255,255,0.04)",color:!form.isShared?"#a78bfa":W35,fontFamily:RF,fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    <Backpack size={14} color={!form.isShared?"#a78bfa":W35} strokeWidth={1.5}/>{t("exp_personal",lang)}
                  </button>
                  <button onClick={()=>set({isShared:true})}
                    style={{flex:1,padding:"11px 10px",borderRadius:13,border:`0.5px solid ${form.isShared?TEAL:W12}`,background:form.isShared?TBL:"rgba(255,255,255,0.04)",color:form.isShared?TEAL:W35,fontFamily:RF,fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    <Users size={14} color={form.isShared?TEAL:W35} strokeWidth={1.5}/>{t("exp_shared",lang)}
                  </button>
                </div>
                <button onClick={()=>set({paid:!form.paid})} style={{width:"100%",padding:"11px",borderRadius:12,border:`0.5px solid ${form.paid?'#4ade80':'rgba(255,255,255,0.15)'}`,background:form.paid?'rgba(74,222,128,0.1)':'rgba(255,255,255,0.05)',color:form.paid?'#4ade80':'rgba(255,255,255,0.4)',fontFamily:RF,fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  {form.paid?<><Check size={14} color="#4ade80" strokeWidth={2.5}/>{t("exp_paid",lang)}</>:<><X size={14} color="rgba(255,255,255,0.4)" strokeWidth={2}/>{t("exp_unpaid",lang)}</>}
                </button>
                <button onClick={editId?handleSaveEdit:handleAdd}
                  style={{width:"100%",padding:"15px",borderRadius:14,border:"none",background:TEAL,color:DARK_BG,fontFamily:RF,fontWeight:700,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  <Check size={18} color={DARK_BG} strokeWidth={2.5}/>{editId?t("save",lang):t("exp_new",lang)}
                </button>

                  </div>
                </div>
              </div>
            )}

            {allFiltered.length===0
              ?(<div style={{textAlign:"center",color:W25,padding:"28px 0",fontSize:14,fontFamily:RF}}>
                  <Wallet size={36} color="rgba(255,255,255,0.1)" strokeWidth={1} style={{margin:"0 auto 10px",display:"block"}}/>
                  {t("exp_none",lang)}
                </div>)
              :allFiltered.map(exp=><ExpenseRow key={exp.id} exp={exp}/>)
            }
          </div>
    </div>
  );
}

function BudgetScreen({trip,expenses,rates={}}){
  const{lang}=useLang();
  const dc=trip.displayCurrency||"ILS";
  const sym=symFor(dc);
  const fmt=(amt,dec=0)=>`${sym}${fromILS(amt,dc,rates).toFixed(dec)}`;
  const fmtN=(amt)=>fromILS(amt,dc,rates); // numeric only
  const people=trip.people||[];
  const sharedExp=expenses.filter(e=>e.isShared!==false);
  const personalExp=expenses.filter(e=>e.isShared===false);
  const total=expenses.reduce((s,e)=>s+e.amountILS,0);
  const totalShared=sharedExp.reduce((s,e)=>s+e.amountILS,0);
  const totalPersonal=personalExp.reduce((s,e)=>s+e.amountILS,0);
  const paid=expenses.filter(e=>e.paid).reduce((s,e)=>s+e.amountILS,0);
  const unpaid=total-paid;
  const byCat=CATS.map(cat=>{const ce=expenses.filter(e=>e.category===cat.id);return{...cat,total:ce.reduce((s,e)=>s+e.amountILS,0),count:ce.length};}).filter(c=>c.count>0);
  const pieData=byCat.map(c=>({label:catLabel(c.id,lang),value:c.total,color:c.color,icon:c.icon}));

  // Settlement calculation
  const settlement=useMemo(()=>{
    if(people.length<2)return[];
    const balances={};
    people.forEach(p=>balances[p.id]=0);
    // Only shared expenses enter settlement
    expenses.filter(e=>e.isShared!==false).forEach(exp=>{
      // New format: participants + payers
      if(exp.participants?.length>0&&exp.payers?.length>0){
        const parts=exp.participants.filter(id=>balances[id]!==undefined);
        if(parts.length===0)return;
        const share=exp.amountILS/parts.length;
        parts.forEach(id=>{ balances[id]=(balances[id]||0)-share; });
        exp.payers.forEach(({id,amount})=>{ if(balances[id]!==undefined) balances[id]=(balances[id]||0)+parseFloat(amount||0); });
      }
      // Old format: paidBy + splitWith
      else if(exp.paidBy){
        const participants=[exp.paidBy,...(exp.splitWith||[])];
        if(participants.length<2)return;
        const share=exp.amountILS/participants.length;
        balances[exp.paidBy]=(balances[exp.paidBy]||0)+exp.amountILS-share;
        (exp.splitWith||[]).forEach(id=>{ balances[id]=(balances[id]||0)-share; });
      }
    });
    const debts=[];
    const pos=people.filter(p=>balances[p.id]>0.01).map(p=>({...p,bal:balances[p.id]}));
    const neg=people.filter(p=>balances[p.id]<-0.01).map(p=>({...p,bal:balances[p.id]}));
    pos.sort((a,b)=>b.bal-a.bal); neg.sort((a,b)=>a.bal-b.bal);
    let i=0,j=0;
    while(i<pos.length&&j<neg.length){
      const amt=Math.min(pos[i].bal,-neg[j].bal);
      if(amt>0.01)debts.push({from:neg[j],to:pos[i],amount:amt});
      pos[i].bal-=amt; neg[j].bal+=amt;
      if(Math.abs(pos[i].bal)<0.01)i++;
      if(Math.abs(neg[j].bal)<0.01)j++;
    }
    return debts;
  },[expenses,people]);

  // PDF export
  const handlePDF=()=>exportTripPDF(trip,expenses,lang);

  const budgetRemaining=trip.budget>0?trip.budget-total:null;
  const budgetPct=trip.budget>0?Math.min((total/trip.budget)*100,100):0;
  const barColor=budgetPct<70?"#4ade80":budgetPct<90?"#fbbf24":"#ff6b6b";

  return(
    <div>
      <WaveHeader title={t("budget_title",lang)}
        subtitle={trip.destination?`${trip.destination}${trip.startDate&&trip.endDate?` · ${fmtDate(trip.startDate)} – ${fmtDate(trip.endDate)}`:""}`:""}
        action={<button onClick={handlePDF} style={{padding:"7px 14px",borderRadius:10,border:"0.5px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.7)",fontFamily:RF,fontWeight:600,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><FileDown size={13}/>{t("budget_export",lang)}</button>}/>

      <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:12}}>

        {/* KPI 2x2 */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <KpiCard label={t("budget_paid",lang)}    value={fmtN(paid)}   color="#4ade80" Icon={Check}   sym={sym}/>
          <KpiCard label={t("budget_total",lang)}   value={fmtN(total)}  color={TEAL}    Icon={Receipt} sym={sym}/>
          {budgetRemaining!==null
            ?<KpiCard label={t("budget_remaining",lang)} value={fmtN(Math.abs(budgetRemaining))} color="#818cf8" Icon={Wallet} sym={sym}/>
            :<KpiCard label={t("budget_count",lang)} value={expenses.length} color="#818cf8" Icon={Wallet} noFmt/>
          }
          <KpiCard label={t("budget_unpaid",lang)}  value={fmtN(unpaid)} color="#fbbf24" Icon={Clock}   sym={sym}/>
        </div>

        {/* Budget progress */}
        {trip.budget>0&&(
          <div style={{background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:32,height:32,borderRadius:9,background:"rgba(100,223,223,0.12)",border:"0.5px solid rgba(100,223,223,0.25)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Wallet size={15} color={TEAL} strokeWidth={1.5}/>
                </div>
                <span style={{fontFamily:RF,fontSize:14,fontWeight:700,color:"#ffffff"}}>{t("budget_progress",lang)}</span>
              </div>
              <div style={{fontFamily:RF,fontSize:15,fontWeight:800,color:"rgba(255,255,255,0.7)"}}>{fmt(trip.budget)}</div>
            </div>
            <div style={{height:8,background:"rgba(255,255,255,0.08)",borderRadius:999,overflow:"hidden",marginBottom:8}}>
              <div style={{height:"100%",width:`${budgetPct}%`,background:barColor,borderRadius:999,transition:"width 0.6s"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontFamily:RF}}>
              <span style={{color:"rgba(255,255,255,0.4)"}}>{lang==="he"?"נותרו":"Remaining"} {fmt(Math.abs(budgetRemaining||0))}</span>
              <span style={{color:barColor,fontWeight:700}}>{budgetPct.toFixed(0)}% {lang==="he"?"מהתקציב":"of budget"}</span>
            </div>
          </div>
        )}

        {/* Category breakdown: bars + donut */}
        {byCat.length>0&&(
          <div style={{background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontFamily:RF,fontSize:15,fontWeight:700,color:"#ffffff"}}>{t("budget_by_cat",lang)}</div>
              <Filter size={14} color={W35} strokeWidth={1.5}/>
            </div>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              {/* Bars */}
              <div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>
                {byCat.map(cat=>{
                  const maxT=Math.max(...byCat.map(c=>c.total),1);
                  return(
                    <div key={cat.id}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div style={{width:8,height:8,borderRadius:3,background:cat.color,flexShrink:0}}/>
                          <span style={{fontFamily:RF,fontSize:12,color:"rgba(255,255,255,0.7)"}}>{catLabel(cat.id,lang)}</span>
                        </div>
                        <span style={{fontFamily:RF,fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.85)"}}>{fmt(cat.total)}</span>
                      </div>
                      <div style={{height:5,background:"rgba(255,255,255,0.07)",borderRadius:999,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${(cat.total/maxT)*100}%`,background:cat.color,borderRadius:999}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Donut */}
              <div style={{flexShrink:0}}>
                <PieChart data={pieData}/>
              </div>
            </div>
          </div>
        )}

        {/* Settlement */}
        {people.length>=2&&settlement.length>0&&(
          <div style={{background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"16px"}}>
            <div style={{fontFamily:RF,fontSize:15,fontWeight:700,color:"#ffffff",marginBottom:4}}>{t("budget_settle",lang)}</div>
            <div style={{fontSize:12,color:W35,marginBottom:12}}>{t("budget_settle_sub",lang)}</div>
            {settlement.map((d,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"12px",background:"rgba(255,255,255,0.04)",borderRadius:12,marginBottom:8}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:d.from.color+"30",border:`1.5px solid ${d.from.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:d.from.color,flexShrink:0}}>{d.from.name[0]}</div>
                <div style={{flex:1}}>
                  <span style={{fontWeight:700,color:d.from.color}}>{d.from.name}</span>
                  <span style={{color:W35,fontSize:12}}> {t("budget_owes",lang)} </span>
                  <span style={{fontWeight:700,color:d.to.color}}>{d.to.name}</span>
                </div>
                <div style={{fontFamily:RF,fontSize:15,fontWeight:700,color:"#ff6b6b"}}>{fmt(d.amount,1)}</div>
                <div style={{width:32,height:32,borderRadius:"50%",background:d.to.color+"30",border:`1.5px solid ${d.to.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:d.to.color,flexShrink:0}}>{d.to.name[0]}</div>
              </div>
            ))}
          </div>
        )}

        {expenses.length===0&&(
          <div style={{textAlign:"center",color:W35,padding:"32px 0"}}>
            <BarChart2 size={40} color="rgba(255,255,255,0.1)" strokeWidth={1} style={{margin:"0 auto 10px",display:"block"}}/>
            <div style={{fontSize:15}}>{t("budget_no_exp",lang)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

const ACT_TYPES=[
  {id:"general", icon:"📌", Icon:MapPin,   he:"כללי",   en:"General"},
  {id:"tour",    icon:"🥾", Icon:Backpack, he:"טיול",   en:"Tour"},
  {id:"food",    icon:"🍽️",Icon:Utensils, he:"מסעדה",  en:"Restaurant"},
  {id:"drive",   icon:"🚗", Icon:Car,      he:"נסיעה",  en:"Transport"},
];
const actIcon=type=>ACT_TYPES.find(t=>t.id===type)?.icon||"📌";

function CalendarScreen({trip,expenses,onSaveActs}){
  const{lang}=useLang();
  const dates=getRange(trip.startDate,trip.endDate);
  const[acts,setActs]=useState(trip.activities||{});       // {date: [{text, time}]}
  const[editD,setEditD]=useState(null);
  const[view,setView]=useState("month");  // "month" | "day"
  const[selDate,setSelDate]=useState(dates[0]||"");
  const[editActs,setEditActs]=useState([]); // [{text,time}] being edited
  const[actPopup,setActPopup]=useState(null); // activity detail popup {act, date}
  const{wx,loading:wLoad,error:wErr}=useWeather(trip.destination,trip.startDate,trip.endDate);

  const wxMap={};
  if(wx?.daily){const{time,weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max}=wx.daily;time.forEach((t,i)=>{wxMap[t]={code:weathercode[i],max:temperature_2m_max[i],min:temperature_2m_min[i],rain:precipitation_probability_max[i]};});}

  // Deduplicate by departure time + description for flights, checkIn+checkOut for hotels
  const flightsOn=d=>{
    const all=expenses.filter(e=>e.category==="flight"&&e.date===d&&e.departureTime);
    const seen=new Set();
    return all.filter(e=>{const key=`${e.departureTime}_${e.description||""}`;if(seen.has(key))return false;seen.add(key);return true;});
  };
  const hotelsOn=d=>{
    const all=expenses.filter(e=>e.category==="hotel"&&e.checkIn<=d&&e.checkOut>=d);
    const seen=new Set();
    return all.filter(e=>{const key=`${e.checkIn}_${e.checkOut}_${e.description||""}`;if(seen.has(key))return false;seen.add(key);return true;});
  };
  const otherOn=d=>expenses.filter(e=>!["flight","hotel"].includes(e.category)&&e.date===d&&e.isShared!==false);
  const hasEvents=d=>{
    const a=acts[d]||[];
    return a.length>0||flightsOn(d).length>0||hotelsOn(d).length>0||otherOn(d).length>0;
  };

  const openEdit=d=>{
    setEditD(d);
    const existing=acts[d]||[];
    setEditActs(existing.length>0?existing.map(a=>typeof a==="string"?{text:a,time:"",timeEnd:"",type:"general"}:a):[{text:"",time:"",timeEnd:"",type:"general"}]);
  };
  const saveEdit=()=>{
    const valid=editActs.filter(a=>a.text.trim());
    const updated={...acts,[editD]:valid};
    setActs(updated);
    if(onSaveActs) onSaveActs(updated);
    setEditD(null);
  };
  const addActRow=()=>setEditActs(a=>[...a,{text:"",time:"",timeEnd:"",type:"general"}]);
  const updateAct=(i,field,val)=>setEditActs(a=>a.map((x,j)=>j===i?{...x,[field]:val}:x));
  const removeAct=i=>setEditActs(a=>a.filter((_,j)=>j!==i));

  // ── MONTH VIEW ──────────────────────────────────────────────────────────────
  const[curMonth,setCurMonth]=useState(()=>{
    if(!trip.startDate) return {y:new Date().getFullYear(),m:new Date().getMonth()};
    const d=new Date(trip.startDate);
    return {y:d.getFullYear(),m:d.getMonth()};
  });

  // Get all months that overlap with the trip
  const tripMonths=useMemo(()=>{
    if(!trip.startDate||!trip.endDate) return [];
    const months=[];
    const s=new Date(trip.startDate);
    const e=new Date(trip.endDate);
    const cur=new Date(s.getFullYear(),s.getMonth(),1);
    const last=new Date(e.getFullYear(),e.getMonth(),1);
    while(cur<=last){
      months.push({y:cur.getFullYear(),m:cur.getMonth()});
      cur.setMonth(cur.getMonth()+1);
    }
    return months;
  },[trip.startDate,trip.endDate]);

  const canPrev=tripMonths.length>0&&(curMonth.y>tripMonths[0].y||(curMonth.y===tripMonths[0].y&&curMonth.m>tripMonths[0].m));
  const canNext=tripMonths.length>0&&(curMonth.y<tripMonths[tripMonths.length-1].y||(curMonth.y===tripMonths[tripMonths.length-1].y&&curMonth.m<tripMonths[tripMonths.length-1].m));

  const prevMonth=()=>{if(!canPrev)return;const d=new Date(curMonth.y,curMonth.m-1,1);setCurMonth({y:d.getFullYear(),m:d.getMonth()});};
  const nextMonth=()=>{if(!canNext)return;const d=new Date(curMonth.y,curMonth.m+1,1);setCurMonth({y:d.getFullYear(),m:d.getMonth()});};

  function MonthView(){
    if(!trip.startDate||!trip.endDate) return(
      <div style={{textAlign:"center",color:W25,padding:"40px 0"}}>
        <div style={{fontSize:44,marginBottom:14}}>🗓️</div>{t("cal_set_dest",lang)}
      </div>
    );

    const year=curMonth.y;
    const month=curMonth.m;
    const firstDay=new Date(year,month,1);
    const lastDay=new Date(year,month+1,0);
    const startPad=firstDay.getDay();
    const days=[];
    for(let i=0;i<startPad;i++) days.push(null);
    for(let d=1;d<=lastDay.getDate();d++) days.push(new Date(year,month,d));

    const monthName=firstDay.toLocaleDateString(lang==="he"?"he-IL":"en-US",{month:"long",year:"numeric"});
    const dayNames=["א","ב","ג","ד","ה","ו","ש"];

    return(
      <div style={{padding:"14px 14px 20px"}}>
        {/* Month header with navigation */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <button onClick={prevMonth} disabled={!canPrev} style={{width:34,height:34,borderRadius:10,border:"0.5px solid rgba(100,223,223,0.2)",background:canPrev?"rgba(100,223,223,0.08)":"transparent",color:canPrev?TEAL:W15,fontSize:16,cursor:canPrev?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center"}}>→</button>
          <div style={{fontFamily:RF,fontSize:16,fontWeight:700,color:"#ffffff",letterSpacing:"-0.3px"}}>{monthName}</div>
          <button onClick={nextMonth} disabled={!canNext} style={{width:34,height:34,borderRadius:10,border:"0.5px solid rgba(100,223,223,0.2)",background:canNext?"rgba(100,223,223,0.08)":"transparent",color:canNext?TEAL:W15,fontSize:16,cursor:canNext?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center"}}>←</button>
        </div>
        {/* Day labels */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:6}}>
          {dayNames.map(d=>(
            <div key={d} style={{textAlign:"center",fontSize:11,fontWeight:600,color:W25,padding:"4px 0"}}>{d}</div>
          ))}
        </div>
        {/* Grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
          {days.map((d,i)=>{
            if(!d) return <div key={i}/>;
            const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            const inTrip=ds>=trip.startDate&&ds<=trip.endDate;
            const isToday=ds===localDateStr(new Date());
            const isSel=ds===selDate;
            const hasEv=hasEvents(ds);
            const wxd=wxMap[ds];
            return(
              <div key={ds} onClick={()=>{if(inTrip){setSelDate(ds);setView("day");}}}
                style={{
                  minHeight:52,padding:"5px 4px 4px",borderRadius:10,
                  background:isSel?TBB:inTrip?W05:"transparent",
                  border:isSel?"0.5px solid #64dfdf":isToday?"0.5px solid rgba(100,223,223,0.4)":"0.5px solid transparent",
                  cursor:inTrip?"pointer":"default",
                  display:"flex",flexDirection:"column",alignItems:"center",gap:2,
                  transition:"all 0.15s",
                  opacity:inTrip?1:0.3,
                }}>
                <div style={{
                  fontSize:13,fontWeight:isSel||isToday?700:500,
                  color:isSel?TEAL:isToday?TEAL:"rgba(255,255,255,0.8)",
                  fontFamily:RF,lineHeight:1,
                }}>{d.getDate()}</div>
                {/* weather mini */}
                {wxd&&inTrip&&<div style={{fontSize:10,lineHeight:1}}>{WMO[wxd.code]?.split(" ")[0]||""}</div>}
                {/* event dots */}
                {hasEv&&inTrip&&(
                  <div style={{display:"flex",gap:2,flexWrap:"wrap",justifyContent:"center",marginTop:2}}>
                    {flightsOn(ds).length>0&&<div style={{width:5,height:5,borderRadius:"50%",background:TEAL}}/>}
                    {hotelsOn(ds).length>0&&<div style={{width:5,height:5,borderRadius:"50%",background:"#48b5c4"}}/>}
                    {otherOn(ds).length>0&&<div style={{width:5,height:5,borderRadius:"50%",background:"#fbbf24"}}/>}
                    {(acts[ds]||[]).length>0&&<div style={{width:5,height:5,borderRadius:"50%",background:"#a78bfa"}}/>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div style={{display:"flex",gap:14,justifyContent:"center",marginTop:14,flexWrap:"wrap"}}>
          {[[TEAL,t("cat_flight",lang)],["#48b5c4",t("cat_hotel",lang)],["#fbbf24",t("nav_expenses",lang)],["#a78bfa",t("cat_activities",lang)]].map(([color,label])=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:color}}/>
              <span style={{fontSize:10,color:W35,fontFamily:RF}}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── DAY VIEW ────────────────────────────────────────────────────────────────
  function DayView(){
    const flights=flightsOn(selDate);
    const hotels=hotelsOn(selDate);
    const others=otherOn(selDate);
    const dayActs=(acts[selDate]||[]).map(a=>typeof a==="string"?{text:a,time:""}:a);
    const wxd=wxMap[selDate];
    const wday=new Date(selDate).toLocaleDateString(lang==="he"?"he-IL":"en-US",{weekday:"long"});
    const dayNum=new Date(selDate).getDate();
    const monthName=new Date(selDate).toLocaleDateString(lang==="he"?"he-IL":"en-US",{month:"long"});

    // Build timeline events: collect all timed events
    const parseHour=t=>{ if(!t)return null; const[h,m]=t.split(":").map(Number); return h+m/60; };
    const timeDiff=(s,e)=>{ const sh=parseHour(s),eh=parseHour(e); if(sh==null||eh==null||eh<=sh)return null; return eh-sh; };

    const timedEvents=[];
    flights.forEach(f=>{
      if(f.departureTime){
        const hour=parseHour(f.departureTime);
        const dur=timeDiff(f.departureTime,f.landingTime)||1.5;
        timedEvents.push({hour,type:"flight",data:f,duration:dur});
        const rem=remTime(f.departureTime,f.reminderHours||5);
        if(rem){timedEvents.push({hour:parseHour(rem),type:"reminder",data:f,duration:0.25});}
      }
    });
    // Hotels: check-in/out go on timeline, stay days go to top banner
    const stayHotels=[]; // for top banner
    hotels.forEach(h=>{
      const isIn=h.checkIn===selDate,isOut=h.checkOut===selDate;
      if(isIn) timedEvents.push({hour:14,type:"hotel-in",data:h,duration:1});
      if(isOut) timedEvents.push({hour:11,type:"hotel-out",data:h,duration:1});
      if(!isIn&&!isOut) stayHotels.push(h); // middle day – goes to top banner
    });
    dayActs.forEach((a,i)=>{
      if(a.time){
        const hour=parseHour(a.time);
        const dur=timeDiff(a.time,a.timeEnd)||1;
        timedEvents.push({hour,type:"activity",data:a,duration:dur,idx:i});
      } else timedEvents.push({hour:null,type:"activity",data:a,duration:1,idx:i});
    });
    others.forEach(e=>{
      if(e.time){
        const hour=parseHour(e.time);
        const dur=timeDiff(e.time,e.timeEnd)||0.75;
        timedEvents.push({hour,type:"other",data:e,duration:dur});
      } else timedEvents.push({hour:null,type:"other",data:e,duration:0.5});
    });

    const timed=timedEvents.filter(e=>e.hour!==null).sort((a,b)=>a.hour-b.hour);
    const untimed=timedEvents.filter(e=>e.hour===null);

    // Hour range: 6am to midnight
    const hours=Array.from({length:19},(_,i)=>i+5); // 5..23

    const hourToY=h=>(h-5)*56; // 56px per hour
    const totalH=19*56;

    const eventColor={
      flight:TEAL,reminder:"#ff6b6b",
      "hotel-in":"#4ade80","hotel-out":"#fbbf24","hotel-stay":"#48b5c4",
      activity:"#a78bfa",other:"#fbbf24",
    };
    const eventLabel={
      flight:f=>`✈️${f.flightNumber?` ${f.flightNumber}`:""}  ${f.departureTime}${f.landingTime?` → ${f.landingTime}`:""}`,
      reminder:f=>`${t("cal_arrive_by",lang)} ${remTime(f.departureTime,f.reminderHours||5)}`,
      "hotel-in":h=>`${t("cal_hotel_in",lang)} ${h.description||t("cat_hotel",lang)}`,
      "hotel-out":h=>`${t("cal_hotel_out",lang)} ${h.description||t("cat_hotel",lang)}`,
      "hotel-stay":h=>`🏨 ${h.description||t("cat_hotel",lang)}`,
      activity:a=>`${actIcon(a.type)} ${a.text}${a.time&&a.timeEnd?` (${a.time}–${a.timeEnd})`:""}`,
      other:e=>`${CATS.find(c=>c.id===e.category)?.icon} ${e.description||catLabel(e.category,lang)}${e.time&&e.timeEnd?` · ${e.time}–${e.timeEnd}`:""}`,
    };

    // Swipe between days
    const swipeRef=useRef({});
    const onTouchStart=e=>{ swipeRef.current.x=e.touches[0].clientX; swipeRef.current.y=e.touches[0].clientY; };
    const onTouchEnd=e=>{
      const dx=e.changedTouches[0].clientX-swipeRef.current.x;
      const dy=e.changedTouches[0].clientY-swipeRef.current.y;
      // Ignore if mostly vertical (scrolling) or too short
      if(Math.abs(dx)<90||Math.abs(dx)<Math.abs(dy)*2)return;
      const idx=dates.indexOf(selDate);
      if(dx>0&&idx<dates.length-1)setSelDate(dates[idx+1]); // swipe right → next day
      if(dx<0&&idx>0)setSelDate(dates[idx-1]);               // swipe left → prev day
    };

    return(
      <div style={{padding:"14px 14px 20px"}} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {/* Day header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {/* Prev day arrow */}
            <button onClick={()=>{const i=dates.indexOf(selDate);if(i>0)setSelDate(dates[i-1]);}} disabled={dates.indexOf(selDate)===0}
              className="tap-btn"
              style={{width:30,height:30,borderRadius:8,border:"0.5px solid rgba(100,223,223,0.2)",background:W05,color:dates.indexOf(selDate)===0?W25:TEAL,fontSize:14,cursor:dates.indexOf(selDate)===0?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>›</button>
            <div style={{width:44,height:44,borderRadius:12,background:TBL,border:"0.5px solid rgba(100,223,223,0.3)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{color:"#ffffff",fontSize:18,fontWeight:800,fontFamily:RF,lineHeight:1}}>{dayNum}</div>
              <div style={{color:W35,fontSize:9}}>{monthName}</div>
            </div>
            <div>
              <div style={{color:"#ffffff",fontWeight:700,fontSize:16,fontFamily:RF}}>{wday}</div>
              {wxd&&<div style={{fontSize:12,color:TEAL,marginTop:2}}>{WMO[wxd.code]?.split(" ")[0]} {wxd.max?.toFixed(0)}°C</div>}
            </div>
            {/* Next day arrow */}
            <button onClick={()=>{const i=dates.indexOf(selDate);if(i<dates.length-1)setSelDate(dates[i+1]);}} disabled={dates.indexOf(selDate)===dates.length-1}
              className="tap-btn"
              style={{width:30,height:30,borderRadius:8,border:"0.5px solid rgba(100,223,223,0.2)",background:W05,color:dates.indexOf(selDate)===dates.length-1?W25:TEAL,fontSize:14,cursor:dates.indexOf(selDate)===dates.length-1?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>‹</button>
          </div>
          <button onClick={()=>openEdit(selDate)} style={{padding:"7px 12px",borderRadius:9,border:"0.5px solid rgba(100,223,223,0.3)",background:"rgba(100,223,223,0.08)",color:TEAL,fontFamily:RF,fontWeight:600,fontSize:11,cursor:"pointer"}}>{t("cal_activities",lang)}</button>
        </div>

        {/* Hotel stay banner – top of day */}
        {stayHotels.map(h=>(
          <div key={h.id} style={{marginBottom:10,padding:"8px 14px",background:"rgba(100,223,223,0.08)",border:"0.5px solid rgba(100,223,223,0.2)",borderRadius:10,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>🏨</span>
            <span style={{fontFamily:RF,fontSize:13,fontWeight:600,color:"rgba(100,223,223,0.9)"}}>{t("hotel_stay",lang)}{h.description||t("cat_hotel",lang)}</span>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginRight:"auto"}}>{fmtDate(h.checkIn)} – {fmtDate(h.checkOut)}</span>
          </div>
        ))}

        {/* Timeline */}
        <div style={{position:"relative",display:"flex",gap:0}}>
          {/* Hour labels */}
          <div style={{width:36,flexShrink:0,position:"relative",height:totalH}}>
            {hours.map(h=>(
              <div key={h} style={{position:"absolute",top:hourToY(h)-8,right:0,fontSize:10,color:W25,fontFamily:RF,textAlign:"right",width:"100%"}}>
                {String(h).padStart(2,"0")}:00
              </div>
            ))}
          </div>
          {/* Grid + events */}
          <div style={{flex:1,position:"relative",height:totalH,marginRight:8}}>
            {/* Hour lines */}
            {hours.map(h=>(
              <div key={h} style={{position:"absolute",top:hourToY(h),left:0,right:0,height:0.5,background:W07}}/>
            ))}
            {/* Timed events */}
            {timed.map((ev,i)=>{
              const top=hourToY(ev.hour);
              const height=Math.max(ev.duration*56,28);
              const col=eventColor[ev.type]||TEAL;
              const label=eventLabel[ev.type]?.(ev.data)||"";
              const isAct=ev.type==="activity";
              const handleEvClick=()=>{
                if(isAct){setActPopup({act:ev.data,date:selDate});}
                else if(ev.data?.address)window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.data.address)}`,"_blank");
              };
              return(
                <div key={i} onClick={handleEvClick}
                  style={{
                    position:"absolute",top,right:0,left:0,minHeight:height,
                    background:`${col}18`,border:`0.5px solid ${col}50`,
                    borderRight:`3px solid ${col}`,borderRadius:8,
                    padding:"4px 8px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",
                    zIndex:2,cursor:isAct||ev.data?.address?"pointer":"default",
                    boxSizing:"border-box",
                  }}>
                  <span style={{fontSize:12,fontWeight:600,color:col,fontFamily:RF,lineHeight:1.3,flex:1,wordBreak:"break-word",overflowWrap:"break-word",whiteSpace:"pre-wrap"}}>{label}</span>
                  {ev.data?.address&&!isAct&&<MapPin size={13} color={col} strokeWidth={1.5} style={{flexShrink:0,marginTop:2}}/>}
                </div>
              );
            })}
            {/* Current time line */}
            {selDate===new Date().toISOString().slice(0,10)&&(()=>{
              const now=new Date();
              const h=now.getHours()+now.getMinutes()/60;
              if(h>=5&&h<=23) return(
                <div style={{position:"absolute",top:hourToY(h),left:0,right:0,height:2,background:"#ff6b6b",zIndex:10,borderRadius:999}}>
                  <div style={{position:"absolute",right:-4,top:-3,width:8,height:8,borderRadius:"50%",background:"#ff6b6b"}}/>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Untimed events */}
        {untimed.length>0&&(
          <div style={{marginTop:16}}>
            <div style={{fontSize:10,fontWeight:600,color:W25,letterSpacing:"1px",textTransform:"uppercase",marginBottom:8,fontFamily:RF}}>{t("cal_no_time",lang)}</div>
            {untimed.map((ev,i)=>{
              const col=eventColor[ev.type]||TEAL;
              const label=eventLabel[ev.type]?.(ev.data)||"";
              const isAct=ev.type==="activity";
              const handleEvClick=()=>{
                if(isAct){setActPopup({act:ev.data,date:selDate});}
                else if(ev.data?.address)window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.data.address)}`,"_blank");
              };
              return(
                <div key={i} onClick={handleEvClick}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:10,marginBottom:6,cursor:isAct||ev.data?.address?"pointer":"default"}}>
                  <div style={{width:4,height:4,borderRadius:"50%",background:col,flexShrink:0}}/>
                  <span style={{fontSize:13,color:W70,fontFamily:RF,flex:1,wordBreak:"break-word",overflowWrap:"break-word"}}>{label}</span>
                  {ev.data?.address&&!isAct&&<MapPin size={13} color={W35} strokeWidth={1.5} style={{flexShrink:0}}/>}
                </div>
              );
            })}
          </div>
        )}
        {timed.length===0&&untimed.length===0&&(
          <div style={{textAlign:"center",color:"rgba(255,255,255,0.2)",padding:"32px 0",fontSize:13,fontFamily:RF}}>
            {t("cal_no_events",lang)}
          </div>
        )}
      </div>
    );
  }

  // ── EDIT MODAL JSX (inline – NOT a sub-component, prevents keyboard dismiss on rerender) ──
  const editModalJsx = editD ? (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#0d2f4a",border:"0.5px solid rgba(100,223,223,0.25)",borderRadius:20,padding:22,width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,0.6)",maxHeight:"80vh",overflowY:"auto"}}>
        <h3 style={{fontFamily:RF,fontSize:17,fontWeight:700,color:"#ffffff",marginBottom:14}}>✏️ {t("cal_edit_acts",lang)}{fmtDate(editD)}</h3>
        {editActs.map((act,i)=>(
          <div key={i} style={{marginBottom:10}}>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:5}}>
              <select value={act.type||"general"} onChange={e=>updateAct(i,"type",e.target.value)}
                style={{padding:"9px 6px",borderRadius:10,border:"0.5px solid rgba(100,223,223,0.2)",background:W07,color:"#ffffff",fontFamily:RF,fontSize:13,outline:"none",flexShrink:0,cursor:"pointer"}}>
                {ACT_TYPES.map(tp=>(
                  <option key={tp.id} value={tp.id}>{lang==="he"?tp.he:tp.en}</option>
                ))}
              </select>
              <input value={act.text} onChange={e=>updateAct(i,"text",e.target.value)} placeholder={t("cal_act_ph",lang)}
                style={{flex:1,padding:"9px 12px",borderRadius:10,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:RF,fontSize:13,color:"#ffffff",background:W07,outline:"none",direction:"rtl"}}/>
              <button onClick={()=>removeAct(i)} style={{background:"rgba(255,107,107,0.12)",border:"none",color:"#ff6b6b",borderRadius:8,padding:"8px 10px",cursor:"pointer",fontSize:14,flexShrink:0}}>✕</button>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center",direction:"ltr"}}>
              <span style={{color:"rgba(255,255,255,0.35)",fontSize:11,flexShrink:0,fontFamily:RF}}>{lang==="he"?"מ-":"from"}</span>
              <input value={act.time||""} onChange={e=>updateAct(i,"time",e.target.value)} type="time"
                style={{flex:1,padding:"8px",borderRadius:10,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:RF,fontSize:13,color:"#ffffff",background:W07,outline:"none"}}/>
              <span style={{color:"rgba(255,255,255,0.3)",fontSize:13,flexShrink:0}}>–</span>
              <input value={act.timeEnd||""} onChange={e=>updateAct(i,"timeEnd",e.target.value)} type="time"
                style={{flex:1,padding:"8px",borderRadius:10,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:RF,fontSize:13,color:"#ffffff",background:W07,outline:"none"}}/>
              <span style={{color:"rgba(255,255,255,0.35)",fontSize:11,flexShrink:0,fontFamily:RF}}>{lang==="he"?"עד":"to"}</span>
            </div>
          </div>
        ))}
        <button onClick={addActRow} style={{width:"100%",padding:"9px",borderRadius:10,border:"0.5px dashed rgba(100,223,223,0.3)",background:"rgba(100,223,223,0.05)",color:TEAL,fontFamily:RF,fontWeight:600,fontSize:13,cursor:"pointer",marginBottom:14}}>
          {t("cal_add_act",lang)}
        </button>
        <div style={{display:"flex",gap:8}}>
          <button onClick={saveEdit} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:TEAL,color:DARK_BG,fontFamily:RF,fontWeight:700,fontSize:14,cursor:"pointer"}}>{t("save",lang)} ✓</button>
          <button onClick={()=>setEditD(null)} style={{flex:1,padding:"12px",borderRadius:12,border:"0.5px solid rgba(255,255,255,0.15)",background:W05,fontFamily:RF,fontWeight:600,fontSize:13,cursor:"pointer",color:W50}}>{t("cancel",lang)}</button>
        </div>
      </div>
    </div>
  ) : null;

  // ── ACTIVITY POPUP ──────────────────────────────────────────────────────────
  const actPopupJsx=actPopup?(()=>{
    const{act,date}=actPopup;
    const tp=ACT_TYPES.find(x=>x.id===(act.type||"general"))||ACT_TYPES[0];
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:250,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setActPopup(null)}>
        <div onClick={e=>e.stopPropagation()} style={{background:"#0d2f4a",border:"0.5px solid rgba(167,139,250,0.35)",borderRadius:20,padding:24,width:"100%",maxWidth:380,boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <div style={{width:52,height:52,borderRadius:14,background:"rgba(167,139,250,0.12)",border:"0.5px solid rgba(167,139,250,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><tp.Icon size={24} color="#a78bfa" strokeWidth={1.5}/></div>
            <div>
              <div style={{fontFamily:RF,fontSize:11,color:"rgba(167,139,250,0.7)",fontWeight:600,letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:2}}>{lang==="he"?tp.he:tp.en}</div>
              <div style={{fontFamily:RF,fontSize:17,fontWeight:700,color:"#ffffff"}}>{act.text}</div>
            </div>
          </div>
          {(act.time||act.timeEnd)&&(
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:12,background:"rgba(167,139,250,0.07)",border:"0.5px solid rgba(167,139,250,0.2)",marginBottom:12}}>
              <span style={{fontSize:16}}>🕐</span>
              <span style={{fontFamily:RF,fontSize:14,color:"#ffffff",direction:"ltr"}}>{act.time||""}{act.time&&act.timeEnd?" – ":""}{act.timeEnd||""}</span>
            </div>
          )}
          <div style={{fontSize:12,color:"rgba(255,255,255,0.3)",fontFamily:RF,marginBottom:16}}>{fmtDate(date)}</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setActPopup(null);openEdit(date);}} style={{flex:1,padding:"11px",borderRadius:12,border:"0.5px solid rgba(167,139,250,0.4)",background:"rgba(167,139,250,0.1)",color:"#a78bfa",fontFamily:RF,fontWeight:700,fontSize:13,cursor:"pointer"}}>✏️ {lang==="he"?"עריכה":"Edit"}</button>
            <button onClick={()=>setActPopup(null)} style={{flex:1,padding:"11px",borderRadius:12,border:"0.5px solid rgba(255,255,255,0.15)",background:W05,fontFamily:RF,fontWeight:600,fontSize:13,cursor:"pointer",color:W50}}>{lang==="he"?"סגור":"Close"}</button>
          </div>
        </div>
      </div>
    );
  })():null;

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return(
    <div>
      <div style={{background:"linear-gradient(160deg,#0d2137 0%,#0a3050 100%)",padding:"18px 18px 14px",borderBottom:"0.5px solid rgba(100,223,223,0.12)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div>
            <h1 style={{fontFamily:RF,color:"#ffffff",fontSize:22,fontWeight:800,letterSpacing:"-0.3px",lineHeight:1}}>{t("cal_title",lang)}</h1>
            <p style={{color:W35,marginTop:4,fontSize:11,fontWeight:400}}>{trip.destination?`${fmtDate(trip.startDate)} – ${fmtDate(trip.endDate)}`:""}</p>
          </div>
          {trip.destination&&<div style={{fontSize:11,color:"rgba(255,255,255,0.3)",fontFamily:RF}}>{wLoad?t("wx_loading",lang):wx?`🌍 ${wx.name}`:wErr?"☁️":""}</div>}
        </div>
        {/* View toggle */}
        <div style={{display:"flex",gap:6,background:"rgba(255,255,255,0.06)",borderRadius:10,padding:3}}>
          <button onClick={()=>setView("month")} style={{flex:1,padding:"7px",borderRadius:8,border:"none",background:view==="month"?"rgba(100,223,223,0.18)":"transparent",color:view==="month"?TEAL:W35,fontFamily:RF,fontWeight:600,fontSize:13,cursor:"pointer",transition:"all 0.2s"}}>{t("cal_month",lang)}</button>
          <button onClick={()=>{setView("day");if(!selDate&&dates[0])setSelDate(dates[0]);}} style={{flex:1,padding:"7px",borderRadius:8,border:"none",background:view==="day"?"rgba(100,223,223,0.18)":"transparent",color:view==="day"?TEAL:W35,fontFamily:RF,fontWeight:600,fontSize:13,cursor:"pointer",transition:"all 0.2s"}}>{t("cal_day",lang)}</button>
        </div>
        {/* Day nav (only in day view) */}
        {view==="day"&&dates.length>0&&(
          <div style={{display:"flex",gap:6,overflowX:"auto",marginTop:10,paddingBottom:2}}>
            {dates.map(d=>{
              const hasEv=hasEvents(d);
              return(
                <button key={d} onClick={()=>setSelDate(d)} style={{minWidth:48,padding:"7px 6px",borderRadius:10,border:`0.5px solid ${selDate===d?TEAL:"rgba(255,255,255,0.1)"}`,background:selDate===d?TB:"rgba(255,255,255,0.04)",color:selDate===d?"#ffffff":W40,fontFamily:RF,fontWeight:selDate===d?700:500,fontSize:12,cursor:"pointer",textAlign:"center",flexShrink:0,position:"relative"}}>
                  <div style={{fontSize:9,opacity:0.7}}>{new Date(d).toLocaleDateString(lang==="he"?"he-IL":"en-US",{weekday:"short"})}</div>
                  <div style={{fontSize:15}}>{new Date(d).getDate()}</div>
                  {hasEv&&<div style={{width:4,height:4,borderRadius:"50%",background:TEAL,margin:"2px auto 0"}}/>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {editModalJsx}
      {actPopupJsx}

      <div style={{overflowY:"auto"}}>
        {view==="month"?<MonthView/>:<DayView/>}
      </div>
    </div>
  );
}


function DiscoverScreen({trip}){
  const{lang}=useLang();
  const dest=translateDest(trip.destination||"");
  const encDest=encodeURIComponent(dest||trip.destination||"");
  const checkIn=trip.startDate||"";
  const checkOut=trip.endDate||"";
  const AGODA_CID=process.env.NEXT_PUBLIC_AGODA_CID||"";
  const BOOKING_AID=process.env.NEXT_PUBLIC_BOOKING_AID||"";
  const VIATOR_PID=process.env.NEXT_PUBLIC_VIATOR_PID||"";
  const GYG_ID=process.env.NEXT_PUBLIC_GYG_PARTNER_ID||"";

  const agodaDates=checkIn&&checkOut?`&checkIn=${checkIn}&checkOut=${checkOut}`:"";
  const bookingDates=checkIn&&checkOut?`&checkin=${checkIn}&checkout=${checkOut}`:"";

  // AI recommendations state
  const[recs,setRecs]=useState(null);
  const[recsLoading,setRecsLoading]=useState(false);
  const[recsErr,setRecsErr]=useState(false);
  const prevDestLangRef=useRef("");

  const loadRecs=useCallback(async()=>{
    if(!trip.destination)return;
    setRecsLoading(true);setRecsErr(false);setRecs(null);
    try{
      const res=await fetch("/api/recommendations",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({destination:trip.destination,lang:"en"}),
      });
      const data=await res.json();
      if(!res.ok||data.error){setRecsErr(true);}
      else{setRecs(data);}
    }catch{setRecsErr(true);}
    finally{setRecsLoading(false);}
  },[trip.destination]);

  useEffect(()=>{
    const key=trip.destination;
    if(key!==prevDestLangRef.current){
      prevDestLangRef.current=key;
      loadRecs();
    }
  },[trip.destination,loadRecs]);

  const open=url=>window.open(url,"_blank");

  const mapsUrl=name=>`https://www.google.com/maps/search/${encodeURIComponent(name+" "+(dest||trip.destination||""))}`;

  const agodaTile={name:"Agoda",domain:"agoda.com",color:"#e0455a",label:t("disc_book_hotels",lang),
   url:`https://www.agoda.com/search?q=${encDest}${agodaDates}&adults=2&rooms=1${AGODA_CID?`&cid=${AGODA_CID}`:""}`};
  const actTiles=[
    {name:"Viator",domain:"viator.com",color:"#2d9cdb",label:t("disc_book_acts",lang),
     url:`https://www.viator.com/search/${encDest}${VIATOR_PID?`?pid=${VIATOR_PID}&mcid=42383`:""}`},
    {name:"GetYourGuide",domain:"getyourguide.com",color:"#ff6b35",label:t("disc_book_acts",lang),
     url:`https://www.getyourguide.com/s/?q=${encDest}${GYG_ID?`&partner_id=${GYG_ID}&cmp=share_to_earn`:""}`},
  ];

  return(
    <div>
      <WaveHeader title={t("disc_title",lang)} subtitle={trip.destination?(lang==="he"?`המלצות ל${trip.destination}`:`Recommendations for ${trip.destination}`):t("disc_subtitle",lang)}/>
      <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:14}}>
        {!trip.destination?(
          <div style={{textAlign:"center",padding:"48px 0",color:W35}}>
            <div style={{width:90,height:90,borderRadius:24,background:"rgba(100,223,223,0.07)",border:"0.5px solid rgba(100,223,223,0.15)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}><MapPin size={40} color="rgba(100,223,223,0.4)" strokeWidth={1}/></div>
            <div style={{fontSize:15,fontWeight:600}}>{t("disc_no_dest",lang)}</div>
          </div>
        ):(
          <>
            {/* Destination pill */}
            <div style={{fontSize:12,color:W40,fontFamily:RF,textAlign:"center",background:W05,borderRadius:10,padding:"10px"}}>
              {t("disc_results_for",lang)} <strong style={{color:TEAL}}>{trip.destination}</strong>
              {checkIn&&checkOut?` · ${fmtDate(checkIn)} – ${fmtDate(checkOut)}`:""}
            </div>

            {/* ── Agoda — full-width hotel booking ── */}
            <button onClick={()=>open(agodaTile.url)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"18px 20px",borderRadius:18,border:`0.5px solid ${agodaTile.color}55`,background:`linear-gradient(135deg,${agodaTile.color}18,${agodaTile.color}08)`,cursor:"pointer"}}>
              <img src={`https://www.google.com/s2/favicons?domain=${agodaTile.domain}&sz=64`} alt="Agoda"
                style={{width:48,height:48,borderRadius:12,objectFit:"contain",background:"#fff",padding:4,flexShrink:0}}
                onError={e=>{e.currentTarget.style.display="none";}}/>
              <div style={{textAlign:"right",flex:1}}>
                <div style={{fontFamily:RF,fontSize:16,fontWeight:800,color:"#ffffff"}}>{agodaTile.name}</div>
                <div style={{fontSize:13,color:"#ffffff",fontWeight:600,marginTop:3,lineHeight:1.4,opacity:0.9}}>{agodaTile.label}</div>
              </div>
              <div style={{flexShrink:0,width:32,height:32,borderRadius:10,background:"rgba(224,69,90,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}><Building2 size={18} color="#e0455a" strokeWidth={1.5}/></div>
            </button>

            {/* ── Activities — Viator + GYG side by side ── */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {actTiles.map(tile=>(
                <button key={tile.name} onClick={()=>open(tile.url)}
                  style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,padding:"18px 12px",borderRadius:16,border:`0.5px solid ${tile.color}50`,background:`${tile.color}12`,cursor:"pointer",minHeight:110}}>
                  <img src={`https://www.google.com/s2/favicons?domain=${tile.domain}&sz=64`} alt={tile.name}
                    style={{width:44,height:44,borderRadius:10,objectFit:"contain",background:"#fff",padding:4}}
                    onError={e=>{e.currentTarget.style.display="none";}}/>
                  <div style={{fontFamily:RF,fontSize:14,fontWeight:800,color:"#ffffff"}}>{tile.name}</div>
                  <div style={{fontSize:13,color:"#ffffff",textAlign:"center",lineHeight:1.4,fontWeight:600,padding:"0 4px"}}>{tile.label}</div>
                </button>
              ))}
            </div>

            {/* ── AI Recommendations ── */}
            {recsLoading&&(
              <>
                <Card>
                  <div className="skeleton" style={{height:13,width:"45%",marginBottom:14,borderRadius:6}}/>
                  <SkeletonRec/>
                </Card>
                <Card>
                  <div className="skeleton" style={{height:13,width:"40%",marginBottom:14,borderRadius:6}}/>
                  <SkeletonRec/>
                </Card>
                <div style={{background:"rgba(246,173,85,0.06)",border:"0.5px solid rgba(246,173,85,0.15)",borderRadius:14,padding:"14px 16px",display:"flex",gap:12,alignItems:"center"}}>
                  <div className="skeleton" style={{width:36,height:36,borderRadius:10,flexShrink:0}}/>
                  <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
                    <div className="skeleton" style={{height:11,width:"35%"}}/>
                    <div className="skeleton" style={{height:9,width:"70%"}}/>
                  </div>
                </div>
              </>
            )}
            {recsErr&&!recsLoading&&(
              <div style={{textAlign:"center",padding:"24px 0",color:W35}}>
                <div style={{fontSize:13,marginBottom:10}}>{t("disc_load_err",lang)}</div>
                <button onClick={loadRecs} style={{background:TEAL,color:"#fff",border:"none",borderRadius:10,padding:"8px 18px",fontSize:13,cursor:"pointer",fontFamily:RF}}>
                  {t("disc_retry",lang)}
                </button>
              </div>
            )}
            {recs&&!recsLoading&&(
              <>
                {/* Attractions */}
                <Card>
                  <h2 style={{fontFamily:RF,fontSize:15,fontWeight:700,marginBottom:12,color:"#ffffff"}}>{t("disc_attractions",lang)}</h2>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {(recs.attractions||[]).map((a,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:12,background:W05}}>
                        <div style={{width:36,height:36,borderRadius:10,background:"rgba(244,114,182,0.13)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ticket size={18} color="#f472b6" strokeWidth={1.5}/></div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontFamily:RF,fontSize:14,fontWeight:700,color:"#ffffff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.name}</div>
                          <div style={{fontSize:11,color:W35,marginTop:2,lineHeight:1.4}}>{a.description}</div>
                        </div>
                        <button onClick={()=>open(mapsUrl(a.name))}
                          style={{background:"rgba(66,153,225,0.15)",border:"0.5px solid rgba(66,153,225,0.4)",borderRadius:8,padding:"5px 9px",cursor:"pointer",fontSize:11,color:"#63b3ed",fontFamily:RF,flexShrink:0,whiteSpace:"nowrap"}}>
                          {t("disc_maps",lang)}
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Restaurants */}
                <Card>
                  <h2 style={{fontFamily:RF,fontSize:15,fontWeight:700,marginBottom:12,color:"#ffffff"}}>{t("disc_restaurants",lang)}</h2>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {(recs.restaurants||[]).map((r,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:12,background:W05}}>
                        <div style={{width:36,height:36,borderRadius:10,background:"rgba(251,191,36,0.13)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Utensils size={18} color="#fbbf24" strokeWidth={1.5}/></div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontFamily:RF,fontSize:14,fontWeight:700,color:"#ffffff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.name}</div>
                          <div style={{fontSize:11,color:W35,marginTop:2,lineHeight:1.4}}>{r.description}{r.cuisine?` · ${r.cuisine}`:""}</div>
                        </div>
                        <button onClick={()=>open(mapsUrl(r.name))}
                          style={{background:"rgba(66,153,225,0.15)",border:"0.5px solid rgba(66,153,225,0.4)",borderRadius:8,padding:"5px 9px",cursor:"pointer",fontSize:11,color:"#63b3ed",fontFamily:RF,flexShrink:0,whiteSpace:"nowrap"}}>
                          {t("disc_maps",lang)}
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Local tip */}
                {recs.tip&&(
                  <div style={{background:"linear-gradient(135deg,rgba(246,173,85,0.12),rgba(237,137,54,0.08))",border:"0.5px solid rgba(246,173,85,0.3)",borderRadius:14,padding:"14px 16px",display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{width:36,height:36,borderRadius:10,background:"rgba(246,173,85,0.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Sparkles size={18} color="#f6ad55" strokeWidth={1.5}/></div>
                    <div>
                      <div style={{fontFamily:RF,fontSize:13,fontWeight:700,color:"#f6ad55",marginBottom:4}}>{t("disc_local_tip",lang)}</div>
                      <div style={{fontSize:13,color:W40,lineHeight:1.5}}>{recs.tip}</div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div style={{fontSize:11,color:"rgba(255,255,255,0.18)",textAlign:"center",fontFamily:RF,lineHeight:1.6}}>
              {t("disc_disclaimer",lang)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const newTrip=(ownerId)=>({id:uid(),destination:"",startDate:"",endDate:"",defaultCurrency:"ILS",displayCurrency:"ILS",currencies:["ILS","USD","EUR"],people:[],expenses:[],activities:{},owner:ownerId,sharedWith:[]});

// ── TRIP SPLASH SCREEN ────────────────────────────────────────────────────────
function TripSplashScreen({trip,onBudget,onTrip,isViewOnly,lang}){
  return(
    <div style={{padding:"32px 20px",display:"flex",flexDirection:"column",gap:16,minHeight:"55vh",justifyContent:"center"}}>
      <div style={{textAlign:"center",marginBottom:8}}>
        <div style={{width:64,height:64,borderRadius:20,background:"rgba(100,223,223,0.12)",border:"0.5px solid rgba(100,223,223,0.25)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
          <MapPin size={30} color="#64dfdf" strokeWidth={1.5}/>
        </div>
        <div style={{fontSize:22,fontWeight:800,color:"#ffffff",fontFamily:RF,letterSpacing:"-0.5px"}}>{trip.destination||(lang==="he"?"הטיול שלי":"My Trip")}</div>
        {trip.startDate&&trip.endDate&&(
          <div style={{fontSize:13,color:W35,marginTop:5,fontFamily:RF}}>{fmtDate(trip.startDate)} – {fmtDate(trip.endDate)}</div>
        )}
        {(trip.people||[]).length>0&&(
          <div style={{fontSize:12,color:W35,marginTop:3,fontFamily:RF,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><Users size={12} color={W35} strokeWidth={1.5}/> {(trip.people||[]).map(p=>p.name||p).join(" · ")}</div>
        )}
      </div>

      {!isViewOnly&&(
        <button onClick={onBudget} style={{width:"100%",padding:"22px 20px",borderRadius:20,border:"0.5px solid rgba(74,222,128,0.35)",background:"linear-gradient(135deg,rgba(74,222,128,0.12),rgba(74,222,128,0.05))",cursor:"pointer",display:"flex",alignItems:"center",gap:16,textAlign:"right"}}>
          <div style={{width:56,height:56,borderRadius:16,background:"rgba(74,222,128,0.15)",border:"0.5px solid rgba(74,222,128,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Wallet size={26} color="#4ade80" strokeWidth={1.5}/></div>
          <div>
            <div style={{fontSize:18,fontWeight:800,color:"#ffffff",fontFamily:RF}}>{lang==="he"?"ניהול תקציב":"Budget Management"}</div>
            <div style={{fontSize:13,color:W40,marginTop:3,fontFamily:RF}}>{lang==="he"?"הוצאות, תקציב והתחשבנות":"Expenses, budget & settlement"}</div>
          </div>
        </button>
      )}

      <button onClick={onTrip} style={{width:"100%",padding:"22px 20px",borderRadius:20,border:"0.5px solid rgba(100,223,223,0.35)",background:"linear-gradient(135deg,rgba(100,223,223,0.12),rgba(100,223,223,0.05))",cursor:"pointer",display:"flex",alignItems:"center",gap:16,textAlign:"right"}}>
        <div style={{width:56,height:56,borderRadius:16,background:"rgba(100,223,223,0.15)",border:"0.5px solid rgba(100,223,223,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Map size={26} color="#64dfdf" strokeWidth={1.5}/></div>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:"#ffffff",fontFamily:RF}}>{lang==="he"?"ניהול טיול":"Trip Management"}</div>
          <div style={{fontSize:13,color:W40,marginTop:3,fontFamily:RF}}>{lang==="he"?"יומן, המלצות, מפה ואריזה":"Calendar, tips, map & packing"}</div>
        </div>
      </button>
    </div>
  );
}

// ── PACKING LIST SCREEN ───────────────────────────────────────────────────────
const PACK_CATS=[
  {id:"clothes",Icon:Shirt,    he:"בגדים",       en:"Clothing",    color:"#64dfdf", bg:"rgba(100,223,223,0.12)"},
  {id:"docs",   Icon:FileText, he:"מסמכים",      en:"Documents",   color:"#fbbf24", bg:"rgba(251,191,36,0.12)"},
  {id:"tech",   Icon:Zap,      he:"אלקטרוניקה",  en:"Electronics", color:"#fbbf24", bg:"rgba(251,191,36,0.12)"},
  {id:"medical",Icon:Heart,    he:"בריאות",       en:"Health",      color:"#f472b6", bg:"rgba(244,114,182,0.12)"},
  {id:"other",  Icon:Package,  he:"אחר",          en:"Other",       color:"#94a3b8", bg:"rgba(148,163,184,0.12)"},
];
const DEFAULT_PACK=(lang)=>[
  {id:"d1",text:lang==="he"?"דרכון":"Passport",           category:"docs",   checked:false},
  {id:"d2",text:lang==="he"?"כרטיסי טיסה":"Flight tickets",category:"docs",   checked:false},
  {id:"d3",text:lang==="he"?"ביטוח נסיעות":"Travel insurance",category:"docs", checked:false},
  {id:"d4",text:lang==="he"?"ארנק/כסף מזומן":"Wallet/cash",category:"docs",   checked:false},
  {id:"c1",text:lang==="he"?"חולצות":"T-shirts",          category:"clothes", checked:false},
  {id:"c2",text:lang==="he"?"נעלי ספורט":"Sneakers",      category:"clothes", checked:false},
  {id:"c3",text:lang==="he"?"בגד ים":"Swimwear",          category:"clothes", checked:false},
  {id:"t1",text:lang==="he"?"מטען":"Charger",             category:"tech",    checked:false},
  {id:"t2",text:lang==="he"?"אוזניות":"Headphones",       category:"tech",    checked:false},
  {id:"t3",text:lang==="he"?"מצלמה":"Camera",             category:"tech",    checked:false},
  {id:"m1",text:lang==="he"?"תרופות שגרתיות":"Regular medication",category:"medical",checked:false},
  {id:"m2",text:lang==="he"?"קרם הגנה":"Sunscreen",       category:"medical", checked:false},
  {id:"m3",text:lang==="he"?"משחת שיניים":"Toothpaste",   category:"medical", checked:false},
  {id:"o1",text:lang==="he"?"מטריה":"Umbrella",           category:"other",   checked:false},
  {id:"o2",text:lang==="he"?"קרם גוף":"Body lotion",      category:"other",   checked:false},
];

function PackingListScreen({trip,onUpdate}){
  const{lang}=useLang();
  const[items,setItems]=useState(()=>trip.packingList||DEFAULT_PACK(lang));
  const[expanded,setExpanded]=useState(()=>{
    const obj={};
    PACK_CATS.forEach((c,i)=>{obj[c.id]=i<2;});
    return obj;
  });
  const[addingTo,setAddingTo]=useState(null);
  const[newText,setNewText]=useState("");

  const save=updated=>{setItems(updated);onUpdate({packingList:updated});};
  const toggle=id=>save(items.map(it=>it.id===id?{...it,checked:!it.checked}:it));
  const del=id=>save(items.filter(it=>it.id!==id));
  const addItem=(catId)=>{
    if(!newText.trim())return;
    save([...items,{id:uid(),text:newText.trim(),category:catId,checked:false}]);
    setNewText("");
    setAddingTo(null);
  };
  const toggleCat=id=>setExpanded(ex=>({...ex,[id]:!ex[id]}));

  const total=items.length;
  const done=items.filter(it=>it.checked).length;
  const pct=total?Math.round(done/total*100):0;
  const nights=trip.startDate&&trip.endDate?Math.round((new Date(trip.endDate).getTime()-new Date(trip.startDate).getTime())/86400000)+1:0;

  return(
    <div style={{minHeight:"100vh",background:DARK_BG,fontFamily:RF}}>
      {/* Header */}
      <div style={{background:"linear-gradient(160deg,#091928 0%,#0d2137 100%)",padding:"20px 20px 18px",borderBottom:"0.5px solid rgba(100,223,223,0.08)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:26,fontWeight:800,color:TEAL,letterSpacing:"-0.5px"}}>{done}/{total}</div>
          <div style={{fontSize:26,fontWeight:800,color:"#ffffff",letterSpacing:"-0.5px"}}>{lang==="he"?"אריזה":"Packing"}</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:12,color:W35,fontWeight:500}}>{pct}% {lang==="he"?"הושלם":"complete"}</div>
          <div style={{fontSize:12,color:W35,display:"flex",alignItems:"center",gap:4}}>
            {trip.destination}{nights>0&&` • ${nights} ${lang==="he"?"ימים":"days"}`}
          </div>
        </div>
        <div style={{height:5,background:"rgba(255,255,255,0.08)",borderRadius:999,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:pct===100?"#4ade80":TEAL,borderRadius:999,transition:"width 0.4s ease"}}/>
        </div>
      </div>

      {/* Category accordions */}
      <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:8}}>
        {PACK_CATS.map(cat=>{
          const catItems=items.filter(it=>it.category===cat.id);
          const catDone=catItems.filter(it=>it.checked).length;
          const isOpen=!!expanded[cat.id];
          const allDone=catItems.length>0&&catDone===catItems.length;
          return(
            <div key={cat.id} style={{borderRadius:16,overflow:"hidden",border:`0.5px solid ${isOpen?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.06)"}`,background:W05}}>
              {/* Category header */}
              <div onClick={()=>toggleCat(cat.id)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"14px 14px",cursor:"pointer",userSelect:"none"}}>
                <ChevronRight size={16} color={W35} strokeWidth={2.5}
                  style={{transform:isOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.2s",flexShrink:0}}/>
                <div style={{fontSize:13,fontWeight:600,color:allDone?"#4ade80":W40,minWidth:32,flexShrink:0}}>
                  {catDone}/{catItems.length}
                </div>
                <div style={{flex:1}}/>
                <div style={{fontSize:15,fontWeight:700,color:"#ffffff"}}>{lang==="he"?cat.he:cat.en}</div>
                <div style={{width:36,height:36,borderRadius:10,background:cat.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginRight:2}}>
                  <cat.Icon size={18} color={cat.color} strokeWidth={1.5}/>
                </div>
              </div>

              {/* Expanded content */}
              {isOpen&&(
                <div style={{borderTop:"0.5px solid rgba(255,255,255,0.06)"}}>
                  {catItems.length===0&&(
                    <div style={{padding:"12px 14px",fontSize:13,color:W25,textAlign:"center"}}>{lang==="he"?"אין פריטים עדיין":"No items yet"}</div>
                  )}
                  {catItems.map(item=>(
                    <div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderBottom:"0.5px solid rgba(255,255,255,0.04)"}}>
                      <div onClick={()=>toggle(item.id)}
                        style={{width:22,height:22,borderRadius:7,border:`2px solid ${item.checked?"#4ade80":W25}`,
                          background:item.checked?"#4ade80":"transparent",
                          display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"all 0.15s"}}>
                        {item.checked&&<Check size={11} color={DARK_BG} strokeWidth={3}/>}
                      </div>
                      <span style={{flex:1,fontSize:14,color:item.checked?W35:"#ffffff",fontFamily:RF,
                        textDecoration:item.checked?"line-through":"none",transition:"all 0.15s"}}>{item.text}</span>
                      <button onClick={()=>del(item.id)}
                        style={{background:"none",border:"none",cursor:"pointer",padding:"3px 5px",opacity:0.35,display:"flex",alignItems:"center"}}>
                        <X size={13} color="#ff6b6b"/>
                      </button>
                    </div>
                  ))}

                  {/* Add item row */}
                  {addingTo===cat.id?(
                    <div style={{display:"flex",gap:8,padding:"10px 14px",borderTop:"0.5px solid rgba(100,223,223,0.1)"}}>
                      <input value={newText} onChange={e=>setNewText(e.target.value)}
                        onKeyDown={e=>{if(e.key==="Enter")addItem(cat.id);if(e.key==="Escape"){setAddingTo(null);setNewText("");}}}
                        autoFocus
                        placeholder={lang==="he"?"שם הפריט...":"Item name..."}
                        style={{flex:1,padding:"8px 12px",borderRadius:10,border:"0.5px solid rgba(100,223,223,0.3)",background:W07,color:"#ffffff",fontFamily:RF,fontSize:13,outline:"none"}}/>
                      <button onClick={()=>addItem(cat.id)}
                        style={{padding:"8px 14px",borderRadius:10,border:"none",background:TEAL,color:DARK_BG,fontFamily:RF,fontWeight:700,fontSize:13,cursor:"pointer"}}>
                        {lang==="he"?"הוסף":"Add"}
                      </button>
                    </div>
                  ):(
                    <button onClick={()=>{setAddingTo(cat.id);setNewText("");}}
                      style={{width:"100%",padding:"10px 14px",background:"none",border:"none",
                        borderTop:"0.5px solid rgba(255,255,255,0.04)",color:W35,fontFamily:RF,
                        fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6}}>
                      <Plus size={13} color={W35} strokeWidth={2}/>
                      {lang==="he"?"הוסף פריט":"Add item"}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MAP SCREEN ────────────────────────────────────────────────────────────────
function MapScreen({trip,expenses}){
  const{lang}=useLang();
  const dest=trip.destination||"";
  const encDest=encodeURIComponent(dest);

  // Collect all places with addresses
  const places=[];
  (expenses||[]).forEach(e=>{
    if(e.address){
      const cat=CATS.find(c=>c.id===e.category);
      places.push({icon:cat?.icon||"📍",label:e.description||cat?.label||e.category,address:e.address,date:e.date||""});
    }
  });
  // Activities (no address but show as list)
  const actPlaces=[];
  Object.entries(trip.activities||{}).forEach(([date,acts])=>{
    (acts||[]).forEach(a=>{
      const act=typeof a==="string"?{text:a}:a;
      if(act.text) actPlaces.push({icon:actIcon(act.type),label:act.text,date});
    });
  });

  // Group places by date
  const byDate={};
  places.forEach(p=>{
    const d=p.date||"";
    if(!byDate[d])byDate[d]=[];
    byDate[d].push(p);
  });

  // Flat list of ALL placed expenses for the bottom sheet
  const allPlaced=expenses.filter(e=>e.address);
  const totalPlaced=allPlaced.reduce((s,e)=>s+e.amountILS,0);
  const dc=trip.displayCurrency||"ILS";

  // Pin accent colors per category
  const PIN_COLORS={"flight":TEAL,"hotel":"#818cf8","attraction":"#f472b6","food":"#fbbf24","taxi":"#4ade80","other":"#94a3b8"};

  return(
    <div style={{minHeight:"100vh",background:DARK_BG,fontFamily:RF,display:"flex",flexDirection:"column"}}>

      {/* ── Map visual area ─────────────────────────── */}
      <div style={{flex:1,position:"relative",overflow:"hidden",background:"linear-gradient(160deg,#081520 0%,#0d2137 50%,#0a1e30 100%)"}}>

        {/* Grid lines (street-like pattern) */}
        <svg width="100%" height="100%" style={{position:"absolute",inset:0,opacity:0.12}} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#64dfdf" strokeWidth="0.5"/>
            </pattern>
            <pattern id="road-h" width="180" height="180" patternUnits="userSpaceOnUse">
              <rect y="80" width="180" height="4" fill="#1a3a54"/>
              <rect x="80" width="4" height="180" fill="#1a3a54"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
          <rect width="100%" height="100%" fill="url(#road-h)"/>
        </svg>

        {/* Park blob */}
        <div style={{position:"absolute",bottom:"28%",left:"50%",transform:"translateX(-50%)",width:110,height:70,borderRadius:"50%",background:"rgba(34,197,94,0.08)",border:"0.5px solid rgba(34,197,94,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:10,color:"rgba(34,197,94,0.4)",fontWeight:600,letterSpacing:"1px",textTransform:"uppercase"}}>PARK</span>
        </div>

        {/* Destination name + open button — centered */}
        <div style={{position:"absolute",top:24,left:0,right:0,display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"0 20px"}}>
          <div style={{background:"rgba(13,33,55,0.85)",backdropFilter:"blur(8px)",borderRadius:16,padding:"10px 18px",border:"0.5px solid rgba(100,223,223,0.2)",display:"flex",alignItems:"center",gap:8}}>
            <MapPin size={14} color={TEAL} strokeWidth={1.5}/>
            <span style={{fontSize:14,fontWeight:700,color:"#ffffff"}}>{dest||"מפה"}</span>
          </div>
          <button onClick={()=>window.open(`https://www.google.com/maps/search/${encDest}`,"_blank")}
            style={{background:"linear-gradient(135deg,#4285F4,#34A853)",border:"none",borderRadius:12,padding:"8px 18px",color:"#ffffff",fontFamily:RF,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:7}}>
            <Map size={14} strokeWidth={2}/> {lang==="he"?"פתח ב-Google Maps":"Open in Google Maps"}
          </button>
        </div>

        {/* Decorative pins — scattered on "map" */}
        {allPlaced.slice(0,8).map((exp,i)=>{
          const cat=CATS.find(c=>c.id===exp.category);
          const color=PIN_COLORS[exp.category]||"#94a3b8";
          const positions=[
            {top:"22%",left:"52%"},{top:"30%",left:"70%"},{top:"38%",left:"38%"},
            {top:"48%",left:"62%"},{top:"55%",left:"30%"},{top:"60%",left:"72%"},
            {top:"68%",left:"45%"},{top:"32%",left:"22%"},
          ];
          const pos=positions[i%positions.length];
          return(
            <div key={exp.id} style={{position:"absolute",...pos,transform:"translate(-50%,-100%)",display:"flex",flexDirection:"column",alignItems:"center",zIndex:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:`${color}22`,border:`1.5px solid ${color}99`,backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 12px ${color}33`}}>
                {cat?.Icon?<cat.Icon size={16} color={color} strokeWidth={1.5}/>:<MapPin size={16} color={color} strokeWidth={1.5}/>}
              </div>
              <div style={{width:2,height:8,background:`${color}80`}}/>
              <div style={{width:5,height:5,borderRadius:"50%",background:color,opacity:0.7}}/>
            </div>
          );
        })}

        {/* Empty state overlay (no expenses with addresses) */}
        {allPlaced.length===0&&(
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px"}}>
            <div style={{background:"rgba(13,33,55,0.88)",backdropFilter:"blur(8px)",borderRadius:20,padding:"28px 24px",textAlign:"center",border:"0.5px solid rgba(100,223,223,0.15)"}}>
              <Map size={36} color="rgba(100,223,223,0.4)" strokeWidth={1} style={{margin:"0 auto 12px",display:"block"}}/>
              <div style={{fontSize:14,fontWeight:700,color:"#ffffff",marginBottom:6}}>{lang==="he"?"אין מקומות ממופים":"No mapped places"}</div>
              <div style={{fontSize:12,color:W35,lineHeight:1.5}}>{lang==="he"?"הוסף כתובות להוצאות\nכדי לראות אותן כאן":"Add addresses to expenses\nto see them here"}</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom sheet ───────────────────────────── */}
      {allPlaced.length>0&&(
        <div style={{background:"rgba(9,25,40,0.97)",borderTop:"0.5px solid rgba(100,223,223,0.12)",padding:"14px 18px 18px",flexShrink:0}}>
          {/* Handle */}
          <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
            <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,0.15)"}}/>
          </div>
          {/* Header row */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:12}}>
            <div style={{fontSize:20,fontWeight:800,color:"#ffffff",letterSpacing:"-0.5px"}}>{fmtAmt(totalPlaced,dc,{})}</div>
            <div style={{fontSize:12,fontWeight:600,color:W40}}>{lang==="he"?"הוצאות ממופות":"Mapped expenses"}</div>
          </div>
          {/* Horizontal scroll cards */}
          <div style={{display:"flex",gap:10,overflowX:"auto",scrollbarWidth:"none",paddingBottom:4}}>
            {allPlaced.map(exp=>{
              const cat=CATS.find(c=>c.id===exp.category);
              const color=PIN_COLORS[exp.category]||"#94a3b8";
              return(
                <div key={exp.id}
                  onClick={()=>window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(exp.address)}`,"_blank")}
                  style={{flexShrink:0,background:"rgba(255,255,255,0.05)",border:"0.5px solid rgba(255,255,255,0.09)",borderRadius:14,padding:"12px 14px",minWidth:130,cursor:"pointer",display:"flex",flexDirection:"column",gap:6}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#ffffff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:120}}>{exp.description||catLabel(exp.category,lang)}</div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{fontSize:14,fontWeight:800,color:color}}>{fmtAmt(exp.amountILS,dc,{})}</div>
                    <div style={{width:28,height:28,borderRadius:8,background:`${color}18`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {cat?.Icon?<cat.Icon size={14} color={color} strokeWidth={1.5}/>:<MapPin size={14} color={color} strokeWidth={1.5}/>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TripPlan({trips:initialTrips,onSaveTrip,onDeleteTrip,onShareTrip,onRemoveShare,onLogout,userEmail,userId}){
  const{lang,setLang}=useLang();
  const[trips,setTrips]=useState(initialTrips);
  const[activeId,setActiveId]=useState(null);
  const[section,setSection]=useState(null); // null=splash | "budget" | "trip"
  const[screen,setScreen]=useState("expenses");
  const[shareModal,setShareModal]=useState(null);
  const[shareEmail,setShareEmail]=useState("");
  const[shareMsg,setShareMsg]=useState("");
  const[shareViewOnly,setShareViewOnly]=useState(false);
  const[inspireModal,setInspireModal]=useState(false);
  const[inspireHidden,setInspireHidden]=useState(new Set());
  const[inspireLink,setInspireLink]=useState(null);
  const[inspireSaving,setInspireSaving]=useState(false);
  const[showConverter,setShowConverter]=useState(false);
  const[convAmount,setConvAmount]=useState("");
  const[convFrom,setConvFrom]=useState("USD");
  const[convTo,setConvTo]=useState("ILS");
  const[inviteViewOnly,setInviteViewOnly]=useState(false);
  const[inviteGenerating,setInviteGenerating]=useState(false);
  const[inviteDeleting,setInviteDeleting]=useState(false);
  const[inviteCopied,setInviteCopied]=useState(false);
  const[inviteJoinMsg,setInviteJoinMsg]=useState(null);
  const[sideMenu,setSideMenu]=useState(false);
  const{rates,allCodes,info,toILS}=useRates();
  const{permission,subscribed,subscribe}=usePushNotifications(userId);

  // sync incoming trips from Firestore
  useEffect(()=>{
    setTrips(initialTrips);
  },[initialTrips]);

  // ── Process invite token from URL or localStorage ──
  useEffect(()=>{
    if(!userEmail) return;
    const params=new URLSearchParams(window.location.search);
    let token=params.get("invite");
    if(!token){
      token=localStorage.getItem("pendingInvite");
      if(token) localStorage.removeItem("pendingInvite");
    }
    if(!token) return;
    window.history.replaceState({},"",window.location.pathname);
    fetch("/api/join-trip",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({token,userEmail}),
    }).then(r=>r.json()).then(data=>{
      if(data.tripId){
        setInviteJoinMsg(data.destination
          ? (lang==="he"?`הצטרפת לטיול ל${data.destination}! 🎉`:`Joined trip to ${data.destination}! 🎉`)
          : (lang==="he"?"הצטרפת לטיול! 🎉":"Joined the trip! 🎉"));
        setActiveId(data.tripId);
        setSection(null);
        setTimeout(()=>setInviteJoinMsg(null),4000);
      }
    }).catch(()=>{});
  },[userEmail]);

  // ── Generate invite link (via server API to avoid Firestore client perms) ──
  const generateInviteToken=async(tripId,role)=>{
    setInviteGenerating(true);
    try{
      const res=await fetch("/api/invite",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({tripId,role:role||"edit",userId,userEmail}),
      });
      const data=await res.json();
      if(data.token){
        const trip=trips.find(t=>t.id===tripId);
        if(trip) onSaveTrip({...trip,inviteToken:data.token,inviteTokenRole:role||"edit",updatedAt:Date.now()});
        setTrips(ts=>ts.map(t=>t.id===tripId?{...t,inviteToken:data.token,inviteTokenRole:role||"edit"}:t));
        // Auto-copy to clipboard
        const url=`https://tulon.co.il?invite=${data.token}`;
        try{await navigator.clipboard.writeText(url);setInviteCopied(true);setTimeout(()=>setInviteCopied(false),2500);}catch(_){}
      }else{console.error("invite create failed",data);}
    }catch(e){console.error(e);}
    setInviteGenerating(false);
  };

  // ── Delete invite link (via server API) ──
  const deleteInviteToken=async(tripId)=>{
    setInviteDeleting(true);
    try{
      const trip=trips.find(t=>t.id===tripId);
      if(trip?.inviteToken){
        await fetch("/api/invite",{
          method:"DELETE",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({token:trip.inviteToken,userId,userEmail}),
        });
      }
      const{inviteToken:_,inviteTokenRole:__,...rest}=trip||{};
      onSaveTrip({...rest,id:tripId,updatedAt:Date.now()});
      setTrips(ts=>ts.map(t=>t.id===tripId?{...t,inviteToken:undefined,inviteTokenRole:undefined}:t));
    }catch(e){console.error(e);}
    setInviteDeleting(false);
  };

  const active=trips.find(t=>t.id===activeId);
  const expenses=active?.expenses||[];

  const updTrip=useCallback((patch)=>{
    setTrips((ts)=>ts.map(t=>t.id===activeId?{...t,...patch}:t));
    const updated=trips.find(t=>t.id===activeId);
    if(updated) onSaveTrip({...updated,...patch});
  },[activeId,trips,onSaveTrip]);

  const addExp=useCallback((e)=>{
    setTrips((ts)=>{
      const next=ts.map(t=>{
        if(t.id!==activeId)return t;
        return{...t,expenses:[...t.expenses,e]};
      });
      const updated=next.find(t=>t.id===activeId);
      if(updated) setTimeout(()=>onSaveTrip(updated),0);
      return next;
    });
    // Schedule flight reminder notification
    if(e.category==="flight"&&e.departureTime&&subscribed){
      const[h,m]=e.departureTime.split(":").map(Number);
      const flightDate=new Date(e.date);
      flightDate.setHours(h-3,m,0,0);
      const msUntil=flightDate.getTime()-Date.now();
      if(msUntil>0&&msUntil<24*60*60*1000){ // only if within 24h
        setTimeout(()=>{
          sendPushToUser(userId,"🔔 הגעה לשדה התעופה!",`טיסתך ב-${e.departureTime} – הגיע הזמן לצאת לשדה`);
        },msUntil);
      }
    }
    // Notify shared trip members about new expense
    const active=trips.find(t=>t.id===activeId);
    if(active?.sharedWith?.length>0&&e.isShared!==false){
      const cat=CATS.find(c=>c.id===e.category);
      sendPushToUser(userId,`${cat?.icon||""} הוצאה חדשה בטיולון`,`${cat?.label}: ₪${e.amountILS?.toFixed(0)||""} נוסף לטיול ${active.destination||""}`);
    }
  },[activeId,onSaveTrip,subscribed,userId,trips]);

  const togglePay=useCallback((id)=>{
    setTrips((ts)=>ts.map(t=>{
      if(t.id!==activeId)return t;
      const updated={...t,expenses:t.expenses.map(e=>e.id===id?{...e,paid:!e.paid}:e)};
      onSaveTrip(updated);
      return updated;
    }));
  },[activeId,onSaveTrip]);

  const delExp=useCallback((id)=>{
    setTrips((ts)=>{
      const next=ts.map(t=>{
        if(t.id!==activeId)return t;
        return{...t,expenses:t.expenses.filter(e=>e.id!==id)};
      });
      const updated=next.find(t=>t.id===activeId);
      if(updated) setTimeout(()=>onSaveTrip(updated),0);
      return next;
    });
  },[activeId,onSaveTrip]);

  const editExp=useCallback((id,patch)=>{
    setTrips((ts)=>{
      const next=ts.map(t=>{
        if(t.id!==activeId)return t;
        return{...t,expenses:t.expenses.map(e=>e.id===id?{...e,...patch}:e)};
      });
      const updated=next.find(t=>t.id===activeId);
      if(updated) setTimeout(()=>onSaveTrip(updated),0);
      return next;
    });
  },[activeId,onSaveTrip]);

  const handleShare=async(tripId)=>{
    if(!shareEmail.trim()){setShareMsg("הכנס אימייל");return;}
    try{
      await onShareTrip(tripId,shareEmail.trim(),shareViewOnly);
      setShareMsg("✅ הטיול שותף בהצלחה!");
      setShareEmail("");
      setShareViewOnly(false);
    }catch(e){setShareMsg("שגיאה, נסה שוב");}
  };

  const createInspireLink=async()=>{
    if(!active)return;
    setInspireSaving(true);
    try{
      const shareId=uid();
      const CATS_MAP=Object.fromEntries(CATS.map(c=>[c.id,c]));
      const sanitized=expenses
        .filter(e=>!inspireHidden.has(e.id))
        .map(e=>({id:e.id,category:e.category,description:e.description||"",date:e.date||"",checkIn:e.checkIn||"",checkOut:e.checkOut||"",address:e.address||""}));
      await setDoc(doc(db,"publicShares",shareId),{
        destination:active.destination,startDate:active.startDate,endDate:active.endDate,
        expenses:sanitized,createdAt:Date.now(),
      });
      setInspireLink(`${window.location.origin}/trip/${shareId}`);
    }catch(e){console.error(e);}
    setInspireSaving(false);
  };

  const handleCreate=()=>{
    const t=newTrip(userId);
    setTrips((ts)=>[...ts,t]);
    onSaveTrip(t);
    setActiveId(t.id);
    setSection(null);
    setScreen("expenses");
  };

  const handleSelect=id=>{setActiveId(id);setSection(null);setScreen("expenses");};
  const handleBack=()=>{setActiveId(null);setSection(null);setScreen("expenses");};
  const handleHome=()=>{setSection(null);};
  const handleDelete=(id)=>{setTrips((ts)=>ts.filter(t=>t.id!==id));onDeleteTrip(id);};

  const isOwner=active?.owner===userId||!active?.owner;
  const isViewOnly=!isOwner&&!!active?.viewOnlyUsers?.includes(userEmail);
  const budgetScreens=["expenses","budget"];
  const tripScreens=["calendar","discover","packing","map"];

  // ── Side menu (hamburger drawer) — defined before ALL early returns to avoid TDZ ──
  const navToScreen=(sec,scr)=>{
    if(activeId){setSection(sec);setScreen(scr);}
    setSideMenu(false);
  };
  const guideUrl=lang==="he"?"/guide-he.html":"/guide-en.html";
  const menuScreens=[
    {Icon:Calendar,    label:lang==="he"?"יומן":"Calendar",    sec:"trip",   scr:"calendar"},
    {Icon:Sparkles,    label:lang==="he"?"גלה":"Discover",     sec:"trip",   scr:"discover"},
    {Icon:Map,         label:lang==="he"?"מפה":"Map",           sec:"trip",   scr:"map"},
    {Icon:Backpack,    label:lang==="he"?"אריזה":"Packing",     sec:"trip",   scr:"packing"},
    {Icon:Receipt,     label:lang==="he"?"הוצאות":"Expenses",   sec:"budget", scr:"expenses"},
    {Icon:BarChart2,   label:lang==="he"?"תקציב":"Budget",      sec:"budget", scr:"budget"},
  ];
  const renderSideMenu=()=>(
    <>
      {/* Backdrop */}
      <div onClick={()=>setSideMenu(false)}
        style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:400,backdropFilter:"blur(2px)"}}/>
      {/* Drawer */}
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:280,background:"#0a2035",borderLeft:"0.5px solid rgba(100,223,223,0.15)",zIndex:401,display:"flex",flexDirection:"column",boxShadow:"-8px 0 40px rgba(0,0,0,0.5)",overflowY:"auto"}}>
        {/* Header */}
        <div style={{padding:"20px 20px 16px",borderBottom:"0.5px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <div style={{fontFamily:RF,fontSize:22,fontWeight:900,color:"#fff",letterSpacing:"-0.5px"}}>טיולון</div>
            <div style={{fontFamily:RF,fontSize:11,color:W35,marginTop:2,direction:"ltr",textAlign:"right"}}>{userEmail}</div>
          </div>
          <button onClick={()=>setSideMenu(false)}
            style={{background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,color:W40,fontSize:16,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        {/* Body */}
        <div style={{flex:1,padding:"12px 0"}}>
          {activeId&&(
            <>
              <div style={{padding:"4px 20px 8px",fontFamily:RF,fontSize:10,color:"rgba(100,223,223,0.4)",letterSpacing:"1px",textTransform:"uppercase"}}>
                {active?.destination||(lang==="he"?"הטיול":"Trip")}
              </div>
              <button onClick={()=>navToScreen("budget","destination")}
                style={{width:"100%",padding:"11px 20px",background:"none",border:"none",color:"rgba(255,255,255,0.8)",fontFamily:RF,fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:12,textAlign:"right"}}>
                <span style={{fontSize:18}}>⚙️</span>{lang==="he"?"הגדרות טיול":"Trip Settings"}
              </button>
              <button onClick={()=>{setShareModal(activeId);setShareEmail("");setShareMsg("");setSideMenu(false);}}
                style={{width:"100%",padding:"11px 20px",background:"none",border:"none",color:"rgba(255,255,255,0.8)",fontFamily:RF,fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:12,textAlign:"right"}}>
                <span style={{fontSize:18}}>🔗</span>{lang==="he"?"שתף טיול":"Share Trip"}
              </button>
              <div style={{margin:"10px 20px",height:"0.5px",background:"rgba(255,255,255,0.06)"}}/>
              <div style={{padding:"4px 20px 8px",fontFamily:RF,fontSize:10,color:"rgba(100,223,223,0.4)",letterSpacing:"1px",textTransform:"uppercase"}}>
                {lang==="he"?"מסכים":"Screens"}
              </div>
              {menuScreens.map(({Icon:MIcon,label,sec,scr})=>{
                const isCur=section===sec&&screen===scr;
                return(
                  <button key={scr} onClick={()=>navToScreen(sec,scr)}
                    style={{width:"100%",padding:"10px 20px",background:isCur?"rgba(100,223,223,0.08)":"none",border:"none",borderRight:isCur?`3px solid ${TEAL}`:"3px solid transparent",color:isCur?TEAL:"rgba(255,255,255,0.7)",fontFamily:RF,fontSize:14,fontWeight:isCur?700:400,cursor:"pointer",display:"flex",alignItems:"center",gap:12,textAlign:"right",transition:"all 0.15s"}}>
                    {MIcon&&<MIcon size={17} strokeWidth={1.5} color={isCur?TEAL:"rgba(255,255,255,0.7)"}/>}{label}
                  </button>
                );
              })}
              <div style={{margin:"10px 20px",height:"0.5px",background:"rgba(255,255,255,0.06)"}}/>
            </>
          )}
          <button onClick={()=>{window.open(guideUrl,"_blank");setSideMenu(false);}}
            style={{width:"100%",padding:"11px 20px",background:"none",border:"none",color:"rgba(255,255,255,0.8)",fontFamily:RF,fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:12,textAlign:"right"}}>
            <span style={{fontSize:18}}>📖</span>{lang==="he"?"חוברת הסבר":"User Guide"}
          </button>
          <div style={{padding:"10px 20px",display:"flex",gap:8}}>
            {["he","en"].map(l=>(
              <button key={l} onClick={()=>{setLang(l);setSideMenu(false);}}
                style={{flex:1,padding:"8px",borderRadius:10,border:`0.5px solid ${lang===l?"rgba(100,223,223,0.5)":"rgba(255,255,255,0.1)"}`,background:lang===l?"rgba(100,223,223,0.1)":"transparent",color:lang===l?TEAL:W40,fontFamily:RF,fontWeight:700,fontSize:13,cursor:"pointer"}}>
                {l==="he"?"🇮🇱 עברית":"🇬🇧 English"}
              </button>
            ))}
          </div>
        </div>
        {/* Footer */}
        <div style={{padding:"12px 0",borderTop:"0.5px solid rgba(255,255,255,0.06)",flexShrink:0}}>
          <button onClick={()=>{window.open("/privacy","_blank");setSideMenu(false);}}
            style={{width:"100%",padding:"10px 20px",background:"none",border:"none",color:W35,fontFamily:RF,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:10,textAlign:"right"}}>
            <span>🔒</span>{lang==="he"?"מדיניות פרטיות":"Privacy Policy"}
          </button>
          <button onClick={()=>{window.open("/contact","_blank");setSideMenu(false);}}
            style={{width:"100%",padding:"10px 20px",background:"none",border:"none",color:W35,fontFamily:RF,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:10,textAlign:"right"}}>
            <span>✉️</span>{lang==="he"?"צור קשר":"Contact"}
          </button>
          <button onClick={()=>{onLogout();setSideMenu(false);}}
            style={{width:"100%",padding:"10px 20px",background:"none",border:"none",color:"rgba(255,107,107,0.7)",fontFamily:RF,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:10,textAlign:"right"}}>
            <span>🚪</span>{lang==="he"?"התנתקות":"Sign out"}
          </button>
        </div>
      </div>
    </>
  );

  if(!activeId){
    return(
      <>
        <style>{GS}</style>
        <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",fontFamily:RF}}>
          {/* user bar */}
          <div style={{background:"rgba(0,0,0,0.4)",padding:"10px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"0.5px solid rgba(100,223,223,0.1)"}}>
            <div style={{display:"flex",flexDirection:"column"}}>
              <span style={{fontFamily:RF,color:"#ffffff",fontSize:20,fontWeight:800,letterSpacing:"-0.5px",lineHeight:1}}>{t("app_name",lang)}</span>
              <span style={{fontFamily:RF,color:W35,fontSize:10,fontWeight:300,letterSpacing:"0.5px",marginTop:3}}>{t("app_subtitle",lang)}</span>
            </div>
            <button onClick={()=>setLang(lang==="he"?"en":"he")} title={lang==="he"?"Switch to English":"עבור לעברית"}
              style={{background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:20,padding:"4px 10px",cursor:"pointer",fontSize:18,lineHeight:1,display:"flex",alignItems:"center",gap:5}}>
              <span>{lang==="he"?"🇮🇱":"🇺🇸"}</span>
              <span style={{fontFamily:RF,fontSize:10,color:W35,fontWeight:500}}>{lang==="he"?"EN":"עב"}</span>
            </button>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <button onClick={()=>setShowConverter(c=>!c)} style={{background:"rgba(100,223,223,0.1)",border:"0.5px solid rgba(100,223,223,0.25)",borderRadius:8,color:TEAL,fontFamily:RF,fontWeight:600,fontSize:11,padding:"5px 10px",cursor:"pointer"}}>💱</button>
              <button onClick={subscribe} title={subscribed?t("notif_active",lang):t("notif_enable",lang)} style={{background:subscribed?"rgba(74,222,128,0.12)":"rgba(100,223,223,0.1)",border:`0.5px solid ${subscribed?"rgba(74,222,128,0.3)":"rgba(100,223,223,0.25)"}`,borderRadius:8,color:subscribed?"#4ade80":TEAL,fontFamily:RF,fontWeight:600,fontSize:11,padding:"5px 10px",cursor:"pointer"}}>{subscribed?"🔔":"🔕"}</button>
            </div>
          </div>
          {/* Currency Converter */}
          {showConverter&&<CurrencyConverter rates={rates} onClose={()=>setShowConverter(false)} tripCurrencies={trips[0]?.currencies||["ILS","USD","EUR"]}/>}
          <TripSelectorScreen trips={trips} onSelect={handleSelect} onCreate={handleCreate} onDelete={handleDelete} userId={userId} rates={rates}/>
        </div>
      </>
    );
  }

  // ── Shared header button style ──
  const hBtn=(extra={})=>({background:"rgba(100,223,223,0.1)",border:"0.5px solid rgba(100,223,223,0.25)",borderRadius:8,color:TEAL,fontFamily:RF,fontWeight:600,fontSize:12,padding:"5px 10px",cursor:"pointer",...extra});

  // ── Share modal renderer ──
  const renderShareModal=()=>shareModal&&(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#0d2f4a",border:"0.5px solid rgba(100,223,223,0.25)",borderRadius:20,padding:24,width:"100%",maxWidth:400,boxShadow:"0 20px 60px rgba(0,0,0,0.6)",maxHeight:"88vh",overflowY:"auto"}}>
        <h3 style={{fontFamily:RF,fontSize:18,fontWeight:700,color:"#ffffff",marginBottom:4}}>{t("share_title",lang)}</h3>
        <p style={{fontSize:12,color:W40,marginBottom:16,fontFamily:RF}}>{t("share_email_sub",lang)}</p>
        {trips.find(tr=>tr.id===shareModal)?.sharedWith?.length>0&&(
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginBottom:8,fontFamily:RF,letterSpacing:"0.5px",textTransform:"uppercase"}}>{t("share_with",lang)}</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {trips.find(tr=>tr.id===shareModal)?.sharedWith?.map(email=>{
                const isVO=trips.find(tr=>tr.id===shareModal)?.viewOnlyUsers?.includes(email);
                return(
                  <div key={email} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(100,223,223,0.06)",border:"0.5px solid rgba(100,223,223,0.2)",borderRadius:10,padding:"7px 12px"}}>
                    <span style={{fontSize:12,color:TEAL,fontFamily:RF,direction:"ltr",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{email}</span>
                    <button onClick={()=>onShareTrip(shareModal,email,!isVO)}
                      style={{fontSize:11,color:isVO?"rgba(251,191,36,0.9)":"rgba(74,222,128,0.9)",background:isVO?"rgba(251,191,36,0.12)":"rgba(74,222,128,0.12)",border:`0.5px solid ${isVO?"rgba(251,191,36,0.3)":"rgba(74,222,128,0.3)"}`,borderRadius:999,padding:"3px 10px",fontFamily:RF,flexShrink:0,cursor:"pointer"}}>
                      {isVO?(lang==="he"?"🔓 אפשר עריכה":"🔓 Allow edit"):(lang==="he"?"🔒 הגבל לצפייה":"🔒 Limit to view")}
                    </button>
                    <button onClick={()=>onRemoveShare(shareModal,email)}
                      style={{background:"rgba(255,107,107,0.12)",border:"0.5px solid rgba(255,107,107,0.25)",color:"#ff6b6b",borderRadius:8,padding:"3px 8px",cursor:"pointer",fontSize:13,flexShrink:0}}>✕</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <input value={shareEmail} onChange={e=>setShareEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleShare(shareModal)}
          placeholder="אימייל@example.com" type="email"
          style={{width:"100%",padding:"12px 14px",borderRadius:12,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:RF,fontSize:14,direction:"ltr",color:"#ffffff",background:W07,outline:"none",marginBottom:10}}
          onFocus={e=>(e.target.style.borderColor=TEAL)} onBlur={e=>(e.target.style.borderColor=TBB)}/>
        {shareMsg&&(
          <div style={{marginBottom:10}}>
            <div style={{fontSize:12,color:shareMsg.startsWith("✅")?"#4ade80":"#ff6b6b",marginBottom:shareMsg.startsWith("✅")?10:0,fontFamily:RF,fontWeight:500}}>{shareMsg}</div>
            {shareMsg.startsWith("✅")&&(
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <button onClick={()=>{const url="https://tulon.co.il";const text=`הוזמנת לטיול "${trips.find(tr=>tr.id===shareModal)?.destination||""}" בטיולון! היכנס עם האימייל ${shareEmail||""} :\n${url}`;window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,"_blank");}} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:"#25D366",color:"#ffffff",fontFamily:RF,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Share2 size={14} color="#ffffff" strokeWidth={2}/> {lang==="he"?"שלח בוואטסאפ":"Send WhatsApp"}</button>
                <button onClick={()=>{const url="https://tulon.co.il";const text=`הוזמנת לטיול "${trips.find(tr=>tr.id===shareModal)?.destination||""}" בטיולון! היכנס עם האימייל ${shareEmail||""} : ${url}`;navigator.clipboard.writeText(text);setShareMsg(lang==="he"?"הועתק ללוח!":"Copied!");}} style={{flex:1,padding:"10px",borderRadius:10,border:"0.5px solid rgba(100,223,223,0.3)",background:"rgba(100,223,223,0.08)",color:TEAL,fontFamily:RF,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Copy size={14} color={TEAL} strokeWidth={2}/> {lang==="he"?"העתק לינק":"Copy link"}</button>
              </div>
            )}
          </div>
        )}
        <div onClick={()=>setShareViewOnly(v=>!v)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderRadius:12,border:`0.5px solid ${shareViewOnly?"rgba(251,191,36,0.4)":"rgba(255,255,255,0.1)"}`,background:shareViewOnly?"rgba(251,191,36,0.07)":W05,cursor:"pointer",marginBottom:12,userSelect:"none"}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:shareViewOnly?"rgba(251,191,36,0.9)":"rgba(255,255,255,0.7)",fontFamily:RF}}>{lang==="he"?"👁️ לצפייה בלבד":"👁️ View only"}</div>
            <div style={{fontSize:11,color:W35,fontFamily:RF,marginTop:2}}>{lang==="he"?"לא יראה הוצאות ותקציב":"Won't see expenses & budget"}</div>
          </div>
          <div style={{width:36,height:20,borderRadius:999,background:shareViewOnly?"rgba(251,191,36,0.7)":"rgba(255,255,255,0.15)",position:"relative",transition:"background 0.2s",flexShrink:0}}>
            <div style={{position:"absolute",top:3,right:shareViewOnly?3:"auto",left:shareViewOnly?"auto":3,width:14,height:14,borderRadius:"50%",background:"#fff",transition:"all 0.2s"}}/>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>handleShare(shareModal)} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:TEAL,color:DARK_BG,fontFamily:RF,fontWeight:700,fontSize:14,cursor:"pointer"}}>{t("share",lang)} ✓</button>
          <button onClick={()=>{setShareModal(null);setShareEmail("");setShareMsg("");setShareViewOnly(false);}} style={{flex:1,padding:"12px",borderRadius:12,border:"0.5px solid rgba(255,255,255,0.15)",background:W05,fontFamily:RF,fontWeight:600,fontSize:13,cursor:"pointer",color:W50}}>{t("close",lang)}</button>
        </div>

        {/* ── Invite link section ── */}
        {(()=>{
          const shareTripObj=trips.find(tr=>tr.id===shareModal);
          const existingToken=shareTripObj?.inviteToken;
          const inviteUrl=existingToken?`https://tulon.co.il?invite=${existingToken}`:"";
          const dest=shareTripObj?.destination||"";
          return(
            <>
              <div style={{margin:"18px 0 14px",height:"0.5px",background:"rgba(255,255,255,0.1)"}}/>
              <div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.6)",fontFamily:RF,marginBottom:10}}>
                🔗 {lang==="he"?"קישור הזמנה פתוח":"Open Invite Link"}
              </div>
              {!existingToken?(
                <>
                  <div onClick={()=>setInviteViewOnly(v=>!v)}
                    style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderRadius:12,border:`0.5px solid ${inviteViewOnly?"rgba(251,191,36,0.4)":"rgba(255,255,255,0.1)"}`,background:inviteViewOnly?"rgba(251,191,36,0.07)":W05,cursor:"pointer",marginBottom:10,userSelect:"none"}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:inviteViewOnly?"rgba(251,191,36,0.9)":"rgba(255,255,255,0.7)",fontFamily:RF}}>👁️ {lang==="he"?"לצפייה בלבד":"View only"}</div>
                      <div style={{fontSize:11,color:W35,fontFamily:RF,marginTop:2}}>{lang==="he"?"לא יראו הוצאות ותקציב":"Won't see expenses & budget"}</div>
                    </div>
                    <div style={{width:36,height:20,borderRadius:999,background:inviteViewOnly?"rgba(251,191,36,0.7)":"rgba(255,255,255,0.15)",position:"relative",flexShrink:0}}>
                      <div style={{position:"absolute",top:3,right:inviteViewOnly?3:"auto",left:inviteViewOnly?"auto":3,width:14,height:14,borderRadius:"50%",background:"#fff"}}/>
                    </div>
                  </div>
                  <button onClick={()=>generateInviteToken(shareModal,inviteViewOnly?"view":"edit")}
                    disabled={inviteGenerating}
                    style={{width:"100%",padding:"11px",borderRadius:12,border:"0.5px solid rgba(100,223,223,0.35)",background:"rgba(100,223,223,0.08)",color:TEAL,fontFamily:RF,fontWeight:700,fontSize:13,cursor:"pointer",opacity:inviteGenerating?0.6:1}}>
                    {inviteGenerating?(lang==="he"?"יוצר...":"Creating..."):`🔗 ${lang==="he"?"צור קישור הזמנה":"Generate Invite Link"}`}
                  </button>
                </>
              ):(
                <div style={{background:"rgba(100,223,223,0.06)",border:"0.5px solid rgba(100,223,223,0.2)",borderRadius:14,padding:"14px"}}>
                  <div style={{fontSize:11,color:W35,fontFamily:RF,marginBottom:6}}>{lang==="he"?"כל מי שיש לו את הקישור יכול להצטרף":"Anyone with this link can join"} · {shareTripObj?.inviteTokenRole==="view"?(lang==="he"?"צפייה בלבד":"View only"):(lang==="he"?"עריכה":"Edit")}</div>
                  {/* URL display — tap to copy */}
                  <div onClick={async()=>{try{await navigator.clipboard.writeText(inviteUrl);setInviteCopied(true);setTimeout(()=>setInviteCopied(false),2500);}catch(_){}}}
                    style={{fontFamily:"monospace",fontSize:11,color:TEAL,wordBreak:"break-all",marginBottom:10,background:W05,padding:"8px 10px",borderRadius:8,direction:"ltr",cursor:"pointer",userSelect:"all"}}>
                    {inviteUrl}
                  </div>
                  {/* Copied confirmation */}
                  {inviteCopied&&<div style={{fontSize:12,color:"#4ade80",fontFamily:RF,fontWeight:600,textAlign:"center",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><Check size={12} color="#4ade80" strokeWidth={2.5}/> {lang==="he"?"הועתק ללוח!":"Copied to clipboard!"}</div>}
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={async()=>{try{await navigator.clipboard.writeText(inviteUrl);setInviteCopied(true);setTimeout(()=>setInviteCopied(false),2500);}catch(_){}}}
                      style={{flex:1,padding:"9px",borderRadius:10,border:`0.5px solid ${inviteCopied?"rgba(74,222,128,0.5)":"rgba(100,223,223,0.3)"}`,background:inviteCopied?"rgba(74,222,128,0.1)":"rgba(100,223,223,0.08)",color:inviteCopied?"#4ade80":TEAL,fontFamily:RF,fontWeight:700,fontSize:12,cursor:"pointer",transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                      {inviteCopied?<><Check size={12} color="#4ade80" strokeWidth={2.5}/>{lang==="he"?"הועתק":"Copied"}</>:<><Copy size={12} color={TEAL} strokeWidth={2}/>{lang==="he"?"העתק":"Copy"}</>}
                    </button>
                    <button onClick={()=>{
                      const waText=lang==="he"
                        ?`הוזמנת להצטרף לטיול${dest?` ל${dest}`:""}! לחץ על הקישור:\n${inviteUrl}`
                        :`You're invited to join a trip${dest?` to ${dest}`:""}! Click the link:\n${inviteUrl}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`,"_blank");
                    }}
                      style={{flex:1,padding:"9px",borderRadius:10,border:"none",background:"#25D366",color:"#fff",fontFamily:RF,fontWeight:700,fontSize:12,cursor:"pointer"}}>
                      📲 {lang==="he"?"וואטסאפ":"WhatsApp"}
                    </button>
                    <button onClick={()=>deleteInviteToken(shareModal)} disabled={inviteDeleting}
                      style={{padding:"9px 12px",borderRadius:10,border:"0.5px solid rgba(255,107,107,0.3)",background:"rgba(255,107,107,0.08)",color:"#ff6b6b",fontFamily:RF,fontWeight:700,fontSize:12,cursor:"pointer",opacity:inviteDeleting?0.6:1}}>
                      {inviteDeleting?"...":"🗑️"}
                    </button>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );

  // ── Inspire modal renderer ──
  const renderInspireModal=()=>inspireModal&&(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#0d2f4a",border:"0.5px solid rgba(251,191,36,0.3)",borderRadius:20,padding:24,width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,0.6)",maxHeight:"85vh",overflowY:"auto"}}>
        <h3 style={{fontFamily:RF,fontSize:18,fontWeight:700,color:"#ffffff",marginBottom:4}}>{t("inspire_title",lang)}</h3>
        <p style={{fontSize:12,color:W40,marginBottom:16,fontFamily:RF}}>{t("inspire_sub",lang)}</p>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
          {expenses.length===0&&<div style={{color:W35,fontSize:13,textAlign:"center",padding:"12px 0"}}>{t("inspire_no_exp",lang)}</div>}
          {expenses.map(e=>{
            const cat=CATS.find(c=>c.id===e.category);
            const hidden=inspireHidden.has(e.id);
            return(
              <div key={e.id} onClick={()=>setInspireHidden(prev=>{const n=new Set(prev);n.has(e.id)?n.delete(e.id):n.add(e.id);return n;})}
                style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:12,background:hidden?"rgba(255,255,255,0.03)":"rgba(100,223,223,0.07)",border:`0.5px solid ${hidden?"rgba(255,255,255,0.08)":"rgba(100,223,223,0.2)"}`,cursor:"pointer",opacity:hidden?0.45:1,transition:"all 0.15s"}}>
                <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${hidden?W25:TEAL}`,background:hidden?"transparent":TEAL,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {!hidden&&<Check size={11} color={DARK_BG} strokeWidth={3}/>}
                </div>
                <div style={{width:26,height:26,borderRadius:7,background:cat?.bg||W05,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {cat?.Icon?<cat.Icon size={14} color={cat.color} strokeWidth={1.5}/>:<Package size={14} color={W35} strokeWidth={1.5}/>}
                </div>
                <span style={{fontFamily:RF,fontSize:13,color:"#ffffff",flex:1}}>{e.description||cat?.label||e.category}</span>
                {e.date&&<span style={{fontSize:11,color:W35}}>{fmtDate(e.date)}</span>}
              </div>
            );
          })}
        </div>
        {!inspireLink?(
          <button onClick={createInspireLink} disabled={inspireSaving||expenses.length===0}
            style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:"#fbbf24",color:DARK_BG,fontFamily:RF,fontWeight:700,fontSize:15,cursor:"pointer",marginBottom:10,opacity:inspireSaving?0.6:1}}>
            {inspireSaving?t("inspire_saving",lang):t("inspire_btn",lang)}
          </button>
        ):(
          <div style={{background:"rgba(251,191,36,0.1)",border:"0.5px solid rgba(251,191,36,0.3)",borderRadius:14,padding:"14px",marginBottom:12}}>
            <div style={{fontSize:11,color:"rgba(251,191,36,0.7)",fontFamily:RF,marginBottom:8}}>{t("inspire_ready",lang)}</div>
            <div style={{fontFamily:"monospace",fontSize:12,color:TEAL,wordBreak:"break-all",marginBottom:12,background:W05,padding:"8px 12px",borderRadius:8}}>{inspireLink}</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>navigator.clipboard.writeText(inspireLink)} style={{flex:1,padding:"10px",borderRadius:10,border:"0.5px solid rgba(100,223,223,0.3)",background:"rgba(100,223,223,0.08)",color:TEAL,fontFamily:RF,fontWeight:700,fontSize:13,cursor:"pointer"}}>{t("copy_link",lang)}</button>
              <button onClick={()=>window.open(`https://wa.me/?text=${encodeURIComponent(`${t("inspire_wa",lang)}${active?.destination||""}${t("inspire_wa2",lang)} ${inspireLink}`)}`,"_blank")} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:"#25D366",color:"#ffffff",fontFamily:RF,fontWeight:700,fontSize:13,cursor:"pointer"}}>{t("whatsapp",lang)}</button>
            </div>
          </div>
        )}
        <button onClick={()=>{setInspireModal(false);setInspireLink(null);setInspireHidden(new Set());}} style={{width:"100%",padding:"11px",borderRadius:12,border:"0.5px solid rgba(255,255,255,0.15)",background:W05,fontFamily:RF,fontWeight:600,fontSize:13,cursor:"pointer",color:W50}}>{t("close",lang)}</button>
      </div>
    </div>
  );

  const joinBanner=inviteJoinMsg?(
    <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:999,background:"rgba(74,222,128,0.92)",backdropFilter:"blur(10px)",color:"#0d2137",fontFamily:RF,fontWeight:700,fontSize:14,padding:"12px 24px",borderRadius:14,boxShadow:"0 8px 32px rgba(0,0,0,0.3)",whiteSpace:"nowrap",textAlign:"center",pointerEvents:"none"}}>
      {inviteJoinMsg}
    </div>
  ):null;

  // ── LOADING GUARD: activeId set but trip not in state yet (Firestore not synced) ──
  if(activeId&&!active){
    return(
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:DARK_BG,fontFamily:RF}}>
        <div style={{textAlign:"center",color:"white"}}>
          <div style={{fontSize:42,fontWeight:900,letterSpacing:"-1px",marginBottom:10}}>טיולון</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.35)",fontWeight:300}}>טוען...</div>
        </div>
      </div>
    );
  }

  // ── SPLASH SCREEN (section === null) ──
  if(activeId&&!section){
    return(
      <>
        <style>{GS}</style>
        {joinBanner}
        <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",display:"flex",flexDirection:"column",background:"linear-gradient(160deg,#091928 0%,#0d2137 60%,#0a2a40 100%)",fontFamily:RF}}>
          {/* Minimal top bar — back link only */}
          <div style={{padding:"16px 20px 0",display:"flex",justifyContent:"flex-end"}}>
            <button onClick={handleBack} style={{background:"none",border:"none",color:"rgba(100,223,223,0.7)",fontFamily:RF,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
              {t("home_trips",lang)||"הטיולים שלי"} <ChevronRight size={14} color="rgba(100,223,223,0.7)" strokeWidth={2}/>
            </button>
          </div>
          {shareModal&&renderShareModal()}
          {inspireModal&&renderInspireModal()}
          {sideMenu&&renderSideMenu()}
          <div style={{flex:1,overflowY:"auto"}}>
            <TripSplashScreen trip={active} onBudget={()=>{setSection("budget");setScreen("expenses");}} onTrip={()=>{setSection("trip");setScreen("calendar");}} isViewOnly={isViewOnly} lang={lang}/>
          </div>
        </div>
      </>
    );
  }

  // ── BUDGET SECTION ──
  if(activeId&&section==="budget"){
    return(
      <>
        <style>{GS}</style>
        {joinBanner}
        <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",display:"flex",flexDirection:"column",background:DARK_BG,fontFamily:RF}}>
          {/* Header */}
          <div style={{background:"rgba(0,0,0,0.4)",padding:"12px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:"0.5px solid rgba(100,223,223,0.1)"}}>
            <button onClick={handleHome} className="tap-btn" style={hBtn({display:"flex",alignItems:"center",justifyContent:"center",padding:"6px 9px"})}><MapPin size={16} strokeWidth={1.5}/></button>
            <div style={{flex:1,textAlign:"center"}}>
              <span style={{fontFamily:RF,color:"#ffffff",fontSize:15,fontWeight:700,letterSpacing:"-0.2px"}}>{active?.destination||"טיולון"}</span>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setShowConverter(c=>!c)} className="tap-btn" style={hBtn({display:"flex",alignItems:"center",justifyContent:"center",padding:"6px 9px"})}><ArrowLeftRight size={16} strokeWidth={1.5}/></button>
              <button onClick={()=>exportTripPDF(active,expenses,lang)} className="tap-btn" style={hBtn({display:"flex",alignItems:"center",justifyContent:"center",padding:"6px 9px"})}><FileDown size={16} strokeWidth={1.5}/></button>
              <button onClick={()=>setSideMenu(true)} className="tap-btn" style={hBtn({display:"flex",alignItems:"center",justifyContent:"center",padding:"6px 9px"})}><Menu size={16} strokeWidth={1.5}/></button>
            </div>
          </div>
          {showConverter&&<CurrencyConverter rates={rates} onClose={()=>setShowConverter(false)} tripCurrencies={active?.currencies||["ILS","USD","EUR"]}/>}
          {shareModal&&renderShareModal()}
          {inspireModal&&renderInspireModal()}
          {sideMenu&&renderSideMenu()}
          <div style={{flex:1,overflowY:"auto"}}>
            {/* Trip settings button */}
            {screen!=="destination"&&(
              <div style={{padding:"12px 14px 0"}}>
                <button onClick={()=>setScreen("destination")} style={{width:"100%",padding:"12px 16px",borderRadius:12,border:"0.5px solid rgba(100,223,223,0.25)",background:"rgba(100,223,223,0.06)",color:TEAL,fontFamily:RF,fontWeight:600,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  ⚙️ {lang==="he"?"הגדרות טיול":"Trip Settings"}
                </button>
              </div>
            )}
            <div key={screen} className="screen-enter">
              {screen==="destination"&&<DestinationScreen trip={active} onUpdate={updTrip} onNext={()=>setScreen("expenses")} allCodes={allCodes} rates={rates}/>}
              {screen==="expenses"&&<ExpensesScreen trip={active} expenses={expenses} onAdd={addExp} onEdit={editExp} onTogglePaid={togglePay} onDelete={delExp} toILS={toILS} rates={rates} ratesInfo={info}/>}
              {screen==="budget"&&<BudgetScreen trip={active} expenses={expenses} rates={rates}/>}
            </div>
          </div>
          {screen!=="destination"&&<NavBar screens={budgetScreens} current={screen} onNav={setScreen}/>}
        </div>
      </>
    );
  }

  // ── TRIP SECTION ──
  if(activeId&&section==="trip"){
    return(
      <>
        <style>{GS}</style>
        {joinBanner}
        <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",display:"flex",flexDirection:"column",background:DARK_BG,fontFamily:RF}}>
          {/* Header */}
          <div style={{background:"rgba(0,0,0,0.4)",padding:"12px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:"0.5px solid rgba(100,223,223,0.1)"}}>
            <button onClick={handleHome} className="tap-btn" style={hBtn({display:"flex",alignItems:"center",justifyContent:"center",padding:"6px 9px"})}><MapPin size={16} strokeWidth={1.5}/></button>
            <div style={{flex:1,textAlign:"center"}}>
              <span style={{fontFamily:RF,color:"#ffffff",fontSize:15,fontWeight:700,letterSpacing:"-0.2px"}}>{active?.destination||"טיולון"}</span>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setShowConverter(c=>!c)} className="tap-btn" style={hBtn({display:"flex",alignItems:"center",justifyContent:"center",padding:"6px 9px"})}><ArrowLeftRight size={16} strokeWidth={1.5}/></button>
              <button onClick={()=>setSideMenu(true)} className="tap-btn" style={hBtn({display:"flex",alignItems:"center",justifyContent:"center",padding:"6px 9px"})}><Menu size={16} strokeWidth={1.5}/></button>
            </div>
          </div>
          {showConverter&&<CurrencyConverter rates={rates} onClose={()=>setShowConverter(false)} tripCurrencies={active?.currencies||["ILS","USD","EUR"]}/>}
          {shareModal&&renderShareModal()}
          {inspireModal&&renderInspireModal()}
          {sideMenu&&renderSideMenu()}
          <div style={{flex:1,overflowY:"auto"}}>
            <div key={screen} className="screen-enter">
              {screen==="calendar"&&<CalendarScreen trip={active} expenses={expenses} onSaveActs={acts=>updTrip({activities:acts})}/>}
              {screen==="discover"&&<DiscoverScreen trip={active}/>}
              {screen==="packing"&&<PackingListScreen trip={active} onUpdate={updTrip}/>}
              {screen==="map"&&<MapScreen trip={active} expenses={expenses}/>}
            </div>
          </div>
          <NavBar screens={tripScreens} current={screen} onNav={setScreen}/>
        </div>
      </>
    );
  }

  // fallback
  return null;
}
