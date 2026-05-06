"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const C = {
  // backgrounds
  bg:"#0d2137", bgCard:"rgba(255,255,255,0.06)", bgCardHover:"rgba(255,255,255,0.09)",
  bgInput:"rgba(255,255,255,0.07)", bgNav:"rgba(0,0,0,0.3)", bgSection:"rgba(100,223,223,0.07)",
  // accent
  teal:"#64dfdf", tealDim:"rgba(100,223,223,0.15)", tealBorder:"rgba(100,223,223,0.25)",
  tealDeep:"#48b5c4",
  // text
  white:"#ffffff", textPrimary:"#ffffff", textSecondary:"rgba(255,255,255,0.55)",
  textMuted:"rgba(255,255,255,0.3)", textHint:"rgba(255,255,255,0.18)",
  // status
  green:"#4ade80", greenDim:"rgba(74,222,128,0.12)",
  red:"#ff6b6b", redDim:"rgba(255,107,107,0.12)",
  amber:"#fbbf24", amberDim:"rgba(251,191,36,0.12)",
  // borders
  border:"rgba(255,255,255,0.08)", borderAccent:"rgba(100,223,223,0.2)",
  // legacy aliases (keep backward compat)
  ocean:"#64dfdf", oceanLight:"#48b5c4", oceanDeep:"#0a3050",
  coral:"#ff6b6b", palm:"#4ade80", palmLight:"#6ee7a0",
  sunset:"#fbbf24", dark:"#0d2137", darkMid:"#0a3050",
  muted:"rgba(255,255,255,0.35)", lightBg:"#0d2137", sandDark:"rgba(255,255,255,0.08)",
  sky:"#64dfdf", purple:"#a78bfa",
};
const F={d:"'Rubik',sans-serif",b:"'Rubik',sans-serif"};
const CATS=[
  {id:"flight",label:"טיסה",icon:"✈️",color:"#64dfdf"},
  {id:"hotel",label:"מלון",icon:"🏨",color:"#48b5c4"},
  {id:"attraction",label:"אטרקציות",icon:"🎡",color:"#ff6b6b"},
  {id:"food",label:"אוכל",icon:"🍜",color:"#fbbf24"},
  {id:"taxi",label:"מונית",icon:"🚕",color:"#4ade80"},
  {id:"other",label:"אחר",icon:"📦",color:"rgba(255,255,255,0.35)"},
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
const WMO={0:"☀️ בהיר",1:"🌤️ בהיר חלקית",2:"⛅ מעונן חלקית",3:"☁️ מעונן",45:"🌫️ ערפל",48:"🌫️ ערפל",51:"🌦️ טפטוף קל",53:"🌦️ טפטוף",55:"🌧️ טפטוף כבד",61:"🌧️ גשם קל",63:"🌧️ גשם",65:"🌧️ גשם כבד",80:"🌦️ ממטרים",81:"🌧️ ממטרים",82:"⛈️ ממטרים כבדים",95:"⛈️ סערה",96:"⛈️ סערה+ברד",99:"⛈️ סערה חזקה"};
const PERSON_COLORS=[C.ocean,C.coral,C.palm,C.sunset,C.purple,C.oceanLight,"#C0392B","#8E44AD"];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmtDate=(d)=>d?new Date(d).toLocaleDateString("he-IL",{day:"2-digit",month:"2-digit",year:"numeric"}):"";
const getRange=(s,e)=>{const a=[];if(!s||!e)return a;const c=new Date(s),l=new Date(e);while(c<=l){a.push(c.toISOString().slice(0,10));c.setDate(c.getDate()+1);}return a;};
const uid=()=>Math.random().toString(36).slice(2)+Date.now().toString(36);
const remTime=(t)=>{if(!t)return null;const[h,m]=t.split(":").map(Number),tot=h*60+m-180;if(tot<0)return null;return`${String(Math.floor(tot/60)).padStart(2,"0")}:${String(tot%60).padStart(2,"0")}`;};

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
    const diff=Math.round((new Date(startDate).getTime()-today.getTime())/86400000);
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
  @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Rubik',sans-serif;background:#0d2137;color:#ffffff;direction:rtl}
  ::-webkit-scrollbar{width:5px}
  ::-webkit-scrollbar-track{background:rgba(255,255,255,0.04)}
  ::-webkit-scrollbar-thumb{background:rgba(100,223,223,0.3);border-radius:4px}
  input,select,textarea,button{font-family:'Rubik',sans-serif}
`;

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function WaveHeader({title,subtitle,action}){
  return(
    <div style={{background:"linear-gradient(160deg,#0d2137 0%,#0a3050 100%)",padding:"22px 20px 18px",borderBottom:"0.5px solid rgba(100,223,223,0.12)"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div>
          <h1 style={{fontFamily:"'Rubik',sans-serif",color:"#ffffff",fontSize:24,fontWeight:800,letterSpacing:"-0.3px",lineHeight:1}}>{title}</h1>
          {subtitle&&<p style={{color:"rgba(255,255,255,0.4)",marginTop:5,fontSize:12,fontWeight:400,letterSpacing:"0.2px"}}>{subtitle}</p>}
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
          <div style={{width:32,height:32,borderRadius:10,background:current===s?"rgba(100,223,223,0.12)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,transition:"all 0.2s"}}>{icons[i]}</div>
          <span style={{fontSize:10,fontWeight:600,color:current===s?"#64dfdf":"rgba(255,255,255,0.25)",fontFamily:"'Rubik',sans-serif",letterSpacing:"0.3px"}}>{labels[i]}</span>
        </button>
      ))}
    </div>
  );
}

const Card=({children,style})=><div style={{background:"rgba(255,255,255,0.05)",border:"0.5px solid rgba(100,223,223,0.18)",borderRadius:16,padding:"16px",...style}}>{children}</div>;
const FL=({children})=><label style={{display:"block",fontWeight:500,fontSize:12,marginBottom:6,color:"rgba(255,255,255,0.4)",letterSpacing:"0.5px",textTransform:"uppercase"}}>{children}</label>;

function SI({label,value,onChange,type="text",placeholder,min,max,style}){
  return(
    <div style={{marginBottom:14,...style}}>
      {label&&<FL>{label}</FL>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} min={min} max={max}
        style={{width:"100%",padding:"11px 14px",borderRadius:12,border:`2px solid ${C.sandDark}`,fontFamily:"'Rubik',sans-serif",fontSize:15,color:"#ffffff",background:"rgba(255,255,255,0.04)",outline:"none",direction:"rtl",transition:"border 0.2s"}}
        onFocus={e=>(e.target.style.borderColor=C.ocean)} onBlur={e=>(e.target.style.borderColor=C.sandDark)}/>
    </div>
  );
}

function SS({label,value,onChange,children,style}){
  return(
    <div style={{marginBottom:14,...style}}>
      {label&&<FL>{label}</FL>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",padding:"11px 12px",borderRadius:12,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:"'Rubik',sans-serif",fontSize:14,background:"rgba(255,255,255,0.07)",color:"#ffffff",direction:"rtl",outline:"none"}}>
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
    <button onClick={onClick} disabled={disabled} style={{padding:small?"8px 14px":"13px 20px",borderRadius:12,border,background:disabled?C.sandDark:bg,color:disabled?C.muted:col,fontFamily:"'Rubik',sans-serif",fontWeight:700,fontSize:small?13:15,cursor:disabled?"default":"pointer",transition:"all 0.2s",opacity:disabled?0.6:1,...style}}>
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
        <text x={cx} y={cy-8} textAnchor="middle" fontFamily="Rubik,sans-serif" fontSize={11} fill="#ffffff" fontWeight={700}>{hov!==null?slices[hov].label:'סה"כ'}</text>
        <text x={cx} y={cy+10} textAnchor="middle" fontFamily="Rubik,sans-serif" fontSize={13} fill="#64dfdf" fontWeight={900}>{hov!==null?`₪${slices[hov].value.toFixed(0)}`:`₪${total.toFixed(0)}`}</text>
        {hov!==null&&<text x={cx} y={cy+26} textAnchor="middle" fontFamily="Rubik,sans-serif" fontSize={9} fill="rgba(255,255,255,0.4)">{((slices[hov].value/total)*100).toFixed(1)}%</text>}
      </svg>
      <div style={{display:"flex",flexWrap:"wrap",gap:"6px 12px",justifyContent:"center",maxWidth:260}}>
        {slices.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",opacity:hov!==null&&hov!==i?0.4:1,transition:"opacity 0.15s"}}
            onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}>
            <div style={{width:11,height:11,borderRadius:3,background:s.color,flexShrink:0}}/>
            <span style={{fontSize:12,fontWeight:700}}>{s.icon} {s.label}</span>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>{((s.value/total)*100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TRIP SELECTOR SCREEN ─────────────────────────────────────────────────────
function TripSelectorScreen({trips,onSelect,onCreate,onDelete}){
  return(
    <div style={{minHeight:"100vh",background:"#0d2137"}}>
      <div style={{background:"linear-gradient(160deg,#091928 0%,#0d2137 100%)",padding:"36px 20px 28px",borderBottom:"0.5px solid rgba(100,223,223,0.1)"}}>
        <div style={{fontSize:10,fontWeight:400,color:"rgba(255,255,255,0.2)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:8}}>ברוך הבא</div>
        <h1 style={{fontFamily:"'Rubik',sans-serif",color:"#ffffff",fontSize:38,fontWeight:900,letterSpacing:"-1px",lineHeight:1}}>טיולון</h1>
        <p style={{fontFamily:"'Rubik',sans-serif",color:"rgba(255,255,255,0.3)",marginTop:6,fontSize:12,fontWeight:300,letterSpacing:"0.5px"}}>מתכנן הטיולים שלי</p>
      </div>

      <div style={{padding:"20px 18px",display:"flex",flexDirection:"column",gap:10}}>
        <button onClick={onCreate} style={{padding:"16px",borderRadius:14,border:"0.5px dashed rgba(100,223,223,0.35)",background:"rgba(100,223,223,0.06)",color:"#64dfdf",fontSize:15,fontWeight:600,fontFamily:"'Rubik',sans-serif",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          ➕ טיול חדש
        </button>

        {trips.length===0&&(
          <div style={{textAlign:"center",padding:"40px 0",color:"rgba(255,255,255,0.35)"}}>
            <div style={{fontSize:48,marginBottom:12}}>✈️</div>
            <div style={{fontSize:16,fontWeight:600}}>אין טיולים עדיין</div>
            <div style={{fontSize:13,marginTop:6}}>לחץ על "טיול חדש" כדי להתחיל</div>
          </div>
        )}

        {trips.map(t=>{
          const nights=t.startDate&&t.endDate?Math.round((new Date(t.endDate).getTime()-new Date(t.startDate).getTime())/86400000)+1:0;
          const total=t.expenses?.reduce((s,e)=>s+e.amountILS,0)||0;
          return(
            <div key={t.id} onClick={()=>onSelect(t.id)} style={{background:"rgba(255,255,255,0.05)",border:"0.5px solid rgba(100,223,223,0.18)",borderRadius:16,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.borderColor="rgba(100,223,223,0.35)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.borderColor="rgba(100,223,223,0.18)";}}>
              <div style={{width:44,height:44,borderRadius:13,background:"rgba(100,223,223,0.1)",border:"0.5px solid rgba(100,223,223,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🌍</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Rubik',sans-serif",fontSize:16,fontWeight:700,color:"#ffffff",letterSpacing:"-0.2px"}}>{t.destination||"יעד לא מוגדר"}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:3,fontWeight:400}}>
                  {t.startDate?`${fmtDate(t.startDate)} – ${fmtDate(t.endDate)}`:"תאריכים לא מוגדרים"}
                  {nights>0&&` · ${nights} ימים`}
                </div>
                {total>0&&<div style={{fontSize:12,color:"#64dfdf",fontWeight:600,marginTop:4}}>₪{total.toFixed(0)}</div>}
              </div>
              <button onClick={ev=>{ev.stopPropagation();if(window.confirm("למחוק את הטיול?"))onDelete(t.id);}} style={{padding:"6px 9px",borderRadius:8,border:"none",background:"rgba(255,107,107,0.12)",color:"#ff6b6b",fontSize:14,cursor:"pointer"}}>🗑️</button>
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
      <h2 style={{fontFamily:"'Rubik',sans-serif",fontSize:20,fontWeight:700,marginBottom:4,color:"#0a3050"}}>💱 מטבעות בטיול</h2>
      <p style={{fontSize:12,color:"rgba(255,255,255,0.35)",marginBottom:12}}>בחר את המטבעות שתשתמש בהם. לחץ על מטבע להגדרתו כברירת מחדל.</p>

      {/* Active currencies */}
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>
        {tripCurrencies.map(code=>{
          const isDefault=trip.defaultCurrency===code;
          const rate=rates[code];
          return(
            <div key={code} onClick={()=>onUpdate({defaultCurrency:code})}
              style={{display:"flex",alignItems:"center",gap:7,padding:"9px 13px",borderRadius:14,border:`2px solid ${isDefault?C.ocean:C.sandDark}`,background:isDefault?`${C.ocean}15`:C.white,cursor:"pointer",transition:"all 0.15s"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Rubik',sans-serif",fontSize:18,fontWeight:900,color:isDefault?C.ocean:C.dark,lineHeight:1}}>{getCurrSymbol(code)}</div>
                <div style={{fontSize:11,fontWeight:700,color:isDefault?C.ocean:C.darkMid}}>{code}</div>
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:isDefault?C.ocean:C.dark}}>{getCurrLabel(code)}</div>
                {rate&&code!=="ILS"&&<div style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>1 {code} = ₪{rate.toFixed(3)}</div>}
                {isDefault&&<div style={{fontSize:10,color:"#64dfdf",fontWeight:700}}>★ ברירת מחדל</div>}
              </div>
              {tripCurrencies.length>1&&(
                <button onClick={e=>{e.stopPropagation();removeCurrency(code);}}
                  style={{background:"none",border:"none",cursor:"pointer",fontSize:15,color:"rgba(255,255,255,0.35)",padding:"0 0 0 4px",lineHeight:1}}>×</button>
              )}
            </div>
          );
        })}
        <button onClick={()=>setShowPicker(p=>!p)}
          style={{padding:"9px 14px",borderRadius:14,border:`2px dashed ${C.ocean}`,background:`${C.ocean}08`,color:"#64dfdf",fontFamily:"'Rubik',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer"}}>
          ➕ הוסף מטבע
        </button>
      </div>

      {/* Currency picker */}
      {showPicker&&(
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:"12px",border:"0.5px solid rgba(100,223,223,0.15)"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="חפש מטבע... (למשל: THB, יאן, דולר)"
            style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`2px solid ${C.sandDark}`,fontFamily:"'Rubik',sans-serif",fontSize:14,direction:"rtl",background:"rgba(255,255,255,0.05)",outline:"none",marginBottom:10}}
            onFocus={e=>(e.target.style.borderColor=C.ocean)} onBlur={e=>(e.target.style.borderColor=C.sandDark)} autoFocus/>
          {allCodes.length===0&&(
            <div style={{textAlign:"center",color:"rgba(255,255,255,0.35)",fontSize:13,padding:"8px 0"}}>
              ⏳ שאיבת מטבעות... (נדרש חיבור לאינטרנט)
            </div>
          )}
          {/* Popular first if no search */}
          {!search&&(
            <div style={{marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.35)",marginBottom:6}}>פופולריים:</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {["THB","GBP","JPY","AED","TRY","AUD","CAD","CHF","SGD","INR","EGP","MAD","JOD"]
                  .filter(c=>!tripCurrencies.includes(c))
                  .slice(0,10)
                  .map(code=>(
                    <button key={code} onClick={()=>addCurrency(code)}
                      style={{padding:"5px 11px",borderRadius:999,border:`1.5px solid ${C.sandDark}`,background:"rgba(255,255,255,0.05)",fontFamily:"'Rubik',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer",color:"#ffffff"}}>
                      {getCurrSymbol(code)} {code} <span style={{color:"rgba(255,255,255,0.35)",fontWeight:400}}>{getCurrLabel(code)}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
          {/* Search results */}
          {search&&(
            <div style={{maxHeight:180,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
              {filtered.length===0?<div style={{color:"rgba(255,255,255,0.35)",fontSize:13,textAlign:"center",padding:"8px"}}>לא נמצאו תוצאות</div>
              :filtered.map(code=>(
                <button key={code} onClick={()=>addCurrency(code)}
                  style={{padding:"8px 12px",borderRadius:10,border:"none",background:"rgba(255,255,255,0.05)",fontFamily:"'Rubik',sans-serif",fontSize:13,cursor:"pointer",textAlign:"right",display:"flex",alignItems:"center",gap:10,transition:"background 0.1s"}}
                  onMouseEnter={e=>(e.target.style.background=C.sandDark)} onMouseLeave={e=>(e.target.style.background=C.white)}>
                  <span style={{fontWeight:800,color:"#64dfdf",minWidth:36}}>{getCurrSymbol(code)}</span>
                  <span style={{fontWeight:700}}>{code}</span>
                  <span style={{color:"rgba(255,255,255,0.35)",fontSize:12}}>{getCurrLabel(code)}</span>
                  {rates[code]&&code!=="ILS"&&<span style={{color:"rgba(255,255,255,0.35)",fontSize:11,marginRight:"auto"}}>₪{rates[code].toFixed(3)}</span>}
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
          <h2 style={{fontFamily:"'Rubik',sans-serif",fontSize:20,fontWeight:700,marginBottom:16,color:"#0a3050"}}>פרטי היעד</h2>
          <SI label="יעד הטיול 🌍" value={trip.destination} onChange={v=>onUpdate({destination:v})} placeholder="למשל: תאילנד, פריז..."/>
          <SI label="תאריך יציאה ✈️" value={trip.startDate} onChange={v=>onUpdate({startDate:v})} type="date"/>
          <SI label="תאריך חזרה 🏠"  value={trip.endDate}   onChange={v=>onUpdate({endDate:v})}   type="date" min={trip.startDate}/>
          {valid&&(
            <div style={{padding:"12px 16px",background:"rgba(100,223,223,0.08)",border:"0.5px solid rgba(100,223,223,0.2)",borderRadius:12,textAlign:"center"}}>
              <span style={{fontFamily:"'Rubik',sans-serif",fontSize:26,fontWeight:800,color:"#64dfdf"}}>{Math.round((new Date(trip.endDate).getTime()-new Date(trip.startDate).getTime())/86400000)+1}</span>
              <span style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,0.7)",marginRight:6}}>ימי טיול 🎉</span>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.35)",marginTop:2}}>{fmtDate(trip.startDate)} – {fmtDate(trip.endDate)}</div>
            </div>
          )}
        </Card>

        <CurrencyManager trip={trip} onUpdate={onUpdate} allCodes={allCodes} rates={rates}/>

        {/* People */}
        <Card>
          <h2 style={{fontFamily:"'Rubik',sans-serif",fontSize:20,fontWeight:700,marginBottom:4,color:"#0a3050"}}>👥 משתתפים</h2>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.35)",marginBottom:14}}>הוסף את כל האנשים/משפחות בטיול לניהול הוצאות משותפות</p>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="שם משתתף..." onKeyDown={e=>e.key==="Enter"&&addPerson()}
              style={{flex:1,padding:"10px 14px",borderRadius:12,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:"'Rubik',sans-serif",fontSize:14,direction:"rtl",background:"rgba(255,255,255,0.07)",color:"#ffffff",outline:"none"}}
              onFocus={e=>(e.target.style.borderColor=C.ocean)} onBlur={e=>(e.target.style.borderColor=C.sandDark)}/>
            <button onClick={addPerson} style={{padding:"10px 16px",borderRadius:12,border:"none",background:"#64dfdf",color:"#0d2137",fontFamily:"'Rubik',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer"}}>➕</button>
          </div>
          {people.length===0?(
            <div style={{textAlign:"center",color:"rgba(255,255,255,0.35)",padding:"12px 0",fontSize:13}}>טיול סולו? ניתן להשאיר ריק 🌴</div>
          ):(
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {people.map(p=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:999,background:p.color+"15",border:`0.5px solid ${p.color}40`}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:p.color,flexShrink:0}}/>
                  <span style={{fontSize:13,fontWeight:700,color:"#ffffff"}}>{p.name}</span>
                  <button onClick={()=>removePerson(p.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,color:"rgba(255,255,255,0.35)",padding:"0 0 0 2px",lineHeight:1}}>×</button>
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
      <div style={{background:"rgba(255,255,255,0.05)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"13px",borderRight:`3px solid ${cat?.color||"rgba(255,255,255,0.2)"}`,display:"flex",alignItems:"flex-start",gap:10}}>
        <span style={{fontSize:24,flexShrink:0,marginTop:2}}>{cat?.icon}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:600,fontSize:13,color:"#ffffff"}}>{cat?.label}</div>
          {exp.category==="hotel"&&exp.checkIn&&<div style={{fontSize:11,color:"#64dfdf",fontWeight:600}}>{fmtDate(exp.checkIn)} → {fmtDate(exp.checkOut)} · {Math.round((new Date(exp.checkOut).getTime()-new Date(exp.checkIn).getTime())/86400000)} לילות</div>}
          {exp.category==="flight"&&exp.departureTime&&<div style={{fontSize:11,color:"#64dfdf",fontWeight:600}}>המראה: {exp.departureTime}</div>}
          {exp.description&&<div style={{fontSize:12,color:"rgba(255,255,255,0.35)",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{exp.description}</div>}
          <div style={{fontSize:12,color:"rgba(255,255,255,0.35)",marginTop:2}}>{sym(exp.currency)}{exp.amount.toFixed(2)} ≈ <span style={{color:"#64dfdf",fontWeight:600}}>₪{exp.amountILS.toFixed(2)}</span></div>
          {exp.paidBy&&<div style={{marginTop:4,display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
            <span style={{fontSize:11,background:personColor(exp.paidBy)+"25",color:personColor(exp.paidBy),borderRadius:6,padding:"2px 7px",fontWeight:700}}>שילם: {personName(exp.paidBy)}</span>
            {exp.splitWith?.length>0&&exp.splitWith.map(id=>(
              <span key={id} style={{fontSize:11,background:personColor(id)+"20",color:personColor(id),borderRadius:6,padding:"2px 7px",fontWeight:600}}>{personName(id)}</span>
            ))}
          </div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flexShrink:0}}>
          <button onClick={()=>onTogglePaid(exp.id)} style={{padding:"5px 9px",borderRadius:8,border:"none",background:exp.paid?"rgba(74,222,128,0.12)":"rgba(255,107,107,0.12)",color:exp.paid?"#4ade80":"#ff6b6b",fontFamily:"'Rubik',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer"}}>{exp.paid?"✅":"⏳"}</button>
          <button onClick={()=>onDelete(exp.id)} style={{padding:"5px 7px",borderRadius:8,border:"none",background:"rgba(255,107,107,0.1)",color:"#ff6b6b",fontFamily:"'Rubik',sans-serif",fontWeight:600,fontSize:11,cursor:"pointer"}}>🗑️</button>
        </div>
      </div>
    );
  };

  return(
    <div>
      <WaveHeader title="💳 הוצאות" subtitle={trip.destination?`הטיול ל${trip.destination}`:""}/>

      <div style={{margin:"14px 16px 0",padding:"9px 14px",background:"rgba(255,255,255,0.05)",borderRadius:12,fontSize:12,color:"rgba(255,255,255,0.35)",display:"flex",gap:10,flexWrap:"wrap",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
        <span>💱 {(trip.currencies||[]).filter(c=>c!=="ILS").map(code=>`1 ${code} = ₪${(rates[code]||0).toFixed(3)}`).join(" | ")}</span>
        {ratesInfo.updated&&<span style={{color:"#4ade80"}}>✓ {ratesInfo.updated}</span>}
        {ratesInfo.error&&<span style={{color:"#ff6b6b"}}>{ratesInfo.error}</span>}
      </div>

      {/* Search bar */}
      <div style={{padding:"12px 16px 0",display:"flex",gap:8}}>
        <div style={{flex:1,position:"relative"}}>
          <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none"}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="חיפוש הוצאות..."
            style={{width:"100%",padding:"10px 36px 10px 12px",borderRadius:12,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:"'Rubik',sans-serif",fontSize:14,direction:"rtl",background:"rgba(255,255,255,0.07)",color:"#ffffff",outline:"none"}}
            onFocus={e=>(e.target.style.borderColor=C.ocean)} onBlur={e=>(e.target.style.borderColor=C.sandDark)}/>
        </div>
        <button onClick={()=>setShowFilters(f=>!f)} style={{padding:"10px 14px",borderRadius:12,border:`0.5px solid ${showFilters||filterCat!=="all"||filterPaid!=="all"?"#64dfdf":"rgba(255,255,255,0.15)"}`,background:showFilters||filterCat!=="all"||filterPaid!=="all"?"rgba(100,223,223,0.12)":"rgba(255,255,255,0.06)",color:showFilters||filterCat!=="all"||filterPaid!=="all"?"#64dfdf":"rgba(255,255,255,0.35)",fontFamily:"'Rubik',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer"}}>
          🎛️ סינון
        </button>
      </div>

      {showFilters&&(
        <div style={{margin:"8px 16px 0",padding:"12px",background:"rgba(255,255,255,0.05)",border:"0.5px solid rgba(100,223,223,0.18)",borderRadius:14}}>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.6)",marginBottom:6}}>קטגוריה</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[{id:"all",label:"הכל",icon:"📋"},...CATS].map(c=>(
                <button key={c.id} onClick={()=>setFilterCat(c.id)} style={{padding:"5px 10px",borderRadius:999,border:`0.5px solid ${filterCat===c.id?"#64dfdf":"rgba(255,255,255,0.12)"}`,background:filterCat===c.id?"rgba(100,223,223,0.15)":"rgba(255,255,255,0.05)",color:filterCat===c.id?"#64dfdf":"rgba(255,255,255,0.5)",fontFamily:"'Rubik',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.6)",marginBottom:6}}>סטטוס תשלום</div>
            <div style={{display:"flex",gap:6}}>
              {[{id:"all",label:"הכל"},{id:"paid",label:"✅ שולם"},{id:"unpaid",label:"⏳ טרם שולם"}].map(o=>(
                <button key={o.id} onClick={()=>setFilterPaid(o.id)} style={{padding:"5px 12px",borderRadius:999,border:`0.5px solid ${filterPaid===o.id?"#64dfdf":"rgba(255,255,255,0.12)"}`,background:filterPaid===o.id?"rgba(100,223,223,0.15)":"rgba(255,255,255,0.05)",color:filterPaid===o.id?"#64dfdf":"rgba(255,255,255,0.5)",fontFamily:"'Rubik',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>
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
          <div style={{fontSize:13,color:"rgba(255,255,255,0.35)",fontWeight:600}}>נמצאו {allFiltered.length} הוצאות</div>
          {allFiltered.length===0?<div style={{textAlign:"center",color:"rgba(255,255,255,0.35)",padding:"24px 0",fontSize:15}}>🔍 לא נמצאו תוצאות</div>
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
                  <button key={d} onClick={()=>setSel(d)} style={{minWidth:60,padding:"9px 7px",borderRadius:13,border:`0.5px solid ${sel===d?"#64dfdf":"rgba(255,255,255,0.1)"}`,background:sel===d?"rgba(100,223,223,0.15)":"rgba(255,255,255,0.04)",color:sel===d?"#ffffff":"rgba(255,255,255,0.4)",fontFamily:"'Rubik',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer",textAlign:"center",flexShrink:0,position:"relative"}}>
                    <div style={{fontSize:10,opacity:0.8}}>{new Date(d).toLocaleDateString("he-IL",{weekday:"short"})}</div>
                    <div style={{fontSize:15}}>{new Date(d).getDate()}</div>
                    {cnt>0&&<div style={{position:"absolute",top:-4,right:-4,width:15,height:15,borderRadius:"50%",background:C.coral,color:"#ffffff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{cnt}</div>}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:12}}>
            <button onClick={()=>{set({date:sel,checkIn:sel});setShow(true);}} style={{padding:"14px",borderRadius:14,border:"0.5px dashed rgba(100,223,223,0.35)",background:"rgba(100,223,223,0.06)",color:"#64dfdf",fontSize:14,fontWeight:600,fontFamily:"'Rubik',sans-serif",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              ➕ הוסף הוצאה ל{fmtDate(sel)}
            </button>

            {show&&(
              <Card>
                <h3 style={{fontFamily:"'Rubik',sans-serif",fontSize:17,fontWeight:700,marginBottom:14,color:"#0a3050"}}>הוצאה חדשה</h3>

                {/* category */}
                <div style={{marginBottom:14}}>
                  <FL>קטגוריה</FL>
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                    {CATS.map(cat=>(
                      <button key={cat.id} onClick={()=>set({category:cat.id})} style={{padding:"7px 11px",borderRadius:999,border:`0.5px solid ${form.category===cat.id?cat.color:'rgba(255,255,255,0.15)'}`,background:form.category===cat.id?cat.color+'20':'rgba(255,255,255,0.05)',color:form.category===cat.id?cat.color:'rgba(255,255,255,0.6)',fontFamily:"'Rubik',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>
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
                      <div style={{fontSize:12,color:"#64dfdf",fontWeight:700,marginTop:-8,marginBottom:6}}>🌙 {Math.round((new Date(form.checkOut).getTime()-new Date(form.checkIn).getTime())/86400000)} לילות</div>
                    )}
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>הסכום הוא לכל תקופת השהייה</div>
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
                          <button key={p.id} onClick={()=>toggleSplitPerson(p.id)} style={{padding:"6px 12px",borderRadius:999,border:`2px solid ${form.splitWith.includes(p.id)?p.color:C.sandDark}`,background:form.splitWith.includes(p.id)?p.color+"20":C.white,color:form.splitWith.includes(p.id)?p.color:"#ffffff",fontFamily:"'Rubik',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    {form.splitWith.length>0&&(
                      <div style={{display:"flex",gap:6}}>
                        {[{id:"equal",label:"חלוקה שווה"},{id:"payer",label:"המשלם משלם הכל"}].map(o=>(
                          <button key={o.id} onClick={()=>set({splitType:o.id})} style={{flex:1,padding:"7px",borderRadius:10,border:`1.5px solid ${form.splitType===o.id?C.purple:C.sandDark}`,background:form.splitType===o.id?`${C.purple}15`:C.white,color:form.splitType===o.id?C.purple:C.muted,fontFamily:"'Rubik',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                            {o.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button onClick={()=>set({paid:!form.paid})} style={{width:"100%",padding:"11px",borderRadius:12,border:`0.5px solid ${form.paid?'#4ade80':'rgba(255,255,255,0.15)'}`,background:form.paid?'rgba(74,222,128,0.1)':'rgba(255,255,255,0.05)',color:form.paid?'#4ade80':'rgba(255,255,255,0.4)',fontFamily:"'Rubik',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  {form.paid?"✅ שולם":"⏳ טרם שולם"}
                </button>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={handleAdd} style={{flex:2,padding:"13px",borderRadius:13,border:"none",background:"#64dfdf",color:"#0d2137",fontFamily:"'Rubik',sans-serif",fontWeight:700,fontSize:15,cursor:"pointer"}}>הוסף ✓</button>
                  <button onClick={()=>setShow(false)} style={{flex:1,padding:"13px",borderRadius:13,border:"0.5px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.05)",fontFamily:"'Rubik',sans-serif",fontWeight:600,fontSize:14,cursor:"pointer",color:"rgba(255,255,255,0.5)"}}>ביטול</button>
                </div>
              </Card>
            )}

            {dayExp.length===0?(<div style={{textAlign:"center",color:"rgba(255,255,255,0.25)",padding:"28px 0",fontSize:14,fontFamily:"'Rubik',sans-serif"}}><div style={{fontSize:36,marginBottom:10}}>🌊</div>אין הוצאות לתאריך זה</div>)
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
        action={<button onClick={handlePDF} style={{padding:"8px 18px",borderRadius:10,border:"2px solid rgba(255,255,255,0.5)",background:"rgba(255,255,255,0.15)",color:"#ffffff",fontFamily:"'Rubik',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer"}}>📤 ייצוא</button>}/>
      <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:14}}>

        {/* KPI */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[{label:'סה"כ הוצאות',value:total,color:"#64dfdf",icon:"📊"},{label:"שולם",value:paid,color:"#4ade80",icon:"✅"},{label:"טרם שולם",value:unpaid,color:"#ff6b6b",icon:"⏳"},{label:"מס׳ הוצאות",value:expenses.length,color:"#fbbf24",icon:"🧾",noFmt:true}].map(item=>(
            <div key={item.label} style={{background:"rgba(255,255,255,0.05)",border:"0.5px solid rgba(255,255,255,0.08)",borderTop:`2px solid ${item.color}`,borderRadius:14,padding:"14px",textAlign:"center"}}>
              <div style={{fontSize:22,marginBottom:6}}>{item.icon}</div>
              <div style={{fontFamily:"'Rubik',sans-serif",fontSize:20,fontWeight:700,color:item.color}}>{item.noFmt?item.value:`₪${item.value.toFixed(0)}`}</div>
              <div style={{fontSize:10,fontWeight:400,color:"rgba(255,255,255,0.3)",marginTop:4,letterSpacing:"0.3px"}}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Pie */}
        {pieData.length>0&&<Card><h2 style={{fontFamily:"'Rubik',sans-serif",fontSize:18,fontWeight:700,marginBottom:16,color:"#0a3050",textAlign:"center"}}>📊 גרף עוגה</h2><PieChart data={pieData}/></Card>}

        {/* Bars */}
        {byCat.length>0&&(
          <Card>
            <h2 style={{fontFamily:"'Rubik',sans-serif",fontSize:18,fontWeight:700,marginBottom:16,color:"#0a3050"}}>פירוט לפי קטגוריה</h2>
            {byCat.map(cat=>{
              const maxT=Math.max(...byCat.map(c=>c.total),1);
              return(
                <div key={cat.id} style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{fontWeight:700,fontSize:15,display:"flex",gap:6,alignItems:"center"}}><span>{cat.icon}</span><span>{cat.label}</span><span style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>({cat.count})</span></div>
                    <div style={{fontFamily:"'Rubik',sans-serif",fontWeight:700,fontSize:15,color:"#64dfdf"}}>₪{cat.total.toFixed(0)}</div>
                  </div>
                  <div style={{height:5,background:"rgba(255,255,255,0.08)",borderRadius:999,overflow:"hidden"}}>
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
            <h2 style={{fontFamily:"'Rubik',sans-serif",fontSize:18,fontWeight:700,marginBottom:12,color:"#0a3050"}}>סטטוס תשלום</h2>
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
            <h2 style={{fontFamily:"'Rubik',sans-serif",fontSize:18,fontWeight:700,marginBottom:4,color:"#0a3050"}}>💸 התחשבנות</h2>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.35)",marginBottom:14}}>מי חייב למי בסוף הטיול</p>
            {settlement.length===0?(
              <div style={{textAlign:"center",color:"#4ade80",padding:"16px 0",fontWeight:700,fontSize:14}}>✅ אין חובות! הכל מאוזן</div>
            ):settlement.map((d,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"12px",background:"rgba(255,255,255,0.04)",borderRadius:12,marginBottom:8}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:d.from.color+"30",border:`2px solid ${d.from.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:d.from.color,flexShrink:0}}>
                  {d.from.name[0]}
                </div>
                <div style={{flex:1}}>
                  <span style={{fontWeight:700,color:d.from.color}}>{d.from.name}</span>
                  <span style={{color:"rgba(255,255,255,0.35)",fontSize:13}}> חייב ל</span>
                  <span style={{fontWeight:700,color:d.to.color}}>{d.to.name}</span>
                </div>
                <div style={{fontFamily:"'Rubik',sans-serif",fontSize:16,fontWeight:700,color:"#ff6b6b"}}>₪{d.amount.toFixed(0)}</div>
                <div style={{width:32,height:32,borderRadius:"50%",background:d.to.color+"30",border:`2px solid ${d.to.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:d.to.color,flexShrink:0}}>
                  {d.to.name[0]}
                </div>
              </div>
            ))}
          </Card>
        )}

        {expenses.length===0&&<div style={{textAlign:"center",color:"rgba(255,255,255,0.35)",padding:"32px 0"}}><div style={{fontSize:40,marginBottom:10}}>🌺</div><div style={{fontSize:15}}>אין הוצאות עדיין</div></div>}
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
        <div style={{margin:"12px 16px 0",padding:"9px 14px",background:"rgba(255,255,255,0.05)",borderRadius:12,fontSize:12,boxShadow:"0 2px 8px rgba(0,0,0,0.05)",color:"rgba(255,255,255,0.35)"}}>
          {wLoad&&"🌤️ טוען תחזית..."}{wErr&&<span style={{color:"#ff6b6b"}}>☁️ {wErr}</span>}{wx&&!wLoad&&<span style={{color:"#4ade80",fontWeight:700}}>🌍 תחזית: {wx.name}, {wx.country}</span>}
        </div>
      )}

      {editD&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#0d2f4a",border:"0.5px solid rgba(100,223,223,0.25)",borderRadius:20,padding:22,width:"100%",maxWidth:400,boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
            <h3 style={{fontFamily:"'Rubik',sans-serif",fontSize:19,fontWeight:700,marginBottom:4,color:"#0a3050"}}>פעילויות ל{fmtDate(editD)}</h3>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.35)",marginBottom:12}}>שורה נפרדת לכל פעילות</p>
            <textarea value={inp} onChange={e=>setInp(e.target.value)} rows={6} placeholder={"ביקור במקדש\nשוק לילה\nטיול בספינה"}
              style={{width:"100%",padding:"11px",borderRadius:12,border:"0.5px solid rgba(100,223,223,0.2)",fontFamily:"'Rubik',sans-serif",fontSize:14,resize:"vertical",direction:"rtl",color:"#ffffff",background:"rgba(255,255,255,0.07)",outline:"none"}}
              onFocus={e=>(e.target.style.borderColor=C.ocean)} onBlur={e=>(e.target.style.borderColor=C.sandDark)}/>
            <div style={{display:"flex",gap:9,marginTop:12}}>
              <button onClick={saveEdit} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:"#64dfdf",color:"#0d2137",fontFamily:"'Rubik',sans-serif",fontWeight:700,fontSize:15,cursor:"pointer"}}>שמור ✓</button>
              <button onClick={()=>setEditD(null)} style={{flex:1,padding:"12px",borderRadius:12,border:"0.5px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.05)",fontFamily:"'Rubik',sans-serif",fontWeight:600,fontSize:14,cursor:"pointer",color:"rgba(255,255,255,0.5)"}}>ביטול</button>
            </div>
          </div>
        </div>
      )}

      <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:14}}>
        {dates.length===0?(<div style={{textAlign:"center",color:"rgba(255,255,255,0.35)",padding:"40px 0"}}><div style={{fontSize:44,marginBottom:14}}>🗓️</div>הגדר יעד ותאריכים</div>)
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
            <div key={date} style={{background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(100,223,223,0.14)",borderRadius:16,overflow:"hidden"}}>
              <div style={{background:"rgba(100,223,223,0.08)",borderBottom:"0.5px solid rgba(100,223,223,0.12)",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:42,height:42,borderRadius:10,background:"rgba(100,223,223,0.1)",border:"0.5px solid rgba(100,223,223,0.2)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                    <div style={{color:"#ffffff",fontSize:17,fontWeight:800,fontFamily:"'Rubik',sans-serif",lineHeight:1}}>{dayNum}</div>
                    <div style={{color:"rgba(255,255,255,0.35)",fontSize:9,fontWeight:400}}>{month}</div>
                  </div>
                  <div>
                    <div style={{color:"#ffffff",fontWeight:800,fontSize:15}}>{wday}</div>
                    <div style={{color:"rgba(255,255,255,0.7)",fontSize:11}}>יום {idx+1} מתוך {dates.length}</div>
                  </div>
                </div>
                <button onClick={()=>openEdit(date)} style={{padding:"6px 12px",borderRadius:8,border:"0.5px solid rgba(100,223,223,0.3)",background:"rgba(100,223,223,0.08)",color:"#64dfdf",fontFamily:"'Rubik',sans-serif",fontWeight:600,fontSize:11,cursor:"pointer"}}>✏️ פעילויות</button>
              </div>
              <div style={{padding:"12px 16px"}}>
                {wxd&&(
                  <div style={{marginBottom:10,padding:"9px 12px",background:"rgba(100,223,223,0.07)",border:"0.5px solid rgba(100,223,223,0.15)",borderRadius:11,display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:20}}>{(WMO[wxd.code]||"🌡️").split(" ")[0]}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:13,color:"rgba(255,255,255,0.75)"}}>{WMO[wxd.code]?.split(" ").slice(1).join(" ")||"—"}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:1}}>🌡️ {wxd.min?.toFixed(0)}°–{wxd.max?.toFixed(0)}°C{wxd.rain>0?` · 💧${wxd.rain}%`:""}</div>
                    </div>
                  </div>
                )}
                {flights.map(f=>{const rem=remTime(f.departureTime);return(
                  <div key={f.id} style={{marginBottom:9,padding:"10px 12px",background:`${C.ocean}0D`,borderRadius:11,borderRight:`3px solid ${C.ocean}`}}>
                    <div style={{fontWeight:700,fontSize:14,color:"#0a3050"}}>✈️ טיסה — המראה {f.departureTime}</div>
                    {rem&&<div style={{fontSize:12,color:"#ff6b6b",fontWeight:700,marginTop:4}}>🔔 הגעה לשדה עד {rem}</div>}
                    {f.description&&<div style={{fontSize:12,color:"rgba(255,255,255,0.35)",marginTop:3}}>{f.description}</div>}
                  </div>
                );})}
                {hotels.map(h=>{const isIn=h.checkIn===date,isOut=h.checkOut===date;return(
                  <div key={h.id} style={{marginBottom:9,padding:"10px 12px",background:`${C.oceanLight}12`,borderRadius:11,borderRight:`3px solid ${C.oceanLight}`}}>
                    <div style={{fontWeight:700,fontSize:14,color:"#0a3050",display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                      <span>🏨 {h.description||"מלון"}</span>
                      {isIn&&<span style={{fontSize:11,background:C.palm,color:"#ffffff",borderRadius:6,padding:"2px 7px"}}>צ׳ק אין</span>}
                      {isOut&&<span style={{fontSize:11,background:C.coral,color:"#ffffff",borderRadius:6,padding:"2px 7px"}}>צ׳ק אאוט</span>}
                    </div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:3}}>{fmtDate(h.checkIn)} → {fmtDate(h.checkOut)}</div>
                  </div>
                );})}
                {others.map(e=>{
                  const cat=CATS.find(c=>c.id===e.category);
                  return(
                    <div key={e.id} style={{marginBottom:9,padding:"10px 12px",background:`${cat?.color}12`,borderRadius:11,borderRight:`3px solid ${cat?.color}`}}>
                      <div style={{fontWeight:700,fontSize:14,color:"#ffffff"}}>{cat?.icon} {cat?.label}{e.description?` – ${e.description}`:""}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:3,display:"flex",gap:10}}>
                        <span>₪{e.amountILS.toFixed(0)}</span>
                        <span style={{color:e.paid?C.palm:C.coral,fontWeight:700}}>{e.paid?"✅ שולם":"⏳ טרם שולם"}</span>
                      </div>
                    </div>
                  );
                })}
                {dayActs.length>0?(
                  <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:7}}>
                    {dayActs.map((act,i)=>(
                      <li key={i} style={{display:"flex",alignItems:"flex-start",gap:9,padding:"8px 12px",background:"rgba(255,255,255,0.04)",borderRadius:10}}>
                        <span style={{fontSize:16,marginTop:1}}>🌺</span>
                        <span style={{fontSize:13,fontWeight:400,color:"rgba(255,255,255,0.75)"}}>{act}</span>
                      </li>
                    ))}
                  </ul>
                ):!hasContent&&(<div style={{textAlign:"center",color:"rgba(255,255,255,0.35)",padding:"12px 0",fontSize:13}}>לחץ ✏️ להוספת פעילויות 🌴</div>)}
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

export default function TripPlan({trips:initialTrips,onSaveTrip,onDeleteTrip,onLogout,userEmail}){
  const[trips,setTrips]=useState(initialTrips);
  const[activeId,setActiveId]=useState(null);
  const[screen,setScreen]=useState("destination");
  const{rates,allCodes,info,toILS}=useRates();

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
    setTrips((ts)=>ts.map(t=>{
      if(t.id!==activeId)return t;
      const updated={...t,expenses:[...t.expenses,e]};
      onSaveTrip(updated);
      return updated;
    }));
  },[activeId,onSaveTrip]);

  const togglePay=useCallback((id)=>{
    setTrips((ts)=>ts.map(t=>{
      if(t.id!==activeId)return t;
      const updated={...t,expenses:t.expenses.map(e=>e.id===id?{...e,paid:!e.paid}:e)};
      onSaveTrip(updated);
      return updated;
    }));
  },[activeId,onSaveTrip]);

  const delExp=useCallback((id)=>{
    setTrips((ts)=>ts.map(t=>{
      if(t.id!==activeId)return t;
      const updated={...t,expenses:t.expenses.filter(e=>e.id!==id)};
      onSaveTrip(updated);
      return updated;
    }));
  },[activeId,onSaveTrip]);

  const handleCreate=()=>{
    const t=newTrip();
    setTrips((ts)=>[...ts,t]);
    onSaveTrip(t);
    setActiveId(t.id);
    setScreen("destination");
  };

  const handleSelect=id=>{setActiveId(id);setScreen("destination");};
  const handleBack=()=>{setActiveId(null);setScreen("destination");};
  const handleDelete=(id)=>{setTrips((ts)=>ts.filter(t=>t.id!==id));onDeleteTrip(id);};

  const screens=["destination","expenses","budget","calendar"];

  if(!activeId){
    return(
      <>
        <style>{GS}</style>
        <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",fontFamily:"'Rubik',sans-serif"}}>
          {/* user bar */}
          <div style={{background:"rgba(0,0,0,0.4)",padding:"10px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"0.5px solid rgba(100,223,223,0.1)"}}>
            <div style={{display:"flex",flexDirection:"column"}}>
              <span style={{fontFamily:"'Rubik',sans-serif",color:"#ffffff",fontSize:20,fontWeight:800,letterSpacing:"-0.5px",lineHeight:1}}>טיולון</span>
              <span style={{fontFamily:"'Rubik',sans-serif",color:"rgba(255,255,255,0.35)",fontSize:10,fontWeight:300,letterSpacing:"0.5px",marginTop:3}}>מתכנן הטיולים שלי</span>
            </div>
            <button onClick={onLogout} style={{background:"rgba(100,223,223,0.1)",border:"0.5px solid rgba(100,223,223,0.25)",borderRadius:8,color:"#64dfdf",fontFamily:"'Rubik',sans-serif",fontWeight:600,fontSize:11,padding:"5px 12px",cursor:"pointer"}}>התנתק</button>
          </div>
          <TripSelectorScreen trips={trips} onSelect={handleSelect} onCreate={handleCreate} onDelete={handleDelete}/>
        </div>
      </>
    );
  }

  return(
    <>
      <style>{GS}</style>
      <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",display:"flex",flexDirection:"column",background:"#0d2137",fontFamily:"'Rubik',sans-serif"}}>
        <div style={{background:"rgba(0,0,0,0.4)",padding:"12px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:"0.5px solid rgba(100,223,223,0.1)"}}>
          <button onClick={handleBack} style={{background:"rgba(100,223,223,0.1)",border:"0.5px solid rgba(100,223,223,0.25)",borderRadius:8,color:"#64dfdf",fontFamily:"'Rubik',sans-serif",fontWeight:600,fontSize:12,padding:"5px 12px",cursor:"pointer",letterSpacing:"0.3px"}}>← טיולון</button>
          <span style={{fontFamily:"'Rubik',sans-serif",color:"#ffffff",fontSize:15,fontWeight:700,flex:1,textAlign:"center",letterSpacing:"-0.2px"}}>{active?.destination||"טיולון"}</span>
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
