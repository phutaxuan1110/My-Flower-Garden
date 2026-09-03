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

const FIELD_BASE_CLASS =
  "block w-full min-w-0 max-w-full box-border rounded-2xl border border-[var(--color-line)] bg-white px-3.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-rose)]";
const SINGLE_LINE_FIELD_CLASS = `${FIELD_BASE_CLASS} h-12`;
const LABEL_CLASS = "mb-1.5 block text-sm font-medium text-[var(--color-ink)]";

export function BouquetMemoryForm({ value, onChange, imageUrl }: BouquetMemoryFormProps) {
  const { t } = useLanguage();

  return (
    <div className="w-full min-w-0 space-y-4 px-5">
      <div className="w-full min-w-0">
        <p className={LABEL_CLASS}>{t("add.memory.chooseFrame")}</p>
        <FramePicker imageUrl={imageUrl} value={value.frameStyle} onChange={(frameStyle) => onChange({ frameStyle })} />
      </div>

      <div className="w-full min-w-0">
        <label className={LABEL_CLASS} htmlFor="bouquet-name">
          {t("add.memory.name")} <span className="text-[var(--color-rose)]">*</span>
        </label>
        <input
          id="bouquet-name"
          className={SINGLE_LINE_FIELD_CLASS}
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder={t("add.memory.namePlaceholder")}
          maxLength={60}
        />
      </div>

      {/* Date and Occasion each get their own full-width row — a shared row
          previously crowded these on narrow iPhones (see reported screenshot). */}
      <div className="w-full min-w-0">
        <label className={LABEL_CLASS} htmlFor="bouquet-date">
          {t("add.memory.date")}
        </label>
        <input
          id="bouquet-date"
          type="date"
          className={`${SINGLE_LINE_FIELD_CLASS} bouquet-date-field`}
          value={value.receivedDate}
          max={todayLocalDateString()}
          onChange={(e) => onChange({ receivedDate: e.target.value })}
        />
      </div>
      <div className="w-full min-w-0">
        <label className={LABEL_CLASS} htmlFor="bouquet-occasion">
          {t("add.memory.occasion")}
        </label>
        <select
          id="bouquet-occasion"
          className={SINGLE_LINE_FIELD_CLASS}
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
        <div className="w-full min-w-0">
          <label className={LABEL_CLASS} htmlFor="bouquet-custom-occasion">
            {t("add.memory.customOccasion")}
          </label>
          <input
            id="bouquet-custom-occasion"
            className={SINGLE_LINE_FIELD_CLASS}
            value={value.customOccasion ?? ""}
            onChange={(e) => onChange({ customOccasion: e.target.value })}
            placeholder={t("add.memory.customOccasionPlaceholder")}
          />
        </div>
      )}

      <div className="w-full min-w-0">
        <label className={LABEL_CLASS} htmlFor="bouquet-from">
          {t("add.memory.from")}
        </label>
        <input
          id="bouquet-from"
          className={SINGLE_LINE_FIELD_CLASS}
          value={value.giftedBy ?? ""}
          onChange={(e) => onChange({ giftedBy: e.target.value })}
          placeholder={t("add.memory.fromPlaceholder")}
        />
      </div>

      <div className="w-full min-w-0">
        <label className={LABEL_CLASS} htmlFor="bouquet-note">
          {t("add.memory.note")}
        </label>
        <textarea
          id="bouquet-note"
          className={`${FIELD_BASE_CLASS} min-h-[104px] py-2.5`}
          value={value.personalNote ?? ""}
          onChange={(e) => onChange({ personalNote: e.target.value })}
          placeholder={t("add.memory.notePlaceholder")}
        />
      </div>

    </div>
  );
}
