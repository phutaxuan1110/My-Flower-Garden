import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LockOpen } from "lucide-react";
import lockedGateImage from "../assets/garden/my-flower-garden-locked.png";
import { GardenCanvas } from "./GardenCanvas";
import { markAreaOpened } from "../lib/openedAreasFlag";
import { useLanguage } from "../i18n/LanguageProvider";
import type { BouquetWithFlowers, GardenPlacement } from "../types";

interface GardenUnlockGateProps {
  areaId: string;
  areaName: string;
  theme: string;
  placements: GardenPlacement[];
  bouquetsById: Map<string, BouquetWithFlowers>;
  onOpenBouquet: (bouquetId: string) => void;
  /** Called once the gate has fully faded out and the area is marked opened. */
  onUnlocked: () => void;
}

/**
 * The gate for a garden area that already exists (the person just finished
 * filling the one before it) but hasn't been manually opened yet. Tapping
 * "Mở khoá" fades the gate artwork out to reveal the real, interactive
 * garden underneath and persists that this area has been opened (see
 * openedAreasFlag.ts) so it stays open from then on.
 */
export function GardenUnlockGate({
  areaId,
  areaName,
  theme,
  placements,
  bouquetsById,
  onOpenBouquet,
  onUnlocked,
}: GardenUnlockGateProps) {
  const { t } = useLanguage();
  const [revealed, setRevealed] = useState(false);

  function handleUnlock() {
    if (revealed) return;
    markAreaOpened(areaId);
    setRevealed(true);
    onUnlocked();
  }

  return (
    <div className="relative aspect-[572/1024] w-full overflow-hidden rounded-[32px] border border-[var(--color-line)] bg-[var(--color-primary)]">
      {/* The real garden sits underneath from the start so it's already
          there the instant the gate fades away. */}
      <GardenCanvas
        placements={placements}
        bouquetsById={bouquetsById}
        theme={theme}
        onOpenBouquet={onOpenBouquet}
      />

      <AnimatePresence>
        {!revealed && (
          <motion.div
            className="absolute inset-0"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <img
              src={lockedGateImage}
              alt=""
              aria-hidden="true"
              className="no-callout absolute inset-0 h-full w-full select-none object-contain"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />

            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-black/35 to-transparent px-8 pb-8 pt-16 text-center">
              <p className="font-display text-lg italic text-white drop-shadow">{areaName}</p>
              <button
                type="button"
                onClick={handleUnlock}
                className="flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--color-rose)] px-6 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-transform active:scale-95"
              >
                <LockOpen size={16} />
                {t("garden.unlockGate.cta")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
