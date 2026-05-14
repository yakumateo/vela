import { Users, QrCode, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Header } from "../components/Header";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useSession } from "../context/SessionContext";
import { createSession } from "../../services/session.service";
import { toast } from "sonner";
import { useState } from "react";

export function Home() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { refresh } = useSession();
  const [loading, setLoading] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const firstName = profile?.full_name?.split(" ")[0] || "Tú";

  const handleNewSession = async () => {
    if (!user) { toast.error("Debes iniciar sesión"); return; }
    setLoading(true);
    try {
      const session = await createSession(
        user.id,
        `Salida — ${new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "short" })}`
      );
      await refresh();
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
      await refresh();
      navigate(`/lobby?sid=${session.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Código inválido");
    } finally {
      setLoading(false);
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
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F] relative">
      <Header />

      <div className="px-6 py-8 flex-1 flex flex-col overflow-y-auto no-scrollbar relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#39FF6E]/5 rounded-full blur-[140px] pointer-events-none"
        />

        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-[32px] font-extrabold text-[#F0F0F5] mb-8 leading-tight tracking-tight drop-shadow-sm"
        >
          {greeting.text},<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#8888AA]">
            {firstName}
          </span>{" "}
          <span className="text-[28px] inline-block animate-bounce" style={{ animationDuration: "2s" }}>
            {greeting.emoji}
          </span>
        </motion.h1>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-6">
          {/* Iniciar salida */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-b from-[#1E1E2A] to-[#14141C] rounded-[28px] p-7 shadow-[0_12px_48px_rgba(0,0,0,0.6)] border border-[#2A2A38] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#39FF6E]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-14 h-14 bg-[#0A0A0F]/50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-[#2A2A38]/50 backdrop-blur-sm">
              <Users size={28} className="text-[#39FF6E] drop-shadow-[0_0_12px_rgba(57,255,110,0.6)]" />
            </div>
            <h2 className="text-[24px] font-bold text-[#F0F0F5] mb-2 tracking-tight">Iniciar una Salida</h2>
            <p className="text-[#8888AA] text-[15px] mb-8 leading-relaxed max-w-[90%] font-medium">
              Crea un grupo para esta noche y cuídense entre todos durante toda la ruta.
            </p>
            <Button
              variant="primary"
              onClick={handleNewSession}
              disabled={loading}
              className="h-[64px] text-[18px] w-full rounded-2xl shadow-[0_8px_32px_rgba(57,255,110,0.25)] hover:shadow-[0_12px_48px_rgba(57,255,110,0.4)] transition-all overflow-hidden group/btn relative z-10 disabled:opacity-60"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center gap-2 font-bold">
                <Plus size={24} strokeWidth={2.5} />
                {loading ? "Creando..." : "Nueva Salida"}
              </span>
            </Button>
          </motion.div>

          {/* Unirse */}
          <motion.div
            variants={itemVariants}
            className="bg-[#14141C]/80 backdrop-blur-md rounded-[28px] p-6 border border-[#2A2A38]/60 shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all hover:bg-[#1E1E2A]/80 hover:border-[#2A2A38] group"
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-[#1E1E2A] rounded-2xl flex items-center justify-center border border-[#2A2A38]/50 group-hover:bg-[#2A2A38] transition-colors">
                <QrCode size={24} className="text-[#8888AA] group-hover:text-[#F0F0F5] transition-colors" />
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-[#F0F0F5] tracking-tight">Unirme a una Salida</h3>
                <p className="text-[14px] text-[#8888AA] font-medium mt-0.5">Ingresa el código de 6 caracteres</p>
              </div>
            </div>

            {showJoin ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Ej: AB12CD"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="flex-1 h-[56px] bg-[#1E1E2A] rounded-2xl text-[#F0F0F5] px-5 text-[18px] font-mono tracking-widest outline-none border-2 border-[#2A2A38] focus:border-[#39FF6E] transition-all placeholder:text-[#8888AA]"
                />
                <Button
                  variant="primary"
                  onClick={handleJoin}
                  disabled={loading || joinCode.length < 4}
                  className="h-[56px] px-6 rounded-2xl w-auto disabled:opacity-60"
                >
                  {loading ? "..." : "Unirse"}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowJoin(true)}
                className="h-[56px] rounded-2xl border-[#2A2A38] text-[#8888AA] hover:text-[#F0F0F5] hover:border-[#F0F0F5]/30 hover:bg-[#F0F0F5]/5 transition-all w-full font-semibold"
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
