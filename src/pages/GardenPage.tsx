import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookHeart } from "lucide-react";
import { GardenHeader } from "../components/GardenHeader";
import { BouquetCounter } from "../components/BouquetCounter";
import { GardenAreaSwitcher } from "../components/GardenAreaSwitcher";
import { EmptyGardenState } from "../components/EmptyGardenState";
import { GardenSkeleton } from "../components/LoadingSkeleton";
import { BouquetQuickView } from "../components/BouquetQuickView";
import { GardenEditView } from "../components/GardenEditView";
import { useGarden } from "../store/GardenProvider";
import { useLanguage } from "../i18n/LanguageProvider";
import { useGardenEditMode } from "../hooks/useGardenEditMode";

export function GardenPage() {
  const { loading, profile, bouquets, gardenAreas, totalCount, speciesCount, toggleFavorite, getBouquet } =
    useGarden();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const gardenEdit = useGardenEditMode();
  const [quickViewId, setQuickViewId] = useState<string | null>(null);

  const bouquetsById = useMemo(() => new Map(bouquets.map((b) => [b.id, b])), [bouquets]);
  const placements = useMemo(() => bouquets.filter((b) => b.placement).map((b) => b.placement!), [bouquets]);
  const quickViewBouquet = quickViewId ? bouquetsById.get(quickViewId) ?? null : null;

  // Deep link from Bouquet Detail's "Chỉnh sửa bó hoa": /garden?editBouquet=<id>
  useEffect(() => {
    const editId = searchParams.get("editBouquet");
    if (editId && !gardenEdit.isActive) {
      gardenEdit.enter(editId);
      searchParams.delete("editBouquet");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (gardenEdit.isActive) {
    const targetBouquet = gardenEdit.targetBouquetId ? getBouquet(gardenEdit.targetBouquetId) : undefined;
    if (!targetBouquet) {
      // Bouquet vanished (e.g. deleted in another tab) — leave edit mode safely.
      gardenEdit.exit();
      return null;
    }
    return <GardenEditView targetBouquet={targetBouquet} onExit={gardenEdit.exit} />;
  }

  if (loading) {
    return (
      <div className="pt-2">
        <GardenSkeleton />
      </div>
    );
  }

  return (
    <div className="pb-4">
      <GardenHeader displayName={profile?.displayName ?? "Friend"} gardenName={profile?.gardenName ?? "My Flower Garden"} />
      <BouquetCounter totalCount={totalCount} speciesCount={speciesCount} />

      {totalCount === 0 ? (
        <EmptyGardenState />
      ) : (
        <>
          <GardenAreaSwitcher
            areas={gardenAreas}
            placements={placements}
            bouquetsById={bouquetsById}
            onOpenBouquet={setQuickViewId}
          />
          <div className="mx-5 mt-6 flex items-center justify-between rounded-[20px] border border-[var(--color-line)] bg-white/70 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
              <BookHeart size={16} className="text-[var(--color-rose)]" strokeWidth={1.75} />
              {t("garden.collectionBanner")}
            </div>
            <button
              type="button"
              onClick={() => navigate("/collection")}
              className="min-h-[44px] shrink-0 rounded-full bg-[var(--color-blush)] px-3 text-xs font-semibold text-[var(--color-rose)]"
            >
              {t("garden.viewAll")}
            </button>
          </div>
        </>
      )}

      <BouquetQuickView
        bouquet={quickViewBouquet}
        onClose={() => setQuickViewId(null)}
        onOpenDetail={() => {
          if (quickViewId) navigate(`/bouquet/${quickViewId}`);
          setQuickViewId(null);
        }}
        onToggleFavorite={() => quickViewId && toggleFavorite(quickViewId)}
      />
    </div>
  );
}
