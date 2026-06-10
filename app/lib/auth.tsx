import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup,signOut} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import {collection , query , where , getDocs} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth";
import { redirect } from "next/navigation";
import { updateDoc } from "firebase/firestore";
/*        const nuevaTarea = {
            //cambiar el userId cuando esten vinculados con la cuenta.
            userId:null,
            activa:true,
            id:crypto.randomUUID(),
            fechaCreacion:new Date().toISOString(),
            rachaActual:0,
            mejorRacha:0,
            completadaHoy:false,
            ultimaCompletacion:null,
            titulo,
            nota,
            rachaPorTipo:0,
            tipoRepeticion: repeatType,
            // Si es semanal, guardamos los días checkeados y la cantidad
            detallesSemanal: repeatType === "week" ? {
                cantidadDias: cantidadDiasSemana,
                dias: Object.keys(diasSeleccionados).filter(key => diasSeleccionados[key as keyof typeof diasSeleccionados])
            } : null,
            // Si es mensual, guardamos el día seleccionado del 1 al 30
            detallesMensual: repeatType === "month" ? {
                cantidadDias: diaDelMes,
                fechas: selectedDates.map(date=>date.toISOString())
            } : null
        }; */
export interface TaskInterface{
  detallesSemanal: { cantidadDias: number; dias: string[] } | null,
  detallesMensual: { cantidadDias: number; fechas: string[] } | null,
  taskId:string,
  activa:boolean,
  fechaCreacion: string,
  rachaActual:number,
  mejorRacha:number,
  completadaHoy: boolean,
  ultimaCompletacion: string |null,
  titulo: string,
  nota: string,
  rachaPorTipo:number,
  tipoRepeticion:string,
  cantidadDias: number,
  diasSemana?: string[],
  fechasMes?: string[],
  
  
}
//CREACION TAREAS:
export const crearTarea = async (task: TaskInterface) => {
  const currentUser = auth.currentUser;
  if (!currentUser){ 
    throw new Error("No hay usuario logueado") 
    
  };

  await setDoc(doc(db, "tasks", task.taskId), {
    ...task,
    userId: currentUser.uid  // ← sobreescribe el "anonimo"
  });
};

//MODIFICAR TAREAS

export const modificarTarea = async (taskId: string, cambios: Partial<TaskInterface>) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No hay usuario logueado");

    await updateDoc(doc(db, "tasks", taskId), {
        ...cambios
    });
};

//TRAER TAREAS
export const obtenerTareas = async (): Promise<TaskInterface[]> => {
    const currentUser = await new Promise<import("firebase/auth").User | null>((resolve) => {
        const unsub = onAuthStateChanged(auth, (user) => {
            unsub()  // ← cancela el listener inmediatamente después del primer resultado
            resolve(user)
        })
    })

    if (!currentUser) throw new Error("No hay usuario logueado")

    const q = query(
        collection(db, "tasks"),
        where("userId", "==", currentUser.uid)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => doc.data() as TaskInterface)
}


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