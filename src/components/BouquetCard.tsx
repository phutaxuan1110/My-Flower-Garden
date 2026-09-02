import { Heart, MapPin } from "lucide-react";
import { BouquetFrame } from "./BouquetFrame";
import { useLanguage } from "../i18n/LanguageProvider";
import type { BouquetWithFlowers } from "../types";

interface BouquetCardProps {
  bouquet: BouquetWithFlowers;
  onOpen: () => void;
  onToggleFavorite: () => void;
}

export function BouquetCard({ bouquet, onOpen, onToggleFavorite }: BouquetCardProps) {
  const { t } = useLanguage();
  const speciesLabel = bouquet.flowers
    .slice(0, 2)
    .map((f) => f.commonName)
    .join(", ");

  return (
    <div className="group relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-sm shadow-[var(--color-rose)]/5">
      <button type="button" onClick={onOpen} className="block w-full text-left" aria-label={bouquet.name}>
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--color-blush)] p-3">
          <BouquetFrame
            imageUrl={bouquet.imageUrl}
            frameStyle={bouquet.frameStyle}
            alt={bouquet.name}
            className="h-full w-full transition-transform duration-500 group-active:scale-105"
          />
          {bouquet.placement ? (
            <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-[var(--color-ink)]">
              <MapPin size={11} strokeWidth={2} /> {t("collection.inGarden")}
            </span>
          ) : (
            <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-[var(--color-muted)]">
              {t("collection.notPlaced")}
            </span>
          )}
        </div>
        <div className="p-3">
          <p className="truncate font-display text-[15px] text-[var(--color-ink)]">{bouquet.name}</p>
          <p className="mt-0.5 truncate text-xs text-[var(--color-muted)]">
            {speciesLabel || t("collection.noSpeciesYet")} ·{" "}
            {new Date(bouquet.receivedDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={onToggleFavorite}
        aria-pressed={bouquet.isFavorite}
        aria-label={bouquet.isFavorite ? t("bouquet.removeFromFavorites") : t("bouquet.addToFavorites")}
        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[var(--color-rose)] shadow-sm transition-transform active:scale-90"
      >
        <Heart size={16} strokeWidth={1.75} fill={bouquet.isFavorite ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
