import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Session, SessionMemberWithProfile } from "../../lib/database.types";
import {
  getActiveSessionForUser,
  getSessionMembers,
  subscribeToSession,
  updateMemberLocation,
} from "../../services/session.service";
import { useAuth } from "./AuthContext";

interface SessionContextValue {
  session: Session | null;
  members: SessionMemberWithProfile[];
  loading: boolean;
  refresh: () => Promise<void>;
  setSession: (s: Session | null) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [members, setMembers] = useState<SessionMemberWithProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setSession(null);
      setMembers([]);
      return;
    }
    setLoading(true);
    try {
      const active = await getActiveSessionForUser(user.id);
      if (active) {
        setSession(active.session);
        const m = await getSessionMembers(active.session.id);
        setMembers(m);
      } else {
        setSession(null);
        setMembers([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Bootstrap
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime subscription for session members
  useEffect(() => {
    if (!session) return;
    const unsub = subscribeToSession(session.id, (updated) => {
      setMembers(updated);
    });
    return unsub;
  }, [session?.id]);

  // Geolocation heartbeat — update every 30s while in active session
  useEffect(() => {
    if (!session || !user || session.status !== "active") return;
    if (!navigator.geolocation) return;

    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateMemberLocation(
            session.id,
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
  }, [session?.id, session?.status, user?.id]);

  return (
    <SessionContext.Provider value={{ session, members, loading, refresh, setSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
