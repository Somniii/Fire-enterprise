'use client';

import { useState } from 'react';
import { loginWithGoogle } from '../lib/auth';
import { useRouter } from 'next/navigation';

export default function LoginGoogle() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push('/');
    } catch (err: any) {
      console.error(err);
      setError('Error al conectar con Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && <p className="text-red-300 text-xs text-center mb-1">{error}</p>}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-xl py-2.5 font-medium transition-all backdrop-blur-md disabled:opacity-50"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3A11.951 11.951 0 0 0 12 .909a11.93 11.93 0 0 0-8.945 4.005l2.21 4.851z" />
          <path fill="#4285F4" d="M23.455 12.273c0-.818-.068-1.609-.205-2.364H12v4.527h6.436a5.505 5.505 0 0 1-2.39 3.614l3.704 2.873c2.164-1.99 3.41-4.923 3.41-8.65z" />
          <path fill="#FBBC05" d="M5.266 14.235L3.055 19.09A11.93 11.93 0 0 0 12 23.091c2.81 0 5.41-.818 7.455-2.318l-3.705-2.873a7.042 7.042 0 0 1-3.75 1.091 7.077 7.077 0 0 1-6.734-4.756z" />
          <path fill="#34A853" d="M3.055 4.91A11.93 11.93 0 0 0 .909 12c0 2.61.836 5.018 2.25 7.09l4.318-3.355a7.07 7.07 0 0 1 0-7.47L3.055 4.91z" />
        </svg>
        {loading ? 'Cargando...' : 'Google'}
      </button>
    </div>
  );
}