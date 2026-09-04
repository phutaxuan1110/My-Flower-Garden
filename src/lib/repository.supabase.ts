import { makeId, nowIso } from "./id";
import { supabase, BOUQUET_IMAGE_BUCKET } from "./supabaseClient";
import type { GardenRepository } from "./repository";
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
 * Supabase-backed GardenRepository. Every table is protected by Row Level
 * Security scoped to `auth.uid()` (see supabase/schema.sql), so this class
 * never filters by user id itself — the database does that. It only needs
 * the current user's id when *writing* a row for the first time.
 */

async function getUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not signed in.");
  return data.user.id;
}

function isDataUrl(value: string): boolean {
  return value.startsWith("data:image/");
}

async function uploadBouquetImage(userId: string, bouquetId: string, dataUrl: string): Promise<string> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const ext = blob.type.split("/")[1] || "jpg";
  const path = `${userId}/${bouquetId}.${ext}`;
  const { error } = await supabase.storage.from(BOUQUET_IMAGE_BUCKET).upload(path, blob, {
    upsert: true,
    contentType: blob.type,
  });
  if (error) throw error;
  return path;
}

async function signImageUrls(paths: (string | null | undefined)[]): Promise<Map<string, string>> {
  const clean = Array.from(new Set(paths.filter((p): p is string => !!p)));
  const map = new Map<string, string>();
  if (clean.length === 0) return map;
  // 7 days: long enough that a session doesn't need to refresh urls constantly,
  // short enough to not be a permanent public link if a URL ever leaks.
  const { data, error } = await supabase.storage
    .from(BOUQUET_IMAGE_BUCKET)
    .createSignedUrls(clean, 60 * 60 * 24 * 7);
  if (error || !data) return map;
  for (const entry of data) {
    if (entry.signedUrl && entry.path) map.set(entry.path, entry.signedUrl);
  }
  return map;
}

// ---- row <-> domain mapping ----

interface ProfileRow {
  id: string;
  display_name: string;
  garden_name: string;
  created_at: string;
  updated_at: string;
}
function profileFromRow(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    gardenName: row.garden_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface BouquetRow {
  id: string;
  user_id: string;
  name: string;
  image_storage_path: string | null;
  received_date: string;
  occasion: string | null;
  custom_occasion: string | null;
  gifted_by: string | null;
  personal_note: string | null;
  overall_meaning: string | null;
  is_favorite: boolean;
  detection_status: string;
  frame_style: string;
  created_at: string;
  updated_at: string;
}
function bouquetFromRow(row: BouquetRow, imageUrl: string): Bouquet {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    imageUrl,
    imageStoragePath: row.image_storage_path ?? undefined,
    receivedDate: row.received_date,
    occasion: (row.occasion as Bouquet["occasion"]) ?? undefined,
    customOccasion: row.custom_occasion ?? undefined,
    giftedBy: row.gifted_by ?? undefined,
    personalNote: row.personal_note ?? undefined,
    overallMeaning: row.overall_meaning ?? undefined,
    isFavorite: row.is_favorite,
    detectionStatus: row.detection_status as Bouquet["detectionStatus"],
    frameStyle: row.frame_style as Bouquet["frameStyle"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface FlowerRow {
  id: string;
  bouquet_id: string;
  common_name: string;
  scientific_name: string | null;
  color: string | null;
  estimated_quantity: number | null;
  confidence: number | null;
  meaning: string;
  symbolism: string[] | null;
  source: string;
}
function flowerFromRow(row: FlowerRow): BouquetFlower {
  return {
    id: row.id,
    bouquetId: row.bouquet_id,
    commonName: row.common_name,
    scientificName: row.scientific_name ?? undefined,
    color: row.color ?? undefined,
    estimatedQuantity: row.estimated_quantity ?? undefined,
    confidence: row.confidence ?? undefined,
    meaning: row.meaning,
    symbolism: row.symbolism ?? undefined,
    source: row.source as BouquetFlower["source"],
  };
}

interface AreaRow {
  id: string;
  user_id: string;
  name: string;
  order: number;
  theme: string;
}
function areaFromRow(row: AreaRow): GardenArea {
  return { id: row.id, userId: row.user_id, name: row.name, order: row.order, theme: row.theme };
}

interface PlacementRow {
  id: string;
  garden_area_id: string;
  bouquet_id: string;
  slot_id: string;
  vase_style: string | null;
  decoration_style: string | null;
  created_at: string;
  updated_at: string;
}
function placementFromRow(row: PlacementRow): GardenPlacement {
  return {
    id: row.id,
    gardenAreaId: row.garden_area_id,
    bouquetId: row.bouquet_id,
    slotId: row.slot_id,
    vaseStyle: (row.vase_style as VaseStyle) ?? undefined,
    decorationStyle: (row.decoration_style as DecorationStyle) ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseGardenRepository implements GardenRepository {
  // Coalesces concurrent "seed the first default area" attempts within this
  // session into a single in-flight request. Without this, two near-
  // simultaneous calls to listGardenAreas() (e.g. React effects that fire
  // more than once, or two screens loading at once) can each see "0 areas"
  // from their own SELECT before either's INSERT has committed, and each
  // independently create a duplicate "Garden Corner" row at order 0 — the
  // exact bug that produced two identical first gardens.
  private seedingDefaultArea: Promise<GardenArea> | null = null;

  async getProfile(): Promise<UserProfile> {
    const userId = await getUserId();
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw error;
    if (data) return profileFromRow(data as ProfileRow);

    // Normally created by the handle_new_user trigger on signup; this is a
    // fallback in case a row is somehow missing.
    const ts = nowIso();
    const { data: created, error: insertError } = await supabase
      .from("profiles")
      .insert({ id: userId, display_name: "Friend", garden_name: "My Flower Garden", created_at: ts, updated_at: ts })
      .select()
      .single();
    if (insertError) throw insertError;
    return profileFromRow(created as ProfileRow);
  }

  async updateProfile(patch: Partial<Pick<UserProfile, "displayName" | "gardenName">>): Promise<UserProfile> {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...(patch.displayName !== undefined ? { display_name: patch.displayName } : {}),
        ...(patch.gardenName !== undefined ? { garden_name: patch.gardenName } : {}),
        updated_at: nowIso(),
      })
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;
    return profileFromRow(data as ProfileRow);
  }

  async listBouquets(): Promise<Bouquet[]> {
    const { data, error } = await supabase.from("bouquets").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    const rows = (data ?? []) as BouquetRow[];
    const urls = await signImageUrls(rows.map((r) => r.image_storage_path));
    return rows.map((r) => bouquetFromRow(r, (r.image_storage_path && urls.get(r.image_storage_path)) || ""));
  }

  async getBouquet(id: string): Promise<Bouquet | undefined> {
    const { data, error } = await supabase.from("bouquets").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!data) return undefined;
    const row = data as BouquetRow;
    const urls = await signImageUrls([row.image_storage_path]);
    return bouquetFromRow(row, (row.image_storage_path && urls.get(row.image_storage_path)) || "");
  }

  async createBouquet(input: Omit<Bouquet, "id" | "createdAt" | "updatedAt" | "userId">): Promise<Bouquet> {
    const userId = await getUserId();
    const id = makeId();
    const ts = nowIso();

    let imageStoragePath: string | null = null;
    if (isDataUrl(input.imageUrl)) {
      imageStoragePath = await uploadBouquetImage(userId, id, input.imageUrl);
    }

    const { data, error } = await supabase
      .from("bouquets")
      .insert({
        id,
        user_id: userId,
        name: input.name,
        image_storage_path: imageStoragePath,
        received_date: input.receivedDate,
        occasion: input.occasion ?? null,
        custom_occasion: input.customOccasion ?? null,
        gifted_by: input.giftedBy ?? null,
        personal_note: input.personalNote ?? null,
        overall_meaning: input.overallMeaning ?? null,
        is_favorite: input.isFavorite,
        detection_status: input.detectionStatus,
        frame_style: input.frameStyle,
        created_at: ts,
        updated_at: ts,
      })
      .select()
      .single();
    if (error) throw error;

    const row = data as BouquetRow;
    const urls = await signImageUrls([row.image_storage_path]);
    return bouquetFromRow(row, (row.image_storage_path && urls.get(row.image_storage_path)) || input.imageUrl);
  }

  async updateBouquet(id: string, patch: Partial<Omit<Bouquet, "id" | "userId" | "createdAt">>): Promise<Bouquet> {
    const userId = await getUserId();
    const update: Record<string, unknown> = { updated_at: nowIso() };

    if (patch.imageUrl !== undefined && isDataUrl(patch.imageUrl)) {
      update.image_storage_path = await uploadBouquetImage(userId, id, patch.imageUrl);
    }
    if (patch.name !== undefined) update.name = patch.name;
    if (patch.receivedDate !== undefined) update.received_date = patch.receivedDate;
    if (patch.occasion !== undefined) update.occasion = patch.occasion;
    if (patch.customOccasion !== undefined) update.custom_occasion = patch.customOccasion;
    if (patch.giftedBy !== undefined) update.gifted_by = patch.giftedBy;
    if (patch.personalNote !== undefined) update.personal_note = patch.personalNote;
    if (patch.overallMeaning !== undefined) update.overall_meaning = patch.overallMeaning;
    if (patch.isFavorite !== undefined) update.is_favorite = patch.isFavorite;
    if (patch.detectionStatus !== undefined) update.detection_status = patch.detectionStatus;
    if (patch.frameStyle !== undefined) update.frame_style = patch.frameStyle;

    const { data, error } = await supabase.from("bouquets").update(update).eq("id", id).select().single();
    if (error) throw error;

    const row = data as BouquetRow;
    const urls = await signImageUrls([row.image_storage_path]);
    return bouquetFromRow(row, (row.image_storage_path && urls.get(row.image_storage_path)) || "");
  }

  async deleteBouquet(id: string): Promise<void> {
    const userId = await getUserId();
    // Best-effort: try both common extensions since we don't track content-type here.
    await supabase.storage.from(BOUQUET_IMAGE_BUCKET).remove([`${userId}/${id}.jpg`, `${userId}/${id}.png`, `${userId}/${id}.webp`]);
    const { error } = await supabase.from("bouquets").delete().eq("id", id);
    if (error) throw error;
  }

  async listFlowers(bouquetId: string): Promise<BouquetFlower[]> {
    const { data, error } = await supabase.from("bouquet_flowers").select("*").eq("bouquet_id", bouquetId);
    if (error) throw error;
    return (data as FlowerRow[]).map(flowerFromRow);
  }

  async replaceFlowers(
    bouquetId: string,
    flowers: Omit<BouquetFlower, "id" | "bouquetId">[]
  ): Promise<BouquetFlower[]> {
    const { error: deleteError } = await supabase.from("bouquet_flowers").delete().eq("bouquet_id", bouquetId);
    if (deleteError) throw deleteError;
    if (flowers.length === 0) return [];

    const { data, error } = await supabase
      .from("bouquet_flowers")
      .insert(
        flowers.map((f) => ({
          id: makeId(),
          bouquet_id: bouquetId,
          common_name: f.commonName,
          scientific_name: f.scientificName ?? null,
          color: f.color ?? null,
          estimated_quantity: f.estimatedQuantity ?? null,
          confidence: f.confidence ?? null,
          meaning: f.meaning,
          symbolism: f.symbolism ?? null,
          source: f.source,
        }))
      )
      .select();
    if (error) throw error;
    return (data as FlowerRow[]).map(flowerFromRow);
  }

  async listGardenAreas(): Promise<GardenArea[]> {
    const userId = await getUserId();
    const { data, error } = await supabase.from("garden_areas").select("*").order("order", { ascending: true });
    if (error) throw error;

    if (!data || data.length === 0) {
      // First-ever load for this user: seed a default area. Coalesced (see
      // `seedingDefaultArea`) so two callers racing to seed at once share
      // one insert instead of each creating their own duplicate area.
      if (!this.seedingDefaultArea) {
        this.seedingDefaultArea = this.createGardenArea("Garden Corner", "garden", 0, userId).finally(() => {
          this.seedingDefaultArea = null;
        });
      }
      return [await this.seedingDefaultArea];
    }

    return this.dedupeAreasByOrder(data as AreaRow[]);
  }

  /**
   * Self-heals data that already has more than one area sharing the same
   * `order` (from the race described above, before the coalescing guard
   * existed). Keeps exactly one area per order value: the one an existing
   * placement points to if any duplicate has bouquets in it, otherwise the
   * first one returned. Every other duplicate is *renumbered* to the next
   * free order rather than deleted, so no bouquet or placement is ever
   * lost — it just becomes a legitimate, distinctly-ordered extra area.
   */
  private async dedupeAreasByOrder(rows: AreaRow[]): Promise<GardenArea[]> {
    const byOrder = new Map<number, AreaRow[]>();
    for (const row of rows) {
      const group = byOrder.get(row.order) ?? [];
      group.push(row);
      byOrder.set(row.order, group);
    }
    const hasDuplicates = [...byOrder.values()].some((group) => group.length > 1);
    if (!hasDuplicates) return rows.map(areaFromRow);

    const { data: placementRows } = await supabase.from("garden_placements").select("garden_area_id");
    const areaIdsWithPlacements = new Set((placementRows ?? []).map((p: { garden_area_id: string }) => p.garden_area_id));

    let nextFreeOrder = Math.max(...rows.map((r) => r.order)) + 1;
    const resolved: AreaRow[] = [];
    for (const [, group] of byOrder) {
      if (group.length === 1) {
        resolved.push(group[0]);
        continue;
      }
      const keeperIndex = Math.max(
        0,
        group.findIndex((row) => areaIdsWithPlacements.has(row.id))
      );
      group.forEach((row, i) => {
        if (i === keeperIndex) {
          resolved.push(row);
          return;
        }
        const renumbered = { ...row, order: nextFreeOrder++ };
        resolved.push(renumbered);
        void supabase.from("garden_areas").update({ order: renumbered.order }).eq("id", row.id);
      });
    }
    resolved.sort((a, b) => a.order - b.order);
    return resolved.map(areaFromRow);
  }

  async createGardenArea(name: string, theme: string, order?: number, presetUserId?: string): Promise<GardenArea> {
    const userId = presetUserId ?? (await getUserId());
    let resolvedOrder = order;
    if (resolvedOrder === undefined) {
      // Only hit when a caller doesn't already know the intended order —
      // still has the same race window in theory (two concurrent calls can
      // both COUNT before either INSERTs), but callers in this app always
      // pass an explicit order now (see GardenProvider), so this fallback
      // only exists for interface completeness.
      const { count } = await supabase
        .from("garden_areas")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      resolvedOrder = count ?? 0;
    }
    const { data, error } = await supabase
      .from("garden_areas")
      .insert({ id: makeId(), user_id: userId, name, order: resolvedOrder, theme })
      .select()
      .single();
    if (error) throw error;
    return areaFromRow(data as AreaRow);
  }

  async listPlacements(): Promise<GardenPlacement[]> {
    const { data, error } = await supabase.from("garden_placements").select("*");
    if (error) throw error;
    return (data as PlacementRow[]).map(placementFromRow);
  }

  async placeBouquet(args: {
    bouquetId: string;
    gardenAreaId: string;
    slotId: string;
    vaseStyle?: VaseStyle;
    decorationStyle?: DecorationStyle;
  }): Promise<{ ok: true; placement: GardenPlacement } | { ok: false; reason: "slot-occupied"; occupiedBy: string }> {
    const { data: occupant } = await supabase
      .from("garden_placements")
      .select("bouquet_id")
      .eq("garden_area_id", args.gardenAreaId)
      .eq("slot_id", args.slotId)
      .neq("bouquet_id", args.bouquetId)
      .maybeSingle();
    if (occupant) {
      return { ok: false, reason: "slot-occupied", occupiedBy: (occupant as { bouquet_id: string }).bouquet_id };
    }

    const ts = nowIso();
    const { data, error } = await supabase
      .from("garden_placements")
      .upsert(
        {
          garden_area_id: args.gardenAreaId,
          bouquet_id: args.bouquetId,
          slot_id: args.slotId,
          vase_style: args.vaseStyle ?? "clay-pot",
          decoration_style: args.decorationStyle ?? "none",
          updated_at: ts,
        },
        { onConflict: "bouquet_id" }
      )
      .select()
      .single();
    if (error) throw error;
    return { ok: true, placement: placementFromRow(data as PlacementRow) };
  }

  async swapPlacements(bouquetIdA: string, bouquetIdB: string): Promise<void> {
    const { data, error } = await supabase
      .from("garden_placements")
      .select("*")
      .in("bouquet_id", [bouquetIdA, bouquetIdB]);
    if (error) throw error;
    const rows = data as PlacementRow[];
    const a = rows.find((r) => r.bouquet_id === bouquetIdA);
    const b = rows.find((r) => r.bouquet_id === bouquetIdB);
    if (!a || !b) throw new Error("Both bouquets must be placed to swap.");

    const ts = nowIso();
    const { error: err1 } = await supabase
      .from("garden_placements")
      .update({ garden_area_id: b.garden_area_id, slot_id: b.slot_id, updated_at: ts })
      .eq("id", a.id);
    if (err1) throw err1;
    const { error: err2 } = await supabase
      .from("garden_placements")
      .update({ garden_area_id: a.garden_area_id, slot_id: a.slot_id, updated_at: ts })
      .eq("id", b.id);
    if (err2) throw err2;
  }

  async removePlacement(bouquetId: string): Promise<void> {
    const { error } = await supabase.from("garden_placements").delete().eq("bouquet_id", bouquetId);
    if (error) throw error;
  }
}
