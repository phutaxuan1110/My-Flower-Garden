import { useRef } from "react";
import { Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  onFileSelected: (file: File) => void;
  className?: string;
  children?: React.ReactNode;
}

export function ImageUploader({ onFileSelected, className, children }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={
          className ??
          "flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[var(--color-line)] px-4 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-blush)]"
        }
      >
        {children ?? (
          <>
            <ImageIcon size={16} strokeWidth={1.75} /> Choose from library
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
          e.target.value = "";
        }}
      />
    </>
  );
}
