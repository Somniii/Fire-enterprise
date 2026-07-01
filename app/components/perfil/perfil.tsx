'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import AvatarVisual from '../avatares/visual';
import { obtenerSobresUsuario, SOBRES_MAX_DIARIO, venderRecompensa, obtenerPrecioVenta } from '../../lib/gacha';

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
  tieneMono: boolean;
}

const RECOMPENSAS_MOCK = {
  Comun: { name: 'Carbon', rarity: 'Comun', color: 'text-gray-400', image: '/assets/images/carbon.png' },
  Raro: { name: 'Fosforo', rarity: 'Raro', color: 'text-yellow-400', image: '/assets/images/fosforo.png' },
  Epico: { name: 'Llama', rarity: 'Epico', color: 'text-orange-400', image: '/assets/images/llama.png' },
  Legendario: { name: 'Fénix Legendario', rarity: 'Legendario', color: 'text-amber-500 animate-pulse', image: '/assets/images/fenix.png' },
  Mono: { name: 'Mono Místico', rarity: 'Mono', color: 'text-purple-400 animate-pulse', image: '/assets/images/mono.png' },
};

export default function Perfil({ onClose }: { onClose?: () => void }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sobres, setSobres] = useState({ abiertosHoy: 0, disponibles: SOBRES_MAX_DIARIO });
  const [loading, setLoading] = useState(true);
  const [vendiendo, setVendiendo] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const cargarPerfil = async (uid: string) => {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      const data = snap.data();

      const premiosRaw = data.premios ?? [];
      const conteo: Record<string, { quantity: number; rarity: string; name: string }> = {};
      let tieneMono = false;

      premiosRaw.forEach((p: { name: string; rarity: string }) => {
        if (p.rarity === 'Mono') {
          tieneMono = true;
          return;
        }
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
        displayName: data.displayName ?? auth.currentUser?.displayName ?? 'Usuario',
        email: auth.currentUser?.email ?? '',
        coins: data.coins ?? 0,
        streak: data.streak ?? 0,
        rewards: rewardsAgrupados,
        avatarId: data.avatarId ?? 0,
        tieneMono,
      });
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/layouts/login');
        return;
      }

      setLoading(true);
      try {
        await cargarPerfil(user.uid);
        const sobresData = await obtenerSobresUsuario(user.uid);
        setSobres(sobresData);
      } catch (err) {
        console.error("Error al cargar perfil:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const recargar = async () => {
      const user = auth.currentUser;
      if (!user) return;

      await cargarPerfil(user.uid);
      const sobresData = await obtenerSobresUsuario(user.uid);
      setSobres(sobresData);
    };

    window.addEventListener('focus', recargar);
    return () => window.removeEventListener('focus', recargar);
  }, []);

  const handleVender = async (rarity: string) => {
    const user = auth.currentUser;
    if (!user) return;

    setVendiendo(rarity);
    try {
      const precio = await venderRecompensa(user.uid, rarity);
      await cargarPerfil(user.uid);
      alert(`Vendiste 1 recompensa por ${precio} monedas 🪙`);
    } catch (err: any) {
      console.error("Error al vender:", err);
      alert(err?.message ?? "No se pudo vender la recompensa");
    } finally {
      setVendiendo(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col pt-6 md:pt-10">

      {/* Header + Monedas + Sobres en fila en pantallas grandes */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6 pb-6 border-b border-white/10">

        {/* Header */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => router.push('/layouts/Ajusteperfil')}
            className="relative group w-16 h-16 rounded-full overflow-hidden border border-white/25 hover:border-orange-500 transition-all shrink-0"
          >
            <Avatar avatarId={profile?.avatarId ?? 0} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs text-white">
              Editar
            </div>
          </button>

          <div>
            <h2 className="text-white font-semibold text-xl">{profile?.displayName}</h2>
            <p className="text-white/55 text-sm">{profile?.email}</p>
          </div>
        </div>

        {/* Monedas */}
        <div className="bg-white/5 border border-white/12 rounded-2xl p-4 lg:w-64 shrink-0">
          <p className="text-xs uppercase tracking-widest text-white/45 mb-1 flex items-center gap-1">
            <span>🪙</span> Monedas
          </p>
          <p className="text-white text-3xl font-semibold">
            {loading ? '—' : profile?.coins.toLocaleString()}
          </p>
          <p className="text-white/45 text-xs mt-1">monedas disponibles</p>
        </div>

        {/* Sobres abiertos hoy */}
        <div className="bg-white/5 border border-white/12 rounded-2xl p-4 lg:w-64 shrink-0">
          <p className="text-xs uppercase tracking-widest text-white/45 mb-1 flex items-center gap-1">
            <span>✉️</span> Sobres
          </p>
          <p className="text-white text-3xl font-semibold">
            {loading ? '—' : `${sobres.abiertosHoy}/${SOBRES_MAX_DIARIO}`}
          </p>
          <p className="text-white/45 text-xs mt-1">
            {sobres.disponibles > 0
              ? `${sobres.disponibles} disponibles hoy`
              : 'volvé mañana por más'}
          </p>
        </div>

      </div>

      {/* Recompensas */}
      <p className="text-xs uppercase tracking-widest text-white/45 mb-3">
        Historial de recompensas
      </p>

      {loading ? (
        <p className="text-white/50 text-sm text-center py-4">Cargando...</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">

          {/* Objeto misterioso: Mono, bloqueado hasta que salga en el gacha */}
          {!profile?.tieneMono ? (
            <div className="bg-white/5 border border-dashed border-white/15 rounded-2xl p-3 flex flex-col items-center gap-2 relative overflow-hidden">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-xl">
                🔒
              </div>
              <span className="text-white/50 text-xs font-medium">???</span>
              <span className="text-white/30 text-[10px] text-center">Objeto misterioso</span>
            </div>
          ) : (
            <div className="bg-white/5 border border-purple-400/30 rounded-2xl p-3 flex flex-col items-center gap-2">
              <img
                src={RECOMPENSAS_MOCK.Mono.image}
                alt={RECOMPENSAS_MOCK.Mono.name}
                className="w-11 h-11 rounded-xl object-contain"
                onError={(e) => (e.currentTarget.src = '/assets/images/placeholder.png')}
              />
              <span className={`text-xs font-medium ${RECOMPENSAS_MOCK.Mono.color}`}>{RECOMPENSAS_MOCK.Mono.name}</span>
              <span className="text-white/45 text-[10px] text-center">Objeto de colección</span>
            </div>
          )}

          {profile?.rewards?.map((reward, i) => {
            const precio = obtenerPrecioVenta(reward.rarity);
            return (
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

                {precio !== null && (
                  <button
                    onClick={() => handleVender(reward.rarity)}
                    disabled={vendiendo === reward.rarity}
                    className="mt-1 w-full text-[10px] bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/25 text-orange-300 rounded-lg py-1 transition-all disabled:opacity-40"
                  >
                    {vendiendo === reward.rarity ? 'Vendiendo...' : `Vender · ${precio} 🪙`}
                  </button>
                )}
              </div>
            );
          })}

          {(!profile?.rewards || profile.rewards.length === 0) && (
            <p className="text-white/40 text-sm col-span-full text-center py-2">
              Sin recompensas todavía — probá suerte en el Altar del Fuego
            </p>
          )}
        </div>
      )}

    </div>
  );
}