'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import GlassCard from '../styles/glasscard';
import AvatarVisual from '../avatares/visual';

// AvatarVisual typings may not include avatarId in this context; cast to any to allow avatarId prop
const Avatar = AvatarVisual as unknown as ComponentType<any>;

interface Reward {
  name: string;
  quantity: number;
  rarity: string;
  icon: string;
}

interface UserProfile {
  displayName: string;
  avatarId: number;
  email: string;
  coins: number;
  streak: number;
  rewards: Reward[];
}

const RECOMPENSAS_MOCK = {
  Comun: { name: 'Carbon', rarity: 'Comun', color: 'text-gray-400', image: '/assets/images/carbon.png' },
  Raro: { name: 'Fosforo', rarity: 'Raro', color: 'text-yellow-400', image: '/assets/images/fosforo.png' },
  Epico: { name: 'Llama', rarity: 'Epico', color: 'text-orange-400', image: '/assets/images/llama.png' },
  Legendario: { name: 'Fénix Legendario', rarity: 'Legendario', color: 'text-amber-500 animate-pulse', image: '/assets/images/fenix.png' },
};

export default function Perfil({ onClose }: { onClose?: () => void }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      router.push('/layouts/login');
      return;
    }

    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const data = snap.data();

        const premiosRaw = data.premios ?? [];
        const conteo: Record<string, { quantity: number; rarity: string; name: string }> = {};

        premiosRaw.forEach((p: { name: string; rarity: string }) => {
          const key = p.rarity;
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
          avatarId: data.avatarId ?? 0,
        });
      }
    } catch (err) {
      console.error("Error al cargar perfil:", err);
    } finally {
      setLoading(false);
    }
  });

  return () => unsub();
}, []); // <- sin dependencias, solo corre al montar

useEffect(() => {
  const recargar = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) {
      const data = snap.data();
      setProfile(prev => prev ? {
        ...prev,
        displayName: data.displayName ?? user.displayName ?? prev.displayName,
        avatarId: data.avatarId ?? prev.avatarId,
        coins: data.coins ?? prev.coins,
      } : prev);
    }
  };

  window.addEventListener('focus', recargar);
  return () => window.removeEventListener('focus', recargar);
}, []);


  return (
    <GlassCard className="!h-auto max-w-md w-full flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
        <button 
          onClick={() => router.push('/layouts/Ajusteperfil')} 
          className="relative group w-14 h-14 rounded-full overflow-hidden border border-white/25 hover:border-orange-500 transition-all"
        >
          <Avatar avatarId={profile?.avatarId ?? 0} className="w-full h-full object-cover" />
          {/* Un pequeño ícono de editar que aparece al pasar el mouse */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs text-white">
            Editar
          </div>
        </button>
        
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