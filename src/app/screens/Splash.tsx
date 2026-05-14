import { Flame } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";

export function Splash() {
  return (
    <div className="flex-1 flex flex-col items-center justify-between p-8 min-h-full bg-gradient-to-b from-[#0A0A0F] via-[#0A0A0F] to-[#14141C]">
      <div className="flex-1 flex flex-col items-center justify-center relative w-full">
        {/* Glow de fondo animado */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 bg-gradient-to-tr from-[#39FF6E]/10 via-[#39FF6E]/5 to-transparent rounded-full blur-[120px] pointer-events-none" 
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-10 flex flex-col items-center"
        >
          <div className="relative mb-6">
            <motion.div
              animate={{ 
                boxShadow: ["0 0 20px rgba(57,255,110,0.4)", "0 0 60px rgba(57,255,110,0.8)", "0 0 20px rgba(57,255,110,0.4)"]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="bg-[#1E1E2A] p-5 rounded-3xl border border-[#39FF6E]/20"
            >
              <Flame size={80} className="text-[#39FF6E]" strokeWidth={1.5} />
            </motion.div>
            
            {/* Anillos de pulso */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] rounded-full border border-[#39FF6E]/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full border border-[#39FF6E]/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" />
          </div>
          
          <h1 className="text-[64px] font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-2 tracking-tighter drop-shadow-lg">
            Vela
          </h1>
          <p className="text-[20px] text-[#8888AA] font-medium tracking-wide">
            Tu grupo, tu escudo.
          </p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex flex-col gap-4 mb-10 mt-auto shrink-0 z-10"
      >
        <Link to="/register" className="block w-full group">
          <Button variant="primary" className="w-full py-6 text-[18px] shadow-[0_8px_32px_rgba(57,255,110,0.25)] group-hover:shadow-[0_8px_48px_rgba(57,255,110,0.4)] transition-all relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10">Crear cuenta</span>
          </Button>
        </Link>
        <Link to="/login" className="block w-full">
          <Button variant="outline" className="w-full py-6 text-[18px] border-[#2A2A38] bg-[#14141C]/50 backdrop-blur-md text-[#F0F0F5] hover:bg-[#1E1E2A] hover:border-[#F0F0F5]/30 transition-all">
            Ya tengo cuenta
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
