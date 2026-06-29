'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../lib/firebase'; // ajustá el path a tu config
import { doc, getDoc } from 'firebase/firestore';
import GlassCard from '../styles/glasscard';

interface Reward {
  name: string;
  quantity: number;
  rarity: string;
  icon: string; // path a /public
}

interface UserProfile {
  displayName: string;
  email: string;
  coins: number;
  streak: number;
  rewards: Reward[];
}


const RECOMPENSAS_MOCK = {
  Comun:       { name: 'Carbon',          rarity: 'Comun',       color: 'text-gray-400',            image: '/assets/images/carbon.png' },
  Raro:        { name: 'Fosforo',         rarity: 'Raro',        color: 'text-yellow-400',          image: '/assets/images/fosforo.png' },
  Epico:       { name: 'Llama',           rarity: 'Epico',       color: 'text-orange-400',          image: '/assets/images/llama.png' },
  Legendario:  { name: 'Fénix Legendario',rarity: 'Legendario',  color: 'text-amber-500 animate-pulse', image: '/assets/images/fenix.png' },
};

export default function Perfil({ onClose }: { onClose: () => void }) {
const [profile, setProfile] = useState<UserProfile | null>(null);
const [loading, setLoading] = useState(true);
const router = useRouter();

useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      router.push('/layouts/login');
      return;
    }

    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) {
      const data = snap.data();

const premiosRaw = data.premios ?? [];
console.log('premiosRaw completo:', JSON.stringify(premiosRaw));
const conteo: Record<string, { quantity: number; rarity: string; name: string }> = {};

premiosRaw.forEach((p: { name: string; rarity: string }) => {
  const key = p.rarity; // agrupar por rareza, no por nombre
  if (conteo[key]) {
    conteo[key].quantity += 1;
  } else {
    conteo[key] = { quantity: 1, rarity: p.rarity, name: p.name };
  }
});

const rewardsAgrupados = Object.entries(conteo).map(([rarity, val]) => {
  const meta = RECOMPENSAS_MOCK[rarity as keyof typeof RECOMPENSAS_MOCK];
  return {
    name: meta?.name ?? val.name,
    quantity: val.quantity,
    rarity,
    icon: meta?.image ?? '/assets/images/carbon.png',
    color: meta?.color ?? '',
  };
});

      setProfile({
        displayName: data.displayName ?? user.displayName ?? 'Usuario',
        email: user.email ?? '',
        coins: data.coins ?? 0,
        streak: data.streak ?? 0,
        rewards: rewardsAgrupados,
      });
    }
    setLoading(false);
  });

  return () => unsub();
}, []);

  const initials = profile?.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <GlassCard className="!h-auto max-w-md w-full flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
        <div className="w-14 h-14 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white font-medium text-lg flex-shrink-0">
          {loading ? '...' : initials}
        </div>
        <div>
          <h2 className="text-white font-semibold text-lg">{profile?.displayName}</h2>
          <p className="text-white/55 text-sm">{profile?.email}</p>
        </div>
      </div>

      {/* Monedas */}
      <div className="bg-white/5 border border-white/12 rounded-2xl p-4 mb-6">
        <p className="text-xs uppercase tracking-widest text-white/45 mb-1 flex items-center gap-1">
          <span>🪙</span> Monedas
        </p>
        <p className="text-white text-3xl font-semibold">
          {loading ? '—' : profile?.coins.toLocaleString()}
        </p>
        <p className="text-white/45 text-xs mt-1">monedas disponibles</p>
      </div>

      {/* Recompensas */}
      <p className="text-xs uppercase tracking-widest text-white/45 mb-3">
        Historial de recompensas
      </p>

      {loading ? (
        <p className="text-white/50 text-sm text-center py-4">Cargando...</p>
      ) : !profile?.rewards || profile.rewards.length === 0 ? (
        <p className="text-white/40 text-sm text-center py-4">Sin recompensas aún</p>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          {profile.rewards.map((reward, i) => (
  <div
    key={i}
    className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center gap-2"
  >
    <img
      src={reward.icon}
      alt={reward.name}
      className="w-11 h-11 rounded-xl object-contain"
      onError={(e) => (e.currentTarget.src = '/assets/images/placeholder.png')}
    />
    <span className="text-white/80 text-xs font-medium">{reward.name}</span>
    <span className="text-white text-sm font-medium bg-white/12 rounded-full px-2.5 py-0.5">
      x{reward.quantity}
    </span>
    <span className="text-white/45 text-xs text-center">{reward.rarity}</span>
  </div>
))}
        </div>
      )}

      {/* Botones */}
      <button
        onClick={() => router.push('/layouts/Ajusteperfil')}
        className="mt-6 w-full bg-white/12 hover:bg-white/20 border border-white/20 active:bg-white/30 text-white font-medium rounded-xl py-2.5 transition-all backdrop-blur-md"
      >
        Editar datos
      </button>

      <button
        onClick={() => router.push('/layouts/login')}
        className="mt-3 w-full bg-white/5 hover:bg-white/10 border border-white/10 active:bg-white/20 text-white/60 font-medium rounded-xl py-2.5 transition-all backdrop-blur-md"
      >
        Cerrar perfil
      </button>

    </GlassCard>
  );
}