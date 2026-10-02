import type { CSSProperties, PointerEventHandler } from "react";
import { Plus } from "lucide-react";
import { BouquetFrame } from "./BouquetFrame";
import type { SlotDefinition } from "../lib/gardenLayout";
import type { BouquetWithFlowers, VaseStyle } from "../types";

/** Shared by browsing, placement selection and drag editing. The bottom of
 * the vase (not the label or image centre) is the immutable stone anchor. */
export function OlympusSlot({slot, bouquet, vaseStyle = "clay-pot", selected, selectable, onTap, drag, faded = false}: {
  slot: SlotDefinition; bouquet?: BouquetWithFlowers; vaseStyle?: VaseStyle;
  selected?: boolean; selectable?: boolean; onTap?: () => void; faded?: boolean;
  drag?: {onPointerDown: PointerEventHandler<HTMLButtonElement>; onPointerMove: PointerEventHandler<HTMLButtonElement>; onPointerUp: PointerEventHandler<HTMLButtonElement>; onPointerCancel: PointerEventHandler<HTMLButtonElement>};
}) {
  const width = 22 * slot.scale;
  const style: CSSProperties = {left:`${slot.xPct}%`,top:`${slot.yPct}%`,width:`${bouquet ? width : width*.6}%`, opacity:faded ? .4 : 1};
  return <button type="button" className={`oly-slot ${!bouquet ? "oly-slot-empty" : ""} ${selected ? "oly-slot-selected" : ""}`} style={style} onClick={onTap} {...drag} aria-label={bouquet?.name ?? "Empty planting spot"}>
    {bouquet ? <>
      <BouquetFrame imageUrl={bouquet.imageUrl} frameStyle={bouquet.frameStyle} alt={bouquet.name} style={{width:"100%",aspectRatio:".9",height:"auto"}} />
      <svg data-vase={vaseStyle} viewBox="0 0 60 34" style={{width:"52%",height:"auto",marginTop:"-9%",position:"relative",flexShrink:0}} fill={vaseStyle === "glass-vase" ? "#dce7df" : vaseStyle === "woven-basket" ? "#d9c8a5" : vaseStyle === "tin-bucket" ? "#d2d6ce" : "#e5c3b5"} stroke="#a28c81" strokeWidth="1.2" aria-hidden="true">
        <path d="M7 3Q30 0 53 3L48 28Q30 35 12 28Z"/><ellipse cx="30" cy="4" rx="23" ry="3" fill="#f3e7d2"/>
        {vaseStyle === "woven-basket" ? <path d="M10 12h40M11 19h38M14 26h32M20 7v22M30 7v24M40 7v22" opacity=".45"/> : <path d="m17 10 2 13" stroke="#fff4e6" strokeWidth="3" opacity=".65"/>}
        {vaseStyle === "tin-bucket" && <path d="M9 11Q-1 31 14 27m36-16q12 20-4 16" fill="none"/>}
      </svg>
      <span className="oly-slot-label">{bouquet.name}</span>
    </> : selectable ? <Plus size={18} className="text-[var(--color-rose)]"/> : null}
  </button>;
}
