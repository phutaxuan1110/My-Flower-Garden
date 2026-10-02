import type { Bouquet, BouquetPhoto } from "../types";
export const MAX_BOUQUET_PHOTOS = 10;
/** First photo is the cover. Legacy single-photo records need no migration in UI. */
export function bouquetPhotos(bouquet: Pick<Bouquet, "id" | "imageUrl" | "imageStoragePath" | "photos">): BouquetPhoto[] {
  return bouquet.photos?.length ? bouquet.photos : bouquet.imageUrl ? [{id: bouquet.imageStoragePath ?? bouquet.id, url: bouquet.imageUrl, storagePath: bouquet.imageStoragePath}] : [];
}
