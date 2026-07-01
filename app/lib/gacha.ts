'use client';
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { auth, db } from "./firebase";
import { AVATARES } from "../components/avatares/avatares"; // <-- ajustá esta ruta si tu archivo está en otro lado

const RECOMPENSAS_MOCK = {
  Comun: { name: 'Carbon', rarity: 'Comun', color: 'text-gray-200', image: '/assets/images/carbon.png' },
  Raro: { name: 'Fosforo', rarity: 'Raro', color: 'text-yellow-300', image: '/assets/images/fosforo.png' },
  Epico: { name: 'Llama', rarity: 'Epico', color: 'text-orange-300', image: '/assets/images/llama.png' },
  Legendario: { name: 'Fénix Legendario', rarity: 'Legendario', color: 'text-amber-500 animate-pulse', image: '/assets/images/fenix.png' },
  Mono: { name: 'Mono Místico', rarity: 'Mono', color: 'text-purple-300 animate-pulse', image: '/assets/images/mono.png' }, 
};

// IDs de avatares que se pueden ganar por gacha. El 0 queda afuera porque es el default gratis de todos.
export const AVATAR_GACHA_IDS = Array.from({ length: 15 }, (_, i) => i + 1); 

// Precios de venta de objetos
const PRECIOS_VENTA: Record<string, number> = {
  Comun: 3,
  Raro: 8,
  Epico: 16,
  Legendario: 28,
};

export const PRECIO_AVATAR_DUPLICADO = 35;

export const obtenerUsuarioActual = () => {
    const user = auth.currentUser;
    return user;
};

export const obtenerMonedasUsuario = async (userId: string) => {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data().coins || 0;
    }
    console.error("Usuario no encontrado en la base de datos");
    return 0;
};

export const actualizarMonedasUsuario = async (userId: string, nuevasMonedas: number) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { coins: nuevasMonedas });
};

// ── RESULTADO DE LA TIRADA ──────────────────────────────────────────────
// Devuelve un objeto con `tipo`: 'objeto' | 'avatar' | 'mono'
export type PremioGacha =
  | { tipo: 'objeto'; name: string; rarity: string; color: string; image: string }
  | { tipo: 'avatar'; avatarId: number }
  | { tipo: 'mono'; name: string; rarity: string; color: string; image: string };

export const calcularPremioGacha = (): PremioGacha => {
    const probabilidad = Math.random() * 100;

    if (probabilidad < 45) {
        return { tipo: 'objeto', ...RECOMPENSAS_MOCK['Comun'] };          // 0 - 45%    -> 45%
    } else if (probabilidad < 72) {
        return { tipo: 'objeto', ...RECOMPENSAS_MOCK['Raro'] };           // 45 - 72%   -> 27%
    } else if (probabilidad < 87) {
        return { tipo: 'objeto', ...RECOMPENSAS_MOCK['Epico'] };          // 72 - 87%   -> 15%
    } else if (probabilidad < 95) {
        return { tipo: 'objeto', ...RECOMPENSAS_MOCK['Legendario'] };     // 87 - 95%   -> 8%
    } else if (probabilidad < 99.9) {
        // Avatar al azar entre los 15 disponibles por gacha
        const avatarId = AVATAR_GACHA_IDS[Math.floor(Math.random() * AVATAR_GACHA_IDS.length)];
        return { tipo: 'avatar', avatarId };                              // 95 - 99.9% -> 4.9%
    }
    return { tipo: 'mono', ...RECOMPENSAS_MOCK['Mono'] };                 // 99.9 - 100% -> 0.1%
};

// ── PROCESAR EL PREMIO EN FIRESTORE ──────────────────────────────────────
// - objeto/mono: se agregan al array `premios` (como antes)
// - avatar nuevo: se agrega a `avataresDesbloqueados`
// - avatar duplicado: se convierte en monedas automáticamente (estilo Genshin)
export const procesarPremioGacha = async (
    userId: string,
    premio: PremioGacha
): Promise<{ esNuevoAvatar?: boolean; monedasGanadas?: number }> => {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw new Error("Usuario no encontrado en la base de datos");

    const data = userDoc.data();

    if (premio.tipo === 'avatar') {
        const desbloqueados: number[] = data.avataresDesbloqueados ?? [0];

        if (desbloqueados.includes(premio.avatarId)) {
            // Duplicado: se convierte en monedas
            await updateDoc(userRef, { coins: increment(PRECIO_AVATAR_DUPLICADO) });
            return { esNuevoAvatar: false, monedasGanadas: PRECIO_AVATAR_DUPLICADO };
        } else {
            // Nuevo avatar desbloqueado
            await updateDoc(userRef, { avataresDesbloqueados: [...desbloqueados, premio.avatarId] });
            return { esNuevoAvatar: true };
        }
    }

    // tipo 'objeto' o 'mono': se guarda en el historial de premios
    const premiosPrevios = data.premios || [];
    const nuevoPremio = {
        name: premio.name,
        rarity: premio.rarity,
        date: new Date().toISOString(),
    };
    await updateDoc(userRef, { premios: [...premiosPrevios, nuevoPremio] });
    return {};
};

// ── VENTA DE OBJETOS (Común/Raro/Épico/Legendario) ──────────────────────

export const obtenerPrecioVenta = (rarity: string): number | null => {
    return PRECIOS_VENTA[rarity] ?? null;
};

export const venderRecompensa = async (userId: string, rarity: string): Promise<number> => {
    const precio = PRECIOS_VENTA[rarity];
    if (!precio) throw new Error("Esta recompensa no se puede vender");

    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw new Error("Usuario no encontrado");

    const data = userDoc.data();
    const premios = data.premios || [];
    const indice = premios.findIndex((p: { rarity: string }) => p.rarity === rarity);
    if (indice === -1) throw new Error("No tenés ninguna recompensa de esa rareza para vender");

    const nuevosPremios = [...premios];
    nuevosPremios.splice(indice, 1);

    await updateDoc(userRef, {
        premios: nuevosPremios,
        coins: increment(precio),
    });

    return precio;
};

// ── LÍMITE DIARIO DE SOBRES ──────────────────────────────────────────────

export const SOBRES_MAX_DIARIO = 3;

function esMismoDia(fechaIso: string | null): boolean {
    if (!fechaIso) return false;
    const fecha = new Date(fechaIso);
    const hoy = new Date();
    return (
        fecha.getFullYear() === hoy.getFullYear() &&
        fecha.getMonth() === hoy.getMonth() &&
        fecha.getDate() === hoy.getDate()
    );
}

export const obtenerSobresUsuario = async (
    userId: string
): Promise<{ abiertosHoy: number; disponibles: number }> => {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        console.error("Usuario no encontrado en la base de datos");
        return { abiertosHoy: 0, disponibles: SOBRES_MAX_DIARIO };
    }

    const data = userDoc.data();
    const ultimaFecha = data.fechaUltimoSobre ?? null;

    if (!esMismoDia(ultimaFecha)) {
        if (data.sobresAbiertosHoy && data.sobresAbiertosHoy > 0) {
            await updateDoc(userRef, { sobresAbiertosHoy: 0 });
        }
        return { abiertosHoy: 0, disponibles: SOBRES_MAX_DIARIO };
    }

    const abiertosHoy = data.sobresAbiertosHoy ?? 0;
    return { abiertosHoy, disponibles: Math.max(0, SOBRES_MAX_DIARIO - abiertosHoy) };
};

export const registrarSobreAbierto = async (userId: string, abiertosHoyActual: number) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        sobresAbiertosHoy: abiertosHoyActual + 1,
        fechaUltimoSobre: new Date().toISOString(),
    });
};