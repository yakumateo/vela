import { useState, useEffect, useRef } from "react";
import { QrCode, Shield, CheckCircle2, MoreVertical, Loader2, ArrowLeft, LogOut, Trash2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import QRCode from "react-qr-code";
import { useAuth } from "../context/AuthContext";
import { useSession } from "../context/SessionContext";
import {
  getSession,
  getSessionMembers,
  updateMemberStatus,
  activateSession,
  subscribeToSession,
  leaveSession,
  endSession
} from "../../services/session.service";
import type { Session, SessionMemberWithProfile } from "../../lib/database.types";
import { toast } from "sonner";

const AVATAR_PLACEHOLDER = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E1E2A&color=39FF6E&bold=true&size=64`;

export function Lobby() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { setActiveSession, refreshSessions } = useSession();
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [localMembers, setLocalMembers] = useState<SessionMemberWithProfile[]>([]);
  const [activating, setActivating] = useState(false);

  const sessionId = searchParams.get("sid") || "";

  // Load session data
  useEffect(() => {
    if (!sessionId) return; // Don't redirect — wait for params
    getSession(sessionId)
      .then((s) => {
        setSessionData(s);
        setActiveSession(s);
      })
      .catch(() => { toast.error("Sesión no encontrada"); navigate("/home"); });
  }, [sessionId]);

  // Load members
  useEffect(() => {
    if (!sessionId) return;
    getSessionMembers(sessionId).then(setLocalMembers).catch(console.error);
  }, [sessionId]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!sessionId) return;
    const unsub = subscribeToSession(sessionId, setLocalMembers);
    return unsub;
  }, [sessionId]);

  // Mark self as ready
  useEffect(() => {
    if (!user || !sessionId) return;
    updateMemberStatus(sessionId, user.id, "ready").catch(console.error);
  }, [sessionId, user?.id]);

  // If session goes active, redirect to radar
  useEffect(() => {
    if (sessionData?.status === "active") {
      navigate(`/radar?sid=${sessionId}`);
    }
  }, [sessionData?.status]);

  // Subscribe to session status changes (host activates → redirect guests)
  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(async () => {
      try {
        const s = await getSession(sessionId);
        if (s.status === "active") {
          setSessionData(s);
          setActiveSession(s);
        }
      } catch { /* ignore */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleActivate = async () => {
    if (!sessionId) return;
    setActivating(true);
    try {
      const updated = await activateSession(sessionId);
      setSessionData(updated);
      setActiveSession(updated);
      await refreshSessions();
      navigate(`/radar?sid=${sessionId}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al activar");
    } finally {
      setActivating(false);
    }
  };

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

  const handleLeaveSession = async () => {
    if (!user || !sessionId) return;
    setProcessingOptions(true);
    try {
      await leaveSession(sessionId, user.id);
      await refreshSessions();
      toast.success("Has salido del lobby");
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
      toast.success("Salida cancelada");
      navigate("/home");
    } catch (e: any) {
      toast.error(e.message || "Error al cancelar");
      setProcessingOptions(false);
    }
  };

  const isHost = sessionData?.host_id === user?.id;
  const readyCount = localMembers.filter((m) => m.status === "ready").length;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F] relative">
      {/* Header */}
      <div className="h-[72px] px-6 flex items-center justify-between z-20 sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-[#2A2A38]/50 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/home"
            className="w-10 h-10 flex items-center justify-center bg-[#1E1E2A]/80 hover:bg-[#2A2A38] rounded-full border border-[#2A2A38] transition-colors"
          >
            <ArrowLeft size={20} className="text-[#F0F0F5]" />
          </Link>
          <div className="flex items-center gap-2 bg-[#1E1E2A]/80 px-3 py-1.5 rounded-full border border-[#2A2A38] shadow-inner">
            <div className="w-2 h-2 rounded-full bg-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.5)] animate-pulse" />
            <span className="text-[12px] font-bold text-[#F0F0F5] tracking-wide uppercase">Lobby</span>
          </div>
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
                Salir
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

      <div className="px-6 py-6 flex-1 overflow-y-auto no-scrollbar pb-32 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-[10%] right-0 w-[300px] h-[300px] bg-[#39FF6E]/5 rounded-full blur-[120px] pointer-events-none"
        />

        {/* Session name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h2 className="text-[22px] font-extrabold text-[#F0F0F5] tracking-tight border-b border-[#2A2A38] pb-3">
            {sessionData?.name || "Cargando..."}
          </h2>
          {sessionData?.venue && (
            <p className="text-[#8888AA] text-[14px] mt-2 font-medium">📍 {sessionData.venue}</p>
          )}
        </motion.div>

        {/* QR Code with join code */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="bg-gradient-to-br from-[#1E1E2A] to-[#14141C] p-8 rounded-[32px] flex flex-col items-center mb-8 border border-[#2A2A38]/60 shadow-[0_12px_48px_rgba(0,0,0,0.4)]"
        >
          <div className="w-[200px] h-[200px] bg-white rounded-[24px] p-4 flex items-center justify-center mb-6 shadow-[0_8px_32px_rgba(255,255,255,0.15)] relative group">
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
          <p className="text-[#8888AA] text-[15px] mb-3 font-medium tracking-wide">Comparte el código</p>
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
                toast.success("Código copiado");
              }
            }}
            className="w-full rounded-2xl border-dashed border-[#2A2A38] text-[#F0F0F5] hover:border-[#39FF6E]/50 hover:text-[#39FF6E] hover:bg-[#39FF6E]/5 h-[60px] transition-all font-semibold"
          >
            Copiar código
          </Button>
        </motion.div>

        {/* Members */}
        <div className="mb-6">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[18px] font-bold text-[#F0F0F5] mb-5 flex items-center gap-3 tracking-tight"
          >
            Miembros del grupo
            <span className="bg-[#1E1E2A] text-[#39FF6E] text-[13px] px-2.5 py-1 rounded-full border border-[#39FF6E]/20 shadow-inner font-bold">
              {readyCount}/{localMembers.length}
            </span>
          </motion.h3>

          <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-3">
            {localMembers.length === 0 ? (
              <div className="text-center py-8 text-[#8888AA] text-[15px]">Esperando que se unan...</div>
            ) : (
              localMembers.map((member, i) => {
                const name = member.profiles?.full_name || "Usuario";
                const avatar = member.profiles?.avatar_url || AVATAR_PLACEHOLDER(name);
                const ready = member.status === "ready" || member.status === "active";
                return (
                  <motion.div
                    key={member.id || i}
                    variants={itemVariants}
                    className="flex items-center justify-between p-3.5 rounded-[20px] bg-[#14141C]/80 backdrop-blur-sm border border-[#2A2A38]/50 shadow-sm hover:border-[#39FF6E]/30 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={avatar}
                        alt={name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#1E1E2A] group-hover:border-[#39FF6E]/50 transition-colors"
                        onError={(e) => { (e.target as HTMLImageElement).src = AVATAR_PLACEHOLDER(name); }}
                      />
                      <div>
                        <span className="font-bold text-[16px] text-[#F0F0F5]">{name}</span>
                        {member.user_id === sessionData?.host_id && (
                          <span className="ml-2 text-[10px] text-[#8888AA] bg-[#1E1E2A] px-1.5 py-0.5 rounded-full border border-[#2A2A38]">HOST</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {ready ? (
                        <div className="flex items-center gap-1.5 text-[#39FF6E] bg-[#39FF6E]/10 px-3.5 py-1.5 rounded-full border border-[#39FF6E]/20 shadow-inner">
                          <CheckCircle2 size={16} className="drop-shadow-[0_0_8px_rgba(57,255,110,0.4)]" />
                          <span className="text-[13px] font-bold uppercase tracking-wide">Listo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[#8888AA] bg-[#1E1E2A] px-3.5 py-1.5 rounded-full border border-[#2A2A38] shadow-inner">
                          <Loader2 size={16} className="animate-spin opacity-70" />
                          <span className="text-[13px] font-medium tracking-wide">esperando...</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/90 to-transparent pt-20 z-20 pointer-events-none">
        {isHost ? (
          <Button
            variant="primary"
            onClick={handleActivate}
            disabled={activating || localMembers.length < 1}
            className="pointer-events-auto h-[68px] rounded-2xl text-[18px] w-full shadow-[0_8px_32px_rgba(57,255,110,0.25)] hover:shadow-[0_12px_48px_rgba(57,255,110,0.45)] transition-all overflow-hidden relative group disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 flex items-center justify-center gap-3 font-bold">
              <Shield size={26} strokeWidth={2.5} />
              {activating ? "Activando..." : "Activar Radar"}
            </span>
          </Button>
        ) : (
          <div className="pointer-events-auto h-[68px] rounded-2xl flex items-center justify-center bg-[#1E1E2A] border border-[#2A2A38] text-[#8888AA] font-semibold gap-2">
            <Loader2 size={20} className="animate-spin" />
            Esperando al host para iniciar...
          </div>
        )}
      </div>
    </div>
  );
}
