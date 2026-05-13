import { useState, useEffect, useRef, useCallback } from "react";
import { Check, Plus, Clock, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";

const CIRCUMFERENCE = 2 * Math.PI * 130; // ~816.8

type TimerState = "idle" | "running" | "expired";

export function BathroomMode() {
  const [selectedMin, setSelectedMin] = useState(10);
  const [secondsLeft, setSecondsLeft] = useState(10 * 60);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  // Colores según tiempo restante
  const progress = secondsLeft / (selectedMin * 60); // 1 → 0
  const ringColor =
    progress > 0.4 ? "#FFD700" : progress > 0.15 ? "#FF8C00" : "#FF3B30";
  const glowColor =
    progress > 0.4
      ? "rgba(255,215,0,0.5)"
      : progress > 0.15
      ? "rgba(255,140,0,0.5)"
      : "rgba(255,59,48,0.6)";
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerState("running");
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          setTimerState("expired");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  // Arrancar al montar
  useEffect(() => {
    setSecondsLeft(selectedMin * 60);
    startTimer();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cambiar duración
  const handleSelectMin = (min: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSelectedMin(min);
    setSecondsLeft(min * 60);
    setTimerState("idle");
  };

  // +5 minutos
  const addTime = () => {
    const extra = 5 * 60;
    setSecondsLeft((s) => s + extra);
    if (timerState === "expired") {
      setTimerState("running");
      startTimer();
    }
  };

  // Formato mm:ss
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  // Pantalla de expiración
  if (timerState === "expired") {
    return (
      <div className="flex flex-col h-full bg-[#0A0A0F] items-center justify-center px-6 gap-6">
        {/* Flash rojo de fondo */}
        <div className="absolute inset-0 bg-[#FF3B30]/10 animate-pulse pointer-events-none rounded-none" />

        <div className="text-6xl animate-bounce">🚨</div>
        <h1 className="text-[28px] font-bold text-[#FF3B30] text-center tracking-tight">
          ¡Tiempo agotado!
        </h1>
        <p className="text-[#8888AA] text-center text-[15px] leading-relaxed max-w-[80%]">
          Tu grupo recibió una notificación de alerta. ¿Estás bien?
        </p>

        <div className="w-full flex flex-col gap-3 mt-4">
          <Link to="/radar" className="block w-full">
            <Button
              variant="primary"
              className="h-[64px] text-[18px] w-full shadow-[0_8px_32px_rgba(57,255,110,0.3)]"
            >
              <Check size={24} strokeWidth={3} />
              Sí, ya regresé
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={addTime}
            className="h-[64px] text-[16px] w-full border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/5"
          >
            <Plus size={20} />
            Necesito más tiempo +5min
          </Button>
          <Link to="/panic" className="block w-full">
            <Button
              variant="outline"
              className="h-[64px] text-[16px] w-full border-[#FF3B30]/40 text-[#FF3B30] hover:bg-[#FF3B30]/5"
            >
              🆘 Activar alerta de pánico
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F]">

      {/* Header */}
      <div className="h-[72px] px-6 flex items-center z-10 sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-md shrink-0">
        <Link
          to="/radar"
          onClick={() => { if (intervalRef.current) clearInterval(intervalRef.current); }}
          className="w-10 h-10 flex items-center justify-center bg-[#1E1E2A] hover:bg-[#2A2A38] rounded-full border border-[#2A2A38] transition-colors"
        >
          <ArrowLeft size={20} className="text-[#F0F0F5]" />
        </Link>
      </div>

      <div className="px-6 flex-1 flex flex-col items-center justify-center relative overflow-hidden">

        {/* Glow de fondo dinámico */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full blur-[100px] pointer-events-none transition-colors duration-1000"
          style={{ background: `${ringColor}08` }}
        />

        {/* Título */}
        <div className="flex flex-col items-center mb-8 relative z-10">
          <span className="text-4xl mb-4" style={{ filter: `drop-shadow(0 4px 16px ${glowColor})` }}>🚽</span>
          <h1 className="text-[28px] font-bold text-[#F0F0F5] mb-2 tracking-tight text-center">
            Modo Baño/Barra
          </h1>
          <p className="text-[#8888AA] text-[15px] text-center max-w-[80%] leading-relaxed">
            Tu grupo sabrá si no regresas a tiempo
          </p>
        </div>

        {/* Timer circular */}
        <div className="relative w-[280px] h-[280px] flex items-center justify-center mb-10 z-10">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="140" cy="140" r="130" fill="none" stroke="#1E1E2A" strokeWidth="8" />
            <circle
              cx="140"
              cy="140"
              r="130"
              fill="none"
              stroke={ringColor}
              strokeWidth="8"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 12px ${glowColor})`,
                transition: "stroke-dashoffset 1s linear, stroke 1s ease",
              }}
            />
          </svg>

          <div className="flex flex-col items-center z-10">
            <span
              className="text-[72px] font-bold tracking-tighter tabular-nums"
              style={{
                color: ringColor,
                filter: `drop-shadow(0 4px 24px ${glowColor})`,
                transition: "color 1s ease",
              }}
            >
              {mm}:{ss}
            </span>
            <span
              className="text-[16px] font-medium tracking-widest uppercase"
              style={{ color: ringColor, transition: "color 1s ease" }}
            >
              {timerState === "idle" ? "listo" : "restante"}
            </span>
          </div>
        </div>

        {/* Selector de tiempo */}
        <div className="flex flex-col items-center mb-10 z-10 w-full">
          <p className="text-[#8888AA] text-[13px] uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
            <Clock size={14} />
            Configurar tiempo
          </p>
          <div className="flex gap-3">
            {[5, 10, 15].map((min) => {
              const active = selectedMin === min && timerState === "idle";
              return (
                <button
                  key={min}
                  onClick={() => handleSelectMin(min)}
                  disabled={timerState === "running"}
                  className={`px-5 py-2.5 rounded-full font-bold text-[15px] border transition-all
                    ${active
                      ? "bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/30 shadow-[0_0_16px_rgba(255,215,0,0.15)]"
                      : "bg-[#1E1E2A] text-[#8888AA] border-[#2A2A38]"}
                    disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {min} min
                </button>
              );
            })}
          </div>
          {timerState === "idle" && (
            <button
              onClick={startTimer}
              className="mt-5 px-8 py-3 rounded-full bg-[#FFD700]/10 text-[#FFD700] font-bold text-[15px] border border-[#FFD700]/30 hover:bg-[#FFD700]/20 transition-all shadow-[0_0_20px_rgba(255,215,0,0.15)]"
            >
              ▶ Iniciar timer
            </button>
          )}
        </div>

        {/* Estado del grupo */}
        <div className="flex items-center gap-2 bg-[#1E1E2A]/50 border border-[#2A2A38]/50 px-4 py-2.5 rounded-full backdrop-blur-md z-10">
          <div className="w-2 h-2 rounded-full bg-[#39FF6E] shadow-[0_0_8px_#39FF6E80] animate-pulse" />
          <span className="text-[#8888AA] text-[13px] font-medium tracking-wide">
            Tu grupo fue notificado
          </span>
        </div>
      </div>

      {/* Botones */}
      <div className="px-6 pb-8 pt-4 shrink-0 flex flex-col gap-4 bg-gradient-to-t from-[#0A0A0F] to-transparent relative z-10">
        <Link to="/radar" className="block w-full">
          <Button
            variant="primary"
            className="h-[64px] text-[18px] w-full shadow-[0_8px_32px_rgba(57,255,110,0.2)] hover:shadow-[0_12px_48px_rgba(57,255,110,0.4)] transition-all"
          >
            <Check size={24} strokeWidth={3} />
            Ya regresé
          </Button>
        </Link>
        <Button
          variant="outline"
          onClick={addTime}
          className="h-[64px] text-[16px] w-full border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/5 hover:border-[#FFD700]/50 transition-all group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Necesito más tiempo +5min
        </Button>
      </div>
    </div>
  );
}
