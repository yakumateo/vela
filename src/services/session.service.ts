// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// The Supabase JS v2 generic client sometimes causes TS2345/TS2339 "never" errors
// in the language server when using a hand-written Database type instead of
// supabase-gen output.  We cast each payload explicitly to sidestep this
// without losing runtime safety (the DB schema enforces correctness).

import { supabase } from "../lib/supabase";
import type {
  Session,
  SessionMember,
  SessionMemberWithProfile,
} from "../lib/database.types";

// ---- Create & Join ----

export async function createSession(
  hostId: string,
  name: string,
  venue?: string
): Promise<Session> {
  // Generate code via DB function
  const { data: codeData, error: codeError } = await supabase.rpc(
    "generate_session_code"
  );
  if (codeError) throw codeError;

  const { data, error } = await (supabase
    .from("sessions") as any)
    .insert({
      host_id: hostId,
      name,
      venue: venue || null,
      code: codeData as string,
      status: "lobby",
    } as any)
    .select()
    .single();
  if (error) throw error;

  // Auto-join the host as a member with ready status
  await joinSession((data as Session).id, hostId);
  await updateMemberStatus((data as Session).id, hostId, "ready");

  return data as Session;
}

export async function joinSessionByCode(
  code: string,
  userId: string
): Promise<Session> {
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("status", "lobby")
    .single();
  if (sessionError) throw new Error("Código inválido o sesión ya iniciada");

  await joinSession((session as unknown as Session).id, userId);
  return session as unknown as Session;
}

export async function joinSession(sessionId: string, userId: string) {
  const { error } = await (supabase.from("session_members") as any).upsert(
    {
      session_id: sessionId,
      user_id: userId,
      status: "lobby",
      joined_at: new Date().toISOString(),
    } as any,
    { onConflict: "session_id,user_id" }
  );
  if (error) throw error;
}

// ---- Activate Radar ----

export async function activateSession(sessionId: string): Promise<Session> {
  const { data, error } = await (supabase.from("sessions") as any)
    .update({ status: "active", started_at: new Date().toISOString() } as any)
    .eq("id", sessionId)
    .select()
    .single();
  if (error) throw error;

  // Set all members to active
  await (supabase.from("session_members") as any)
    .update({ status: "active" } as any)
    .eq("session_id", sessionId)
    .eq("status", "ready");

  return data as Session;
}

// ---- Get session + members ----

export async function getSession(sessionId: string): Promise<Session> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();
  if (error) throw error;
  return data as unknown as Session;
}

export async function getSessionMembers(
  sessionId: string
): Promise<SessionMemberWithProfile[]> {
  const { data, error } = await supabase
    .from("session_members")
    .select("*, profiles(full_name, avatar_url, phone)")
    .eq("session_id", sessionId);
  if (error) throw error;
  return data as unknown as SessionMemberWithProfile[];
}

export async function getActiveSessionForUser(
  userId: string
): Promise<{ session: Session; member: SessionMember } | null> {
  const { data, error } = await supabase
    .from("session_members")
    .select("*, sessions(*)")
    .eq("user_id", userId)
    .in("status", ["lobby", "ready", "active", "bathroom", "taxi"])
    .order("joined_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as SessionMember & { sessions: Session };
  const { sessions, ...member } = row;
  return { session: sessions, member };
}

// ---- Member status updates ----

export async function updateMemberStatus(
  sessionId: string,
  userId: string,
  status: SessionMember["status"]
) {
  const { error } = await (supabase.from("session_members") as any)
    .update({ status, last_seen_at: new Date().toISOString() } as any)
    .eq("session_id", sessionId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function updateMemberLocation(
  sessionId: string,
  userId: string,
  lat: number,
  lng: number
) {
  const { error } = await (supabase.from("session_members") as any)
    .update({ lat, lng, last_seen_at: new Date().toISOString() } as any)
    .eq("session_id", sessionId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function leaveSession(sessionId: string, userId: string) {
  const { error } = await supabase
    .from("session_members")
    .delete()
    .eq("session_id", sessionId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function endSession(sessionId: string) {
  const { error } = await supabase
    .from("sessions")
    .update({ status: "ended", ended_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (error) throw error;
}

// ---- Realtime subscriptions ----

export function subscribeToSession(
  sessionId: string,
  onUpdate: (members: SessionMemberWithProfile[]) => void
) {
  // Unique channel name to avoid collisions when multiple components subscribe
  const channelName = `session:${sessionId}:${Math.random().toString(36).slice(2, 8)}`;
  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "session_members",
        filter: `session_id=eq.${sessionId}`,
      },
      async () => {
        const members = await getSessionMembers(sessionId);
        onUpdate(members);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ---- History ----

export async function getSessionHistory(
  userId: string
): Promise<Array<Session & { duration_minutes: number | null }>> {
  const { data, error } = await supabase
    .from("session_members")
    .select(
      `sessions (id, name, venue, status, started_at, ended_at, created_at, code, host_id)`
    )
    .eq("user_id", userId)
    .order("joined_at", { ascending: false })
    .limit(20);

  if (error) throw error;

  return (data || [])
    .map((row: any) => row.sessions as Session | null)
    .filter((s): s is Session => s !== null && s.status === "ended")
    .map((session) => {
      const durationMs =
        session.ended_at && session.started_at
          ? new Date(session.ended_at).getTime() -
            new Date(session.started_at).getTime()
          : null;
      return {
        ...session,
        duration_minutes: durationMs ? Math.round(durationMs / 60000) : null,
      };
    });
}
