import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { useLanguage } from "../i18n/LanguageProvider";

interface CameraCaptureProps {
  onFileSelected: (file: File) => void;
  onPermissionDenied: () => void;
}

export function CameraCapture({ onFileSelected, onPermissionDenied }: CameraCaptureProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isChecking, setIsChecking] = useState(false);

  async function handleTap() {
    if (!navigator.mediaDevices?.getUserMedia) {
      inputRef.current?.click();
      return;
    }
    setIsChecking(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      stream.getTracks().forEach((t) => t.stop());
      inputRef.current?.click();
    } catch {
      onPermissionDenied();
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleTap}
        disabled={isChecking}
        className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-rose)] px-4 text-sm font-semibold text-white shadow-md shadow-[var(--color-rose)]/30 transition-transform active:scale-95 disabled:opacity-70"
      >
        <Camera size={16} strokeWidth={1.75} /> {isChecking ? t("add.source.checkingCamera") : t("add.source.takePhoto")}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
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
