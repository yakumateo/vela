import { supabase } from "../lib/supabase";
import type { EmergencyContact } from "../lib/database.types";

export async function getEmergencyContacts(
  userId: string
): Promise<EmergencyContact[]> {
  const { data, error } = await supabase
    .from("emergency_contacts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function addEmergencyContact(
  userId: string,
  contact: { name: string; relation: string; phone: string }
): Promise<EmergencyContact> {
  const { data, error } = await (supabase
    .from("emergency_contacts") as any)
    .insert({ user_id: userId, ...contact })
    .select()
    .single();
  if (error) throw error;
  return data as EmergencyContact;
}

export async function updateEmergencyContact(
  id: string,
  updates: { name?: string; relation?: string; phone?: string }
): Promise<EmergencyContact> {
  const { data, error } = await (supabase
    .from("emergency_contacts") as any)
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as EmergencyContact;
}

export async function deleteEmergencyContact(id: string) {
  const { error } = await supabase
    .from("emergency_contacts")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
