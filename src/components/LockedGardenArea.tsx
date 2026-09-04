import { Lock } from "lucide-react";
import { useLanguage } from "../i18n/LanguageProvider";

/**
 * Placeholder shown instead of the real map art for a garden area that
 * hasn't unlocked yet. Deliberately shows no map preview and no real area
 * name — by design the person should only know "there's something next",
 * not what it looks like or is called, until they actually earn it.
 */
export function LockedGardenArea() {
  const { t } = useLanguage();
  return (
    <div className="relative flex aspect-[572/1024] w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-[32px] border border-dashed border-[var(--color-line)] bg-[var(--color-blush)]/40 px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/70 text-[var(--color-rose)] shadow-sm">
        <Lock size={26} />
      </div>
      <p className="font-display text-lg italic text-[var(--color-ink)]">{t("garden.lock.title")}</p>
      <p className="max-w-[220px] text-sm text-[var(--color-muted)]">{t("garden.lock.description")}</p>
    </div>
  );
}
