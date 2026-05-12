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

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

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
  {id:"flight",label:"טיסה",icon:"✈️",color:TEAL},
  {id:"hotel",label:"מלון",icon:"🏨",color:"#48b5c4"},
  {id:"attraction",label:"אטרקציות",icon:"🎡",color:"#ff6b6b"},
  {id:"food",label:"אוכל",icon:"🍜",color:"#fbbf24"},
  {id:"taxi",label:"מונית",icon:"🚕",color:"#4ade80"},
  {id:"other",label:"אחר",icon:"📦",color:W35},
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
const CURR_SYMBOLS={
  ILS:"₪",USD:"$",EUR:"€",GBP:"£",JPY:"¥",THB:"฿",TRY:"₺",
  CHF:"Fr",CAD:"C$",AUD:"A$",INR:"₹",BRL:"R$",SGD:"S$",HKD:"HK$",
  SEK:"kr",NOK:"kr",DKK:"kr",PLN:"zł",CNY:"¥",KRW:"₩",RUB:"₽",
};
const getCurrLabel=(code)=>CURRENCY_NAMES[code]||code;
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
const remTime=(t)=>{if(!t)return null;const[h,m]=t.split(":").map(Number),tot=h*60+m-300;if(tot<0)return null;return`${String(Math.floor(tot/60)).padStart(2,"0")}:${String(tot%60).padStart(2,"0")}`;};

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

function NavBar({screens,current,onNav}){
  const labels=["יעד","הוצאות","תקציב","לוח שנה"],icons=["🌴","💳","💰","📅"];
  return(
    <div style={{display:"flex",background:"rgba(0,0,0,0.35)",borderTop:"0.5px solid rgba(100,223,223,0.1)",position:"sticky",bottom:0,zIndex:100,backdropFilter:"blur(10px)"}}>
      {screens.map((s,i)=>(
        <button key={s} onClick={()=>onNav(s)} style={{flex:1,padding:"10px 4px 8px",border:"none",background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,borderTop:current===s?"2px solid #64dfdf":"2px solid transparent",transition:"all 0.2s"}}>
          <div style={{width:32,height:32,borderRadius:10,background:current===s?TBL:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,transition:"all 0.2s"}}>{icons[i]}</div>
          <span style={{fontSize:10,fontWeight:600,color:current===s?TEAL:W25,fontFamily:RF,letterSpacing:"0.3px"}}>{labels[i]}</span>
        </button>
      ))}
    </div>
  );
}

const Card=({children,style})=><div style={{background:W05,border:"0.5px solid rgba(100,223,223,0.18)",borderRadius:16,padding:"16px",...style}}>{children}</div>;
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
    <button onClick={onClick} disabled={disabled} style={{padding:small?"8px 14px":"13px 20px",borderRadius:12,border,background:disabled?C.sandDark:bg,color:disabled?C.muted:col,fontFamily:RF,fontWeight:700,fontSize:small?13:15,cursor:disabled?"default":"pointer",transition:"all 0.2s",opacity:disabled?0.6:1,...style}}>
      {children}
    </button>
  );
}

function PieChart({data}){
  const total=data.reduce((s,d)=>s+d.value,0);
  if(!total)return null;
  let cum=-Math.PI/2;
  const slices=data.map(d=>{const a=(d.value/total)*2*Math.PI,s=cum;cum+=a;return{...d,s,e:cum};});
  const R=80,cx=100,cy=100;
  const arc=(s,e,r)=>{if(e-s>=2*Math.PI-0.001)e=s+2*Math.PI-0.001;const x1=cx+r*Math.cos(s),y1=cy+r*Math.sin(s),x2=cx+r*Math.cos(e),y2=cy+r*Math.sin(e),lg=e-s>Math.PI?1:0;return`M${cx} ${cy}L${x1} ${y1}A${r} ${r} 0 ${lg} 1 ${x2} ${y2}Z`;};
  const[hov,setHov]=useState(null);
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
      <svg viewBox="0 0 200 200" style={{width:170,height:170}}>
        {slices.map((s,i)=>(
          <path key={i} d={arc(s.s,s.e,hov===i?R+5:R)} fill={s.color} stroke={C.white} strokeWidth={2}
            style={{cursor:"pointer",transition:"all 0.15s",filter:hov===i?"drop-shadow(0 4px 8px rgba(0,0,0,0.18))":"none"}}
            onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
            onTouchStart={()=>setHov(i)} onTouchEnd={()=>setTimeout(()=>setHov(null),1200)}/>
        ))}
        <text x={cx} y={cy-8} textAnchor="middle" fontFamily="Rubik,sans-serif" fontSize={11} fill="#ffffff" fontWeight={700}>{hov!==null?slices[hov].label:'סה"כ'}</text>
        <text x={cx} y={cy+10} textAnchor="middle" fontFamily="Rubik,sans-serif" fontSize={13} fill={TEAL} fontWeight={900}>{hov!==null?`₪${slices[hov].value.toFixed(0)}`:`₪${total.toFixed(0)}`}</text>
        {hov!==null&&<text x={cx} y={cy+26} textAnchor="middle" fontFamily="Rubik,sans-serif" fontSize={9} fill={W40}>{((slices[hov].value/total)*100).toFixed(1)}%</text>}
      </svg>
      <div style={{display:"flex",flexWrap:"wrap",gap:"6px 12px",justifyContent:"center",maxWidth:260}}>
        {slices.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",opacity:hov!==null&&hov!==i?0.4:1,transition:"opacity 0.15s"}}
            onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}>
            <div style={{width:11,height:11,borderRadius:3,background:s.color,flexShrink:0}}/>
            <span style={{fontSize:12,fontWeight:700}}>{s.icon} {s.label}</span>
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
          <div style={{fontFamily:RF,fontSize:13,fontWeight:700,color:TEAL}}>💱 מחשבון המרת מטבע</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:W40,fontSize:16,cursor:"pointer"}}>✕</button>
        </div>
        {/* Amount input */}
        <input value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder="הכנס סכום..." min="0"
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

function exportTripPDF(trip,expenses){
  if(!trip) return;
  const CATS_MAP=Object.fromEntries(CATS.map(c=>[c.id,c]));
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

  const html=`<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<title>טיולון – ${trip.destination||"טיול"}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Rubik',Arial,sans-serif;background:#f8fafc;color:#1a2b35;direction:rtl;font-size:14px;line-height:1.5;}
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
  <div class="logo">טיולון</div>
  <div class="logo-sub">מתכנן הטיולים שלי</div>
  <div class="dest">🌍 ${trip.destination||"טיול"}</div>
  <div class="dates">${fmtDate(trip.startDate)} – ${fmtDate(trip.endDate)}</div>
  <div class="badge">דוח הוצאות</div>
</div>
<div class="content">
  <div class="kpi-grid">
    <div class="kpi"><div class="kpi-val">₪${total.toFixed(0)}</div><div class="kpi-lbl">סה"כ הוצאות</div></div>
    <div class="kpi" style="border-top-color:#4ade80"><div class="kpi-val" style="color:#166534">₪${paid.toFixed(0)}</div><div class="kpi-lbl">שולם</div></div>
    <div class="kpi" style="border-top-color:#ff6b6b"><div class="kpi-val" style="color:#991b1b">₪${unpaid.toFixed(0)}</div><div class="kpi-lbl">טרם שולם</div></div>
    <div class="kpi" style="border-top-color:#fbbf24"><div class="kpi-val" style="color:#92400e">${expenses.length}</div><div class="kpi-lbl">הוצאות</div></div>
  </div>
  ${budget?`<div class="budget-box">
    <div class="budget-header"><span>💰 עמידה בתקציב</span><span style="color:#64dfdf">₪${budget.toLocaleString()}</span></div>
    <div class="budget-track"><div class="budget-fill" style="width:${budgetPct.toFixed(0)}%;background:${budgetColor}"></div></div>
    <div class="budget-footer">
      <span style="color:${budgetColor}">${budgetPct.toFixed(1)}% מהתקציב</span>
      <span style="color:${total>budget?"#ff6b6b":"#4ade80"}">${total>budget?`חריגה: ₪${(total-budget).toFixed(0)}`:`נותרו: ₪${(budget-total).toFixed(0)}`}</span>
    </div>
  </div>`:""}
  <div class="section-title">📊 פירוט לפי קטגוריה</div>
  ${byCat.map(cat=>`<div class="bar-row">
    <div class="bar-header"><span>${cat.icon} ${cat.label} (${cat.count})</span><span style="font-weight:700">₪${cat.total.toFixed(0)}</span></div>
    <div class="bar-track"><div class="bar-fill" style="width:${total>0?(cat.total/total*100).toFixed(0):0}%"></div></div>
  </div>`).join("")}
  <div class="section-title">📅 הוצאות לפי יום</div>
  ${sortedDates.map(d=>`
    <div class="day-header">${fmtDate(d)}</div>
    <table>
      <tr><th>קטגוריה</th><th>תיאור</th><th>סכום מקורי</th><th>₪</th><th>סטטוס</th><th>סוג</th></tr>
      ${byDate[d].map(e=>`<tr>
        <td>${CATS_MAP[e.category]?.icon||""} ${CATS_MAP[e.category]?.label||e.category}</td>
        <td>${e.description||"—"}${e.address?`<br><span style="color:#7a9baa;font-size:10px">📍 ${e.address}</span>`:""}</td>
        <td style="direction:ltr;text-align:left">${e.amount?.toFixed(2)||""} ${e.currency||""}</td>
        <td style="font-weight:700">₪${getAmt(e).toFixed(0)}</td>
        <td><span class="b ${e.paid?"bp":"bu"}">${e.paid?"✓ שולם":"⏳ טרם"}</span></td>
        <td><span class="b ${e.isShared===false?"bn":"bs"}">${e.isShared===false?"👤 אישית":"👥 משותפת"}</span></td>
      </tr>`).join("")}
    </table>
  `).join("")}
  ${sharedExp.length>0?`
  <div class="section-title">💸 התחשבנות סופית</div>
  <p style="font-size:11px;color:#7a9baa;margin-bottom:10px">מבוסס על הוצאות משותפות בלבד (₪${sharedTotal.toFixed(0)})</p>
  ${settlements.length>0?settlements.map(s=>`
    <div class="settlement-row">
      <span style="font-size:14px;font-weight:600">${s.from}</span>
      <span style="color:#7a9baa;font-size:12px">חייב ל ← ${s.to}</span>
      <span class="settle-amount">₪${s.amount.toFixed(0)}</span>
    </div>`).join("")
  :`<div style="text-align:center;color:#4ade80;padding:16px;font-weight:700">✅ אין חובות – כולם שווה!</div>`}
  `:""}
</div>
<div class="footer">נוצר על ידי <span>טיולון</span> – מתכנן הטיולים שלי &nbsp;|&nbsp; ${new Date().toLocaleDateString("he-IL")}</div>
</body></html>`;

  const w=window.open("","_blank");
  if(!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(()=>w.print(),800);
}

function TripSelectorScreen({trips,onSelect,onCreate,onDelete,userId}){
  return(
    <div style={{minHeight:"100vh",background:DARK_BG}}>
      <div style={{background:"linear-gradient(160deg,#091928 0%,#0d2137 100%)",padding:"36px 20px 28px",borderBottom:"0.5px solid rgba(100,223,223,0.1)"}}>
        <div style={{fontSize:10,fontWeight:400,color:"rgba(255,255,255,0.2)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:8}}>ברוך הבא</div>
        <h1 style={{fontFamily:RF,color:"#ffffff",fontSize:38,fontWeight:900,letterSpacing:"-1px",lineHeight:1}}>טיולון</h1>
        <p style={{fontFamily:RF,color:"rgba(255,255,255,0.3)",marginTop:6,fontSize:12,fontWeight:300,letterSpacing:"0.5px"}}>מתכנן הטיולים שלי</p>
      </div>

      <div style={{padding:"20px 18px",display:"flex",flexDirection:"column",gap:10}}>
        <button onClick={onCreate} style={{padding:"16px",borderRadius:14,border:"0.5px dashed rgba(100,223,223,0.35)",background:"rgba(100,223,223,0.06)",color:TEAL,fontSize:15,fontWeight:600,fontFamily:RF,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          ➕ טיול חדש
        </button>

        {trips.length===0&&(
          <div style={{textAlign:"center",padding:"40px 0",color:W35}}>
            <div style={{fontSize:48,marginBottom:12}}>✈️</div>
            <div style={{fontSize:16,fontWeight:600}}>אין טיולים עדיין</div>
            <div style={{fontSize:13,marginTop:6}}>לחץ על "טיול חדש" כדי להתחיל</div>
          </div>
        )}

        {trips.map(t=>{
          const nights=t.startDate&&t.endDate?Math.round((new Date(t.endDate).getTime()-new Date(t.startDate).getTime())/86400000)+1:0;
          const total=t.expenses?.reduce((s,e)=>s+e.amountILS,0)||0;
          return(
            <div key={t.id} onClick={()=>onSelect(t.id)} style={{background:W05,border:"0.5px solid rgba(100,223,223,0.18)",borderRadius:16,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=W08;e.currentTarget.style.borderColor="rgba(100,223,223,0.35)";}}
              onMouseLeave={e=>{e.currentTarget.style.background=W05;e.currentTarget.style.borderColor="rgba(100,223,223,0.18)";}}>
              <div style={{width:44,height:44,borderRadius:13,background:"rgba(100,223,223,0.1)",border:"0.5px solid rgba(100,223,223,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🌍</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{fontFamily:RF,fontSize:16,fontWeight:700,color:"#ffffff",letterSpacing:"-0.2px"}}>{t.destination||"יעד לא מוגדר"}</div>
                  {t.owner!==userId&&t.owner&&<span style={{fontSize:9,background:TBL,color:TEAL,border:"0.5px solid rgba(100,223,223,0.3)",borderRadius:999,padding:"2px 7px",fontWeight:600}}>משותף</span>}
                  {t.owner===userId&&t.sharedWith?.length>0&&<span style={{fontSize:9,background:"rgba(100,223,223,0.08)",color:"rgba(100,223,223,0.6)",border:"0.5px solid rgba(100,223,223,0.2)",borderRadius:999,padding:"2px 7px"}}>👥 {t.sharedWith.length}</span>}
                </div>
                <div style={{fontSize:11,color:W35,marginTop:3,fontWeight:400}}>
                  {t.startDate?`${fmtDate(t.startDate)} – ${fmtDate(t.endDate)}`:"תאריכים לא מוגדרים"}
                  {nights>0&&` · ${nights} ימים`}
                </div>
                {total>0&&<div style={{fontSize:12,color:TEAL,fontWeight:600,marginTop:4}}>₪{total.toFixed(0)}</div>}
              </div>
              <button onClick={ev=>{ev.stopPropagation();if(window.confirm("למחוק את הטיול?"))onDelete(t.id);}} style={{padding:"6px 9px",borderRadius:8,border:"none",background:"rgba(255,107,107,0.12)",color:"#ff6b6b",fontSize:14,cursor:"pointer"}}>🗑️</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CURRENCY MANAGER COMPONENT ─────────────────────────────────────────────
function CurrencyManager({trip,onUpdate,allCodes,rates}){
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
    const label=getCurrLabel(code).toLowerCase();
    const q=search.toLowerCase();
    return !q||code.toLowerCase().includes(q)||label.includes(q);
  }).slice(0,40);

  return(
    <Card>
      <h2 style={{fontFamily:RF,fontSize:20,fontWeight:700,marginBottom:4,color:"#0a3050"}}>💱 מטבעות בטיול</h2>
      <p style={{fontSize:12,color:W35,marginBottom:12}}>בחר את המטבעות שתשתמש בהם. לחץ על מטבע להגדרתו כברירת מחדל.</p>

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
                <div style={{fontSize:12,fontWeight:700,color:isDefault?C.ocean:C.dark}}>{getCurrLabel(code)}</div>
                {rate&&code!=="ILS"&&<div style={{fontSize:10,color:W35}}>1 {code} = ₪{rate.toFixed(3)}</div>}
                {isDefault&&<div style={{fontSize:10,color:TEAL,fontWeight:700}}>★ ברירת מחדל</div>}
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
          ➕ הוסף מטבע
        </button>
      </div>

      {/* Currency picker */}
      {showPicker&&(
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:"12px",border:"0.5px solid rgba(100,223,223,0.15)"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="חפש מטבע... (למשל: THB, יאן, דולר)"
            style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`2px solid ${C.sandDark}`,fontFamily:RF,fontSize:14,direction:"rtl",background:W05,outline:"none",marginBottom:10}}
            onFocus={e=>(e.target.style.borderColor=C.ocean)} onBlur={e=>(e.target.style.borderColor=C.sandDark)} autoFocus/>
          {allCodes.length===0&&(
            <div style={{textAlign:"center",color:W35,fontSize:13,padding:"8px 0"}}>
              ⏳ שאיבת מטבעות... (נדרש חיבור לאינטרנט)
            </div>
          )}
          {/* Popular first if no search */}
          {!search&&(
            <div style={{marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:700,color:W35,marginBottom:6}}>פופולריים:</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {["THB","GBP","JPY","AED","TRY","AUD","CAD","CHF","SGD","INR","EGP","MAD","JOD"]
                  .filter(c=>!tripCurrencies.includes(c))
                  .slice(0,10)
                  .map(code=>(
                    <button key={code} onClick={()=>addCurrency(code)}
                      style={{padding:"5px 11px",borderRadius:999,border:`1.5px solid ${C.sandDark}`,background:W05,fontFamily:RF,fontWeight:700,fontSize:12,cursor:"pointer",color:"#ffffff"}}>
                      {getCurrSymbol(code)} {code} <span style={{color:W35,fontWeight:400}}>{getCurrLabel(code)}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
          {/* Search results */}
          {search&&(
            <div style={{maxHeight:180,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
              {filtered.length===0?<div style={{color:W35,fontSize:13,textAlign:"center",padding:"8px"}}>לא נמצאו תוצאות</div>
              :filtered.map(code=>(
                <button key={code} onClick={()=>addCurrency(code)}
                  style={{padding:"8px 12px",borderRadius:10,border:"none",background:W05,fontFamily:RF,fontSize:13,cursor:"pointer",textAlign:"right",display:"flex",alignItems:"center",gap:10,transition:"background 0.1s"}}
                  onMouseEnter={e=>(e.target.style.background=C.sandDark)} onMouseLeave={e=>(e.target.style.background=C.white)}>
                  <span style={{fontWeight:800,color:TEAL,minWidth:36}}>{getCurrSymbol(code)}</span>
                  <span style={{fontWeight:700}}>{code}</span>
                  <span style={{color:W35,fontSize:12}}>{getCurrLabel(code)}</span>
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
      <WaveHeader title="🌴 תכנון הטיול" subtitle="לאן אנחנו טסים?"/>
      <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:16}}>
        <Card>
          <h2 style={{fontFamily:RF,fontSize:20,fontWeight:700,marginBottom:16,color:"#0a3050"}}>פרטי היעד</h2>
          <SI label="יעד הטיול 🌍" value={trip.destination} onChange={v=>onUpdate({destination:v})} placeholder="למשל: תאילנד, פריז..."/>
          <SI label="תאריך יציאה ✈️" value={trip.startDate} onChange={v=>onUpdate({startDate:v})} type="date"/>
          <SI label="תאריך חזרה 🏠"  value={trip.endDate}   onChange={v=>onUpdate({endDate:v})}   type="date" min={trip.startDate}/>
          {valid&&(
            <div style={{padding:"12px 16px",background:"rgba(100,223,223,0.08)",border:"0.5px solid rgba(100,223,223,0.2)",borderRadius:12,textAlign:"center"}}>
              <span style={{fontFamily:RF,fontSize:26,fontWeight:800,color:TEAL}}>{Math.round((new Date(trip.endDate).getTime()-new Date(trip.startDate).getTime())/86400000)+1}</span>
              <span style={{fontSize:14,fontWeight:600,color:W70,marginRight:6}}>ימי טיול 🎉</span>
              <div style={{fontSize:12,color:W35,marginTop:2}}>{fmtDate(trip.startDate)} – {fmtDate(trip.endDate)}</div>
            </div>
          )}
        </Card>

        <CurrencyManager trip={trip} onUpdate={onUpdate} allCodes={allCodes} rates={rates}/>

        {/* People */}
        <Card>
          <h2 style={{fontFamily:RF,fontSize:20,fontWeight:700,marginBottom:4,color:"#0a3050"}}>👥 משתתפים</h2>
          <p style={{fontSize:13,color:W35,marginBottom:14}}>הוסף את כל האנשים/משפחות בטיול לניהול הוצאות משותפות</p>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="שם משתתף..." onKeyDown={e=>e.key==="Enter"&&addPerson()}
              style={{flex:1,padding:"10px 14px",borderRadius:12,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:RF,fontSize:14,direction:"rtl",background:W07,color:"#ffffff",outline:"none"}}
              onFocus={e=>(e.target.style.borderColor=C.ocean)} onBlur={e=>(e.target.style.borderColor=C.sandDark)}/>
            <button onClick={addPerson} style={{padding:"10px 16px",borderRadius:12,border:"none",background:TEAL,color:DARK_BG,fontFamily:RF,fontWeight:700,fontSize:14,cursor:"pointer"}}>➕</button>
          </div>
          {people.length===0?(
            <div style={{textAlign:"center",color:W35,padding:"12px 0",fontSize:13}}>טיול סולו? ניתן להשאיר ריק 🌴</div>
          ):(
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {people.map(p=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:999,background:p.color+"15",border:`0.5px solid ${p.color}40`}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:p.color,flexShrink:0}}/>
                  <span style={{fontSize:13,fontWeight:700,color:"#ffffff"}}>{p.name}</span>
                  <button onClick={()=>removePerson(p.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,color:W35,padding:"0 0 0 2px",lineHeight:1}}>×</button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 style={{fontFamily:RF,fontSize:18,fontWeight:700,marginBottom:14,color:"rgba(255,255,255,0.85)"}}>💰 תקציב מתוכנן</h2>
          <p style={{fontSize:12,color:W35,marginBottom:12,fontFamily:RF}}>הגדר תקציב כולל לטיול ותקבל מעקב התקדמות</p>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <input type="number" value={trip.budget||""} onChange={e=>onUpdate({budget:e.target.value?parseFloat(e.target.value):null})}
              placeholder="למשל: 15000"
              style={{flex:1,padding:"11px 14px",borderRadius:12,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:RF,fontSize:15,color:"#ffffff",background:W07,outline:"none",direction:"ltr"}}
              onFocus={e=>(e.target.style.borderColor=TEAL)} onBlur={e=>(e.target.style.borderColor=TBB)}/>
            <span style={{color:W50,fontFamily:RF,fontSize:15,flexShrink:0}}>₪</span>
          </div>
          {trip.budget>0&&<div style={{fontSize:12,color:TEAL,marginTop:8,fontFamily:RF}}>✓ תקציב: ₪{parseFloat(trip.budget).toLocaleString()}</div>}
        </Card>

        <Btn onClick={onNext} disabled={!valid} style={{width:"100%",fontSize:17,padding:"16px",borderRadius:16,boxShadow:valid?`0 6px 20px ${C.ocean}40`:"none"}}>
          המשך להוספת הוצאות ←
        </Btn>
      </div>
    </div>
  );
}

const mkForm=(dates,cur)=>({category:"food",amount:"",currency:cur||"ILS",description:"",paid:false,date:dates[0]||"",checkIn:dates[0]||"",checkOut:dates[1]||dates[0]||"",departureTime:"",time:"",address:"",paidBy:"",splitWith:[],splitType:"equal",isShared:true});

function ExpensesScreen({trip,expenses,onAdd,onEdit,onTogglePaid,onDelete,toILS,rates,ratesInfo}){
  const dates=getRange(trip.startDate,trip.endDate);
  const people=trip.people||[];
  const[sel,setSel]=useState(dates[0]||"");
  const[form,setForm]=useState(mkForm(dates,trip.defaultCurrency));
  const[show,setShow]=useState(false);
  const[editId,setEditId]=useState(null); // expense being edited
  // search & filter
  const[search,setSearch]=useState("");
  const[filterCat,setFilterCat]=useState("all");
  const[filterPaid,setFilterPaid]=useState("all");
  const[showFilters,setShowFilters]=useState(false);

  const set=p=>setForm(f=>({...f,...p}));

  const toggleSplitPerson=id=>{
    const sw=form.splitWith.includes(id)?form.splitWith.filter(x=>x!==id):[...form.splitWith,id];
    set({splitWith:sw});
  };

  const handleAdd=()=>{
    if(!form.amount)return;
    const date=form.category==="hotel"?form.checkIn:form.date;
    onAdd({id:uid(),...form,date,amount:parseFloat(form.amount),amountILS:toILS(parseFloat(form.amount),form.currency),amountILSLocked:form.paid?toILS(parseFloat(form.amount),form.currency):undefined});
    setForm(mkForm(dates,trip.defaultCurrency));
    setShow(false);
    setEditId(null);
  };

  const handleEdit=(exp)=>{
    setForm({
      category:exp.category,amount:String(exp.amount),currency:exp.currency,
      description:exp.description||"",paid:exp.paid,date:exp.date,
      checkIn:exp.checkIn||"",checkOut:exp.checkOut||"",
      departureTime:exp.departureTime||"",time:exp.time||"",
      address:exp.address||"",
      paidBy:exp.paidBy||"",splitWith:exp.splitWith||[],
      splitType:exp.splitType||"equal",isShared:exp.isShared!==false,
    });
    setEditId(exp.id);
    setShow(true);
    setSel(exp.date||exp.checkIn||sel);
  };

  const handleSaveEdit=()=>{
    if(!form.amount)return;
    const date=form.category==="hotel"?form.checkIn:form.date;
    onEdit(editId,{...form,date,amount:parseFloat(form.amount),amountILS:toILS(parseFloat(form.amount),form.currency)});
    setForm(mkForm(dates,trip.defaultCurrency));
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
      <div style={{background:W05,border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"13px",borderRight:`3px solid ${cat?.color||"rgba(255,255,255,0.2)"}`,display:"flex",alignItems:"flex-start",gap:10}}>
        <span style={{fontSize:24,flexShrink:0,marginTop:2}}>{cat?.icon}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:600,fontSize:13,color:"#ffffff",display:"flex",alignItems:"center",gap:6}}>{cat?.label}{exp.isShared===false&&<span style={{fontSize:9,background:"rgba(167,139,250,0.15)",color:"#a78bfa",border:"0.5px solid rgba(167,139,250,0.3)",borderRadius:999,padding:"1px 6px"}}>אישית</span>}{exp.isShared!==false&&<span style={{fontSize:9,background:"rgba(100,223,223,0.1)",color:TEAL,border:"0.5px solid rgba(100,223,223,0.2)",borderRadius:999,padding:"1px 6px"}}>משותפת</span>}</div>
          {exp.category==="hotel"&&exp.checkIn&&<div style={{fontSize:11,color:TEAL,fontWeight:600}}>{fmtDate(exp.checkIn)} → {fmtDate(exp.checkOut)} · {Math.round((new Date(exp.checkOut).getTime()-new Date(exp.checkIn).getTime())/86400000)} לילות</div>}
          {exp.category==="flight"&&exp.departureTime&&<div style={{fontSize:11,color:TEAL,fontWeight:600}}>המראה: {exp.departureTime}</div>}
          {exp.description&&<div style={{fontSize:12,color:W35,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{exp.description}</div>}
          <div style={{fontSize:12,color:W35,marginTop:2}}>{sym(exp.currency)}{exp.amount.toFixed(2)} ≈ <span style={{color:TEAL,fontWeight:600}}>₪{exp.amountILS.toFixed(2)}</span></div>
          {exp.paidBy&&<div style={{marginTop:4,display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
            <span style={{fontSize:11,background:personColor(exp.paidBy)+"25",color:personColor(exp.paidBy),borderRadius:6,padding:"2px 7px",fontWeight:700}}>שילם: {personName(exp.paidBy)}</span>
            {exp.splitWith?.length>0&&exp.splitWith.map(id=>(
              <span key={id} style={{fontSize:11,background:personColor(id)+"20",color:personColor(id),borderRadius:6,padding:"2px 7px",fontWeight:600}}>{personName(id)}</span>
            ))}
          </div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flexShrink:0}}>
          <button onClick={()=>onTogglePaid(exp.id)} style={{padding:"5px 9px",borderRadius:8,border:"none",background:exp.paid?"rgba(74,222,128,0.12)":"rgba(255,107,107,0.12)",color:exp.paid?"#4ade80":"#ff6b6b",fontFamily:RF,fontWeight:700,fontSize:11,cursor:"pointer"}}>{exp.paid?"✅":"⏳"}</button>
          <button onClick={()=>handleEdit(exp)} style={{padding:"5px 7px",borderRadius:8,border:"none",background:"rgba(100,223,223,0.1)",color:TEAL,fontFamily:RF,fontWeight:600,fontSize:11,cursor:"pointer"}}>✏️</button>
          <button onClick={()=>onDelete(exp.id)} style={{padding:"5px 7px",borderRadius:8,border:"none",background:"rgba(255,107,107,0.1)",color:"#ff6b6b",fontFamily:RF,fontWeight:600,fontSize:11,cursor:"pointer"}}>🗑️</button>
        </div>
      </div>
    );
  };

  return(
    <div>
      <WaveHeader title="💳 הוצאות" subtitle={trip.destination?`הטיול ל${trip.destination}`:""}/>

      <div style={{margin:"14px 16px 0",padding:"9px 14px",background:W05,borderRadius:12,fontSize:12,color:W35,display:"flex",gap:10,flexWrap:"wrap",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
        <span>💱 {(trip.currencies||[]).filter(c=>c!=="ILS").map(code=>`1 ${code} = ₪${(rates[code]||0).toFixed(3)}`).join(" | ")}</span>
        {ratesInfo.updated&&<span style={{color:"#4ade80"}}>✓ {ratesInfo.updated}</span>}
        {ratesInfo.error&&<span style={{color:"#ff6b6b"}}>{ratesInfo.error}</span>}
      </div>

      {/* Search bar */}
      <div style={{padding:"12px 16px 0",display:"flex",gap:8}}>
        <div style={{flex:1,position:"relative"}}>
          <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none"}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="חיפוש הוצאות..."
            style={{width:"100%",padding:"10px 36px 10px 12px",borderRadius:12,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:RF,fontSize:14,direction:"rtl",background:W07,color:"#ffffff",outline:"none"}}
            onFocus={e=>(e.target.style.borderColor=C.ocean)} onBlur={e=>(e.target.style.borderColor=C.sandDark)}/>
        </div>
        <button onClick={()=>setShowFilters(f=>!f)} style={{padding:"10px 14px",borderRadius:12,border:`0.5px solid ${showFilters||filterCat!=="all"||filterPaid!=="all"?TEAL:W15}`,background:showFilters||filterCat!=="all"||filterPaid!=="all"?TBL:"rgba(255,255,255,0.06)",color:showFilters||filterCat!=="all"||filterPaid!=="all"?TEAL:W35,fontFamily:RF,fontWeight:700,fontSize:13,cursor:"pointer"}}>
          🎛️ סינון
        </button>
      </div>

      {showFilters&&(
        <div style={{margin:"8px 16px 0",padding:"12px",background:W05,border:"0.5px solid rgba(100,223,223,0.18)",borderRadius:14}}>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:700,color:W60,marginBottom:6}}>קטגוריה</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[{id:"all",label:"הכל",icon:"📋"},...CATS].map(c=>(
                <button key={c.id} onClick={()=>setFilterCat(c.id)} style={{padding:"5px 10px",borderRadius:999,border:`0.5px solid ${filterCat===c.id?TEAL:W12}`,background:filterCat===c.id?TB:W05,color:filterCat===c.id?TEAL:W50,fontFamily:RF,fontWeight:700,fontSize:12,cursor:"pointer"}}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:W60,marginBottom:6}}>סטטוס תשלום</div>
            <div style={{display:"flex",gap:6}}>
              {[{id:"all",label:"הכל"},{id:"paid",label:"✅ שולם"},{id:"unpaid",label:"⏳ טרם שולם"}].map(o=>(
                <button key={o.id} onClick={()=>setFilterPaid(o.id)} style={{padding:"5px 12px",borderRadius:999,border:`0.5px solid ${filterPaid===o.id?TEAL:W12}`,background:filterPaid===o.id?TB:W05,color:filterPaid===o.id?TEAL:W50,fontFamily:RF,fontWeight:700,fontSize:12,cursor:"pointer"}}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search results mode */}
      {isFiltering?(
        <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{fontSize:13,color:W35,fontWeight:600}}>נמצאו {allFiltered.length} הוצאות</div>
          {allFiltered.length===0?<div style={{textAlign:"center",color:W35,padding:"24px 0",fontSize:15}}>🔍 לא נמצאו תוצאות</div>
          :allFiltered.map(exp=><ExpenseRow key={exp.id} exp={exp}/>)}
        </div>
      ):(
        <>
          {/* Date strip */}
          <div style={{padding:"12px 16px 0"}}>
            <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:6}}>
              {dates.map(d=>{
                const cnt=expenses.filter(e=>e.category==="hotel"?e.checkIn<=d&&e.checkOut>=d:e.date===d).length;
                return(
                  <button key={d} onClick={()=>setSel(d)} style={{minWidth:60,padding:"9px 7px",borderRadius:13,border:`0.5px solid ${sel===d?TEAL:"rgba(255,255,255,0.1)"}`,background:sel===d?TB:"rgba(255,255,255,0.04)",color:sel===d?"#ffffff":W40,fontFamily:RF,fontWeight:700,fontSize:12,cursor:"pointer",textAlign:"center",flexShrink:0,position:"relative"}}>
                    <div style={{fontSize:10,opacity:0.8}}>{new Date(d).toLocaleDateString("he-IL",{weekday:"short"})}</div>
                    <div style={{fontSize:15}}>{new Date(d).getDate()}</div>
                    {cnt>0&&<div style={{position:"absolute",top:-4,right:-4,width:15,height:15,borderRadius:"50%",background:C.coral,color:"#ffffff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{cnt}</div>}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:12}}>
            <button onClick={()=>{set({date:sel,checkIn:sel});setShow(true);}} style={{padding:"14px",borderRadius:14,border:"0.5px dashed rgba(100,223,223,0.35)",background:"rgba(100,223,223,0.06)",color:TEAL,fontSize:14,fontWeight:600,fontFamily:RF,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              ➕ הוסף הוצאה ל{fmtDate(sel)}
            </button>

            {show&&(
              <Card>
                <h3 style={{fontFamily:RF,fontSize:17,fontWeight:700,marginBottom:14,color:"#0a3050"}}>הוצאה חדשה</h3>

                {/* category */}
                <div style={{marginBottom:14}}>
                  <FL>קטגוריה</FL>
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                    {CATS.map(cat=>(
                      <button key={cat.id} onClick={()=>set({category:cat.id})} style={{padding:"7px 11px",borderRadius:999,border:`0.5px solid ${form.category===cat.id?cat.color:'rgba(255,255,255,0.15)'}`,background:form.category===cat.id?cat.color+'20':'rgba(255,255,255,0.05)',color:form.category===cat.id?cat.color:'rgba(255,255,255,0.6)',fontFamily:RF,fontWeight:700,fontSize:12,cursor:"pointer"}}>
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hotel */}
                {form.category==="hotel"&&(
                  <div style={{marginBottom:14,padding:"12px",background:`${C.oceanLight}12`,borderRadius:14,border:`1.5px solid ${C.oceanLight}40`}}>
                    <div style={{fontWeight:700,fontSize:13,color:"#0a3050",marginBottom:10}}>🏨 תאריכי שהייה</div>
                    <SI label="📅 צ׳ק אין"   value={form.checkIn}  onChange={v=>set({checkIn:v})}  type="date" min={trip.startDate} max={trip.endDate}/>
                    <SI label="📅 צ׳ק אאוט" value={form.checkOut} onChange={v=>set({checkOut:v})} type="date" min={form.checkIn}  max={trip.endDate}/>
                    {form.checkIn&&form.checkOut&&form.checkOut>form.checkIn&&(
                      <div style={{fontSize:12,color:TEAL,fontWeight:700,marginTop:-8,marginBottom:6}}>🌙 {Math.round((new Date(form.checkOut).getTime()-new Date(form.checkIn).getTime())/86400000)} לילות</div>
                    )}
                    <div style={{fontSize:11,color:W35}}>הסכום הוא לכל תקופת השהייה</div>
                  </div>
                )}

                {/* Flight */}
                {form.category==="flight"&&(
                  <div style={{marginBottom:14,padding:"12px",background:`${C.ocean}0D`,borderRadius:14,border:`1.5px solid ${C.ocean}30`}}>
                    <div style={{fontWeight:700,fontSize:13,color:"#0a3050",marginBottom:10}}>✈️ פרטי טיסה</div>
                    <SI label="שעת המראה" value={form.departureTime} onChange={v=>set({departureTime:v})} type="time"/>
                    <SS label="תאריך טיסה" value={form.date} onChange={v=>set({date:v})}>
                      {dates.map(d=><option key={d} value={d}>{fmtDate(d)}</option>)}
                    </SS>
                    {form.departureTime&&remTime(form.departureTime)&&(
                      <div style={{fontSize:12,color:"#ff6b6b",fontWeight:700,marginTop:-8}}>🔔 הגעה לשדה עד {remTime(form.departureTime)}</div>
                    )}
                  </div>
                )}

                {/* Amount */}
                <div style={{display:"flex",gap:10}}>
                  <div style={{flex:2}}><SI label="סכום" value={form.amount} onChange={v=>set({amount:v})} type="number" placeholder="0" min="0"/></div>
                  <div style={{flex:1}}><SS label="מטבע" value={form.currency} onChange={v=>set({currency:v})}>{(trip.currencies||["ILS","USD","EUR"]).map(code=><option key={code} value={code}>{getCurrSymbol(code)} {code} – {getCurrLabel(code)}</option>)}</SS></div>
                </div>
                {form.amount&&<div style={{marginBottom:12,padding:"9px 12px",background:`${C.palm}15`,borderRadius:10,fontSize:13,color:"#6ee7a0",fontWeight:700}}>≈ {toILS(parseFloat(form.amount)||0,form.currency).toFixed(2)} ₪</div>}

                <SI label="תיאור (אופציונלי)" value={form.description} onChange={v=>set({description:v})} placeholder="למשל: ארוחת ערב..."/>
                {["hotel","attraction","food","other"].includes(form.category)&&(
                  <SI label="📍 כתובת (אופציונלי)" value={form.address||""} onChange={v=>set({address:v})} placeholder="למשל: 123 Sukhumvit Rd, Bangkok"/>
                )}

                {form.category!=="hotel"&&form.category!=="flight"&&(
                  <div style={{marginBottom:14}}>
                    <label style={{display:"block",fontWeight:500,fontSize:12,marginBottom:6,color:W40,letterSpacing:"0.5px",textTransform:"uppercase"}}>שעה (אופציונלי)</label>
                    <input type="time" value={form.time} onChange={e=>set({time:e.target.value})}
                      style={{width:"100%",padding:"11px 14px",borderRadius:12,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:RF,fontSize:15,color:"#ffffff",background:W07,outline:"none"}}
                      onFocus={e=>(e.target.style.borderColor=TEAL)} onBlur={e=>(e.target.style.borderColor=TBB)}/>
                  </div>
                )}

                {form.category!=="hotel"&&form.category!=="flight"&&(
                  <SS label="תאריך" value={form.date} onChange={v=>set({date:v})}>
                    {dates.map(d=><option key={d} value={d}>{fmtDate(d)}</option>)}
                  </SS>
                )}

                {/* People split – only if people defined */}
                {people.length>0&&(
                  <div style={{marginBottom:14,padding:"12px",background:`${C.purple}0A`,borderRadius:14,border:`1.5px solid ${C.purple}25`}}>
                    <div style={{fontWeight:700,fontSize:13,color:"#a78bfa",marginBottom:10}}>👥 חלוקה בין משתתפים</div>
                    <SS label="מי שילם?" value={form.paidBy} onChange={v=>set({paidBy:v})}>
                      <option value="">-- לא מוגדר --</option>
                      {people.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                    </SS>
                    <div style={{marginBottom:10}}>
                      <FL>שיתוף עם:</FL>
                      <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                        {people.filter(p=>p.id!==form.paidBy).map(p=>(
                          <button key={p.id} onClick={()=>toggleSplitPerson(p.id)} style={{padding:"6px 12px",borderRadius:999,border:`2px solid ${form.splitWith.includes(p.id)?p.color:C.sandDark}`,background:form.splitWith.includes(p.id)?p.color+"20":C.white,color:form.splitWith.includes(p.id)?p.color:"#ffffff",fontFamily:RF,fontWeight:700,fontSize:12,cursor:"pointer"}}>
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    {form.splitWith.length>0&&(
                      <div style={{display:"flex",gap:6}}>
                        {[{id:"equal",label:"חלוקה שווה"},{id:"payer",label:"המשלם משלם הכל"}].map(o=>(
                          <button key={o.id} onClick={()=>set({splitType:o.id})} style={{flex:1,padding:"7px",borderRadius:10,border:`1.5px solid ${form.splitType===o.id?C.purple:C.sandDark}`,background:form.splitType===o.id?`${C.purple}15`:C.white,color:form.splitType===o.id?C.purple:C.muted,fontFamily:RF,fontWeight:700,fontSize:12,cursor:"pointer"}}>
                            {o.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Shared / Personal toggle */}
                <div style={{display:"flex",gap:8,marginBottom:12}}>
                  <button onClick={()=>set({isShared:true})} style={{flex:1,padding:"10px",borderRadius:12,border:`0.5px solid ${form.isShared?TEAL:W12}`,background:form.isShared?TBL:"rgba(255,255,255,0.04)",color:form.isShared?TEAL:W35,fontFamily:RF,fontWeight:600,fontSize:13,cursor:"pointer"}}>
                    👥 משותפת
                  </button>
                  <button onClick={()=>set({isShared:false})} style={{flex:1,padding:"10px",borderRadius:12,border:`0.5px solid ${!form.isShared?"#a78bfa":W12}`,background:!form.isShared?"rgba(167,139,250,0.12)":"rgba(255,255,255,0.04)",color:!form.isShared?"#a78bfa":W35,fontFamily:RF,fontWeight:600,fontSize:13,cursor:"pointer"}}>
                    👤 אישית
                  </button>
                </div>
                <button onClick={()=>set({paid:!form.paid})} style={{width:"100%",padding:"11px",borderRadius:12,border:`0.5px solid ${form.paid?'#4ade80':'rgba(255,255,255,0.15)'}`,background:form.paid?'rgba(74,222,128,0.1)':'rgba(255,255,255,0.05)',color:form.paid?'#4ade80':'rgba(255,255,255,0.4)',fontFamily:RF,fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  {form.paid?"✅ שולם":"⏳ טרם שולם"}
                </button>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={editId?handleSaveEdit:handleAdd} style={{flex:2,padding:"13px",borderRadius:13,border:"none",background:TEAL,color:DARK_BG,fontFamily:RF,fontWeight:700,fontSize:15,cursor:"pointer"}}>{editId?"שמור שינויים ✓":"הוסף ✓"}</button>
                  <button onClick={()=>setShow(false)} style={{flex:1,padding:"13px",borderRadius:13,border:"0.5px solid rgba(255,255,255,0.15)",background:W05,fontFamily:RF,fontWeight:600,fontSize:14,cursor:"pointer",color:W50}}>ביטול</button>
                </div>
              </Card>
            )}

            {dayExp.length===0?(<div style={{textAlign:"center",color:W25,padding:"28px 0",fontSize:14,fontFamily:RF}}><div style={{fontSize:36,marginBottom:10}}>🌊</div>אין הוצאות לתאריך זה</div>)
            :dayExp.map(exp=><ExpenseRow key={exp.id} exp={exp}/>)}
          </div>
        </>
      )}
    </div>
  );
}

function BudgetScreen({trip,expenses}){
  const people=trip.people||[];
  const sharedExp=expenses.filter(e=>e.isShared!==false);
  const personalExp=expenses.filter(e=>e.isShared===false);
  const total=expenses.reduce((s,e)=>s+e.amountILS,0);
  const totalShared=sharedExp.reduce((s,e)=>s+e.amountILS,0);
  const totalPersonal=personalExp.reduce((s,e)=>s+e.amountILS,0);
  const paid=expenses.filter(e=>e.paid).reduce((s,e)=>s+e.amountILS,0);
  const unpaid=total-paid;
  const byCat=CATS.map(cat=>{const ce=expenses.filter(e=>e.category===cat.id);return{...cat,total:ce.reduce((s,e)=>s+e.amountILS,0),count:ce.length};}).filter(c=>c.count>0);
  const pieData=byCat.map(c=>({label:c.label,value:c.total,color:c.color,icon:c.icon}));

  // Settlement calculation
  const settlement=useMemo(()=>{
    if(people.length<2)return[];
    const balances={};
    people.forEach(p=>balances[p.id]=0);
    // Only shared expenses enter settlement
    expenses.filter(e=>e.isShared!==false).forEach(exp=>{
      if(!exp.paidBy)return;
      const participants=[exp.paidBy,...(exp.splitWith||[])];
      if(participants.length<2)return;
      const share=exp.amountILS/participants.length;
      balances[exp.paidBy]=(balances[exp.paidBy]||0)+exp.amountILS-share;
      (exp.splitWith||[]).forEach(id=>{ balances[id]=(balances[id]||0)-share; });
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
  const handlePDF=()=>exportTripPDF(trip,expenses);

  return(
    <div>
      <WaveHeader title="💰 תקציב" subtitle={trip.destination?`סיכום הטיול ל${trip.destination}`:""}
        action={<button onClick={handlePDF} style={{padding:"8px 18px",borderRadius:10,border:"2px solid rgba(255,255,255,0.5)",background:W15,color:"#ffffff",fontFamily:RF,fontWeight:700,fontSize:13,cursor:"pointer"}}>📤 ייצוא</button>}/>
      <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:14}}>

        {/* Budget progress bar */}
        {trip.budget>0&&(
          <div style={{background:W05,border:"0.5px solid rgba(100,223,223,0.18)",borderRadius:16,padding:"16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontFamily:RF,fontSize:15,fontWeight:700,color:"#ffffff"}}>💰 עמידה בתקציב</div>
              <div style={{fontFamily:RF,fontSize:13,fontWeight:700,color:TEAL}}>₪{parseFloat(trip.budget).toLocaleString()}</div>
            </div>
            {(()=>{
              const pct=Math.min((total/trip.budget)*100,100);
              const over=total>trip.budget;
              const remaining=trip.budget-total;
              const barColor=pct<70?"#4ade80":pct<90?"#fbbf24":"#ff6b6b";
              return(<>
                <div style={{height:12,background:W08,borderRadius:999,overflow:"hidden",marginBottom:10}}>
                  <div style={{height:"100%",width:`${pct}%`,background:barColor,borderRadius:999,transition:"width 0.6s"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontFamily:RF,marginBottom:8}}>
                  <span style={{color:barColor,fontWeight:700}}>{pct.toFixed(1)}% מהתקציב</span>
                  <span style={{color:over?"#ff6b6b":"#4ade80",fontWeight:700}}>
                    {over?`חריגה של ₪${Math.abs(remaining).toLocaleString()}`:`נותרו ₪${remaining.toLocaleString()}`}
                  </span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  {[
                    {label:"הוצאתי",value:`₪${total.toFixed(0)}`,color:TEAL},
                    {label:"שולם",value:`₪${paid.toFixed(0)}`,color:"#4ade80"},
                    {label:"נותר",value:over?`-₪${Math.abs(remaining).toFixed(0)}`:`₪${remaining.toFixed(0)}`,color:over?"#ff6b6b":"#4ade80"},
                  ].map(item=>(
                    <div key={item.label} style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"8px",textAlign:"center"}}>
                      <div style={{fontFamily:RF,fontSize:14,fontWeight:700,color:item.color}}>{item.value}</div>
                      <div style={{fontFamily:RF,fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:2}}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </>);
            })()}
          </div>
        )}

        {/* KPI */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[{label:'סה"כ הוצאות',value:total,color:TEAL,icon:"📊"},{label:"שולם",value:paid,color:"#4ade80",icon:"✅"},{label:"טרם שולם",value:unpaid,color:"#ff6b6b",icon:"⏳"},{label:"מס׳ הוצאות",value:expenses.length,color:"#fbbf24",icon:"🧾",noFmt:true}].map(item=>(
            <div key={item.label} style={{background:W05,border:"0.5px solid rgba(255,255,255,0.08)",borderTop:`2px solid ${item.color}`,borderRadius:14,padding:"14px",textAlign:"center"}}>
              <div style={{fontSize:22,marginBottom:6}}>{item.icon}</div>
              <div style={{fontFamily:RF,fontSize:20,fontWeight:700,color:item.color}}>{item.noFmt?item.value:`₪${item.value.toFixed(0)}`}</div>
              <div style={{fontSize:10,fontWeight:400,color:"rgba(255,255,255,0.3)",marginTop:4,letterSpacing:"0.3px"}}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Pie */}
        {pieData.length>0&&<Card><h2 style={{fontFamily:RF,fontSize:18,fontWeight:700,marginBottom:16,color:"#0a3050",textAlign:"center"}}>📊 גרף עוגה</h2><PieChart data={pieData}/></Card>}

        {/* Bars */}
        {byCat.length>0&&(
          <Card>
            <h2 style={{fontFamily:RF,fontSize:18,fontWeight:700,marginBottom:16,color:"#0a3050"}}>פירוט לפי קטגוריה</h2>
            {byCat.map(cat=>{
              const maxT=Math.max(...byCat.map(c=>c.total),1);
              return(
                <div key={cat.id} style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{fontWeight:700,fontSize:15,display:"flex",gap:6,alignItems:"center"}}><span>{cat.icon}</span><span>{cat.label}</span><span style={{fontSize:11,color:W35}}>({cat.count})</span></div>
                    <div style={{fontFamily:RF,fontWeight:700,fontSize:15,color:TEAL}}>₪{cat.total.toFixed(0)}</div>
                  </div>
                  <div style={{height:5,background:W08,borderRadius:999,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${(cat.total/maxT)*100}%`,background:cat.color,borderRadius:999,transition:"width 0.5s"}}/>
                  </div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:3}}>{total>0?((cat.total/total)*100).toFixed(1):0}%</div>
                </div>
              );
            })}
          </Card>
        )}

        {/* Paid bar */}
        {expenses.length>0&&(
          <Card>
            <h2 style={{fontFamily:RF,fontSize:18,fontWeight:700,marginBottom:12,color:"#0a3050"}}>סטטוס תשלום</h2>
            <div style={{display:"flex",height:6,borderRadius:999,overflow:"hidden",marginBottom:12}}>
              <div style={{flex:paid,background:C.palm,transition:"flex 0.5s"}}/>
              <div style={{flex:unpaid,background:C.coral,transition:"flex 0.5s"}}/>
            </div>
            <div style={{display:"flex",gap:16}}>
              {[{color:"#4ade80",label:`שולם: ₪${paid.toFixed(0)}`},{color:"#ff6b6b",label:`טרם שולם: ₪${unpaid.toFixed(0)}`}].map(i=>(
                <div key={i.label} style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:12,height:12,borderRadius:3,background:i.color}}/><span style={{fontSize:13,fontWeight:700}}>{i.label}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Settlement */}
        {people.length>=2&&(
          <Card>
            <h2 style={{fontFamily:RF,fontSize:18,fontWeight:700,marginBottom:4,color:"#0a3050"}}>💸 התחשבנות</h2>
            <p style={{fontSize:12,color:W35,marginBottom:14}}>מי חייב למי בסוף הטיול</p>
            {settlement.length===0?(
              <div style={{textAlign:"center",color:"#4ade80",padding:"16px 0",fontWeight:700,fontSize:14}}>✅ אין חובות! הכל מאוזן</div>
            ):settlement.map((d,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"12px",background:"rgba(255,255,255,0.04)",borderRadius:12,marginBottom:8}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:d.from.color+"30",border:`2px solid ${d.from.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:d.from.color,flexShrink:0}}>
                  {d.from.name[0]}
                </div>
                <div style={{flex:1}}>
                  <span style={{fontWeight:700,color:d.from.color}}>{d.from.name}</span>
                  <span style={{color:W35,fontSize:13}}> חייב ל</span>
                  <span style={{fontWeight:700,color:d.to.color}}>{d.to.name}</span>
                </div>
                <div style={{fontFamily:RF,fontSize:16,fontWeight:700,color:"#ff6b6b"}}>₪{d.amount.toFixed(0)}</div>
                <div style={{width:32,height:32,borderRadius:"50%",background:d.to.color+"30",border:`2px solid ${d.to.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:d.to.color,flexShrink:0}}>
                  {d.to.name[0]}
                </div>
              </div>
            ))}
          </Card>
        )}

        {expenses.length===0&&<div style={{textAlign:"center",color:W35,padding:"32px 0"}}><div style={{fontSize:40,marginBottom:10}}>🌺</div><div style={{fontSize:15}}>אין הוצאות עדיין</div></div>}
      </div>
    </div>
  );
}

function CalendarScreen({trip,expenses}){
  const dates=getRange(trip.startDate,trip.endDate);
  const[acts,setActs]=useState({});       // {date: [{text, time}]}
  const[editD,setEditD]=useState(null);
  const[view,setView]=useState("month");  // "month" | "day"
  const[selDate,setSelDate]=useState(dates[0]||"");
  const[editActs,setEditActs]=useState([]); // [{text,time}] being edited
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
    setEditActs(existing.length>0?existing.map(a=>typeof a==="string"?{text:a,time:""}:a):[{text:"",time:""}]);
  };
  const saveEdit=()=>{
    const valid=editActs.filter(a=>a.text.trim());
    setActs(a=>({...a,[editD]:valid}));
    setEditD(null);
  };
  const addActRow=()=>setEditActs(a=>[...a,{text:"",time:""}]);
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
        <div style={{fontSize:44,marginBottom:14}}>🗓️</div>הגדר יעד ותאריכים
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

    const monthName=firstDay.toLocaleDateString("he-IL",{month:"long",year:"numeric"});
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
          {[[TEAL,"טיסה"],["#48b5c4","מלון"],["#fbbf24","הוצאות"],["#a78bfa","פעילויות"]].map(([color,label])=>(
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
    const wday=new Date(selDate).toLocaleDateString("he-IL",{weekday:"long"});
    const dayNum=new Date(selDate).getDate();
    const monthName=new Date(selDate).toLocaleDateString("he-IL",{month:"long"});

    // Build timeline events: collect all timed events
    const timedEvents=[];
    flights.forEach(f=>{
      if(f.departureTime){
        const[h,m]=f.departureTime.split(":").map(Number);
        timedEvents.push({hour:h+m/60,type:"flight",data:f,duration:0.5});
        const rem=remTime(f.departureTime);
        if(rem){const[rh,rm]=rem.split(":").map(Number);timedEvents.push({hour:rh+rm/60,type:"reminder",data:f,duration:0.25});}
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
      if(a.time){const[h,m]=a.time.split(":").map(Number);timedEvents.push({hour:h+m/60,type:"activity",data:a,duration:1,idx:i});}
      else timedEvents.push({hour:null,type:"activity",data:a,duration:1,idx:i});
    });
    others.forEach(e=>{
      if(e.time){const[h,m]=e.time.split(":").map(Number);timedEvents.push({hour:h+m/60,type:"other",data:e,duration:0.75});}
      else timedEvents.push({hour:null,type:"other",data:e,duration:0.5});
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
      flight:f=>`✈️ המראה ${f.departureTime}`,
      reminder:f=>`🔔 הגעה לשדה עד ${remTime(f.departureTime)}`,
      "hotel-in":h=>`🏨 צ׳ק אין – ${h.description||"מלון"}`,
      "hotel-out":h=>`🏨 צ׳ק אאוט – ${h.description||"מלון"}`,
      "hotel-stay":h=>`🏨 ${h.description||"מלון"}`,
      activity:a=>a.text,
      other:e=>`${CATS.find(c=>c.id===e.category)?.icon} ${e.description||CATS.find(c=>c.id===e.category)?.label}`,
    };

    return(
      <div style={{padding:"14px 14px 20px"}}>
        {/* Day header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:44,height:44,borderRadius:12,background:TBL,border:"0.5px solid rgba(100,223,223,0.3)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{color:"#ffffff",fontSize:18,fontWeight:800,fontFamily:RF,lineHeight:1}}>{dayNum}</div>
              <div style={{color:W35,fontSize:9}}>{monthName}</div>
            </div>
            <div>
              <div style={{color:"#ffffff",fontWeight:700,fontSize:16,fontFamily:RF}}>{wday}</div>
              {wxd&&<div style={{fontSize:12,color:TEAL,marginTop:2}}>{WMO[wxd.code]?.split(" ")[0]} {wxd.max?.toFixed(0)}°C</div>}
            </div>
          </div>
          <button onClick={()=>openEdit(selDate)} style={{padding:"7px 12px",borderRadius:9,border:"0.5px solid rgba(100,223,223,0.3)",background:"rgba(100,223,223,0.08)",color:TEAL,fontFamily:RF,fontWeight:600,fontSize:11,cursor:"pointer"}}>✏️ פעילויות</button>
        </div>

        {/* Hotel stay banner – top of day */}
        {stayHotels.map(h=>(
          <div key={h.id} style={{marginBottom:10,padding:"8px 14px",background:"rgba(100,223,223,0.08)",border:"0.5px solid rgba(100,223,223,0.2)",borderRadius:10,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>🏨</span>
            <span style={{fontFamily:RF,fontSize:13,fontWeight:600,color:"rgba(100,223,223,0.9)"}}>המשך שהייה ב{h.description||"מלון"}</span>
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
              return(
                <div key={i} onClick={()=>{if(ev.data?.address)window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.data.address)}`,"_blank");}}
                  style={{
                    position:"absolute",top,right:0,left:0,height,
                    background:`${col}18`,border:`0.5px solid ${col}50`,
                    borderRight:`3px solid ${col}`,borderRadius:8,
                    padding:"4px 8px",display:"flex",alignItems:"center",justifyContent:"space-between",
                    zIndex:2,cursor:ev.data?.address?"pointer":"default",
                  }}>
                  <span style={{fontSize:12,fontWeight:600,color:col,fontFamily:RF,lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{label}</span>
                  {ev.data?.address&&<span style={{fontSize:14,marginRight:4,flexShrink:0}}>🗺️</span>}
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
            <div style={{fontSize:10,fontWeight:600,color:W25,letterSpacing:"1px",textTransform:"uppercase",marginBottom:8,fontFamily:RF}}>ללא שעה</div>
            {untimed.map((ev,i)=>{
              const col=eventColor[ev.type]||TEAL;
              const label=eventLabel[ev.type]?.(ev.data)||"";
              return(
                <div key={i} onClick={()=>{if(ev.data?.address)window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.data.address)}`,"_blank");}}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:10,marginBottom:6,cursor:ev.data?.address?"pointer":"default"}}>
                  <div style={{width:4,height:4,borderRadius:"50%",background:col,flexShrink:0}}/>
                  <span style={{fontSize:13,color:W70,fontFamily:RF,flex:1}}>{label}</span>
                  {ev.data?.address&&<span style={{fontSize:13}}>🗺️</span>}
                </div>
              );
            })}
          </div>
        )}
        {timed.length===0&&untimed.length===0&&(
          <div style={{textAlign:"center",color:"rgba(255,255,255,0.2)",padding:"32px 0",fontSize:13,fontFamily:RF}}>
            לחץ ✏️ להוספת פעילויות 🌴
          </div>
        )}
      </div>
    );
  }

  // ── EDIT MODAL ──────────────────────────────────────────────────────────────
  const EditModal=()=>editD?(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#0d2f4a",border:"0.5px solid rgba(100,223,223,0.25)",borderRadius:20,padding:22,width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,0.6)",maxHeight:"80vh",overflowY:"auto"}}>
        <h3 style={{fontFamily:RF,fontSize:17,fontWeight:700,color:"#ffffff",marginBottom:14}}>✏️ פעילויות ל{fmtDate(editD)}</h3>
        {editActs.map((act,i)=>(
          <div key={i} style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
            <input value={act.time} onChange={e=>updateAct(i,"time",e.target.value)} type="time"
              style={{width:88,padding:"9px 8px",borderRadius:10,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:RF,fontSize:13,color:"#ffffff",background:W07,outline:"none",flexShrink:0}}/>
            <input value={act.text} onChange={e=>updateAct(i,"text",e.target.value)} placeholder="תיאור פעילות..."
              style={{flex:1,padding:"9px 12px",borderRadius:10,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:RF,fontSize:13,color:"#ffffff",background:W07,outline:"none",direction:"rtl"}}/>
            <button onClick={()=>removeAct(i)} style={{background:"rgba(255,107,107,0.12)",border:"none",color:"#ff6b6b",borderRadius:8,padding:"8px 10px",cursor:"pointer",fontSize:14,flexShrink:0}}>✕</button>
          </div>
        ))}
        <button onClick={addActRow} style={{width:"100%",padding:"9px",borderRadius:10,border:"0.5px dashed rgba(100,223,223,0.3)",background:"rgba(100,223,223,0.05)",color:TEAL,fontFamily:RF,fontWeight:600,fontSize:13,cursor:"pointer",marginBottom:14}}>
          ➕ הוסף פעילות
        </button>
        <div style={{display:"flex",gap:8}}>
          <button onClick={saveEdit} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:TEAL,color:DARK_BG,fontFamily:RF,fontWeight:700,fontSize:14,cursor:"pointer"}}>שמור ✓</button>
          <button onClick={()=>setEditD(null)} style={{flex:1,padding:"12px",borderRadius:12,border:"0.5px solid rgba(255,255,255,0.15)",background:W05,fontFamily:RF,fontWeight:600,fontSize:13,cursor:"pointer",color:W50}}>ביטול</button>
        </div>
      </div>
    </div>
  ):null;

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return(
    <div>
      <div style={{background:"linear-gradient(160deg,#0d2137 0%,#0a3050 100%)",padding:"18px 18px 14px",borderBottom:"0.5px solid rgba(100,223,223,0.12)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div>
            <h1 style={{fontFamily:RF,color:"#ffffff",fontSize:22,fontWeight:800,letterSpacing:"-0.3px",lineHeight:1}}>לוח שנה</h1>
            <p style={{color:W35,marginTop:4,fontSize:11,fontWeight:400}}>{trip.destination?`${fmtDate(trip.startDate)} – ${fmtDate(trip.endDate)}`:""}</p>
          </div>
          {trip.destination&&<div style={{fontSize:11,color:"rgba(255,255,255,0.3)",fontFamily:RF}}>{wLoad?"🌤️ טוען...":wx?`🌍 ${wx.name}`:wErr?"☁️":""}</div>}
        </div>
        {/* View toggle */}
        <div style={{display:"flex",gap:6,background:"rgba(255,255,255,0.06)",borderRadius:10,padding:3}}>
          <button onClick={()=>setView("month")} style={{flex:1,padding:"7px",borderRadius:8,border:"none",background:view==="month"?"rgba(100,223,223,0.18)":"transparent",color:view==="month"?TEAL:W35,fontFamily:RF,fontWeight:600,fontSize:13,cursor:"pointer",transition:"all 0.2s"}}>📅 חודש</button>
          <button onClick={()=>{setView("day");if(!selDate&&dates[0])setSelDate(dates[0]);}} style={{flex:1,padding:"7px",borderRadius:8,border:"none",background:view==="day"?"rgba(100,223,223,0.18)":"transparent",color:view==="day"?TEAL:W35,fontFamily:RF,fontWeight:600,fontSize:13,cursor:"pointer",transition:"all 0.2s"}}>🕐 יום</button>
        </div>
        {/* Day nav (only in day view) */}
        {view==="day"&&dates.length>0&&(
          <div style={{display:"flex",gap:6,overflowX:"auto",marginTop:10,paddingBottom:2}}>
            {dates.map(d=>{
              const hasEv=hasEvents(d);
              return(
                <button key={d} onClick={()=>setSelDate(d)} style={{minWidth:48,padding:"7px 6px",borderRadius:10,border:`0.5px solid ${selDate===d?TEAL:"rgba(255,255,255,0.1)"}`,background:selDate===d?TB:"rgba(255,255,255,0.04)",color:selDate===d?"#ffffff":W40,fontFamily:RF,fontWeight:selDate===d?700:500,fontSize:12,cursor:"pointer",textAlign:"center",flexShrink:0,position:"relative"}}>
                  <div style={{fontSize:9,opacity:0.7}}>{new Date(d).toLocaleDateString("he-IL",{weekday:"short"})}</div>
                  <div style={{fontSize:15}}>{new Date(d).getDate()}</div>
                  {hasEv&&<div style={{width:4,height:4,borderRadius:"50%",background:TEAL,margin:"2px auto 0"}}/>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <EditModal/>

      <div style={{overflowY:"auto"}}>
        {view==="month"?<MonthView/>:<DayView/>}
      </div>
    </div>
  );
}


const newTrip=(ownerId)=>({id:uid(),destination:"",startDate:"",endDate:"",defaultCurrency:"ILS",currencies:["ILS","USD","EUR"],people:[],expenses:[],activities:{},owner:ownerId,sharedWith:[]});

export default function TripPlan({trips:initialTrips,onSaveTrip,onDeleteTrip,onShareTrip,onLogout,userEmail,userId}){
  const[trips,setTrips]=useState(initialTrips);
  const[activeId,setActiveId]=useState(null);
  const[screen,setScreen]=useState("destination");
  const[shareModal,setShareModal]=useState(null);
  const[shareEmail,setShareEmail]=useState("");
  const[shareMsg,setShareMsg]=useState("");
  const[showConverter,setShowConverter]=useState(false);
  const[convAmount,setConvAmount]=useState("");
  const[convFrom,setConvFrom]=useState("USD");
  const[convTo,setConvTo]=useState("ILS");
  const{rates,allCodes,info,toILS}=useRates();
  const{permission,subscribed,subscribe}=usePushNotifications(userId);

  // sync incoming trips from Firestore
  useEffect(()=>{
    setTrips(initialTrips);
  },[initialTrips]);

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
      await onShareTrip(tripId,shareEmail.trim());
      setShareMsg("✅ הטיול שותף בהצלחה!");
      setShareEmail("");
      // modal stays open until user closes manually
    }catch(e){setShareMsg("שגיאה, נסה שוב");}
  };

  const handleCreate=()=>{
    const t=newTrip(userId);
    setTrips((ts)=>[...ts,t]);
    onSaveTrip(t);
    setActiveId(t.id);
    setScreen("destination");
  };

  const handleSelect=id=>{setActiveId(id);setScreen("destination");};
  const handleBack=()=>{setActiveId(null);setScreen("destination");};
  const handleDelete=(id)=>{setTrips((ts)=>ts.filter(t=>t.id!==id));onDeleteTrip(id);};

  const isOwner=active?.owner===userId||!active?.owner;
  const screens=["destination","expenses","budget","calendar"];

  if(!activeId){
    return(
      <>
        <style>{GS}</style>
        <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",fontFamily:RF}}>
          {/* user bar */}
          <div style={{background:"rgba(0,0,0,0.4)",padding:"10px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"0.5px solid rgba(100,223,223,0.1)"}}>
            <div style={{display:"flex",flexDirection:"column"}}>
              <span style={{fontFamily:RF,color:"#ffffff",fontSize:20,fontWeight:800,letterSpacing:"-0.5px",lineHeight:1}}>טיולון</span>
              <span style={{fontFamily:RF,color:W35,fontSize:10,fontWeight:300,letterSpacing:"0.5px",marginTop:3}}>מתכנן הטיולים שלי</span>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <button onClick={()=>setShowConverter(c=>!c)} style={{background:"rgba(100,223,223,0.1)",border:"0.5px solid rgba(100,223,223,0.25)",borderRadius:8,color:TEAL,fontFamily:RF,fontWeight:600,fontSize:11,padding:"5px 10px",cursor:"pointer"}}>💱</button>
              <button onClick={subscribe} title={subscribed?"התראות פעילות":"הפעל התראות"} style={{background:subscribed?"rgba(74,222,128,0.12)":"rgba(100,223,223,0.1)",border:`0.5px solid ${subscribed?"rgba(74,222,128,0.3)":"rgba(100,223,223,0.25)"}`,borderRadius:8,color:subscribed?"#4ade80":TEAL,fontFamily:RF,fontWeight:600,fontSize:11,padding:"5px 10px",cursor:"pointer"}}>{subscribed?"🔔":"🔕"}</button>
              <button onClick={onLogout} style={{background:"rgba(100,223,223,0.1)",border:"0.5px solid rgba(100,223,223,0.25)",borderRadius:8,color:TEAL,fontFamily:RF,fontWeight:600,fontSize:11,padding:"5px 12px",cursor:"pointer"}}>התנתק</button>
            </div>
          </div>
          {/* Currency Converter */}
          {showConverter&&<CurrencyConverter rates={rates} onClose={()=>setShowConverter(false)} tripCurrencies={trips[0]?.currencies||["ILS","USD","EUR"]}/>}
          <TripSelectorScreen trips={trips} onSelect={handleSelect} onCreate={handleCreate} onDelete={handleDelete} userId={userId}/>
        </div>
      </>
    );
  }

  return(
    <>
      <style>{GS}</style>
      <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",display:"flex",flexDirection:"column",background:DARK_BG,fontFamily:RF}}>
        <div style={{background:"rgba(0,0,0,0.4)",padding:"12px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:"0.5px solid rgba(100,223,223,0.1)"}}>
          <button onClick={handleBack} style={{background:"rgba(100,223,223,0.1)",border:"0.5px solid rgba(100,223,223,0.25)",borderRadius:8,color:TEAL,fontFamily:RF,fontWeight:600,fontSize:12,padding:"5px 12px",cursor:"pointer",letterSpacing:"0.3px"}}>← טיולון</button>
          <div style={{flex:1,textAlign:"center"}}>
            <span style={{fontFamily:RF,color:"#ffffff",fontSize:15,fontWeight:700,letterSpacing:"-0.2px"}}>{active?.destination||"טיולון"}</span>
            {active?.sharedWith?.length>0&&<div style={{fontSize:9,color:"rgba(100,223,223,0.6)",marginTop:1}}>👥 {active.sharedWith.length} משתתפים</div>}
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>setShowConverter(c=>!c)} style={{background:"rgba(100,223,223,0.1)",border:"0.5px solid rgba(100,223,223,0.25)",borderRadius:8,color:TEAL,fontFamily:RF,fontWeight:600,fontSize:12,padding:"5px 10px",cursor:"pointer"}}>💱</button>
            <button onClick={()=>exportTripPDF(active,expenses)} style={{background:"rgba(100,223,223,0.1)",border:"0.5px solid rgba(100,223,223,0.25)",borderRadius:8,color:TEAL,fontFamily:RF,fontWeight:600,fontSize:12,padding:"5px 10px",cursor:"pointer"}}>📄</button>
            {isOwner&&<button onClick={()=>{setShareModal(activeId);setShareEmail("");setShareMsg("");}} style={{background:"rgba(100,223,223,0.1)",border:"0.5px solid rgba(100,223,223,0.25)",borderRadius:8,color:TEAL,fontFamily:RF,fontWeight:600,fontSize:12,padding:"5px 10px",cursor:"pointer"}}>👥 שתף</button>}
          </div>
        </div>
        {/* Currency Converter in trip view */}
        {showConverter&&<CurrencyConverter rates={rates} onClose={()=>setShowConverter(false)} tripCurrencies={active?.currencies||["ILS","USD","EUR"]}/>}

        {/* Share modal */}
        {shareModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{background:"#0d2f4a",border:"0.5px solid rgba(100,223,223,0.25)",borderRadius:20,padding:24,width:"100%",maxWidth:400,boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
              <h3 style={{fontFamily:RF,fontSize:18,fontWeight:700,color:"#ffffff",marginBottom:4}}>👥 שתף טיול</h3>
              <p style={{fontSize:12,color:W40,marginBottom:16,fontFamily:RF}}>הכנס את האימייל של המשתתף</p>
              
              {/* Current shared list */}
              {trips.find(t=>t.id===shareModal)?.sharedWith?.length>0&&(
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginBottom:8,fontFamily:RF,letterSpacing:"0.5px",textTransform:"uppercase"}}>משותף עם</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {trips.find(t=>t.id===shareModal)?.sharedWith?.map(email=>(
                      <div key={email} style={{fontSize:12,background:"rgba(100,223,223,0.1)",color:TEAL,border:"0.5px solid rgba(100,223,223,0.25)",borderRadius:999,padding:"4px 10px",fontFamily:RF}}>
                        {email}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <input
                value={shareEmail}
                onChange={e=>setShareEmail(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleShare(shareModal)}
                placeholder="אימייל@example.com"
                type="email"
                style={{width:"100%",padding:"12px 14px",borderRadius:12,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:RF,fontSize:14,direction:"ltr",color:"#ffffff",background:W07,outline:"none",marginBottom:10}}
                onFocus={e=>(e.target.style.borderColor=TEAL)}
                onBlur={e=>(e.target.style.borderColor=TBB)}
              />
              {shareMsg&&(
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:12,color:shareMsg.startsWith("✅")?"#4ade80":"#ff6b6b",marginBottom:shareMsg.startsWith("✅")?10:0,fontFamily:RF,fontWeight:500}}>{shareMsg}</div>
                  {shareMsg.startsWith("✅")&&(
                    <div style={{display:"flex",gap:8,marginTop:8}}>
                      <button onClick={()=>{
                        const url=`https://tripplan-murex.vercel.app`;
                        const text=`הוזמנת לטיול "${trips.find(t=>t.id===shareModal)?.destination||""}" בטיולון! היכנס עם האימייל ${shareEmail||""} :
${url}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,"_blank");
                      }} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:"#25D366",color:"#ffffff",fontFamily:RF,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                        📲 שלח בוואטסאפ
                      </button>
                      <button onClick={()=>{
                        const url=`https://tripplan-murex.vercel.app`;
                        const text=`הוזמנת לטיול "${trips.find(t=>t.id===shareModal)?.destination||""}" בטיולון! היכנס עם האימייל ${shareEmail||""} : ${url}`;
                        navigator.clipboard.writeText(text);
                        setShareMsg("✅ הועתק ללוח!");
                      }} style={{flex:1,padding:"10px",borderRadius:10,border:"0.5px solid rgba(100,223,223,0.3)",background:"rgba(100,223,223,0.08)",color:TEAL,fontFamily:RF,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                        📋 העתק לינק
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>handleShare(shareModal)} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:TEAL,color:DARK_BG,fontFamily:RF,fontWeight:700,fontSize:14,cursor:"pointer"}}>שתף ✓</button>
                <button onClick={()=>{setShareModal(null);setShareEmail("");setShareMsg("");}} style={{flex:1,padding:"12px",borderRadius:12,border:"0.5px solid rgba(255,255,255,0.15)",background:W05,fontFamily:RF,fontWeight:600,fontSize:13,cursor:"pointer",color:W50}}>סגור</button>
              </div>
            </div>
          </div>
        )}

        <div style={{flex:1,overflowY:"auto"}}>
          {screen==="destination"&&<DestinationScreen trip={active} onUpdate={updTrip} onNext={()=>setScreen("expenses")} allCodes={allCodes} rates={rates}/>}
          {screen==="expenses"   &&<ExpensesScreen trip={active} expenses={expenses} onAdd={addExp} onEdit={editExp} onTogglePaid={togglePay} onDelete={delExp} toILS={toILS} rates={rates} ratesInfo={info}/>}
          {screen==="budget"     &&<BudgetScreen trip={active} expenses={expenses}/>}
          {screen==="calendar"   &&<CalendarScreen trip={active} expenses={expenses}/>}
        </div>
        <NavBar screens={screens} current={screen} onNav={setScreen}/>
      </div>
    </>
  );
}
