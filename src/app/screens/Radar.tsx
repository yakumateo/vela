import { TriangleAlert, Settings2, HandMetal } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";

export function Radar() {
  const members = [
    { name: "Ana", status: "OK", state: "safe", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=64&h=64", position: { top: "25%", right: "25%" } },
    { name: "Luis", status: "Sin respuesta (15m)", state: "warning", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64", position: { bottom: "30%", left: "20%" } },
    { name: "Brissa", status: "OK", state: "safe", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64", position: { top: "40%", left: "25%" } },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F] overflow-hidden">
      <div className="h-[72px] px-6 flex items-center justify-between z-10 sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-[#2A2A38]/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1E1E2A]/80 px-3 py-1.5 rounded-full border border-[#2A2A38] shadow-inner">
            <div className="w-2 h-2 rounded-full bg-[#39FF6E] shadow-[0_0_8px_#39FF6E80] animate-pulse" />
            <span className="text-[12px] font-bold text-[#F0F0F5] tracking-wide uppercase">Vela Activa</span>
          </div>
          <span className="text-[#8888AA] font-bold text-[14px] bg-[#14141C]/80 px-3 py-1.5 rounded-full border border-[#2A2A38]/50 shadow-inner tracking-wider font-mono">2h 14m</span>
        </div>
        <button className="w-10 h-10 flex items-center justify-center hover:bg-[#1E1E2A] rounded-full border border-transparent hover:border-[#2A2A38] transition-colors shadow-sm">
          <Settings2 size={24} className="text-[#8888AA]" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative w-full overflow-hidden min-h-0 bg-gradient-to-b from-[#0A0A0F] via-[#14141C]/50 to-[#0A0A0F]">
        
        {/* Glow central */}
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 m-auto w-[200px] h-[200px] bg-[#39FF6E]/10 rounded-full blur-[80px] pointer-events-none" 
        />

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

        <motion.div 
          animate={{ boxShadow: ["0 0 16px #39FF6E", "0 0 32px #39FF6E", "0 0 16px #39FF6E"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-5 h-5 rounded-full bg-[#39FF6E] z-10 border-[3px] border-[#0A0A0F]" 
        />

        {members.map((member, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.2 + 0.5, type: "spring" }}
            className="absolute flex flex-col items-center gap-1 z-10 group"
            style={member.position}
          >
            <div className="relative">
              <img 
                src={member.avatar} 
                className={`w-11 h-11 rounded-full border-[3px] shadow-[0_0_16px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110 relative z-10 ${member.state === 'safe' ? 'border-[#39FF6E] shadow-[#39FF6E]/30' : 'border-[#FFD700] shadow-[#FFD700]/30 animate-pulse'}`} 
              />
              {member.state === 'warning' && (
                <div className="absolute -inset-2 bg-[#FFD700]/20 rounded-full blur-md animate-pulse" />
              )}
            </div>
            <span className="text-[12px] font-bold text-[#F0F0F5] bg-[#14141C]/90 px-2.5 py-0.5 rounded-full border border-[#2A2A38] backdrop-blur-md shadow-md">
              {member.name}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.2 }}
        className="bg-[#14141C]/95 backdrop-blur-xl border-t border-[#2A2A38]/80 px-6 pt-5 pb-8 rounded-t-[32px] shrink-0 shadow-[0_-12px_48px_rgba(0,0,0,0.5)] z-20 relative"
      >
        <div className="w-12 h-1.5 bg-[#2A2A38] rounded-full mx-auto mb-6 opacity-50" />
        
        <div className="flex overflow-x-auto no-scrollbar gap-4 mb-6 pb-2 -mx-6 px-6 snap-x">
          {members.map((member, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 + 0.5 }}
              className="snap-start flex items-center gap-3 p-3.5 rounded-[24px] bg-[#1E1E2A] min-w-[240px] border border-[#2A2A38]/50 shadow-md hover:border-[#39FF6E]/30 transition-colors shrink-0"
            >
              <div className="relative">
                <img src={member.avatar} alt={member.name} className="w-14 h-14 rounded-full object-cover border-2 border-[#14141C]" />
                <div className={`absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full border-[3px] border-[#1E1E2A] shadow-inner ${member.state === 'safe' ? 'bg-[#39FF6E]' : 'bg-[#FFD700]'}`} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[16px] text-[#F0F0F5]">{member.name}</span>
                <span className={`text-[13px] font-medium tracking-wide ${member.state === 'safe' ? 'text-[#8888AA]' : 'text-[#FFD700]'}`}>{member.status}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <Link to="/bathroom" className="block w-full">
            <Button variant="secondary" className="h-[64px] rounded-2xl w-full text-[14px] bg-[#1E1E2A] hover:bg-[#2A2A38] shadow-sm flex-col py-0 items-center justify-center gap-1 border border-[#2A2A38]/50 transition-all hover:shadow-md">
              <span className="text-2xl mb-0.5">🚽</span>
              <span className="text-[12px] font-semibold text-[#8888AA]">Voy al baño</span>
            </Button>
          </Link>
          <Link to="/taxi" className="block w-full">
            <Button variant="secondary" className="h-[64px] rounded-2xl w-full text-[14px] bg-[#1E1E2A] hover:bg-[#2A2A38] shadow-sm flex-col py-0 items-center justify-center gap-1 border border-[#2A2A38]/50 transition-all hover:shadow-md">
              <span className="text-2xl mb-0.5">🚕</span>
              <span className="text-[12px] font-semibold text-[#8888AA]">Voy a casa</span>
            </Button>
          </Link>
        </div>

        <Link to="/panic" className="block w-full group">
          <Button variant="danger" className="w-full h-[68px] rounded-2xl text-[18px] shadow-[0_8px_32px_rgba(255,59,48,0.25)] hover:shadow-[0_12px_48px_rgba(255,59,48,0.45)] transition-all flex items-center justify-center gap-3 active:bg-[#CC2F26] relative overflow-hidden font-bold">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <TriangleAlert size={26} strokeWidth={2.5} className="relative z-10" />
            <span className="relative z-10">Activar Alerta de Pánico</span>
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
