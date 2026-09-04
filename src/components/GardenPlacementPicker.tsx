import { useEffect, useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { GardenCanvas } from "./GardenCanvas";
import { generateAreaName } from "../lib/gardenNaming";
import { themeForAreaOrder } from "../lib/gardenLayout";
import { useGarden } from "../store/GardenProvider";
import { useLanguage } from "../i18n/LanguageProvider";
import { VASE_STYLES, DECORATION_STYLES } from "../types";
import type { BouquetWithFlowers, DecorationStyle, GardenArea, GardenPlacement, VaseStyle } from "../types";
import type { TranslationKey } from "../i18n/translations";

interface GardenPlacementPickerProps {
  bouquetId: string;
  onPlaced: () => void;
  onSkip: () => void;
}

const VASE_LABEL_KEYS: Record<VaseStyle, TranslationKey> = {
  "clay-pot": "vase.clayPot",
  "glass-vase": "vase.glassVase",
  "woven-basket": "vase.wovenBasket",
  "tin-bucket": "vase.tinBucket",
};

const DECORATION_LABEL_KEYS: Record<DecorationStyle, TranslationKey> = {
  none: "decoration.none",
  sparkle: "decoration.sparkle",
  butterflies: "decoration.butterflies",
  "fairy-lights": "decoration.fairyLights",
  ribbon: "decoration.ribbon",
};

export function GardenPlacementPicker({ bouquetId, onPlaced, onSkip }: GardenPlacementPickerProps) {
  const { t } = useLanguage();
  const { bouquets, ensureAreaWithFreeSlot, placeBouquet, swapPlacements, removePlacement } = useGarden();
  const placements: GardenPlacement[] = useMemo(
    () => bouquets.filter((b) => b.placement).map((b) => b.placement as GardenPlacement),
    [bouquets]
  );

  // Which garden area a bouquet lands in is no longer something the person
  // chooses here: areas must fill up strictly in order (see
  // GardenProvider.ensureAreaWithFreeSlot / gardenLock.ts), so there is only
  // ever exactly one area that can legally receive a new bouquet — the
  // current, unlocked, not-yet-full one. This resolves it automatically
  // instead of offering a switcher + "create a new area" button that would
  // otherwise let someone jump ahead of a locked map.
  const [activeArea, setActiveArea] = useState<GardenArea | null>(null);
  const [blockedByLock, setBlockedByLock] = useState<{ areaName: string } | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [vaseStyle, setVaseStyle] = useState<VaseStyle>("clay-pot");
  const [decorationStyle, setDecorationStyle] = useState<DecorationStyle>("none");
  const [conflict, setConflict] = useState<{ slotId: string; areaId: string; occupantId: string; occupantName: string } | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ensureAreaWithFreeSlot().then((result) => {
      if (cancelled) return;
      if (result.ok) setActiveArea(result.area);
      else setBlockedByLock({ areaName: result.areaName });
    });
    return () => {
      cancelled = true;
    };
    // Only resolve once when the picker opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bouquetsById = useMemo(() => new Map<string, BouquetWithFlowers>(bouquets.map((b) => [b.id, b])), [bouquets]);

  function handleSelectSlot(slotId: string) {
    if (!activeArea) return;
    const occupant = placements.find((p) => p.gardenAreaId === activeArea.id && p.slotId === slotId);
    if (occupant && occupant.bouquetId !== bouquetId) {
      const occupantBouquet = bouquetsById.get(occupant.bouquetId);
      setConflict({
        slotId,
        areaId: activeArea.id,
        occupantId: occupant.bouquetId,
        occupantName: occupantBouquet?.name ?? "",
      });
      return;
    }
    setSelectedSlot(slotId);
    setError(null);
  }

  async function confirmPlacement(areaId: string, slotId: string) {
    setIsSaving(true);
    setError(null);
    const result = await placeBouquet({ bouquetId, gardenAreaId: areaId, slotId, vaseStyle, decorationStyle });
    setIsSaving(false);
    if (result.ok) {
      onPlaced();
    } else {
      setError(`${t("add.placement.takenError")} ${result.occupiedByName}. ${t("add.placement.chooseAnotherError")}`);
    }
  }

  async function handleSwap() {
    if (!conflict) return;
    setIsSaving(true);
    const current = bouquetsById.get(bouquetId);
    if (current?.placement) {
      await swapPlacements(bouquetId, conflict.occupantId);
      setIsSaving(false);
      onPlaced();
    } else {
      await removePlacement(conflict.occupantId);
      await confirmPlacement(conflict.areaId, conflict.slotId);
    }
    setConflict(null);
  }

  async function handleMoveOccupantToCollection() {
    if (!conflict) return;
    setIsSaving(true);
    await removePlacement(conflict.occupantId);
    await confirmPlacement(conflict.areaId, conflict.slotId);
    setConflict(null);
  }

  if (blockedByLock) {
    return (
      <div className="flex flex-col items-center gap-4 px-8 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-blush)] text-[var(--color-rose)]">
          <Lock size={24} />
        </div>
        <p className="font-display text-lg text-[var(--color-ink)]">{t("add.placement.locked.title")}</p>
        <p className="text-sm leading-relaxed text-[var(--color-muted)]">
          {t("add.placement.locked.body")} <strong className="text-[var(--color-ink)]">{blockedByLock.areaName}</strong>{" "}
          {t("add.placement.locked.suffix")}
        </p>
        <button
          type="button"
          onClick={onSkip}
          className="mt-2 min-h-[44px] w-full rounded-full bg-[var(--color-ink)] text-sm font-semibold text-white active:scale-95"
        >
          {t("add.placement.locked.cta")}
        </button>
      </div>
    );
  }

  if (!activeArea) {
    return <div className="px-5 py-8 text-center text-sm text-[var(--color-muted)]">…</div>;
  }

  return (
    <div className="px-5 pb-4">
      <p className="font-display text-lg italic text-[var(--color-muted)]">{generateAreaName(activeArea.order)}</p>

      <div className="mt-3">
        <GardenCanvas
          placements={placements.filter((p) => p.gardenAreaId === activeArea.id)}
          bouquetsById={bouquetsById}
          theme={themeForAreaOrder(activeArea.order)}
          selectableSlotId={selectedSlot}
          onSelectSlot={handleSelectSlot}
        />
      </div>

      {conflict && (
        <div className="mt-4 rounded-[20px] border border-[var(--color-line)] bg-white p-4">
          <p className="text-sm text-[var(--color-ink)]">
            <strong>{conflict.occupantName}</strong> {t("add.placement.conflictQuestion")}
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleSwap}
              className="min-h-[44px] rounded-full bg-[var(--color-ink)] text-sm font-semibold text-white active:scale-95"
            >
              {t("add.placement.swap")}
            </button>
            <button
              type="button"
              onClick={handleMoveOccupantToCollection}
              className="min-h-[44px] rounded-full border border-[var(--color-line)] text-sm font-medium text-[var(--color-ink)] active:scale-95"
            >
              {t("add.placement.moveToCollection")} {conflict.occupantName} {t("add.placement.moveToCollectionSuffix")}
            </button>
            <button
              type="button"
              onClick={() => setConflict(null)}
              className="min-h-[44px] rounded-full text-sm font-medium text-[var(--color-muted)]"
            >
              {t("add.placement.chooseAnother")}
            </button>
          </div>
        </div>
      )}

      <div className="mt-5">
        <p className="mb-2 text-sm font-medium text-[var(--color-ink)]">{t("add.placement.chooseVase")}</p>
        <div className="flex flex-wrap gap-2">
          {VASE_STYLES.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVaseStyle(v.id)}
              className={`min-h-[44px] rounded-full border px-4 text-sm transition-colors ${
                vaseStyle === v.id
                  ? "border-[var(--color-rose)] bg-[var(--color-rose)]/10 text-[var(--color-rose)]"
                  : "border-[var(--color-line)] text-[var(--color-ink)]"
              }`}
            >
              {t(VASE_LABEL_KEYS[v.id])}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium text-[var(--color-ink)]">{t("add.placement.addDecoration")}</p>
        <div className="flex flex-wrap gap-2">
          {DECORATION_STYLES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDecorationStyle(d.id)}
              className={`min-h-[44px] rounded-full border px-4 text-sm transition-colors ${
                decorationStyle === d.id
                  ? "border-[var(--color-rose)] bg-[var(--color-rose)]/10 text-[var(--color-rose)]"
                  : "border-[var(--color-line)] text-[var(--color-ink)]"
              }`}
            >
              {t(DECORATION_LABEL_KEYS[d.id])}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-[var(--color-rose)]">{error}</p>}

      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          disabled={!selectedSlot || isSaving}
          onClick={() => activeArea && selectedSlot && confirmPlacement(activeArea.id, selectedSlot)}
          className="min-h-[44px] w-full rounded-full bg-[var(--color-rose)] text-sm font-semibold text-white shadow-md shadow-[var(--color-rose)]/30 transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSaving ? t("add.placement.planting") : t("add.placement.plantHere")}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="min-h-[44px] w-full rounded-full text-sm font-medium text-[var(--color-muted)]"
        >
          {t("add.placement.skip")}
        </button>
      </div>
    </div>
  );
}
