import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { gardenRepository } from "../lib/repository";
import { SLOTS_PER_AREA } from "../lib/gardenLayout";
import type {
  Bouquet,
  BouquetFlower,
  BouquetWithFlowers,
  DecorationStyle,
  GardenArea,
  GardenPlacement,
  UserProfile,
  VaseStyle,
} from "../types";

interface CreateBouquetInput {
  imageUrl: string;
  name: string;
  receivedDate: string;
  occasion?: Bouquet["occasion"];
  customOccasion?: string;
  giftedBy?: string;
  personalNote?: string;
  overallMeaning?: string;
  isFavorite: boolean;
  detectionStatus: Bouquet["detectionStatus"];
  frameStyle: Bouquet["frameStyle"];
  flowers: Omit<BouquetFlower, "id" | "bouquetId">[];
}

interface GardenContextValue {
  loading: boolean;
  profile: UserProfile | null;
  bouquets: BouquetWithFlowers[];
  gardenAreas: GardenArea[];
  totalCount: number;
  speciesCount: number;
  favoriteBouquets: BouquetWithFlowers[];
  getBouquet: (id: string) => BouquetWithFlowers | undefined;
  createBouquet: (input: CreateBouquetInput) => Promise<Bouquet>;
  updateBouquet: (
    id: string,
    patch: Partial<Omit<Bouquet, "id" | "userId" | "createdAt">>,
    flowers?: Omit<BouquetFlower, "id" | "bouquetId">[]
  ) => Promise<void>;
  deleteBouquet: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  ensureAreaWithFreeSlot: () => Promise<{ area: GardenArea; slotId: string }>;
  placeBouquet: (args: {
    bouquetId: string;
    gardenAreaId: string;
    slotId: string;
    vaseStyle?: VaseStyle;
    decorationStyle?: DecorationStyle;
  }) => Promise<{ ok: true } | { ok: false; occupiedByName: string; occupiedByBouquetId: string }>;
  swapPlacements: (bouquetIdA: string, bouquetIdB: string) => Promise<void>;
  removePlacement: (bouquetId: string) => Promise<void>;
  updateProfile: (patch: Partial<Pick<UserProfile, "displayName" | "gardenName">>) => Promise<void>;
}

const GardenContext = createContext<GardenContextValue | null>(null);

export function GardenProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rawBouquets, setRawBouquets] = useState<Bouquet[]>([]);
  const [flowers, setFlowers] = useState<BouquetFlower[]>([]);
  const [gardenAreas, setGardenAreas] = useState<GardenArea[]>([]);
  const [placements, setPlacements] = useState<GardenPlacement[]>([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [p, b, areas] = await Promise.all([
      gardenRepository.getProfile(),
      gardenRepository.listBouquets(),
      gardenRepository.listGardenAreas(),
    ]);
    const allFlowers: BouquetFlower[] = [];
    for (const bouquet of b) {
      const fs = await gardenRepository.listFlowers(bouquet.id);
      allFlowers.push(...fs);
    }
    const allPlacements = await gardenRepository.listPlacements();
    setProfile(p);
    setRawBouquets(b);
    setFlowers(allFlowers);
    setGardenAreas(areas);
    setPlacements(allPlacements);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const bouquets: BouquetWithFlowers[] = useMemo(() => {
    return rawBouquets
      .map((b) => ({
        ...b,
        flowers: flowers.filter((f) => f.bouquetId === b.id),
        placement: placements.find((p) => p.bouquetId === b.id),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [rawBouquets, flowers, placements]);

  const totalCount = rawBouquets.length;
  const speciesCount = useMemo(
    () => new Set(flowers.map((f) => f.commonName.trim().toLowerCase())).size,
    [flowers]
  );
  const favoriteBouquets = useMemo(() => bouquets.filter((b) => b.isFavorite), [bouquets]);

  const getBouquet = useCallback((id: string) => bouquets.find((b) => b.id === id), [bouquets]);

  const createBouquet = useCallback(async (input: CreateBouquetInput) => {
    const bouquet = await gardenRepository.createBouquet({
      imageUrl: input.imageUrl,
      name: input.name,
      receivedDate: input.receivedDate,
      occasion: input.occasion,
      customOccasion: input.customOccasion,
      giftedBy: input.giftedBy,
      personalNote: input.personalNote,
      overallMeaning: input.overallMeaning,
      isFavorite: input.isFavorite,
      detectionStatus: input.detectionStatus,
      frameStyle: input.frameStyle,
    });
    const createdFlowers = await gardenRepository.replaceFlowers(bouquet.id, input.flowers);
    setRawBouquets((prev) => [...prev, bouquet]);
    setFlowers((prev) => [...prev, ...createdFlowers]);
    return bouquet;
  }, []);

  const updateBouquet = useCallback(
    async (
      id: string,
      patch: Partial<Omit<Bouquet, "id" | "userId" | "createdAt">>,
      newFlowers?: Omit<BouquetFlower, "id" | "bouquetId">[]
    ) => {
      const updated = await gardenRepository.updateBouquet(id, patch);
      setRawBouquets((prev) => prev.map((b) => (b.id === id ? updated : b)));
      if (newFlowers) {
        const created = await gardenRepository.replaceFlowers(id, newFlowers);
        setFlowers((prev) => [...prev.filter((f) => f.bouquetId !== id), ...created]);
      }
    },
    []
  );

  const deleteBouquet = useCallback(async (id: string) => {
    await gardenRepository.deleteBouquet(id);
    setRawBouquets((prev) => prev.filter((b) => b.id !== id));
    setFlowers((prev) => prev.filter((f) => f.bouquetId !== id));
    setPlacements((prev) => prev.filter((p) => p.bouquetId !== id));
  }, []);

  const toggleFavorite = useCallback(
    async (id: string) => {
      const current = rawBouquets.find((b) => b.id === id);
      if (!current) return;
      const updated = await gardenRepository.updateBouquet(id, { isFavorite: !current.isFavorite });
      setRawBouquets((prev) => prev.map((b) => (b.id === id ? updated : b)));
    },
    [rawBouquets]
  );

  const ensureAreaWithFreeSlot = useCallback(async () => {
    let areas = gardenAreas.length ? gardenAreas : await gardenRepository.listGardenAreas();
    for (const area of areas) {
      const occupiedSlots = new Set(placements.filter((p) => p.gardenAreaId === area.id).map((p) => p.slotId));
      const freeSlot = SLOTS_PER_AREA.find((s) => !occupiedSlots.has(s.id));
      if (freeSlot) return { area, slotId: freeSlot.id };
    }
    const newArea = await gardenRepository.createGardenArea(
      `Garden Corner ${areas.length + 1}`,
      "spring"
    );
    setGardenAreas((prev) => [...prev, newArea]);
    return { area: newArea, slotId: SLOTS_PER_AREA[0].id };
  }, [gardenAreas, placements]);

  const placeBouquet = useCallback(
    async (args: {
      bouquetId: string;
      gardenAreaId: string;
      slotId: string;
      vaseStyle?: VaseStyle;
      decorationStyle?: DecorationStyle;
    }) => {
      const result = await gardenRepository.placeBouquet(args);
      if (!result.ok) {
        const occupant = bouquets.find((b) => b.id === result.occupiedBy);
        return {
          ok: false as const,
          occupiedByName: occupant?.name ?? "another bouquet",
          occupiedByBouquetId: result.occupiedBy,
        };
      }
      const fresh = await gardenRepository.listPlacements();
      setPlacements(fresh);
      return { ok: true as const };
    },
    [bouquets]
  );

  const swapPlacements = useCallback(async (bouquetIdA: string, bouquetIdB: string) => {
    await gardenRepository.swapPlacements(bouquetIdA, bouquetIdB);
    const fresh = await gardenRepository.listPlacements();
    setPlacements(fresh);
  }, []);

  const removePlacement = useCallback(async (bouquetId: string) => {
    await gardenRepository.removePlacement(bouquetId);
    setPlacements((prev) => prev.filter((p) => p.bouquetId !== bouquetId));
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<Pick<UserProfile, "displayName" | "gardenName">>) => {
      const updated = await gardenRepository.updateProfile(patch);
      setProfile(updated);
    },
    []
  );

  const value: GardenContextValue = {
    loading,
    profile,
    bouquets,
    gardenAreas,
    totalCount,
    speciesCount,
    favoriteBouquets,
    getBouquet,
    createBouquet,
    updateBouquet,
    deleteBouquet,
    toggleFavorite,
    ensureAreaWithFreeSlot,
    placeBouquet,
    swapPlacements,
    removePlacement,
    updateProfile,
  };

  return <GardenContext.Provider value={value}>{children}</GardenContext.Provider>;
}

export function useGarden(): GardenContextValue {
  const ctx = useContext(GardenContext);
  if (!ctx) throw new Error("useGarden must be used within GardenProvider");
  return ctx;
}
