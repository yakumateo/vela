import { supabase } from "../lib/supabase";
import type { PanicAlert } from "../lib/database.types";

export async function triggerPanic(
  sessionId: string,
  userId: string,
  lat?: number,
  lng?: number
): Promise<PanicAlert> {
  const { data, error } = await (supabase
    .from("panic_alerts") as any)
    .insert({
      session_id: sessionId,
      user_id: userId,
      lat: lat ?? null,
      lng: lng ?? null,
    })
    .select()
    .single();
  if (error) throw error;

  // Also update member status to signal panic
  await (supabase
    .from("session_members") as any)
    .update({ status: "active", last_seen_at: new Date().toISOString() })
    .eq("session_id", sessionId)
    .eq("user_id", userId);

  return data as PanicAlert;
}

export async function resolvePanic(sessionId: string, userId: string): Promise<void> {
  const { error } = await (supabase
    .from("panic_alerts") as any)
    .update({ resolved_at: new Date().toISOString() })
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .is("resolved_at", null);
  if (error) throw error;
}

export async function getActivePanic(
  sessionId: string
): Promise<PanicAlert | null> {
  const { data, error } = await supabase
    .from("panic_alerts")
    .select("*")
    .eq("session_id", sessionId)
    .is("resolved_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export function subscribeToPanic(
  sessionId: string,
  onPanic: (alert: PanicAlert) => void
) {
  const channel = supabase
    .channel(`panic:${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "panic_alerts",
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        onPanic(payload.new as PanicAlert);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
