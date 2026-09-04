import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GardenHeader } from "../components/GardenHeader";
import { BouquetCounter } from "../components/BouquetCounter";
import { GardenAreaSwitcher } from "../components/GardenAreaSwitcher";
import { GardenSkeleton } from "../components/LoadingSkeleton";
import { BouquetQuickView } from "../components/BouquetQuickView";
import { GardenEditView } from "../components/GardenEditView";
import { GardenUnlockCelebration } from "../components/GardenUnlockCelebration";
import { useGarden } from "../store/GardenProvider";
import { useGardenEditMode } from "../hooks/useGardenEditMode";
import { useChromeVisibility } from "../hooks/useChromeVisibility";

export function GardenPage() {
  const {
    loading,
    profile,
    bouquets,
    gardenAreas,
    totalCount,
    speciesCount,
    toggleFavorite,
    getBouquet,
    newlyUnlockedArea,
    dismissUnlockNotice,
  } = useGarden();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const gardenEdit = useGardenEditMode();
  const { isChromeHidden } = useChromeVisibility();
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

  // The unlock-celebration popup should only ever appear once the person is
  // back on this plain garden view with nothing else open — not stacked on
  // top of the add-bouquet sheet's own "saved!" screen, not while in Garden
  // Edit Mode. `newlyUnlockedArea` flips true the instant the area is
  // filled (still deep inside the add flow), so showing it is *latched*
  // behind a one-way effect rather than a live `!isAnythingOpen` check:
  // once the celebration itself is shown it also asks to hide chrome (like
  // every other popup), which would otherwise immediately flip the "is
  // anything open" check back to true and hide the popup that very same
  // render — a live check would fight itself in an infinite loop.
  const [showCelebration, setShowCelebration] = useState(false);
  const [focusAreaId, setFocusAreaId] = useState<string | null>(null);
  const anyOtherOverlayOpen = isChromeHidden || isEnteringEditMode;

  useEffect(() => {
    if (newlyUnlockedArea && !anyOtherOverlayOpen) {
      setShowCelebration(true);
    }
    if (!newlyUnlockedArea) {
      setShowCelebration(false);
    }
  }, [newlyUnlockedArea, anyOtherOverlayOpen]);

  function handleCelebrationClose() {
    const unlockedAreaId = newlyUnlockedArea?.id ?? null;
    setShowCelebration(false);
    dismissUnlockNotice();
    // Scroll the garden switcher over to the newly-ready secret garden so
    // "Đến khu vườn" actually takes the person there instead of just
    // closing the popup and leaving them wherever they happened to be.
    if (unlockedAreaId) setFocusAreaId(unlockedAreaId);
  }

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

      <GardenAreaSwitcher
        areas={gardenAreas}
        placements={placements}
        bouquetsById={bouquetsById}
        onOpenBouquet={setQuickViewId}
        focusAreaId={focusAreaId}
        onFocusHandled={() => setFocusAreaId(null)}
        showEmptyOverlay={totalCount === 0}
      />

      <BouquetQuickView
        bouquet={quickViewBouquet}
        onClose={() => setQuickViewId(null)}
        onOpenDetail={() => {
          if (quickViewId) navigate(`/bouquet/${quickViewId}`);
          setQuickViewId(null);
        }}
        onToggleFavorite={() => quickViewId && toggleFavorite(quickViewId)}
      />

      <GardenUnlockCelebration area={showCelebration ? newlyUnlockedArea : null} onClose={handleCelebrationClose} />
    </div>
  );
}
