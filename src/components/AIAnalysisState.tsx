import { motion } from "framer-motion";
import { Flower2 } from "lucide-react";
import { useLanguage } from "../i18n/LanguageProvider";

export function AIAnalysisState({ imageUrl }: { imageUrl: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center px-8 py-6 text-center">
      <div className="relative h-48 w-48">
        <img
          src={imageUrl}
          alt="Your bouquet being analyzed"
          className="h-full w-full rounded-full object-cover opacity-90"
        />
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="absolute text-[var(--color-rose)]"
            style={{
              top: `${10 + i * 18}%`,
              left: i % 2 === 0 ? "-6%" : "88%",
            }}
            initial={{ opacity: 0, y: 6, rotate: 0 }}
            animate={{ opacity: [0, 1, 0], y: [-4, -18], rotate: 20 }}
            transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
          >
            <Flower2 size={16} strokeWidth={1.5} fill="currentColor" fillOpacity={0.15} />
          </motion.span>
        ))}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[var(--color-primary-strong)]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <motion.p
        key="analyzing-copy"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 font-display text-lg text-[var(--color-ink)]"
      >
        {t("add.analyzing.message")}
      </motion.p>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{t("add.analyzing.subtext")}</p>
    </div>
  );
}
