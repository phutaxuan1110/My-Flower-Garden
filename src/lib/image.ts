// Image validation + client-side compression.
// In production this would upload the compressed blob to Supabase Storage and
// only send a reference to the server-side AI endpoint. For this demo the
// compressed image is kept as a data URL in local persistence.

export const MAX_FILE_SIZE_MB = 12;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export class ImageValidationError extends Error {}

export function validateImageFile(file: File): void {
  const isAcceptedType =
    ACCEPTED_TYPES.includes(file.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);
  if (!isAcceptedType) {
    throw new ImageValidationError(
      "This file type isn't supported. Please choose a JPEG, PNG, WEBP or HEIC photo."
    );
  }
  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > MAX_FILE_SIZE_MB) {
    throw new ImageValidationError(
      `This photo is too large (${sizeMb.toFixed(1)}MB). Please choose a photo under ${MAX_FILE_SIZE_MB}MB.`
    );
  }
}

/**
 * Reads the file, corrects orientation via the browser's built-in EXIF handling
 * (createImageBitmap respects orientation in supporting browsers), downsizes it
 * to a reasonable max dimension, and re-encodes as JPEG for a predictable size.
 */
export async function compressImageToDataUrl(
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<string> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(
    async () => {
      // Fallback for browsers without createImageBitmap orientation support.
      const url = URL.createObjectURL(file);
      const img = await loadImage(url);
      URL.revokeObjectURL(url);
      return img;
    }
  );

  const { width, height } = getBitmapSize(bitmap);
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported in this browser.");
  ctx.drawImage(bitmap as any, 0, 0, targetW, targetH);

  return canvas.toDataURL("image/jpeg", quality);
}

function getBitmapSize(bitmap: ImageBitmap | HTMLImageElement) {
  if ("width" in bitmap && "height" in bitmap) {
    return { width: (bitmap as any).width, height: (bitmap as any).height };
  }
  return { width: 800, height: 800 };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
