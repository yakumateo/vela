import { useState } from "react";
import { ArrowLeft, Car, MapPin, Share2, Bot } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { useSession } from "../context/SessionContext";
import { registerTaxi } from "../../services/safety.service";
import type { TaxiRegistration } from "../../lib/database.types";
import { toast } from "sonner";

type TaxiApp = TaxiRegistration["app"];
const APPS: TaxiApp[] = ["Uber", "InDrive", "Cabify", "Taxi normal"];

export function TaxiRegistration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { session } = useSession();

  const [plate, setPlate] = useState("");
  const [selectedApp, setSelectedApp] = useState<TaxiApp | null>(null);
  const [eta, setEta] = useState(25);
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState<TaxiRegistration | null>(null);

  const sessionId = searchParams.get("sid") || session?.id || "";

  const handleShare = async () => {
    if (!user || !sessionId) { toast.error("Sin sesión activa"); return; }
    if (!plate || !selectedApp || !destination) {
      toast.error("Completa todos los campos antes de compartir");
      return;
    }
    setLoading(true);
    try {
      const reg = await registerTaxi({
        sessionId,
        userId: user.id,
        plate,
        app: selectedApp,
        destination,
        etaMinutes: eta,
      });
      setRegistered(reg);
      toast.success("Datos compartidos con tu grupo ✓");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al registrar taxi");
    } finally {
      setLoading(false);
    }
  };

  const previewText = `"Me voy en ${selectedApp || "___"} (Placa: ${plate || "___"}). Llego a ${destination || "___"} en ${eta} min."`;

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F] overflow-y-auto no-scrollbar relative">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#39FF6E]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="h-[72px] px-6 flex items-center justify-between z-10 sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-md shrink-0 border-b border-[#2A2A38]/50">
        <button
          onClick={() => navigate(`/radar?sid=${sessionId}`)}
          className="w-10 h-10 flex items-center justify-center bg-[#1E1E2A] hover:bg-[#2A2A38] rounded-full border border-[#2A2A38] transition-colors shadow-sm"
        >
          <ArrowLeft size={20} className="text-[#F0F0F5]" />
        </button>
        <span className="text-[14px] font-bold text-[#F0F0F5] tracking-wide uppercase">Salida Segura</span>
        <div className="w-10 h-10" />
      </div>

      <div className="px-6 py-8 flex-1 flex flex-col z-10">
        <div className="mb-8">
          <h1 className="text-[32px] font-black text-[#F0F0F5] mb-2 tracking-tight uppercase flex items-center gap-3">
            Registro de Salida <span className="text-4xl drop-shadow-md">🚕</span>
          </h1>
          <p className="text-[#8888AA] text-[16px] font-medium tracking-wide">Comparte los datos de tu taxi antes de irte</p>
        </div>

        <div className="flex flex-col gap-5 mb-10">
          {/* Plate */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#8888AA] uppercase tracking-widest pl-1">Placa del vehículo</label>
            <div className="relative group">
              <Input
                type="text"
                placeholder="ABC-123"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                maxLength={8}
                className="h-[64px] text-[20px] font-mono tracking-widest uppercase bg-[#14141C] border-[#2A2A38]/50 focus:bg-[#1E1E2A] focus:border-[#39FF6E]/50 shadow-inner rounded-2xl pl-14"
              />
              <Car size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8888AA] group-focus-within:text-[#39FF6E] transition-colors pointer-events-none" />
            </div>
          </div>

          {/* App selector */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#8888AA] uppercase tracking-widest pl-1">Aplicativo usado</label>
            <div className="grid grid-cols-2 gap-3">
              {APPS.map((app) => (
                <button
                  key={app}
                  onClick={() => setSelectedApp(app)}
                  className={`h-[56px] rounded-xl font-bold text-[15px] border transition-all shadow-sm ${
                    selectedApp === app
                      ? "bg-[#39FF6E]/10 border-[#39FF6E]/30 text-[#39FF6E] shadow-[0_0_16px_rgba(57,255,110,0.15)]"
                      : "bg-[#14141C] border-[#2A2A38]/50 text-[#8888AA] hover:border-[#F0F0F5]/30 hover:text-[#F0F0F5] hover:bg-[#1E1E2A]"
                  }`}
                >
                  {app}
                </button>
              ))}
            </div>
          </div>

          {/* ETA */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#8888AA] uppercase tracking-widest pl-1">Tiempo estimado de llegada</label>
            <div className="flex items-center justify-between bg-[#14141C] h-[64px] rounded-2xl px-4 border border-[#2A2A38]/50 shadow-inner">
              <button
                onClick={() => setEta((e) => Math.max(5, e - 5))}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#1E1E2A] text-[#F0F0F5] hover:bg-[#2A2A38] transition-colors border border-[#2A2A38]/50 shadow-sm text-2xl font-bold"
              >
                -
              </button>
              <div className="flex flex-col items-center">
                <span className="text-[20px] font-bold text-[#F0F0F5] tabular-nums tracking-tight">{eta}</span>
                <span className="text-[11px] text-[#8888AA] font-medium tracking-widest uppercase">minutos</span>
              </div>
              <button
                onClick={() => setEta((e) => Math.min(120, e + 5))}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#1E1E2A] text-[#F0F0F5] hover:bg-[#2A2A38] transition-colors border border-[#2A2A38]/50 shadow-sm text-2xl font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Destination */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#8888AA] uppercase tracking-widest pl-1">Destino</label>
            <div className="relative group">
              <Input
                type="text"
                placeholder="SJL — Mi casa"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="h-[64px] text-[16px] bg-[#14141C] border-[#2A2A38]/50 focus:bg-[#1E1E2A] focus:border-[#39FF6E]/50 shadow-inner rounded-2xl pl-12"
              />
              <MapPin size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8888AA] group-focus-within:text-[#39FF6E] transition-colors pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-[#1E1E2A] p-5 rounded-2xl mb-8 border border-[#2A2A38]/50 shadow-[0_8px_24px_rgba(0,0,0,0.3)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#39FF6E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-[#39FF6E] shadow-[0_0_8px_#39FF6E]" />
            <h3 className="text-[14px] font-bold text-[#F0F0F5] uppercase tracking-wide">Esto se compartirá con tu grupo</h3>
          </div>
          <p className="text-[#8888AA] text-[14px] leading-relaxed mb-4 p-3 bg-[#14141C]/80 rounded-xl border border-[#2A2A38]/30">
            {previewText}
          </p>

          {registered ? (
            <div className="flex items-center gap-2 text-[#39FF6E] font-bold text-[15px] justify-center py-3">
              ✓ Compartido con tu grupo
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                onClick={handleShare}
                disabled={loading}
                className="h-[56px] text-[16px] w-full shadow-[0_4px_24px_rgba(57,255,110,0.2)] hover:shadow-[0_8px_32px_rgba(57,255,110,0.4)] transition-all disabled:opacity-60"
              >
                <Share2 size={20} strokeWidth={2.5} />
                {loading ? "Compartiendo..." : "Compartir con mi grupo"}
              </Button>
              <Link to="/bot" className="block w-full">
                <Button
                  variant="outline"
                  className="h-[56px] text-[16px] w-full border-[#25D366]/50 text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366] transition-all group flex items-center justify-center gap-2"
                >
                  <Bot size={20} className="group-hover:scale-110 transition-transform" />
                  Activar Bot Vela en WhatsApp
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
