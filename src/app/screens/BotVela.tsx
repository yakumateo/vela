import { ArrowLeft, Bot, MessageSquareText } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/Button";

export function BotVela() {
  return (
    <div className="flex flex-col h-full bg-[#0A0A0F] overflow-hidden">
      
      <div className="h-[72px] px-6 flex items-center justify-between z-10 sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-md shrink-0 border-b border-[#2A2A38]/50">
        <Link to="/taxi" className="w-10 h-10 flex items-center justify-center bg-[#1E1E2A] hover:bg-[#2A2A38] rounded-full border border-[#2A2A38] transition-colors shadow-sm">
          <ArrowLeft size={20} className="text-[#F0F0F5]" />
        </Link>
        <span className="text-[14px] font-bold text-[#F0F0F5] tracking-wide uppercase">WhatsApp Bot</span>
        <div className="w-10 h-10" />
      </div>

      <div className="px-6 pt-8 pb-4 flex-1 flex flex-col z-10 overflow-y-auto no-scrollbar relative">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[250px] h-[250px] bg-[#25D366]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-[#25D366]/10 rounded-2xl flex items-center justify-center mb-4 border border-[#25D366]/30 shadow-[0_8px_32px_rgba(37,211,102,0.15)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#25D366]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Bot size={32} className="text-[#25D366] drop-shadow-[0_0_12px_rgba(37,211,102,0.4)]" />
          </div>
          <h1 className="text-[28px] font-black text-[#F0F0F5] mb-2 tracking-tight flex items-center justify-center gap-3">
            Bot Vela <span className="text-[#25D366]"><MessageSquareText size={28} /></span>
          </h1>
          <p className="text-[#8888AA] text-[15px] font-medium tracking-wide">Tu asistente de regreso a casa</p>
        </div>

        <div className="bg-[#14141C] border border-[#2A2A38] rounded-[24px] flex flex-col overflow-hidden mb-6 shadow-[0_12px_48px_rgba(0,0,0,0.5)]">
          <div className="bg-[#1E1E2A] px-4 py-3 flex items-center gap-3 border-b border-[#2A2A38]/50">
            <div className="w-10 h-10 bg-[#0A0A0F] rounded-full flex items-center justify-center border border-[#2A2A38]">
              <Bot size={20} className="text-[#25D366]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[15px] text-[#F0F0F5] flex items-center gap-2">
                Bot Vela <span className="text-[#25D366] text-[10px]">✓</span>
              </span>
              <span className="text-[12px] text-[#8888AA] font-medium">en línea</span>
            </div>
          </div>
          
          <div className="p-4 flex flex-col gap-4 bg-[#0A0A0F]/50">
            <div className="bg-[#1E1E2A] p-3.5 rounded-2xl rounded-tl-sm border border-[#2A2A38]/50 max-w-[85%] self-start shadow-sm">
              <p className="text-[14px] text-[#F0F0F5] leading-relaxed">
                Hola María 👋 Activaste el modo retorno. Compartiste tu ubicación: Miraflores, Lima. Placa registrada: <span className="font-mono bg-[#14141C] px-1 rounded">ABC-123</span>. Te contactaré en 25 minutos para confirmar tu llegada. Tus contactos están en alerta.
              </p>
              <span className="text-[10px] text-[#8888AA] block text-right mt-2 font-mono">02:15 AM</span>
            </div>
            
            <div className="bg-[#005C4B] p-3.5 rounded-2xl rounded-tr-sm max-w-[85%] self-end shadow-sm">
              <p className="text-[14px] text-white leading-relaxed">Listo 🙌</p>
              <span className="text-[10px] text-white/70 block text-right mt-1 font-mono flex items-center justify-end gap-1">
                02:16 AM <span className="text-[#39FF6E]">✓✓</span>
              </span>
            </div>

            <div className="flex items-center justify-center my-2">
              <span className="bg-[#1E1E2A] text-[#8888AA] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#2A2A38]/50">
                25 minutos después
              </span>
            </div>
            
            <div className="bg-[#1E1E2A] p-3.5 rounded-2xl rounded-tl-sm border border-[#2A2A38]/50 max-w-[85%] self-start shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 bottom-0 bg-[#FFD700]" />
              <p className="text-[14px] text-[#F0F0F5] leading-relaxed">
                ⏰ Han pasado 25 minutos. ¿Llegaste bien? Responde con tu palabra clave.
              </p>
              <span className="text-[10px] text-[#8888AA] block text-right mt-2 font-mono">02:41 AM</span>
            </div>
            
            <div className="bg-[#005C4B] p-3.5 rounded-2xl rounded-tr-sm max-w-[85%] self-end shadow-sm">
              <p className="text-[14px] text-white font-bold tracking-wide">Vela ✓</p>
              <span className="text-[10px] text-white/70 block text-right mt-1 font-mono flex items-center justify-end gap-1">
                02:42 AM <span className="text-[#39FF6E]">✓✓</span>
              </span>
            </div>

            <div className="bg-[#1E1E2A] p-3.5 rounded-2xl rounded-tl-sm border border-[#2A2A38]/50 max-w-[85%] self-start shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 bottom-0 bg-[#39FF6E]" />
              <p className="text-[14px] text-[#F0F0F5] leading-relaxed">
                ✅ ¡Perfecto! Confirmación registrada. Buenas noches 🕯️
              </p>
              <span className="text-[10px] text-[#8888AA] block text-right mt-2 font-mono">02:42 AM</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-8 pt-4 shrink-0 bg-[#0A0A0F] z-20">
        <Link to="/home" className="block w-full mb-4">
          <Button variant="primary" className="h-[64px] text-[18px] w-full bg-[#25D366] text-black shadow-[0_8px_32px_rgba(37,211,102,0.3)] hover:shadow-[0_12px_48px_rgba(37,211,102,0.5)] transition-all hover:bg-[#20bd5a] group flex items-center justify-center gap-3">
            <Bot size={24} className="group-hover:scale-110 transition-transform" strokeWidth={2.5} />
            Conectar mi WhatsApp
          </Button>
        </Link>
        <p className="text-center text-[12px] text-[#8888AA] font-medium tracking-wide uppercase px-4">
          El bot solo envía mensajes relacionados a tu seguridad
        </p>
      </div>
    </div>
  );
}
