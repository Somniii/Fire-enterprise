'use client';

import { useEffect, useState } from 'react';
import GlassCard from '../../components/styles/glasscard';
import ImageBackground from '../../components/homepage/imagebackground';
import { AVATARES } from '../../components/avatares/avatares'; 
import {
  obtenerUsuarioActual,
  obtenerMonedasUsuario,
  actualizarMonedasUsuario,
  calcularPremioGacha,
  procesarPremioGacha,
  obtenerSobresUsuario,
  registrarSobreAbierto,
  SOBRES_MAX_DIARIO,
  PremioGacha,
} from '../../lib/gacha';

// Tipo del resultado ya combinado con la info de si era nuevo/duplicado, para mostrar en pantalla
type ResultadoVisual =
  | { tipo: 'objeto'; name: string; rarity: string; color: string; image: string }
  | { tipo: 'mono'; name: string; rarity: string; color: string; image: string }
  | { tipo: 'avatar'; avatarId: number; esNuevo: boolean; monedasGanadas?: number };

export default function GachaPage() {
  const [monedas, setMonedas] = useState(100);
  const [premioObtenido, setPremioObtenido] = useState<ResultadoVisual | null>(null);
  const [animando, setAnimando] = useState(false);

  const [sobresAbiertosHoy, setSobresAbiertosHoy] = useState(0);
  const [sobresDisponibles, setSobresDisponibles] = useState(SOBRES_MAX_DIARIO);

  useEffect(() => {
    const cargarDatos = async () => {
      const user = obtenerUsuarioActual();
      if (user) {
        const monedasIniciales = await obtenerMonedasUsuario(user.uid);
        setMonedas(monedasIniciales);

        const { abiertosHoy, disponibles } = await obtenerSobresUsuario(user.uid);
        setSobresAbiertosHoy(abiertosHoy);
        setSobresDisponibles(disponibles);
      }
    };
    cargarDatos();
  }, []);

  const manejarTirada = async () => {
    const user = obtenerUsuarioActual();

    if (!user) {
        alert('Debes iniciar sesión para tirar el gacha');
        return;
    }
    if (sobresDisponibles <= 0) {
        alert('Ya abriste tus 3 sobres de hoy. Volvé mañana para abrir más sobres.');
        return;
    }
    if (monedas < 20) {
        alert('No tienes suficientes monedas para tirar el gacha');
        return;
    }

    setAnimando(true);
    setPremioObtenido(null);

    try {
        const premio: PremioGacha = calcularPremioGacha();
        const nuevasMonedas = monedas - 20;

        await actualizarMonedasUsuario(user.uid, nuevasMonedas);
        const resultado = await procesarPremioGacha(user.uid, premio);
        await registrarSobreAbierto(user.uid, sobresAbiertosHoy);

        // Si fue un avatar duplicado, sumamos las monedas ganadas al total final
        const monedasFinal = nuevasMonedas + (resultado.monedasGanadas ?? 0);

        setTimeout(() => {
            setMonedas(monedasFinal);

            if (premio.tipo === 'avatar') {
                setPremioObtenido({
                    tipo: 'avatar',
                    avatarId: premio.avatarId,
                    esNuevo: resultado.esNuevoAvatar ?? false,
                    monedasGanadas: resultado.monedasGanadas,
                });
            } else {
                setPremioObtenido(premio);
            }

            setSobresAbiertosHoy(prev => prev + 1);
            setSobresDisponibles(prev => Math.max(0, prev - 1));
            setAnimando(false);
        }, 2000);
    } catch (error) {
        console.error('Error al tirar el gacha:', error);
        alert('Ocurrió un error al tirar el gacha. Inténtalo de nuevo.');
        setAnimando(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start pt-16 md:pt-24 px-4 relative">
      <ImageBackground />

      <GlassCard className="!h-auto max-w-lg w-full text-center flex flex-col items-center justify-center gap-6 pt-15">

        <div className="absolute top-4 right-6 bg-white/10 border border-white/20 rounded-full px-4 py-1 text-sm font-semibold tracking-wide">
          🔥 {monedas} Monedas
        </div>

        <div className="absolute top-4 left-6 bg-white/10 border border-white/20 rounded-full px-4 py-1 text-sm font-semibold tracking-wide">
          ✉️ {sobresAbiertosHoy}/{SOBRES_MAX_DIARIO} sobres hoy
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-wider text-white">Altar del Fuego</h1>
          <p className="text-white/60 text-sm mt-1">Gasta 20 monedas para invocar una recompensa</p>
        </div>

        <div className="w-full h-52 flex items-center justify-center relative">
        {animando ? (
            <div className="w-28 h-28 rounded-full border-4 border-t-orange-500 border-white/20 animate-spin"></div>

        ) : premioObtenido?.tipo === 'avatar' ? (
            // Resultado: avatar (nuevo o duplicado convertido en monedas)
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl scale-105 transition-all duration-300 backdrop-blur-md shadow-lg flex flex-col items-center justify-center">
                <img
                    src={AVATARES[premioObtenido.avatarId]?.public}
                    alt={`Avatar ${premioObtenido.avatarId}`}
                    className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-purple-400/50"
                />
                {premioObtenido.esNuevo ? (
                    <>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">¡Invocación Exitosa!</span>
                        <h2 className="text-2xl font-black mt-1 text-purple-300">Nuevo Avatar</h2>
                        <p className="text-white/70 text-sm mt-0.5">Se agregó a tu colección</p>
                    </>
                ) : (
                    <>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Avatar repetido</span>
                        <h2 className="text-2xl font-black mt-1 text-yellow-300">+{premioObtenido.monedasGanadas} 🪙</h2>
                        <p className="text-white/70 text-sm mt-0.5">Ya lo tenías, se convirtió en monedas</p>
                    </>
                )}
            </div>

        ) : premioObtenido?.tipo === 'mono' ? (
            // Resultado: el objeto secretísimo
            <div className="p-6 bg-white/5 border border-purple-400/30 rounded-2xl scale-105 transition-all duration-300 backdrop-blur-md shadow-lg flex flex-col items-center justify-center">
                <img
                    src={premioObtenido.image}
                    alt={premioObtenido.name}
                    className="w-20 h-20 object-contain mb-3 drop-shadow-[0_10px_10px_rgba(168,85,247,0.4)]"
                    onError={(e) => (e.currentTarget.src = '/assets/images/placeholder.png')}
                />
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-300">¡Objeto Secreto!</span>
                <h2 className={`text-2xl font-black mt-1 ${premioObtenido.color}`}>{premioObtenido.name}</h2>
                <p className="text-white/70 text-sm mt-0.5">Rarísimo — revisá tu perfil</p>
            </div>

        ) : premioObtenido?.tipo === 'objeto' ? (
            // Resultado: objeto normal
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl scale-105 transition-all duration-300 backdrop-blur-md shadow-lg flex flex-col items-center justify-center">
                <img
                    src={premioObtenido.image}
                    alt={premioObtenido.name}
                    className="w-20 h-20 object-contain mb-3 drop-shadow-[0_10px_10px_rgba(255,255,255,0.1)]"
                />
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">¡Invocación Exitosa!</span>
                <h2 className={`text-2xl font-black mt-1 ${premioObtenido.color}`}>{premioObtenido.name}</h2>
                <p className="text-white/70 text-sm mt-0.5">Rareza: {premioObtenido.rarity}</p>
            </div>

        ) : sobresDisponibles <= 0 ? (
            <div className="w-32 h-44 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl flex flex-col items-center justify-center opacity-50 cursor-not-allowed">
                <span className="text-4xl">🔒</span>
                <span className="text-[10px] uppercase tracking-widest text-white/40 mt-3 font-semibold text-center px-2">Sin sobres hoy</span>
            </div>
        ) : (
            <div className="w-32 h-44 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl flex flex-col items-center justify-center shadow-md hover:border-orange-500/50 transition-all duration-300 group cursor-pointer" onClick={manejarTirada}>
                <span className="text-4xl group-hover:scale-110 transition-transform">✉️</span>
                <span className="text-[10px] uppercase tracking-widest text-white/40 mt-3 font-semibold">Sobre Místico</span>
            </div>
        )}
        </div>

        <button
          onClick={manejarTirada}
          disabled={animando || monedas < 20 || sobresDisponibles <= 0}
          className="bg-white/20 hover:bg-white/30 active:bg-white/40 border border-white/30 text-white font-bold px-8 py-3 rounded-xl tracking-wide transition-all shadow-md disabled:opacity-30 disabled:cursor-not-allowed uppercase text-sm"
        >
          {animando
            ? 'Invocando...'
            : sobresDisponibles <= 0
            ? 'Sin sobres hoy'
            : 'Tirar Gacha (20 Monedas)'}
        </button>

      </GlassCard>
    </div>
  );
}