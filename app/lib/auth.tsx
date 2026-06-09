import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";

// 1. Registrar usuario con Email y crearle la racha en 0
export const registerWithEmail = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Inicializamos la racha del usuario en la colección streaks usando su UID
  await setDoc(doc(db, "streaks", user.uid), {
    userId: user.uid,
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null
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

  // Verificamos si el usuario de Google ya tiene un documento de racha creado
  const streakDocRef = doc(db, "streaks", user.uid);
  const streakDoc = await getDoc(streakDocRef);

  // Si es la primera vez que entra con Google, le creamos la racha automática
  if (!streakDoc.exists()) {
    await setDoc(streakDocRef, {
      userId: user.uid,
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null
    });
  }

  return user;
};

// 4. Cerrar sesión
export const logout = async () => {
  await signOut(auth);
};