import React, { createContext, useCallback, useContext, useState } from "react";

interface GardenEditModeContextValue {
  isActive: boolean;
  /** The bouquet pre-selected for repositioning when edit mode was entered, if any. */
  targetBouquetId: string | null;
  enter: (bouquetId?: string) => void;
  exit: () => void;
}

const GardenEditModeContext = createContext<GardenEditModeContextValue | null>(null);

export function GardenEditModeProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [targetBouquetId, setTargetBouquetId] = useState<string | null>(null);

  const enter = useCallback((bouquetId?: string) => {
    setTargetBouquetId(bouquetId ?? null);
    setIsActive(true);
  }, []);

  const exit = useCallback(() => {
    setIsActive(false);
    setTargetBouquetId(null);
  }, []);

  return (
    <GardenEditModeContext.Provider value={{ isActive, targetBouquetId, enter, exit }}>
      {children}
    </GardenEditModeContext.Provider>
  );
}

export function useGardenEditMode(): GardenEditModeContextValue {
  const ctx = useContext(GardenEditModeContext);
  if (!ctx) throw new Error("useGardenEditMode must be used within GardenEditModeProvider");
  return ctx;
}
