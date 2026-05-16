import { Users, QrCode, Plus, ChevronRight, Clock, MapPin, Flame } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Header } from "../components/Header";
import { motion } from "motion/react";
import { AddressAutocomplete } from "../components/AddressAutocomplete";
import { useAuth } from "../context/AuthContext";
import { useSession } from "../context/SessionContext";
import { createSession } from "../../services/session.service";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const STATUS_CONFIG: Record<string, { color: string; label: string; glow: string }> = {
  lobby: { color: "#FFD700", label: "En lobby", glow: "rgba(255,215,0,0.3)" },
  active: { color: "#39FF6E", label: "Radar activo", glow: "rgba(57,255,110,0.3)" },
  ready: { color: "#39FF6E", label: "Listo", glow: "rgba(57,255,110,0.3)" },
  bathroom: { color: "#478BFF", label: "En el baño", glow: "rgba(71,139,255,0.3)" },
  taxi: { color: "#8888AA", label: "De camino", glow: "rgba(136,136,170,0.3)" },
};

export function Home() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { userSessions, refreshSessions } = useSession();
  const [loading, setLoading] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [sessionVenue, setSessionVenue] = useState("");

  const firstName = profile?.full_name?.split(" ")[0] || "Tú";

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  const handleNewSession = async () => {
    if (!user) { toast.error("Debes iniciar sesión"); return; }
    const name = sessionName.trim() || `Salida — ${new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "short" })}`;
    setLoading(true);
    try {
      const session = await createSession(user.id, name, sessionVenue.trim() || undefined);
      await refreshSessions();
      setShowCreate(false);
      setSessionName("");
      setSessionVenue("");
      navigate(`/lobby?sid=${session.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear la salida");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user || !joinCode.trim()) return;
    setLoading(true);
    try {
      const { joinSessionByCode } = await import("../../services/session.service");
      const session = await joinSessionByCode(joinCode.trim(), user.id);
      await refreshSessions();
      setShowJoin(false);
      setJoinCode("");
      navigate(`/lobby?sid=${session.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Código inválido");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSession = (sessionId: string, status: string) => {
    if (status === "lobby") {
      navigate(`/lobby?sid=${sessionId}`);
    } else {
      navigate(`/radar?sid=${sessionId}`);
    }
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return { text: "Buenos días", emoji: "☀️" };
    if (h >= 12 && h < 19) return { text: "Buenas tardes", emoji: "🌤️" };
    return { text: "Buenas noches", emoji: "🌙" };
  };
  const greeting = getGreeting();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  } as const;
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F] relative">
      <Header />

      <div className="px-6 py-6 flex-1 flex flex-col overflow-y-auto no-scrollbar relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#39FF6E]/5 rounded-full blur-[140px] pointer-events-none"
        />

        {/* Greeting */}
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-[28px] font-extrabold text-[#F0F0F5] mb-6 leading-tight tracking-tight"
        >
          {greeting.text},{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#8888AA]">
            {firstName}
          </span>{" "}
          <span className="text-[24px] inline-block animate-bounce" style={{ animationDuration: "2s" }}>
            {greeting.emoji}
          </span>
        </motion.h1>

        {/* Active sessions list */}
        {userSessions.length > 0 && (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="mb-6">
            <h2 className="text-[14px] font-bold text-[#8888AA] uppercase tracking-widest mb-3 pl-1 flex items-center gap-2">
              <Flame size={14} className="text-[#39FF6E]" />
              Salidas activas ({userSessions.length})
            </h2>
            <div className="flex flex-col gap-3">
              {userSessions.map(({ session: s, memberStatus }) => {
                const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG[memberStatus] || STATUS_CONFIG.active;
                const timeAgo = s.created_at
                  ? formatDistanceToNow(new Date(s.created_at), { locale: es, addSuffix: true })
                  : "";
                return (
                  <motion.button
                    key={s.id}
                    variants={itemVariants}
                    onClick={() => handleOpenSession(s.id, s.status)}
                    className="bg-[#14141C]/80 backdrop-blur-md rounded-[20px] p-4 border border-[#2A2A38]/60 shadow-[0_4px_16px_rgba(0,0,0,0.3)] text-left hover:border-[#39FF6E]/30 transition-all group active:scale-[0.98] relative overflow-hidden"
                  >
                    <div
                      className="absolute top-0 left-0 bottom-0 w-1 rounded-r-full transition-all group-hover:w-1.5"
                      style={{ backgroundColor: cfg.color }}
                    />
                    <div className="flex items-center justify-between pl-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-[16px] font-bold text-[#F0F0F5] truncate group-hover:text-white transition-colors">
                            {s.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 text-[13px] text-[#8888AA]">
                          {s.venue && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} /> {s.venue}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {timeAgo}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{
                          backgroundColor: `${cfg.color}10`,
                          borderColor: `${cfg.color}30`,
                          color: cfg.color,
                        }}>
                          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: cfg.color, boxShadow: `0 0 8px ${cfg.glow}` }} />
                          <span className="text-[12px] font-bold uppercase tracking-wide">{cfg.label}</span>
                        </div>
                        <ChevronRight size={20} className="text-[#2A2A38] group-hover:text-[#F0F0F5] transition-colors" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Action cards */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-4">
          {/* New session card */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-b from-[#1E1E2A] to-[#14141C] rounded-[24px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[#2A2A38] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#39FF6E]/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-12 h-12 bg-[#0A0A0F]/50 rounded-2xl flex items-center justify-center border border-[#2A2A38]/50">
                <Users size={24} className="text-[#39FF6E] drop-shadow-[0_0_12px_rgba(57,255,110,0.6)]" />
              </div>
              <div>
                <h2 className="text-[20px] font-bold text-[#F0F0F5] tracking-tight">Iniciar una Salida</h2>
                <p className="text-[#8888AA] text-[13px] font-medium">Crea un grupo y cuídense entre todos</p>
              </div>
            </div>

            {showCreate ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex flex-col gap-3 relative z-10"
              >
                <input
                  type="text"
                  placeholder="Nombre de la salida (opcional)"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="h-[52px] bg-[#0A0A0F] rounded-xl text-[#F0F0F5] px-4 text-[15px] outline-none border border-[#2A2A38] focus:border-[#39FF6E]/50 transition-colors placeholder:text-[#8888AA]"
                />
                <AddressAutocomplete
                  value={sessionVenue}
                  onChange={setSessionVenue}
                  onSelect={(name) => setSessionVenue(name)}
                  placeholder="📍 Lugar (opcional)"
                  className="!h-[52px] !rounded-xl !bg-[#0A0A0F]"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 h-[52px] rounded-xl border-[#2A2A38] text-[#8888AA]"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleNewSession}
                    disabled={loading}
                    className="flex-1 h-[52px] rounded-xl shadow-[0_4px_16px_rgba(57,255,110,0.2)] disabled:opacity-60"
                  >
                    <Plus size={20} strokeWidth={2.5} />
                    {loading ? "Creando..." : "Crear"}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <Button
                variant="primary"
                onClick={() => setShowCreate(true)}
                className="h-[56px] text-[16px] w-full rounded-xl shadow-[0_6px_24px_rgba(57,255,110,0.2)] hover:shadow-[0_8px_32px_rgba(57,255,110,0.35)] transition-all relative z-10 font-bold"
              >
                <Plus size={22} strokeWidth={2.5} />
                Nueva Salida
              </Button>
            )}
          </motion.div>

          {/* Join session card */}
          <motion.div
            variants={itemVariants}
            className="bg-[#14141C]/80 backdrop-blur-md rounded-[24px] p-5 border border-[#2A2A38]/60 shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-all hover:bg-[#1E1E2A]/80 group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#1E1E2A] rounded-2xl flex items-center justify-center border border-[#2A2A38]/50 group-hover:bg-[#2A2A38] transition-colors">
                <QrCode size={24} className="text-[#8888AA] group-hover:text-[#F0F0F5] transition-colors" />
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-[#F0F0F5] tracking-tight">Unirme a una Salida</h3>
                <p className="text-[13px] text-[#8888AA] font-medium">Ingresa el código de 6 caracteres</p>
              </div>
            </div>

            {showJoin ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Ej: AB12CD"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="flex-1 h-[52px] bg-[#1E1E2A] rounded-xl text-[#F0F0F5] px-5 text-[18px] font-mono tracking-widest outline-none border-2 border-[#2A2A38] focus:border-[#39FF6E] transition-all placeholder:text-[#8888AA]"
                />
                <Button
                  variant="primary"
                  onClick={handleJoin}
                  disabled={loading || joinCode.length < 4}
                  className="h-[52px] px-6 rounded-xl w-auto disabled:opacity-60"
                >
                  {loading ? "..." : "Unirse"}
                </Button>
              </motion.div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowJoin(true)}
                className="h-[52px] rounded-xl border-[#2A2A38] text-[#8888AA] hover:text-[#F0F0F5] hover:border-[#F0F0F5]/30 hover:bg-[#F0F0F5]/5 transition-all w-full font-semibold"
              >
                Tengo un código
              </Button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
