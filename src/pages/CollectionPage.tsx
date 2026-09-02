import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { BouquetCard } from "../components/BouquetCard";
import { CollectionGridSkeleton } from "../components/LoadingSkeleton";
import { useGarden } from "../store/GardenProvider";
import { useLanguage } from "../i18n/LanguageProvider";
import { OCCASIONS } from "../types";
import type { Occasion } from "../types";
import type { TranslationKey } from "../i18n/translations";

type SortMode = "newest" | "oldest";

const OCCASION_KEYS: Record<Occasion, TranslationKey> = {
  Birthday: "occasion.Birthday",
  Anniversary: "occasion.Anniversary",
  Graduation: "occasion.Graduation",
  "Thank You": "occasion.Thank You",
  "Just Because": "occasion.Just Because",
  Custom: "occasion.Custom",
};

export function CollectionPage() {
  const { loading, bouquets, toggleFavorite } = useGarden();
  const { t } = useLanguage();
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
        {t("collection.title")} <em className="italic text-[var(--color-rose)]">{t("collection.titleEm")}</em>
      </h1>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex min-h-[44px] flex-1 items-center gap-2 rounded-full border border-[var(--color-line)] bg-white px-4">
          <Search size={16} className="text-[var(--color-muted)]" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("collection.searchPlaceholder")}
            className="w-full bg-transparent py-2 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
            aria-label={t("collection.searchPlaceholder")}
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label={t("common.close")}>
              <X size={14} className="text-[var(--color-muted)]" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          aria-label={t("collection.sortBy")}
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
            <p className="mb-2 text-xs font-medium text-[var(--color-muted)]">{t("collection.occasion")}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setOccasionFilter(null)}
                className={`min-h-[36px] rounded-full border px-3 text-xs ${
                  !occasionFilter ? "border-[var(--color-rose)] bg-[var(--color-rose)]/10 text-[var(--color-rose)]" : "border-[var(--color-line)] text-[var(--color-ink)]"
                }`}
              >
                {t("collection.filterAll")}
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
                  {t(OCCASION_KEYS[o])}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-[var(--color-muted)]">{t("collection.sortBy")}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSortMode("newest")}
                className={`min-h-[36px] flex-1 rounded-full border text-xs ${
                  sortMode === "newest" ? "border-[var(--color-rose)] bg-[var(--color-rose)]/10 text-[var(--color-rose)]" : "border-[var(--color-line)] text-[var(--color-ink)]"
                }`}
              >
                {t("collection.sortNewest")}
              </button>
              <button
                type="button"
                onClick={() => setSortMode("oldest")}
                className={`min-h-[36px] flex-1 rounded-full border text-xs ${
                  sortMode === "oldest" ? "border-[var(--color-rose)] bg-[var(--color-rose)]/10 text-[var(--color-rose)]" : "border-[var(--color-line)] text-[var(--color-ink)]"
                }`}
              >
                {t("collection.sortOldest")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5">
        {loading ? (
          <CollectionGridSkeleton />
        ) : bouquets.length === 0 ? (
          <p className="mt-10 text-center text-sm text-[var(--color-muted)]">{t("collection.emptyAll")}</p>
        ) : filtered.length === 0 ? (
          <p className="mt-10 text-center text-sm text-[var(--color-muted)]">{t("collection.emptyFiltered")}</p>
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
