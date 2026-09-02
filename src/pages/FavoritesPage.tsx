import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { BouquetCard } from "../components/BouquetCard";
import { CollectionGridSkeleton } from "../components/LoadingSkeleton";
import { useGarden } from "../store/GardenProvider";
import { useLanguage } from "../i18n/LanguageProvider";

export function FavoritesPage() {
  const { loading, favoriteBouquets, toggleFavorite } = useGarden();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-6">
      <h1 className="font-display text-2xl text-[var(--color-ink)]">
        {t("favorites.title")} <em className="italic text-[var(--color-rose)]">{t("favorites.titleEm")}</em>
      </h1>
      <div className="mt-5">
        {loading ? (
          <CollectionGridSkeleton count={4} />
        ) : favoriteBouquets.length === 0 ? (
          <div className="mt-10 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-blush)] text-[var(--color-rose)]">
              <Heart size={22} strokeWidth={1.5} />
            </div>
            <p className="mt-4 max-w-[26ch] text-sm leading-relaxed text-[var(--color-muted)]">
              {t("favorites.empty")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {favoriteBouquets.map((b) => (
              <BouquetCard
                key={b.id}
                bouquet={b}
                onOpen={() => navigate(`/bouquet/${b.id}`)}
                onToggleFavorite={() => toggleFavorite(b.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
