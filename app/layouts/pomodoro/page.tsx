"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { ESTADOS } from "../../components/avatares/avatares";
import GlassCard from '../../components/styles/glasscard'; 
import ImageBackground from "../../components/homepage/imagebackground";

// --- Configuración de la regla proporcional ---
// 25 min estudio -> 5 min descanso => ratio 1:5
const RATIO_DESCANSO = 1 / 5;

type FaseSesion = "estudio" | "descanso" | "pausado";

// Mapeo de fase -> estado visual
// ESTADOS[2] = concentración / estudio
// ESTADOS[1] = descanso
// ESTADOS[0] = pausa
const ESTADO_POR_FASE: Record<FaseSesion, number> = {
  estudio: 2,
  descanso: 1,
  pausado: 0,
};

function formatearTiempo(segundos: number) {
  const m = Math.floor(segundos / 60).toString().padStart(2, "0");
  const s = Math.floor(segundos % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function Pomodoro() {
  // Pantalla 1: configuración / Pantalla 2: timer activo
  const [configurado, setConfigurado] = useState(false);
  const [minutosInput, setMinutosInput] = useState(25);

  const [duracionEstudio, setDuracionEstudio] = useState(0); // segundos
  const [duracionDescanso, setDuracionDescanso] = useState(0); // segundos

  const [fase, setFase] = useState<FaseSesion>("estudio");
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [corriendo, setCorriendo] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const avanzandoRef = useRef(false);

  const iniciarSesion = () => {
    const estudioSeg = Math.max(1, Math.round(minutosInput)) * 60;
    const descansoSeg = Math.max(1, Math.round(minutosInput * RATIO_DESCANSO)) * 60;

    setDuracionEstudio(estudioSeg);
    setDuracionDescanso(descansoSeg);
    setFase("estudio");
    setTiempoRestante(estudioSeg);
    setConfigurado(true);
    setCorriendo(true);
  };

  const pausarOReanudar = () => {
    setCorriendo((prev) => !prev);
  };

  const reiniciarTodo = () => {
    setConfigurado(false);
    setCorriendo(false);
    setFase("estudio");
    setTiempoRestante(0);
  };

  
const avanzarFase = useCallback(() => {
  if (avanzandoRef.current) return;
  avanzandoRef.current = true;

  setFase((faseActual) => {
    const nuevaFase = faseActual === "estudio" ? "descanso" : "estudio";
    const nuevoDuration = nuevaFase === "estudio" ? duracionEstudio : duracionDescanso;
    setTiempoRestante(nuevoDuration);
    setTimeout(() => { avanzandoRef.current = false; }, 100);
    return nuevaFase;
  });
}, [duracionEstudio, duracionDescanso]);

  useEffect(() => {
  if (!corriendo || !configurado) return;

  intervalRef.current = setInterval(() => {
    setTiempoRestante((prev) => {
      if (avanzandoRef.current) return prev;
      if (prev <= 1) return 0;
      return prev - 1;
    });
  }, 1000);

  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
}, [corriendo, configurado]);

useEffect(() => {
  if (tiempoRestante === 0 && configurado && corriendo) {
    avanzarFase();
  }
}, [tiempoRestante, configurado, corriendo, avanzarFase]);

// Efecto separado que detecta cuando llega a 0 y avanza la fase
useEffect(() => {
  if (tiempoRestante === 0 && configurado && corriendo) {
    avanzarFase();
  }
}, [tiempoRestante, configurado, corriendo, avanzarFase]);

  // --- Cálculos para el círculo SVG ---
  const duracionFaseActual = fase === "estudio" ? duracionEstudio : duracionDescanso;
  const progreso = duracionFaseActual > 0 ? tiempoRestante / duracionFaseActual : 0;

  const RADIO = 90;
  const CIRCUNFERENCIA = 2 * Math.PI * RADIO;
  const offset = CIRCUNFERENCIA * (1 - progreso);

  const estadoImg = (() => {
  if (!corriendo) return ESTADOS[0]?.public;
  if (fase === "estudio") return ESTADOS[2]?.public;
  return ESTADOS[1]?.public;
})();

  const colorFase =
    fase === "estudio" ? "#f97316" /* orange-500 */ : "#38bdf8" /* sky-400 */;

  // ---------- Pantalla de configuración ----------
  if (!configurado) {
    return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 relative">
    <ImageBackground />
      <GlassCard className="!h-auto max-w-md w-full flex flex-col p-6 items-center">
        <h2 className="text-white font-semibold text-xl mb-1">Modo Estudio</h2>
        <p className="text-white/50 text-sm mb-6 text-center">
          Elegí cuánto tiempo querés estudiar. El descanso se calcula automáticamente.
        </p>

        <div className="w-full mb-6">
          <label className="block text-[10px] font-medium text-white/60 mb-2 uppercase tracking-wider text-center">
            Minutos de estudio
          </label>
          <input
            type="number"
            min={1}
            max={180}
            value={minutosInput}
            onChange={(e) => setMinutosInput(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl font-semibold focus:outline-none focus:border-orange-500/60 transition-colors"
          />
        </div>

        <p className="text-white/40 text-xs mb-6">
          Descanso sugerido: <span className="text-white/70 font-medium">{Math.max(1, Math.round(minutosInput * RATIO_DESCANSO))} min</span>
        </p>

        <button
          onClick={iniciarSesion}
          disabled={!minutosInput || minutosInput <= 0}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold rounded-xl py-3 transition-all"
        >
          Empezar a estudiar
        </button>
      </GlassCard>
  </div>
    );
  }

  // ---------- Pantalla del timer ----------
  return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 relative">
    <ImageBackground />
    <GlassCard className="!h-auto max-w-md w-full flex flex-col p-6 items-center">
      <p className="text-white/50 text-xs uppercase tracking-widest mb-6">
        {fase === "estudio" ? "Tiempo de estudio" : "Tiempo de descanso"}
      </p>

      {/* Círculo de progreso con imagen de estado en el centro */}
      <div className="relative w-56 h-56 mb-8">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
          {/* Fondo del círculo */}
          <circle
            cx="100"
            cy="100"
            r={RADIO}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="10"
          />
          {/* Progreso */}
          <circle
            cx="100"
            cy="100"
            r={RADIO}
            fill="none"
            stroke={colorFase}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUNFERENCIA}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.4s ease" }}
          />
        </svg>

        {/* Contenido central: imagen de estado + tiempo */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          {estadoImg && (
            <img
              src={estadoImg}
              alt={`Estado: ${corriendo ? (fase === "estudio" ? "estudio" : "descanso") : "pausado"}`}
              className="w-16 h-16 object-contain"
            />
          )}
          <span className="text-white text-3xl font-semibold tabular-nums">
            {formatearTiempo(tiempoRestante)}
          </span>
        </div>
      </div>

      {/* Controles */}
      <div className="flex gap-3 w-full">
        <button
          onClick={pausarOReanudar}
          className="flex-1 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-medium rounded-xl py-2.5 transition-all"
        >
          {corriendo ? "Pausar" : "Reanudar"}
        </button>
        <button
          onClick={reiniciarTodo}
          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 font-medium rounded-xl py-2.5 transition-all"
        >
          Terminar
        </button>
      </div>
    </GlassCard>
  </div>
  );
}