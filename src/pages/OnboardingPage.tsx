import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Sparkles, Sprout } from "lucide-react";
import { useGarden } from "../store/GardenProvider";
import { useLanguage } from "../i18n/LanguageProvider";
import { useNavigate } from "react-router-dom";
import type { TranslationKey } from "../i18n/translations";

const SLIDES: { icon: typeof Camera; titleKey: TranslationKey; bodyKey: TranslationKey }[] = [
  { icon: Camera, titleKey: "onboarding.slide1.title", bodyKey: "onboarding.slide1.body" },
  { icon: Sparkles, titleKey: "onboarding.slide2.title", bodyKey: "onboarding.slide2.body" },
  { icon: Sprout, titleKey: "onboarding.slide3.title", bodyKey: "onboarding.slide3.body" },
];

export function OnboardingPage() {
  const [index, setIndex] = useState(0);
  const { completeOnboarding } = useGarden();
  const { t } = useLanguage();
  const navigate = useNavigate();

  async function finish() {
    await completeOnboarding();
    navigate("/garden", { replace: true });
  }

  const slide = SLIDES[index];
  const Icon = slide.icon;
  const isLast = index === SLIDES.length - 1;

  return (
    // Full-bleed background container: fixed viewport height (with a `vh`
    // fallback for older browsers, see `.full-bleed-height`) + overflow
    // hidden, so the gradient always covers the entire screen edge-to-edge
    // — including behind the status bar / notch — and the page can never
    // rubber-band/overscroll to reveal `body`'s background color above it.
    // The previous `min-h-screen` (100vh, normal document flow) had no such
    // guarantee, which is what produced the white gap above the status bar.
    <div className="full-bleed-height fixed inset-0 w-full overflow-hidden bg-gradient-to-b from-[var(--color-blush)] to-[var(--color-bg)]">
      {/* Safe-area-aware content container: padding only (never a separate
          background), so the gradient above stays continuous behind the
          safe areas while Skip/CTA still clear the notch and Home
          Indicator. `max()` keeps sane spacing on devices with no inset. */}
      <div
        className="flex h-full flex-col items-center justify-between px-8 text-center"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 24px)",
          paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
        }}
      >
        <button
          type="button"
          onClick={finish}
          className="self-end text-sm font-medium text-[var(--color-muted)] underline-offset-4 hover:underline"
        >
          {t("onboarding.skip")}
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="no-scrollbar flex flex-1 flex-col items-center justify-center overflow-y-auto"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-rose)] shadow-lg shadow-[var(--color-rose)]/20">
              <Icon size={38} strokeWidth={1.5} />
            </div>
            <h1 className="mt-8 font-display text-3xl text-[var(--color-ink)]">{t(slide.titleKey)}</h1>
            <p className="mt-3 max-w-[30ch] text-[15px] leading-relaxed text-[var(--color-muted)]">
              {t(slide.bodyKey)}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="w-full shrink-0">
          <div className="mb-6 flex items-center justify-center gap-2">
            {SLIDES.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-[var(--color-rose)]" : "w-1.5 bg-[var(--color-line)]"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => (isLast ? finish() : setIndex((i) => i + 1))}
            className="min-h-[44px] w-full rounded-full bg-[var(--color-rose)] text-sm font-semibold text-white shadow-md shadow-[var(--color-rose)]/30 transition-transform active:scale-95"
          >
            {isLast ? t("onboarding.start") : t("onboarding.next")}
          </button>
        </div>
      </div>
    </div>
  );
}
