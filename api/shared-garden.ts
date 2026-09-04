import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const token = typeof req.query.token === "string" ? req.query.token : "";
  if (!UUID_RE.test(token)) return res.status(404).json({ error: "Garden not found" });

  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Shared garden API is missing Supabase server credentials");
    return res.status(500).json({ error: "Sharing is not configured" });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { data: share, error: shareError } = await admin
      .from("garden_shares")
      .select("user_id")
      .eq("token", token)
      .maybeSingle();
    if (shareError) throw shareError;
    if (!share) return res.status(404).json({ error: "Garden not found" });

    const ownerId = (share as { user_id: string }).user_id;
    const [profileResult, areasResult, bouquetsResult] = await Promise.all([
      admin.from("profiles").select("garden_name").eq("id", ownerId).maybeSingle(),
      admin.from("garden_areas").select("id,name,order,theme").eq("user_id", ownerId).order("order"),
      admin
        .from("bouquets")
        .select(
          "id,name,image_storage_path,received_date,occasion,custom_occasion,overall_meaning,detection_status,frame_style,created_at,updated_at"
        )
        .eq("user_id", ownerId)
        .order("created_at", { ascending: false }),
    ]);
    if (profileResult.error) throw profileResult.error;
    if (areasResult.error) throw areasResult.error;
    if (bouquetsResult.error) throw bouquetsResult.error;

    const bouquetRows = bouquetsResult.data ?? [];
    const bouquetIds = bouquetRows.map((bouquet) => bouquet.id);
    const [flowersResult, placementsResult] = bouquetIds.length
      ? await Promise.all([
          admin
            .from("bouquet_flowers")
            .select("id,bouquet_id,common_name,scientific_name,color,estimated_quantity,confidence,meaning,symbolism,source")
            .in("bouquet_id", bouquetIds),
          admin
            .from("garden_placements")
            .select("id,garden_area_id,bouquet_id,slot_id,vase_style,decoration_style,created_at,updated_at")
            .in("bouquet_id", bouquetIds),
        ])
      : [{ data: [], error: null }, { data: [], error: null }];
    if (flowersResult.error) throw flowersResult.error;
    if (placementsResult.error) throw placementsResult.error;

    const imagePaths = bouquetRows
      .map((bouquet) => bouquet.image_storage_path)
      .filter((path): path is string => Boolean(path));
    const signedUrls = new Map<string, string>();
    if (imagePaths.length) {
      const { data: signedData, error: signedError } = await admin.storage
        .from("bouquet-images")
        .createSignedUrls(imagePaths, 60 * 60);
      if (signedError) throw signedError;
      for (const entry of signedData ?? []) {
        if (entry.path && entry.signedUrl) signedUrls.set(entry.path, entry.signedUrl);
      }
    }

    const flowers = flowersResult.data ?? [];
    const placements = placementsResult.data ?? [];
    return res.status(200).json({
      gardenName: profileResult.data?.garden_name ?? "My Flower Garden",
      areas: (areasResult.data ?? []).map((area) => ({
        id: area.id,
        userId: "",
        name: area.name,
        order: area.order,
        theme: area.theme,
      })),
      bouquets: bouquetRows.map((bouquet) => {
        const placement = placements.find((item) => item.bouquet_id === bouquet.id);
        return {
          id: bouquet.id,
          userId: "",
          name: bouquet.name,
          imageUrl: bouquet.image_storage_path ? signedUrls.get(bouquet.image_storage_path) ?? "" : "",
          receivedDate: bouquet.received_date,
          occasion: bouquet.occasion ?? undefined,
          customOccasion: bouquet.custom_occasion ?? undefined,
          overallMeaning: bouquet.overall_meaning ?? undefined,
          isFavorite: false,
          detectionStatus: bouquet.detection_status,
          frameStyle: bouquet.frame_style,
          createdAt: bouquet.created_at,
          updatedAt: bouquet.updated_at,
          flowers: flowers
            .filter((flower) => flower.bouquet_id === bouquet.id)
            .map((flower) => ({
              id: flower.id,
              bouquetId: flower.bouquet_id,
              commonName: flower.common_name,
              scientificName: flower.scientific_name ?? undefined,
              color: flower.color ?? undefined,
              estimatedQuantity: flower.estimated_quantity ?? undefined,
              confidence: flower.confidence ?? undefined,
              meaning: flower.meaning,
              symbolism: flower.symbolism ?? undefined,
              source: flower.source,
            })),
          placement: placement
            ? {
                id: placement.id,
                gardenAreaId: placement.garden_area_id,
                bouquetId: placement.bouquet_id,
                slotId: placement.slot_id,
                vaseStyle: placement.vase_style ?? undefined,
                decorationStyle: placement.decoration_style ?? undefined,
                createdAt: placement.created_at,
                updatedAt: placement.updated_at,
              }
            : undefined,
        };
      }),
    });
  } catch (error) {
    console.error("Failed to load shared garden", error);
    return res.status(500).json({ error: "Could not load garden" });
  }
}
