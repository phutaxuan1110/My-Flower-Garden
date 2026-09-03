import { Loader2 } from "lucide-react";
import { useLanguage } from "../i18n/LanguageProvider";

interface GardenEditToolbarProps {
  onCancel: () => void;
  onDone: () => void;
  isSaving: boolean;
  doneDisabled?: boolean;
}

export function GardenEditToolbar({ onCancel, onDone, isSaving, doneDisabled }: GardenEditToolbarProps) {
  const { t } = useLanguage();
  return (
    <header className="safe-top flex items-center justify-between border-b border-[var(--color-line)] bg-white/95 px-4 py-3 backdrop-blur">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSaving}
        className="min-h-[44px] rounded-full px-3 text-sm font-medium text-[var(--color-muted)] disabled:opacity-50"
      >
        {t("gardenEdit.cancel")}
      </button>
      <h1 className="font-display text-base text-[var(--color-ink)]">{t("gardenEdit.title")}</h1>
      <button
        type="button"
        onClick={onDone}
        disabled={isSaving || doneDisabled}
        className="flex min-h-[44px] items-center gap-1.5 rounded-full bg-[var(--color-rose)] px-4 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving && <Loader2 size={14} className="animate-spin" />}
        {isSaving ? t("gardenEdit.saving") : t("gardenEdit.done")}
      </button>
    </header>
  );
}
