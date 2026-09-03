import { FramePicker } from "./FramePicker";
import { useLanguage } from "../i18n/LanguageProvider";
import { todayLocalDateString } from "../lib/date";
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

      {/* Date and Occasion each get their own full-width row — a shared row
          previously crowded these on narrow iPhones (see reported screenshot). */}
      <div>
        <label className={LABEL_CLASS} htmlFor="bouquet-date">
          {t("add.memory.date")}
        </label>
        <input
          id="bouquet-date"
          type="date"
          className={FIELD_CLASS}
          value={value.receivedDate}
          max={todayLocalDateString()}
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
    </div>
  );
}
