import { BouquetFrame } from "./BouquetFrame";
import { FRAME_STYLES } from "../types";
import type { FrameStyle } from "../types";
import { useLanguage } from "../i18n/LanguageProvider";
import type { TranslationKey } from "../i18n/translations";

const FRAME_LABEL_KEYS: Record<FrameStyle, TranslationKey> = {
  "kraft-cone": "frame.kraftCone",
  "ribbon-round": "frame.ribbonRound",
  arch: "frame.arch",
  hexagon: "frame.hexagon",
  heart: "frame.heart",
  "classic-circle": "frame.classicCircle",
};

interface FramePickerProps {
  imageUrl: string;
  value: FrameStyle;
  onChange: (style: FrameStyle) => void;
}

export function FramePicker({ imageUrl, value, onChange }: FramePickerProps) {
  const { t } = useLanguage();
  return (
    <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
      {FRAME_STYLES.map((style) => (
        <button
          key={style}
          type="button"
          onClick={() => onChange(style)}
          className="flex shrink-0 flex-col items-center gap-1.5"
          aria-pressed={value === style}
        >
          <span
            className={`flex h-20 w-20 items-center justify-center rounded-2xl p-1 transition-colors ${
              value === style ? "bg-[var(--color-rose)]/15 ring-2 ring-[var(--color-rose)]" : "bg-transparent"
            }`}
          >
            <BouquetFrame imageUrl={imageUrl} frameStyle={style} alt="" className="h-16 w-16" />
          </span>
          <span
            className={`text-[11px] font-medium ${
              value === style ? "text-[var(--color-rose)]" : "text-[var(--color-muted)]"
            }`}
          >
            {t(FRAME_LABEL_KEYS[style])}
          </span>
        </button>
      ))}
    </div>
  );
}
