import { AnimatePresence, motion } from "framer-motion";
import { X, Heart, ArrowRight } from "lucide-react";
import { useLanguage } from "../i18n/LanguageProvider";
import { useHideChromeWhen } from "../hooks/useChromeVisibility";
import type { BouquetWithFlowers } from "../types";

interface BouquetQuickViewProps {
  bouquet: BouquetWithFlowers | null;
  onClose: () => void;
  onOpenDetail: () => void;
  onToggleFavorite: () => void;
}

export function BouquetQuickView({ bouquet, onClose, onOpenDetail, onToggleFavorite }: BouquetQuickViewProps) {
  const { t } = useLanguage();
  useHideChromeWhen(Boolean(bouquet), "bouquet-quick-view");
  return (
    <AnimatePresence>
      {bouquet && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/30 md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-[420px] overflow-hidden rounded-t-[32px] bg-white md:rounded-[32px]"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <img
                src={bouquet.imageUrl}
                alt={bouquet.name}
                className="h-full w-full object-cover object-center"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label={t("common.close")}
                className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[var(--color-ink)] shadow-sm backdrop-blur-sm"
              >
                <X size={18} />
              </button>
              <button
                type="button"
                onClick={onToggleFavorite}
                aria-label={bouquet.isFavorite ? t("bouquet.removeFromFavorites") : t("bouquet.addToFavorites")}
                className="absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[var(--color-rose)] shadow-sm backdrop-blur-sm"
              >
                <Heart size={16} fill={bouquet.isFavorite ? "currentColor" : "none"} />
              </button>
            </div>
            <div className="p-5">
              <h3 className="font-display text-xl text-[var(--color-ink)]">{bouquet.name}</h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {bouquet.flowers.map((f) => f.commonName).join(", ") || t("bouquet.noFlowersRecorded")}
              </p>
              {bouquet.overallMeaning && (
                <p className="mt-3 font-display text-[15px] italic leading-relaxed text-[var(--color-rose)]">
                  "{bouquet.overallMeaning}"
                </p>
              )}
              <button
                type="button"
                onClick={onOpenDetail}
                className="mt-5 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] text-sm font-semibold text-white transition-transform active:scale-95"
              >
                {t("bouquet.openJournal")} <ArrowRight size={15} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
