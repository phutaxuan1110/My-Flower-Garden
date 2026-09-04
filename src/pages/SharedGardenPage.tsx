import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Eye, Flower2, Sprout } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { BouquetCard } from "../components/BouquetCard";
import { GardenCanvas } from "../components/GardenCanvas";
import { useLanguage } from "../i18n/LanguageProvider";
import { parseLocalDateString } from "../lib/date";
import { themeForAreaOrder } from "../lib/gardenLayout";
import { fetchSharedGarden } from "../lib/shareService";
import type { SharedGardenData } from "../lib/shareService";
import type { BouquetWithFlowers, Occasion } from "../types";
import type { TranslationKey } from "../i18n/translations";

const OCCASION_KEYS: Record<Occasion, TranslationKey> = {
  Birthday: "occasion.Birthday",
  Anniversary: "occasion.Anniversary",
  Graduation: "occasion.Graduation",
  "Thank You": "occasion.Thank You",
  "Just Because": "occasion.Just Because",
  Custom: "occasion.Custom",
};

function SharedBouquetDetail({ bouquet, data, onBack }: {
  bouquet: BouquetWithFlowers;
  data: SharedGardenData;
  onBack: () => void;
}) {
  const { t } = useLanguage();
  const areaName = bouquet.placement
    ? data.areas.find((area) => area.id === bouquet.placement?.gardenAreaId)?.name
    : null;

  return (
    <div className="min-h-full pb-8">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-blush)]">
        {bouquet.imageUrl && <img src={bouquet.imageUrl} alt={bouquet.name} className="h-full w-full object-cover" />}
        <button
          type="button"
          onClick={onBack}
          aria-label={t("common.back")}
          className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[var(--color-ink)] shadow-sm"
          style={{ top: "calc(env(safe-area-inset-top) + 1rem)" }}
        >
          <ArrowLeft size={18} />
        </button>
        <span
          className="absolute right-4 rounded-full bg-white/90 px-3 py-2 text-xs font-medium text-[var(--color-muted)] shadow-sm"
          style={{ top: "calc(env(safe-area-inset-top) + 1rem)" }}
        >
          {t("share.readOnly")}
        </span>
      </div>

      <div className="px-5 pt-5">
        <h1 className="font-display text-2xl text-[var(--color-ink)]">{bouquet.name}</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {parseLocalDateString(bouquet.receivedDate).toLocaleDateString(undefined, {
            year: "numeric", month: "long", day: "numeric",
          })}
          {bouquet.occasion
            ? ` · ${bouquet.occasion === "Custom" ? bouquet.customOccasion || t(OCCASION_KEYS.Custom) : t(OCCASION_KEYS[bouquet.occasion])}`
            : ""}
        </p>
        {areaName && <p className="mt-2 text-sm text-[var(--color-muted)]">{t("share.growingIn")} {areaName}</p>}
        {bouquet.overallMeaning && (
          <p className="mt-4 font-display text-lg italic leading-relaxed text-[var(--color-rose)]">
            “{bouquet.overallMeaning}”
          </p>
        )}

        <h2 className="mt-6 font-display text-lg text-[var(--color-ink)]">{t("detail.theFlowers")}</h2>
        <div className="mt-3 space-y-3">
          {bouquet.flowers.map((flower) => (
            <div key={flower.id} className="rounded-[22px] border border-[var(--color-line)] bg-white p-4">
              <div className="flex flex-wrap items-baseline gap-1.5">
                <h3 className="font-display text-base text-[var(--color-ink)]">{flower.commonName}</h3>
                {flower.scientificName && <span className="text-xs italic text-[var(--color-muted)]">{flower.scientificName}</span>}
              </div>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                {[flower.color, flower.estimatedQuantity ? `${flower.estimatedQuantity} ${t("flower.stems")}` : null]
                  .filter(Boolean).join(" · ")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]">{flower.meaning}</p>
              {flower.symbolism && flower.symbolism.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {flower.symbolism.map((tag) => (
                    <span key={tag} className="rounded-full bg-[var(--color-lavender)]/50 px-2.5 py-1 text-[11px] text-[var(--color-ink)]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {bouquet.flowers.length === 0 && (
            <p className="text-sm text-[var(--color-muted)]">{t("collection.noSpeciesYet")}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function SharedGardenPage() {
  const { shareToken, bouquetId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [data, setData] = useState<SharedGardenData | null>(null);
  const [error, setError] = useState(false);
  const isCollection = pathname.endsWith("/collection");

  useEffect(() => {
    let active = true;
    if (!shareToken) return;
    setError(false);
    fetchSharedGarden(shareToken)
      .then((result) => active && setData(result))
      .catch(() => active && setError(true));
    return () => { active = false; };
  }, [shareToken]);

  const bouquetsById = useMemo(
    () => new Map((data?.bouquets ?? []).map((bouquet) => [bouquet.id, bouquet])),
    [data]
  );
  const placements = useMemo(
    () => (data?.bouquets ?? []).flatMap((bouquet) => bouquet.placement ? [bouquet.placement] : []),
    [data]
  );
  const speciesCount = useMemo(
    () => new Set((data?.bouquets ?? []).flatMap((bouquet) => bouquet.flowers.map((flower) => flower.commonName.toLowerCase()))).size,
    [data]
  );
  const ambientAreaIds = useMemo(() => {
    const areas = data?.areas ?? [];
    const areaIdsWithPlacements = new Set(placements.map((placement) => placement.gardenAreaId));
    const selectedByTheme = new Map<string, string>();

    // Prefer the first area of each visual theme that contains real bouquet
    // placements. This keeps stale/duplicate empty rows in shared data from
    // consuming the one ambient-animation slot for that theme.
    for (const area of areas) {
      const theme = themeForAreaOrder(area.order);
      if (!areaIdsWithPlacements.has(area.id) || selectedByTheme.has(theme)) continue;
      selectedByTheme.set(theme, area.id);
    }

    // A newly created first area can still animate before its first bouquet.
    for (const area of areas) {
      const theme = themeForAreaOrder(area.order);
      if (!selectedByTheme.has(theme)) selectedByTheme.set(theme, area.id);
    }

    return new Set(selectedByTheme.values());
  }, [data, placements]);

  if (!data && !error) {
    return <div className="fixed inset-0 h-auto min-h-0 animate-pulse bg-[var(--color-bg)]" />;
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 flex h-auto min-h-0 items-center justify-center bg-[var(--color-bg)] px-8 text-center">
        <div>
          <Flower2 className="mx-auto text-[var(--color-rose)]" size={36} strokeWidth={1.5} />
          <h1 className="mt-4 font-display text-2xl text-[var(--color-ink)]">{t("share.notFoundTitle")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{t("share.notFoundBody")}</p>
        </div>
      </div>
    );
  }

  const detailBouquet = bouquetId ? bouquetsById.get(bouquetId) : undefined;
  const openBouquet = (id: string) => navigate(`/share/${shareToken}/bouquet/${id}`);

  return (
    <div className="fixed inset-0 h-auto min-h-0 w-full overflow-hidden bg-gradient-to-b from-[var(--color-blush)] to-[var(--color-bg)] md:flex md:items-center md:justify-center md:py-10">
      <main className="paper-grain relative mx-auto flex h-full w-full max-w-[480px] flex-col overflow-hidden bg-[var(--color-bg)] md:h-[880px] md:rounded-[36px] md:shadow-2xl">
        {detailBouquet ? (
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
            <SharedBouquetDetail bouquet={detailBouquet} data={data} onBack={() => navigate(-1)} />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
              <header className="px-5 pt-6" style={{ paddingTop: "max(env(safe-area-inset-top), 24px)" }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted)]">
                    <Eye size={14} /> {t("share.readOnly")}
                  </p>
                  <h1 className="mt-1 font-display text-[28px] italic leading-tight text-[var(--color-rose)]">{data.gardenName}</h1>
                </div>
                <Sprout size={28} strokeWidth={1.4} className="text-[var(--color-ink)]" />
              </div>
            </header>

              {!isCollection ? (
              <>
                <div className="mx-5 mt-4 flex items-center gap-4 rounded-[24px] border border-[var(--color-line)] bg-white/70 px-4 py-3">
                  <span className="font-display text-lg text-[var(--color-ink)]">{data.bouquets.length}</span>
                  <span className="text-xs text-[var(--color-muted)]">{t("garden.counter.bouquets")}</span>
                  <span className="h-6 w-px bg-[var(--color-line)]" />
                  <span className="font-display text-lg text-[var(--color-ink)]">{speciesCount}</span>
                  <span className="text-xs text-[var(--color-muted)]">{t("garden.counter.species")}</span>
                </div>
                <div className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5">
                  {data.areas.map((area) => (
                    <section key={area.id} className="w-full shrink-0 snap-center">
                      <h2 className="mb-2 font-display text-sm italic text-[var(--color-muted)]">{area.name}</h2>
                      <GardenCanvas
                        placements={placements.filter((placement) => placement.gardenAreaId === area.id)}
                        bouquetsById={bouquetsById}
                        theme={themeForAreaOrder(area.order)}
                        ambientAnimation={ambientAreaIds.has(area.id)}
                        onOpenBouquet={openBouquet}
                      />
                    </section>
                  ))}
                </div>
                {data.areas.length === 0 && (
                  <p className="mt-12 px-8 text-center text-sm text-[var(--color-muted)]">{t("share.emptyGarden")}</p>
                )}
              </>
              ) : (
              <section className="px-5 pt-5">
                <h2 className="font-display text-2xl text-[var(--color-ink)]">{t("collection.title")}</h2>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {data.bouquets.map((bouquet) => (
                    <BouquetCard key={bouquet.id} bouquet={bouquet} onOpen={() => openBouquet(bouquet.id)} />
                  ))}
                </div>
                {data.bouquets.length === 0 && (
                  <p className="mt-12 text-center text-sm text-[var(--color-muted)]">{t("share.emptyCollection")}</p>
                )}
              </section>
              )}
            </div>

            <nav className="safe-bottom relative z-20 flex w-full shrink-0 gap-2 border-t border-[var(--color-line)] bg-white/95 px-5 pt-3 shadow-[0_-8px_24px_rgba(74,53,64,0.08)] backdrop-blur-md">
              <button
                type="button"
                onClick={() => navigate(`/share/${shareToken}`)}
                className={`flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full text-sm font-medium ${!isCollection ? "bg-[var(--color-rose)] text-white" : "text-[var(--color-ink)]"}`}
              >
                <Sprout size={17} /> {t("nav.garden")}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/share/${shareToken}/collection`)}
                className={`flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full text-sm font-medium ${isCollection ? "bg-[var(--color-rose)] text-white" : "text-[var(--color-ink)]"}`}
              >
                <BookOpen size={17} /> {t("nav.collection")}
              </button>
            </nav>
          </div>
        )}
      </main>
    </div>
  );
}
