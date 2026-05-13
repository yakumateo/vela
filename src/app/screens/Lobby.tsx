import { QrCode, Shield, CheckCircle2, MoreVertical, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export function Lobby() {
  const members = [
    { name: "María", status: "Listo", ready: true, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" },
    { name: "Ana", status: "Listo", ready: true, avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=64&h=64" },
    { name: "Luis", status: "esperando...", ready: false, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" },
    { name: "Brissa", status: "Listo", ready: true, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F]">
      
      <div className="h-[72px] px-6 flex items-center justify-between z-10 sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-[#2A2A38]/50 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/home" className="w-10 h-10 flex items-center justify-center bg-[#1E1E2A] hover:bg-[#2A2A38] rounded-full border border-[#2A2A38] transition-colors">
            <ArrowLeft size={20} className="text-[#F0F0F5]" />
          </Link>
          <div className="flex items-center gap-2 bg-[#1E1E2A] px-3 py-1.5 rounded-full border border-[#2A2A38] shadow-inner">
            <div className="w-2 h-2 rounded-full bg-[#39FF6E] shadow-[0_0_8px_#39FF6E80] animate-pulse" />
            <span className="text-[12px] font-bold text-[#F0F0F5] tracking-wide uppercase">Sesión activa</span>
          </div>
        </div>
        <button className="w-10 h-10 flex items-center justify-center hover:bg-[#1E1E2A] rounded-full transition-colors">
          <MoreVertical size={24} className="text-[#8888AA]" />
        </button>
      </div>

      <div className="px-6 py-6 flex-1 overflow-y-auto no-scrollbar pb-24 relative">
        <div className="absolute top-[20%] right-0 w-[200px] h-[200px] bg-[#39FF6E]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="mb-6">
          <Input 
            type="text" 
            defaultValue="Salida — Sábado 10 May" 
            className="text-[20px] font-bold h-[56px] bg-transparent border-b border-[#2A2A38] rounded-none px-0 focus:border-[#39FF6E] shadow-none"
          />
        </div>

        <div className="mb-8">
          <Input 
            type="text" 
            placeholder="¿A dónde van esta noche?" 
            className="h-[60px] text-[16px] bg-[#1E1E2A]/80 shadow-inner rounded-xl border-[#2A2A38] focus:border-[#39FF6E]/50"
          />
        </div>

        <div className="bg-[#14141C] p-6 rounded-[24px] flex flex-col items-center mb-8 border border-[#2A2A38]/60 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="w-[180px] h-[180px] bg-white rounded-2xl p-3 flex items-center justify-center mb-4 shadow-[0_4px_24px_rgba(255,255,255,0.1)]">
            <QrCode size={156} className="text-black" />
          </div>
          <p className="text-[#8888AA] text-[14px] mb-5 font-medium tracking-wide">Escanea para unirte al grupo</p>
          <Button variant="outline" className="w-full border-dashed border-[#2A2A38] text-[#F0F0F5] hover:border-[#F0F0F5]/50 hover:bg-[#F0F0F5]/5 h-[56px] transition-all">
            Compartir enlace
          </Button>
        </div>

        <div className="mb-6">
          <h3 className="text-[16px] font-bold text-[#F0F0F5] mb-4 flex items-center gap-2 tracking-tight">
            Miembros del grupo
            <span className="bg-[#1E1E2A] text-[#8888AA] text-[12px] px-2 py-0.5 rounded-full border border-[#2A2A38]">4/6</span>
          </h3>
          <div className="flex flex-col gap-3">
            {members.map((member, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-[#1E1E2A] border border-[#2A2A38]/50 shadow-sm hover:border-[#2A2A38] transition-colors">
                <div className="flex items-center gap-4">
                  <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#14141C]" />
                  <span className="font-bold text-[16px] text-[#F0F0F5]">{member.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {member.ready ? (
                    <div className="flex items-center gap-1.5 text-[#39FF6E] bg-[#39FF6E]/10 px-3 py-1.5 rounded-full border border-[#39FF6E]/20">
                      <CheckCircle2 size={16} className="drop-shadow-[0_0_8px_rgba(57,255,110,0.4)]" />
                      <span className="text-[13px] font-bold uppercase tracking-wide">Listo</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[#8888AA] bg-[#14141C] px-3 py-1.5 rounded-full border border-[#2A2A38]">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-[13px] font-medium tracking-wide">{member.status}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/90 to-transparent pt-12">
        <Link to="/radar" className="block w-full">
          <Button variant="primary" className="h-[64px] text-[18px] w-full shadow-[0_8px_32px_rgba(57,255,110,0.2)] hover:shadow-[0_12px_48px_rgba(57,255,110,0.4)] transition-all">
            <Shield size={24} strokeWidth={2.5} />
            Activar Radar
          </Button>
        </Link>
      </div>
    </div>
  );
}
