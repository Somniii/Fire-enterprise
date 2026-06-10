'use client'; // Indicamos que este componente se renderiza en el cliente (navegador)

import { useEffect, useState } from 'react'; // Para manejar el estado de las monedas, el premio obtenido y la animación
import GlassCard from '../components/styles/glasscard'; // Componente de tarjeta con efecto glassmorphism para envolver el contenido del gacha
import ImageBackground from '../components/homepage/imagebackground'; // Componente de fondo fijo con imagen y efecto de parallax
import { obtenerUsuarioActual, obtenerMonedasUsuario, actualizarMonedasUsuario, calcularPremioGacha, guardarPremioUsuario } from '../lib/gacha'; // Funciones para manejar la lógica del gacha y la interacción con Firebase

export default function GachaPage() {
  const [monedas, setMonedas] = useState(100); 
  const [premioObtenido, setPremioObtenido] = useState<any>(null); 
  const [animando, setAnimando] = useState(false); 

  //Traemos las monedas reales de Firestore de forma segura al cargar la vista
  useEffect(() => {
    const cargarMonedas = async () => {
      const user = obtenerUsuarioActual();
      if (user) {
        const monedasIniciales = await obtenerMonedasUsuario(user.uid);
        setMonedas(monedasIniciales);
      }
    };
    cargarMonedas();
  }, []); // El array vacío asegura que solo se ejecute UNA VEZ al entrar

  const manejarTirada = async () => { // Función que se ejecuta al hacer click en tirar el gacha
    const user = obtenerUsuarioActual(); // Obtenemos el usuario actual para validar que pueda tirar el gacha

    if (!user){
        alert('Debes iniciar sesión para tirar el gacha');
        return;
    }
    if (monedas < 20) { // Validamos que tenga al menos 20 monedas para tirar el gacha
        alert('No tienes suficientes monedas para tirar el gacha');
        return;
    }
        setAnimando(true); // Iniciamos la animación de tirada
        setPremioObtenido(null); // Reseteamos el premio obtenido para mostrar la animación

        try {
        const premio = calcularPremioGacha(); // Calculamos el premio que salió de la tirada
        const nuevasMonedas = monedas - 20; // Calculamos las monedas restantes después de gastar 20 para tirar el gacha

        // Actualizamos las monedas del usuario en la base de datos
        await actualizarMonedasUsuario(user.uid, nuevasMonedas); 
        // Guardamos el premio obtenido en la base de datos del usuario para mostrarlo en su perfil o historial de premios
        await guardarPremioUsuario(user.uid, premio);

        setTimeout(() => { // Simulamos el tiempo de animación de la tirada (3 segundos)
            setMonedas(nuevasMonedas); // Actualizamos las monedas en el estado para reflejar el gasto
            setPremioObtenido(premio); // Mostramos el premio obtenido después de la animación
            setAnimando(false); // Terminamos la animación
        }, 2000);   
    } catch (error) {
        console.error('Error al tirar el gacha:', error);
        alert('Ocurrió un error al tirar el gacha. Inténtalo de nuevo.');
        setAnimando(false); // Aseguramos que la animación termine en caso de error 
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 relative">
      <ImageBackground />

      <GlassCard className="!h-auto max-w-lg w-full text-center flex flex-col items-center justify-center gap-6">
        
        {/* Marcador de Monedas del Usuario */}
        <div className="absolute top-4 right-6 bg-white/10 border border-white/20 rounded-full px-4 py-1 text-sm font-semibold tracking-wide">
          🔥 {monedas} Monedas
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-wider text-white">Altar del Fuego</h1>
          <p className="text-white/60 text-sm mt-1">Gasta 20 monedas para invocar una recompensa</p>
        </div>

        {/* El Contenedor del Sobre / Invocación */}
        <div className="w-full h-52 flex items-center justify-center relative">
          {animando ? (
            // Animación de carga mística mientras gira
            <div className="w-28 h-28 rounded-full border-4 border-t-orange-500 border-white/20 animate-spin"></div>
          ) : premioObtenido ? (
            // Tarjeta del premio revelado
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl scale-105 transition-all duration-300 backdrop-blur-md shadow-lg">
              <span className="text-xs uppercase font-bold tracking-widest text-white/40">¡Invocación Exitosa!</span>
              <h2 className={`text-2xl font-black mt-2 ${premioObtenido.color}`}>{premioObtenido.name}</h2>
              <p className="text-white/70 text-sm mt-1">Rareza: {premioObtenido.rarity}</p>
            </div>
          ) : (
            // Estado inicial: El sobre cerrado esperando ser abierto
            <div className="w-32 h-44 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl flex flex-col items-center justify-center shadow-md hover:border-orange-500/50 transition-all duration-300 group cursor-pointer" onClick={manejarTirada}>
              <span className="text-4xl group-hover:scale-110 transition-transform">✉️</span>
              <span className="text-[10px] uppercase tracking-widest text-white/40 mt-3 font-semibold">Sobre Místico</span>
            </div>
          )}
        </div>

        {/* Botón de acción */}
        <button
          onClick={manejarTirada}
          disabled={animando || monedas < 20}
          className="bg-white/20 hover:bg-white/30 active:bg-white/40 border border-white/30 text-white font-bold px-8 py-3 rounded-xl tracking-wide transition-all shadow-md disabled:opacity-30 disabled:cursor-not-allowed uppercase text-sm"
        >
          {animando ? 'Invocando...' : 'Tirar Gacha (20 Monedas)'}
        </button>

      </GlassCard>
    </div>
  );
}