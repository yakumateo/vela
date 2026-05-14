import { QrCode, Shield, CheckCircle2, MoreVertical, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { motion } from "motion/react";

export function Lobby() {
  const members = [
    { name: "María", status: "Listo", ready: true, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" },
    { name: "Ana", status: "Listo", ready: true, avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=64&h=64" },
    { name: "Luis", status: "esperando...", ready: false, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" },
    { name: "Brissa", status: "Listo", ready: true, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F] relative">
      
      <div className="h-[72px] px-6 flex items-center justify-between z-20 sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-[#2A2A38]/50 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/home" className="w-10 h-10 flex items-center justify-center bg-[#1E1E2A]/80 hover:bg-[#2A2A38] rounded-full border border-[#2A2A38] transition-colors">
            <ArrowLeft size={20} className="text-[#F0F0F5]" />
          </Link>
          <div className="flex items-center gap-2 bg-[#1E1E2A]/80 px-3 py-1.5 rounded-full border border-[#2A2A38] shadow-inner">
            <div className="w-2 h-2 rounded-full bg-[#39FF6E] shadow-[0_0_8px_#39FF6E80] animate-pulse" />
            <span className="text-[12px] font-bold text-[#F0F0F5] tracking-wide uppercase">Sesión activa</span>
          </div>
        </div>
        <button className="w-10 h-10 flex items-center justify-center hover:bg-[#1E1E2A] rounded-full transition-colors">
          <MoreVertical size={24} className="text-[#8888AA]" />
        </button>
      </div>

      <div className="px-6 py-6 flex-1 overflow-y-auto no-scrollbar pb-32 relative z-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-[10%] right-0 w-[300px] h-[300px] bg-[#39FF6E]/5 rounded-full blur-[120px] pointer-events-none" 
        />

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <Input 
            type="text" 
            defaultValue="Salida — Sábado 10 May" 
            className="text-[22px] font-extrabold h-[56px] bg-transparent border-b border-[#2A2A38] rounded-none px-0 focus:border-[#39FF6E] shadow-none tracking-tight"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <Input 
            type="text" 
            placeholder="¿A dónde van esta noche?" 
            className="h-[64px] text-[16px] bg-[#14141C]/80 shadow-inner rounded-2xl border-[#2A2A38] focus:border-[#39FF6E]/50 transition-all duration-300 px-5"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="bg-gradient-to-br from-[#1E1E2A] to-[#14141C] p-8 rounded-[32px] flex flex-col items-center mb-8 border border-[#2A2A38]/60 shadow-[0_12px_48px_rgba(0,0,0,0.4)]"
        >
          <div className="w-[200px] h-[200px] bg-white rounded-[24px] p-4 flex items-center justify-center mb-6 shadow-[0_8px_32px_rgba(255,255,255,0.15)] relative group">
            <div className="absolute inset-0 bg-[#39FF6E]/20 blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[24px]" />
            <QrCode size={160} className="text-black relative z-10" />
          </div>
          <p className="text-[#8888AA] text-[15px] mb-6 font-medium tracking-wide">Escanea para unirte al grupo</p>
          <Button variant="outline" className="w-full rounded-2xl border-dashed border-[#2A2A38] text-[#F0F0F5] hover:border-[#39FF6E]/50 hover:text-[#39FF6E] hover:bg-[#39FF6E]/5 h-[60px] transition-all font-semibold">
            Compartir enlace
          </Button>
        </motion.div>

        <div className="mb-6">
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[18px] font-bold text-[#F0F0F5] mb-5 flex items-center gap-3 tracking-tight"
          >
            Miembros del grupo
            <span className="bg-[#1E1E2A] text-[#39FF6E] text-[13px] px-2.5 py-1 rounded-full border border-[#39FF6E]/20 shadow-inner font-bold">4/6</span>
          </motion.h3>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-3"
          >
            {members.map((member, i) => (
              <motion.div key={i} variants={itemVariants} className="flex items-center justify-between p-3.5 rounded-[20px] bg-[#14141C]/80 backdrop-blur-sm border border-[#2A2A38]/50 shadow-sm hover:border-[#39FF6E]/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#1E1E2A] group-hover:border-[#39FF6E]/50 transition-colors" />
                  <span className="font-bold text-[16px] text-[#F0F0F5]">{member.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {member.ready ? (
                    <div className="flex items-center gap-1.5 text-[#39FF6E] bg-[#39FF6E]/10 px-3.5 py-1.5 rounded-full border border-[#39FF6E]/20 shadow-inner">
                      <CheckCircle2 size={16} className="drop-shadow-[0_0_8px_rgba(57,255,110,0.4)]" />
                      <span className="text-[13px] font-bold uppercase tracking-wide">Listo</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[#8888AA] bg-[#1E1E2A] px-3.5 py-1.5 rounded-full border border-[#2A2A38] shadow-inner">
                      <Loader2 size={16} className="animate-spin opacity-70" />
                      <span className="text-[13px] font-medium tracking-wide">{member.status}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/90 to-transparent pt-20 z-20 pointer-events-none">
        <Link to="/radar" className="block w-full pointer-events-auto group">
          <Button variant="primary" className="h-[68px] rounded-2xl text-[18px] w-full shadow-[0_8px_32px_rgba(57,255,110,0.25)] group-hover:shadow-[0_12px_48px_rgba(57,255,110,0.45)] transition-all overflow-hidden relative">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 flex items-center justify-center gap-3 font-bold">
              <Shield size={26} strokeWidth={2.5} />
              Activar Radar
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
