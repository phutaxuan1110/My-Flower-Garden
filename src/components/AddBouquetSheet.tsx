import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, X, Plus, Sparkles } from "lucide-react";
import { CameraCapture } from "./CameraCapture";
import { ImageUploader } from "./ImageUploader";
import { AIAnalysisState } from "./AIAnalysisState";
import { DetectedFlowerCard } from "./DetectedFlowerCard";
import { BouquetMemoryForm } from "./BouquetMemoryForm";
import type { MemoryFormState } from "./BouquetMemoryForm";
import { GardenPlacementPicker } from "./GardenPlacementPicker";
import { ErrorState } from "./ErrorState";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { compressImageToDataUrl, validateImageFile, ImageValidationError } from "../lib/image";
import { flowerAIService } from "../lib/aiService";
import { makeId } from "../lib/id";
import { useGarden } from "../store/GardenProvider";
import { useToast } from "../hooks/useToast";
import type { DetectedFlower } from "../types";

type Step = "source" | "preview" | "analyzing" | "review" | "memory" | "placement" | "success";

const STEP_TITLES: Record<Step, string> = {
  source: "Add a bouquet",
  preview: "Preview your photo",
  analyzing: "Identifying flowers",
  review: "Review the flowers",
  memory: "Tell its story",
  placement: "Choose where it blooms",
  success: "Bouquet saved",
};

interface EditableFlower extends DetectedFlower {
  source: "ai" | "user";
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function AddBouquetSheet({ onClose }: { onClose: () => void }) {
  const { createBouquet } = useGarden();
  const { show } = useToast();

  const [step, setStep] = useState<Step>("source");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
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
    receivedDate: todayIso(),
    isFavorite: false,
  });

  const [createdBouquetId, setCreatedBouquetId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const hasUnsavedProgress = Boolean(imageDataUrl) && step !== "success";

  async function handleFileChosen(file: File) {
    setImageError(null);
    setCameraError(null);
    try {
      validateImageFile(file);
      setIsCompressing(true);
      const dataUrl = await compressImageToDataUrl(file);
      setImageDataUrl(dataUrl);
      setStep("preview");
    } catch (err) {
      if (err instanceof ImageValidationError) {
        setImageError(err.message);
      } else {
        setImageError("We couldn't read that photo. Please try a different one.");
      }
    } finally {
      setIsCompressing(false);
    }
  }

  async function runAnalysis() {
    if (!imageDataUrl) return;
    setStep("analyzing");
    setAiErrorMessage(null);
    const outcome = await flowerAIService.analyze(imageDataUrl);
    if (outcome.status === "success") {
      setFlowers(outcome.result.flowers.map((f) => ({ ...f, source: "ai" as const })));
      setOverallMeaning(outcome.result.overallMeaning);
      setDetectionStatus("completed");
      setStep("review");
    } else {
      setAiErrorMessage(outcome.message);
      // Stay on the analyzing step to show the failure without losing the photo.
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
      {
        id: makeId(),
        commonName: "",
        color: "",
        meaning: "",
        confidence: 1,
        source: "user",
      },
    ]);
  }

  const canSave =
    Boolean(imageDataUrl) &&
    memory.name.trim().length > 0 &&
    flowers.length > 0 &&
    flowers.every((f) => f.commonName.trim().length > 0) &&
    (detectionStatus === "completed" || detectionStatus === "manual");

  async function handleSave() {
    if (!canSave || !imageDataUrl || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const bouquet = await createBouquet({
        imageUrl: imageDataUrl,
        name: memory.name.trim(),
        receivedDate: memory.receivedDate,
        occasion: memory.occasion,
        customOccasion: memory.customOccasion,
        giftedBy: memory.giftedBy,
        personalNote: memory.personalNote,
        overallMeaning: memory.overallMeaning || overallMeaning,
        isFavorite: memory.isFavorite,
        detectionStatus,
        flowers: flowers.map((f) => ({
          commonName: f.commonName.trim(),
          scientificName: f.scientificName,
          color: f.color,
          estimatedQuantity: f.estimatedQuantity,
          confidence: f.source === "ai" ? f.confidence : undefined,
          meaning: f.meaning || "No meaning recorded yet.",
          symbolism: f.symbolism,
          source: f.source,
        })),
      });
      setCreatedBouquetId(bouquet.id);
      setStep("placement");
    } catch {
      setSaveError("We couldn't save this bouquet. Your photo and details are still here — please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function requestClose() {
    if (hasUnsavedProgress) {
      setConfirmDiscard(true);
    } else {
      onClose();
    }
  }

  function goBack() {
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
        className="flex h-[92vh] w-full max-w-[480px] flex-col overflow-hidden rounded-t-[32px] bg-[var(--color-bg)] md:h-[85vh] md:rounded-[32px]"
      >
        <header className="safe-top flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3">
          {step !== "source" && step !== "success" && step !== "analyzing" ? (
            <button
              type="button"
              onClick={goBack}
              aria-label="Go back"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-ink)]"
            >
              <ArrowLeft size={19} />
            </button>
          ) : (
            <span className="w-9" />
          )}
          <h2 className="font-display text-base text-[var(--color-ink)]">{STEP_TITLES[step]}</h2>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-ink)]"
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
                  <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                    Add a photo of the bouquet you'd like to remember. You can take a new photo or choose one you
                    already have.
                  </p>
                  <div className="mt-6 flex flex-col gap-3">
                    <CameraCapture
                      onFileSelected={handleFileChosen}
                      onPermissionDenied={() =>
                        setCameraError(
                          "We couldn't access your camera. You can still upload a photo from your library."
                        )
                      }
                    />
                    <ImageUploader onFileSelected={handleFileChosen} />
                  </div>
                  {isCompressing && <p className="mt-4 text-sm text-[var(--color-muted)]">Preparing your photo…</p>}
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
                  <div className="overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-white">
                    <img src={imageDataUrl} alt="Selected bouquet preview" className="aspect-square w-full object-cover" />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setImageDataUrl(null);
                        setStep("source");
                      }}
                      className="min-h-[44px] flex-1 rounded-full border border-[var(--color-line)] text-sm font-medium text-[var(--color-ink)]"
                    >
                      Choose a different photo
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={runAnalysis}
                    className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-rose)] text-sm font-semibold text-white shadow-md shadow-[var(--color-rose)]/30 transition-transform active:scale-95"
                  >
                    <Sparkles size={16} /> Identify flowers
                  </button>
                </div>
              )}

              {step === "analyzing" && imageDataUrl && (
                <div className="px-5">
                  {!aiErrorMessage ? (
                    <AIAnalysisState imageUrl={imageDataUrl} />
                  ) : (
                    <ErrorState
                      title="We couldn't identify the flowers"
                      message={aiErrorMessage}
                      onRetry={runAnalysis}
                      secondaryAction={{ label: "Add flowers manually", onClick: addFlowersManually }}
                    />
                  )}
                </div>
              )}

              {step === "review" && (
                <div className="px-5">
                  {flowers.length === 0 ? (
                    <p className="text-sm text-[var(--color-muted)]">
                      No flowers yet — add each one you'd like to remember from this bouquet.
                    </p>
                  ) : (
                    <p className="text-sm text-[var(--color-muted)]">
                      Here's what we found. Edit, remove or add flowers so it's exactly right.
                    </p>
                  )}
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
                    <Plus size={15} /> Add a flower
                  </button>
                  <button
                    type="button"
                    disabled={flowers.length === 0 || flowers.some((f) => !f.commonName.trim())}
                    onClick={() => setStep("memory")}
                    className="mt-5 min-h-[44px] w-full rounded-full bg-[var(--color-ink)] text-sm font-semibold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Continue
                  </button>
                  {flowers.length > 0 && flowers.some((f) => !f.commonName.trim()) && (
                    <p className="mt-2 text-center text-xs text-[var(--color-muted)]">
                      Give every flower a name before continuing.
                    </p>
                  )}
                </div>
              )}

              {step === "memory" && (
                <div>
                  <BouquetMemoryForm value={memory} onChange={(patch) => setMemory((m) => ({ ...m, ...patch }))} />
                  <div className="px-5">
                    {saveError && (
                      <p className="mt-4 text-sm text-[var(--color-rose)]" role="alert">
                        {saveError}
                      </p>
                    )}
                    <button
                      type="button"
                      disabled={!canSave || isSaving}
                      onClick={handleSave}
                      className="mt-5 min-h-[44px] w-full rounded-full bg-[var(--color-rose)] text-sm font-semibold text-white shadow-md shadow-[var(--color-rose)]/30 transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isSaving ? "Saving…" : "Save bouquet"}
                    </button>
                    {!canSave && !isSaving && (
                      <p className="mt-2 text-center text-xs text-[var(--color-muted)]">
                        {memory.name.trim().length === 0
                          ? "Give your bouquet a name to save it."
                          : "Add at least one flower to save it."}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === "placement" && createdBouquetId && (
                <div>
                  <p className="px-5 text-sm italic text-[var(--color-muted)]">
                    Where would you like this bouquet to bloom?
                  </p>
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
                    <em className="italic text-[var(--color-rose)]">{memory.name}</em> has bloomed
                  </h3>
                  <p className="mt-2 max-w-[28ch] text-sm leading-relaxed text-[var(--color-muted)]">
                    This memory is now growing in your garden, ready whenever you want to visit it again.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      show("Bouquet saved to your garden");
                      onClose();
                    }}
                    className="mt-6 min-h-[44px] w-full rounded-full bg-[var(--color-ink)] text-sm font-semibold text-white transition-transform active:scale-95"
                  >
                    Back to Garden
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      <ConfirmationDialog
        open={confirmDiscard}
        title="Discard this bouquet?"
        description="Your photo and progress on this bouquet will be lost."
        confirmLabel="Discard"
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
