import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, X, Plus, Sparkles } from "lucide-react";
import { CameraCapture } from "./CameraCapture";
import { ImageUploader } from "./ImageUploader";
import { AIAnalysisState } from "./AIAnalysisState";
import { DetectedFlowerCard } from "./DetectedFlowerCard";
import { BouquetMemoryForm } from "./BouquetMemoryForm";
import type { MemoryFormState } from "./BouquetMemoryForm";
import { BouquetMemoryActions } from "./BouquetMemoryActions";
import { GardenPlacementPicker } from "./GardenPlacementPicker";
import { ErrorState } from "./ErrorState";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { BouquetPhotoEditor, preparePhotos } from "./BouquetPhotoEditor";
import { BouquetPhotoGallery } from "./BouquetPhotoGallery";
import { todayLocalDateString } from "../lib/date";
import { flowerAIService } from "../lib/aiService";
import { makeId } from "../lib/id";
import { useGarden } from "../store/GardenProvider";
import { useToast } from "../hooks/useToast";
import { useHideChromeWhen } from "../hooks/useChromeVisibility";
import { useLanguage } from "../i18n/LanguageProvider";
import type { TranslationKey } from "../i18n/translations";
import type { BouquetPhoto, DetectedFlower } from "../types";

type Step = "source" | "preview" | "analyzing" | "review" | "memory" | "placement" | "success";

const STEP_TITLE_KEYS: Record<Step, TranslationKey> = {
  source: "add.step.source",
  preview: "add.step.preview",
  analyzing: "add.step.analyzing",
  review: "add.step.review",
  memory: "add.step.memory",
  placement: "add.step.placement",
  success: "add.step.success",
};

interface EditableFlower extends DetectedFlower {
  source: "ai" | "user";
}

export function AddBouquetSheet({ onClose }: { onClose: () => void }) {
  const { createBouquet } = useGarden();
  const { show } = useToast();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  // This sheet only ever mounts while the add-bouquet flow is open (see
  // AddBouquetHost's AnimatePresence), so its mere presence — through every
  // internal step (camera, AI review, memory form, placement picker) — is
  // reason enough to hide the bottom nav for the whole flow.
  useHideChromeWhen(true, "add-bouquet-sheet");

  const [step, setStep] = useState<Step>("source");
  const [photos, setPhotos] = useState<BouquetPhoto[]>([]);
  const imageDataUrl = photos[0]?.url ?? null;
  const compressingRef = useRef(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const [aiErrorMessage, setAiErrorMessage] = useState<string | null>(null);
  const [detectionStatus, setDetectionStatus] = useState<"completed" | "manual" | "failed" | "processing">(
    "processing"
  );
  const [flowers, setFlowers] = useState<EditableFlower[]>([]);
  const [overallMeaning, setOverallMeaning] = useState("");

  const [memory, setMemory] = useState<MemoryFormState>({
    name: "",
    receivedDate: todayLocalDateString(),
    frameStyle: "arch",
  });

  const [createdBouquetId, setCreatedBouquetId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const hasUnsavedProgress = Boolean(imageDataUrl) && step !== "success";

  async function handleFilesChosen(files: File[]) {
    if (compressingRef.current) return;
    compressingRef.current = true;
    setImageError(null); setCameraError(null); setIsCompressing(true);
    try {
      const added = await preparePhotos(files, photos.length);
      setPhotos(previous => [...previous, ...added]);
      setStep("preview");
    } catch (error) {
      setImageError(error instanceof Error && error.message === "photo-limit"
        ? (language === "vi" ? "Mỗi bó hoa tối đa 10 ảnh." : "Up to 10 photos per bouquet.")
        : (language === "vi" ? "Không thể thêm ảnh. Hãy chọn ảnh hợp lệ, tối đa 12 MB mỗi ảnh." : "Choose valid images up to 12 MB each."));
    } finally { compressingRef.current = false; setIsCompressing(false); }
  }

  async function runAnalysis() {
    if (!imageDataUrl) return;
    setStep("analyzing");
    setAiErrorMessage(null);
    const outcome = await flowerAIService.analyze(imageDataUrl, { language });
    if (outcome.status === "success") {
      setFlowers(outcome.result.flowers.map((f) => ({ ...f, source: "ai" as const })));
      setOverallMeaning(outcome.result.overallMeaning);
      setDetectionStatus("completed");
      setStep("review");
    } else {
      setAiErrorMessage(outcome.message);
    }
  }

  function addFlowersManually() {
    setFlowers([]);
    setOverallMeaning("");
    setDetectionStatus("manual");
    setAiErrorMessage(null);
    setStep("review");
  }

  function updateFlower(id: string, patch: Partial<DetectedFlower>) {
    setFlowers((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function removeFlower(id: string) {
    setFlowers((prev) => prev.filter((f) => f.id !== id));
  }

  function addBlankFlower() {
    setFlowers((prev) => [
      ...prev,
      { id: makeId(), commonName: "", color: "", meaning: "", confidence: 1, source: "user" },
    ]);
  }

  // The photo/review steps already validate the bouquet before this form is
  // shown. On the memory step, the bouquet name is the only required field.
  const canSave = Boolean(imageDataUrl) && memory.name.trim().length > 0;

  async function handleSave() {
    if (!canSave || !imageDataUrl || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const bouquet = await createBouquet({
        imageUrl: imageDataUrl,
        photos,
        name: memory.name.trim(),
        receivedDate: memory.receivedDate,
        occasion: memory.occasion,
        customOccasion: memory.customOccasion,
        giftedBy: memory.giftedBy,
        personalNote: memory.personalNote,
        overallMeaning,
        isFavorite: false,
        detectionStatus,
        frameStyle: memory.frameStyle,
        flowers: flowers.map((f) => ({
          commonName: f.commonName.trim(),
          scientificName: f.scientificName,
          color: f.color,
          estimatedQuantity: f.estimatedQuantity,
          confidence: f.source === "ai" ? f.confidence : undefined,
          meaning: f.meaning || "",
          symbolism: f.symbolism,
          source: f.source,
        })),
      });
      setCreatedBouquetId(bouquet.id);
      setStep("placement");
    } catch {
      setSaveError(t("add.memory.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  function requestClose() {
    if (isSaving || isCompressing) return;
    if (hasUnsavedProgress) {
      setConfirmDiscard(true);
    } else {
      onClose();
    }
  }

  function goBack() {
    if (isSaving || isCompressing) return;
    const order: Step[] = ["source", "preview", "review", "memory"];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="sheet-fill-height flex w-full max-w-[480px] flex-col overflow-hidden rounded-t-[32px] bg-[var(--color-bg)] md:rounded-[32px]"
      >
        <header className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center border-b border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3">
          {step !== "source" && step !== "success" && step !== "analyzing" ? (
            <button
              type="button"
              onClick={goBack}
              disabled={isCompressing || isSaving}
              aria-label={t("common.back")}
              className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-ink)]"
            >
              <ArrowLeft size={19} />
            </button>
          ) : (
            <span aria-hidden="true" className="h-11 w-11" />
          )}
          <h2 className="min-w-0 truncate px-2 text-center font-display text-base text-[var(--color-ink)]">
            {t(STEP_TITLE_KEYS[step])}
          </h2>
          <button
            type="button"
            onClick={requestClose}
            disabled={isCompressing || isSaving}
            aria-label={t("common.close")}
            className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-ink)]"
          >
            <X size={19} />
          </button>
        </header>

        <div className="no-scrollbar flex-1 overflow-y-auto py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
            >
              {step === "source" && (
                <div className="px-5">
                  <p className="text-sm leading-relaxed text-[var(--color-muted)]">{t("add.source.intro")}</p>
                  <div className="mt-6 flex flex-col gap-3">
                    <CameraCapture
                      onFileSelected={file => handleFilesChosen([file])}
                      onPermissionDenied={() => setCameraError(t("add.source.cameraDenied"))}
                    />
                    <ImageUploader disabled={isCompressing} onFilesSelected={handleFilesChosen} />
                  </div>
                  {isCompressing && (
                    <p className="mt-4 text-sm text-[var(--color-muted)]">{t("add.source.preparingPhoto")}</p>
                  )}
                  {cameraError && (
                    <p className="mt-4 text-sm text-[var(--color-rose)]" role="alert">
                      {cameraError}
                    </p>
                  )}
                  {imageError && (
                    <p className="mt-4 text-sm text-[var(--color-rose)]" role="alert">
                      {imageError}
                    </p>
                  )}
                </div>
              )}

              {step === "preview" && imageDataUrl && (
                <div className="px-5">
                  <div className="aspect-square overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-white">
                    <BouquetPhotoGallery photos={photos} name={language === "vi" ? "Bó hoa mới" : "New bouquet"}/>
                  </div>
                  <div className="mt-4"><BouquetPhotoEditor photos={photos} onChange={setPhotos} onBusyChange={setIsCompressing}/></div>
                  <p className="mt-3 text-xs text-[var(--color-muted)]">{language === "vi" ? "AI nhận diện hoa từ ảnh chính. Các ảnh khác được lưu trong album." : "AI identifies flowers from the cover photo. Other photos are saved in the album."}</p>
                  <button
                    type="button"
                    onClick={runAnalysis}
                    disabled={isCompressing}
                    className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-rose)] text-sm font-semibold text-white shadow-md shadow-[var(--color-rose)]/30 transition-transform active:scale-95"
                  >
                    <Sparkles size={16} /> {t("add.preview.identify")}
                  </button>
                </div>
              )}

              {step === "analyzing" && imageDataUrl && (
                <div className="px-5">
                  {!aiErrorMessage ? (
                    <AIAnalysisState imageUrl={imageDataUrl} />
                  ) : (
                    <ErrorState
                      title={t("add.analyzing.failedTitle")}
                      message={aiErrorMessage}
                      onRetry={runAnalysis}
                      secondaryAction={{ label: t("add.analyzing.addManually"), onClick: addFlowersManually }}
                    />
                  )}
                </div>
              )}

              {step === "review" && (
                <div className="px-5">
                  <p className="text-sm text-[var(--color-muted)]">
                    {flowers.length === 0 ? t("add.review.introEmpty") : t("add.review.introFound")}
                  </p>
                  <div className="mt-4 space-y-3">
                    {flowers.map((f) => (
                      <DetectedFlowerCard
                        key={f.id}
                        flower={f}
                        source={f.source}
                        onChange={(patch) => updateFlower(f.id, patch)}
                        onRemove={() => removeFlower(f.id)}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addBlankFlower}
                    className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-dashed border-[var(--color-primary-strong)] text-sm font-medium text-[var(--color-rose)]"
                  >
                    <Plus size={15} /> {t("add.review.addFlower")}
                  </button>
                  <button
                    type="button"
                    disabled={flowers.length === 0 || flowers.some((f) => !f.commonName.trim())}
                    onClick={() => setStep("memory")}
                    className="mt-5 min-h-[44px] w-full rounded-full bg-[var(--color-ink)] text-sm font-semibold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t("common.continue")}
                  </button>
                  {flowers.some((f) => !f.commonName.trim()) && (
                    <p className="mt-2 text-center text-xs text-[var(--color-muted)]">{t("add.review.nameAllFlowers")}</p>
                  )}
                </div>
              )}

              {step === "memory" && imageDataUrl && (
                <BouquetMemoryForm
                  value={memory}
                  onChange={(patch) => setMemory((m) => ({ ...m, ...patch }))}
                  imageUrl={imageDataUrl}
                />
              )}

              {step === "placement" && createdBouquetId && (
                <div>
                  <p className="px-5 text-sm italic text-[var(--color-muted)]">{t("add.placement.prompt")}</p>
                  <div className="mt-3">
                    <GardenPlacementPicker
                      bouquetId={createdBouquetId}
                      onPlaced={() => setStep("success")}
                      onSkip={() => setStep("success")}
                    />
                  </div>
                </div>
              )}

              {step === "success" && (
                <div className="flex flex-col items-center px-8 py-10 text-center">
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-rose)]"
                  >
                    <Sparkles size={30} />
                  </motion.div>
                  <h3 className="mt-5 font-display text-2xl text-[var(--color-ink)]">
                    <em className="italic text-[var(--color-rose)]">{memory.name}</em> {t("add.success.hasBloomed")}
                  </h3>
                  <p className="mt-2 max-w-[28ch] text-sm leading-relaxed text-[var(--color-muted)]">
                    {t("add.success.body")}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      show(t("add.success.savedToast"));
                      onClose();
                    }}
                    className="mt-6 min-h-[44px] w-full rounded-full bg-[var(--color-ink)] text-sm font-semibold text-white transition-transform active:scale-95"
                  >
                    {t("add.success.backToGarden")}
                  </button>
                  {createdBouquetId && (
                    <button
                      type="button"
                      onClick={() => {
                        const id = createdBouquetId;
                        onClose();
                        navigate(`/bouquet/${id}?edit=1`);
                      }}
                      className="mt-2 min-h-[44px] w-full rounded-full border border-[var(--color-line)] text-sm font-medium text-[var(--color-ink)] transition-transform active:scale-95"
                    >
                      {t("add.success.editNow")}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {step === "memory" && (
          <BouquetMemoryActions
            onCancel={requestClose}
            onSave={handleSave}
            isSaving={isSaving}
            disabled={!canSave}
            errorMessage={saveError}
          />
        )}
      </motion.div>

      <ConfirmationDialog
        open={confirmDiscard}
        title={t("add.discard.title")}
        description={t("add.discard.body")}
        confirmLabel={t("add.discard.confirm")}
        cancelLabel={t("add.discard.continue")}
        destructive
        onConfirm={() => {
          setConfirmDiscard(false);
          onClose();
        }}
        onCancel={() => setConfirmDiscard(false)}
      />
    </div>
  );
}
