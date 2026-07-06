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
    ultimoResetSemanal?: string | null   // ISO date del último domingo que se reseteó
    ultimoResetMensual?: string | null   // ISO date del último día 1 que se reseteó
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

    // Calcula el último lunes a las 00:00
    function getUltimoLunes(): Date {
        const d = new Date(hoy)
        const diaSemana = hoy.getDay() // 0=dom, 1=lun, ..., 6=sab
        
        // Si hoy es domingo(0) o lunes(1), el "último lunes que cerró ciclo" 
        // es el lunes de hace 7 días — la semana todavía no cerró
        // Si hoy es martes(2) a sábado(6), el último lunes ya pasó y cerró el ciclo anterior
        const offset = diaSemana <= 1 ? (diaSemana + 7) : diaSemana - 1
        
        d.setDate(hoy.getDate() - offset)
        d.setHours(0, 0, 0, 0)
        return d
    }

    // Calcula el último día 1 a las 00:00
    function getUltimoDia1(): Date {
        const d = new Date(hoy)
        if (hoy.getDate() === 1) {
            d.setMonth(hoy.getMonth() - 1)
        }
        d.setDate(1)
        d.setHours(0, 0, 0, 0)
        return d
    }

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

        // 2. RESET ciclo semanal
        if (tarea.tipoRepeticion === "week") {
            const ultimoLunes = getUltimoLunes()

            const fechaReferencia = tarea.ultimoResetSemanal
                ? new Date(tarea.ultimoResetSemanal)
                : tarea.fechaCreacion
                    ? new Date(tarea.fechaCreacion)
                    : null

            const debeResetear = fechaReferencia && ultimoLunes > fechaReferencia

            if (debeResetear) {
                const nuevosCiclos = (tarea.cantidadCiclos ?? 0) + 1
                const esPrimerCiclo = (tarea.cantidadCiclos ?? 0) === 0
                const completoElCiclo = (tarea.rachaCiclo ?? 0) >= tarea.cantidadDias

                // Si es primer ciclo o completó: racha se queda
                // Si no completó y no es primer ciclo: racha a 0
                const nuevaRachaActual = (esPrimerCiclo || completoElCiclo)
                    ? (tarea.rachaActual ?? 0)
                    : 0

                await updateDoc(doc(db, "tasks", tarea.taskId), {
                    rachaCiclo: 0,
                    cantidadCiclos: nuevosCiclos,
                    rachaActual: nuevaRachaActual,
                    ultimoResetSemanal: ultimoLunes.toISOString()
                })
                tarea.rachaCiclo = 0
                tarea.cantidadCiclos = nuevosCiclos
                tarea.rachaActual = nuevaRachaActual
                tarea.ultimoResetSemanal = ultimoLunes.toISOString()
            }
        }

        // 3. RESET ciclo mensual
        if (tarea.tipoRepeticion === "month") {
            const ultimoDia1 = getUltimoDia1()

            const fechaReferencia = tarea.ultimoResetMensual
                ? new Date(tarea.ultimoResetMensual)
                : tarea.fechaCreacion
                    ? new Date(tarea.fechaCreacion)
                    : null

            const debeResetear = fechaReferencia && ultimoDia1 > fechaReferencia

            if (debeResetear && (tarea.rachaCiclo ?? 0) >= 0) {
                const nuevosCiclos = (tarea.cantidadCiclos ?? 0) + 1
                const completoElCiclo = (tarea.rachaCiclo ?? 0) >= tarea.cantidadDias
                const esPrimerCiclo = (tarea.cantidadCiclos ?? 0) === 0
                const nuevaRachaActual = (completoElCiclo || esPrimerCiclo)
                    ? (tarea.rachaActual ?? 0)
                    : 0

                await updateDoc(doc(db, "tasks", tarea.taskId), {
                    rachaCiclo: 0,
                    cantidadCiclos: nuevosCiclos,
                    rachaActual: nuevaRachaActual,
                    ultimoResetMensual: ultimoDia1.toISOString()
                })
                tarea.rachaCiclo = 0
                tarea.cantidadCiclos = nuevosCiclos
                tarea.rachaActual = nuevaRachaActual
                tarea.ultimoResetMensual = ultimoDia1.toISOString()
            }
        }

        // 4. RACHA A 0 si no puede completar el ciclo (solo desde el segundo ciclo)
        if ((tarea.cantidadCiclos ?? 0) > 0 && !tarea.completadaHoy) {
            if (tarea.tipoRepeticion === "week" && tarea.detallesSemanal) {
                const indiceHoy = hoy.getDay()
                // domingo (0) no cuenta como "día restante", la semana ya terminó para el usuario
                // pero tampoco penalizamos hasta el lunes
                if (indiceHoy === 0) {
                    // Es domingo: no penalizamos, dejamos que el reset del lunes lo maneje
                } else {
                    const diasRestantes = tarea.detallesSemanal.dias.filter(dia =>
                        DIAS_ORDENADOS.indexOf(dia) > indiceHoy
                    ).length
                    const faltanCompletar = tarea.cantidadDias - (tarea.rachaCiclo ?? 0)
                    if (faltanCompletar > diasRestantes) {
                        await updateDoc(doc(db, "tasks", tarea.taskId), { rachaActual: 0 })
                        tarea.rachaActual = 0
                    }
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