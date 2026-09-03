import { useMemo, useState } from "react";
import { GardenEditToolbar } from "./GardenEditToolbar";
import { GardenEditCanvas } from "./GardenEditCanvas";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { useGarden } from "../store/GardenProvider";
import { useToast } from "../hooks/useToast";
import { useLanguage } from "../i18n/LanguageProvider";
import type { BouquetWithFlowers } from "../types";

interface GardenEditViewProps {
  targetBouquet: BouquetWithFlowers;
  onExit: () => void;
}

/**
 * Scope note: repositioning is supported within the bouquet's current garden
 * area only (or the first area, for a not-yet-placed bouquet). Dragging a
 * bouquet between different garden corners isn't supported in this version —
 * use the placement picker's "swap" flow for that instead.
 */
export function GardenEditView({ targetBouquet, onExit }: GardenEditViewProps) {
  const { bouquets, gardenAreas, placeBouquet } = useGarden();
  const { show } = useToast();
  const { t } = useLanguage();

  const initialSlotId = targetBouquet.placement?.slotId ?? null;
  const activeAreaId = targetBouquet.placement?.gardenAreaId ?? gardenAreas[0]?.id ?? null;
  const activeArea = gardenAreas.find((a) => a.id === activeAreaId);

  const [draftSlotId, setDraftSlotId] = useState<string | null>(initialSlotId);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  const bouquetsById = useMemo(() => new Map(bouquets.map((b) => [b.id, b])), [bouquets]);
  const otherPlacements = useMemo(
    () =>
      bouquets
        .filter((b) => b.id !== targetBouquet.id && b.placement && b.placement.gardenAreaId === activeAreaId)
        .map((b) => b.placement!),
    [bouquets, targetBouquet.id, activeAreaId]
  );

  const hasChanges = draftSlotId !== initialSlotId;

  function handleCancel() {
    if (hasChanges) {
      setConfirmDiscardOpen(true);
    } else {
      onExit();
    }
  }

  async function handleDone() {
    if (!hasChanges || !draftSlotId || !activeAreaId) {
      onExit();
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    const result = await placeBouquet({
      bouquetId: targetBouquet.id,
      gardenAreaId: activeAreaId,
      slotId: draftSlotId,
      vaseStyle: targetBouquet.placement?.vaseStyle,
      decorationStyle: targetBouquet.placement?.decorationStyle,
    });
    setIsSaving(false);
    if (result.ok) {
      show(t("gardenEdit.saved"));
      onExit();
    } else {
      setSaveError(t("gardenEdit.saveFailed"));
    }
  }

  if (!activeArea) {
    return (
      <div className="flex h-full flex-col">
        <GardenEditToolbar onCancel={onExit} onDone={onExit} isSaving={false} />
        <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-[var(--color-muted)]">
          {t("gardenEdit.saveFailed")}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <GardenEditToolbar onCancel={handleCancel} onDone={handleDone} isSaving={isSaving} />
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-4">
        <p className="mb-3 font-display text-sm italic text-[var(--color-muted)]">{activeArea.name}</p>
        {saveError && <p className="mb-3 text-sm text-[var(--color-rose)]">{saveError}</p>}
        <GardenEditCanvas
          otherPlacements={otherPlacements}
          bouquetsById={bouquetsById}
          targetBouquet={targetBouquet}
          draftSlotId={draftSlotId}
          onDraftChange={setDraftSlotId}
          onConflict={() => show(t("gardenEdit.slotOccupied"), "info")}
        />
      </div>

      <ConfirmationDialog
        open={confirmDiscardOpen}
        title={t("gardenEdit.discardTitle")}
        description={t("gardenEdit.discardBody")}
        confirmLabel={t("gardenEdit.discardConfirm")}
        destructive
        onConfirm={() => {
          setConfirmDiscardOpen(false);
          onExit();
        }}
        onCancel={() => setConfirmDiscardOpen(false)}
      />
    </div>
  );
}
