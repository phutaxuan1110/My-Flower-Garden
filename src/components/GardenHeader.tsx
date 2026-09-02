import { useLanguage } from "../i18n/LanguageProvider";

function greetingKey(): "garden.greeting.morning" | "garden.greeting.afternoon" | "garden.greeting.evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "garden.greeting.morning";
  if (hour < 18) return "garden.greeting.afternoon";
  return "garden.greeting.evening";
}

export function GardenHeader({ displayName, gardenName }: { displayName: string; gardenName: string }) {
  const { t } = useLanguage();
  return (
    <div className="px-5 pt-6">
      <p className="text-sm text-[var(--color-muted)]">
        {t(greetingKey())}, {displayName}
      </p>
      <h1 className="mt-1 font-display text-[28px] leading-tight text-[var(--color-ink)]">
        <em className="not-italic font-display italic text-[var(--color-rose)]">{gardenName}</em>
      </h1>
    </div>
  );
}
