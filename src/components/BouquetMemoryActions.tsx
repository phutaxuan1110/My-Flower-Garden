import { Loader2 } from "lucide-react";
import { useLanguage } from "../i18n/LanguageProvider";

interface BouquetMemoryActionsProps {
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  disabled?: boolean;
  cancelLabel?: string;
  saveLabel?: string;
  errorMessage?: string | null;
  fixed?: boolean;
}

export function BouquetMemoryActions({
  onCancel,
  onSave,
  isSaving,
  disabled,
  cancelLabel,
  saveLabel,
  errorMessage,
  fixed = false,
}: BouquetMemoryActionsProps) {
  const { t } = useLanguage();

  return (
    <div
      className={`${
        fixed ? "fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 md:absolute" : ""
      } border-t border-[var(--color-line)] bg-[var(--color-bg)]/95 px-5 pt-3 shadow-[0_-8px_24px_rgba(74,53,64,0.08)] backdrop-blur-md safe-bottom`}
    >
      {errorMessage && (
        <p className="mb-2 text-sm text-[var(--color-rose)]" role="alert">
          {errorMessage}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="flex min-h-[48px] flex-[0_0_40%] items-center justify-center rounded-full border border-[var(--color-line)] bg-white text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-blush)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cancelLabel ?? t("common.cancel")}
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
