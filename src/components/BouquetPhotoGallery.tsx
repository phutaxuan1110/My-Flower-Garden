import { useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useLanguage } from "../i18n/LanguageProvider";
import type { BouquetPhoto } from "../types";

export function BouquetPhotoGallery(props: {photos: BouquetPhoto[]; name: string; onOpen?: () => void}) {
  // Reset the scroll/dot state when the ordered album changes, not on unrelated edits.
  return <Gallery key={props.photos.map(p=>p.id).join("|")} {...props}/>;
}
function Gallery({photos, name, onOpen}: {photos: BouquetPhoto[]; name: string; onOpen?: () => void}) {
  const ref = useRef<HTMLDivElement>(null);
  const start = useRef<{x:number;y:number} | null>(null);
  const moved = useRef(false);
  const [index,setIndex] = useState(0);
  const reduced = useReducedMotion();
  const {language} = useLanguage();
  const go = (i:number) => ref.current?.scrollTo({left:i*ref.current.clientWidth,behavior:reduced ? "instant" : "smooth"});
  return <div className="relative h-full w-full" role="region" aria-label={language === "vi" ? `Ảnh của ${name}` : `Photos of ${name}`}>
    <div ref={ref} className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      onScroll={e=>{const el=e.currentTarget;if(el.clientWidth)setIndex(Math.max(0,Math.min(photos.length-1,Math.round(el.scrollLeft/el.clientWidth))));}}
      onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(Math.max(0,Math.min(photos.length-1,index+(e.key==='ArrowRight'?1:-1))));}}}
      tabIndex={photos.length>1?0:undefined}
      onPointerDown={e=>{start.current={x:e.clientX,y:e.clientY};moved.current=false;}}
      onPointerMove={e=>{if(start.current && Math.hypot(e.clientX-start.current.x,e.clientY-start.current.y)>8)moved.current=true;}}
      onPointerUp={()=>{start.current=null;}} onPointerCancel={()=>{start.current=null;moved.current=true;}}>
      {photos.map((p,i)=>{
        const image=<img src={p.url} alt={`${name} — ${i+1}/${photos.length}`} draggable={false} loading={i===0 ? "eager" : "lazy"} className="no-callout h-full w-full object-cover"/>;
        return onOpen ? <button key={p.id} type="button" className="h-full w-full shrink-0 snap-center overflow-hidden" onClick={e=>{if(e.detail===0 || !moved.current)onOpen();}} aria-label={name}>{image}</button> : <div key={p.id} className="h-full w-full shrink-0 snap-center overflow-hidden">{image}</div>;
      })}
    </div>
    {photos.length>1 && <div className="absolute inset-x-0 bottom-2 flex justify-center" aria-label={language==='vi'?'Chọn ảnh':'Choose photo'}>
      <div className="flex max-w-full items-center rounded-full bg-black/25 px-1 backdrop-blur-sm">
        {photos.map((p,i)=><button key={p.id} type="button" onClick={()=>go(i)} aria-label={language==='vi'?`Xem ảnh ${i+1} trên ${photos.length}`:`View photo ${i+1} of ${photos.length}`} aria-current={i===index?'true':undefined} className="flex h-8 w-3.5 items-center justify-center sm:w-5"><span className={`h-1.5 rounded-full transition-all ${i===index?'w-3 bg-white':'w-1.5 bg-white/55'}`}/></button>)}
      </div>
    </div>}
  </div>;
}
