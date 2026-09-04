import { Lock } from "lucide-react";
import lockedGateImage from "../assets/garden/my-flower-garden-locked.png";
import { useLanguage } from "../i18n/LanguageProvider";

/**
 * Placeholder shown instead of the real map art for a garden area that
 * hasn't unlocked yet. Deliberately shows no map preview and no real area
 * name — by design the person should only know "there's something next",
 * not what it looks like or is called, until they actually earn it.
 *
 * Uses the same aspect ratio + object-contain sizing as GardenCanvas /
 * GardenBackdrop (aspect-[572/1024], full width) so this card is always
 * exactly the same height as the unlocked map beside it in the horizontal
 * scroller — previously it used a flex/padding-based card shape that didn't
 * match, causing a visible height mismatch when peeking the next page.
 */
export function LockedGardenArea() {
  const { t } = useLanguage();
  return (
    <div className="relative aspect-[572/1024] w-full overflow-hidden rounded-[32px] border border-[var(--color-line)] bg-[var(--color-primary)]">
      <img
        src={lockedGateImage}
        alt=""
        aria-hidden="true"
        className="no-callout absolute inset-0 h-full w-full select-none object-contain"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
      />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 bg-gradient-to-t from-black/35 to-transparent px-8 pb-8 pt-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-[var(--color-rose)] shadow-sm">
          <Lock size={20} />
        </div>
        <p className="font-display text-lg italic text-white drop-shadow">{t("garden.lock.title")}</p>
        <p className="max-w-[220px] text-sm text-white/90 drop-shadow">{t("garden.lock.description")}</p>
      </div>
    </div>
  );
}
