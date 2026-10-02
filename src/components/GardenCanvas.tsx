import { OlympusDecor } from "./OlympusDecor";
import { OlympusSlot } from "./OlympusSlot";
import { GardenBackdrop } from "./GardenBackdrop";
import { GardenSlot } from "./GardenSlot";
import { slotsForTheme } from "../lib/gardenLayout";
import type { BouquetWithFlowers, GardenPlacement } from "../types";
import type { GardenTheme } from "../lib/gardenLayout";

interface GardenCanvasProps {
  placements: GardenPlacement[];
  areaId?: string;
  bouquetsById: Map<string, BouquetWithFlowers>;
  theme?: GardenTheme | string;
  selectableSlotId?: string | null;
  onSelectSlot?: (slotId: string) => void;
  onOpenBouquet?: (bouquetId: string) => void;
  ambientAnimation?: boolean;
}

export function GardenCanvas({
  placements,
  areaId,
  bouquetsById,
  theme = "garden",
  selectableSlotId,
  onSelectSlot,
  onOpenBouquet,
  ambientAnimation = false,
}: GardenCanvasProps) {
  const slots = slotsForTheme(theme);
  return (
    <div className="oly-canvas isolate relative aspect-[572/1024] w-full overflow-hidden rounded-[32px] border border-[var(--color-line)] bg-[var(--color-primary)]">
      <GardenBackdrop theme={theme} ambientAnimation={ambientAnimation} />
      {slots.map((slot) => {
        const placement = placements.find((p) => p.slotId === slot.id);
        const bouquet = placement ? bouquetsById.get(placement.bouquetId) : undefined;
        const selectable = Boolean(onSelectSlot) && !bouquet;
        if (theme === "olympus") return <OlympusSlot key={slot.id} slot={slot} bouquet={bouquet} vaseStyle={placement?.vaseStyle} selected={selectableSlotId === slot.id} selectable={selectable} onTap={() => {
          if (bouquet && onOpenBouquet) onOpenBouquet(bouquet.id);
          else if (onSelectSlot) onSelectSlot(slot.id);
        }} />;
        return (
          <GardenSlot
            key={slot.id}
            slot={slot}
            bouquet={bouquet}
            vaseStyle={placement?.vaseStyle}
            isSelectable={selectable}
            isSelected={selectableSlotId === slot.id}
            onTap={() => {
              if (bouquet && onOpenBouquet) onOpenBouquet(bouquet.id);
              else if (!bouquet && onSelectSlot) onSelectSlot(slot.id);
            }}
          />
        );
      })}
      {theme === "olympus" && <OlympusDecor layer="front" areaId={areaId ?? placements[0]?.gardenAreaId} />}
    </div>
  );
}
