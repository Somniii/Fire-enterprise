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
    cantidadCiclos?: number
    modo:number
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

    const hoy = new Date()
    const DIAS_ORDENADOS = ["domingo","lunes","martes","miercoles","jueves","viernes","sabado"]
    const tareas = snapshot.docs.map(doc => doc.data() as TaskInterface)

    for (const tarea of tareas) {

        // 1. RESET completadaHoy si no es de hoy
        if (tarea.completadaHoy && tarea.ultimaCompletacion) {
            const ultimaFecha = new Date(tarea.ultimaCompletacion)
            const esDeHoy =
                ultimaFecha.getFullYear() === hoy.getFullYear() &&
                ultimaFecha.getMonth() === hoy.getMonth() &&
                ultimaFecha.getDate() === hoy.getDate()

            if (!esDeHoy) {
                await updateDoc(doc(db, "tasks", tarea.taskId), { completadaHoy: false })
                tarea.completadaHoy = false
            }
        }

        // 2. RESET ciclo semanal (cada domingo)
        if (tarea.tipoRepeticion === "week" && hoy.getDay() === 0 && (tarea.rachaCiclo ?? 0) > 0) {
            const nuevosCiclos = (tarea.cantidadCiclos ?? 0) + 1
            const completoElCiclo = (tarea.rachaCiclo ?? 0) >= tarea.cantidadDias
            const esPrimerCiclo = (tarea.cantidadCiclos ?? 0) === 0
            const nuevaRachaActual = (completoElCiclo || esPrimerCiclo)
                ? (tarea.rachaActual ?? 0) + (tarea.rachaCiclo ?? 0)
                : 0

            await updateDoc(doc(db, "tasks", tarea.taskId), {
                rachaCiclo: 0,
                cantidadCiclos: nuevosCiclos,
                rachaActual: nuevaRachaActual
            })
            tarea.rachaCiclo = 0
            tarea.cantidadCiclos = nuevosCiclos
            tarea.rachaActual = nuevaRachaActual
        }

        // 3. RESET ciclo mensual (cada día 1)
        if (tarea.tipoRepeticion === "month" && hoy.getDate() === 1 && (tarea.rachaCiclo ?? 0) > 0) {
            const nuevosCiclos = (tarea.cantidadCiclos ?? 0) + 1
            const completoElCiclo = (tarea.rachaCiclo ?? 0) >= tarea.cantidadDias
            const esPrimerCiclo = (tarea.cantidadCiclos ?? 0) === 0
            const nuevaRachaActual = (completoElCiclo || esPrimerCiclo)
                ? (tarea.rachaActual ?? 0) + (tarea.rachaCiclo ?? 0)
                : 0

            await updateDoc(doc(db, "tasks", tarea.taskId), {
                rachaCiclo: 0,
                cantidadCiclos: nuevosCiclos,
                rachaActual: nuevaRachaActual
            })
            tarea.rachaCiclo = 0
            tarea.cantidadCiclos = nuevosCiclos
            tarea.rachaActual = nuevaRachaActual
        }

        // 4. RACHA A 0 si no puede completar el ciclo (solo desde el segundo ciclo)
        if ((tarea.cantidadCiclos ?? 0) > 0 && !tarea.completadaHoy) {

            if (tarea.tipoRepeticion === "week" && tarea.detallesSemanal) {
                const diasRestantes = tarea.detallesSemanal.dias.filter(dia =>
                    DIAS_ORDENADOS.indexOf(dia) > hoy.getDay()
                ).length
                const faltanCompletar = tarea.cantidadDias - (tarea.rachaCiclo ?? 0)

                if (faltanCompletar > diasRestantes) {
                    await updateDoc(doc(db, "tasks", tarea.taskId), { rachaActual: 0 })
                    tarea.rachaActual = 0
                }
            }

            if (tarea.tipoRepeticion === "month" && tarea.detallesMensual) {
                const diasRestantes = tarea.detallesMensual.fechas.filter(fecha =>
                    Number(fecha) > hoy.getDate()
                ).length
                const faltanCompletar = tarea.cantidadDias - (tarea.rachaCiclo ?? 0)

                if (faltanCompletar > diasRestantes) {
                    await updateDoc(doc(db, "tasks", tarea.taskId), { rachaActual: 0 })
                    tarea.rachaActual = 0
                }
            }
        }
    }

    return tareas
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