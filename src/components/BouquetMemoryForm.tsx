import { Heart } from "lucide-react";
import { OCCASIONS } from "../types";
import type { Occasion } from "../types";

export interface MemoryFormState {
  name: string;
  receivedDate: string;
  occasion?: Occasion;
  customOccasion?: string;
  giftedBy?: string;
  personalNote?: string;
  isFavorite: boolean;
  overallMeaning?: string;
}

interface BouquetMemoryFormProps {
  value: MemoryFormState;
  onChange: (patch: Partial<MemoryFormState>) => void;
}

const FIELD_CLASS =
  "min-h-[44px] w-full rounded-2xl border border-[var(--color-line)] bg-white px-3.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-rose)]";
const LABEL_CLASS = "mb-1.5 block text-sm font-medium text-[var(--color-ink)]";

export function BouquetMemoryForm({ value, onChange }: BouquetMemoryFormProps) {
  return (
    <div className="space-y-4 px-5">
      <div>
        <label className={LABEL_CLASS} htmlFor="bouquet-name">
          Bouquet name <span className="text-[var(--color-rose)]">*</span>
        </label>
        <input
          id="bouquet-name"
          className={FIELD_CLASS}
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Mom's Birthday Bouquet"
          maxLength={60}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLASS} htmlFor="bouquet-date">
            Date received
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
            Occasion
          </label>
          <select
            id="bouquet-occasion"
            className={FIELD_CLASS}
            value={value.occasion ?? ""}
            onChange={(e) => onChange({ occasion: (e.target.value || undefined) as Occasion | undefined })}
          >
            <option value="">Select…</option>
            {OCCASIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>

      {value.occasion === "Custom" && (
        <div>
          <label className={LABEL_CLASS} htmlFor="bouquet-custom-occasion">
            Describe the occasion
          </label>
          <input
            id="bouquet-custom-occasion"
            className={FIELD_CLASS}
            value={value.customOccasion ?? ""}
            onChange={(e) => onChange({ customOccasion: e.target.value })}
            placeholder="e.g. First date"
          />
        </div>
      )}

      <div>
        <label className={LABEL_CLASS} htmlFor="bouquet-from">
          From (optional)
        </label>
        <input
          id="bouquet-from"
          className={FIELD_CLASS}
          value={value.giftedBy ?? ""}
          onChange={(e) => onChange({ giftedBy: e.target.value })}
          placeholder="Who gave you these flowers?"
        />
      </div>

      <div>
        <label className={LABEL_CLASS} htmlFor="bouquet-note">
          Personal note
        </label>
        <textarea
          id="bouquet-note"
          className={`${FIELD_CLASS} min-h-[88px] py-2.5`}
          value={value.personalNote ?? ""}
          onChange={(e) => onChange({ personalNote: e.target.value })}
          placeholder="What made this moment memorable?"
        />
      </div>

      <div>
        <label className={LABEL_CLASS} htmlFor="bouquet-meaning">
          Overall bouquet meaning
        </label>
        <textarea
          id="bouquet-meaning"
          className={`${FIELD_CLASS} min-h-[72px] py-2.5`}
          value={value.overallMeaning ?? ""}
          onChange={(e) => onChange({ overallMeaning: e.target.value })}
          placeholder="Suggested from the flowers you kept — feel free to change it"
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
        {value.isFavorite ? "Marked as favorite" : "Mark as favorite"}
      </button>
    </div>
  );
}
