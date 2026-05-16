import { TriangleAlert, ArrowLeft, Navigation, MoreVertical, LogOut, Trash2, Loader2, QrCode, X, WifiOff } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import QRCode from "react-qr-code";
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
import { getActivePanic, subscribeToPanic } from "../../services/panic.service";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { Session, SessionMemberWithProfile, PanicAlert } from "../../lib/database.types";

const AVATAR_PLACEHOLDER = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E1E2A&color=4ade80&bold=true&size=64`;

type MemberState = "safe" | "warning" | "danger" | "bathroom" | "taxi" | "offline";

function getMemberState(status: string, lastSeen: string | null, isPanic: boolean): MemberState {
  if (isPanic) return "danger";
  if (!lastSeen) return "offline";
  const diff = Date.now() - new Date(lastSeen).getTime();
  if (diff > 60 * 1000) return "offline";
  if (status === "bathroom") return "bathroom";
  if (status === "taxi") return "taxi";
  return "safe";
}

const STATE_COLORS: Record<MemberState, string> = {
  safe: "#4ade80",
  warning: "#facc15",
  danger: "#ef4444",
  bathroom: "#facc15",
  taxi: "#60a5fa",
  offline: "#6b7280"
};

const STATE_LABELS: Record<MemberState, string> = {
  safe: "OK",
  warning: "Sin respuesta",
  danger: "¡Alerta!",
  bathroom: "En el baño",
  taxi: "Taxi / Casa",
  offline: "Sin señal"
};

function getBearing(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function getRadarPosition(
  memberLat: number | null,
  memberLng: number | null,
  myLat: number | null,
  myLng: number | null,
  index: number
): { x: number; y: number; distance: number; isOut: boolean } {
  if (!memberLat || !memberLng || !myLat || !myLng) {
    const angle = (index * 137.5 * Math.PI) / 180;
    const r = 25 + (index % 3) * 12;
    return { x: 50 + r * Math.cos(angle), y: 50 + r * Math.sin(angle), distance: -1, isOut: false };
  }

  const dist = getDistance(myLat, myLng, memberLat, memberLng);
  const bearing = getBearing(myLat, myLng, memberLat, memberLng);
  
  const MAX_DIST = 50; // Radio del radar en metros
  const isOut = dist > MAX_DIST;
  const visualDist = Math.min(dist, MAX_DIST);
  
  const percentageDist = (visualDist / MAX_DIST) * 45; // 45% máx para no tocar borde exacto
  const angleRad = (bearing - 90) * Math.PI / 180;
  
  const x = 50 + percentageDist * Math.cos(angleRad);
  const y = 50 + percentageDist * Math.sin(angleRad);

  return { x, y, distance: dist, isOut };
}

export function Radar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setActiveSession, refreshSessions } = useSession();
  const { user } = useAuth();

  const sessionId = searchParams.get("sid") || "";
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [localMembers, setLocalMembers] = useState<SessionMemberWithProfile[]>([]);
  const [activePanic, setActivePanic] = useState<PanicAlert | null>(null);

  const [now, setNow] = useState(Date.now());
  const [showMenu, setShowMenu] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [processingOptions, setProcessingOptions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isSheetExpanded, setIsSheetExpanded] = useState(false);

  // Poll for "hace X seg" text updates
  useEffect(() => {
    const int = setInterval(() => setNow(Date.now()), 8000);
    return () => clearInterval(int);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    getSession(sessionId)
      .then((s) => {
        setSessionData(s);
        setActiveSession(s);
      })
      .catch(() => navigate("/home"));

    getActivePanic(sessionId)
      .then((panic) => setActivePanic(panic))
      .catch(() => {});

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
  }, [sessionId, navigate, setActiveSession]);

  useEffect(() => {
    if (!sessionId) return;
    getSessionMembers(sessionId).then(setLocalMembers).catch(console.error);
    const unsubSession = subscribeToSession(sessionId, setLocalMembers);
    const unsubPanic = subscribeToPanic(sessionId, (alert) => {
      if (!alert.resolved_at) setActivePanic(alert);
      else setActivePanic(null);
    });
    return () => {
      unsubSession();
      unsubPanic();
    };
  }, [sessionId]);

  const isHost = user && sessionData?.host_id === user.id;
  const startedAt = sessionData?.started_at ? new Date(sessionData.started_at) : null;
  const elapsed = startedAt
    ? formatDistanceToNow(startedAt, { locale: es, includeSeconds: false })
    : "—";

  const myMember = localMembers.find((m) => m.user_id === user?.id);
  const myLat = myMember?.lat ?? null;
  const myLng = myMember?.lng ?? null;
  const otherMembers = localMembers.filter((m) => m.user_id !== user?.id);

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
    <div className="flex flex-col absolute inset-0 bg-[#0a0a1a] overflow-hidden font-sans">
      {/* Header compacto */}
      <div className="h-[64px] px-4 flex items-center justify-between z-10 sticky top-0 bg-[#0a0a1a]/80 backdrop-blur-md border-b border-[#2A2A38]/50 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/home"
            className="w-9 h-9 flex items-center justify-center bg-[#1E1E2A]/80 hover:bg-[#2A2A38] rounded-full border border-[#2A2A38] transition-colors"
          >
            <ArrowLeft size={18} className="text-[#F0F0F5]" />
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${activePanic ? 'bg-[#ef4444] shadow-[0_0_8px_#ef444480]' : 'bg-[#4ade80] shadow-[0_0_8px_#4ade8080]'} animate-pulse`} />
              <span className="text-[14px] font-bold text-[#F0F0F5] tracking-tight truncate max-w-[160px]">
                {sessionData?.name || "Cargando..."}
              </span>
            </div>
            <span className="text-[#8888AA] text-[11px] font-medium ml-4">
              Activa · {elapsed}
            </span>
          </div>
        </div>
        
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="w-9 h-9 flex items-center justify-center bg-[#1E1E2A]/80 hover:bg-[#2A2A38] rounded-full border border-[#2A2A38] transition-colors"
          >
            <MoreVertical size={18} className="text-[#8888AA]" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1E1E2A] border border-[#2A2A38] rounded-2xl shadow-xl overflow-hidden z-50">
              <button
                onClick={() => { setShowCodeModal(true); setShowMenu(false); }}
                className="w-full text-left px-4 py-3 flex items-center gap-3 text-[#F0F0F5] hover:bg-[#2A2A38] transition-colors text-[14px] font-bold border-b border-[#2A2A38]"
              >
                <QrCode size={16} className="text-[#8888AA]" />
                Ver código de invitación
              </button>
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

      {/* Radar map area */}
      <motion.div 
        animate={{ paddingBottom: isSheetExpanded ? "50vh" : "152px" }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        className="flex-1 flex flex-col items-center justify-center relative w-full overflow-hidden bg-[#0a0a1a]"
      >
        <div className="absolute top-4 left-4 text-[#8888AA] text-[10px] flex items-center gap-1.5 z-10 bg-[#0A0A0F]/50 px-2 py-1 rounded-md border border-[#2A2A38]/50 shadow-sm backdrop-blur-md">
          <Navigation size={10} />
          <span>Ubicación aproximada</span>
        </div>

        {/* N Label */}
        <div className="absolute top-[8%] font-bold text-[#8888AA] text-[14px] z-10 opacity-60">N</div>

        {/* Radar Rings Container */}
        <div className="relative w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] z-10 flex items-center justify-center">
           {/* Cross */}
           <div className="absolute w-full h-full pointer-events-none opacity-[0.15]">
             <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#8888AA]" />
             <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#8888AA]" />
           </div>

           {/* 50m Ring */}
           <div className="absolute w-full h-full rounded-full border border-[#8888AA]/20 bg-[#39FF6E]/[0.02]" />
           <div className="absolute top-0 -translate-y-1/2 text-[9px] text-[#8888AA] bg-[#0a0a1a] px-1 font-mono">50m</div>

           {/* 33m Ring */}
           <div className="absolute w-[66%] h-[66%] rounded-full border border-[#8888AA]/20 bg-[#39FF6E]/[0.03]" />
           <div className="absolute top-[17%] -translate-y-1/2 text-[9px] text-[#8888AA] bg-[#0a0a1a] px-1 font-mono">33m</div>

           {/* 17m Ring */}
           <div className="absolute w-[33%] h-[33%] rounded-full border border-[#8888AA]/20 bg-[#39FF6E]/[0.04]" />
           <div className="absolute top-[33.5%] -translate-y-1/2 text-[9px] text-[#8888AA] bg-[#0a0a1a] px-1 font-mono">17m</div>

           {/* Self dot */}
           <motion.div
             animate={{ boxShadow: ["0 0 16px #ffffff", "0 0 32px #ffffff", "0 0 16px #ffffff"] }}
             transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
             className="absolute w-4 h-4 rounded-full bg-white z-20 border-[3px] border-[#0a0a1a]"
             style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
           />

           {/* Other members */}
           {otherMembers.map((member, i) => {
             const name = member.profiles?.full_name?.split(" ")[0] || "?";
             const isPanic = activePanic?.user_id === member.user_id;
             const state = getMemberState(member.status, member.last_seen_at, isPanic);
             const color = STATE_COLORS[state];
             const pos = getRadarPosition(member.lat, member.lng, myLat, myLng, i);
             
             const lastSeenSecs = member.last_seen_at 
               ? Math.max(0, Math.floor((now - new Date(member.last_seen_at).getTime()) / 1000)) 
               : null;

             return (
               <motion.div
                 key={member.id}
                 initial={{ opacity: 0, scale: 0 }}
                 animate={{ opacity: 1, scale: 1, left: `${pos.x}%`, top: `${pos.y}%` }}
                 transition={{ 
                   opacity: { delay: i * 0.1 }, 
                   scale: { delay: i * 0.1, type: "spring" }, 
                   left: { duration: 0.8 }, 
                   top: { duration: 0.8 } 
                 }}
                 className="absolute flex flex-col items-center gap-1 z-30 group -translate-x-1/2 -translate-y-1/2"
               >
                 <div className="relative">
                    {state === "danger" && <div className="absolute -inset-3 rounded-full blur-md animate-pulse" style={{ background: `${color}80` }} />}
                    {state === "offline" && <div className="absolute -top-1 -right-1 z-40 bg-[#6b7280] rounded-full p-0.5"><WifiOff size={10} className="text-white" /></div>}
                    
                    <div className="w-8 h-8 rounded-full border-[2px] flex items-center justify-center font-bold text-[#0a0a1a] shadow-[0_4px_12px_rgba(0,0,0,0.5)] relative z-30 transition-transform group-hover:scale-110" style={{ backgroundColor: color, borderColor: "#0a0a1a" }}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                 </div>
                 <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-[#F0F0F5] bg-[#0a0a1a]/90 px-1.5 py-0.5 rounded-full border border-[#2A2A38]/50 whitespace-nowrap shadow-sm">
                      {name}
                    </span>
                    {pos.distance >= 0 && (
                      <span className="text-[9px] font-bold text-[#8888AA] mt-0.5 drop-shadow-md">
                        {pos.isOut ? ">50m" : `${Math.round(pos.distance)}m`}
                      </span>
                    )}
                    {lastSeenSecs !== null && lastSeenSecs > 10 && (
                      <span className="text-[8px] text-[#8888AA] whitespace-nowrap drop-shadow-md">
                        hace {lastSeenSecs < 60 ? `${lastSeenSecs}s` : `${Math.floor(lastSeenSecs/60)}m`}
                      </span>
                    )}
                 </div>
               </motion.div>
             )
           })}
        </div>
      </motion.div>

      {/* Draggable Bottom Sheet */}
      <motion.div 
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, info) => {
          if (info.offset.y < -30) setIsSheetExpanded(true);
          if (info.offset.y > 30) setIsSheetExpanded(false);
        }}
        animate={{ height: isSheetExpanded ? "50vh" : "152px" }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        className="absolute bottom-0 w-full bg-[#14141C] border-t border-[#2A2A38]/80 rounded-t-[32px] z-40 shadow-[0_-12px_48px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
      >
        {/* Handle */}
        <div 
          className="w-full flex justify-center pt-4 pb-3 cursor-grab active:cursor-grabbing shrink-0"
          onClick={() => setIsSheetExpanded(!isSheetExpanded)}
        >
          <div className="w-12 h-1.5 bg-[#2A2A38] rounded-full opacity-60" />
        </div>

        <div className="flex-1 flex flex-col px-4 pb-6 overflow-hidden relative">
          
          {/* Simple Members List (Visible when collapsed) */}
          <motion.div 
            initial={false}
            animate={{ 
              height: isSheetExpanded ? 0 : "auto",
              opacity: isSheetExpanded ? 0 : 1,
              marginBottom: isSheetExpanded ? 0 : 16
            }}
            className="flex justify-center gap-2 overflow-hidden shrink-0"
            style={{ pointerEvents: isSheetExpanded ? "none" : "auto" }}
          >
            {localMembers.map((member) => {
              const isPanic = activePanic?.user_id === member.user_id;
              const state = getMemberState(member.status, member.last_seen_at, isPanic);
              const color = STATE_COLORS[state];
              
              return (
                <div key={`simple-${member.id}`} className="relative">
                  {state === "danger" && <div className="absolute -inset-1 rounded-full blur-sm animate-pulse" style={{ background: `${color}80` }} />}
                  <div className="w-8 h-8 rounded-full border-[2.5px] shadow-sm relative z-10" style={{ borderColor: color, backgroundColor: "#1E1E2A" }}>
                     <img src={member.profiles?.avatar_url || AVATAR_PLACEHOLDER(member.profiles?.full_name?.split(" ")[0] || "?")} className="w-full h-full rounded-full object-cover" />
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Full Members List (Visible when expanded) */}
          <motion.div 
            initial={false}
            animate={{ 
              height: isSheetExpanded ? "auto" : 0,
              opacity: isSheetExpanded ? 1 : 0,
              marginBottom: isSheetExpanded ? 24 : 0
            }}
            className="flex overflow-x-auto no-scrollbar gap-3 -mx-4 px-4 shrink-0"
            style={{ pointerEvents: isSheetExpanded ? "auto" : "none" }}
          >
            {localMembers.map((member) => {
              const isMe = member.user_id === user?.id;
              const name = isMe ? "Tú" : (member.profiles?.full_name?.split(" ")[0] || "Usuario");
              const avatar = member.profiles?.avatar_url || AVATAR_PLACEHOLDER(name);
              const isPanic = activePanic?.user_id === member.user_id;
              const state = getMemberState(member.status, member.last_seen_at, isPanic);
              const color = STATE_COLORS[state];
              const label = isMe ? (state === "safe" ? "Activo" : STATE_LABELS[state]) : STATE_LABELS[state];

              return (
                <div key={member.id} className="snap-start flex flex-col items-center gap-1.5 p-2 rounded-[18px] bg-[#1E1E2A] min-w-[76px] border border-[#2A2A38]/50 shrink-0 shadow-sm">
                  <div className="relative">
                    <img src={avatar} className="w-11 h-11 rounded-full object-cover border-[2px] border-[#2A2A38]" onError={(e) => { (e.target as HTMLImageElement).src = AVATAR_PLACEHOLDER(name); }} />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[2px] border-[#1E1E2A]" style={{ backgroundColor: color }} />
                  </div>
                  <div className="flex flex-col items-center w-full">
                    <span className="font-bold text-[11px] text-[#F0F0F5] w-full text-center truncate px-1">{name}</span>
                    <span className="text-[9px] font-semibold tracking-wide" style={{ color }}>{label}</span>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Action buttons */}
          <div className="flex gap-2 shrink-0 mt-auto">
            <Link to={`/bathroom?sid=${sessionId}`} className="flex-1">
              <motion.button 
                animate={{ height: isSheetExpanded ? 64 : 48, borderRadius: isSheetExpanded ? 20 : 14 }}
                className="w-full bg-[#1E1E2A] hover:bg-[#2A2A38] border border-[#2A2A38]/50 flex items-center justify-center gap-2 transition-colors shadow-sm text-[#F0F0F5] font-bold"
              >
                <motion.span animate={{ fontSize: isSheetExpanded ? 20 : 16 }}>🚽</motion.span>
                <motion.span animate={{ fontSize: isSheetExpanded ? 15 : 13 }}>Baño</motion.span>
              </motion.button>
            </Link>
            <Link to={`/taxi?sid=${sessionId}`} className="flex-1">
              <motion.button 
                animate={{ height: isSheetExpanded ? 64 : 48, borderRadius: isSheetExpanded ? 20 : 14 }}
                className="w-full bg-[#1E1E2A] hover:bg-[#2A2A38] border border-[#2A2A38]/50 flex items-center justify-center gap-2 transition-colors shadow-sm text-[#F0F0F5] font-bold"
              >
                <motion.span animate={{ fontSize: isSheetExpanded ? 20 : 16 }}>🚕</motion.span>
                <motion.span animate={{ fontSize: isSheetExpanded ? 15 : 13 }}>Taxi</motion.span>
              </motion.button>
            </Link>
            <Link to={`/panic?sid=${sessionId}`} className="flex-1">
              <motion.button 
                animate={{ height: isSheetExpanded ? 64 : 48, borderRadius: isSheetExpanded ? 20 : 14 }}
                className="w-full bg-[#ef4444] hover:bg-[#ef4444]/90 shadow-[0_4px_16px_rgba(239,68,68,0.2)] hover:shadow-[0_6px_24px_rgba(239,68,68,0.4)] flex items-center justify-center gap-1.5 transition-colors text-white font-extrabold"
              >
                <motion.div animate={{ scale: isSheetExpanded ? 1.1 : 1 }} className="flex items-center justify-center">
                  <TriangleAlert size={isSheetExpanded ? 20 : 16} strokeWidth={3} />
                </motion.div>
                <motion.span animate={{ fontSize: isSheetExpanded ? 15 : 13 }}>Pánico</motion.span>
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {showCodeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-[#1E1E2A] to-[#14141C] p-8 rounded-[32px] flex flex-col items-center border border-[#2A2A38]/60 shadow-[0_12px_48px_rgba(0,0,0,0.4)] relative max-w-[90vw]"
          >
            <button
              onClick={() => setShowCodeModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-[#2A2A38] hover:bg-[#3A3A48] rounded-full text-[#8888AA] transition-colors"
            >
              <X size={16} />
            </button>
            <div className="w-[200px] h-[200px] bg-white rounded-[24px] p-4 flex items-center justify-center mb-6 mt-4 shadow-[0_8px_32px_rgba(255,255,255,0.15)] relative group">
              <div className="absolute inset-0 bg-[#39FF6E]/20 blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[24px]" />
              {sessionData?.code ? (
                <QRCode 
                  value={`${window.location.origin}/?join=${sessionData.code}`} 
                  size={160} 
                  level="Q" 
                  className="relative z-10" 
                />
              ) : (
                <QrCode size={160} className="text-black relative z-10" />
              )}
            </div>
            <p className="text-[#8888AA] text-[15px] mb-3 font-medium tracking-wide text-center">Comparte este código para que más gente se una</p>
            <div className="bg-[#0A0A0F] border border-[#39FF6E]/30 px-8 py-3 rounded-2xl mb-4">
              <span className="text-[#39FF6E] text-[28px] font-black font-mono tracking-[0.4em] drop-shadow-[0_0_12px_rgba(57,255,110,0.5)]">
                {sessionData?.code || "------"}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                if (sessionData?.code) {
                  navigator.clipboard.writeText(sessionData.code);
                  toast.success("Código copiado al portapapeles");
                }
              }}
              className="w-full h-[48px] rounded-xl border-[#2A2A38] text-[#F0F0F5] font-bold"
            >
              Copiar Código
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
