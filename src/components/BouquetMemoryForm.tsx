import { Heart } from "lucide-react";
import { FramePicker } from "./FramePicker";
import { useLanguage } from "../i18n/LanguageProvider";
import { OCCASIONS } from "../types";
import type { FrameStyle, Occasion } from "../types";
import type { TranslationKey } from "../i18n/translations";

export interface MemoryFormState {
  name: string;
  receivedDate: string;
  occasion?: Occasion;
  customOccasion?: string;
  giftedBy?: string;
  personalNote?: string;
  isFavorite: boolean;
  overallMeaning?: string;
  frameStyle: FrameStyle;
}

interface BouquetMemoryFormProps {
  value: MemoryFormState;
  onChange: (patch: Partial<MemoryFormState>) => void;
  imageUrl: string;
}

const OCCASION_KEYS: Record<Occasion, TranslationKey> = {
  Birthday: "occasion.Birthday",
  Anniversary: "occasion.Anniversary",
  Graduation: "occasion.Graduation",
  "Thank You": "occasion.Thank You",
  "Just Because": "occasion.Just Because",
  Custom: "occasion.Custom",
};

const FIELD_CLASS =
  "min-h-[44px] w-full rounded-2xl border border-[var(--color-line)] bg-white px-3.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-rose)]";
const LABEL_CLASS = "mb-1.5 block text-sm font-medium text-[var(--color-ink)]";

export function BouquetMemoryForm({ value, onChange, imageUrl }: BouquetMemoryFormProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4 px-5">
      <div>
        <p className={LABEL_CLASS}>{t("add.memory.chooseFrame")}</p>
        <FramePicker imageUrl={imageUrl} value={value.frameStyle} onChange={(frameStyle) => onChange({ frameStyle })} />
      </div>

      <div>
        <label className={LABEL_CLASS} htmlFor="bouquet-name">
          {t("add.memory.name")} <span className="text-[var(--color-rose)]">*</span>
        </label>
        <input
          id="bouquet-name"
          className={FIELD_CLASS}
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder={t("add.memory.namePlaceholder")}
          maxLength={60}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLASS} htmlFor="bouquet-date">
            {t("add.memory.date")}
          </label>
          <input
            id="bouquet-date"
            type="date"
            className={FIELD_CLASS}
            value={value.receivedDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => onChange({ receivedDate: e.target.value })}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="bouquet-occasion">
            {t("add.memory.occasion")}
          </label>
          <select
            id="bouquet-occasion"
            className={FIELD_CLASS}
            value={value.occasion ?? ""}
            onChange={(e) => onChange({ occasion: (e.target.value || undefined) as Occasion | undefined })}
          >
            <option value="">{t("add.memory.selectPlaceholder")}</option>
            {OCCASIONS.map((o) => (
              <option key={o} value={o}>
                {t(OCCASION_KEYS[o])}
              </option>
            ))}
          </select>
        </div>
      </div>

      {value.occasion === "Custom" && (
        <div>
          <label className={LABEL_CLASS} htmlFor="bouquet-custom-occasion">
            {t("add.memory.customOccasion")}
          </label>
          <input
            id="bouquet-custom-occasion"
            className={FIELD_CLASS}
            value={value.customOccasion ?? ""}
            onChange={(e) => onChange({ customOccasion: e.target.value })}
            placeholder={t("add.memory.customOccasionPlaceholder")}
          />
        </div>
      )}

      <div>
        <label className={LABEL_CLASS} htmlFor="bouquet-from">
          {t("add.memory.from")}
        </label>
        <input
          id="bouquet-from"
          className={FIELD_CLASS}
          value={value.giftedBy ?? ""}
          onChange={(e) => onChange({ giftedBy: e.target.value })}
          placeholder={t("add.memory.fromPlaceholder")}
        />
      </div>

      <div>
        <label className={LABEL_CLASS} htmlFor="bouquet-note">
          {t("add.memory.note")}
        </label>
        <textarea
          id="bouquet-note"
          className={`${FIELD_CLASS} min-h-[88px] py-2.5`}
          value={value.personalNote ?? ""}
          onChange={(e) => onChange({ personalNote: e.target.value })}
          placeholder={t("add.memory.notePlaceholder")}
        />
      </div>

      <div>
        <label className={LABEL_CLASS} htmlFor="bouquet-meaning">
          {t("add.memory.overallMeaning")}
        </label>
        <textarea
          id="bouquet-meaning"
          className={`${FIELD_CLASS} min-h-[72px] py-2.5`}
          value={value.overallMeaning ?? ""}
          onChange={(e) => onChange({ overallMeaning: e.target.value })}
          placeholder={t("add.memory.overallMeaningPlaceholder")}
        />
      </div>

      <button
        type="button"
        onClick={() => onChange({ isFavorite: !value.isFavorite })}
        aria-pressed={value.isFavorite}
        className={`flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border text-sm font-medium transition-colors ${
          value.isFavorite
            ? "border-[var(--color-rose)] bg-[var(--color-rose)]/10 text-[var(--color-rose)]"
            : "border-[var(--color-line)] text-[var(--color-ink)]"
        }`}
      >
        <Heart size={15} fill={value.isFavorite ? "currentColor" : "none"} />
        {value.isFavorite ? t("add.memory.markedFavorite") : t("add.memory.markFavorite")}
      </button>
    </div>
  );
}
