import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, increment } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import CreateTask from "../components/homepage/createtask";


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
        //Estas dos variables(fin semana y fin mes) sirven para calcular cuando empieza un nuevo mes o semana para resetear todo
    detallesSemanal: {
        cantidadDias: number;
        dias: string[];
        finSemana: string | null;
    } | null;

    detallesMensual: {
        cantidadDias: number;
        fechas: string[];
        finMes: string | null;
    } | null;
    diasSemana?: string[]         // legacy, usar detallesSemanal.dias
    fechasMes?: string[]          // legacy, usar detallesMensual.fechas
    cantidadCiclos?: number
    modo:number
    fechaCiclo?:string
      // ISO date del último domingo que se reseteó
      // ISO date del último día 1 que se reseteó
}
export interface CicloRecord {
    taskId: string
    userId: string
    tipoRepeticion: "week" | "month"
    fechaInicio: string
    fechaFin: string
    diasCompletados: number
    diasMeta: number
    cumplida: boolean
    perdida: boolean
    horasCompletacion: string[]
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
//FUNCIONES TAREAS
    // Calcula el próximo lunes a las 00:00
    function getProximoLunes(desde: Date): string {
        const d = new Date(desde)
        const diaSemana = d.getDay() // 0=dom, 1=lun...
        const diasHastaLunes = diaSemana === 1 ? 7 : (8 - diaSemana) % 7 || 7
        d.setDate(d.getDate() + diasHastaLunes)
        d.setHours(0, 0, 0, 0)
        return d.toISOString()
    }

    // Calcula el próximo día 1 a las 00:00
    function getProximoDia1(desde: Date): string {
        const d = new Date(desde)
        d.setMonth(d.getMonth() + 1)
        d.setDate(1)
        d.setHours(0, 0, 0, 0)
        return d.toISOString()
    }

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
    const DIAS_ORDENADOS = ["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]
    function indiceSemanaLunes(fecha: Date): number {
        const dia = fecha.getDay()
        return dia === 0 ? 6 : dia - 1   // domingo pasa a ser el último día (6)
    }
    const tareas = snapshot.docs.map(doc => doc.data() as TaskInterface)
    for (const tarea of tareas) {
        if (tarea.detallesSemanal?.finSemana) {
             const finSemanaAux = new Date(tarea.detallesSemanal.finSemana);
        }   


        // 1. RESET completadaHoy si no es de hoy
        if (tarea.completadaHoy && tarea.ultimaCompletacion && tarea.tipoRepeticion !== "") {
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
        if(tarea.tipoRepeticion == "week"){
            if (
                tarea.detallesSemanal?.finSemana &&
                hoy > new Date(tarea.detallesSemanal.finSemana)
            ) {
                //Si la semana termino y la fecha actual es mayor a la ultimo dia de la semana que podria hacerlo oesa 
                //lunes a las 00 se realiza la verificacion
                if(tarea.cantidadCiclos===0){
                    //si es su primer ciclo entonces se le suma todo sin importar ya que
                    //si arranco desde el sabado y hizo un dia solo no lo va a perder porque no pudo hacer lo otro
                    //asi que no pasa nada
                    tarea.cantidadCiclos = (tarea.cantidadCiclos ?? 0) + 1;
                    tarea.fechaCiclo = hoy.toISOString()
                    tarea.rachaCiclo = 0
                    //tarea.detallesSemanal.finSemana = getProximoLunes(hoy)
                    tarea.detallesSemanal.finSemana = getProximoLunes(new Date(tarea.detallesSemanal.finSemana))

                    await updateDoc(doc(db, "tasks", tarea.taskId), {
                        cantidadCiclos: tarea.cantidadCiclos,
                        fechaCiclo: tarea.fechaCiclo,
                        rachaCiclo: 0,
                        detallesSemanal: tarea.detallesSemanal
                    })
                }else{
                    if(tarea.rachaCiclo>=tarea.cantidadDias){
                        //aca lo hizo bien y no pasa nada, se le suma un ciclo y se cambia la fecha 
                        tarea.cantidadCiclos = (tarea.cantidadCiclos ?? 0) + 1;
                        tarea.fechaCiclo = hoy.toISOString()
                        tarea.rachaCiclo = 0
                        //tarea.detallesSemanal.finSemana = getProximoLunes(hoy)
                        tarea.detallesSemanal.finSemana = getProximoLunes(new Date(tarea.detallesSemanal.finSemana))
                        await updateDoc(doc(db, "tasks", tarea.taskId), {
                            cantidadCiclos: tarea.cantidadCiclos,
                            fechaCiclo: tarea.fechaCiclo,
                            rachaCiclo: 0,
                            detallesSemanal: tarea.detallesSemanal
                        })

                    }else{
                        tarea.cantidadCiclos = (tarea.cantidadCiclos ?? 0) + 1;
                        tarea.fechaCiclo = hoy.toISOString()
                        tarea.rachaCiclo = 0
                        tarea.rachaActual =0
                        //tarea.detallesSemanal.finSemana = getProximoLunes(hoy)
                        tarea.detallesSemanal.finSemana = getProximoLunes(new Date(tarea.detallesSemanal.finSemana))

                        await updateDoc(doc(db, "tasks", tarea.taskId), {
                            cantidadCiclos: tarea.cantidadCiclos,
                            fechaCiclo: tarea.fechaCiclo,
                            rachaCiclo: 0,
                            rachaActual: 0,
                            detallesSemanal: tarea.detallesSemanal
                })
                    }

                }
                // La semana terminó
            }else{

            }
        }
        if(tarea.tipoRepeticion==="month"){

        }

        // 3. RESET ciclo mensual
        if (tarea.tipoRepeticion === "month") {
            if (
                tarea.detallesMensual?.finMes &&
                hoy > new Date(tarea.detallesMensual.finMes)
            ) {
                if (tarea.cantidadCiclos === 0) {
                    tarea.cantidadCiclos = (tarea.cantidadCiclos ?? 0) + 1
                    tarea.fechaCiclo = hoy.toISOString()
                    tarea.rachaCiclo = 0
                    tarea.detallesMensual.finMes = getProximoDia1(new Date(tarea.detallesMensual.finMes))

                    await updateDoc(doc(db, "tasks", tarea.taskId), {
                        cantidadCiclos: tarea.cantidadCiclos,
                        fechaCiclo: tarea.fechaCiclo,
                        rachaCiclo: 0,
                        detallesMensual: tarea.detallesMensual
                    })
                } else {
                    if (tarea.rachaCiclo >= tarea.cantidadDias) {
                        tarea.cantidadCiclos = (tarea.cantidadCiclos ?? 0) + 1
                        tarea.fechaCiclo = hoy.toISOString()
                        tarea.rachaCiclo = 0
                        tarea.detallesMensual.finMes = getProximoDia1(new Date(tarea.detallesMensual.finMes))

                        await updateDoc(doc(db, "tasks", tarea.taskId), {
                            cantidadCiclos: tarea.cantidadCiclos,
                            fechaCiclo: tarea.fechaCiclo,
                            rachaCiclo: 0,
                            detallesMensual: tarea.detallesMensual
                        })
                    } else {
                        tarea.cantidadCiclos = (tarea.cantidadCiclos ?? 0) + 1
                        tarea.fechaCiclo = hoy.toISOString()
                        tarea.rachaCiclo = 0
                        tarea.rachaActual = 0
                        tarea.detallesMensual.finMes = getProximoDia1(new Date(tarea.detallesMensual.finMes))

                        await updateDoc(doc(db, "tasks", tarea.taskId), {
                            cantidadCiclos: tarea.cantidadCiclos,
                            fechaCiclo: tarea.fechaCiclo,
                            rachaCiclo: 0,
                            rachaActual: 0,
                            detallesMensual: tarea.detallesMensual
                        })
                    }
                }
            }
        }

        // 4. RACHA A 0 si no puede completar el ciclo (solo desde el segundo ciclo)
        if ((tarea.cantidadCiclos ?? 0) > 0 && !tarea.completadaHoy) {
            if (tarea.tipoRepeticion === "week" && tarea.detallesSemanal) {
                const indiceHoy = indiceSemanaLunes(hoy)
                const diasRestantes = tarea.detallesSemanal.dias.filter(dia =>
                    DIAS_ORDENADOS.indexOf(dia) >= indiceHoy
                ).length
                const faltanCompletar = tarea.cantidadDias - (tarea.rachaCiclo ?? 0)
                if (faltanCompletar > diasRestantes) {
                    await updateDoc(doc(db, "tasks", tarea.taskId), { rachaActual: 0 })
                    tarea.rachaActual = 0
                }
            }

            if (tarea.tipoRepeticion === "month" && tarea.detallesMensual) {
                const diasRestantes = tarea.detallesMensual.fechas.filter(fecha =>
                    Number(fecha) >= hoy.getDate()
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

// ── MONEDAS ──────────────────────────────────────────────

export const sumarMonedas = async (cantidad: number) => {
    const currentUser = auth.currentUser
    if (!currentUser) throw new Error("No hay usuario logueado")

    await updateDoc(doc(db, "users", currentUser.uid), { coins: increment(cantidad) })
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

    await setDoc(doc(db, "users", uid), {
        uid,
        email,
        username,
        coins: 100,
        avatarId: 0,
        avataresDesbloqueados: [0], 
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