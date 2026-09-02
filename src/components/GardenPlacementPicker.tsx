import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { GardenCanvas } from "./GardenCanvas";
import { useGarden } from "../store/GardenProvider";
import { VASE_STYLES, DECORATION_STYLES } from "../types";
import type { BouquetWithFlowers, DecorationStyle, GardenPlacement, VaseStyle } from "../types";

interface GardenPlacementPickerProps {
  bouquetId: string;
  onPlaced: () => void;
  onSkip: () => void;
}

export function GardenPlacementPicker({ bouquetId, onPlaced, onSkip }: GardenPlacementPickerProps) {
  const { gardenAreas, bouquets, ensureAreaWithFreeSlot, placeBouquet, swapPlacements, removePlacement } =
    useGarden();
  // placements are derived per-bouquet in context; rebuild a flat list here.
  const placements: GardenPlacement[] = useMemo(
    () => bouquets.filter((b) => b.placement).map((b) => b.placement as GardenPlacement),
    [bouquets]
  );

  const [areaIndex, setAreaIndex] = useState(0);
  const [selectedArea, setSelectedArea] = useState<string | null>(gardenAreas[0]?.id ?? null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [vaseStyle, setVaseStyle] = useState<VaseStyle>("clay-pot");
  const [decorationStyle, setDecorationStyle] = useState<DecorationStyle>("none");
  const [conflict, setConflict] = useState<{ slotId: string; areaId: string; occupantId: string; occupantName: string } | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bouquetsById = useMemo(() => new Map<string, BouquetWithFlowers>(bouquets.map((b) => [b.id, b])), [bouquets]);
  const areas = gardenAreas;
  const activeArea = areas[areaIndex];

  async function handleAddArea() {
    const { area } = await ensureAreaWithFreeSlot();
    if (!areas.find((a) => a.id === area.id)) {
      // new area was created; move view there
      setAreaIndex(areas.length);
    }
    setSelectedArea(area.id);
  }

  function handleSelectSlot(slotId: string) {
    const occupant = placements.find((p) => p.gardenAreaId === activeArea.id && p.slotId === slotId);
    if (occupant && occupant.bouquetId !== bouquetId) {
      const occupantBouquet = bouquetsById.get(occupant.bouquetId);
      setConflict({
        slotId,
        areaId: activeArea.id,
        occupantId: occupant.bouquetId,
        occupantName: occupantBouquet?.name ?? "this bouquet",
      });
      return;
    }
    setSelectedArea(activeArea.id);
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
      setError(`That spot was just taken by ${result.occupiedByName}. Please choose another.`);
    }
  }

  async function handleSwap() {
    if (!conflict) return;
    setIsSaving(true);
    // Place current bouquet's flower into a temporary free slot isn't needed:
    // swap only works if the current bouquet already has a placement elsewhere.
    const current = bouquetsById.get(bouquetId);
    if (current?.placement) {
      await swapPlacements(bouquetId, conflict.occupantId);
      setIsSaving(false);
      onPlaced();
    } else {
      // Current bouquet isn't placed yet: move occupant out to Collection, then place here.
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

  if (!activeArea) {
    return (
      <div className="px-5 py-8 text-center text-sm text-[var(--color-muted)]">Preparing your garden…</div>
    );
  }

  return (
    <div className="px-5 pb-4">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg italic text-[var(--color-muted)]">{activeArea.name}</p>
        <div className="flex items-center gap-2">
          {areas.map((a, i) => (
            <button
              key={a.id}
              onClick={() => setAreaIndex(i)}
              className={`h-2 w-2 rounded-full ${i === areaIndex ? "bg-[var(--color-rose)]" : "bg-[var(--color-line)]"}`}
              aria-label={`Show ${a.name}`}
            />
          ))}
          <button
            type="button"
            onClick={handleAddArea}
            aria-label="Add a new garden corner"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-blush)] text-[var(--color-rose)]"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="mt-3">
        <GardenCanvas
          placements={placements.filter((p) => p.gardenAreaId === activeArea.id)}
          bouquetsById={bouquetsById}
          selectableSlotId={selectedArea === activeArea.id ? selectedSlot : null}
          onSelectSlot={handleSelectSlot}
        />
      </div>

      {conflict && (
        <div className="mt-4 rounded-[20px] border border-[var(--color-line)] bg-white p-4">
          <p className="text-sm text-[var(--color-ink)]">
            <strong>{conflict.occupantName}</strong> is already growing here. What would you like to do?
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleSwap}
              className="min-h-[44px] rounded-full bg-[var(--color-ink)] text-sm font-semibold text-white active:scale-95"
            >
              Swap places
            </button>
            <button
              type="button"
              onClick={handleMoveOccupantToCollection}
              className="min-h-[44px] rounded-full border border-[var(--color-line)] text-sm font-medium text-[var(--color-ink)] active:scale-95"
            >
              Move {conflict.occupantName} to Collection
            </button>
            <button
              type="button"
              onClick={() => setConflict(null)}
              className="min-h-[44px] rounded-full text-sm font-medium text-[var(--color-muted)]"
            >
              Choose another spot
            </button>
          </div>
        </div>
      )}

      <div className="mt-5">
        <p className="mb-2 text-sm font-medium text-[var(--color-ink)]">Choose a vase</p>
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
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium text-[var(--color-ink)]">Add a decoration</p>
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
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-[var(--color-rose)]">{error}</p>}

      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          disabled={!selectedSlot || isSaving}
          onClick={() => selectedArea && selectedSlot && confirmPlacement(selectedArea, selectedSlot)}
          className="min-h-[44px] w-full rounded-full bg-[var(--color-rose)] text-sm font-semibold text-white shadow-md shadow-[var(--color-rose)]/30 transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSaving ? "Planting…" : "Plant it here"}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="min-h-[44px] w-full rounded-full text-sm font-medium text-[var(--color-muted)]"
        >
          Skip for now, place it later
        </button>
      </div>
    </div>
  );
}
