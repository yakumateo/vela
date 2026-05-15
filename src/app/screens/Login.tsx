import { useState } from "react";
import { Flame, ArrowRight, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { motion } from "motion/react";
import { signIn } from "../../services/auth.service";
import { toast } from "sonner";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Completa todos los campos");
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/home");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al ingresar";
      if (msg.includes("Invalid login")) {
        toast.error("Correo o contraseña incorrectos");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  } as const;
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="flex flex-col h-full px-6 pt-16 pb-8 bg-gradient-to-b from-[#0A0A0F] via-[#14141C]/80 to-[#0A0A0F] relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute -top-[10%] -right-[10%] w-[400px] h-[400px] bg-[#39FF6E]/5 rounded-full blur-[120px] pointer-events-none"
      />

      <motion.form
        variants={containerVariants}
        initial="hidden"
        animate="show"
        onSubmit={handleLogin}
        className="flex flex-col flex-1"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 mb-10">
          <div className="relative p-4 rounded-2xl bg-[#1E1E2A]/80 backdrop-blur-md border border-[#39FF6E]/20 shadow-[0_8px_32px_rgba(57,255,110,0.15)]">
            <Flame size={36} className="text-[#39FF6E] drop-shadow-[0_0_16px_rgba(57,255,110,0.8)]" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-12 text-center">
          <h1 className="text-[36px] font-extrabold text-[#F0F0F5] mb-2 tracking-tight">Bienvenida</h1>
          <p className="text-[#8888AA] text-[16px] font-medium">Ingresa para protegerte con Vela</p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col gap-5 mb-10">
          <div className="relative group">
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="bg-[#14141C]/80 border-[#2A2A38] focus:border-[#39FF6E]/50 focus:bg-[#1E1E2A] text-[16px] h-[64px] rounded-2xl pl-14 pr-4 transition-all duration-300 shadow-sm"
            />
            <Mail size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8888AA] group-focus-within:text-[#39FF6E] transition-colors duration-300 pointer-events-none" />
          </div>
          <div className="relative group">
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="bg-[#14141C]/80 border-[#2A2A38] focus:border-[#39FF6E]/50 focus:bg-[#1E1E2A] text-[16px] h-[64px] rounded-2xl pl-14 pr-4 transition-all duration-300 shadow-sm"
            />
            <Lock size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8888AA] group-focus-within:text-[#39FF6E] transition-colors duration-300 pointer-events-none" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full text-[18px] h-[64px] rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(57,255,110,0.2)] hover:shadow-[0_12px_48px_rgba(57,255,110,0.4)] transition-all overflow-hidden relative mb-8 group disabled:opacity-60"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 font-bold">
              {loading ? "Ingresando..." : "Ingresar"}
            </span>
            {!loading && <ArrowRight size={22} className="relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />}
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col items-center gap-6 mt-auto">
          <button type="button" className="text-[#8888AA] text-[15px] font-medium hover:text-[#F0F0F5] transition-colors underline decoration-[#8888AA]/30 underline-offset-4">
            ¿Olvidaste tu contraseña?
          </button>
          <div className="flex items-center gap-4 w-full px-4 my-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#2A2A38]" />
            <span className="text-[#8888AA] text-[13px] font-medium uppercase tracking-wider">o</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#2A2A38]" />
          </div>
          <Link to="/register" className="text-[#8888AA] text-[16px] hover:text-[#F0F0F5] transition-colors font-medium">
            ¿No tienes cuenta?{" "}
            <span className="text-[#39FF6E] font-bold border-b-2 border-[#39FF6E]/30 pb-0.5 hover:border-[#39FF6E] transition-colors">
              Regístrate
            </span>
          </Link>
        </motion.div>
      </motion.form>
    </div>
  );
}
