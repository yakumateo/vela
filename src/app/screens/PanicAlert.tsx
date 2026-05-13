import { ShieldAlert, MapPin, Smartphone, Users, X, Clock } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/Button";

export function PanicAlert() {
  return (
    <div className="flex flex-col h-full bg-[#0A0A0F] overflow-y-auto no-scrollbar relative animate-in fade-in duration-300">
      
      <div className="fixed inset-0 bg-[#FF3B30]/15 mix-blend-color pointer-events-none z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#FF3B30]/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="px-6 py-12 flex-1 flex flex-col items-center relative z-10">
        
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[#FF3B30] rounded-full blur-[40px] opacity-40 animate-[pulse_1s_ease-in-out_infinite]" />
          <div className="absolute inset-0 border-4 border-[#FF3B30]/30 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <div className="absolute inset-0 border-[8px] border-[#FF3B30]/10 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" />
          
          <div className="w-[140px] h-[140px] bg-[#FF3B30] rounded-full flex flex-col items-center justify-center shadow-[0_0_64px_rgba(255,59,48,0.6)] animate-pulse relative z-10">
            <ShieldAlert size={64} className="text-white drop-shadow-md" />
            <span className="text-white font-black text-[28px] tracking-widest mt-1">SOS</span>
          </div>
        </div>

        <h1 className="text-[36px] font-black text-white mb-2 tracking-tighter uppercase drop-shadow-[0_4px_16px_rgba(255,59,48,0.5)]">Alerta enviada</h1>
        <p className="text-[#FF3B30] text-[16px] font-medium tracking-wide mb-10 text-center uppercase">Tu grupo está en camino</p>

        <div className="w-full flex flex-col gap-3 mb-10">
          <div className="flex items-center gap-4 bg-[#14141C]/80 p-4 rounded-2xl border border-[#FF3B30]/30 shadow-[0_4px_24px_rgba(255,59,48,0.1)] backdrop-blur-md relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF3B30] group-hover:w-2 transition-all" />
            <div className="w-10 h-10 bg-[#FF3B30]/10 rounded-xl flex items-center justify-center shrink-0 border border-[#FF3B30]/20">
              <MapPin size={20} className="text-[#FF3B30]" />
            </div>
            <span className="text-[15px] font-medium text-[#F0F0F5] leading-snug">Ubicación compartida con tu grupo</span>
            <div className="ml-auto w-6 h-6 rounded-full bg-[#39FF6E]/10 border border-[#39FF6E]/30 flex items-center justify-center shadow-[0_0_8px_rgba(57,255,110,0.2)] shrink-0">
              <span className="text-[#39FF6E] text-[12px]">✓</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-[#14141C]/80 p-4 rounded-2xl border border-[#FF3B30]/30 shadow-[0_4px_24px_rgba(255,59,48,0.1)] backdrop-blur-md relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF3B30] group-hover:w-2 transition-all" />
            <div className="w-10 h-10 bg-[#FF3B30]/10 rounded-xl flex items-center justify-center shrink-0 border border-[#FF3B30]/20">
              <Smartphone size={20} className="text-[#FF3B30]" />
            </div>
            <span className="text-[15px] font-medium text-[#F0F0F5] leading-snug">Notificación enviada a Ana, Brissa, Luis</span>
            <div className="ml-auto w-6 h-6 rounded-full bg-[#39FF6E]/10 border border-[#39FF6E]/30 flex items-center justify-center shadow-[0_0_8px_rgba(57,255,110,0.2)] shrink-0">
              <span className="text-[#39FF6E] text-[12px]">✓</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-[#14141C]/80 p-4 rounded-2xl border border-[#FF3B30]/30 shadow-[0_4px_24px_rgba(255,59,48,0.1)] backdrop-blur-md relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF3B30] group-hover:w-2 transition-all" />
            <div className="w-10 h-10 bg-[#FF3B30]/10 rounded-xl flex items-center justify-center shrink-0 border border-[#FF3B30]/20">
              <Users size={20} className="text-[#FF3B30]" />
            </div>
            <span className="text-[15px] font-medium text-[#F0F0F5] leading-snug">Contactos de emergencia alertados</span>
            <div className="ml-auto w-6 h-6 rounded-full bg-[#39FF6E]/10 border border-[#39FF6E]/30 flex items-center justify-center shadow-[0_0_8px_rgba(57,255,110,0.2)] shrink-0">
              <span className="text-[#39FF6E] text-[12px]">✓</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-[#1E1E2A] rounded-2xl p-4 border border-[#2A2A38] shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-[#FF3B30]/5 rounded-full blur-[60px] pointer-events-none" />
          
          <h3 className="text-[13px] font-bold text-[#8888AA] uppercase tracking-widest mb-3 flex items-center gap-2">
            <Clock size={14} />
            Información para tu grupo
          </h3>
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-[#14141C] rounded-xl overflow-hidden shrink-0 border border-[#2A2A38]/50 relative">
              <div className="absolute inset-0 bg-[#39FF6E]/10 flex items-center justify-center">
                <div className="w-3 h-3 bg-[#39FF6E] rounded-full shadow-[0_0_12px_#39FF6E]" />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[15px] font-bold text-[#F0F0F5] mb-1">Manifesto, Miraflores</span>
              <span className="text-[13px] text-[#8888AA] font-mono tracking-wide">Última actualización: 02:14 AM</span>
            </div>
          </div>
        </div>

      </div>

      <div className="px-6 pb-8 pt-4 shrink-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/90 to-transparent sticky bottom-0 z-20">
        <Link to="/radar" className="block w-full">
          <Button variant="outline" className="h-[64px] text-[18px] w-full border-[#F0F0F5]/50 text-[#F0F0F5] hover:bg-[#F0F0F5]/10 hover:border-[#F0F0F5] transition-all group shadow-[0_8px_32px_rgba(0,0,0,0.5)] bg-[#0A0A0F]">
            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
            Estoy bien — Cancelar alerta
          </Button>
        </Link>
        <p className="text-center text-[12px] text-[#8888AA] mt-4 font-medium tracking-wide uppercase">
          La alerta se cancelará solo si TÚ la cancelas
        </p>
      </div>
    </div>
  );
}
