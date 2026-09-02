import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { BouquetFrame } from "./BouquetFrame";
import type { SlotDefinition } from "../lib/gardenLayout";
import type { BouquetWithFlowers, VaseStyle } from "../types";

const VASE_EMOJI_FALLBACK: Record<VaseStyle, string> = {
  "clay-pot": "🏺",
  "glass-vase": "🏵️",
  "woven-basket": "🧺",
  "tin-bucket": "🪣",
};

interface GardenSlotProps {
  slot: SlotDefinition;
  bouquet?: BouquetWithFlowers;
  vaseStyle?: VaseStyle;
  isSelectable?: boolean;
  isSelected?: boolean;
  onTap: () => void;
}

export function GardenSlot({ slot, bouquet, vaseStyle = "clay-pot", isSelectable, isSelected, onTap }: GardenSlotProps) {
  const size = 92 * slot.scale;

  return (
    <button
      type="button"
      onClick={onTap}
      style={{
        left: `${slot.xPct}%`,
        top: `${slot.yPct}%`,
        width: size,
        transform: "translate(-50%, -50%)",
      }}
      className={`absolute flex min-h-[44px] flex-col items-center transition-transform active:scale-95 ${
        isSelectable ? "cursor-pointer" : ""
      }`}
      aria-label={bouquet ? bouquet.name : "Empty planting spot"}
    >
      {bouquet ? (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <BouquetFrame
            imageUrl={bouquet.imageUrl}
            frameStyle={bouquet.frameStyle}
            alt={bouquet.name}
            className="border-2 border-white shadow-md shadow-black/10"
            style={{ width: size * 0.82, height: size * 0.95 }}
          />
          <span className="-mt-2 text-lg leading-none" aria-hidden="true">
            {VASE_EMOJI_FALLBACK[vaseStyle]}
          </span>
          <span className="mt-0.5 max-w-[90px] truncate text-[11px] font-medium text-[var(--color-ink)]">
            {bouquet.name}
          </span>
        </motion.div>
      ) : (
        <div
          className={`flex items-center justify-center rounded-full border-2 border-dashed ${
            isSelected
              ? "border-[var(--color-rose)] bg-[var(--color-rose)]/10"
              : isSelectable
                ? "border-[var(--color-primary-strong)] bg-white/50"
                : "border-[var(--color-line)] bg-white/30"
          }`}
          style={{ width: size * 0.62, height: size * 0.62 }}
        >
          {isSelectable && <Plus size={18} className="text-[var(--color-rose)]" />}
        </div>
      )}
    </button>
  );
}
