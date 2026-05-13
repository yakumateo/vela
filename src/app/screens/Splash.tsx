import { Flame } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";

export function Splash() {
  return (
    <div className="flex-1 flex flex-col items-center justify-between p-8 min-h-full">
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 bg-[#39FF6E]/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative animate-pulse drop-shadow-[0_0_24px_rgba(57,255,110,0.8)] mb-8">
          <Flame size={96} className="text-[#39FF6E]" strokeWidth={1.5} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full border border-[#39FF6E]/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
        </div>
        
        <h1 className="text-[56px] font-bold text-white mb-2 tracking-tighter drop-shadow-md">
          Vela
        </h1>
        <p className="text-[20px] text-[#8888AA] font-medium tracking-wide">
          Tu grupo, tu escudo.
        </p>
      </div>

      <div className="w-full flex flex-col gap-4 mb-10 mt-auto shrink-0">
        <Link to="/register" className="block w-full">
          <Button variant="primary" className="w-full py-5 text-lg shadow-[0_4px_32px_rgba(57,255,110,0.3)] hover:shadow-[0_4px_48px_rgba(57,255,110,0.5)] active:scale-95 transition-all">Crear cuenta</Button>
        </Link>
        <Link to="/login" className="block w-full">
          <Button variant="outline" className="w-full py-5 text-lg border-[#F0F0F5]/30 hover:bg-[#F0F0F5]/5 hover:border-[#F0F0F5]/50 active:scale-95 transition-all">Ya tengo cuenta</Button>
        </Link>
      </div>
    </div>
  );
}
