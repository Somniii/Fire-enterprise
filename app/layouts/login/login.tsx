'use client';

import { useState } from 'react';
import { registerWithEmail, loginWithEmail } from '../../lib/auth';
import GlassCard from '../../components/styles/glasscard'; // Validá si las rutas relativas coinciden
import ImageBackground from '../../components/homepage/imagebackground';
import LoginGoogle from '../../components/LoginGoogle';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        await registerWithEmail(email, password);
        alert('¡Cuenta creada y racha inicializada con éxito!');
      } else {
        await loginWithEmail(email, password);
      }
      router.push('/'); 
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Correo o contraseña incorrectos.');
      } else {
        setError('Ocurrió un error. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 relative">
      {/* Tu componente de fondo fijo */}
      <ImageBackground />

      {/* Tu componente GlassCard envolviendo toda la interfaz */}
      {/* Le sumamos h-auto para que crezca bien con los inputs y no se corte */}
      <GlassCard className="!h-auto max-w-md w-full flex flex-col justify-center">
        
        {/* Encabezado */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-white">Fire App</h1>
          <p className="text-white/70 text-sm mt-1">
            {isRegistering ? 'Crea tu cuenta para empezar' : 'Inicia sesión en tu panel'}
          </p>
        </div>

        {/* Mensaje de Error interno en el vidrio */}
        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-500/30 text-red-200 text-sm p-2.5 rounded-xl text-center backdrop-blur-md">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-white/50 transition-colors backdrop-blur-md"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80 mb-1 uppercase tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-white/50 transition-colors backdrop-blur-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white/20 hover:bg-white/30 border border-white/30 active:bg-white/40 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 transition-all shadow-lg backdrop-blur-md"
          >
            {loading ? 'Procesando...' : isRegistering ? 'Registrarse' : 'Ingresar'}
          </button>
        </form>

        {/* Separador tipo vidrio */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-transparent px-2 text-white/50 font-light">O continuar con</span>
          </div>
        </div>

        {/* Botón de Google */}
        <LoginGoogle />

        {/* Cambiar de Login a Registro */}
        <div className="mt-5 text-center text-xs">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="text-white/60 hover:text-white transition-colors underline decoration-white/30 underline-offset-4"
          >
            {isRegistering 
              ? '¿Ya tenés cuenta? Iniciá sesión' 
              : '¿No tenés cuenta? Registrate acá'}
          </button>
        </div>

      </GlassCard>
    </div>
  );
}