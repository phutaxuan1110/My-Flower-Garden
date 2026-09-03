const DATABASE_NAME = "my-flower-garden";
const DATABASE_VERSION = 1;
const IMAGE_STORE = "bouquet-images";
const IMAGE_REFERENCE_PREFIX = "indexeddb://bouquet-image/";

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      if (!("indexedDB" in globalThis)) {
        reject(new Error("IndexedDB is not available in this browser."));
        return;
      }

      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(IMAGE_STORE)) {
          database.createObjectStore(IMAGE_STORE);
        }
      };
      request.onsuccess = () => {
        const database = request.result;
        database.onversionchange = () => {
          database.close();
          databasePromise = null;
        };
        resolve(database);
      };
      request.onerror = () => {
        databasePromise = null;
        reject(request.error ?? new Error("Unable to open image storage."));
      };
      request.onblocked = () => {
        databasePromise = null;
        reject(new Error("Image storage is blocked by another app session."));
      };
    });
  }

  return databasePromise;
}

function waitForTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Image storage transaction failed."));
    transaction.onabort = () => reject(transaction.error ?? new Error("Image storage transaction was aborted."));
  });
}

export function bouquetImageReference(bouquetId: string): string {
  return `${IMAGE_REFERENCE_PREFIX}${bouquetId}`;
}

export function isBouquetImageReference(value: string): boolean {
  return value.startsWith(IMAGE_REFERENCE_PREFIX);
}

export async function storeBouquetImage(bouquetId: string, imageUrl: string): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(IMAGE_STORE, "readwrite");
  transaction.objectStore(IMAGE_STORE).put(imageUrl, bouquetId);
  await waitForTransaction(transaction);
}

export async function readBouquetImage(bouquetId: string): Promise<string | undefined> {
  const database = await openDatabase();
  const transaction = database.transaction(IMAGE_STORE, "readonly");
  const request = transaction.objectStore(IMAGE_STORE).get(bouquetId);
  const result = await new Promise<unknown>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to read the bouquet image."));
  });
  await waitForTransaction(transaction);
  return typeof result === "string" ? result : undefined;
}

export async function deleteBouquetImage(bouquetId: string): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(IMAGE_STORE, "readwrite");
  transaction.objectStore(IMAGE_STORE).delete(bouquetId);
  await waitForTransaction(transaction);
}
