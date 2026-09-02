import { useRef, useState } from "react";
import { Camera } from "lucide-react";

interface CameraCaptureProps {
  onFileSelected: (file: File) => void;
  onPermissionDenied: () => void;
}

export function CameraCapture({ onFileSelected, onPermissionDenied }: CameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isChecking, setIsChecking] = useState(false);

  async function handleTap() {
    if (!navigator.mediaDevices?.getUserMedia) {
      // No camera API available (e.g. desktop browser without a camera) — fall
      // back straight to the capture input, which will no-op gracefully.
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
        <Camera size={16} strokeWidth={1.75} /> {isChecking ? "Checking camera…" : "Take a photo"}
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
