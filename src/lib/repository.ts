import { makeId, nowIso } from "./id";
import type {
  Bouquet,
  BouquetFlower,
  GardenArea,
  GardenPlacement,
  UserProfile,
  VaseStyle,
  DecorationStyle,
} from "../types";

/**
 * GardenRepository is the single seam between UI/state and persistence.
 * Today it's backed by localStorage so the demo works fully offline with
 * durable reloads. To move to production, implement the same interface
 * against Supabase (Postgres tables mirroring these shapes + Storage for
 * imageUrl) and swap the export at the bottom of this file — nothing in
 * components or hooks needs to change.
 */
export interface GardenRepository {
  getProfile(): Promise<UserProfile>;
  updateProfile(patch: Partial<Pick<UserProfile, "displayName" | "gardenName">>): Promise<UserProfile>;

  listBouquets(): Promise<Bouquet[]>;
  getBouquet(id: string): Promise<Bouquet | undefined>;
  createBouquet(input: Omit<Bouquet, "id" | "createdAt" | "updatedAt" | "userId">): Promise<Bouquet>;
  updateBouquet(id: string, patch: Partial<Omit<Bouquet, "id" | "userId" | "createdAt">>): Promise<Bouquet>;
  deleteBouquet(id: string): Promise<void>;

  listFlowers(bouquetId: string): Promise<BouquetFlower[]>;
  replaceFlowers(bouquetId: string, flowers: Omit<BouquetFlower, "id" | "bouquetId">[]): Promise<BouquetFlower[]>;

  listGardenAreas(): Promise<GardenArea[]>;
  createGardenArea(name: string, theme: string): Promise<GardenArea>;

  listPlacements(): Promise<GardenPlacement[]>;
  placeBouquet(args: {
    bouquetId: string;
    gardenAreaId: string;
    slotId: string;
    vaseStyle?: VaseStyle;
    decorationStyle?: DecorationStyle;
  }): Promise<{ ok: true; placement: GardenPlacement } | { ok: false; reason: "slot-occupied"; occupiedBy: string }>;
  swapPlacements(bouquetIdA: string, bouquetIdB: string): Promise<void>;
  removePlacement(bouquetId: string): Promise<void>;

  getOnboardingComplete(): Promise<boolean>;
  setOnboardingComplete(value: boolean): Promise<void>;
}

const KEYS = {
  profile: "mfg:profile",
  bouquets: "mfg:bouquets",
  flowers: "mfg:flowers",
  gardenAreas: "mfg:gardenAreas",
  placements: "mfg:placements",
  onboarding: "mfg:onboardingComplete",
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Simulated network latency keeps loading states honest during development.
function tick<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const DEFAULT_USER_ID = "local-user";

export class LocalStorageGardenRepository implements GardenRepository {
  private ensureProfile(): UserProfile {
    let profile = read<UserProfile | null>(KEYS.profile, null);
    if (!profile) {
      const ts = nowIso();
      profile = {
        id: DEFAULT_USER_ID,
        displayName: "Friend",
        gardenName: "My Flower Garden",
        createdAt: ts,
        updatedAt: ts,
      };
      write(KEYS.profile, profile);
    }
    return profile;
  }

  private ensureDefaultGardenArea(): GardenArea[] {
    let areas = read<GardenArea[]>(KEYS.gardenAreas, []);
    if (areas.length === 0) {
      areas = [{ id: makeId(), userId: DEFAULT_USER_ID, name: "Garden Corner", order: 0, theme: "spring" }];
      write(KEYS.gardenAreas, areas);
    }
    return areas;
  }

  async getProfile(): Promise<UserProfile> {
    return tick(this.ensureProfile());
  }

  async updateProfile(patch: Partial<Pick<UserProfile, "displayName" | "gardenName">>): Promise<UserProfile> {
    const profile = { ...this.ensureProfile(), ...patch, updatedAt: nowIso() };
    write(KEYS.profile, profile);
    return tick(profile);
  }

  async listBouquets(): Promise<Bouquet[]> {
    this.ensureProfile();
    return tick(read<Bouquet[]>(KEYS.bouquets, []));
  }

  async getBouquet(id: string): Promise<Bouquet | undefined> {
    const all = read<Bouquet[]>(KEYS.bouquets, []);
    return tick(all.find((b) => b.id === id));
  }

  async createBouquet(input: Omit<Bouquet, "id" | "createdAt" | "userId" | "updatedAt">): Promise<Bouquet> {
    const all = read<Bouquet[]>(KEYS.bouquets, []);
    const ts = nowIso();
    const bouquet: Bouquet = {
      ...input,
      id: makeId(),
      userId: DEFAULT_USER_ID,
      createdAt: ts,
      updatedAt: ts,
    };
    write(KEYS.bouquets, [...all, bouquet]);
    return tick(bouquet, 400);
  }

  async updateBouquet(id: string, patch: Partial<Omit<Bouquet, "id" | "userId" | "createdAt">>): Promise<Bouquet> {
    const all = read<Bouquet[]>(KEYS.bouquets, []);
    const idx = all.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Bouquet not found");
    const updated: Bouquet = { ...all[idx], ...patch, id: all[idx].id, updatedAt: nowIso() };
    const next = [...all];
    next[idx] = updated;
    write(KEYS.bouquets, next);
    return tick(updated, 300);
  }

  async deleteBouquet(id: string): Promise<void> {
    const bouquets = read<Bouquet[]>(KEYS.bouquets, []).filter((b) => b.id !== id);
    const flowers = read<BouquetFlower[]>(KEYS.flowers, []).filter((f) => f.bouquetId !== id);
    const placements = read<GardenPlacement[]>(KEYS.placements, []).filter((p) => p.bouquetId !== id);
    write(KEYS.bouquets, bouquets);
    write(KEYS.flowers, flowers);
    write(KEYS.placements, placements);
    return tick(undefined, 250);
  }

  async listFlowers(bouquetId: string): Promise<BouquetFlower[]> {
    return tick(read<BouquetFlower[]>(KEYS.flowers, []).filter((f) => f.bouquetId === bouquetId));
  }

  async replaceFlowers(
    bouquetId: string,
    flowers: Omit<BouquetFlower, "id" | "bouquetId">[]
  ): Promise<BouquetFlower[]> {
    const all = read<BouquetFlower[]>(KEYS.flowers, []).filter((f) => f.bouquetId !== bouquetId);
    const created = flowers.map((f) => ({ ...f, id: makeId(), bouquetId }));
    write(KEYS.flowers, [...all, ...created]);
    return tick(created, 150);
  }

  async listGardenAreas(): Promise<GardenArea[]> {
    return tick(this.ensureDefaultGardenArea());
  }

  async createGardenArea(name: string, theme: string): Promise<GardenArea> {
    const areas = this.ensureDefaultGardenArea();
    const area: GardenArea = { id: makeId(), userId: DEFAULT_USER_ID, name, order: areas.length, theme };
    write(KEYS.gardenAreas, [...areas, area]);
    return tick(area, 200);
  }

  async listPlacements(): Promise<GardenPlacement[]> {
    return tick(read<GardenPlacement[]>(KEYS.placements, []));
  }

  async placeBouquet(args: {
    bouquetId: string;
    gardenAreaId: string;
    slotId: string;
    vaseStyle?: VaseStyle;
    decorationStyle?: DecorationStyle;
  }): Promise<{ ok: true; placement: GardenPlacement } | { ok: false; reason: "slot-occupied"; occupiedBy: string }> {
    const placements = read<GardenPlacement[]>(KEYS.placements, []);
    const occupant = placements.find(
      (p) =>
        p.gardenAreaId === args.gardenAreaId &&
        p.slotId === args.slotId &&
        p.bouquetId !== args.bouquetId
    );
    if (occupant) {
      return tick({ ok: false, reason: "slot-occupied", occupiedBy: occupant.bouquetId });
    }

    const existingIdx = placements.findIndex((p) => p.bouquetId === args.bouquetId);
    const ts = nowIso();
    let placement: GardenPlacement;
    let next: GardenPlacement[];
    if (existingIdx >= 0) {
      placement = {
        ...placements[existingIdx],
        gardenAreaId: args.gardenAreaId,
        slotId: args.slotId,
        vaseStyle: args.vaseStyle ?? placements[existingIdx].vaseStyle,
        decorationStyle: args.decorationStyle ?? placements[existingIdx].decorationStyle,
        updatedAt: ts,
      };
      next = [...placements];
      next[existingIdx] = placement;
    } else {
      placement = {
        id: makeId(),
        gardenAreaId: args.gardenAreaId,
        bouquetId: args.bouquetId,
        slotId: args.slotId,
        vaseStyle: args.vaseStyle ?? "clay-pot",
        decorationStyle: args.decorationStyle ?? "none",
        createdAt: ts,
        updatedAt: ts,
      };
      next = [...placements, placement];
    }
    write(KEYS.placements, next);
    return tick({ ok: true, placement }, 350);
  }

  async swapPlacements(bouquetIdA: string, bouquetIdB: string): Promise<void> {
    const placements = read<GardenPlacement[]>(KEYS.placements, []);
    const idxA = placements.findIndex((p) => p.bouquetId === bouquetIdA);
    const idxB = placements.findIndex((p) => p.bouquetId === bouquetIdB);
    if (idxA === -1 || idxB === -1) throw new Error("Both bouquets must be placed to swap.");
    const next = [...placements];
    const ts = nowIso();
    const slotA = next[idxA].slotId;
    const areaA = next[idxA].gardenAreaId;
    next[idxA] = { ...next[idxA], slotId: next[idxB].slotId, gardenAreaId: next[idxB].gardenAreaId, updatedAt: ts };
    next[idxB] = { ...next[idxB], slotId: slotA, gardenAreaId: areaA, updatedAt: ts };
    write(KEYS.placements, next);
    return tick(undefined, 300);
  }

  async removePlacement(bouquetId: string): Promise<void> {
    const placements = read<GardenPlacement[]>(KEYS.placements, []).filter((p) => p.bouquetId !== bouquetId);
    write(KEYS.placements, placements);
    return tick(undefined, 200);
  }

  async getOnboardingComplete(): Promise<boolean> {
    return tick(read<boolean>(KEYS.onboarding, false), 30);
  }

  async setOnboardingComplete(value: boolean): Promise<void> {
    write(KEYS.onboarding, value);
    return tick(undefined, 30);
  }
}

export const gardenRepository: GardenRepository = new LocalStorageGardenRepository();
