import { useEffect, useRef, useState } from "react";
import { GardenCanvas } from "./GardenCanvas";
import { LockedGardenArea } from "./LockedGardenArea";
import { GardenUnlockGate } from "./GardenUnlockGate";
import { buildDisplayAreas } from "../lib/gardenLock";
import { useOpenedAreaIds } from "../lib/openedAreasFlag";
import type { BouquetWithFlowers, GardenArea, GardenPlacement } from "../types";

interface GardenAreaSwitcherProps {
  areas: GardenArea[];
  placements: GardenPlacement[];
  bouquetsById: Map<string, BouquetWithFlowers>;
  onOpenBouquet: (bouquetId: string) => void;
  /** When set, smooth-scrolls to this area's page once (e.g. after tapping "Đến khu vườn" on the unlock celebration). */
  focusAreaId?: string | null;
  onFocusHandled?: () => void;
}

export function GardenAreaSwitcher({
  areas,
  placements,
  bouquetsById,
  onOpenBouquet,
  focusAreaId,
  onFocusHandled,
}: GardenAreaSwitcherProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const openedAreaIds = useOpenedAreaIds();
  const displayAreas = buildDisplayAreas(areas, placements, openedAreaIds);

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    // Snap step is item width + the flex `gap-4` (16px) between items, not
    // just clientWidth, now that spacing comes from a real gap instead of
    // per-item padding.
    const index = Math.round(el.scrollLeft / (el.clientWidth + 16));
    setActiveIndex(index);
  }

  useEffect(() => {
    if (!focusAreaId) return;
    const el = scrollerRef.current;
    if (!el) return;
    const index = displayAreas.findIndex((a) => a.id === focusAreaId);
    if (index < 0) return;
    el.scrollTo({ left: index * (el.clientWidth + 16), behavior: "smooth" });
    setActiveIndex(index);
    onFocusHandled?.();
    // Only ever react to a *new* focus request, not every time
    // `displayAreas` is recomputed (which happens on nearly every render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusAreaId]);

  return (
    <div className="mt-4">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5"
      >
        {displayAreas.map((area) => (
          <div key={area.id} className="w-full shrink-0 snap-center">
            <p
              aria-hidden={area.isLocked ? "true" : undefined}
              className={`mb-2 font-display text-sm italic text-[var(--color-muted)] ${
                area.isLocked ? "invisible" : ""
              }`}
            >
              {area.isLocked ? "Garden" : area.name}
            </p>
            {area.isVirtual ? (
              <LockedGardenArea />
            ) : area.isLocked ? (
              <GardenUnlockGate
                areaId={area.id}
                areaName={area.name}
                theme={area.theme}
                placements={placements.filter((p) => p.gardenAreaId === area.id)}
                bouquetsById={bouquetsById}
                onOpenBouquet={onOpenBouquet}
                onUnlocked={() => {}}
              />
            ) : (
              <GardenCanvas
                placements={placements.filter((p) => p.gardenAreaId === area.id)}
                bouquetsById={bouquetsById}
                theme={area.theme}
                ambientAnimation={area.order === 0}
                onOpenBouquet={onOpenBouquet}
              />
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
