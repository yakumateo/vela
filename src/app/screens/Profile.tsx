import { useState, useEffect } from "react";
import { Edit2, Plus, Phone, Bot, History, ChevronRight, LogOut, Loader2 } from "lucide-react";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { signOut } from "../../services/auth.service";
import {
  getEmergencyContacts,
  addEmergencyContact,
  deleteEmergencyContact,
} from "../../services/contacts.service";
import { getSessionHistory } from "../../services/session.service";
import type { EmergencyContact } from "../../lib/database.types";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Input } from "../components/ui/input";

const AVATAR_PLACEHOLDER = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E1E2A&color=39FF6E&bold=true&size=128`;

function formatDuration(minutes: number | null): string {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function Profile() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [history, setHistory] = useState<Array<{ id: string; name: string; venue: string | null; duration_minutes: number | null; ended_at: string | null }>>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", relation: "", phone: "" });
  const [savingContact, setSavingContact] = useState(false);

  useEffect(() => {
    if (!user) return;

    getEmergencyContacts(user.id)
      .then(setContacts)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoadingContacts(false));

    getSessionHistory(user.id)
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoadingHistory(false));
  }, [user?.id]);

  const handleAddContact = async () => {
    if (!user || !newContact.name || !newContact.phone) {
      toast.error("Nombre y teléfono son obligatorios");
      return;
    }
    setSavingContact(true);
    try {
      const c = await addEmergencyContact(user.id, newContact);
      setContacts((prev) => [...prev, c]);
      setNewContact({ name: "", relation: "", phone: "" });
      setShowAddContact(false);
      toast.success("Contacto agregado");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setSavingContact(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    await deleteEmergencyContact(id).catch((e) => toast.error(e.message));
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleLogout = async () => {
    await signOut().catch(console.error);
    navigate("/");
  };

  const avatarUrl = profile?.avatar_url || AVATAR_PLACEHOLDER(profile?.full_name || "U");

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F]">
      <Header subtitle="Mi Perfil" />

      <div className="px-6 py-6 flex-1 overflow-y-auto no-scrollbar pb-10 relative">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#39FF6E]/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Avatar + name */}
        <div className="flex flex-col items-center mb-8 relative group">
          <div className="w-24 h-24 rounded-full bg-[#1E1E2A] border-[3px] border-[#2A2A38] shadow-[0_8px_24px_rgba(0,0,0,0.4)] overflow-hidden mb-4 group-hover:border-[#39FF6E]/50 transition-colors">
            <img
              src={avatarUrl}
              alt={profile?.full_name || ""}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = AVATAR_PLACEHOLDER(profile?.full_name || "U"); }}
            />
          </div>
          <h2 className="text-[24px] font-bold text-[#F0F0F5] tracking-tight">{profile?.full_name || user?.email}</h2>
          {profile?.phone && (
            <p className="text-[#8888AA] text-[14px] font-mono mt-1">{profile.phone}</p>
          )}
          <p className="text-[#8888AA] text-[13px] mt-0.5">{user?.email}</p>
        </div>

        {/* Emergency contacts */}
        <div className="mb-8">
          <h3 className="text-[14px] font-bold text-[#8888AA] uppercase tracking-widest mb-4 pl-1 flex items-center gap-2">
            <Phone size={16} /> Contactos de emergencia
          </h3>
          <div className="bg-[#14141C] border border-[#2A2A38]/50 rounded-[24px] p-2 flex flex-col gap-2 shadow-sm">
            {loadingContacts ? (
              <div className="flex justify-center py-6"><Loader2 size={24} className="animate-spin text-[#8888AA]" /></div>
            ) : contacts.length === 0 ? (
              <p className="text-[#8888AA] text-center text-[14px] py-4">Sin contactos aún</p>
            ) : (
              contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1E1E2A] transition-colors group cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-bold text-[16px] text-[#F0F0F5] flex items-center gap-2">
                      {contact.name}
                      <span className="bg-[#1E1E2A] text-[#8888AA] text-[10px] uppercase px-2 py-0.5 rounded-full border border-[#2A2A38]/50">
                        {contact.relation}
                      </span>
                    </span>
                    <span className="text-[13px] text-[#8888AA] font-mono mt-0.5">{contact.phone}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="text-[#8888AA] hover:text-[#FF3B30] text-[13px] font-bold px-3 py-1.5 rounded-full hover:bg-[#FF3B30]/10 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              ))
            )}

            {showAddContact ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3 mt-2 p-4 bg-[#1E1E2A]/60 rounded-2xl border border-[#2A2A38]"
              >
                <Input
                  type="text" placeholder="Nombre"
                  value={newContact.name}
                  onChange={(e) => setNewContact((p) => ({ ...p, name: e.target.value }))}
                  className="h-[52px] bg-[#14141C] border-[#2A2A38] focus:border-[#39FF6E]/50 rounded-xl"
                />
                <Input
                  type="text" placeholder="Relación"
                  value={newContact.relation}
                  onChange={(e) => setNewContact((p) => ({ ...p, relation: e.target.value }))}
                  className="h-[52px] bg-[#14141C] border-[#2A2A38] focus:border-[#39FF6E]/50 rounded-xl"
                />
                <Input
                  type="tel" placeholder="+51 999 000 000"
                  value={newContact.phone}
                  onChange={(e) => setNewContact((p) => ({ ...p, phone: e.target.value }))}
                  className="h-[52px] bg-[#14141C] border-[#2A2A38] focus:border-[#39FF6E]/50 rounded-xl"
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddContact(false)} className="flex-1 h-[48px] border-[#2A2A38] text-[#8888AA]">
                    Cancelar
                  </Button>
                  <Button type="button" variant="primary" onClick={handleAddContact} disabled={savingContact} className="flex-1 h-[48px]">
                    {savingContact ? <Loader2 size={18} className="animate-spin" /> : "Guardar"}
                  </Button>
                </div>
              </motion.div>
            ) : contacts.length < 5 ? (
              <div className="px-2 pb-2 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setShowAddContact(true)}
                  className="w-full border-dashed border-[#2A2A38] text-[#8888AA] hover:border-[#39FF6E]/50 hover:text-[#39FF6E] hover:bg-[#39FF6E]/5 h-[48px] text-[14px] transition-all group"
                >
                  <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Agregar contacto
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Session history */}
        <div className="mb-8">
          <h3 className="text-[14px] font-bold text-[#8888AA] uppercase tracking-widest mb-4 pl-1 flex items-center gap-2">
            <History size={16} /> Historial de salidas
          </h3>
          <div className="bg-[#14141C] border border-[#2A2A38]/50 rounded-[24px] p-2 flex flex-col gap-2 shadow-sm">
            {loadingHistory ? (
              <div className="flex justify-center py-6"><Loader2 size={24} className="animate-spin text-[#8888AA]" /></div>
            ) : history.length === 0 ? (
              <p className="text-[#8888AA] text-center text-[14px] py-4">Sin historial aún</p>
            ) : (
              history.map((h) => {
                const date = h.ended_at ? new Date(h.ended_at) : null;
                const day = date?.getDate().toString() || "—";
                const month = date?.toLocaleString("es-PE", { month: "short" }) || "";
                return (
                  <div key={h.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-[#1E1E2A] transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#1E1E2A] rounded-xl flex flex-col items-center justify-center border border-[#2A2A38]/50 shadow-inner group-hover:border-[#39FF6E]/30 transition-colors">
                        <span className="text-[16px] font-bold text-[#F0F0F5] leading-none">{day}</span>
                        <span className="text-[10px] text-[#8888AA] uppercase tracking-wider mt-0.5">{month}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[16px] text-[#F0F0F5] group-hover:text-[#39FF6E] transition-colors">
                          {h.venue || h.name}
                        </span>
                        <span className="text-[13px] text-[#8888AA] font-mono mt-0.5">{formatDuration(h.duration_minutes)}</span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-[#2A2A38] group-hover:text-[#F0F0F5] transition-colors" />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bot section */}
        <div className="mb-8">
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

        {/* Logout */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full border-[#FF3B30]/30 text-[#FF3B30] hover:bg-[#FF3B30]/10 hover:border-[#FF3B30]/50 transition-all h-[56px] font-semibold"
        >
          <LogOut size={20} />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
