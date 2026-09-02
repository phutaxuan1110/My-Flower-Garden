import { AlertTriangle } from "lucide-react";
import { useLanguage } from "../i18n/LanguageProvider";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  secondaryAction?: { label: string; onClick: () => void };
}

export function ErrorState({
  title,
  message,
  onRetry,
  retryLabel,
  secondaryAction,
}: ErrorStateProps) {
  const { t } = useLanguage();
  const resolvedTitle = title ?? "";
  const resolvedRetryLabel = retryLabel ?? t("common.tryAgain");
  return (
    <div className="flex flex-col items-center gap-3 rounded-[28px] border border-[var(--color-line)] bg-white px-6 py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-blush)] text-[var(--color-rose)]">
        <AlertTriangle size={22} strokeWidth={1.75} />
      </div>
      <h3 className="font-display text-lg text-[var(--color-ink)]">{resolvedTitle}</h3>
      <p className="text-sm leading-relaxed text-[var(--color-muted)]">{message}</p>
      <div className="mt-1 flex w-full flex-col gap-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[44px] w-full rounded-full bg-[var(--color-ink)] px-4 text-sm font-semibold text-white transition-transform active:scale-95"
          >
            {resolvedRetryLabel}
          </button>
        )}
        {secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="min-h-[44px] w-full rounded-full border border-[var(--color-line)] px-4 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-blush)]"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}
