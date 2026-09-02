import { Sprout } from "lucide-react";
import { useAddFlow } from "../hooks/useAddFlow";
import { useLanguage } from "../i18n/LanguageProvider";

export function EmptyGardenState() {
  const { open } = useAddFlow();
  const { t } = useLanguage();
  return (
    <div className="mx-5 mt-8 flex flex-col items-center rounded-[32px] border border-dashed border-[var(--color-primary-strong)] bg-white/60 px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-blush)] text-[var(--color-rose)]">
        <Sprout size={28} strokeWidth={1.5} />
      </div>
      <h2 className="mt-5 font-display text-2xl text-[var(--color-ink)]">
        {t("garden.empty.title")} <em className="italic text-[var(--color-rose)]">{t("garden.empty.titleEm")}</em>
      </h2>
      <p className="mt-2 max-w-[26ch] text-sm leading-relaxed text-[var(--color-muted)]">
        {t("garden.empty.body")}
      </p>
      <button
        type="button"
        onClick={open}
        className="mt-6 min-h-[44px] rounded-full bg-[var(--color-rose)] px-6 text-sm font-semibold text-white shadow-md shadow-[var(--color-rose)]/30 transition-transform active:scale-95"
      >
        {t("garden.empty.cta")}
      </button>
    </div>
  );
}
