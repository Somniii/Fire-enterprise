'use client'; // Indicamos que este componente se renderiza en el cliente (navegador)
import { doc, getDoc, updateDoc, collection, addDoc } from "firebase/firestore"; // Importamos funciones de Firestore para manejar la base de datos
import { auth, db } from "./firebase"; // Importamos la instancia de la base de datos de Firebase

// ítems que se pueden ganar 
const RECOMPENSAS_MOCK = {
  Comun: { name: 'Carbon', rarity: 'Comun', color: 'text-black-400', image: '/assets/images/carbon.png' },
  Raro: { name: 'Fosforo', rarity: 'Raro', color: 'text-yellow-400', image: '/assets/images/fosforo.png' },
  Epico: { name: 'Llama', rarity: 'Epico', color: 'text-orange-400', image: '/assets/images/llama.png' },
  Legendario: { name: 'Fénix Legendario', rarity: 'Legendario', color: 'text-amber-500 animate-pulse', image: '/assets/images/fenix.png' }
};

//saber que usuario está logueado para mostrar sus monedas y validar que pueda tirar el gacha
export const obtenerUsuarioActual = () => {
    const user = auth.currentUser; // Obtenemos el usuario actual desde Firebase Auth
    return user; // Retornamos el usuario (puede ser null si no hay nadie logueado)
  };

// buscar cuantas monedas tiene el usuario en la base de datos para validar que pueda tirar el gacha
export const obtenerMonedasUsuario = async (userId: string) => {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.coins || 0; // Retorna las monedas o 0 si no existe el campo
    } else {
      console.error("Usuario no encontrado en la base de datos");
      return 0; // Si el usuario no existe, retornamos 0 monedas
    }   
    };

// función para actualizar las monedas del usuario después de tirar el gacha
export const actualizarMonedasUsuario = async (userId: string, nuevasMonedas: number) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { coins: nuevasMonedas });
  };    

// calcular la probabilidad de cada premio según su rareza
export const calcularPremioGacha = () => {
    const probabilidad = Math.random() * 100; // Número aleatorio entre 0 y 100 para determinar el premio
    if (probabilidad < 50) {
      return RECOMPENSAS_MOCK['Comun']; // 50% de probabilidad para el premio común
    } else if (probabilidad < 80) {
      return RECOMPENSAS_MOCK['Raro']; // 30% de probabilidad para el premio raro
    } else if (probabilidad < 95) {
      return RECOMPENSAS_MOCK['Epico']; // 15% de probabilidad para el premio épico
    }
    return RECOMPENSAS_MOCK['Legendario']; // 5% de probabilidad para el premio legendario
  };

  // guardar el premio obtenido en la base de datos del usuario para mostrarlo en su perfil o historial de premios
export const guardarPremioUsuario = async (userId: string, premio: any) => {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const premiosPrevios = userData.premios || []; // Obtenemos los premios previos o un array vacío si no existe
        const nuevoPremio = {
            name: premio.name,
            rarity: premio.rarity,
            date: new Date().toISOString() // Guardamos la fecha de obtención del premio
        };
      await updateDoc(userRef, { premios: [...premiosPrevios, nuevoPremio] }); // Agregamos el nuevo premio al array de premios del usuario
    } else {
      console.error("Usuario no encontrado en la base de datos");
    }           
    };