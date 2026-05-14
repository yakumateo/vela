import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type {
  Session,
  SessionMemberWithProfile,
  PanicAlert,
} from "../../lib/database.types";
import {
  getSessionMembers,
  updateMemberLocation,
} from "../../services/session.service";
import { subscribeToPanic } from "../../services/panic.service";
import { useAuth } from "./AuthContext";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

interface UserSession {
  session: Session;
  memberStatus: string;
}

interface SessionContextValue {
  /** All sessions the user is currently part of (not ended) */
  userSessions: UserSession[];
  /** The currently viewed/active session (set when entering lobby/radar) */
  activeSession: Session | null;
  /** Members of the active session */
  members: SessionMemberWithProfile[];
  loading: boolean;
  /** Refresh the sessions list */
  refreshSessions: () => Promise<void>;
  /** Set which session is being viewed */
  setActiveSession: (s: Session | null) => void;
  /** Update members externally (from Lobby/Radar subscriptions) */
  setMembers: (m: SessionMemberWithProfile[]) => void;
  /** Refresh members of active session */
  refreshMembers: () => Promise<void>;
  // Legacy compat
  session: Session | null;
  refresh: () => Promise<void>;
  setSession: (s: Session | null) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [activeSession, setActiveSessionState] = useState<Session | null>(null);
  const [members, setMembers] = useState<SessionMemberWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const panicToastShown = useRef<Set<string>>(new Set());

  // Fetch ALL sessions the user belongs to (not ended)
  const refreshSessions = useCallback(async () => {
    if (!user) {
      setUserSessions([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("session_members")
        .select("*, sessions(*)")
        .eq("user_id", user.id)
        .in("status", ["lobby", "ready", "active", "bathroom", "taxi"])
        .order("joined_at", { ascending: false });

      if (error) throw error;

      const sessions: UserSession[] = (data || [])
        .filter((row: Record<string, unknown>) => {
          const s = row.sessions as Session;
          return s && s.status !== "ended";
        })
        .map((row: Record<string, unknown>) => ({
          session: row.sessions as Session,
          memberStatus: row.status as string,
        }));

      setUserSessions(sessions);
    } catch (e) {
      console.error("refreshSessions error:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refresh members of the active session
  const refreshMembers = useCallback(async () => {
    if (!activeSession) {
      setMembers([]);
      return;
    }
    try {
      const m = await getSessionMembers(activeSession.id);
      setMembers(m);
    } catch (e) {
      console.error("refreshMembers error:", e);
    }
  }, [activeSession]);

  const setActiveSession = useCallback((s: Session | null) => {
    setActiveSessionState(s);
    if (!s) setMembers([]);
  }, []);

  // Bootstrap: load sessions on user change
  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  // Load members when active session changes
  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  // NOTE: Lobby and Radar components manage their own realtime subscriptions
  // to session_members. SessionContext does NOT subscribe to avoid channel
  // name collisions.

  // Realtime: subscribe to panic alerts for active session
  useEffect(() => {
    if (!activeSession || !user) return;
    const channelName = `panic:${activeSession.id}:ctx:${Math.random().toString(36).slice(2, 8)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "panic_alerts",
          filter: `session_id=eq.${activeSession.id}`,
        },
        (payload) => {
          const alert = payload.new as PanicAlert;
          // Don't notify yourself
          if (alert.user_id === user.id) return;
          // Don't double-notify
          if (panicToastShown.current.has(alert.id)) return;
          panicToastShown.current.add(alert.id);

          // Find who triggered it
          const triggeredBy = members.find((m) => m.user_id === alert.user_id);
          const name =
            triggeredBy?.profiles?.full_name?.split(" ")[0] || "Un miembro";

          toast.error(`🚨 ¡${name} activó una ALERTA DE PÁNICO!`, {
            duration: 15000,
            description: "Revisa su ubicación inmediatamente",
            action: {
              label: "Ver ubicación",
              onClick: () => {
                if (alert.lat && alert.lng) {
                  window.open(
                    `https://maps.google.com/?q=${alert.lat},${alert.lng}`,
                    "_blank"
                  );
                }
              },
            },
          });

          // Vibrate if supported
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 500]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSession?.id, user?.id, members]);

  // Geolocation heartbeat — update every 30s while in active session
  useEffect(() => {
    if (!activeSession || !user || activeSession.status !== "active") return;
    if (!navigator.geolocation) return;

    // Send immediately
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateMemberLocation(
          activeSession.id,
          user.id,
          pos.coords.latitude,
          pos.coords.longitude
        ).catch(console.error);
      },
      (err) => console.warn("Geo error:", err),
      { enableHighAccuracy: true, timeout: 5000 }
    );

    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateMemberLocation(
            activeSession.id,
            user.id,
            pos.coords.latitude,
            pos.coords.longitude
          ).catch(console.error);
        },
        (err) => console.warn("Geo error:", err),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }, 30_000);

    return () => clearInterval(intervalId);
  }, [activeSession?.id, activeSession?.status, user?.id]);

  return (
    <SessionContext.Provider
      value={{
        userSessions,
        activeSession,
        members,
        loading,
        refreshSessions,
        setActiveSession,
        setMembers,
        refreshMembers,
        // Legacy compat
        session: activeSession,
        refresh: refreshSessions,
        setSession: setActiveSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
