import { GardenBackdrop } from "./GardenBackdrop";
import { GardenSlot } from "./GardenSlot";
import { SLOTS_PER_AREA } from "../lib/gardenLayout";
import type { BouquetWithFlowers, GardenPlacement } from "../types";

interface GardenCanvasProps {
  placements: GardenPlacement[];
  bouquetsById: Map<string, BouquetWithFlowers>;
  selectableSlotId?: string | null;
  onSelectSlot?: (slotId: string) => void;
  onOpenBouquet?: (bouquetId: string) => void;
}

export function GardenCanvas({
  placements,
  bouquetsById,
  selectableSlotId,
  onSelectSlot,
  onOpenBouquet,
}: GardenCanvasProps) {
  return (
    <div className="relative aspect-[572/1024] w-full overflow-hidden rounded-[32px] border border-[var(--color-line)] bg-[var(--color-primary)]">
      <GardenBackdrop />
      {SLOTS_PER_AREA.map((slot) => {
        const placement = placements.find((p) => p.slotId === slot.id);
        const bouquet = placement ? bouquetsById.get(placement.bouquetId) : undefined;
        const selectable = Boolean(onSelectSlot) && !bouquet;
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
    </div>
  );
}
