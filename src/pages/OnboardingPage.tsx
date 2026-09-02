import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Sparkles, Sprout } from "lucide-react";
import { useGarden } from "../store/GardenProvider";
import { useNavigate } from "react-router-dom";

const SLIDES = [
  {
    icon: Camera,
    title: "Save every bouquet",
    body: "Upload or photograph the bouquets you don't want to forget.",
  },
  {
    icon: Sparkles,
    title: "Discover their meanings",
    body: "AI helps identify each flower and explains what it symbolizes.",
  },
  {
    icon: Sprout,
    title: "Grow your own garden",
    body: "Place every bouquet into a personal garden that keeps growing with you.",
  },
];

export function OnboardingPage() {
  const [index, setIndex] = useState(0);
  const { completeOnboarding } = useGarden();
  const navigate = useNavigate();

  async function finish() {
    await completeOnboarding();
    navigate("/garden", { replace: true });
  }

  const slide = SLIDES[index];
  const Icon = slide.icon;
  const isLast = index === SLIDES.length - 1;

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-gradient-to-b from-[var(--color-blush)] to-[var(--color-bg)] px-8 py-12 text-center">
      <button
        type="button"
        onClick={finish}
        className="self-end text-sm font-medium text-[var(--color-muted)] underline-offset-4 hover:underline"
      >
        Skip
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
          className="flex flex-1 flex-col items-center justify-center"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-rose)] shadow-lg shadow-[var(--color-rose)]/20">
            <Icon size={38} strokeWidth={1.5} />
          </div>
          <h1 className="mt-8 font-display text-3xl text-[var(--color-ink)]">{slide.title}</h1>
          <p className="mt-3 max-w-[30ch] text-[15px] leading-relaxed text-[var(--color-muted)]">{slide.body}</p>
        </motion.div>
      </AnimatePresence>

      <div className="w-full">
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
          {isLast ? "Start my garden" : "Next"}
        </button>
      </div>
    </div>
  );
}
