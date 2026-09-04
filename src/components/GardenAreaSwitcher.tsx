import { useRef, useState } from "react";
import { GardenCanvas } from "./GardenCanvas";
import { LockedGardenArea } from "./LockedGardenArea";
import { buildDisplayAreas } from "../lib/gardenLock";
import type { BouquetWithFlowers, GardenArea, GardenPlacement } from "../types";

interface GardenAreaSwitcherProps {
  areas: GardenArea[];
  placements: GardenPlacement[];
  bouquetsById: Map<string, BouquetWithFlowers>;
  onOpenBouquet: (bouquetId: string) => void;
}

export function GardenAreaSwitcher({ areas, placements, bouquetsById, onOpenBouquet }: GardenAreaSwitcherProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const displayAreas = buildDisplayAreas(areas, placements);

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(index);
  }

  return (
    <div className="mt-4">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto px-5"
      >
        {displayAreas.map((area) => (
          <div key={area.id} className="w-full shrink-0 snap-center px-2 first:pl-0 last:pr-0">
            {area.isLocked ? (
              <LockedGardenArea />
            ) : (
              <>
                <p className="mb-2 font-display text-sm italic text-[var(--color-muted)]">{area.name}</p>
                <GardenCanvas
                  placements={placements.filter((p) => p.gardenAreaId === area.id)}
                  bouquetsById={bouquetsById}
                  theme={area.theme}
                  onOpenBouquet={onOpenBouquet}
                />
              </>
            )}
          </div>
        ))}
      </div>
      {displayAreas.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {displayAreas.map((area, i) => (
            <span
              key={area.id}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex ? "w-5 bg-[var(--color-rose)]" : "w-1.5 bg-[var(--color-line)]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
