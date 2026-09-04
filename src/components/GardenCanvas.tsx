import { GardenBackdrop } from "./GardenBackdrop";
import { GardenSlot } from "./GardenSlot";
import { slotsForTheme } from "../lib/gardenLayout";
import type { BouquetWithFlowers, GardenPlacement } from "../types";
import type { GardenTheme } from "../lib/gardenLayout";

interface GardenCanvasProps {
  placements: GardenPlacement[];
  bouquetsById: Map<string, BouquetWithFlowers>;
  theme?: GardenTheme | string;
  selectableSlotId?: string | null;
  onSelectSlot?: (slotId: string) => void;
  onOpenBouquet?: (bouquetId: string) => void;
}

export function GardenCanvas({
  placements,
  bouquetsById,
  theme = "garden",
  selectableSlotId,
  onSelectSlot,
  onOpenBouquet,
}: GardenCanvasProps) {
  const slots = slotsForTheme(theme);
  return (
    <div className="relative aspect-[572/1024] w-full overflow-hidden rounded-[32px] border border-[var(--color-line)] bg-[var(--color-primary)]">
      <GardenBackdrop theme={theme} />
      {slots.map((slot) => {
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
