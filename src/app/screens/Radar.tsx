import { TriangleAlert, Settings2, HandMetal } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";

export function Radar() {
  const members = [
    { name: "Ana", status: "OK", state: "safe", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=64&h=64" },
    { name: "Luis", status: "Sin respuesta (15m)", state: "warning", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" },
    { name: "Brissa", status: "OK", state: "safe", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F] overflow-hidden">
      <div className="h-[72px] px-6 flex items-center justify-between z-10 sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-[#2A2A38]/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1E1E2A] px-3 py-1.5 rounded-full border border-[#2A2A38] shadow-inner">
            <div className="w-2 h-2 rounded-full bg-[#39FF6E] shadow-[0_0_8px_#39FF6E80] animate-pulse" />
            <span className="text-[12px] font-bold text-[#F0F0F5] tracking-wide uppercase">Vela Activa</span>
          </div>
          <span className="text-[#8888AA] font-bold text-[14px] bg-[#14141C] px-3 py-1.5 rounded-full border border-[#2A2A38]/50 shadow-inner tracking-wider font-mono">2h 14m</span>
        </div>
        <button className="w-10 h-10 flex items-center justify-center hover:bg-[#1E1E2A] rounded-full border border-transparent hover:border-[#2A2A38] transition-colors shadow-sm">
          <Settings2 size={24} className="text-[#8888AA]" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative w-full overflow-hidden min-h-0">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <div className="w-[80vw] h-[80vw] max-w-[320px] max-h-[320px] rounded-full border-2 border-[#39FF6E]/20 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <div className="absolute w-[60vw] h-[60vw] max-w-[240px] max-h-[240px] rounded-full border border-[#39FF6E]/30 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite_1s]" />
          <div className="absolute w-[40vw] h-[40vw] max-w-[160px] max-h-[160px] rounded-full border border-[#39FF6E]/40" />
          <div className="absolute w-[20vw] h-[20vw] max-w-[80px] max-h-[80px] rounded-full border border-[#39FF6E]/50" />
          
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#39FF6E]/10 to-transparent" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#39FF6E]/10 to-transparent" />
        </div>

        <div className="absolute w-4 h-4 rounded-full bg-[#39FF6E] shadow-[0_0_16px_#39FF6E] z-10" />

        <div className="absolute top-[25%] right-[25%] flex flex-col items-center gap-1 z-10 group">
          <img src={members[0].avatar} className="w-10 h-10 rounded-full border-[3px] border-[#39FF6E] shadow-[0_0_12px_#39FF6E60] transition-transform group-hover:scale-110" />
          <span className="text-[11px] font-bold text-[#F0F0F5] bg-[#14141C]/80 px-2 py-0.5 rounded-full border border-[#2A2A38] backdrop-blur-sm">Ana</span>
        </div>
        
        <div className="absolute bottom-[30%] left-[20%] flex flex-col items-center gap-1 z-10 group">
          <img src={members[1].avatar} className="w-10 h-10 rounded-full border-[3px] border-[#FFD700] shadow-[0_0_12px_#FFD70060] transition-transform group-hover:scale-110 animate-pulse" />
          <span className="text-[11px] font-bold text-[#F0F0F5] bg-[#14141C]/80 px-2 py-0.5 rounded-full border border-[#2A2A38] backdrop-blur-sm">Luis</span>
        </div>
        
        <div className="absolute top-[40%] left-[25%] flex flex-col items-center gap-1 z-10 group">
          <img src={members[2].avatar} className="w-10 h-10 rounded-full border-[3px] border-[#39FF6E] shadow-[0_0_12px_#39FF6E60] transition-transform group-hover:scale-110" />
          <span className="text-[11px] font-bold text-[#F0F0F5] bg-[#14141C]/80 px-2 py-0.5 rounded-full border border-[#2A2A38] backdrop-blur-sm">Brissa</span>
        </div>
      </div>

      <div className="bg-[#14141C] border-t border-[#2A2A38] px-6 pt-5 pb-8 rounded-t-[32px] shrink-0 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] z-20 relative">
        <div className="w-12 h-1.5 bg-[#2A2A38] rounded-full mx-auto mb-6 opacity-50" />
        
        <div className="flex overflow-x-auto no-scrollbar gap-3 mb-6 pb-2 -mx-6 px-6">
          {members.map((member, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-[20px] bg-[#1E1E2A] min-w-[220px] border border-[#2A2A38]/50 shadow-sm hover:border-[#2A2A38] transition-colors shrink-0">
              <div className="relative">
                <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#14141C]" />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1E1E2A] shadow-inner ${member.state === 'safe' ? 'bg-[#39FF6E]' : 'bg-[#FFD700]'}`} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[15px] text-[#F0F0F5]">{member.name}</span>
                <span className={`text-[12px] font-medium tracking-wide ${member.state === 'safe' ? 'text-[#8888AA]' : 'text-[#FFD700]'}`}>{member.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link to="/bathroom" className="block w-full">
            <Button variant="secondary" className="h-[56px] w-full text-[14px] bg-[#1E1E2A] hover:bg-[#2A2A38] shadow-sm flex-col py-0 items-center justify-center gap-1 border border-[#2A2A38]/50">
              <span className="text-xl">🚽</span>
              <span className="text-[12px] font-medium text-[#8888AA]">Voy al baño</span>
            </Button>
          </Link>
          <Link to="/taxi" className="block w-full">
            <Button variant="secondary" className="h-[56px] w-full text-[14px] bg-[#1E1E2A] hover:bg-[#2A2A38] shadow-sm flex-col py-0 items-center justify-center gap-1 border border-[#2A2A38]/50">
              <span className="text-xl">🚕</span>
              <span className="text-[12px] font-medium text-[#8888AA]">Voy a casa</span>
            </Button>
          </Link>
        </div>

        <Link to="/panic" className="block w-full mt-2">
          <Button variant="danger" className="w-full h-[64px] text-[18px] shadow-[0_8px_32px_rgba(255,59,48,0.2)] hover:shadow-[0_12px_48px_rgba(255,59,48,0.4)] transition-all flex items-center justify-center gap-3 active:bg-[#CC2F26]">
            <TriangleAlert size={24} strokeWidth={2.5} />
            Activar Alerta de Pánico
          </Button>
        </Link>
      </div>
    </div>
  );
}
