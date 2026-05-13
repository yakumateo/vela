import { Edit2, Plus, Phone, Bot, History, ChevronRight } from "lucide-react";
import { Header } from "../components/Header";
import { Button } from "../components/ui/Button";

export function Profile() {
  const contacts = [
    { name: "Mamá", relation: "Madre", phone: "+51 987 654 321" },
    { name: "Ana", relation: "Amiga", phone: "+51 912 345 678" },
    { name: "Carlos", relation: "Hermano", phone: "+51 999 888 777" },
  ];

  const history = [
    { date: "10 May", venue: "Manifesto", duration: "4h 12m" },
    { date: "03 May", venue: "Bazar", duration: "3h 45m" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F]">
      <Header subtitle="Mi Perfil" />
      
      <div className="px-6 py-6 flex-1 overflow-y-auto no-scrollbar pb-10 relative">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#39FF6E]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col items-center mb-8 relative group">
          <div className="w-24 h-24 rounded-full bg-[#1E1E2A] border-[3px] border-[#2A2A38] shadow-[0_8px_24px_rgba(0,0,0,0.4)] overflow-hidden mb-4 group-hover:border-[#39FF6E]/50 transition-colors">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128" alt="María" className="w-full h-full object-cover" />
          </div>
          <button className="absolute bottom-[44px] right-[50%] translate-x-[40px] w-8 h-8 rounded-full bg-[#39FF6E] text-black flex items-center justify-center border-2 border-[#0A0A0F] shadow-sm hover:scale-110 transition-transform">
            <Edit2 size={14} strokeWidth={3} />
          </button>
          <h2 className="text-[24px] font-bold text-[#F0F0F5] tracking-tight">María Herrera</h2>
          <p className="text-[#8888AA] text-[14px] font-mono mt-1">+51 912 345 678</p>
        </div>

        <div className="mb-8">
          <h3 className="text-[14px] font-bold text-[#8888AA] uppercase tracking-widest mb-4 pl-1 flex items-center gap-2">
            <Phone size={16} /> Contactos de emergencia
          </h3>
          <div className="bg-[#14141C] border border-[#2A2A38]/50 rounded-[24px] p-2 flex flex-col gap-2 shadow-sm">
            {contacts.map((contact, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1E1E2A] transition-colors group cursor-pointer">
                <div className="flex flex-col">
                  <span className="font-bold text-[16px] text-[#F0F0F5] flex items-center gap-2">
                    {contact.name} <span className="bg-[#1E1E2A] text-[#8888AA] text-[10px] uppercase px-2 py-0.5 rounded-full border border-[#2A2A38]/50 group-hover:border-[#2A2A38] transition-colors">{contact.relation}</span>
                  </span>
                  <span className="text-[13px] text-[#8888AA] font-mono mt-0.5">{contact.phone}</span>
                </div>
                <button className="text-[#8888AA] hover:text-[#F0F0F5] text-[13px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full hover:bg-[#2A2A38] transition-colors">
                  Editar
                </button>
              </div>
            ))}
            <div className="px-2 pb-2 pt-1">
              <Button variant="outline" className="w-full border-dashed border-[#2A2A38] text-[#8888AA] hover:border-[#39FF6E]/50 hover:text-[#39FF6E] hover:bg-[#39FF6E]/5 h-[48px] text-[14px] transition-all group">
                <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Agregar contacto
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-[14px] font-bold text-[#8888AA] uppercase tracking-widest mb-4 pl-1 flex items-center gap-2">
            <History size={16} /> Historial de salidas
          </h3>
          <div className="bg-[#14141C] border border-[#2A2A38]/50 rounded-[24px] p-2 flex flex-col gap-2 shadow-sm">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-[#1E1E2A] transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#1E1E2A] rounded-xl flex flex-col items-center justify-center border border-[#2A2A38]/50 shadow-inner group-hover:border-[#39FF6E]/30 transition-colors">
                    <span className="text-[16px] font-bold text-[#F0F0F5] leading-none">{h.date.split(' ')[0]}</span>
                    <span className="text-[10px] text-[#8888AA] uppercase tracking-wider mt-0.5">{h.date.split(' ')[1]}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[16px] text-[#F0F0F5] group-hover:text-[#39FF6E] transition-colors">{h.venue}</span>
                    <span className="text-[13px] text-[#8888AA] font-mono mt-0.5">{h.duration}</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[#2A2A38] group-hover:text-[#F0F0F5] transition-colors" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[14px] font-bold text-[#8888AA] uppercase tracking-widest mb-4 pl-1 flex items-center gap-2">
            <Bot size={16} /> Bot Vela
          </h3>
          <div className="bg-[#14141C] border border-[#2A2A38]/50 rounded-[24px] p-5 flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="font-bold text-[16px] text-[#F0F0F5] mb-1">Activar monitoreo de retorno</span>
              <span className="text-[13px] text-[#39FF6E] font-bold flex items-center gap-1">
                WhatsApp conectado ✓
              </span>
            </div>
            <button className="relative w-14 h-8 bg-[#39FF6E]/20 rounded-full border border-[#39FF6E]/50 shadow-[0_0_12px_rgba(57,255,110,0.15)] transition-colors">
              <div className="absolute top-1/2 -translate-y-1/2 right-[4px] w-6 h-6 bg-[#39FF6E] rounded-full shadow-md" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
