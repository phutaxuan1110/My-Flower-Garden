import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { BouquetCard } from "../components/BouquetCard";
import { CollectionGridSkeleton } from "../components/LoadingSkeleton";
import { useGarden } from "../store/GardenProvider";
import { OCCASIONS } from "../types";

type SortMode = "newest" | "oldest";

export function CollectionPage() {
  const { loading, bouquets, toggleFavorite } = useGarden();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [occasionFilter, setOccasionFilter] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...bouquets];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.flowers.some((f) => f.commonName.toLowerCase().includes(q))
      );
    }
    if (occasionFilter) {
      list = list.filter((b) => b.occasion === occasionFilter);
    }
    list.sort((a, b) => {
      const diff = new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime();
      return sortMode === "newest" ? -diff : diff;
    });
    return list;
  }, [bouquets, query, occasionFilter, sortMode]);

  return (
    <div className="px-5 pt-6">
      <h1 className="font-display text-2xl text-[var(--color-ink)]">
        Your <em className="italic text-[var(--color-rose)]">Collection</em>
      </h1>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex min-h-[44px] flex-1 items-center gap-2 rounded-full border border-[var(--color-line)] bg-white px-4">
          <Search size={16} className="text-[var(--color-muted)]" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bouquets or flowers"
            className="w-full bg-transparent py-2 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
            aria-label="Search bouquets"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
              <X size={14} className="text-[var(--color-muted)]" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          aria-label="Filter and sort"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
            showFilters || occasionFilter ? "border-[var(--color-rose)] text-[var(--color-rose)]" : "border-[var(--color-line)] text-[var(--color-ink)]"
          }`}
        >
          <SlidersHorizontal size={16} strokeWidth={1.75} />
        </button>
      </div>

      {showFilters && (
        <div className="mt-3 space-y-3 rounded-[20px] border border-[var(--color-line)] bg-white p-4">
          <div>
            <p className="mb-2 text-xs font-medium text-[var(--color-muted)]">Occasion</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setOccasionFilter(null)}
                className={`min-h-[36px] rounded-full border px-3 text-xs ${
                  !occasionFilter ? "border-[var(--color-rose)] bg-[var(--color-rose)]/10 text-[var(--color-rose)]" : "border-[var(--color-line)] text-[var(--color-ink)]"
                }`}
              >
                All
              </button>
              {OCCASIONS.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOccasionFilter(o)}
                  className={`min-h-[36px] rounded-full border px-3 text-xs ${
                    occasionFilter === o ? "border-[var(--color-rose)] bg-[var(--color-rose)]/10 text-[var(--color-rose)]" : "border-[var(--color-line)] text-[var(--color-ink)]"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-[var(--color-muted)]">Sort by</p>
            <div className="flex gap-2">
              {(["newest", "oldest"] as SortMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSortMode(mode)}
                  className={`min-h-[36px] flex-1 rounded-full border text-xs capitalize ${
                    sortMode === mode ? "border-[var(--color-rose)] bg-[var(--color-rose)]/10 text-[var(--color-rose)]" : "border-[var(--color-line)] text-[var(--color-ink)]"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-5">
        {loading ? (
          <CollectionGridSkeleton />
        ) : bouquets.length === 0 ? (
          <p className="mt-10 text-center text-sm text-[var(--color-muted)]">
            Nothing here yet. Add your first bouquet to start your collection.
          </p>
        ) : filtered.length === 0 ? (
          <p className="mt-10 text-center text-sm text-[var(--color-muted)]">
            No bouquets match your search or filters.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {filtered.map((b) => (
              <BouquetCard
                key={b.id}
                bouquet={b}
                onOpen={() => navigate(`/bouquet/${b.id}`)}
                onToggleFavorite={() => toggleFavorite(b.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
