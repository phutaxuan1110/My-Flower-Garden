import { useLanguage } from "../i18n/LanguageProvider";
import type { EditableFlowerLike } from "./DetectedFlowerCard";

interface FlowerEditorProps {
  flower: EditableFlowerLike;
  onChange: (patch: Partial<EditableFlowerLike>) => void;
  onDone: () => void;
}

const FIELD_CLASS =
  "min-h-[44px] w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-rose)]";

export function FlowerEditor({ flower, onChange, onDone }: FlowerEditorProps) {
  const { t } = useLanguage();
  return (
    <div className="space-y-3 rounded-[20px] bg-[var(--color-blush)] p-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]" htmlFor={`name-${flower.id}`}>
          {t("flower.name")}
        </label>
        <input
          id={`name-${flower.id}`}
          className={FIELD_CLASS}
          value={flower.commonName}
          onChange={(e) => onChange({ commonName: e.target.value })}
          placeholder={t("flower.namePlaceholder")}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]" htmlFor={`color-${flower.id}`}>
            {t("flower.color")}
          </label>
          <input
            id={`color-${flower.id}`}
            className={FIELD_CLASS}
            value={flower.color ?? ""}
            onChange={(e) => onChange({ color: e.target.value })}
            placeholder={t("flower.colorPlaceholder")}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]" htmlFor={`qty-${flower.id}`}>
            {t("flower.quantity")}
          </label>
          <input
            id={`qty-${flower.id}`}
            type="number"
            min={1}
            className={FIELD_CLASS}
            value={flower.estimatedQuantity ?? ""}
            onChange={(e) => onChange({ estimatedQuantity: e.target.value ? Number(e.target.value) : undefined })}
            placeholder={t("flower.quantityPlaceholder")}
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]" htmlFor={`meaning-${flower.id}`}>
          {t("flower.meaning")}
        </label>
        <textarea
          id={`meaning-${flower.id}`}
          className={`${FIELD_CLASS} min-h-[72px] py-2`}
          value={flower.meaning}
          onChange={(e) => onChange({ meaning: e.target.value })}
          placeholder={t("flower.meaningPlaceholder")}
        />
      </div>
      <button
        type="button"
        onClick={onDone}
        className="min-h-[44px] w-full rounded-full bg-[var(--color-ink)] text-sm font-semibold text-white transition-transform active:scale-95"
      >
        {t("flower.doneEditing")}
      </button>
    </div>
  );
}
