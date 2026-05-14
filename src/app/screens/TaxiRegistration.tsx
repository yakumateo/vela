import { useState, useEffect } from "react";
import { ArrowLeft, Car, MapPin, Share2, Bot, Navigation, Loader2, Home as HomeIcon } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { useSession } from "../context/SessionContext";
import { registerTaxi } from "../../services/safety.service";
import { getSavedDestinations, type SavedDestination } from "../../services/destinations.service";
import type { TaxiRegistration } from "../../lib/database.types";
import { toast } from "sonner";
import { updateMemberStatus } from "../../services/session.service";
import { motion } from "motion/react";
import { AddressAutocomplete } from "../components/AddressAutocomplete";

type TaxiApp = TaxiRegistration["app"];
const APPS: TaxiApp[] = ["Uber", "InDrive", "Cabify", "Taxi normal"];

export function TaxiRegistration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const { session } = useSession();

  const [plate, setPlate] = useState("");
  const [selectedApp, setSelectedApp] = useState<TaxiApp | null>(null);
  const [eta, setEta] = useState(25);
  
  const [destinations, setDestinations] = useState<SavedDestination[]>([]);
  const [destination, setDestination] = useState("");
  const [destinationLat, setDestinationLat] = useState<number | null>(null);
  const [destinationLng, setDestinationLng] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [registered, setRegistered] = useState<TaxiRegistration | null>(null);
  
  const [arrived, setArrived] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // in seconds

  const sessionId = searchParams.get("sid") || session?.id || "";

  useEffect(() => {
    if (!user) return;
    getSavedDestinations(user.id).then(setDestinations).catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!registered || arrived) return;
    
    // Set initial time left based on registered eta
    setTimeLeft(registered.eta_minutes * 60);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [registered, arrived]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalización");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          if (data && data.display_name) {
            // Simplify the address a bit
            const parts = data.display_name.split(",").slice(0, 3).join(",");
            setDestination(parts.trim());
            setDestinationLat(lat);
            setDestinationLng(lng);
            toast.success("Ubicación encontrada");
          } else {
            toast.error("No se pudo obtener la dirección");
          }
        } catch (e) {
          toast.error("Error al conectar con el servidor de mapas");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        toast.error("No se pudo obtener la ubicación");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
        destinationLat: destinationLat || undefined,
        destinationLng: destinationLng || undefined,
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

  const handleArrived = async () => {
    if (!user || !sessionId) return;
    setLoading(true);
    try {
      await updateMemberStatus(sessionId, user.id, "active");
      setArrived(true);
      toast.success("¡Notificaste tu llegada a casa!");
    } catch (e) {
      toast.error("Error al actualizar estado");
    } finally {
      setLoading(false);
    }
  };

  const previewText = `"Me voy en ${selectedApp || "___"} (Placa: ${plate || "___"}). Llego a ${destination || "___"} en ${eta} min."`;

  if (arrived) {
    return (
      <div className="flex flex-col h-full bg-[#0A0A0F] relative overflow-hidden items-center justify-center p-6 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#39FF6E]/10 rounded-full blur-[100px] pointer-events-none" />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center z-10">
          <div className="w-24 h-24 bg-[#39FF6E]/10 rounded-full flex items-center justify-center mb-6 border border-[#39FF6E]/30 shadow-[0_0_24px_rgba(57,255,110,0.2)]">
            <HomeIcon size={48} className="text-[#39FF6E]" />
          </div>
          <h1 className="text-[32px] font-black text-[#F0F0F5] mb-2 tracking-tight">¡Llegaste segura!</h1>
          <p className="text-[#8888AA] text-[16px] font-medium tracking-wide mb-8">Tu grupo fue notificado.</p>
          <div className="bg-[#14141C] border border-[#39FF6E]/30 rounded-2xl p-4 flex items-center gap-3 shadow-[0_0_24px_rgba(57,255,110,0.1)] mb-8">
            <div className="w-2 h-2 rounded-full bg-[#39FF6E] shadow-[0_0_8px_#39FF6E]" />
            <span className="text-[15px] font-bold text-[#F0F0F5]">✅ {profile?.full_name?.split(" ")[0] || "Usuario"} confirmó llegada</span>
          </div>
          <Button onClick={() => navigate(`/radar?sid=${sessionId}`)} variant="outline" className="border-[#2A2A38] text-[#8888AA] px-8">
            Volver al Radar
          </Button>
        </motion.div>
      </div>
    );
  }

  if (registered) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = (timeLeft / (registered.eta_minutes * 60)) * 100;
    const isWarning = progress < 20;

    return (
      <div className="flex flex-col h-full bg-[#0A0A0F] relative overflow-hidden">
        <div className="h-[72px] px-6 flex items-center justify-between z-10 sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-md shrink-0 border-b border-[#2A2A38]/50">
          <button onClick={() => navigate(`/radar?sid=${sessionId}`)} className="w-10 h-10 flex items-center justify-center bg-[#1E1E2A] hover:bg-[#2A2A38] rounded-full border border-[#2A2A38] transition-colors shadow-sm">
            <ArrowLeft size={20} className="text-[#F0F0F5]" />
          </button>
          <span className="text-[14px] font-bold text-[#F0F0F5] tracking-wide uppercase">En Camino</span>
          <div className="w-10 h-10" />
        </div>

        <div className="px-6 py-8 flex-1 flex flex-col z-10 items-center justify-center max-w-[400px] mx-auto w-full">
          <div className="flex items-center gap-2 text-[#39FF6E] font-bold text-[14px] justify-center py-2 mb-8 bg-[#39FF6E]/10 px-6 rounded-full border border-[#39FF6E]/30 uppercase tracking-widest">
            ✅ Registro enviado al grupo
          </div>

          <div className="relative w-48 h-48 mb-10 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#1E1E2A" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="45" fill="none"
                stroke={isWarning ? "#FF3B30" : "#39FF6E"}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray="283" strokeDashoffset={283 - (283 * progress) / 100}
                transition={{ duration: 1 }}
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className={`text-4xl font-black tabular-nums tracking-tighter ${isWarning ? "text-[#FF3B30]" : "text-[#F0F0F5]"}`}>
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </span>
              <span className="text-[12px] text-[#8888AA] font-bold uppercase tracking-widest mt-1">RESTANTES</span>
            </div>
          </div>

          <div className="w-full bg-[#1E1E2A] p-4 rounded-2xl mb-10 border border-[#2A2A38]/50 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#14141C] border border-[#2A2A38] flex items-center justify-center text-[#F0F0F5] font-bold text-lg overflow-hidden shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                profile?.full_name?.charAt(0) || "U"
              )}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[14px] font-bold text-[#F0F0F5] truncate">🚕 {profile?.full_name?.split(" ")[0] || "Usuario"} — en camino</span>
              <span className="text-[13px] text-[#8888AA] truncate">Llega en ~{registered.eta_minutes} min a {registered.destination.split(',')[0]}</span>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleArrived}
            disabled={loading}
            className="h-[64px] text-[18px] w-full shadow-[0_8px_32px_rgba(57,255,110,0.25)] hover:shadow-[0_12px_48px_rgba(57,255,110,0.4)] transition-all font-black mb-4"
          >
            <HomeIcon size={24} strokeWidth={2.5} className="mr-2" />
            Ya llegué a casa 🏠
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setRegistered(null)}
            className="border-[#2A2A38] text-[#8888AA] h-[50px] w-full bg-transparent hover:bg-[#1E1E2A]"
          >
            Editar registro
          </Button>
        </div>
      </div>
    );
  }

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

        <div className="flex flex-col gap-6 mb-10">
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

          {/* Destination */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#8888AA] uppercase tracking-widest pl-1 flex justify-between">
              <span>Destino</span>
              <Link to="/profile" className="text-[#39FF6E] hover:underline normal-case tracking-normal">Editar frecuentes</Link>
            </label>
            
            {/* Chips */}
            {destinations.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {destinations.map(d => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setDestination(d.name);
                      setDestinationLat(d.lat);
                      setDestinationLng(d.lng);
                    }}
                    className={`px-3 py-1.5 rounded-full text-[13px] font-bold border transition-colors ${
                      destination === d.name 
                        ? "bg-[#39FF6E]/20 border-[#39FF6E]/50 text-[#39FF6E]" 
                        : "bg-[#1E1E2A] border-[#2A2A38] text-[#8888AA] hover:border-[#8888AA] hover:text-[#F0F0F5]"
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            )}

            <div className="relative group flex items-center gap-2">
              <AddressAutocomplete
                value={destination}
                onChange={(val) => {
                  setDestination(val);
                  setDestinationLat(null);
                  setDestinationLng(null);
                }}
                onSelect={(name, lat, lng) => {
                  setDestination(name);
                  setDestinationLat(lat);
                  setDestinationLng(lng);
                }}
                placeholder="Ingresa tu destino u obtén GPS..."
              />
              <button 
                onClick={handleLocateMe}
                disabled={locating}
                className="w-[64px] h-[64px] shrink-0 flex items-center justify-center bg-[#1E1E2A] rounded-xl text-[#39FF6E] hover:bg-[#2A2A38] transition-colors border border-[#2A2A38] focus:border-[#39FF6E]/50 disabled:opacity-50 shadow-sm"
                title="Usar mi ubicación actual"
              >
                {locating ? <Loader2 size={24} className="animate-spin" /> : <Navigation size={24} />}
              </button>
            </div>
            {destinationLat && destinationLng && (
              <p className="text-[11px] text-[#39FF6E] mt-1 text-right font-mono tracking-wide">
                Coordenadas fijadas ✓
              </p>
            )}
          </div>

          {/* ETA */}
          <div className="flex flex-col gap-2 mt-2">
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
        </div>

        {/* Preview */}
        <div className="bg-[#1E1E2A] p-5 rounded-2xl mb-8 border border-[#2A2A38]/50 shadow-[0_8px_24px_rgba(0,0,0,0.3)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#39FF6E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-[#39FF6E] shadow-[0_0_8px_#39FF6E]" />
            <h3 className="text-[14px] font-bold text-[#F0F0F5] uppercase tracking-wide">Esto se compartirá con tu grupo</h3>
          </div>
          <p className="text-[#8888AA] text-[15px] leading-relaxed mb-6 p-4 bg-[#14141C]/80 rounded-xl border border-[#2A2A38]/30 italic font-medium">
            {previewText}
          </p>

          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              onClick={handleShare}
              disabled={loading}
              className="h-[56px] text-[16px] w-full shadow-[0_4px_24px_rgba(57,255,110,0.2)] hover:shadow-[0_8px_32px_rgba(57,255,110,0.4)] transition-all disabled:opacity-60 font-bold"
            >
              <Share2 size={20} strokeWidth={2.5} className="mr-2" />
              {loading ? "Compartiendo..." : "Compartir con mi grupo"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
