import { Check, Plus, Clock, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/Button";

export function BathroomMode() {
  return (
    <div className="flex flex-col h-full bg-[#0A0A0F]">
      
      <div className="h-[72px] px-6 flex items-center justify-between z-10 sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-md shrink-0">
        <Link to="/radar" className="w-10 h-10 flex items-center justify-center bg-[#1E1E2A] hover:bg-[#2A2A38] rounded-full border border-[#2A2A38] transition-colors">
          <ArrowLeft size={20} className="text-[#F0F0F5]" />
        </Link>
      </div>

      <div className="px-6 flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-[#FFD700]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col items-center mb-8 relative z-10">
          <span className="text-4xl mb-4 drop-shadow-[0_4px_16px_rgba(255,215,0,0.3)]">🚽</span>
          <h1 className="text-[28px] font-bold text-[#F0F0F5] mb-2 tracking-tight text-center">Modo Baño/Barra</h1>
          <p className="text-[#8888AA] text-[15px] text-center max-w-[80%] leading-relaxed">Tu grupo sabrá si no regresas a tiempo</p>
        </div>

        <div className="relative w-[280px] h-[280px] flex items-center justify-center mb-10 z-10">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="140" cy="140" r="130" fill="none" stroke="#1E1E2A" strokeWidth="8" />
            <circle 
              cx="140" 
              cy="140" 
              r="130" 
              fill="none" 
              stroke="#FFD700" 
              strokeWidth="8" 
              strokeDasharray="816" 
              strokeDashoffset="160" 
              strokeLinecap="round" 
              className="drop-shadow-[0_0_12px_rgba(255,215,0,0.5)] transition-all duration-1000"
            />
          </svg>
          
          <div className="flex flex-col items-center z-10">
            <span className="text-[72px] font-bold text-[#F0F0F5] tracking-tighter tabular-nums drop-shadow-[0_4px_24px_rgba(255,215,0,0.2)]">08:42</span>
            <span className="text-[16px] text-[#FFD700] font-medium tracking-widest uppercase">minutos</span>
          </div>
        </div>

        <div className="flex flex-col items-center mb-10 z-10 w-full">
          <p className="text-[#8888AA] text-[13px] uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
            <Clock size={14} />
            Configurar tiempo
          </p>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 rounded-full bg-[#1E1E2A] text-[#8888AA] font-bold text-[15px] border border-[#2A2A38] hover:border-[#F0F0F5]/30 transition-all">5 min</button>
            <button className="px-5 py-2.5 rounded-full bg-[#FFD700]/10 text-[#FFD700] font-bold text-[15px] border border-[#FFD700]/30 shadow-[0_0_16px_rgba(255,215,0,0.15)] transition-all">10 min</button>
            <button className="px-5 py-2.5 rounded-full bg-[#1E1E2A] text-[#8888AA] font-bold text-[15px] border border-[#2A2A38] hover:border-[#F0F0F5]/30 transition-all">15 min</button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#1E1E2A]/50 border border-[#2A2A38]/50 px-4 py-2.5 rounded-full backdrop-blur-md shadow-sm z-10">
          <div className="w-2 h-2 rounded-full bg-[#39FF6E] shadow-[0_0_8px_#39FF6E80]" />
          <span className="text-[#8888AA] text-[13px] font-medium tracking-wide">Tu grupo fue notificado</span>
        </div>
      </div>

      <div className="px-6 pb-8 pt-4 shrink-0 flex flex-col gap-4 bg-gradient-to-t from-[#0A0A0F] to-transparent relative z-10">
        <Link to="/radar" className="block w-full">
          <Button variant="primary" className="h-[64px] text-[18px] w-full shadow-[0_8px_32px_rgba(57,255,110,0.2)] hover:shadow-[0_12px_48px_rgba(57,255,110,0.4)] transition-all">
            <Check size={24} strokeWidth={3} />
            Ya regresé
          </Button>
        </Link>
        <Button variant="outline" className="h-[64px] text-[16px] w-full border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/5 hover:border-[#FFD700]/50 transition-all group">
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Necesito más tiempo +5min
        </Button>
      </div>
    </div>
  );
}
