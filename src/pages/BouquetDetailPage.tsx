import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Camera, Heart, MapPin, Pencil, Sparkles, Trash2 } from "lucide-react";
import { useGarden } from "../store/GardenProvider";
import { useToast } from "../hooks/useToast";
import { useLanguage } from "../i18n/LanguageProvider";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { GardenPlacementPicker } from "../components/GardenPlacementPicker";
import { ErrorState } from "../components/ErrorState";
import { BouquetMemoryForm } from "../components/BouquetMemoryForm";
import type { MemoryFormState } from "../components/BouquetMemoryForm";
import { DetectedFlowerCard } from "../components/DetectedFlowerCard";
import { BouquetFrame } from "../components/BouquetFrame";
import { ImageUploader } from "../components/ImageUploader";
import { compressImageToDataUrl, validateImageFile, ImageValidationError } from "../lib/image";
import type { TranslationKey } from "../i18n/translations";
import type { Occasion } from "../types";

const OCCASION_KEYS: Record<Occasion, TranslationKey> = {
  Birthday: "occasion.Birthday",
  Anniversary: "occasion.Anniversary",
  Graduation: "occasion.Graduation",
  "Thank You": "occasion.Thank You",
  "Just Because": "occasion.Just Because",
  Custom: "occasion.Custom",
};

export function BouquetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getBouquet, gardenAreas, toggleFavorite, deleteBouquet, updateBouquet, removePlacement } = useGarden();
  const { show } = useToast();
  const { t } = useLanguage();

  const bouquet = id ? getBouquet(id) : undefined;

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [isEditing, setIsEditing] = useState(searchParams.get("edit") === "1");
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [memory, setMemoryState] = useState<MemoryFormState>({
    name: bouquet?.name ?? "",
    receivedDate: bouquet?.receivedDate.slice(0, 10) ?? "",
    occasion: bouquet?.occasion,
    customOccasion: bouquet?.customOccasion,
    giftedBy: bouquet?.giftedBy,
    personalNote: bouquet?.personalNote,
    isFavorite: bouquet?.isFavorite ?? false,
    overallMeaning: bouquet?.overallMeaning,
    frameStyle: bouquet?.frameStyle ?? "arch",
  });
  const [editableFlowers, setEditableFlowers] = useState(bouquet?.flowers ?? []);

  useEffect(() => {
    if (searchParams.get("edit") === "1") {
      setIsEditing(true);
      searchParams.delete("edit");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const areaName = useMemo(() => {
    if (!bouquet?.placement) return null;
    return gardenAreas.find((a) => a.id === bouquet.placement!.gardenAreaId)?.name ?? null;
  }, [bouquet, gardenAreas]);

  if (!bouquet) {
    return (
      <div className="px-5 pt-6">
        <ErrorState
          title={t("detail.notFoundTitle")}
          message={t("detail.notFoundBody")}
          secondaryAction={{ label: t("detail.backToCollection"), onClick: () => navigate("/collection") }}
        />
      </div>
    );
  }

  async function handlePhotoChange(file: File) {
    setPhotoError(null);
    try {
      validateImageFile(file);
      const dataUrl = await compressImageToDataUrl(file);
      setEditedImageUrl(dataUrl);
    } catch (err) {
      setPhotoError(err instanceof ImageValidationError ? err.message : t("detail.notFoundBody"));
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteBouquet(bouquet!.id);
      show(t("detail.deletedToast"), "info");
      navigate("/collection", { replace: true });
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handleSaveEdit() {
    if (!memory.name.trim() || editableFlowers.length === 0) {
      setSaveError(t("detail.editValidation"));
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
        frameStyle: memory.frameStyle,
        imageUrl: editedImageUrl ?? bouquet!.imageUrl,
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
    show(t("detail.updatedToast"));
    setEditedImageUrl(null);
    setIsEditing(false);
  }

  const displayImageUrl = editedImageUrl ?? bouquet.imageUrl;

  return (
    <div className="pb-8">
      <div className="relative">
        <div className="aspect-[4/3] w-full bg-[var(--color-blush)] p-6">
          <BouquetFrame imageUrl={displayImageUrl} frameStyle={isEditing ? memory.frameStyle : bouquet.frameStyle} alt={bouquet.name} className="h-full w-full" />
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={t("common.back")}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--color-ink)] shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => toggleFavorite(bouquet.id)}
          aria-label={bouquet.isFavorite ? t("bouquet.removeFromFavorites") : t("bouquet.addToFavorites")}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--color-rose)] shadow-sm"
        >
          <Heart size={18} fill={bouquet.isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      {isEditing && (
        <div className="px-5 pt-4">
          <ImageUploader
            onFileSelected={handlePhotoChange}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-dashed border-[var(--color-primary-strong)] px-4 text-sm font-medium text-[var(--color-rose)]"
          >
            <Camera size={15} /> {t("detail.changePhoto")}
          </ImageUploader>
          {photoError && <p className="mt-2 text-sm text-[var(--color-rose)]">{photoError}</p>}
        </div>
      )}

      <div className="px-5 pt-5">
        {!isEditing && <h1 className="font-display text-2xl text-[var(--color-ink)]">{bouquet.name}</h1>}
        {!isEditing && (
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {new Date(bouquet.receivedDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {bouquet.occasion
              ? ` · ${bouquet.occasion === "Custom" ? bouquet.customOccasion || t(OCCASION_KEYS.Custom) : t(OCCASION_KEYS[bouquet.occasion])}`
              : ""}
          </p>
        )}
        {!isEditing && bouquet.giftedBy && (
          <p className="mt-0.5 text-sm text-[var(--color-muted)]">
            {t("detail.from")} {bouquet.giftedBy}
          </p>
        )}

        {!isEditing && (
          <div className="mt-3 flex items-center gap-2 text-sm text-[var(--color-ink)]">
            <MapPin size={15} className="text-[var(--color-rose)]" strokeWidth={1.75} />
            {areaName ? `${t("detail.growingIn")} ${areaName}` : t("detail.notPlacedYet")}
          </div>
        )}

        {!isEditing && bouquet.overallMeaning && (
          <p className="mt-4 font-display text-lg italic leading-relaxed text-[var(--color-rose)]">
            "{bouquet.overallMeaning}"
          </p>
        )}

        {!isEditing && bouquet.personalNote && (
          <div className="mt-4 rounded-[20px] bg-[var(--color-blush)] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">{t("detail.personalNote")}</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink)]">{bouquet.personalNote}</p>
          </div>
        )}

        {!isEditing && <h2 className="mt-6 font-display text-lg text-[var(--color-ink)]">{t("detail.theFlowers")}</h2>}
        {!isEditing && (
          <div className="mt-3 space-y-3">
            {bouquet.flowers.map((f) => (
              <div key={f.id} className="rounded-[22px] border border-[var(--color-line)] bg-white p-4">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-display text-base text-[var(--color-ink)]">{f.commonName}</h4>
                  {f.scientificName && <span className="text-xs italic text-[var(--color-muted)]">{f.scientificName}</span>}
                </div>
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                  {[f.color, f.estimatedQuantity ? `${f.estimatedQuantity} ${t("flower.stems")}` : null].filter(Boolean).join(" · ")}
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
        )}

        {isEditing && (
          <div>
            <h2 className="mb-3 font-display text-lg text-[var(--color-ink)]">{t("detail.theFlowers")}</h2>
            <div className="space-y-3">
              {editableFlowers.map((f) => (
                <DetectedFlowerCard
                  key={f.id}
                  flower={f}
                  source={f.source}
                  onChange={(patch) => setEditableFlowers((prev) => prev.map((x) => (x.id === f.id ? { ...x, ...patch } : x)))}
                  onRemove={() => setEditableFlowers((prev) => prev.filter((x) => x.id !== f.id))}
                />
              ))}
            </div>
            <div className="mt-6 -mx-5">
              <BouquetMemoryForm value={memory} onChange={(patch) => setMemoryState((m) => ({ ...m, ...patch }))} imageUrl={displayImageUrl} />
            </div>
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
                {t("detail.saveChanges")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditedImageUrl(null);
                  setPhotoError(null);
                }}
                className="min-h-[44px] w-full rounded-full border border-[var(--color-line)] text-sm font-medium text-[var(--color-ink)]"
              >
                {t("common.cancel")}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] text-sm font-semibold text-white active:scale-95"
              >
                <Pencil size={15} /> {t("detail.editBouquet")}
              </button>
              <button
                type="button"
                onClick={() => setShowMove((v) => !v)}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[var(--color-line)] text-sm font-medium text-[var(--color-ink)]"
              >
                <MapPin size={15} /> {bouquet.placement ? t("detail.moveInGarden") : t("detail.placeInGarden")}
              </button>
              {bouquet.placement && (
                <button
                  type="button"
                  onClick={async () => {
                    await removePlacement(bouquet.id);
                    show(t("detail.removedFromGardenToast"), "info");
                  }}
                  className="min-h-[44px] w-full rounded-full text-sm font-medium text-[var(--color-muted)]"
                >
                  {t("detail.removeFromGarden")}
                </button>
              )}
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full text-sm font-medium text-[var(--color-rose)]"
              >
                <Trash2 size={15} /> {t("detail.deleteBouquet")}
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
                show(t("detail.movedToast"));
              }}
              onSkip={() => setShowMove(false)}
            />
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={confirmDelete}
        title={t("detail.deleteConfirmTitle")}
        description={t("detail.deleteConfirmBody")}
        confirmLabel={isDeleting ? t("common.removing") : t("common.remove")}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
