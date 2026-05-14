import { useState } from "react";
import { Plus, User, Mail, Lock, Phone, X } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { signUp } from "../../services/auth.service";
import { addEmergencyContact } from "../../services/contacts.service";
import { toast } from "sonner";
import { motion } from "motion/react";

interface TempContact {
  name: string;
  relation: string;
  phone: string;
}

export function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [contacts, setContacts] = useState<TempContact[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState<TempContact>({ name: "", relation: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const addContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error("Nombre y teléfono son obligatorios");
      return;
    }
    setContacts((prev) => [...prev, newContact]);
    setNewContact({ name: "", relation: "", phone: "" });
    setShowAddContact(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error("Nombre, correo y contraseña son obligatorios");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      const { user } = await signUp(email, password, fullName, phone);
      // Add emergency contacts if any
      if (user && contacts.length > 0) {
        await Promise.all(contacts.map((c) => addEmergencyContact(user.id, c)));
      }
      toast.success("¡Cuenta creada! Revisa tu correo para verificar.");
      navigate("/home");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al registrarse";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full px-6 pt-10 pb-8 bg-[#0A0A0F] overflow-y-auto no-scrollbar relative scroll-smooth">
      <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#39FF6E]/5 rounded-full blur-[100px] pointer-events-none" />

      <h1 className="text-[32px] font-bold text-white mb-8 tracking-tight sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-xl z-10 py-4 shadow-sm">
        Crea tu cuenta
      </h1>

      <form onSubmit={handleRegister}>
        <div className="flex flex-col gap-4 mb-10">
          <div className="relative group">
            <Input
              type="text"
              placeholder="Nombre completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              className="bg-[#1E1E2A]/80 border-[#2A2A38] focus:border-[#39FF6E]/50 shadow-inner h-[60px] pl-12 rounded-xl"
            />
            <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8888AA] group-focus-within:text-[#39FF6E] transition-colors pointer-events-none" />
          </div>
          <div className="relative group">
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="bg-[#1E1E2A]/80 border-[#2A2A38] focus:border-[#39FF6E]/50 shadow-inner h-[60px] pl-12 rounded-xl"
            />
            <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8888AA] group-focus-within:text-[#39FF6E] transition-colors pointer-events-none" />
          </div>
          <div className="relative group">
            <Input
              type="password"
              placeholder="Contraseña (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="bg-[#1E1E2A]/80 border-[#2A2A38] focus:border-[#39FF6E]/50 shadow-inner h-[60px] pl-12 rounded-xl"
            />
            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8888AA] group-focus-within:text-[#39FF6E] transition-colors pointer-events-none" />
          </div>
          <div className="relative group">
            <Input
              type="tel"
              placeholder="Teléfono (opcional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              className="bg-[#1E1E2A]/80 border-[#2A2A38] focus:border-[#39FF6E]/50 shadow-inner h-[60px] pl-12 rounded-xl"
            />
            <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8888AA] group-focus-within:text-[#39FF6E] transition-colors pointer-events-none" />
          </div>
        </div>

        <div className="bg-[#14141C] border border-[#2A2A38]/60 p-5 rounded-[24px] mb-10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-[#39FF6E]/5 rounded-full blur-[60px] pointer-events-none" />

          <h2 className="text-[18px] font-bold text-[#F0F0F5] mb-2 flex items-center gap-2">
            Contactos de emergencia
            <span className="text-[#8888AA] text-[12px] font-normal bg-[#1E1E2A] px-2 py-0.5 rounded-full border border-[#2A2A38]">
              {contacts.length}/3
            </span>
          </h2>

          <p className="text-[13px] text-[#8888AA] mb-5 leading-relaxed bg-[#1E1E2A]/50 p-3 rounded-xl border border-[#2A2A38]/30">
            <span className="text-[#FFD700] mr-1 inline-block shrink-0">⚠️</span>
            Se alertarán automáticamente si no confirmas tu llegada.
          </p>

          {contacts.map((c, i) => (
            <div key={i} className="flex items-center justify-between bg-[#1E1E2A]/60 px-4 py-3 rounded-xl mb-2 border border-[#2A2A38]/50">
              <div>
                <span className="font-bold text-[15px] text-[#F0F0F5]">{c.name}</span>
                <span className="text-[#8888AA] text-[13px] font-mono ml-2">{c.phone}</span>
              </div>
              <button type="button" onClick={() => setContacts((prev) => prev.filter((_, idx) => idx !== i))}>
                <X size={18} className="text-[#8888AA] hover:text-[#FF3B30] transition-colors" />
              </button>
            </div>
          ))}

          {showAddContact ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3 mt-4 p-4 bg-[#1E1E2A]/60 rounded-2xl border border-[#2A2A38]"
            >
              <Input
                type="text"
                placeholder="Nombre"
                value={newContact.name}
                onChange={(e) => setNewContact((p) => ({ ...p, name: e.target.value }))}
                className="h-[52px] bg-[#14141C] border-[#2A2A38] focus:border-[#39FF6E]/50 rounded-xl"
              />
              <Input
                type="text"
                placeholder="Relación (Mamá, Amigo...)"
                value={newContact.relation}
                onChange={(e) => setNewContact((p) => ({ ...p, relation: e.target.value }))}
                className="h-[52px] bg-[#14141C] border-[#2A2A38] focus:border-[#39FF6E]/50 rounded-xl"
              />
              <Input
                type="tel"
                placeholder="+51 999 000 000"
                value={newContact.phone}
                onChange={(e) => setNewContact((p) => ({ ...p, phone: e.target.value }))}
                className="h-[52px] bg-[#14141C] border-[#2A2A38] focus:border-[#39FF6E]/50 rounded-xl"
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddContact(false)} className="flex-1 h-[48px] border-[#2A2A38] text-[#8888AA]">
                  Cancelar
                </Button>
                <Button type="button" variant="primary" onClick={addContact} className="flex-1 h-[48px]">
                  Agregar
                </Button>
              </div>
            </motion.div>
          ) : contacts.length < 3 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddContact(true)}
              className="w-full border-dashed border-[#2A2A38] text-[#8888AA] hover:border-[#39FF6E]/50 hover:text-[#39FF6E] hover:bg-[#39FF6E]/5 h-[56px] text-[15px] font-medium transition-all group"
            >
              <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Agregar contacto de emergencia
            </Button>
          ) : null}
        </div>

        <div className="mt-auto pt-6 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F] to-transparent sticky bottom-0 z-10 pb-4">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full text-[18px] h-[64px] shadow-[0_8px_32px_rgba(57,255,110,0.2)] hover:shadow-[0_12px_48px_rgba(57,255,110,0.4)] transition-all disabled:opacity-60"
          >
            {loading ? "Creando cuenta..." : "Registrarse"}
          </Button>
          <p className="text-center text-[13px] text-[#8888AA] mt-4">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-[#39FF6E] font-bold hover:underline">
              Ingresar
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
