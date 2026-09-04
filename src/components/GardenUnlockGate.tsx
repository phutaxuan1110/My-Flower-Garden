import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, LockOpen, Droplets } from "lucide-react";
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
  /** Called once the water animation finishes and the area is marked opened. */
  onUnlocked: () => void;
}

// Total time from tap to the gate fully clearing, in ms. Kept in one place
// so the water sweep's own transition durations and the "reveal" callback
// stay in sync.
const UNLOCK_ANIMATION_MS = 1500;

/**
 * The gate for a garden area that already exists (the person just finished
 * filling the one before it) but hasn't been manually opened yet. Tapping
 * "Mở khoá" plays a short water-sweep animation over the locked-gate
 * artwork, then reveals the real, interactive garden underneath and
 * persists that this area has been opened (see openedAreasFlag.ts) so it
 * stays open from then on.
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
  const [unlocking, setUnlocking] = useState(false);
  const [revealed, setRevealed] = useState(false);

  function handleUnlock() {
    if (unlocking || revealed) return;
    setUnlocking(true);
    window.setTimeout(() => {
      markAreaOpened(areaId);
      setRevealed(true);
      onUnlocked();
    }, UNLOCK_ANIMATION_MS);
  }

  return (
    <div className="relative aspect-[572/1024] w-full overflow-hidden rounded-[32px] border border-[var(--color-line)] bg-[var(--color-primary)]">
      {/* The real garden sits underneath from the start so the wave has
          something to "reveal" rather than the canvas popping in after. */}
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
            transition={{ duration: 0.35 }}
          >
            <img
              src={lockedGateImage}
              alt=""
              aria-hidden="true"
              className="no-callout absolute inset-0 h-full w-full select-none object-contain"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />

            {!unlocking && (
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-black/35 to-transparent px-8 pb-8 pt-16 text-center">
                <p className="font-display text-lg italic text-white drop-shadow">{areaName}</p>
                <button
                  type="button"
                  onClick={handleUnlock}
                  className="flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--color-rose)] px-6 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-transform active:scale-95"
                >
                  <Lock size={16} />
                  {t("garden.unlockGate.cta")}
                </button>
              </div>
            )}

            {/* Water sweep: a few staggered, rounded-bottom bands wash down
                the full height of the card, washing the gate away. */}
            {unlocking && (
              <>
                <motion.div
                  className="absolute inset-x-0 top-0 h-[60%] rounded-b-[50%] bg-gradient-to-b from-sky-100/95 via-sky-200/90 to-sky-300/85"
                  initial={{ y: "-110%" }}
                  animate={{ y: "140%" }}
                  transition={{ duration: 1.05, ease: "easeIn" }}
                />
                <motion.div
                  className="absolute inset-x-0 top-0 h-[45%] rounded-b-[50%] bg-gradient-to-b from-sky-200/80 via-sky-300/70 to-sky-400/60"
                  initial={{ y: "-130%" }}
                  animate={{ y: "160%" }}
                  transition={{ duration: 1.05, ease: "easeIn", delay: 0.12 }}
                />
                <motion.div
                  className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--color-rose)] shadow-lg"
                  initial={{ scale: 0.8, opacity: 1, rotate: 0 }}
                  animate={{ scale: [0.8, 1.15, 1], opacity: [1, 1, 0], rotate: [0, -18, -18] }}
                  transition={{ duration: 0.9, times: [0, 0.4, 1] }}
                >
                  <LockOpen size={26} />
                </motion.div>
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute text-sky-300"
                    style={{ left: `${20 + i * 18}%`, top: "55%" }}
                    initial={{ y: 0, opacity: 0 }}
                    animate={{ y: -60, opacity: [0, 1, 0] }}
                    transition={{ duration: 0.9, delay: 0.15 + i * 0.08, ease: "easeOut" }}
                  >
                    <Droplets size={14 + (i % 2) * 6} />
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
