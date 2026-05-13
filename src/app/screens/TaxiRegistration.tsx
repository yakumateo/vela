import { ArrowLeft, Car, Clock, MapPin, Share2, Bot } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export function TaxiRegistration() {
  return (
    <div className="flex flex-col h-full bg-[#0A0A0F] overflow-y-auto no-scrollbar relative">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#39FF6E]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="h-[72px] px-6 flex items-center justify-between z-10 sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-md shrink-0 border-b border-[#2A2A38]/50">
        <Link to="/radar" className="w-10 h-10 flex items-center justify-center bg-[#1E1E2A] hover:bg-[#2A2A38] rounded-full border border-[#2A2A38] transition-colors shadow-sm">
          <ArrowLeft size={20} className="text-[#F0F0F5]" />
        </Link>
        <span className="text-[14px] font-bold text-[#F0F0F5] tracking-wide uppercase">Salida Segura</span>
        <div className="w-10 h-10" />
      </div>

      <div className="px-6 py-8 flex-1 flex flex-col z-10">
        <div className="mb-8">
          <h1 className="text-[32px] font-black text-[#F0F0F5] mb-2 tracking-tight uppercase flex items-center gap-3">
            Registro de Salida <span className="text-4xl drop-shadow-md">🚕</span>
          </h1>
          <p className="text-[#8888AA] text-[16px] font-medium tracking-wide">Comparte los datos de tu taxi antes de irte</p>
        </div>

        <div className="flex flex-col gap-5 mb-10">
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#8888AA] uppercase tracking-widest pl-1">Placa del vehículo</label>
            <Input 
              type="text" 
              placeholder="ABC-123" 
              icon={<Car size={20} className="text-[#8888AA]" />}
              className="h-[64px] text-[20px] font-mono tracking-widest uppercase bg-[#14141C] border-[#2A2A38]/50 focus:bg-[#1E1E2A] focus:border-[#39FF6E]/50 shadow-inner rounded-2xl pl-12"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#8888AA] uppercase tracking-widest pl-1">Aplicativo usado</label>
            <div className="grid grid-cols-2 gap-3">
              <button className="h-[56px] rounded-xl bg-[#14141C] border border-[#2A2A38]/50 text-[#8888AA] font-bold text-[15px] hover:border-[#F0F0F5]/30 hover:text-[#F0F0F5] hover:bg-[#1E1E2A] transition-all shadow-sm">Uber</button>
              <button className="h-[56px] rounded-xl bg-[#39FF6E]/10 border border-[#39FF6E]/30 text-[#39FF6E] font-bold text-[15px] shadow-[0_0_16px_rgba(57,255,110,0.15)] transition-all">InDrive</button>
              <button className="h-[56px] rounded-xl bg-[#14141C] border border-[#2A2A38]/50 text-[#8888AA] font-bold text-[15px] hover:border-[#F0F0F5]/30 hover:text-[#F0F0F5] hover:bg-[#1E1E2A] transition-all shadow-sm">Cabify</button>
              <button className="h-[56px] rounded-xl bg-[#14141C] border border-[#2A2A38]/50 text-[#8888AA] font-bold text-[15px] hover:border-[#F0F0F5]/30 hover:text-[#F0F0F5] hover:bg-[#1E1E2A] transition-all shadow-sm">Taxi normal</button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#8888AA] uppercase tracking-widest pl-1">Tiempo estimado de llegada</label>
            <div className="flex items-center justify-between bg-[#14141C] h-[64px] rounded-2xl px-4 border border-[#2A2A38]/50 shadow-inner">
              <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#1E1E2A] text-[#F0F0F5] hover:bg-[#2A2A38] transition-colors border border-[#2A2A38]/50 shadow-sm">-</button>
              <div className="flex flex-col items-center">
                <span className="text-[20px] font-bold text-[#F0F0F5] tabular-nums tracking-tight">25</span>
                <span className="text-[11px] text-[#8888AA] font-medium tracking-widest uppercase">minutos</span>
              </div>
              <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#1E1E2A] text-[#F0F0F5] hover:bg-[#2A2A38] transition-colors border border-[#2A2A38]/50 shadow-sm">+</button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#8888AA] uppercase tracking-widest pl-1">Destino</label>
            <Input 
              type="text" 
              placeholder="SJL — Mi casa" 
              icon={<MapPin size={20} className="text-[#8888AA]" />}
              className="h-[64px] text-[16px] bg-[#14141C] border-[#2A2A38]/50 focus:bg-[#1E1E2A] focus:border-[#39FF6E]/50 shadow-inner rounded-2xl pl-12"
            />
          </div>
        </div>

        <div className="bg-[#1E1E2A] p-5 rounded-2xl mb-8 border border-[#2A2A38]/50 shadow-[0_8px_24px_rgba(0,0,0,0.3)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#39FF6E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-[#39FF6E] shadow-[0_0_8px_#39FF6E]" />
            <h3 className="text-[14px] font-bold text-[#F0F0F5] uppercase tracking-wide">Esto se compartirá con tu grupo</h3>
          </div>
          <p className="text-[#8888AA] text-[14px] leading-relaxed mb-4 p-3 bg-[#14141C]/80 rounded-xl border border-[#2A2A38]/30">
            "Me voy en <span className="text-[#F0F0F5] font-bold">InDrive</span> (Placa: <span className="text-[#F0F0F5] font-mono font-bold">ABC-123</span>). Llego a <span className="text-[#F0F0F5] font-bold">SJL — Mi casa</span> en <span className="text-[#F0F0F5] font-bold">25 min</span>."
          </p>
          <div className="flex flex-col gap-3">
            <Button variant="primary" className="h-[56px] text-[16px] w-full shadow-[0_4px_24px_rgba(57,255,110,0.2)] hover:shadow-[0_8px_32px_rgba(57,255,110,0.4)] transition-all">
              <Share2 size={20} strokeWidth={2.5} />
              Compartir con mi grupo
            </Button>
            <Link to="/bot" className="block w-full">
              <Button variant="outline" className="h-[56px] text-[16px] w-full border-[#25D366]/50 text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366] transition-all group flex items-center justify-center gap-2">
                <Bot size={20} className="group-hover:scale-110 transition-transform" />
                Activar Bot Vela en WhatsApp
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
