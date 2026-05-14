import { TriangleAlert, ArrowLeft, Navigation, MoreVertical, LogOut, Trash2, Loader2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import { useSession } from "../context/SessionContext";
import { useAuth } from "../context/AuthContext";
import {
  getSession,
  getSessionMembers,
  subscribeToSession,
  leaveSession,
  endSession
} from "../../services/session.service";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import type { Session, SessionMemberWithProfile } from "../../lib/database.types";

const AVATAR_PLACEHOLDER = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E1E2A&color=39FF6E&bold=true&size=64`;

type MemberState = "safe" | "warning" | "danger" | "bathroom" | "taxi";

function getMemberState(status: string, lastSeen: string | null): MemberState {
  if (status === "bathroom") return "bathroom";
  if (status === "taxi") return "taxi";
  if (!lastSeen) return "warning";
  const diff = Date.now() - new Date(lastSeen).getTime();
  if (diff > 15 * 60 * 1000) return "warning";
  return "safe";
}

const STATE_COLORS: Record<MemberState, string> = {
  safe: "#39FF6E",
  warning: "#FFD700",
  danger: "#FF3B30",
  bathroom: "#478BFF",
  taxi: "#8888AA",
};

const STATE_LABELS: Record<MemberState, string> = {
  safe: "OK",
  warning: "Sin respuesta",
  danger: "Alerta",
  bathroom: "En el baño",
  taxi: "De camino a casa",
};

// Convert lat/lng to radar position (percentage within the radar circle)
function getRadarPosition(
  memberLat: number | null,
  memberLng: number | null,
  myLat: number | null,
  myLng: number | null,
  index: number
): { x: number; y: number } {
  // If no coordinates, use distributed fallback positions
  if (!memberLat || !memberLng || !myLat || !myLng) {
    const angle = (index * 137.5 * Math.PI) / 180; // golden angle distribution
    const r = 25 + (index % 3) * 12;
    return {
      x: 50 + r * Math.cos(angle),
      y: 50 + r * Math.sin(angle),
    };
  }

  // Calculate relative position
  const dLat = memberLat - myLat;
  const dLng = memberLng - myLng;

  // Scale: ~100m = at edge of radar.  1 degree lat ≈ 111km
  const scale = 3000; // sensitivity: higher = more zoomed out
  const x = 50 + dLng * scale;
  const y = 50 - dLat * scale; // inverted: north is up

  // Clamp within the radar circle (8% to 92%)
  const clampedX = Math.max(10, Math.min(90, x));
  const clampedY = Math.max(10, Math.min(90, y));

  return { x: clampedX, y: clampedY };
}

export function Radar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setActiveSession, refreshSessions } = useSession();
  const { user } = useAuth();

  const sessionId = searchParams.get("sid") || "";
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [localMembers, setLocalMembers] = useState<SessionMemberWithProfile[]>([]);

  // Load session
  useEffect(() => {
    if (!sessionId) return; // Don't redirect — just wait
    getSession(sessionId)
      .then((s) => {
        setSessionData(s);
        setActiveSession(s);
      })
      .catch(() => navigate("/home"));

    // Poll session status to kick if ended
    const interval = setInterval(async () => {
      try {
        const s = await getSession(sessionId);
        if (s.status === "ended") {
          toast.info("La salida ha sido finalizada por el anfitrión");
          navigate("/home");
        }
      } catch { /* ignore */ }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [sessionId, navigate]);

  // Load members
  useEffect(() => {
    if (!sessionId) return;
    getSessionMembers(sessionId).then(setLocalMembers).catch(console.error);
  }, [sessionId]);

  // Subscribe to realtime
  useEffect(() => {
    if (!sessionId) return;
    const unsub = subscribeToSession(sessionId, setLocalMembers);
    return unsub;
  }, [sessionId]);

  const startedAt = sessionData?.started_at ? new Date(sessionData.started_at) : null;
  const elapsed = startedAt
    ? formatDistanceToNow(startedAt, { locale: es, includeSeconds: false })
    : "—";

  // My coordinates (from my member record)
  const myMember = localMembers.find((m) => m.user_id === user?.id);
  const myLat = myMember?.lat ?? null;
  const myLng = myMember?.lng ?? null;
  const otherMembers = localMembers.filter((m) => m.user_id !== user?.id);

  // Count by state
  const stateCounts = useMemo(() => {
    const counts: Record<MemberState, number> = { safe: 0, warning: 0, danger: 0, bathroom: 0, taxi: 0 };
    localMembers.forEach((m) => {
      const s = getMemberState(m.status, m.last_seen_at);
      counts[s]++;
    });
    return counts;
  }, [localMembers]);

  const [showMenu, setShowMenu] = useState(false);
  const [processingOptions, setProcessingOptions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isHost = user && sessionData?.host_id === user.id;

  const handleLeaveSession = async () => {
    if (!user || !sessionId) return;
    setProcessingOptions(true);
    try {
      await leaveSession(sessionId, user.id);
      await refreshSessions();
      toast.success("Has salido de la salida");
      navigate("/home");
    } catch (e: any) {
      toast.error(e.message || "Error al salir");
      setProcessingOptions(false);
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) return;
    setProcessingOptions(true);
    try {
      await endSession(sessionId);
      await refreshSessions();
      toast.success("Salida finalizada");
      navigate("/home");
    } catch (e: any) {
      toast.error(e.message || "Error al finalizar");
      setProcessingOptions(false);
    }
  };

  return (
    <div className="flex flex-col absolute inset-0 bg-[#0A0A0F] overflow-hidden">
      {/* Header */}
      <div className="h-[72px] px-6 flex items-center justify-between z-10 sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-[#2A2A38]/50 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/home"
            className="w-10 h-10 flex items-center justify-center bg-[#1E1E2A]/80 hover:bg-[#2A2A38] rounded-full border border-[#2A2A38] transition-colors"
          >
            <ArrowLeft size={20} className="text-[#F0F0F5]" />
          </Link>
          <div className="flex items-center gap-2 bg-[#1E1E2A]/80 px-3 py-1.5 rounded-full border border-[#2A2A38] shadow-inner">
            <div className="w-2 h-2 rounded-full bg-[#39FF6E] shadow-[0_0_8px_#39FF6E80] animate-pulse" />
            <span className="text-[12px] font-bold text-[#F0F0F5] tracking-wide uppercase">Vela Activa</span>
          </div>
          <span className="text-[#8888AA] font-bold text-[13px] bg-[#14141C]/80 px-3 py-1.5 rounded-full border border-[#2A2A38]/50 shadow-inner tracking-wider font-mono">
            {elapsed}
          </span>
        </div>
        {/* Status pills and menu */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            {stateCounts.safe > 0 && (
              <div className="flex items-center gap-1 bg-[#39FF6E]/10 px-2 py-1 rounded-full border border-[#39FF6E]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[#39FF6E]" />
                <span className="text-[11px] font-bold text-[#39FF6E]">{stateCounts.safe}</span>
              </div>
            )}
            {stateCounts.warning > 0 && (
              <div className="flex items-center gap-1 bg-[#FFD700]/10 px-2 py-1 rounded-full border border-[#FFD700]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" />
                <span className="text-[11px] font-bold text-[#FFD700]">{stateCounts.warning}</span>
              </div>
            )}
            {stateCounts.bathroom > 0 && (
              <div className="flex items-center gap-1 bg-[#478BFF]/10 px-2 py-1 rounded-full border border-[#478BFF]/20">
                <span className="text-[10px]">🚽</span>
                <span className="text-[11px] font-bold text-[#478BFF]">{stateCounts.bathroom}</span>
              </div>
            )}
          </div>
          
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="w-10 h-10 flex items-center justify-center bg-[#1E1E2A]/80 hover:bg-[#2A2A38] rounded-full border border-[#2A2A38] transition-colors"
            >
              <MoreVertical size={20} className="text-[#8888AA]" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1E1E2A] border border-[#2A2A38] rounded-2xl shadow-xl overflow-hidden z-50">
                <button
                  onClick={handleLeaveSession}
                  disabled={processingOptions}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 text-[#F0F0F5] hover:bg-[#2A2A38] transition-colors text-[14px] font-bold disabled:opacity-50"
                >
                  {processingOptions ? <Loader2 size={16} className="animate-spin text-[#8888AA]" /> : <LogOut size={16} className="text-[#8888AA]" />}
                  Salir de la salida
                </button>
                {isHost && (
                  <button
                    onClick={handleEndSession}
                    disabled={processingOptions}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors border-t border-[#2A2A38] text-[14px] font-bold disabled:opacity-50"
                  >
                    {processingOptions ? <Loader2 size={16} className="animate-spin text-[#FF3B30]" /> : <Trash2 size={16} className="text-[#FF3B30]" />}
                    Eliminar salida
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Radar map area */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full overflow-hidden min-h-0 bg-gradient-to-b from-[#0A0A0F] via-[#14141C]/50 to-[#0A0A0F]">
        {/* Central glow */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 m-auto w-[200px] h-[200px] bg-[#39FF6E]/10 rounded-full blur-[80px] pointer-events-none"
        />

        {/* Radar rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-[80vw] h-[80vw] max-w-[320px] max-h-[320px] rounded-full border-2 border-[#39FF6E]/30"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute w-[60vw] h-[60vw] max-w-[240px] max-h-[240px] rounded-full border border-[#39FF6E]/40"
          />
          <div className="absolute w-[40vw] h-[40vw] max-w-[160px] max-h-[160px] rounded-full border border-[#39FF6E]/50" />
          <div className="absolute w-[20vw] h-[20vw] max-w-[80px] max-h-[80px] rounded-full border border-[#39FF6E]/60 shadow-[0_0_24px_rgba(57,255,110,0.2)_inset]" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#39FF6E]/20 to-transparent" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#39FF6E]/20 to-transparent" />
        </div>

        {/* Self dot (always center) */}
        <motion.div
          animate={{ boxShadow: ["0 0 16px #39FF6E", "0 0 32px #39FF6E", "0 0 16px #39FF6E"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-5 h-5 rounded-full bg-[#39FF6E] z-10 border-[3px] border-[#0A0A0F]"
          style={{ left: "calc(50% - 10px)", top: "calc(50% - 10px)" }}
        />
        <span className="absolute z-10 text-[11px] font-bold text-[#39FF6E] bg-[#0A0A0F]/90 px-2 py-0.5 rounded-full border border-[#39FF6E]/30" style={{ left: "calc(50% - 8px)", top: "calc(50% + 14px)" }}>
          Tú
        </span>

        {/* Location indicator */}
        {myLat && myLng && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#1E1E2A]/90 px-3 py-1.5 rounded-full border border-[#2A2A38] backdrop-blur-md z-10">
            <Navigation size={12} className="text-[#39FF6E]" />
            <span className="text-[11px] text-[#8888AA] font-mono">
              {myLat.toFixed(4)}, {myLng.toFixed(4)}
            </span>
          </div>
        )}

        {/* Members on radar — positioned by GPS */}
        {otherMembers.map((member, i) => {
          const name = member.profiles?.full_name?.split(" ")[0] || "?";
          const avatar = member.profiles?.avatar_url || AVATAR_PLACEHOLDER(name);
          const state = getMemberState(member.status, member.last_seen_at);
          const color = STATE_COLORS[state];
          const pos = getRadarPosition(member.lat, member.lng, myLat, myLng, i);

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                left: `${pos.x}%`,
                top: `${pos.y}%`,
              }}
              transition={{
                opacity: { delay: i * 0.15 + 0.3 },
                scale: { delay: i * 0.15 + 0.3, type: "spring" },
                left: { duration: 1, ease: "easeOut" },
                top: { duration: 1, ease: "easeOut" },
              }}
              className="absolute flex flex-col items-center gap-1 z-10 group -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative">
                {state === "warning" && (
                  <div className="absolute -inset-3 rounded-full blur-md animate-pulse" style={{ background: `${color}30` }} />
                )}
                <img
                  src={avatar}
                  alt={name}
                  className="w-11 h-11 rounded-full border-[3px] transition-transform duration-300 group-hover:scale-110 relative z-10"
                  style={{ borderColor: color, boxShadow: `0 0 12px ${color}60` }}
                  onError={(e) => { (e.target as HTMLImageElement).src = AVATAR_PLACEHOLDER(name); }}
                />
                {/* Distance indicator */}
                {member.lat && member.lng && myLat && myLng && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center z-20 text-[8px] font-bold" style={{ backgroundColor: color, color: "#0A0A0F" }}>
                    {(() => {
                      const d = Math.sqrt(
                        Math.pow((member.lat - myLat) * 111000, 2) +
                        Math.pow((member.lng - myLng) * 111000 * Math.cos(myLat * Math.PI / 180), 2)
                      );
                      return d < 1000 ? `${Math.round(d)}m` : `${(d / 1000).toFixed(1)}k`;
                    })()}
                  </div>
                )}
              </div>
              <span className="text-[11px] font-bold text-[#F0F0F5] bg-[#14141C]/90 px-2 py-0.5 rounded-full border border-[#2A2A38] backdrop-blur-md shadow-md whitespace-nowrap">
                {name}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.2 }}
        className="bg-[#14141C]/95 backdrop-blur-xl border-t border-[#2A2A38]/80 px-6 pt-5 pb-8 rounded-t-[32px] shrink-0 shadow-[0_-12px_48px_rgba(0,0,0,0.5)] z-20 relative"
      >
        <div className="w-12 h-1.5 bg-[#2A2A38] rounded-full mx-auto mb-5 opacity-50" />

        {/* Members scroll cards */}
        <div className="flex overflow-x-auto no-scrollbar gap-3 mb-5 pb-1 -mx-6 px-6 snap-x">
          {localMembers.map((member, i) => {
            const name = member.profiles?.full_name || "Usuario";
            const avatar = member.profiles?.avatar_url || AVATAR_PLACEHOLDER(name);
            const state = getMemberState(member.status, member.last_seen_at);
            const color = STATE_COLORS[state];
            const label = member.user_id === user?.id ? "Tú" : STATE_LABELS[state];
            const lastSeen = member.last_seen_at
              ? formatDistanceToNow(new Date(member.last_seen_at), { locale: es, addSuffix: true })
              : null;
            return (
              <motion.div
                key={member.id || i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 + 0.4 }}
                className="snap-start flex items-center gap-3 p-3 rounded-[20px] bg-[#1E1E2A] min-w-[220px] border border-[#2A2A38]/50 shadow-md hover:border-[#39FF6E]/30 transition-colors shrink-0"
              >
                <div className="relative">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#14141C]"
                    onError={(e) => { (e.target as HTMLImageElement).src = AVATAR_PLACEHOLDER(name); }}
                  />
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-[3px] border-[#1E1E2A] shadow-inner"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-[15px] text-[#F0F0F5] truncate">{name.split(" ")[0]}</span>
                  <span className="text-[12px] font-medium tracking-wide" style={{ color }}>
                    {label}
                  </span>
                  {lastSeen && member.user_id !== user?.id && (
                    <span className="text-[10px] text-[#8888AA] truncate">visto {lastSeen}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link to={`/bathroom?sid=${sessionId}`} className="block w-full">
            <Button
              variant="secondary"
              className="h-[56px] rounded-2xl w-full text-[14px] bg-[#1E1E2A] hover:bg-[#2A2A38] shadow-sm flex-col py-0 items-center justify-center gap-0.5 border border-[#2A2A38]/50 transition-all hover:shadow-md"
            >
              <span className="text-xl">🚽</span>
              <span className="text-[11px] font-semibold text-[#8888AA]">Voy al baño</span>
            </Button>
          </Link>
          <Link to={`/taxi?sid=${sessionId}`} className="block w-full">
            <Button
              variant="secondary"
              className="h-[56px] rounded-2xl w-full text-[14px] bg-[#1E1E2A] hover:bg-[#2A2A38] shadow-sm flex-col py-0 items-center justify-center gap-0.5 border border-[#2A2A38]/50 transition-all hover:shadow-md"
            >
              <span className="text-xl">🚕</span>
              <span className="text-[11px] font-semibold text-[#8888AA]">Voy a casa</span>
            </Button>
          </Link>
        </div>

        <Link to={`/panic?sid=${sessionId}`} className="block w-full group">
          <Button
            variant="danger"
            className="w-full h-[60px] rounded-2xl text-[17px] shadow-[0_8px_32px_rgba(255,59,48,0.25)] hover:shadow-[0_12px_48px_rgba(255,59,48,0.45)] transition-all flex items-center justify-center gap-3 active:bg-[#CC2F26] relative overflow-hidden font-bold"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <TriangleAlert size={24} strokeWidth={2.5} className="relative z-10" />
            <span className="relative z-10">Activar Alerta de Pánico</span>
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
