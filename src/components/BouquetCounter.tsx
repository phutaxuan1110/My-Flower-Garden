import { Flower2, Sprout } from "lucide-react";
import { useLanguage } from "../i18n/LanguageProvider";

export function BouquetCounter({ totalCount, speciesCount }: { totalCount: number; speciesCount: number }) {
  const { t } = useLanguage();
  return (
    <div className="mx-5 mt-4 flex items-center gap-4 rounded-[24px] border border-[var(--color-line)] bg-white/70 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-ink)]">
          <Flower2 size={17} strokeWidth={1.75} />
        </span>
        <div>
          <p className="font-display text-lg leading-none text-[var(--color-ink)]">{totalCount}</p>
          <p className="text-[11px] text-[var(--color-muted)]">
            {totalCount === 1 ? t("garden.counter.bouquet") : t("garden.counter.bouquets")}
          </p>
        </div>
      </div>
      <div className="h-8 w-px bg-[var(--color-line)]" />
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-lavender)] text-[var(--color-ink)]">
          <Sprout size={17} strokeWidth={1.75} />
        </span>
        <div>
          <p className="font-display text-lg leading-none text-[var(--color-ink)]">{speciesCount}</p>
          <p className="text-[11px] text-[var(--color-muted)]">{t("garden.counter.species")}</p>
        </div>
      </div>
    </div>
  );
}
