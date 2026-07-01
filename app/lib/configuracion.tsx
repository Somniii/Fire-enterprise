"use client";
import { useEffect, useState } from 'react';
import { getAuth, updateProfile, updatePassword, signOut } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import GlassCard from '../components/styles/glasscard'; 
import ImageBackground from '../components/homepage/imagebackground';
import UpBar from '../components/homepage/upbar'; // <-- ajustá esta ruta a la real de tu UpBar
import { AVATARES } from '../components/avatares/avatares';
import { motion, AnimatePresence } from 'framer-motion';
import { setAvatarGuardado as guardarAvatarEnStorage } from '../components/avatares/estado';

export default function AjustesPerfil() {
  const router = useRouter();
  
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaContrasenia, setNuevaContrasenia] = useState('');
  
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [loading, setLoading] = useState(false);

  const [avatarId, setAvatarId] = useState<number>(0);
  const [avatarConfirmado, setAvatarConfirmado] = useState<number>(0);
  const auth = getAuth();

  const handleCerrarSesion = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      router.push("/layouts/login"); 
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const docSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (docSnap.exists()) {
          const id = docSnap.data().avatarId || 0;
          setAvatarId(id);
          setAvatarConfirmado(id);
        }
      }
    };
    fetchUserData();
  }, [auth.currentUser]);

  const seleccionarAvatar = (id: number) => {
    setAvatarId(id);
  }

  const guardarCambiosAvatar = async () => {
    if (!auth.currentUser) return;
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", auth.currentUser.uid), { avatarId: avatarId });
      guardarAvatarEnStorage();
      setAvatarConfirmado(avatarId);
      window.dispatchEvent(new Event("avatarChanged"));
      setMensajeExito("¡Avatar guardado correctamente!");
    } catch (error) {
      setError("Error al guardar el avatar");
    } finally {
      setLoading(false);
    }
  };

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
        await updateDoc(userRef, { displayName: nuevoNombre });
        
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
    <div className="min-h-screen w-full flex flex-col items-center justify-start pt-20 px-4 relative">
      <UpBar />
      <ImageBackground />

      <GlassCard className="!h-auto max-w-md w-full flex flex-col p-6 border border-white/5 backdrop-blur-md shadow-2xl rounded-2xl relative">

        {/* Botón X para volver al inicio */}
        <button
          onClick={() => router.push('/layouts/homepage')}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors text-xl leading-none"
          aria-label="Cerrar y volver al inicio"
        >
          ✕
        </button>
        
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

        {/* Visualización del Avatar (Carrusel) */}
        <div className="flex flex-col items-center mb-6">
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <button 
              onClick={() => {
                const ids = Object.keys(AVATARES).map(Number);
                const currentIndex = ids.indexOf(avatarId);
                const newIndex = (currentIndex - 1 + ids.length) % ids.length;
                seleccionarAvatar(ids[newIndex]);
              }}
              className="text-white/50 hover:text-white transition-colors text-2xl"
            >
              ◀
            </button>

            <div className="relative w-24 h-24 overflow-hidden rounded-full border-2 border-orange-500/50 shadow-lg">
              <AnimatePresence mode="wait">
                <motion.img
                  key={avatarId}
                  src={AVATARES[avatarId].public}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full object-cover"
                  alt={`Avatar ${avatarId}`}
                />
              </AnimatePresence>
            </div>

            <button 
              onClick={() => {
                const ids = Object.keys(AVATARES).map(Number);
                const currentIndex = ids.indexOf(avatarId);
                const newIndex = (currentIndex + 1) % ids.length;
                seleccionarAvatar(ids[newIndex]);
              }}
              className="text-white/50 hover:text-white transition-colors text-2xl"
            >
              ▶
            </button>
          </div>
          
          {avatarId !== avatarConfirmado && (
            <button 
              onClick={guardarCambiosAvatar}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl py-2 px-4 transition-all animate-pulse"
            >
              {loading ? "Guardando..." : "Confirmar nuevo Avatar"}
            </button>
          )}
        </div>

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

        {/* Botón de Cerrar Sesión */}
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