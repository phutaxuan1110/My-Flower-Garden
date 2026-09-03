import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GardenHeader } from "../components/GardenHeader";
import { BouquetCounter } from "../components/BouquetCounter";
import { GardenAreaSwitcher } from "../components/GardenAreaSwitcher";
import { EmptyGardenState } from "../components/EmptyGardenState";
import { GardenSkeleton } from "../components/LoadingSkeleton";
import { BouquetQuickView } from "../components/BouquetQuickView";
import { GardenEditView } from "../components/GardenEditView";
import { useGarden } from "../store/GardenProvider";
import { useGardenEditMode } from "../hooks/useGardenEditMode";

export function GardenPage() {
  const { loading, profile, bouquets, gardenAreas, totalCount, speciesCount, toggleFavorite, getBouquet } =
    useGarden();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const gardenEdit = useGardenEditMode();
  const [quickViewId, setQuickViewId] = useState<string | null>(null);

  const bouquetsById = useMemo(() => new Map(bouquets.map((b) => [b.id, b])), [bouquets]);
  const placements = useMemo(() => bouquets.filter((b) => b.placement).map((b) => b.placement!), [bouquets]);
  const quickViewBouquet = quickViewId ? bouquetsById.get(quickViewId) ?? null : null;

  // Deep link from Bouquet Detail's "Chỉnh sửa bó hoa": /garden?editBouquet=<id>
  //
  // `urlEditBouquetId` is read directly from the URL on every render (not
  // only inside the effect below) so Edit Mode can render on the very first
  // paint. Before this, the effect calling `gardenEdit.enter()` only ran
  // *after* the first commit, so the normal Garden (with GardenHeader,
  // BouquetCounter, etc.) would render for one frame before flipping to
  // GardenEditView — a content flash that mirrored the bottom-nav flash
  // fixed in MobileAppShell. The effect is still needed to move this into
  // durable context state (`gardenEdit.isActive`) and strip the query
  // param, but it no longer gates the *first* paint.
  const urlEditBouquetId = searchParams.get("editBouquet");
  const isEnteringEditMode = gardenEdit.isActive || Boolean(urlEditBouquetId);

  useEffect(() => {
    if (urlEditBouquetId && !gardenEdit.isActive) {
      gardenEdit.enter(urlEditBouquetId);
      searchParams.delete("editBouquet");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (isEnteringEditMode) {
    const targetId = gardenEdit.isActive ? gardenEdit.targetBouquetId : urlEditBouquetId;
    const targetBouquet = targetId ? getBouquet(targetId) : undefined;
    if (targetBouquet) {
      return <GardenEditView targetBouquet={targetBouquet} onExit={gardenEdit.exit} />;
    }
    if (gardenEdit.isActive) {
      // Bouquet vanished (e.g. deleted in another tab) after Edit Mode was
      // already officially active — leave edit mode safely.
      gardenEdit.exit();
      return null;
    }
    // Otherwise we're in the brief "URL says editBouquet, but context hasn't
    // caught up and data isn't loaded/found yet" window — fall through to
    // the loading/normal render below. MobileAppShell already hides the
    // bottom nav purely from the URL, so nothing flashes either way.
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
        <GardenAreaSwitcher
          areas={gardenAreas}
          placements={placements}
          bouquetsById={bouquetsById}
          onOpenBouquet={setQuickViewId}
        />
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
