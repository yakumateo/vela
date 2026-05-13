import { Flame } from "lucide-react";
import { Link } from "react-router";

export function Header({ subtitle = "" }: { subtitle?: string }) {
  return (
    <div className="h-[72px] px-6 flex items-center justify-between z-10 sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-[#2A2A38]/50">
      <Link to="/home" className="flex items-center gap-2 group">
        <Flame className="text-[#39FF6E] drop-shadow-[0_0_8px_rgba(57,255,110,0.6)] group-hover:drop-shadow-[0_0_12px_rgba(57,255,110,0.8)] transition-all" size={28} />
        <div className="flex flex-col">
          <span className="font-bold text-[20px] tracking-tight leading-none text-[#F0F0F5]">Vela</span>
          {subtitle && <span className="text-[12px] text-[#8888AA] font-medium mt-0.5">{subtitle}</span>}
        </div>
      </Link>
      <Link to="/profile">
        <div className="w-10 h-10 rounded-full bg-[#1E1E2A] border-2 border-[#2A2A38] hover:border-[#39FF6E] transition-colors flex items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80"
            alt="María"
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
    </div>
  );
}
