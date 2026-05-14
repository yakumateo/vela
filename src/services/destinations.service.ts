import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";

export type SavedDestination = Database["public"]["Tables"]["saved_destinations"]["Row"];

export async function getSavedDestinations(userId: string): Promise<SavedDestination[]> {
  const { data, error } = await supabase
    .from("saved_destinations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as SavedDestination[];
}

export async function addSavedDestination(
  userId: string,
  name: string,
  lat?: number,
  lng?: number
): Promise<SavedDestination> {
  const payload = {
    user_id: userId,
    name,
    lat: lat || null,
    lng: lng || null,
  };

  const { data, error } = await (supabase.from("saved_destinations") as any)
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as SavedDestination;
}

export async function deleteSavedDestination(id: string): Promise<void> {
  const { error } = await supabase
    .from("saved_destinations")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
