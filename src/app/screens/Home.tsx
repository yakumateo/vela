import { Users, QrCode, Plus } from "lucide-react";
import { Link } from "react-router";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";

export function Home() {
  return (
    <div className="flex flex-col h-full bg-[#0A0A0F]">
      <Header />
      
      <div className="px-6 py-8 flex-1 flex flex-col overflow-y-auto no-scrollbar relative">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#39FF6E]/5 rounded-full blur-[120px] pointer-events-none" />

        <h1 className="text-[28px] font-bold text-[#F0F0F5] mb-8 leading-tight tracking-tight drop-shadow-sm">
          Buenas noches, María <span className="text-[24px]">🌙</span>
        </h1>

        <div className="bg-[#1E1E2A] rounded-[24px] p-6 mb-6 shadow-[0_12px_48px_rgba(0,0,0,0.5)] border border-[#2A2A38] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#39FF6E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="w-14 h-14 bg-[#14141C] rounded-2xl flex items-center justify-center mb-5 shadow-inner border border-[#2A2A38]/50">
            <Users size={28} className="text-[#39FF6E] drop-shadow-[0_0_8px_rgba(57,255,110,0.5)]" />
          </div>
          
          <h2 className="text-[22px] font-bold text-[#F0F0F5] mb-2 tracking-tight">
            Iniciar una Salida
          </h2>
          <p className="text-[#8888AA] text-[15px] mb-8 leading-relaxed max-w-[85%]">
            Crea un grupo para esta noche y cuídense entre todos
          </p>
          
          <Link to="/lobby">
            <Button variant="primary" className="h-[64px] text-[18px] w-full shadow-[0_8px_32px_rgba(57,255,110,0.2)] hover:shadow-[0_12px_48px_rgba(57,255,110,0.4)] transition-all">
              <Plus size={24} strokeWidth={2.5} />
              Nueva Salida
            </Button>
          </Link>
        </div>

        <div className="bg-[#14141C] rounded-[24px] p-6 border border-[#2A2A38]/60 shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all hover:bg-[#1E1E2A]/50 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#1E1E2A] rounded-xl flex items-center justify-center border border-[#2A2A38]/50">
              <QrCode size={24} className="text-[#8888AA] group-hover:text-[#F0F0F5] transition-colors" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-[#F0F0F5] tracking-tight">Unirme a una Salida</h3>
              <p className="text-[14px] text-[#8888AA]">Escanea o ingresa código</p>
            </div>
          </div>
          <Button variant="outline" className="h-[56px] border-[#2A2A38] text-[#8888AA] hover:text-[#F0F0F5] hover:border-[#F0F0F5]/30 hover:bg-[#F0F0F5]/5 transition-all w-full">
            Tengo un código
          </Button>
        </div>
      </div>
    </div>
  );
}
