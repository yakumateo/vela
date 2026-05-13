import { Plus, User, Mail, Lock, Phone } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export function Register() {
  return (
    <div className="flex flex-col min-h-full px-6 pt-10 pb-8 bg-[#0A0A0F] overflow-y-auto no-scrollbar relative scroll-smooth">
      <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#39FF6E]/5 rounded-full blur-[100px] pointer-events-none" />

      <h1 className="text-[32px] font-bold text-white mb-8 tracking-tight sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-xl z-10 py-4 shadow-sm">
        Crea tu cuenta
      </h1>

      <div className="flex flex-col gap-4 mb-10">
        <Input 
          type="text" 
          placeholder="Nombre completo" 
          icon={<User size={20} className="opacity-70" />}
          className="bg-[#1E1E2A]/80 border-[#2A2A38] focus:border-[#39FF6E]/50 shadow-inner h-[60px] pl-12 rounded-xl"
        />
        <Input 
          type="email" 
          placeholder="Correo electrónico" 
          icon={<Mail size={20} className="opacity-70" />}
          className="bg-[#1E1E2A]/80 border-[#2A2A38] focus:border-[#39FF6E]/50 shadow-inner h-[60px] pl-12 rounded-xl"
        />
        <Input 
          type="password" 
          placeholder="Contraseña" 
          icon={<Lock size={20} className="opacity-70" />}
          className="bg-[#1E1E2A]/80 border-[#2A2A38] focus:border-[#39FF6E]/50 shadow-inner h-[60px] pl-12 rounded-xl"
        />
        <Input 
          type="tel" 
          placeholder="Teléfono" 
          icon={<Phone size={20} className="opacity-70" />}
          className="bg-[#1E1E2A]/80 border-[#2A2A38] focus:border-[#39FF6E]/50 shadow-inner h-[60px] pl-12 rounded-xl"
        />
      </div>

      <div className="bg-[#14141C] border border-[#2A2A38]/60 p-5 rounded-[24px] mb-10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-[#39FF6E]/5 rounded-full blur-[60px] pointer-events-none" />
        
        <h2 className="text-[18px] font-bold text-[#F0F0F5] mb-2 flex items-center gap-2">
          Contactos de emergencia
          <span className="text-[#8888AA] text-[12px] font-normal bg-[#1E1E2A] px-2 py-0.5 rounded-full border border-[#2A2A38]">0/3</span>
        </h2>
        
        <p className="text-[13px] text-[#8888AA] mb-5 leading-relaxed bg-[#1E1E2A]/50 p-3 rounded-xl border border-[#2A2A38]/30">
          <span className="text-[#FFD700] mr-1 inline-block shrink-0">⚠️</span>
          Se alertarán automáticamente si no confirmas tu llegada.
        </p>
        
        <Button 
          variant="outline" 
          className="w-full border-dashed border-[#2A2A38] text-[#8888AA] hover:border-[#39FF6E]/50 hover:text-[#39FF6E] hover:bg-[#39FF6E]/5 h-[56px] text-[15px] font-medium transition-all group"
        >
          <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Agregar contacto de emergencia
        </Button>
      </div>

      <div className="mt-auto pt-6 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F] to-transparent sticky bottom-0 z-10 pb-4">
        <Link to="/home" className="block w-full">
          <Button variant="primary" className="w-full text-[18px] h-[64px] shadow-[0_8px_32px_rgba(57,255,110,0.2)] hover:shadow-[0_12px_48px_rgba(57,255,110,0.4)] transition-all">
            Registrarse
          </Button>
        </Link>
      </div>
    </div>
  );
}
