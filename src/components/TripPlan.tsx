"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const C = {
  sand:"#F5EDD8",sandDark:"#EAD9B5",ocean:"#2A7B8C",oceanLight:"#3A9BAE",
  oceanDeep:"#1A5C6B",coral:"#E8704A",palm:"#4A8C5C",palmLight:"#5DAF72",
  sunset:"#D4A847",white:"#FFFFFF",dark:"#1A2B35",darkMid:"#2D4050",
  muted:"#7A9BAA",lightBg:"#F8F3EA",sky:"#87CEDC",purple:"#7B5EA7",
};
const F={d:"'Playfair Display',Georgia,serif",b:"'Nunito','Segoe UI',sans-serif"};
const CATS=[
  {id:"flight",label:"טיסה",icon:"✈️",color:C.ocean},
  {id:"hotel",label:"מלון",icon:"🏨",color:C.oceanLight},
  {id:"attraction",label:"אטרקציות",icon:"🎡",color:C.coral},
  {id:"food",label:"אוכל",icon:"🍜",color:C.sunset},
  {id:"taxi",label:"מונית",icon:"🚕",color:C.palm},
  {id:"other",label:"אחר",icon:"📦",color:C.muted},
];
// ברירת מחדל – תמיד זמינים
const DEFAULT_CURRENCIES=[
  {code:"ILS",label:"שקל ישראלי",symbol:"₪"},
  {code:"USD",label:"דולר אמריקאי",symbol:"$"},
  {code:"EUR",label:"יורו",symbol:"€"},
];
const CURRENCY_NAMES:{[key:string]:string}={
  ILS:"שקל ישראלי",USD:"דולר אמריקאי",EUR:"יורו",GBP:"לירה שטרלינג",
  JPY:"ין יפני",THB:"בהט תאילנדי",TRY:"לירה טורקית",AED:"דירהם אמירתי",
  CHF:"פרנק שוויצרי",CAD:"דולר קנדי",AUD:"דולר אוסטרלי",INR:"רופי הודי",
  MXN:"פסו מקסיקני",BRL:"ריאל ברזילאי",SGD:"דולר סינגפורי",HKD:"דולר הונג קונגי",
  SEK:"כתר שוודי",NOK:"כתר נורווגי",DKK:"כתר דני",PLN:"זלוטי פולני",
  CNY:"יואן סיני",KRW:"וון קוריאני",MYR:"רינגיט מלזי",
  IDR:"רופיה אינדונזית",PHP:"פסו פיליפיני",EGP:"לירה מצרית",ZAR:"ראנד ד.א.",
  MAD:"דירהם מרוקאי",JOD:"דינר ירדני",
};
const CURR_SYMBOLS:{[key:string]:string}={
  ILS:"₪",USD:"$",EUR:"€",GBP:"£",JPY:"¥",THB:"฿",TRY:"₺",
  CHF:"Fr",CAD:"C$",AUD:"A$",INR:"₹",BRL:"R$",SGD:"S$",HKD:"HK$",
  SEK:"kr",NOK:"kr",DKK:"kr",PLN:"zł",CNY:"¥",KRW:"₩",RUB:"₽",
};
const getCurrLabel=(code:string)=>CURRENCY_NAMES[code]||code;
const getCurrSymbol=(code:string)=>CURR_SYMBOLS[code]||code;
const WMO={0:"☀️ בהיר",1:"🌤️ בהיר חלקית",2:"⛅ מעונן חלקית",3:"☁️ מעונן",45:"🌫️ ערפל",48:"🌫️ ערפל",51:"🌦️ טפטוף קל",53:"🌦️ טפטוף",55:"🌧️ טפטוף כבד",61:"🌧️ גשם קל",63:"🌧️ גשם",65:"🌧️ גשם כבד",80:"🌦️ ממטרים",81:"🌧️ ממטרים",82:"⛈️ ממטרים כבדים",95:"⛈️ סערה",96:"⛈️ סערה+ברד",99:"⛈️ סערה חזקה"};
const PERSON_COLORS=[C.ocean,C.coral,C.palm,C.sunset,C.purple,C.oceanLight,"#C0392B","#8E44AD"];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmtDate=d=>d?new Date(d).toLocaleDateString("he-IL",{day:"2-digit",month:"2-digit",year:"numeric"}):"";
const getRange=(s,e)=>{const a=[];if(!s||!e)return a;const c=new Date(s),l=new Date(e);while(c<=l){a.push(c.toISOString().slice(0,10));c.setDate(c.getDate()+1);}return a;};
const uid=()=>Math.random().toString(36).slice(2)+Date.now().toString(36);
const remTime=t=>{if(!t)return null;const[h,m]=t.split(":").map(Number),tot=h*60+m-180;if(tot<0)return null;return`${String(Math.floor(tot/60)).padStart(2,"0")}:${String(tot%60).padStart(2,"0")}`;};

// ─── HOOKS ────────────────────────────────────────────────────────────────────
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
  const[wx,setWx]=useState(null);const[loading,setLoading]=useState(false);const[error,setErr]=useState(null);
  useEffect(()=>{
    if(!destination||!startDate||!endDate)return;
    const today=new Date();today.setHours(0,0,0,0);
    const diff=Math.round((new Date(startDate)-today)/86400000);
    if(diff>16||diff<-1){setErr("תחזית זמינה רק עד 16 יום קדימה");return;}
    setLoading(true);setErr(null);setWx(null);
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en`)
      .then(r=>r.json()).then(geo=>{
        if(!geo.results?.length)throw new Error("יעד לא נמצא");
        const{latitude:lat,longitude:lon,name,country}=geo.results[0];
        const end2=endDate>new Date(today.getTime()+16*86400000).toISOString().slice(0,10)?new Date(today.getTime()+16*86400000).toISOString().slice(0,10):endDate;
        return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&start_date=${startDate}&end_date=${end2}&timezone=auto`)
          .then(r=>r.json()).then(fc=>({name,country,daily:fc.daily}));
      }).then(d=>{setWx(d);setLoading(false);}).catch(e=>{setErr(e.message||"שגיאה");setLoading(false);});
  },[destination,startDate,endDate]);
  return{wx,loading,error};
}

// ─── GLOBAL STYLE ─────────────────────────────────────────────────────────────
const GS=`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Nunito:wght@400;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:${F.b};background:${C.lightBg};color:${C.dark};direction:rtl}
  ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:${C.sandDark}}::-webkit-scrollbar-thumb{background:${C.ocean};border-radius:3px}
`;

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function WaveHeader({title,subtitle,action}){
  return(
    <div style={{background:`linear-gradient(135deg,${C.oceanDeep} 0%,${C.ocean} 60%,${C.oceanLight} 100%)`,padding:"28px 24px 48px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-30,left:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.06)"}}/>
      <div style={{position:"absolute",bottom:-20,right:-20,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
        <h1 style={{fontFamily:F.d,color:C.white,fontSize:28,fontWeight:900,lineHeight:1.2}}>{title}</h1>
        {subtitle&&<p style={{color:"rgba(255,255,255,0.8)",marginTop:6,fontSize:15,fontWeight:600}}>{subtitle}</p>}
        {action&&<div style={{marginTop:12}}>{action}</div>}
      </div>
      <svg style={{position:"absolute",bottom:0,left:0,right:0,width:"100%",height:28}} viewBox="0 0 400 28" preserveAspectRatio="none">
        <path d="M0,14 C100,28 300,0 400,14 L400,28 L0,28 Z" fill={C.lightBg}/>
      </svg>
    </div>
  );
}

function NavBar({screens,current,onNav}){
  const labels=["יעד","הוצאות","תקציב","לוח שנה"],icons=["🌴","💳","💰","📅"];
  return(
    <div style={{display:"flex",background:C.white,boxShadow:"0 -2px 12px rgba(42,123,140,0.12)",position:"sticky",bottom:0,zIndex:100}}>
      {screens.map((s,i)=>(
        <button key={s} onClick={()=>onNav(s)} style={{flex:1,padding:"10px 4px 8px",border:"none",background:current===s?`linear-gradient(180deg,${C.lightBg} 0%,${C.sandDark} 100%)`:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,borderTop:current===s?`3px solid ${C.ocean}`:"3px solid transparent",transition:"all 0.2s"}}>
          <span style={{fontSize:20}}>{icons[i]}</span>
          <span style={{fontSize:11,fontWeight:700,color:current===s?C.ocean:C.muted,fontFamily:F.b}}>{labels[i]}</span>
        </button>
      ))}
    </div>
  );
}

const Card=({children,style})=><div style={{background:C.white,borderRadius:20,padding:"18px",boxShadow:"0 4px 20px rgba(42,123,140,0.08)",...style}}>{children}</div>;
const FL=({children})=><label style={{display:"block",fontWeight:700,fontSize:14,marginBottom:6,color:C.darkMid}}>{children}</label>;

function SI({label,value,onChange,type="text",placeholder,min,max,style}){
  return(
    <div style={{marginBottom:14,...style}}>
      {label&&<FL>{label}</FL>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} min={min} max={max}
        style={{width:"100%",padding:"11px 14px",borderRadius:12,border:`2px solid ${C.sandDark}`,fontFamily:F.b,fontSize:15,color:C.dark,background:C.lightBg,outline:"none",direction:"rtl",transition:"border 0.2s"}}
        onFocus={e=>(e.target.style.borderColor=C.ocean)} onBlur={e=>(e.target.style.borderColor=C.sandDark)}/>
    </div>
  );
}

function SS({label,value,onChange,children,style}){
  return(
    <div style={{marginBottom:14,...style}}>
      {label&&<FL>{label}</FL>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",padding:"11px 12px",borderRadius:12,border:`2px solid ${C.sandDark}`,fontFamily:F.b,fontSize:14,background:C.lightBg,color:C.dark,direction:"rtl"}}>
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
    <button onClick={onClick} disabled={disabled} style={{padding:small?"8px 14px":"13px 20px",borderRadius:12,border,background:disabled?C.sandDark:bg,color:disabled?C.muted:col,fontFamily:F.b,fontWeight:700,fontSize:small?13:15,cursor:disabled?"default":"pointer",transition:"all 0.2s",opacity:disabled?0.6:1,...style}}>
      {children}
    </button>
  );
}

// ─── PIE CHART ────────────────────────────────────────────────────────────────
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
        <text x={cx} y={cy-8} textAnchor="middle" fontFamily={F.d} fontSize={11} fill={C.dark} fontWeight={700}>{hov!==null?slices[hov].label:'סה"כ'}</text>
        <text x={cx} y={cy+10} textAnchor="middle" fontFamily={F.d} fontSize={13} fill={C.oceanDeep} fontWeight={900}>{hov!==null?`₪${slices[hov].value.toFixed(0)}`:`₪${total.toFixed(0)}`}</text>
        {hov!==null&&<text x={cx} y={cy+26} textAnchor="middle" fontFamily={F.b} fontSize={9} fill={C.muted}>{((slices[hov].value/total)*100).toFixed(1)}%</text>}
      </svg>
      <div style={{display:"flex",flexWrap:"wrap",gap:"6px 12px",justifyContent:"center",maxWidth:260}}>
        {slices.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",opacity:hov!==null&&hov!==i?0.4:1,transition:"opacity 0.15s"}}
            onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}>
            <div style={{width:11,height:11,borderRadius:3,background:s.color,flexShrink:0}}/>
            <span style={{fontSize:12,fontWeight:700}}>{s.icon} {s.label}</span>
            <span style={{fontSize:11,color:C.muted}}>{((s.value/total)*100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TRIP SELECTOR SCREEN ─────────────────────────────────────────────────────
function TripSelectorScreen({trips,onSelect,onCreate,onDelete}){
  return(
    <div style={{minHeight:"100vh",background:C.lightBg}}>
      <div style={{background:`linear-gradient(135deg,${C.oceanDeep},${C.ocean})`,padding:"40px 24px 60px",position:"relative",overflow:"hidden",textAlign:"center"}}>
        <div style={{position:"absolute",top:-40,left:-40,width:160,height:160,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
        <div style={{position:"absolute",bottom:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.07)"}}/>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{fontSize:48,marginBottom:8}}>🌺</div>
          <h1 style={{fontFamily:F.d,color:C.white,fontSize:32,fontWeight:900}}>TripPlan</h1>
          <p style={{color:"rgba(255,255,255,0.75)",marginTop:6,fontSize:15}}>מתכנן הטיולים שלך</p>
        </div>
        <svg style={{position:"absolute",bottom:0,left:0,width:"100%",height:28}} viewBox="0 0 400 28" preserveAspectRatio="none">
          <path d="M0,14 C100,28 300,0 400,14 L400,28 L0,28 Z" fill={C.lightBg}/>
        </svg>
      </div>

      <div style={{padding:"24px 20px",display:"flex",flexDirection:"column",gap:12}}>
        <button onClick={onCreate} style={{padding:"18px",borderRadius:18,border:`2px dashed ${C.ocean}`,background:`${C.ocean}0D`,color:C.ocean,fontSize:16,fontWeight:800,fontFamily:F.b,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          ➕ טיול חדש
        </button>

        {trips.length===0&&(
          <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
            <div style={{fontSize:48,marginBottom:12}}>✈️</div>
            <div style={{fontSize:16,fontWeight:600}}>אין טיולים עדיין</div>
            <div style={{fontSize:13,marginTop:6}}>לחץ על "טיול חדש" כדי להתחיל</div>
          </div>
        )}

        {trips.map(t=>{
          const nights=t.startDate&&t.endDate?Math.round((new Date(t.endDate)-new Date(t.startDate))/86400000)+1:0;
          const total=t.expenses?.reduce((s,e)=>s+e.amountILS,0)||0;
          return(
            <div key={t.id} onClick={()=>onSelect(t.id)} style={{background:C.white,borderRadius:18,padding:"16px 18px",boxShadow:"0 4px 16px rgba(42,123,140,0.10)",cursor:"pointer",display:"flex",alignItems:"center",gap:14,borderRight:`4px solid ${C.ocean}`,transition:"transform 0.15s,box-shadow 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 24px rgba(42,123,140,0.18)`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 16px rgba(42,123,140,0.10)";}}>
              <div style={{width:48,height:48,borderRadius:14,background:`linear-gradient(135deg,${C.ocean},${C.oceanLight})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🌍</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:F.d,fontSize:17,fontWeight:700,color:C.dark}}>{t.destination||"יעד לא מוגדר"}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:3}}>
                  {t.startDate?`${fmtDate(t.startDate)} – ${fmtDate(t.endDate)}`:"תאריכים לא מוגדרים"}
                  {nights>0&&` · ${nights} ימים`}
                </div>
                {total>0&&<div style={{fontSize:12,color:C.palm,fontWeight:700,marginTop:2}}>₪{total.toFixed(0)} סה"כ</div>}
              </div>
              <button onClick={ev=>{ev.stopPropagation();if(window.confirm("למחוק את הטיול?"))onDelete(t.id);}} style={{padding:"6px 8px",borderRadius:8,border:"none",background:`${C.coral}15`,color:C.coral,fontSize:14,cursor:"pointer"}}>🗑️</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SCREEN 1: DESTINATION + PEOPLE ──────────────────────────────────────────
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
      <h2 style={{fontFamily:F.d,fontSize:20,fontWeight:700,marginBottom:4,color:C.oceanDeep}}>💱 מטבעות בטיול</h2>
      <p style={{fontSize:12,color:C.muted,marginBottom:12}}>בחר את המטבעות שתשתמש בהם. לחץ על מטבע להגדרתו כברירת מחדל.</p>

      {/* Active currencies */}
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>
        {tripCurrencies.map(code=>{
          const isDefault=trip.defaultCurrency===code;
          const rate=rates[code];
          return(
            <div key={code} onClick={()=>onUpdate({defaultCurrency:code})}
              style={{display:"flex",alignItems:"center",gap:7,padding:"9px 13px",borderRadius:14,border:`2px solid ${isDefault?C.ocean:C.sandDark}`,background:isDefault?`${C.ocean}15`:C.white,cursor:"pointer",transition:"all 0.15s"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:isDefault?C.ocean:C.dark,lineHeight:1}}>{getCurrSymbol(code)}</div>
                <div style={{fontSize:11,fontWeight:700,color:isDefault?C.ocean:C.darkMid}}>{code}</div>
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:isDefault?C.ocean:C.dark}}>{getCurrLabel(code)}</div>
                {rate&&code!=="ILS"&&<div style={{fontSize:10,color:C.muted}}>1 {code} = ₪{rate.toFixed(3)}</div>}
                {isDefault&&<div style={{fontSize:10,color:C.ocean,fontWeight:700}}>★ ברירת מחדל</div>}
              </div>
              {tripCurrencies.length>1&&(
                <button onClick={e=>{e.stopPropagation();removeCurrency(code);}}
                  style={{background:"none",border:"none",cursor:"pointer",fontSize:15,color:C.muted,padding:"0 0 0 4px",lineHeight:1}}>×</button>
              )}
            </div>
          );
        })}
        <button onClick={()=>setShowPicker(p=>!p)}
          style={{padding:"9px 14px",borderRadius:14,border:`2px dashed ${C.ocean}`,background:`${C.ocean}08`,color:C.ocean,fontFamily:F.b,fontWeight:700,fontSize:13,cursor:"pointer"}}>
          ➕ הוסף מטבע
        </button>
      </div>

      {/* Currency picker */}
      {showPicker&&(
        <div style={{background:C.lightBg,borderRadius:14,padding:"12px",border:`1.5px solid ${C.sandDark}`}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="חפש מטבע... (למשל: THB, יאן, דולר)"
            style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`2px solid ${C.sandDark}`,fontFamily:F.b,fontSize:14,direction:"rtl",background:C.white,outline:"none",marginBottom:10}}
            onFocus={e=>(e.target.style.borderColor=C.ocean)} onBlur={e=>(e.target.style.borderColor=C.sandDark)} autoFocus/>
          {allCodes.length===0&&(
            <div style={{textAlign:"center",color:C.muted,fontSize:13,padding:"8px 0"}}>
              ⏳ שאיבת מטבעות... (נדרש חיבור לאינטרנט)
            </div>
          )}
          {/* Popular first if no search */}
          {!search&&(
            <div style={{marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:6}}>פופולריים:</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {["THB","GBP","JPY","AED","TRY","AUD","CAD","CHF","SGD","INR","EGP","MAD","JOD"]
                  .filter(c=>!tripCurrencies.includes(c))
                  .slice(0,10)
                  .map(code=>(
                    <button key={code} onClick={()=>addCurrency(code)}
                      style={{padding:"5px 11px",borderRadius:999,border:`1.5px solid ${C.sandDark}`,background:C.white,fontFamily:F.b,fontWeight:700,fontSize:12,cursor:"pointer",color:C.dark}}>
                      {getCurrSymbol(code)} {code} <span style={{color:C.muted,fontWeight:400}}>{getCurrLabel(code)}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
          {/* Search results */}
          {search&&(
            <div style={{maxHeight:180,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
              {filtered.length===0?<div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"8px"}}>לא נמצאו תוצאות</div>
              :filtered.map(code=>(
                <button key={code} onClick={()=>addCurrency(code)}
                  style={{padding:"8px 12px",borderRadius:10,border:"none",background:C.white,fontFamily:F.b,fontSize:13,cursor:"pointer",textAlign:"right",display:"flex",alignItems:"center",gap:10,transition:"background 0.1s"}}
                  onMouseEnter={e=>(e.target.style.background=C.sandDark)} onMouseLeave={e=>(e.target.style.background=C.white)}>
                  <span style={{fontWeight:800,color:C.ocean,minWidth:36}}>{getCurrSymbol(code)}</span>
                  <span style={{fontWeight:700}}>{code}</span>
                  <span style={{color:C.muted,fontSize:12}}>{getCurrLabel(code)}</span>
                  {rates[code]&&code!=="ILS"&&<span style={{color:C.muted,fontSize:11,marginRight:"auto"}}>₪{rates[code].toFixed(3)}</span>}
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
          <h2 style={{fontFamily:F.d,fontSize:20,fontWeight:700,marginBottom:16,color:C.oceanDeep}}>פרטי היעד</h2>
          <SI label="יעד הטיול 🌍" value={trip.destination} onChange={v=>onUpdate({destination:v})} placeholder="למשל: תאילנד, פריז..."/>
          <SI label="תאריך יציאה ✈️" value={trip.startDate} onChange={v=>onUpdate({startDate:v})} type="date"/>
          <SI label="תאריך חזרה 🏠"  value={trip.endDate}   onChange={v=>onUpdate({endDate:v})}   type="date" min={trip.startDate}/>
          {valid&&(
            <div style={{padding:"12px 16px",background:`${C.ocean}12`,borderRadius:12,border:`2px solid ${C.ocean}25`,textAlign:"center"}}>
              <span style={{fontFamily:F.d,fontSize:26,fontWeight:900,color:C.ocean}}>{Math.round((new Date(trip.endDate)-new Date(trip.startDate))/86400000)+1}</span>
              <span style={{fontSize:15,fontWeight:700,color:C.oceanDeep,marginRight:6}}>ימי טיול 🎉</span>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>{fmtDate(trip.startDate)} – {fmtDate(trip.endDate)}</div>
            </div>
          )}
        </Card>

        <CurrencyManager trip={trip} onUpdate={onUpdate} allCodes={allCodes} rates={rates}/>

        {/* People */}
        <Card>
          <h2 style={{fontFamily:F.d,fontSize:20,fontWeight:700,marginBottom:4,color:C.oceanDeep}}>👥 משתתפים</h2>
          <p style={{fontSize:13,color:C.muted,marginBottom:14}}>הוסף את כל האנשים/משפחות בטיול לניהול הוצאות משותפות</p>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="שם משתתף..." onKeyDown={e=>e.key==="Enter"&&addPerson()}
              style={{flex:1,padding:"10px 14px",borderRadius:12,border:`2px solid ${C.sandDark}`,fontFamily:F.b,fontSize:14,direction:"rtl",background:C.lightBg,outline:"none"}}
              onFocus={e=>(e.target.style.borderColor=C.ocean)} onBlur={e=>(e.target.style.borderColor=C.sandDark)}/>
            <button onClick={addPerson} style={{padding:"10px 16px",borderRadius:12,border:"none",background:C.ocean,color:C.white,fontFamily:F.b,fontWeight:700,fontSize:14,cursor:"pointer"}}>➕</button>
          </div>
          {people.length===0?(
            <div style={{textAlign:"center",color:C.muted,padding:"12px 0",fontSize:13}}>טיול סולו? ניתן להשאיר ריק 🌴</div>
          ):(
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {people.map(p=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:999,background:p.color+"20",border:`2px solid ${p.color}40`}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:p.color,flexShrink:0}}/>
                  <span style={{fontSize:13,fontWeight:700,color:C.dark}}>{p.name}</span>
                  <button onClick={()=>removePerson(p.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,color:C.muted,padding:"0 0 0 2px",lineHeight:1}}>×</button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Btn onClick={onNext} disabled={!valid} style={{width:"100%",fontSize:17,padding:"16px",borderRadius:16,boxShadow:valid?`0 6px 20px ${C.ocean}40`:"none"}}>
          המשך להוספת הוצאות ←
        </Btn>
      </div>
    </div>
  );
}

// ─── SCREEN 2: EXPENSES ───────────────────────────────────────────────────────
const mkForm=(dates,cur)=>({category:"food",amount:"",currency:cur||"ILS",description:"",paid:false,date:dates[0]||"",checkIn:dates[0]||"",checkOut:dates[1]||dates[0]||"",departureTime:"",paidBy:"",splitWith:[],splitType:"equal"});

function ExpensesScreen({trip,expenses,onAdd,onTogglePaid,onDelete,toILS,rates,ratesInfo}){
  const dates=getRange(trip.startDate,trip.endDate);
  const people=trip.people||[];
  const[sel,setSel]=useState(dates[0]||"");
  const[form,setForm]=useState(mkForm(dates,trip.defaultCurrency));
  const[show,setShow]=useState(false);
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
    onAdd({id:uid(),...form,date,amount:parseFloat(form.amount),amountILS:toILS(parseFloat(form.amount),form.currency)});
    setForm(mkForm(dates,trip.defaultCurrency));
    setShow(false);
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
      <div style={{background:C.white,borderRadius:14,padding:"14px",boxShadow:"0 2px 10px rgba(0,0,0,0.05)",borderRight:`4px solid ${cat?.color||C.muted}`,display:"flex",alignItems:"flex-start",gap:10}}>
        <span style={{fontSize:24,flexShrink:0,marginTop:2}}>{cat?.icon}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,fontSize:14}}>{cat?.label}</div>
          {exp.category==="hotel"&&exp.checkIn&&<div style={{fontSize:11,color:C.ocean,fontWeight:600}}>{fmtDate(exp.checkIn)} → {fmtDate(exp.checkOut)} · {Math.round((new Date(exp.checkOut)-new Date(exp.checkIn))/86400000)} לילות</div>}
          {exp.category==="flight"&&exp.departureTime&&<div style={{fontSize:11,color:C.ocean,fontWeight:600}}>המראה: {exp.departureTime}</div>}
          {exp.description&&<div style={{fontSize:12,color:C.muted,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{exp.description}</div>}
          <div style={{fontSize:12,color:C.muted,marginTop:2}}>{sym(exp.currency)}{exp.amount.toFixed(2)} ≈ ₪{exp.amountILS.toFixed(2)}</div>
          {exp.paidBy&&<div style={{marginTop:4,display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
            <span style={{fontSize:11,background:personColor(exp.paidBy)+"25",color:personColor(exp.paidBy),borderRadius:6,padding:"2px 7px",fontWeight:700}}>שילם: {personName(exp.paidBy)}</span>
            {exp.splitWith?.length>0&&exp.splitWith.map(id=>(
              <span key={id} style={{fontSize:11,background:personColor(id)+"20",color:personColor(id),borderRadius:6,padding:"2px 7px",fontWeight:600}}>{personName(id)}</span>
            ))}
          </div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flexShrink:0}}>
          <button onClick={()=>onTogglePaid(exp.id)} style={{padding:"5px 9px",borderRadius:8,border:"none",background:exp.paid?`${C.palm}20`:`${C.coral}20`,color:exp.paid?C.palm:C.coral,fontFamily:F.b,fontWeight:700,fontSize:11,cursor:"pointer"}}>{exp.paid?"✅":"⏳"}</button>
          <button onClick={()=>onDelete(exp.id)} style={{padding:"5px 7px",borderRadius:8,border:"none",background:`${C.coral}15`,color:C.coral,fontFamily:F.b,fontWeight:700,fontSize:11,cursor:"pointer"}}>🗑️</button>
        </div>
      </div>
    );
  };

  return(
    <div>
      <WaveHeader title="💳 הוצאות" subtitle={trip.destination?`הטיול ל${trip.destination}`:""}/>

      <div style={{margin:"14px 16px 0",padding:"9px 14px",background:C.white,borderRadius:12,fontSize:12,color:C.muted,display:"flex",gap:10,flexWrap:"wrap",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
        <span>💱 {(trip.currencies||[]).filter(c=>c!=="ILS").map(code=>`1 ${code} = ₪${(rates[code]||0).toFixed(3)}`).join(" | ")}</span>
        {ratesInfo.updated&&<span style={{color:C.palm}}>✓ {ratesInfo.updated}</span>}
        {ratesInfo.error&&<span style={{color:C.coral}}>{ratesInfo.error}</span>}
      </div>

      {/* Search bar */}
      <div style={{padding:"12px 16px 0",display:"flex",gap:8}}>
        <div style={{flex:1,position:"relative"}}>
          <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none"}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="חיפוש הוצאות..."
            style={{width:"100%",padding:"10px 36px 10px 12px",borderRadius:12,border:`2px solid ${C.sandDark}`,fontFamily:F.b,fontSize:14,direction:"rtl",background:C.white,outline:"none"}}
            onFocus={e=>(e.target.style.borderColor=C.ocean)} onBlur={e=>(e.target.style.borderColor=C.sandDark)}/>
        </div>
        <button onClick={()=>setShowFilters(f=>!f)} style={{padding:"10px 14px",borderRadius:12,border:`2px solid ${showFilters||filterCat!=="all"||filterPaid!=="all"?C.ocean:C.sandDark}`,background:showFilters||filterCat!=="all"||filterPaid!=="all"?`${C.ocean}15`:C.white,color:showFilters||filterCat!=="all"||filterPaid!=="all"?C.ocean:C.muted,fontFamily:F.b,fontWeight:700,fontSize:13,cursor:"pointer"}}>
          🎛️ סינון
        </button>
      </div>

      {showFilters&&(
        <div style={{margin:"8px 16px 0",padding:"12px",background:C.white,borderRadius:14,boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:700,color:C.darkMid,marginBottom:6}}>קטגוריה</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[{id:"all",label:"הכל",icon:"📋"},...CATS].map(c=>(
                <button key={c.id} onClick={()=>setFilterCat(c.id)} style={{padding:"5px 10px",borderRadius:999,border:`1.5px solid ${filterCat===c.id?C.ocean:C.sandDark}`,background:filterCat===c.id?C.ocean:C.white,color:filterCat===c.id?C.white:C.dark,fontFamily:F.b,fontWeight:700,fontSize:12,cursor:"pointer"}}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:C.darkMid,marginBottom:6}}>סטטוס תשלום</div>
            <div style={{display:"flex",gap:6}}>
              {[{id:"all",label:"הכל"},{id:"paid",label:"✅ שולם"},{id:"unpaid",label:"⏳ טרם שולם"}].map(o=>(
                <button key={o.id} onClick={()=>setFilterPaid(o.id)} style={{padding:"5px 12px",borderRadius:999,border:`1.5px solid ${filterPaid===o.id?C.ocean:C.sandDark}`,background:filterPaid===o.id?C.ocean:C.white,color:filterPaid===o.id?C.white:C.dark,fontFamily:F.b,fontWeight:700,fontSize:12,cursor:"pointer"}}>
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
          <div style={{fontSize:13,color:C.muted,fontWeight:600}}>נמצאו {allFiltered.length} הוצאות</div>
          {allFiltered.length===0?<div style={{textAlign:"center",color:C.muted,padding:"24px 0",fontSize:15}}>🔍 לא נמצאו תוצאות</div>
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
                  <button key={d} onClick={()=>setSel(d)} style={{minWidth:60,padding:"9px 7px",borderRadius:13,border:`2px solid ${sel===d?C.ocean:C.sandDark}`,background:sel===d?C.ocean:C.white,color:sel===d?C.white:C.dark,fontFamily:F.b,fontWeight:700,fontSize:12,cursor:"pointer",textAlign:"center",flexShrink:0,position:"relative"}}>
                    <div style={{fontSize:10,opacity:0.8}}>{new Date(d).toLocaleDateString("he-IL",{weekday:"short"})}</div>
                    <div style={{fontSize:15}}>{new Date(d).getDate()}</div>
                    {cnt>0&&<div style={{position:"absolute",top:-4,right:-4,width:15,height:15,borderRadius:"50%",background:C.coral,color:C.white,fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{cnt}</div>}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:12}}>
            <button onClick={()=>{set({date:sel,checkIn:sel});setShow(true);}} style={{padding:"14px",borderRadius:14,border:`2px dashed ${C.ocean}`,background:`${C.ocean}0D`,color:C.ocean,fontSize:15,fontWeight:800,fontFamily:F.b,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              ➕ הוסף הוצאה ל{fmtDate(sel)}
            </button>

            {show&&(
              <Card>
                <h3 style={{fontFamily:F.d,fontSize:17,fontWeight:700,marginBottom:14,color:C.oceanDeep}}>הוצאה חדשה</h3>

                {/* category */}
                <div style={{marginBottom:14}}>
                  <FL>קטגוריה</FL>
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                    {CATS.map(cat=>(
                      <button key={cat.id} onClick={()=>set({category:cat.id})} style={{padding:"7px 11px",borderRadius:999,border:`2px solid ${form.category===cat.id?cat.color:C.sandDark}`,background:form.category===cat.id?cat.color:C.white,color:form.category===cat.id?C.white:C.dark,fontFamily:F.b,fontWeight:700,fontSize:12,cursor:"pointer"}}>
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hotel */}
                {form.category==="hotel"&&(
                  <div style={{marginBottom:14,padding:"12px",background:`${C.oceanLight}12`,borderRadius:14,border:`1.5px solid ${C.oceanLight}40`}}>
                    <div style={{fontWeight:700,fontSize:13,color:C.oceanDeep,marginBottom:10}}>🏨 תאריכי שהייה</div>
                    <SI label="📅 צ׳ק אין"   value={form.checkIn}  onChange={v=>set({checkIn:v})}  type="date" min={trip.startDate} max={trip.endDate}/>
                    <SI label="📅 צ׳ק אאוט" value={form.checkOut} onChange={v=>set({checkOut:v})} type="date" min={form.checkIn}  max={trip.endDate}/>
                    {form.checkIn&&form.checkOut&&form.checkOut>form.checkIn&&(
                      <div style={{fontSize:12,color:C.ocean,fontWeight:700,marginTop:-8,marginBottom:6}}>🌙 {Math.round((new Date(form.checkOut)-new Date(form.checkIn))/86400000)} לילות</div>
                    )}
                    <div style={{fontSize:11,color:C.muted}}>הסכום הוא לכל תקופת השהייה</div>
                  </div>
                )}

                {/* Flight */}
                {form.category==="flight"&&(
                  <div style={{marginBottom:14,padding:"12px",background:`${C.ocean}0D`,borderRadius:14,border:`1.5px solid ${C.ocean}30`}}>
                    <div style={{fontWeight:700,fontSize:13,color:C.oceanDeep,marginBottom:10}}>✈️ פרטי טיסה</div>
                    <SI label="שעת המראה" value={form.departureTime} onChange={v=>set({departureTime:v})} type="time"/>
                    <SS label="תאריך טיסה" value={form.date} onChange={v=>set({date:v})}>
                      {dates.map(d=><option key={d} value={d}>{fmtDate(d)}</option>)}
                    </SS>
                    {form.departureTime&&remTime(form.departureTime)&&(
                      <div style={{fontSize:12,color:C.coral,fontWeight:700,marginTop:-8}}>🔔 הגעה לשדה עד {remTime(form.departureTime)}</div>
                    )}
                  </div>
                )}

                {/* Amount */}
                <div style={{display:"flex",gap:10}}>
                  <div style={{flex:2}}><SI label="סכום" value={form.amount} onChange={v=>set({amount:v})} type="number" placeholder="0" min="0"/></div>
                  <div style={{flex:1}}><SS label="מטבע" value={form.currency} onChange={v=>set({currency:v})}>{(trip.currencies||["ILS","USD","EUR"]).map(code=><option key={code} value={code}>{getCurrSymbol(code)} {code} – {getCurrLabel(code)}</option>)}</SS></div>
                </div>
                {form.amount&&<div style={{marginBottom:12,padding:"9px 12px",background:`${C.palm}15`,borderRadius:10,fontSize:13,color:C.palmLight,fontWeight:700}}>≈ {toILS(parseFloat(form.amount)||0,form.currency).toFixed(2)} ₪</div>}

                <SI label="תיאור (אופציונלי)" value={form.description} onChange={v=>set({description:v})} placeholder="למשל: ארוחת ערב..."/>

                {form.category!=="hotel"&&form.category!=="flight"&&(
                  <SS label="תאריך" value={form.date} onChange={v=>set({date:v})}>
                    {dates.map(d=><option key={d} value={d}>{fmtDate(d)}</option>)}
                  </SS>
                )}

                {/* People split – only if people defined */}
                {people.length>0&&(
                  <div style={{marginBottom:14,padding:"12px",background:`${C.purple}0A`,borderRadius:14,border:`1.5px solid ${C.purple}25`}}>
                    <div style={{fontWeight:700,fontSize:13,color:C.purple,marginBottom:10}}>👥 חלוקה בין משתתפים</div>
                    <SS label="מי שילם?" value={form.paidBy} onChange={v=>set({paidBy:v})}>
                      <option value="">-- לא מוגדר --</option>
                      {people.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                    </SS>
                    <div style={{marginBottom:10}}>
                      <FL>שיתוף עם:</FL>
                      <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                        {people.filter(p=>p.id!==form.paidBy).map(p=>(
                          <button key={p.id} onClick={()=>toggleSplitPerson(p.id)} style={{padding:"6px 12px",borderRadius:999,border:`2px solid ${form.splitWith.includes(p.id)?p.color:C.sandDark}`,background:form.splitWith.includes(p.id)?p.color+"20":C.white,color:form.splitWith.includes(p.id)?p.color:C.dark,fontFamily:F.b,fontWeight:700,fontSize:12,cursor:"pointer"}}>
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    {form.splitWith.length>0&&(
                      <div style={{display:"flex",gap:6}}>
                        {[{id:"equal",label:"חלוקה שווה"},{id:"payer",label:"המשלם משלם הכל"}].map(o=>(
                          <button key={o.id} onClick={()=>set({splitType:o.id})} style={{flex:1,padding:"7px",borderRadius:10,border:`1.5px solid ${form.splitType===o.id?C.purple:C.sandDark}`,background:form.splitType===o.id?`${C.purple}15`:C.white,color:form.splitType===o.id?C.purple:C.muted,fontFamily:F.b,fontWeight:700,fontSize:12,cursor:"pointer"}}>
                            {o.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button onClick={()=>set({paid:!form.paid})} style={{width:"100%",padding:"11px",borderRadius:12,border:`2px solid ${form.paid?C.palm:C.sandDark}`,background:form.paid?`${C.palm}15`:C.white,color:form.paid?C.palm:C.muted,fontFamily:F.b,fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  {form.paid?"✅ שולם":"⏳ טרם שולם"}
                </button>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={handleAdd} style={{flex:2,padding:"13px",borderRadius:13,border:"none",background:`linear-gradient(135deg,${C.ocean},${C.oceanLight})`,color:C.white,fontFamily:F.b,fontWeight:800,fontSize:15,cursor:"pointer"}}>הוסף ✓</button>
                  <button onClick={()=>setShow(false)} style={{flex:1,padding:"13px",borderRadius:13,border:`2px solid ${C.sandDark}`,background:C.white,fontFamily:F.b,fontWeight:700,fontSize:14,cursor:"pointer",color:C.muted}}>ביטול</button>
                </div>
              </Card>
            )}

            {dayExp.length===0?(<div style={{textAlign:"center",color:C.muted,padding:"28px 0",fontSize:15}}><div style={{fontSize:36,marginBottom:10}}>🌊</div>אין הוצאות לתאריך זה</div>)
            :dayExp.map(exp=><ExpenseRow key={exp.id} exp={exp}/>)}
          </div>
        </>
      )}
    </div>
  );
}

// ─── SCREEN 3: BUDGET + SETTLEMENT ───────────────────────────────────────────
function BudgetScreen({trip,expenses}){
  const people=trip.people||[];
  const total=expenses.reduce((s,e)=>s+e.amountILS,0);
  const paid=expenses.filter(e=>e.paid).reduce((s,e)=>s+e.amountILS,0);
  const unpaid=total-paid;
  const byCat=CATS.map(cat=>{const ce=expenses.filter(e=>e.category===cat.id);return{...cat,total:ce.reduce((s,e)=>s+e.amountILS,0),count:ce.length};}).filter(c=>c.count>0);
  const pieData=byCat.map(c=>({label:c.label,value:c.total,color:c.color,icon:c.icon}));

  // Settlement calculation
  const settlement=useMemo(()=>{
    if(people.length<2)return[];
    const balances={};
    people.forEach(p=>balances[p.id]=0);
    expenses.forEach(exp=>{
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
  const handlePDF=()=>{
    const lines=[
      `TripPlan – ${trip.destination||"טיול"}`,
      `${fmtDate(trip.startDate)} – ${fmtDate(trip.endDate)}`,
      "",
      `סה"כ הוצאות: ₪${total.toFixed(0)}`,
      `שולם: ₪${paid.toFixed(0)} | טרם שולם: ₪${unpaid.toFixed(0)}`,
      "",
      "── הוצאות לפי קטגוריה ──",
      ...byCat.map(c=>`${c.icon} ${c.label}: ₪${c.total.toFixed(0)} (${c.count})`),
      "",
      "── כל ההוצאות ──",
      ...expenses.map(e=>{
        const cat=CATS.find(c=>c.id===e.category);
        return`${fmtDate(e.date)} | ${cat?.label} | ${e.description||""} | ₪${e.amountILS.toFixed(0)} | ${e.paid?"שולם":"טרם שולם"}`;
      }),
      ...(settlement.length>0?["","── התחשבנות ──",...settlement.map(d=>`${d.from.name} חייב ל${d.to.name}: ₪${d.amount.toFixed(0)}`)]:[""])
    ];
    const blob=new Blob(["\uFEFF"+lines.join("\n")],{type:"text/plain;charset=utf-8"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`TripPlan-${trip.destination||"trip"}.txt`; a.click();
  };

  return(
    <div>
      <WaveHeader title="💰 תקציב" subtitle={trip.destination?`סיכום הטיול ל${trip.destination}`:""}
        action={<button onClick={handlePDF} style={{padding:"8px 18px",borderRadius:10,border:"2px solid rgba(255,255,255,0.5)",background:"rgba(255,255,255,0.15)",color:C.white,fontFamily:F.b,fontWeight:700,fontSize:13,cursor:"pointer"}}>📤 ייצוא</button>}/>
      <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:14}}>

        {/* KPI */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[{label:'סה"כ הוצאות',value:total,color:C.ocean,icon:"📊"},{label:"שולם",value:paid,color:C.palm,icon:"✅"},{label:"טרם שולם",value:unpaid,color:C.coral,icon:"⏳"},{label:"מס׳ הוצאות",value:expenses.length,color:C.sunset,icon:"🧾",noFmt:true}].map(item=>(
            <div key={item.label} style={{background:C.white,borderRadius:16,padding:"16px",boxShadow:"0 4px 14px rgba(0,0,0,0.06)",borderTop:`4px solid ${item.color}`,textAlign:"center"}}>
              <div style={{fontSize:22,marginBottom:6}}>{item.icon}</div>
              <div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:item.color}}>{item.noFmt?item.value:`₪${item.value.toFixed(0)}`}</div>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,marginTop:3}}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Pie */}
        {pieData.length>0&&<Card><h2 style={{fontFamily:F.d,fontSize:18,fontWeight:700,marginBottom:16,color:C.oceanDeep,textAlign:"center"}}>📊 גרף עוגה</h2><PieChart data={pieData}/></Card>}

        {/* Bars */}
        {byCat.length>0&&(
          <Card>
            <h2 style={{fontFamily:F.d,fontSize:18,fontWeight:700,marginBottom:16,color:C.oceanDeep}}>פירוט לפי קטגוריה</h2>
            {byCat.map(cat=>{
              const maxT=Math.max(...byCat.map(c=>c.total),1);
              return(
                <div key={cat.id} style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{fontWeight:700,fontSize:15,display:"flex",gap:6,alignItems:"center"}}><span>{cat.icon}</span><span>{cat.label}</span><span style={{fontSize:11,color:C.muted}}>({cat.count})</span></div>
                    <div style={{fontFamily:F.d,fontWeight:700,fontSize:16,color:cat.color}}>₪{cat.total.toFixed(0)}</div>
                  </div>
                  <div style={{height:9,background:C.sandDark,borderRadius:999,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${(cat.total/maxT)*100}%`,background:cat.color,borderRadius:999,transition:"width 0.5s"}}/>
                  </div>
                  <div style={{fontSize:11,color:C.muted,marginTop:3}}>{total>0?((cat.total/total)*100).toFixed(1):0}%</div>
                </div>
              );
            })}
          </Card>
        )}

        {/* Paid bar */}
        {expenses.length>0&&(
          <Card>
            <h2 style={{fontFamily:F.d,fontSize:18,fontWeight:700,marginBottom:12,color:C.oceanDeep}}>סטטוס תשלום</h2>
            <div style={{display:"flex",height:18,borderRadius:999,overflow:"hidden",marginBottom:10}}>
              <div style={{flex:paid,background:C.palm,transition:"flex 0.5s"}}/>
              <div style={{flex:unpaid,background:C.coral,transition:"flex 0.5s"}}/>
            </div>
            <div style={{display:"flex",gap:16}}>
              {[{color:C.palm,label:`שולם: ₪${paid.toFixed(0)}`},{color:C.coral,label:`טרם שולם: ₪${unpaid.toFixed(0)}`}].map(i=>(
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
            <h2 style={{fontFamily:F.d,fontSize:18,fontWeight:700,marginBottom:4,color:C.oceanDeep}}>💸 התחשבנות</h2>
            <p style={{fontSize:12,color:C.muted,marginBottom:14}}>מי חייב למי בסוף הטיול</p>
            {settlement.length===0?(
              <div style={{textAlign:"center",color:C.palm,padding:"16px 0",fontWeight:700,fontSize:14}}>✅ אין חובות! הכל מאוזן</div>
            ):settlement.map((d,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"12px",background:C.lightBg,borderRadius:12,marginBottom:8}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:d.from.color+"30",border:`2px solid ${d.from.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:d.from.color,flexShrink:0}}>
                  {d.from.name[0]}
                </div>
                <div style={{flex:1}}>
                  <span style={{fontWeight:700,color:d.from.color}}>{d.from.name}</span>
                  <span style={{color:C.muted,fontSize:13}}> חייב ל</span>
                  <span style={{fontWeight:700,color:d.to.color}}>{d.to.name}</span>
                </div>
                <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.coral}}>₪{d.amount.toFixed(0)}</div>
                <div style={{width:32,height:32,borderRadius:"50%",background:d.to.color+"30",border:`2px solid ${d.to.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:d.to.color,flexShrink:0}}>
                  {d.to.name[0]}
                </div>
              </div>
            ))}
          </Card>
        )}

        {expenses.length===0&&<div style={{textAlign:"center",color:C.muted,padding:"32px 0"}}><div style={{fontSize:40,marginBottom:10}}>🌺</div><div style={{fontSize:15}}>אין הוצאות עדיין</div></div>}
      </div>
    </div>
  );
}

// ─── SCREEN 4: CALENDAR ───────────────────────────────────────────────────────
function CalendarScreen({trip,expenses}){
  const dates=getRange(trip.startDate,trip.endDate);
  const[acts,setActs]=useState({});
  const[editD,setEditD]=useState(null);
  const[inp,setInp]=useState("");
  const{wx,loading:wLoad,error:wErr}=useWeather(trip.destination,trip.startDate,trip.endDate);

  const openEdit=d=>{setEditD(d);setInp((acts[d]||[]).join("\n"));};
  const saveEdit=()=>{setActs(a=>({...a,[editD]:inp.split("\n").map(l=>l.trim()).filter(Boolean)}));setEditD(null);};

  const flightsOn=d=>expenses.filter(e=>e.category==="flight"&&e.date===d&&e.departureTime);
  const hotelsOn =d=>expenses.filter(e=>e.category==="hotel"&&e.checkIn<=d&&e.checkOut>=d);
  const otherOn  =d=>expenses.filter(e=>!["flight","hotel"].includes(e.category)&&e.date===d);

  const wxMap={};
  if(wx?.daily){const{time,weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max}=wx.daily;time.forEach((t,i)=>{wxMap[t]={code:weathercode[i],max:temperature_2m_max[i],min:temperature_2m_min[i],rain:precipitation_probability_max[i]};});}

  return(
    <div>
      <WaveHeader title="📅 לוח שנה" subtitle={trip.destination?`${fmtDate(trip.startDate)} – ${fmtDate(trip.endDate)}`:""}/>

      {trip.destination&&(
        <div style={{margin:"12px 16px 0",padding:"9px 14px",background:C.white,borderRadius:12,fontSize:12,boxShadow:"0 2px 8px rgba(0,0,0,0.05)",color:C.muted}}>
          {wLoad&&"🌤️ טוען תחזית..."}{wErr&&<span style={{color:C.coral}}>☁️ {wErr}</span>}{wx&&!wLoad&&<span style={{color:C.palm,fontWeight:700}}>🌍 תחזית: {wx.name}, {wx.country}</span>}
        </div>
      )}

      {editD&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:C.white,borderRadius:20,padding:22,width:"100%",maxWidth:400,boxShadow:"0 12px 40px rgba(0,0,0,0.2)"}}>
            <h3 style={{fontFamily:F.d,fontSize:19,fontWeight:700,marginBottom:4,color:C.oceanDeep}}>פעילויות ל{fmtDate(editD)}</h3>
            <p style={{fontSize:12,color:C.muted,marginBottom:12}}>שורה נפרדת לכל פעילות</p>
            <textarea value={inp} onChange={e=>setInp(e.target.value)} rows={6} placeholder={"ביקור במקדש\nשוק לילה\nטיול בספינה"}
              style={{width:"100%",padding:"11px",borderRadius:12,border:`2px solid ${C.sandDark}`,fontFamily:F.b,fontSize:14,resize:"vertical",direction:"rtl",color:C.dark,background:C.lightBg,outline:"none"}}
              onFocus={e=>(e.target.style.borderColor=C.ocean)} onBlur={e=>(e.target.style.borderColor=C.sandDark)}/>
            <div style={{display:"flex",gap:9,marginTop:12}}>
              <button onClick={saveEdit} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.ocean},${C.oceanLight})`,color:C.white,fontFamily:F.b,fontWeight:800,fontSize:15,cursor:"pointer"}}>שמור ✓</button>
              <button onClick={()=>setEditD(null)} style={{flex:1,padding:"12px",borderRadius:12,border:`2px solid ${C.sandDark}`,background:C.white,fontFamily:F.b,fontWeight:700,fontSize:14,cursor:"pointer",color:C.muted}}>ביטול</button>
            </div>
          </div>
        </div>
      )}

      <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:14}}>
        {dates.length===0?(<div style={{textAlign:"center",color:C.muted,padding:"40px 0"}}><div style={{fontSize:44,marginBottom:14}}>🗓️</div>הגדר יעד ותאריכים</div>)
        :dates.map((date,idx)=>{
          const wday=new Date(date).toLocaleDateString("he-IL",{weekday:"long"});
          const dayNum=new Date(date).getDate();
          const month=new Date(date).toLocaleDateString("he-IL",{month:"long"});
          const dayActs=acts[date]||[];
          const flights=flightsOn(date);
          const hotels=hotelsOn(date);
          const others=otherOn(date);
          const wxd=wxMap[date];
          const hasContent=dayActs.length>0||flights.length>0||hotels.length>0||others.length>0;
          return(
            <div key={date} style={{background:C.white,borderRadius:18,overflow:"hidden",boxShadow:"0 4px 14px rgba(0,0,0,0.07)"}}>
              <div style={{background:`linear-gradient(135deg,${C.ocean},${C.oceanLight})`,padding:"13px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:42,height:42,borderRadius:12,background:"rgba(255,255,255,0.2)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                    <div style={{color:C.white,fontSize:17,fontWeight:900,fontFamily:F.d,lineHeight:1}}>{dayNum}</div>
                    <div style={{color:"rgba(255,255,255,0.7)",fontSize:9,fontWeight:600}}>{month}</div>
                  </div>
                  <div>
                    <div style={{color:C.white,fontWeight:800,fontSize:15}}>{wday}</div>
                    <div style={{color:"rgba(255,255,255,0.7)",fontSize:11}}>יום {idx+1} מתוך {dates.length}</div>
                  </div>
                </div>
                <button onClick={()=>openEdit(date)} style={{padding:"7px 12px",borderRadius:9,border:"2px solid rgba(255,255,255,0.4)",background:"rgba(255,255,255,0.13)",color:C.white,fontFamily:F.b,fontWeight:700,fontSize:12,cursor:"pointer"}}>✏️ פעילויות</button>
              </div>
              <div style={{padding:"12px 16px"}}>
                {wxd&&(
                  <div style={{marginBottom:10,padding:"9px 12px",background:`linear-gradient(135deg,${C.sky}30,${C.ocean}12)`,borderRadius:11,display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:20}}>{(WMO[wxd.code]||"🌡️").split(" ")[0]}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13,color:C.oceanDeep}}>{WMO[wxd.code]?.split(" ").slice(1).join(" ")||"—"}</div>
                      <div style={{fontSize:11,color:C.muted,marginTop:1}}>🌡️ {wxd.min?.toFixed(0)}°–{wxd.max?.toFixed(0)}°C{wxd.rain>0?` · 💧${wxd.rain}%`:""}</div>
                    </div>
                  </div>
                )}
                {flights.map(f=>{const rem=remTime(f.departureTime);return(
                  <div key={f.id} style={{marginBottom:9,padding:"10px 12px",background:`${C.ocean}0D`,borderRadius:11,borderRight:`3px solid ${C.ocean}`}}>
                    <div style={{fontWeight:700,fontSize:14,color:C.oceanDeep}}>✈️ טיסה — המראה {f.departureTime}</div>
                    {rem&&<div style={{fontSize:12,color:C.coral,fontWeight:700,marginTop:4}}>🔔 הגעה לשדה עד {rem}</div>}
                    {f.description&&<div style={{fontSize:12,color:C.muted,marginTop:3}}>{f.description}</div>}
                  </div>
                );})}
                {hotels.map(h=>{const isIn=h.checkIn===date,isOut=h.checkOut===date;return(
                  <div key={h.id} style={{marginBottom:9,padding:"10px 12px",background:`${C.oceanLight}12`,borderRadius:11,borderRight:`3px solid ${C.oceanLight}`}}>
                    <div style={{fontWeight:700,fontSize:14,color:C.oceanDeep,display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                      <span>🏨 {h.description||"מלון"}</span>
                      {isIn&&<span style={{fontSize:11,background:C.palm,color:C.white,borderRadius:6,padding:"2px 7px"}}>צ׳ק אין</span>}
                      {isOut&&<span style={{fontSize:11,background:C.coral,color:C.white,borderRadius:6,padding:"2px 7px"}}>צ׳ק אאוט</span>}
                    </div>
                    <div style={{fontSize:11,color:C.muted,marginTop:3}}>{fmtDate(h.checkIn)} → {fmtDate(h.checkOut)}</div>
                  </div>
                );})}
                {others.map(e=>{
                  const cat=CATS.find(c=>c.id===e.category);
                  return(
                    <div key={e.id} style={{marginBottom:9,padding:"10px 12px",background:`${cat?.color}12`,borderRadius:11,borderRight:`3px solid ${cat?.color}`}}>
                      <div style={{fontWeight:700,fontSize:14,color:C.dark}}>{cat?.icon} {cat?.label}{e.description?` – ${e.description}`:""}</div>
                      <div style={{fontSize:11,color:C.muted,marginTop:3,display:"flex",gap:10}}>
                        <span>₪{e.amountILS.toFixed(0)}</span>
                        <span style={{color:e.paid?C.palm:C.coral,fontWeight:700}}>{e.paid?"✅ שולם":"⏳ טרם שולם"}</span>
                      </div>
                    </div>
                  );
                })}
                {dayActs.length>0?(
                  <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:7}}>
                    {dayActs.map((act,i)=>(
                      <li key={i} style={{display:"flex",alignItems:"flex-start",gap:9,padding:"9px 12px",background:C.lightBg,borderRadius:10}}>
                        <span style={{fontSize:16,marginTop:1}}>🌺</span>
                        <span style={{fontSize:14,fontWeight:600,color:C.dark}}>{act}</span>
                      </li>
                    ))}
                  </ul>
                ):!hasContent&&(<div style={{textAlign:"center",color:C.muted,padding:"12px 0",fontSize:13}}>לחץ ✏️ להוספת פעילויות 🌴</div>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const newTrip=()=>({id:uid(),destination:"",startDate:"",endDate:"",defaultCurrency:"ILS",currencies:["ILS","USD","EUR"],people:[],expenses:[],activities:{}});

interface TripPlanProps {
  trips: any[];
  onSaveTrip: (trip: any) => Promise<void>;
  onDeleteTrip: (id: string) => Promise<void>;
  onLogout: () => Promise<void>;
  userEmail: string;
}

export default function TripPlan({trips:initialTrips,onSaveTrip,onDeleteTrip,onLogout,userEmail}:TripPlanProps){
  const[trips,setTrips]=useState<any[]>(initialTrips);
  const[activeId,setActiveId]=useState<string|null>(null);
  const[screen,setScreen]=useState("destination");
  const{rates,allCodes,info,toILS}=useRates();

  // sync incoming trips from Firestore
  useEffect(()=>{
    setTrips(initialTrips);
  },[initialTrips]);

  const active=trips.find((t:any)=>t.id===activeId);
  const expenses=active?.expenses||[];

  const updTrip=useCallback((patch:any)=>{
    setTrips((ts:any[])=>ts.map(t=>t.id===activeId?{...t,...patch}:t));
    const updated=trips.find((t:any)=>t.id===activeId);
    if(updated) onSaveTrip({...updated,...patch});
  },[activeId,trips,onSaveTrip]);

  const addExp=useCallback((e:any)=>{
    setTrips((ts:any[])=>ts.map(t=>{
      if(t.id!==activeId)return t;
      const updated={...t,expenses:[...t.expenses,e]};
      onSaveTrip(updated);
      return updated;
    }));
  },[activeId,onSaveTrip]);

  const togglePay=useCallback((id:string)=>{
    setTrips((ts:any[])=>ts.map(t=>{
      if(t.id!==activeId)return t;
      const updated={...t,expenses:t.expenses.map((e:any)=>e.id===id?{...e,paid:!e.paid}:e)};
      onSaveTrip(updated);
      return updated;
    }));
  },[activeId,onSaveTrip]);

  const delExp=useCallback((id:string)=>{
    setTrips((ts:any[])=>ts.map(t=>{
      if(t.id!==activeId)return t;
      const updated={...t,expenses:t.expenses.filter((e:any)=>e.id!==id)};
      onSaveTrip(updated);
      return updated;
    }));
  },[activeId,onSaveTrip]);

  const handleCreate=()=>{
    const t=newTrip();
    setTrips((ts:any[])=>[...ts,t]);
    onSaveTrip(t);
    setActiveId(t.id);
    setScreen("destination");
  };

  const handleSelect=(id:string)=>{setActiveId(id);setScreen("destination");};
  const handleBack=()=>{setActiveId(null);setScreen("destination");};
  const handleDelete=(id:string)=>{setTrips((ts:any[])=>ts.filter(t=>t.id!==id));onDeleteTrip(id);};

  const screens=["destination","expenses","budget","calendar"];

  if(!activeId){
    return(
      <>
        <style>{GS}</style>
        <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",fontFamily:F.b}}>
          {/* user bar */}
          <div style={{background:C.oceanDeep,padding:"8px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{color:"rgba(255,255,255,0.7)",fontSize:12}}>👤 {userEmail}</span>
            <button onClick={onLogout} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,color:C.white,fontFamily:F.b,fontWeight:700,fontSize:12,padding:"4px 10px",cursor:"pointer"}}>התנתק</button>
          </div>
          <TripSelectorScreen trips={trips} onSelect={handleSelect} onCreate={handleCreate} onDelete={handleDelete}/>
        </div>
      </>
    );
  }

  return(
    <>
      <style>{GS}</style>
      <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",display:"flex",flexDirection:"column",background:C.lightBg,fontFamily:F.b}}>
        <div style={{background:C.oceanDeep,padding:"9px 16px",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={handleBack} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,color:C.white,fontFamily:F.b,fontWeight:700,fontSize:13,padding:"5px 10px",cursor:"pointer"}}>← טיולים</button>
          <span style={{fontFamily:F.d,color:C.white,fontSize:16,fontWeight:700,flex:1,textAlign:"center"}}>🌺 TripPlan</span>
          {active?.destination&&<span style={{fontSize:12,color:"rgba(255,255,255,0.6)",fontWeight:600}}>{active.destination}</span>}
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          {screen==="destination"&&<DestinationScreen trip={active} onUpdate={updTrip} onNext={()=>setScreen("expenses")} allCodes={allCodes} rates={rates}/>}
          {screen==="expenses"   &&<ExpensesScreen trip={active} expenses={expenses} onAdd={addExp} onTogglePaid={togglePay} onDelete={delExp} toILS={toILS} rates={rates} ratesInfo={info}/>}
          {screen==="budget"     &&<BudgetScreen trip={active} expenses={expenses}/>}
          {screen==="calendar"   &&<CalendarScreen trip={active} expenses={expenses}/>}
        </div>
        <NavBar screens={screens} current={screen} onNav={setScreen}/>
      </div>
    </>
  );
}
