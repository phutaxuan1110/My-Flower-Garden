import { supabase } from "./supabaseClient";
import type { BouquetWithFlowers, GardenArea } from "../types";

export interface SharedGardenData {
  gardenName: string;
  areas: GardenArea[];
  bouquets: BouquetWithFlowers[];
}

export async function getGardenShareToken(): Promise<string | null> {
  const { data, error } = await supabase.from("garden_shares").select("token").maybeSingle();
  if (error) throw error;
  return (data as { token: string } | null)?.token ?? null;
}

export async function enableGardenShare(): Promise<string> {
  const existing = await getGardenShareToken();
  if (existing) return existing;

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw authError ?? new Error("Not signed in");

  const { data, error } = await supabase
    .from("garden_shares")
    .insert({ user_id: authData.user.id })
    .select("token")
    .single();
  if (error) throw error;
  return (data as { token: string }).token;
}

export async function disableGardenShare(): Promise<void> {
  const token = await getGardenShareToken();
  if (!token) return;
  const { error } = await supabase.from("garden_shares").delete().eq("token", token);
  if (error) throw error;
}

export async function fetchSharedGarden(token: string): Promise<SharedGardenData> {
  const response = await fetch(`/api/shared-garden?token=${encodeURIComponent(token)}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(response.status === 404 ? "not-found" : "load-failed");
  return (await response.json()) as SharedGardenData;
}
