import { Heart, Loader2 } from "lucide-react";
import { useLanguage } from "../i18n/LanguageProvider";

interface BouquetMemoryActionsProps {
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSave: () => void;
  isSaving: boolean;
  disabled?: boolean;
  saveLabel?: string;
  errorMessage?: string | null;
}

/**
 * Renders the "Yêu thích" (favorite toggle, ~40% width) + "Lưu" (primary save,
 * ~60% width) row. Favorite is a plain button — it only flips local state via
 * onToggleFavorite and never submits/saves on its own, so tapping it can never
 * accidentally trigger a save.
 */
export function BouquetMemoryActions({
  isFavorite,
  onToggleFavorite,
  onSave,
  isSaving,
  disabled,
  saveLabel,
  errorMessage,
}: BouquetMemoryActionsProps) {
  const { t } = useLanguage();

  return (
    <div className="border-t border-[var(--color-line)] bg-[var(--color-bg)] px-5 pt-3 safe-bottom">
      {errorMessage && (
        <p className="mb-2 text-sm text-[var(--color-rose)]" role="alert">
          {errorMessage}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? t("bouquet.removeFromFavorites") : t("bouquet.addToFavorites")}
          className={`flex min-h-[48px] flex-[0_0_40%] items-center justify-center gap-1.5 rounded-full border text-sm font-medium transition-colors ${
            isFavorite
              ? "border-[var(--color-rose)] bg-[var(--color-rose)]/10 text-[var(--color-rose)]"
              : "border-[var(--color-line)] text-[var(--color-ink)]"
          }`}
        >
          <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
          {t("common.favorite")}
        </button>
        <button
          type="button"
          disabled={isSaving || disabled}
          onClick={onSave}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--color-rose)] text-sm font-semibold text-white shadow-md shadow-[var(--color-rose)]/30 transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" /> {t("common.saving")}
            </>
          ) : (
            saveLabel ?? t("common.save")
          )}
        </button>
      </div>
    </div>
  );
}
