import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useLanguage } from "../i18n/LanguageProvider";
import { generateAreaName } from "../lib/gardenNaming";
import type { GardenArea } from "../types";

interface GardenUnlockCelebrationProps {
  area: GardenArea | null;
  onClose: () => void;
}

/**
 * One-time congratulations popup shown right after a garden area is
 * completely filled and the next one unlocks. Unlike the locked preview
 * card, this is exactly where the new area's real (Greek-mythology-inspired)
 * name gets revealed for the first time.
 */
export function GardenUnlockCelebration({ area, onClose }: GardenUnlockCelebrationProps) {
  const { t } = useLanguage();
  return (
    <AnimatePresence>
      {area && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/30 p-4 md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="unlock-title"
        >
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-sm rounded-[28px] bg-white p-6 text-center shadow-xl"
          >
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-blush)] text-[var(--color-rose)]">
              <Sparkles size={28} />
            </div>
            <h3 id="unlock-title" className="font-display text-xl text-[var(--color-ink)]">
              {t("garden.unlock.title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              {t("garden.unlock.body")}{" "}
              <strong className="text-[var(--color-ink)]">{generateAreaName(area.order)}</strong>
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 min-h-[44px] w-full rounded-full bg-[var(--color-rose)] px-4 text-sm font-semibold text-white shadow-md shadow-[var(--color-rose)]/30 transition-transform active:scale-95"
            >
              {t("garden.unlock.cta")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
