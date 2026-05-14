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

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      host_id: hostId,
      name,
      venue: venue || null,
      code: codeData,
      status: "lobby",
    })
    .select()
    .single();
  if (error) throw error;

  // Auto-join the host as a member with ready status
  await joinSession(data.id, hostId);
  await updateMemberStatus(data.id, hostId, "ready");

  return data;
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

  await joinSession(session.id, userId);
  return session;
}

export async function joinSession(sessionId: string, userId: string) {
  // upsert to avoid duplicates
  const { error } = await supabase.from("session_members").upsert(
    {
      session_id: sessionId,
      user_id: userId,
      status: "lobby",
      joined_at: new Date().toISOString(),
    },
    { onConflict: "session_id,user_id" }
  );
  if (error) throw error;
}

// ---- Activate Radar ----

export async function activateSession(sessionId: string): Promise<Session> {
  const { data, error } = await supabase
    .from("sessions")
    .update({ status: "active", started_at: new Date().toISOString() })
    .eq("id", sessionId)
    .select()
    .single();
  if (error) throw error;

  // Set all members to active
  await supabase
    .from("session_members")
    .update({ status: "active" })
    .eq("session_id", sessionId)
    .eq("status", "ready");

  return data;
}

// ---- Get session + members ----

export async function getSession(sessionId: string): Promise<Session> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();
  if (error) throw error;
  return data;
}

export async function getSessionMembers(
  sessionId: string
): Promise<SessionMemberWithProfile[]> {
  const { data, error } = await supabase
    .from("session_members")
    .select("*, profiles(full_name, avatar_url, phone)")
    .eq("session_id", sessionId);
  if (error) throw error;
  return data as SessionMemberWithProfile[];
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

  const { sessions, ...member } = data as SessionMember & { sessions: Session };
  return { session: sessions, member };
}

// ---- Member status updates ----

export async function updateMemberStatus(
  sessionId: string,
  userId: string,
  status: SessionMember["status"]
) {
  const { error } = await supabase
    .from("session_members")
    .update({ status, last_seen_at: new Date().toISOString() })
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
  const { error } = await supabase
    .from("session_members")
    .update({
      lat,
      lng,
      last_seen_at: new Date().toISOString(),
    })
    .eq("session_id", sessionId)
    .eq("user_id", userId);
  if (error) throw error;
}

// ---- Realtime subscriptions ----

export function subscribeToSession(
  sessionId: string,
  onUpdate: (members: SessionMemberWithProfile[]) => void
) {
  const channel = supabase
    .channel(`session:${sessionId}`)
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
      `
      sessions (
        id, name, venue, status, started_at, ended_at, created_at, code, host_id
      )
    `
    )
    .eq("user_id", userId)
    .eq("sessions.status", "ended")
    .order("joined_at", { ascending: false })
    .limit(20);

  if (error) throw error;

  return (data || [])
    .map((row: { sessions: Session | null }) => row.sessions)
    .filter(Boolean)
    .map((session: Session | null) => {
      if (!session) return null;
      const durationMs =
        session.ended_at && session.started_at
          ? new Date(session.ended_at).getTime() -
            new Date(session.started_at).getTime()
          : null;
      return {
        ...session,
        duration_minutes: durationMs ? Math.round(durationMs / 60000) : null,
      };
    })
    .filter(Boolean) as Array<Session & { duration_minutes: number | null }>;
}
