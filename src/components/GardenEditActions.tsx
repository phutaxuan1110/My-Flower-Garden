import { Loader2 } from "lucide-react";
import { useLanguage } from "../i18n/LanguageProvider";

interface GardenEditActionsProps {
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  saveDisabled?: boolean;
}

/**
 * Replaces the old `GardenEditToolbar` (which lived at the *top* of Garden
 * Edit Mode). Cancel/Save now live in a fixed action bar at the *bottom* of
 * the screen instead — see GardenEditView for how this is wired into the
 * layout so it never scrolls with the canvas and is never covered by the
 * Home Indicator.
 */
export function GardenEditActions({ onCancel, onSave, isSaving, saveDisabled }: GardenEditActionsProps) {
  const { t } = useLanguage();
  return (
    <div className="safe-bottom flex shrink-0 items-center gap-3 border-t border-[var(--color-line)] bg-[var(--color-bg)]/95 px-5 pt-3 backdrop-blur">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSaving}
        className="min-h-[48px] flex-[2] rounded-full border border-[var(--color-line)] text-sm font-medium text-[var(--color-ink)] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t("common.cancel")}
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving || saveDisabled}
        className="flex min-h-[48px] flex-[3] items-center justify-center gap-1.5 rounded-full bg-[var(--color-rose)] text-sm font-semibold text-white shadow-sm transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving && <Loader2 size={14} className="animate-spin" />}
        {isSaving ? t("common.saving") : t("common.save")}
      </button>
    </div>
  );
}
