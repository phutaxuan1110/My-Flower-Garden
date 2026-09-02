import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

interface ToastProps {
  message: string;
  tone: "success" | "error" | "info";
}

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const TONE_STYLES = {
  success: "bg-[var(--color-ink)] text-white",
  error: "bg-[var(--color-rose)] text-white",
  info: "bg-white text-[var(--color-ink)] border border-[var(--color-line)]",
};

export function Toast({ message, tone }: ToastProps) {
  const Icon = ICONS[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.3 }}
      role="status"
      className={`pointer-events-auto flex max-w-sm items-center gap-2 rounded-full px-4 py-3 text-sm font-medium shadow-lg shadow-black/10 ${TONE_STYLES[tone]}`}
    >
      <Icon size={16} strokeWidth={1.75} className="shrink-0" />
      <span>{message}</span>
    </motion.div>
  );
}
