import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup,signOut} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";

// 1. Registrar usuario con Email + Racha + Datos iniciales de juego
export const registerWithEmail = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // A. Inicializamos su racha 
  await setDoc(doc(db, "streaks", user.uid), {
    userId: user.uid,
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null
  });

  // B. DEFINIMOS EL USUARIO (Datos de economía y nivel de la App)
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    username: user.email?.split('@')[0], // Le pone de nombre lo que está antes del @ temporalmente
    coins: 100, // Les damos monedas de bienvenida para el gacha
    level: 1,
    xp: 0,
    createdAt: new Date().toISOString()
  });

  return user;
};

// 2. Iniciar sesión con Email 
export const loginWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// 3. Iniciar sesión o registrarse con Google 
export const loginWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  const user = userCredential.user;

  const streakDocRef = doc(db, "streaks", user.uid);
  const streakDoc = await getDoc(streakDocRef);

  // Si es la primera vez que entra con Google, le creamos la racha y el perfil de juego
  if (!streakDoc.exists()) {
    // Creamos la racha
    await setDoc(streakDocRef, {
      userId: user.uid,
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null
    });

    // Creamos el usuario definido con sus monedas y nivel
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      username: user.displayName || "Usuario Fire",
      coins: 100,
      level: 1,
      xp: 0,
      createdAt: new Date().toISOString()
    });
  }

  return user;
};

// 4. Cerrar sesión
export const logout = async () => {
  await signOut(auth);
};