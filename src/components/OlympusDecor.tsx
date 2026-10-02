import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { SLOTS_OLYMPUS } from "../lib/gardenLayout";
import { useLanguage } from "../i18n/LanguageProvider";
import { latestOlympusCelebration, OLYMPUS_PLACED } from "../lib/olympusEvents";
import "./olympus.css";

/** All art uses the 572 × 1024 scene coordinate system. Joint origins are
 * local SVG coordinates, never the character's bounding-box centre. */
export function PegasusArt() {
  const paint = useId().replace(/:/g, "");
  return <svg viewBox="0 0 130 122" fill={`url(#${paint}-ivory)`} stroke="#9c9183" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <defs><linearGradient id={`${paint}-ivory`} x2=".3" y2="1"><stop stopColor="#fff8e9"/><stop offset="1" stopColor="#e9d9ce"/></linearGradient></defs>
    <ellipse cx="66" cy="112" rx="46" ry="5" fill="#b9a69f" opacity=".15" stroke="none" />
    <g data-part="tail" className="oly-tail"><path fill="#dec1bd" d="M31 67Q6 59 13 82T3 102Q30 108 30 83L41 72"/><path fill="none" d="M25 73Q13 82 20 94"/></g>
    <g data-part="legs"><path d="m39 78-4 31q4 5 10 1l7-32m33 0 4 31q5 5 10 0l-2-38"/><path fill="#cdbbb3" d="m35 105 10 1v5H34Zm54 0 10 1 1 5H89Z"/></g>
    <g data-part="breathing-body" className="oly-breath"><path d="M30 65Q36 45 66 53L88 49Q105 57 99 77Q89 92 54 87Q29 87 30 65Z"/></g>
    <g data-part="near-legs"><path d="m49 79-1 30q3 5 9 1l5-29m21-5-4 33q5 5 10 0l7-32"/><path fill="#cdbbb3" d="m48 105 10 1-1 6H47Zm31 0 10 1v6H78Z"/></g>
    <g data-part="neck-and-head" className="oly-head"><path d="M77 68Q79 47 87 36L101 38Q99 62 96 73"/><path className="oly-mane" data-part="mane" fill="#dec1bd" d="M88 37Q75 34 75 45L68 48 73 54 65 60Q76 67 88 53"/>
    <path d="M87 38Q81 26 88 17L94 27Q108 22 113 34L120 44Q124 52 111 55L96 48Q83 49 87 38Z"/><path d="m102 27 4-13 6 17"/><path fill="#dec1bd" d="M87 31Q88 20 104 24L111 34Q101 31 98 39L96 30Z"/><path className="oly-eye" d="M106 38q3-3 5 0" fill="none"/><circle cx="118" cy="47" r="1" fill="#9c9183" stroke="none"/><ellipse cx="107" cy="45" rx="4" ry="2" fill="#e7c1bc" stroke="none" opacity=".6"/></g>
    <g data-part="wing" className="oly-peg-wing"><path fill="#e8e1ee" d="M65 65Q37 57 33 27Q40 24 45 39Q43 19 50 19L59 39Q60 20 65 26L72 47Q84 56 65 65Z"/><path d="M65 60 45 39m22 16-8-16" fill="none" stroke="#bdb2c4"/></g>
  </svg>;
}

export function FairyArt() {
  const paint = useId().replace(/:/g, "");
  return <svg viewBox="0 0 100 130" fill="#faeedd" stroke="#9c9183" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <defs><linearGradient id={`${paint}-dress`} x2=".5" y2="1"><stop stopColor="#f8e8dd"/><stop offset="1" stopColor="#e4c7c6"/></linearGradient></defs>
    <g data-part="left-wing" className="oly-fairy-wing left"><path fill="#e1d9e8" fillOpacity=".8" d="M48 62Q8 12 9 42Q6 62 43 72Q12 68 24 86Q39 88 48 62Z"/><path d="M16 42 44 64" stroke="#c5bdcf"/></g>
    <g data-part="right-wing" className="oly-fairy-wing right"><path fill="#e9dfec" fillOpacity=".8" d="M55 62Q91 13 91 41Q96 62 61 72Q92 68 78 86Q63 88 55 62Z"/><path d="M84 42 59 64" stroke="#c5bdcf"/></g>
    <g data-part="hair" className="oly-hair"><path fill="#cdb8a1" d="M34 36Q28 12 49 13Q70 13 68 36L74 70Q60 77 51 58Q40 77 27 70Z"/></g>
    <path d="m43 101 2 18q-7 8 2 7l4-8 1-17m6 0 5 15q8 6 2 8l-7-7-6-15"/>
    <g data-part="dress" className="oly-dress"><path fill={`url(#${paint}-dress)`} d="M43 54Q51 49 59 54L61 72 72 103Q52 112 30 103L40 72Z"/><path fill="none" d="m45 64-7 36m14-34 3 38m3-28 8 24" stroke="#d3b9b2"/><path d="m40 71 21 0" stroke="#aeab85" strokeWidth="2"/></g>
    <path d="M43 54 33 72 27 70Q23 71 26 75L34 79 46 60"/>
    <g data-part="waving-arm" className="oly-arm"><path d="M58 55 71 65 81 51Q80 45 85 46L87 52 75 73Q70 76 56 62"/></g>
    <path d="M46 45v9q5 5 10 0V45"/><ellipse cx="51" cy="34" rx="15" ry="17"/><path fill="#cdb8a1" d="M35 31Q30 10 51 15Q69 14 67 32Q52 29 48 22Q45 31 35 31Z"/>
    <path d="m42 36 3 1m13 0 3-1m-13 7q3 2 6 0" fill="none"/><path d="M35 24Q50 15 65 25" stroke="#93a083"/>
    {[0,1,2,3,4].map(i=><ellipse key={i} cx={37+i*6} cy={22-Math.sin(i/4*Math.PI)*4} rx="4" ry="2" transform={`rotate(${i*16-35} ${37+i*6} 20)`} fill="#afb99a" strokeWidth=".6"/>)}
  </svg>;
}

function Butterfly({ variant }: { variant: number }) {
  return <svg viewBox="0 0 44 40" aria-hidden="true" fill={variant ? "#d6cedf" : "#e6c6b9"} stroke="#9c9183" strokeWidth=".8">
    <g className="oly-butter-wing" data-part="left-wing"><path d={variant ? "M22 23Q-4-6 5 19Q1 36 22 26Z" : "M22 23Q2-4 3 14Q-1 23 14 26Q5 40 22 28Z"}/></g>
    <g className="oly-butter-wing right" data-part="right-wing"><path d={variant ? "M22 23Q48-6 39 19Q43 36 22 26Z" : "M22 23Q42-4 41 14Q45 23 30 26Q39 40 22 28Z"}/></g>
    <path d="M22 17v14m0-13-4-6m4 6 4-6" fill="none"/>
  </svg>;
}

function Laurel() {
  return <svg viewBox="0 0 70 160" aria-hidden="true" fill="#b7c2a7" stroke="#9c9183" strokeWidth=".85"><g className="oly-laurel" data-part="laurel-stem"><path d="M34 155Q16 70 41 9" fill="none"/>{Array.from({length:8},(_,i)=><g key={i} className={i===3 ? "oly-leaf" : undefined}>{[-1,1].map(sign=><path key={sign} d={`M29 ${140-i*16}Q${30+sign*28} ${132-i*16} ${30+sign*23} ${115-i*16}Q28 ${119-i*16} 29 ${140-i*16}Z`}/>)}</g>)}</g></svg>;
}

export function OlympusDecor({ layer, editing = false, areaId }: { layer: "back" | "front"; editing?: boolean; areaId?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  const { language } = useLanguage();
  const [active, setActive] = useState(false);
  const [action, setAction] = useState<"pegasus" | "fairy" | null>(null);
  const actionBusy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [celebration, setCelebration] = useState<string | null>(null);
  useEffect(() => {
    let visible = false;
    const sync = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, {threshold:.05});
    if (ref.current) observer.observe(ref.current);
    document.addEventListener("visibilitychange", sync);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (layer !== "front" || editing || !areaId) return;
    let timeout: ReturnType<typeof setTimeout>;
    const respond = () => {
      const event = latestOlympusCelebration();
      if (!event || event.areaId !== areaId || Date.now() - event.time > 1800) return;
      setCelebration(event.slotId);
      clearTimeout(timeout);
      timeout = setTimeout(() => setCelebration(null), reduced ? 250 : 1500);
    };
    respond();
    window.addEventListener(OLYMPUS_PLACED, respond);
    return () => { window.removeEventListener(OLYMPUS_PLACED, respond); clearTimeout(timeout); };
  }, [areaId, editing, layer, reduced]);
  const tap = (who: "pegasus" | "fairy") => {
    if (actionBusy.current || editing || !active) return;
    actionBusy.current = true;
    setAction(who);
    timer.current = setTimeout(() => { setAction(null); actionBusy.current = false; }, reduced ? 250 : 1500);
  };
  const slot = SLOTS_OLYMPUS.find(s=>s.id===celebration);
  return <div ref={ref} className={`oly-decor oly-${layer} ${active && !editing ? "is-running" : "is-paused"} ${reduced ? "is-reduced" : ""}`} data-editing={editing || undefined}>
    {layer === "back" ? <>
      <svg className="oly-scene-svg" viewBox="0 0 572 1024" aria-hidden="true"><defs><linearGradient id={`${id}-cloud`} x2="0" y2="1"><stop stopColor="#fffaf0" stopOpacity=".9"/><stop offset="1" stopColor="#eee4ed" stopOpacity=".4"/></linearGradient></defs>
        <g fill={`url(#${id}-cloud)`} stroke="#e7dfe0" strokeWidth=".65">
          <g className="oly-cloud c1" data-part="cloud-1"><path d="M-25 217Q-10 184 24 199Q35 162 66 184Q95 168 110 203Q145 196 150 225Q55 247-25 230Z"/></g>
          <g className="oly-cloud c2" data-part="cloud-2"><path d="M424 116Q431 89 458 98Q474 62 500 91Q530 77 541 105Q586 98 599 129Q514 149 424 130Z"/></g>
          <g className="oly-cloud c3" data-part="cloud-3"><path d="M-40 927Q-10 898 16 918Q32 900 54 926Q85 919 91 951Q17 970-40 953Z"/></g>
        </g>
      </svg>
      <div className="oly-vine"><Laurel/></div>
    </> : <>
      <div className="oly-butterfly b1"><Butterfly variant={0}/></div><div className="oly-butterfly b2"><Butterfly variant={1}/></div>
      <button type="button" disabled={editing} tabIndex={editing ? -1 : 0} className={`oly-character oly-pegasus ${action === "pegasus" ? "is-acting" : ""}`} aria-label={language === "vi" ? "Chào Pegasus" : "Greet Pegasus"} onClick={()=>tap("pegasus")}><PegasusArt/></button>
      <button type="button" disabled={editing} tabIndex={editing ? -1 : 0} className={`oly-character oly-fairy ${action === "fairy" ? "is-acting" : ""}`} aria-label={language === "vi" ? "Chào tiên chăm vườn" : "Greet the garden fairy"} onClick={()=>tap("fairy")}><FairyArt/>{action === "fairy" && <Sparkles/>}</button>
      <svg className="oly-scene-svg oly-petals" viewBox="0 0 572 1024" aria-hidden="true"><g fill="#e7c4c3" opacity=".5" stroke="#ba9f9b" strokeWidth=".6"><path className="oly-petal p1" d="M24 310q13-11 16 0-7 8-16 0"/><path className="oly-petal p2" d="M531 670q13-11 16 0-7 8-16 0"/></g></svg>
      {slot && <div className="oly-celebration" style={{left:`${slot.xPct+12}%`,top:`${slot.yPct-7}%`}}><FairyArt/><Sparkles/></div>}
    </>}
  </div>;
}
function Sparkles() { return <svg className="oly-sparkles" viewBox="0 0 100 130" aria-hidden="true">{[0,1,2,3].map(i=><path key={i} className="oly-spark" style={{animationDelay:`${i*.09}s`}} fill="#fff8d6" stroke="#d3bf96" strokeWidth=".5" d={`M${15+i*22} ${23+(i%2)*68}l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z`}/>)}</svg>; }
