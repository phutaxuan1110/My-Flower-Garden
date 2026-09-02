function timeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function GardenHeader({ displayName, gardenName }: { displayName: string; gardenName: string }) {
  return (
    <div className="px-5 pt-6">
      <p className="text-sm text-[var(--color-muted)]">
        {timeGreeting()}, {displayName}
      </p>
      <h1 className="mt-1 font-display text-[28px] leading-tight text-[var(--color-ink)]">
        <em className="not-italic font-display italic text-[var(--color-rose)]">{gardenName}</em>
      </h1>
    </div>
  );
}
