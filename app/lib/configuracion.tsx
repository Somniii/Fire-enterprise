"use client";
import { useState } from 'react';
import { getAuth, updateProfile, updatePassword, signOut } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import GlassCard from '../components/styles/glasscard'; 
import ImageBackground from '../components/homepage/imagebackground';

export default function AjustesPerfil() {
  const router = useRouter(); // Inicializamos el router
  
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaContrasenia, setNuevaContrasenia] = useState('');
  
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCerrarSesion = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      // CORRECCIÓN: Asegurate de que esta sea la ruta exacta de tu Login
      router.push("/layouts/login"); 
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  const cambiarNombre = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');
    setLoading(true);

    const auth = getAuth();
    const user = auth.currentUser;

    if (!nuevoNombre.trim()) {
      setError("Por favor, ingresá un nombre válido.");
      setLoading(false);
      return;
    }

    if (user) {
      try {
        await updateProfile(user, { displayName: nuevoNombre });
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { username: nuevoNombre });
        
        setMensajeExito("¡Nombre actualizado con éxito! 🔥");
        setNuevoNombre(''); 
      } catch (err) {
        console.error(err);
        setError("Hubo un error al cambiar el nombre.");
      }
    } else {
        setError("No hay sesión iniciada.");
    }
    setLoading(false);
  };

  const cambiarContrasenia = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');
    setLoading(true);

    const auth = getAuth();
    const user = auth.currentUser;

    if (nuevaContrasenia.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    if (user) {
      try {
        await updatePassword(user, nuevaContrasenia);
        setMensajeExito("¡Contraseña actualizada con éxito! 🔒");
        setNuevaContrasenia(''); 
      } catch (err) {
        console.error(err);
        if (err && typeof err === 'object' && 'code' in err && err.code === 'auth/requires-recent-login') {
          setError("Por seguridad, cerrá sesión y volvé a entrar para cambiar tu clave.");
        } else {
          setError("Hubo un error al cambiar la contraseña.");
        }
      }
    } else {
        setError("No hay sesión iniciada.");
    }
    setLoading(false);
  };



  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start pt-16 md:pt-24 px-4 relative">
      <ImageBackground />

      <GlassCard className="!h-auto max-w-md w-full flex flex-col p-6 border border-white/5 backdrop-blur-md shadow-2xl rounded-2xl">
        
        {/* Encabezado */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">Mi Cuenta</h1>
          <p className="text-white/60 text-xs mt-1">
            Actualizá tus datos de perfil
          </p>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-2.5 rounded-xl text-center backdrop-blur-sm">
            {error}
          </div>
        )}
        {mensajeExito && (
          <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-200 text-xs p-2.5 rounded-xl text-center backdrop-blur-sm">
            {mensajeExito}
          </div>
        )}

        {/* Formulario Nombre */}
        <form onSubmit={cambiarNombre} className="space-y-4 mb-6">
          <div>
            <label className="block text-[10px] font-medium text-white/60 mb-1 uppercase tracking-wider">
              Nuevo Nombre de Usuario
            </label>
            <input
              type="text"
              required
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Ej: ProGamer99"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors backdrop-blur-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !nuevoNombre}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/10 active:bg-white/20 disabled:opacity-40 text-white text-sm font-semibold rounded-xl py-2.5 transition-all shadow-md backdrop-blur-sm"
          >
            {loading ? 'Procesando...' : 'Actualizar Nombre'}
          </button>
        </form>

        {/* Separador */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="bg-transparent px-2 text-white/40 font-light tracking-wider uppercase">Seguridad</span>
          </div>
        </div>

        {/* Formulario Contraseña */}
        <form onSubmit={cambiarContrasenia} className="space-y-4">
          <div>
            <label className="block text-[10px] font-medium text-white/60 mb-1 uppercase tracking-wider">
              Nueva Contraseña
            </label>
            <input
              type="password"
              required
              value={nuevaContrasenia}
              onChange={(e) => setNuevaContrasenia(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors backdrop-blur-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || nuevaContrasenia.length < 6}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/10 active:bg-white/20 disabled:opacity-40 text-white text-sm font-semibold rounded-xl py-2.5 transition-all shadow-md backdrop-blur-sm"
          >
            {loading ? 'Procesando...' : 'Actualizar Contraseña'}
          </button>
        </form>

        {/* Separador final antes de cerrar sesión */}
        <div className="relative mt-8 mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
        </div>

        {/*  Botón de Cerrar Sesión (con estilo rojizo glass) */}
        <button 
    onClick={handleCerrarSesion}
    className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 font-semibold rounded-xl py-2.5 transition-all backdrop-blur-md mt-4"
  >
    Cerrar Sesión
  </button>


      </GlassCard>
    </div>
  );
}