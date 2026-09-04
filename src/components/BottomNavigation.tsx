import { NavLink } from "react-router-dom";
import { Sprout, BookHeart, Plus, Heart, User } from "lucide-react";
import { useAddFlow } from "../hooks/useAddFlow";
import { useLanguage } from "../i18n/LanguageProvider";

const ITEM_CLASS =
  "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors";

export function BottomNavigation() {
  const { open } = useAddFlow();
  const { t } = useLanguage();

  return (
    <nav
      aria-label="Primary"
      className="bottom-navigation safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] border-t border-[var(--color-line)] bg-white/90 backdrop-blur md:absolute"
    >
      <div className="relative mx-auto flex max-w-[480px] items-stretch px-2">
        <NavLink
          to="/garden"
          className={({ isActive }) =>
            `${ITEM_CLASS} ${isActive ? "text-[var(--color-rose)]" : "text-[var(--color-muted)]"}`
          }
        >
          <Sprout size={22} strokeWidth={1.6} />
          {t("nav.garden")}
        </NavLink>
        <NavLink
          to="/collection"
          className={({ isActive }) =>
            `${ITEM_CLASS} ${isActive ? "text-[var(--color-rose)]" : "text-[var(--color-muted)]"}`
          }
        >
          <BookHeart size={22} strokeWidth={1.6} />
          {t("nav.collection")}
        </NavLink>

        <div className="flex flex-1 items-center justify-center">
          <button
            type="button"
            onClick={open}
            aria-label={t("nav.addBouquet")}
            className="-mt-7 flex h-16 w-16 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[var(--color-rose)] text-white shadow-lg shadow-[var(--color-rose)]/40 ring-4 ring-white transition-transform active:scale-95"
          >
            <Plus size={28} strokeWidth={2} />
          </button>
        </div>

        <NavLink
          to="/favorites"
          className={({ isActive }) =>
            `${ITEM_CLASS} ${isActive ? "text-[var(--color-rose)]" : "text-[var(--color-muted)]"}`
          }
        >
          <Heart size={22} strokeWidth={1.6} />
          {t("nav.favorites")}
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${ITEM_CLASS} ${isActive ? "text-[var(--color-rose)]" : "text-[var(--color-muted)]"}`
          }
        >
          <User size={22} strokeWidth={1.6} />
          {t("nav.profile")}
        </NavLink>
      </div>
    </nav>
  );
}
