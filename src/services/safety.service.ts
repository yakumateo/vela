import { supabase } from "../lib/supabase";
import type { TaxiRegistration, BathroomTimer } from "../lib/database.types";

// ---- Taxi ----

export async function registerTaxi(params: {
  sessionId: string;
  userId: string;
  plate: string;
  app: TaxiRegistration["app"];
  destination: string;
  etaMinutes: number;
}): Promise<TaxiRegistration> {
  const { data, error } = await supabase
    .from("taxi_registrations")
    .insert({
      session_id: params.sessionId,
      user_id: params.userId,
      plate: params.plate.toUpperCase(),
      app: params.app,
      destination: params.destination,
      eta_minutes: params.etaMinutes,
    })
    .select()
    .single();
  if (error) throw error;

  // Update member status to taxi
  await supabase
    .from("session_members")
    .update({ status: "taxi" })
    .eq("session_id", params.sessionId)
    .eq("user_id", params.userId);

  return data;
}

export async function getLatestTaxi(
  sessionId: string,
  userId: string
): Promise<TaxiRegistration | null> {
  const { data, error } = await supabase
    .from("taxi_registrations")
    .select("*")
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ---- Bathroom ----

export async function startBathroomTimer(params: {
  sessionId: string;
  userId: string;
  durationMinutes: number;
}): Promise<BathroomTimer> {
  const expiresAt = new Date(
    Date.now() + params.durationMinutes * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("bathroom_timers")
    .insert({
      session_id: params.sessionId,
      user_id: params.userId,
      duration_minutes: params.durationMinutes,
      expires_at: expiresAt,
    })
    .select()
    .single();
  if (error) throw error;

  // Update member status
  await supabase
    .from("session_members")
    .update({ status: "bathroom" })
    .eq("session_id", params.sessionId)
    .eq("user_id", params.userId);

  return data;
}

export async function markBathroomReturn(
  timerId: string,
  sessionId: string,
  userId: string
): Promise<BathroomTimer> {
  const { data, error } = await supabase
    .from("bathroom_timers")
    .update({ returned_at: new Date().toISOString() })
    .eq("id", timerId)
    .select()
    .single();
  if (error) throw error;

  // Restore to active
  await supabase
    .from("session_members")
    .update({ status: "active" })
    .eq("session_id", sessionId)
    .eq("user_id", userId);

  return data;
}
