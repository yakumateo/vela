import { Flame, ArrowRight, Mail, Lock } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";

export function Login() {
  return (
    <div className="flex flex-col h-full px-6 pt-16 pb-8 bg-gradient-to-b from-[#0A0A0F] to-[#0A0A0F] via-[#14141C]/30 relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#39FF6E]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex items-center justify-center gap-3 mb-10">
        <div className="relative p-3 rounded-2xl bg-[#1E1E2A] border border-[#2A2A38] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <Flame size={32} className="text-[#39FF6E] drop-shadow-[0_0_12px_rgba(57,255,110,0.6)]" />
        </div>
      </div>

      <div className="mb-10 text-center">
        <h1 className="text-[32px] font-bold text-[#F0F0F5] mb-2 tracking-tight">Bienvenida de nuevo</h1>
        <p className="text-[#8888AA] text-[16px]">Ingresa para protegerte con Vela</p>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <Input 
          type="email" 
          placeholder="Correo electrónico" 
          icon={<Mail size={20} className="opacity-70" />}
          className="bg-[#1E1E2A]/80 border-[#2A2A38] focus:border-[#39FF6E]/50 focus:bg-[#1E1E2A] shadow-inner text-[16px] h-[60px] rounded-xl pl-12"
        />
        <Input 
          type="password" 
          placeholder="Contraseña" 
          icon={<Lock size={20} className="opacity-70" />}
          className="bg-[#1E1E2A]/80 border-[#2A2A38] focus:border-[#39FF6E]/50 focus:bg-[#1E1E2A] shadow-inner text-[16px] h-[60px] rounded-xl pl-12"
        />
      </div>

      <Link to="/home" className="block w-full mb-8 group">
        <Button 
          variant="primary" 
          className="w-full text-[18px] h-[60px] flex items-center justify-center gap-2 group-hover:shadow-[0_8px_32px_rgba(57,255,110,0.4)] transition-all"
        >
          Ingresar
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>

      <div className="flex flex-col items-center gap-6 mt-auto">
        <button className="text-[#8888AA] text-[14px] font-medium hover:text-[#F0F0F5] transition-colors underline decoration-[#8888AA]/30 underline-offset-4">
          ¿Olvidaste tu contraseña?
        </button>
        
        <div className="h-px w-[120px] bg-gradient-to-r from-transparent via-[#2A2A38] to-transparent my-2" />

        <Link to="/register" className="text-[#8888AA] text-[15px] hover:text-[#F0F0F5] transition-colors">
          ¿No tienes cuenta? <span className="text-[#39FF6E] font-bold">Regístrate</span>
        </Link>
      </div>
    </div>
  );
}
