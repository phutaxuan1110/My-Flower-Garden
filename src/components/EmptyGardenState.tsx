import { Sprout } from "lucide-react";
import { useAddFlow } from "../hooks/useAddFlow";

export function EmptyGardenState() {
  const { open } = useAddFlow();
  return (
    <div className="mx-5 mt-8 flex flex-col items-center rounded-[32px] border border-dashed border-[var(--color-primary-strong)] bg-white/60 px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-blush)] text-[var(--color-rose)]">
        <Sprout size={28} strokeWidth={1.5} />
      </div>
      <h2 className="mt-5 font-display text-2xl text-[var(--color-ink)]">
        Your garden is <em className="italic text-[var(--color-rose)]">waiting to bloom</em>
      </h2>
      <p className="mt-2 max-w-[26ch] text-sm leading-relaxed text-[var(--color-muted)]">
        Add your first bouquet and turn a beautiful moment into a memory that keeps growing.
      </p>
      <button
        type="button"
        onClick={open}
        className="mt-6 min-h-[44px] rounded-full bg-[var(--color-rose)] px-6 text-sm font-semibold text-white shadow-md shadow-[var(--color-rose)]/30 transition-transform active:scale-95"
      >
        Add my first bouquet
      </button>
    </div>
  );
}
