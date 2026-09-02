import { useState } from "react";
import { Pencil, Trash2, Sparkles } from "lucide-react";
import { FlowerEditor } from "./FlowerEditor";
import { useLanguage } from "../i18n/LanguageProvider";

export interface EditableFlowerLike {
  id: string;
  commonName: string;
  scientificName?: string;
  color?: string;
  estimatedQuantity?: number;
  confidence?: number;
  meaning: string;
  symbolism?: string[];
}

interface DetectedFlowerCardProps {
  flower: EditableFlowerLike;
  source: "ai" | "user";
  onChange: (patch: Partial<EditableFlowerLike>) => void;
  onRemove: () => void;
}

const LOW_CONFIDENCE_THRESHOLD = 0.7;

export function DetectedFlowerCard({ flower, source, onChange, onRemove }: DetectedFlowerCardProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const confidence = flower.confidence ?? 1;
  const isLowConfidence = source === "ai" && confidence < LOW_CONFIDENCE_THRESHOLD;

  return (
    <div className="rounded-[22px] border border-[var(--color-line)] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className="font-display text-base text-[var(--color-ink)]">
              {flower.commonName || t("flower.unnamed")}
            </h4>
            {flower.scientificName && (
              <span className="text-xs italic text-[var(--color-muted)]">{flower.scientificName}</span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">
            {[flower.color, flower.estimatedQuantity ? `${flower.estimatedQuantity} ${t("flower.stems")}` : null]
              .filter(Boolean)
              .join(" · ") || t("flower.noDetails")}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            onClick={() => setIsEditing((v) => !v)}
            aria-label={`${t("flower.edit")} ${flower.commonName}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-blush)] text-[var(--color-ink)] transition-transform active:scale-90"
          >
            <Pencil size={14} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`${t("flower.remove")} ${flower.commonName}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-blush)] text-[var(--color-rose)] transition-transform active:scale-90"
          >
            <Trash2 size={14} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {source === "ai" && (
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-blush)]">
            <div
              className={`h-full rounded-full ${isLowConfidence ? "bg-[var(--color-butter)]" : "bg-[var(--color-leaf)]"}`}
              style={{ width: `${Math.round(confidence * 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-[var(--color-muted)]">{Math.round(confidence * 100)}%</span>
        </div>
      )}

      {isLowConfidence && (
        <p className="mt-2 text-xs italic leading-relaxed text-[var(--color-rose)]">
          {t("flower.lowConfidence")}
        </p>
      )}

      <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]">{flower.meaning}</p>

      {flower.symbolism && flower.symbolism.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {flower.symbolism.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-[var(--color-lavender)]/50 px-2.5 py-1 text-[11px] font-medium text-[var(--color-ink)]"
            >
              <Sparkles size={10} strokeWidth={2} /> {tag}
            </span>
          ))}
        </div>
      )}

      {isEditing && (
        <div className="mt-3">
          <FlowerEditor flower={flower} onChange={onChange} onDone={() => setIsEditing(false)} />
        </div>
      )}
    </div>
  );
}
