import { AnimatePresence, motion } from "framer-motion";

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/30 p-4 md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-xl"
          >
            <h3 id="confirm-title" className="font-display text-xl text-[var(--color-ink)]">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{description}</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="min-h-[44px] flex-1 rounded-full border border-[var(--color-line)] px-4 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-blush)]"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`min-h-[44px] flex-1 rounded-full px-4 text-sm font-semibold text-white transition-transform active:scale-95 ${
                  destructive ? "bg-[var(--color-rose)]" : "bg-[var(--color-ink)]"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
