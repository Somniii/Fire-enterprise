import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

export interface TaskInterface {
    taskId: string
    activa: boolean
    fechaCreacion: string
    rachaActual: number
    mejorRacha: number
    completadaHoy: boolean
    ultimaCompletacion: string | null
    ultimaUltimaCompletacion: string | null
    titulo: string
    nota: string
    tipoRepeticion: string        // "week" | "month" | ""
    cantidadDias: number          // cantidad de días que tiene que hacer la tarea por ciclo
    rachaCiclo: number            // cuántos hizo en el ciclo actual
    detallesSemanal: { cantidadDias: number; dias: string[] } | null
    detallesMensual: { cantidadDias: number; fechas: string[] } | null
    diasSemana?: string[]         // legacy, usar detallesSemanal.dias
    fechasMes?: string[]          // legacy, usar detallesMensual.fechas
}

export interface UserInterface {
    uid: string
    email: string | null
    username: string
    coins: number
    level: number
    xp: number
    createdAt: string
}

// ── TAREAS ──────────────────────────────────────────────

export const crearTarea = async (task: TaskInterface) => {
    const currentUser = auth.currentUser
    if (!currentUser) throw new Error("No hay usuario logueado")

    await setDoc(doc(db, "tasks", task.taskId), {
        ...task,
        userId: currentUser.uid
    })
}

export const modificarTarea = async (taskId: string, cambios: Partial<TaskInterface>) => {
    const currentUser = auth.currentUser
    if (!currentUser) throw new Error("No hay usuario logueado")

    await updateDoc(doc(db, "tasks", taskId), { ...cambios })
}

export const obtenerTareas = async (): Promise<TaskInterface[]> => {
    const currentUser = await new Promise<import("firebase/auth").User | null>((resolve) => {
        const unsub = onAuthStateChanged(auth, (user) => {
            unsub()
            resolve(user)
        })
    })

    if (!currentUser) throw new Error("No hay usuario logueado")

    const q = query(collection(db, "tasks"), where("userId", "==", currentUser.uid))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => doc.data() as TaskInterface)
}

// ── USUARIO ──────────────────────────────────────────────

export const obtenerUsuario = async (): Promise<UserInterface | null> => {
    const currentUser = auth.currentUser
    if (!currentUser) return null

    const snap = await getDoc(doc(db, "users", currentUser.uid))
    return snap.exists() ? snap.data() as UserInterface : null
}

export const modificarUsuario = async (cambios: Partial<UserInterface>) => {
    const currentUser = auth.currentUser
    if (!currentUser) throw new Error("No hay usuario logueado")

    await updateDoc(doc(db, "users", currentUser.uid), { ...cambios })
}

// ── AUTH ──────────────────────────────────────────────

const crearDatosIniciales = async (uid: string, email: string | null, username: string) => {
    await setDoc(doc(db, "streaks", uid), {
        userId: uid,
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null
    })

    await setDoc(doc(db, "users", uid), {
        uid,
        email,
        username,
        coins: 100,
        level: 1,
        xp: 0,
        createdAt: new Date().toISOString()
    })
}

export const registerWithEmail = async (email: string, password: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await crearDatosIniciales(user.uid, user.email, email.split('@')[0])
    return user
}

export const loginWithEmail = async (email: string, password: string) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    return user
}

export const loginWithGoogle = async () => {
    const { user } = await signInWithPopup(auth, googleProvider)

    const snap = await getDoc(doc(db, "streaks", user.uid))
    if (!snap.exists()) {
        await crearDatosIniciales(user.uid, user.email, user.displayName || "Usuario Fire")
    }

    return user
}

export const logout = async () => {
    await signOut(auth)
}