import { NavLink } from "react-router-dom";
import { Sprout, BookHeart, Plus, Heart, User } from "lucide-react";
import { useAddFlow } from "../hooks/useAddFlow";

const ITEM_CLASS =
  "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors";

export function BottomNavigation() {
  const { open } = useAddFlow();

  return (
    <nav
      aria-label="Primary"
      className="safe-bottom absolute inset-x-0 bottom-0 z-40 border-t border-[var(--color-line)] bg-white/90 backdrop-blur"
    >
      <div className="relative mx-auto flex max-w-[480px] items-stretch px-2">
        <NavLink
          to="/garden"
          className={({ isActive }) =>
            `${ITEM_CLASS} ${isActive ? "text-[var(--color-rose)]" : "text-[var(--color-muted)]"}`
          }
        >
          <Sprout size={22} strokeWidth={1.6} />
          Garden
        </NavLink>
        <NavLink
          to="/collection"
          className={({ isActive }) =>
            `${ITEM_CLASS} ${isActive ? "text-[var(--color-rose)]" : "text-[var(--color-muted)]"}`
          }
        >
          <BookHeart size={22} strokeWidth={1.6} />
          Collection
        </NavLink>

        <div className="flex flex-1 items-center justify-center">
          <button
            type="button"
            onClick={open}
            aria-label="Add a bouquet"
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
          Favorites
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${ITEM_CLASS} ${isActive ? "text-[var(--color-rose)]" : "text-[var(--color-muted)]"}`
          }
        >
          <User size={22} strokeWidth={1.6} />
          Profile
        </NavLink>
      </div>
    </nav>
  );
}
