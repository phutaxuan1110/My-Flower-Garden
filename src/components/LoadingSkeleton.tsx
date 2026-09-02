export function BouquetCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
      <div className="aspect-[4/5] w-full bg-[var(--color-blush)]" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-2/3 rounded-full bg-[var(--color-blush)]" />
        <div className="h-2.5 w-1/2 rounded-full bg-[var(--color-blush)]" />
      </div>
    </div>
  );
}

export function CollectionGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <BouquetCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function GardenSkeleton() {
  return (
    <div className="animate-pulse space-y-4 px-5">
      <div className="h-5 w-40 rounded-full bg-[var(--color-blush)]" />
      <div className="h-4 w-24 rounded-full bg-[var(--color-blush)]" />
      <div className="mt-4 aspect-[3/4] w-full rounded-[32px] bg-[var(--color-blush)]" />
    </div>
  );
}
