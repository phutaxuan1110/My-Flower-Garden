import { useRef } from "react";
import { Image as ImageIcon } from "lucide-react";
import { useLanguage } from "../i18n/LanguageProvider";

interface ImageUploaderProps {
  onFileSelected?: (file: File) => void;
  onFilesSelected?: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ImageUploader({ onFileSelected, onFilesSelected, disabled, className, children }: ImageUploaderProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={
          className ??
          "flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[var(--color-line)] px-4 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-blush)]"
        }
      >
        {children ?? (
          <>
            <ImageIcon size={16} strokeWidth={1.75} /> {t("add.source.chooseLibrary")}
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple={Boolean(onFilesSelected)}
        disabled={disabled}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length && onFilesSelected) onFilesSelected(files);
          else if (files[0]) onFileSelected?.(files[0]);
          e.target.value = "";
        }}
      />
    </>
  );
}
