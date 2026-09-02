import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, MapPin, Pencil, Sparkles, Trash2 } from "lucide-react";
import { useGarden } from "../store/GardenProvider";
import { useToast } from "../hooks/useToast";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { GardenPlacementPicker } from "../components/GardenPlacementPicker";
import { ErrorState } from "../components/ErrorState";
import { BouquetMemoryForm } from "../components/BouquetMemoryForm";
import type { MemoryFormState } from "../components/BouquetMemoryForm";
import { DetectedFlowerCard } from "../components/DetectedFlowerCard";

export function BouquetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBouquet, gardenAreas, toggleFavorite, deleteBouquet, updateBouquet, removePlacement } = useGarden();
  const { show } = useToast();

  const bouquet = id ? getBouquet(id) : undefined;

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [memory, setMemoryState] = useState<MemoryFormState>({
    name: bouquet?.name ?? "",
    receivedDate: bouquet?.receivedDate.slice(0, 10) ?? "",
    occasion: bouquet?.occasion,
    customOccasion: bouquet?.customOccasion,
    giftedBy: bouquet?.giftedBy,
    personalNote: bouquet?.personalNote,
    isFavorite: bouquet?.isFavorite ?? false,
    overallMeaning: bouquet?.overallMeaning,
  });
  const [editableFlowers, setEditableFlowers] = useState(bouquet?.flowers ?? []);

  const areaName = useMemo(() => {
    if (!bouquet?.placement) return null;
    return gardenAreas.find((a) => a.id === bouquet.placement!.gardenAreaId)?.name ?? null;
  }, [bouquet, gardenAreas]);

  if (!bouquet) {
    return (
      <div className="px-5 pt-6">
        <ErrorState
          title="This bouquet couldn't be found"
          message="It may have already been removed from your garden."
          secondaryAction={{ label: "Back to Collection", onClick: () => navigate("/collection") }}
        />
      </div>
    );
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteBouquet(bouquet!.id);
      show("Bouquet removed from your garden", "info");
      navigate("/collection", { replace: true });
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handleSaveEdit() {
    if (!memory.name.trim() || editableFlowers.length === 0) {
      setSaveError("A bouquet needs a name and at least one flower.");
      return;
    }
    setSaveError(null);
    await updateBouquet(
      bouquet!.id,
      {
        name: memory.name.trim(),
        receivedDate: memory.receivedDate,
        occasion: memory.occasion,
        customOccasion: memory.customOccasion,
        giftedBy: memory.giftedBy,
        personalNote: memory.personalNote,
        overallMeaning: memory.overallMeaning,
        isFavorite: memory.isFavorite,
      },
      editableFlowers.map((f) => ({
        commonName: f.commonName,
        scientificName: f.scientificName,
        color: f.color,
        estimatedQuantity: f.estimatedQuantity,
        confidence: f.confidence,
        meaning: f.meaning,
        symbolism: f.symbolism,
        source: f.source,
      }))
    );
    show("Bouquet updated");
    setIsEditing(false);
  }

  return (
    <div className="pb-8">
      <div className="relative">
        <img src={bouquet.imageUrl} alt={bouquet.name} className="aspect-[4/3] w-full object-cover" />
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--color-ink)] shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => toggleFavorite(bouquet.id)}
          aria-label={bouquet.isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--color-rose)] shadow-sm"
        >
          <Heart size={18} fill={bouquet.isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="px-5 pt-5">
        <h1 className="font-display text-2xl text-[var(--color-ink)]">{bouquet.name}</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {new Date(bouquet.receivedDate).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          {bouquet.occasion ? ` · ${bouquet.occasion === "Custom" ? bouquet.customOccasion || "Custom" : bouquet.occasion}` : ""}
        </p>
        {bouquet.giftedBy && <p className="mt-0.5 text-sm text-[var(--color-muted)]">From {bouquet.giftedBy}</p>}

        <div className="mt-3 flex items-center gap-2 text-sm text-[var(--color-ink)]">
          <MapPin size={15} className="text-[var(--color-rose)]" strokeWidth={1.75} />
          {areaName ? `Growing in ${areaName}` : "Not placed in the garden yet"}
        </div>

        {bouquet.overallMeaning && (
          <p className="mt-4 font-display text-lg italic leading-relaxed text-[var(--color-rose)]">
            “{bouquet.overallMeaning}”
          </p>
        )}

        {bouquet.personalNote && (
          <div className="mt-4 rounded-[20px] bg-[var(--color-blush)] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Personal note</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink)]">{bouquet.personalNote}</p>
          </div>
        )}

        <h2 className="mt-6 font-display text-lg text-[var(--color-ink)]">The flowers</h2>
        <div className="mt-3 space-y-3">
          {isEditing
            ? editableFlowers.map((f) => (
                <DetectedFlowerCard
                  key={f.id}
                  flower={f}
                  source={f.source}
                  onChange={(patch) => setEditableFlowers((prev) => prev.map((x) => (x.id === f.id ? { ...x, ...patch } : x)))}
                  onRemove={() => setEditableFlowers((prev) => prev.filter((x) => x.id !== f.id))}
                />
              ))
            : bouquet.flowers.map((f) => (
                <div key={f.id} className="rounded-[22px] border border-[var(--color-line)] bg-white p-4">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-display text-base text-[var(--color-ink)]">{f.commonName}</h4>
                    {f.scientificName && <span className="text-xs italic text-[var(--color-muted)]">{f.scientificName}</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    {[f.color, f.estimatedQuantity ? `${f.estimatedQuantity} stems` : null].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]">{f.meaning}</p>
                  {f.symbolism && f.symbolism.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {f.symbolism.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 rounded-full bg-[var(--color-lavender)]/50 px-2.5 py-1 text-[11px] font-medium text-[var(--color-ink)]"
                        >
                          <Sparkles size={10} strokeWidth={2} /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
        </div>

        {isEditing && (
          <div className="mt-6 -mx-5">
            <BouquetMemoryForm value={memory} onChange={(patch) => setMemoryState((m) => ({ ...m, ...patch }))} />
          </div>
        )}
        {saveError && <p className="mt-3 text-sm text-[var(--color-rose)]">{saveError}</p>}

        <div className="mt-8 flex flex-col gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="min-h-[44px] w-full rounded-full bg-[var(--color-rose)] text-sm font-semibold text-white shadow-md shadow-[var(--color-rose)]/30 active:scale-95"
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="min-h-[44px] w-full rounded-full border border-[var(--color-line)] text-sm font-medium text-[var(--color-ink)]"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] text-sm font-semibold text-white active:scale-95"
              >
                <Pencil size={15} /> Edit bouquet
              </button>
              <button
                type="button"
                onClick={() => setShowMove((v) => !v)}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[var(--color-line)] text-sm font-medium text-[var(--color-ink)]"
              >
                <MapPin size={15} /> {bouquet.placement ? "Move in garden" : "Place in garden"}
              </button>
              {bouquet.placement && (
                <button
                  type="button"
                  onClick={async () => {
                    await removePlacement(bouquet.id);
                    show("Moved to Collection", "info");
                  }}
                  className="min-h-[44px] w-full rounded-full text-sm font-medium text-[var(--color-muted)]"
                >
                  Remove from garden (keep in Collection)
                </button>
              )}
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full text-sm font-medium text-[var(--color-rose)]"
              >
                <Trash2 size={15} /> Delete bouquet
              </button>
            </>
          )}
        </div>

        {showMove && (
          <div className="mt-6 -mx-5 rounded-[24px] border border-[var(--color-line)] bg-white py-4">
            <GardenPlacementPicker
              bouquetId={bouquet.id}
              onPlaced={() => {
                setShowMove(false);
                show("Bouquet moved");
              }}
              onSkip={() => setShowMove(false)}
            />
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={confirmDelete}
        title="Remove this bouquet?"
        description="This removes it from both your Collection and your Garden. This can't be undone."
        confirmLabel={isDeleting ? "Removing…" : "Remove"}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
