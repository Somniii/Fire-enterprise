"use client"
import { useState, useEffect, useCallback, useRef } from "react";
import { obtenerTareas, TaskInterface } from "@/app/lib/auth";
import Task from "./simpleTask"

const DIAS_ORDENADOS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]
const DIAS_DISPLAY = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

const DIAS_POR_CARGA = 7

function filtrarTareasPorDia(tareas: TaskInterface[], fecha: Date): TaskInterface[] {
    const nombreDia = DIAS_ORDENADOS[fecha.getDay()]
    const numeroDiaMes = fecha.getDate().toString()

    return tareas.filter(tarea => {
        const esActiva = tarea.activa === true
        const esSemanal = tarea.tipoRepeticion === "week" && tarea.detallesSemanal?.dias.includes(nombreDia)
        const esMensual = tarea.tipoRepeticion === "month" && tarea.detallesMensual?.fechas.includes(numeroDiaMes)
        const esSiempre = tarea.tipoRepeticion === ""
        return esActiva && (esSemanal || esMensual || esSiempre)
    })
}

function getLabelDia(fecha: Date, esHoy: boolean): string {
    const dia = DIAS_DISPLAY[fecha.getDay()]
    const numeroDia = fecha.getDate()
    const mes = fecha.toLocaleString("es-AR", { month: "long" })
    return `${esHoy ? "Hoy — " : ""}${dia} ${numeroDia} de ${mes}`
}

export default function InfiniteTaskList() {
    const [tareas, setTareas] = useState<TaskInterface[]>([])
    const [cantidadDias, setCantidadDias] = useState(DIAS_POR_CARGA)
    const [cargando, setCargando] = useState(false)
    const loaderRef = useRef<HTMLDivElement>(null)
    const hoy = useRef(new Date())

    const cargar = useCallback(async () => {
        const data = await obtenerTareas()
        setTareas(data)
    }, [])

    useEffect(() => {
        cargar()
    }, [cargar])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !cargando) {
                    setCargando(true)
                    setTimeout(() => {
                        setCantidadDias(prev => prev + DIAS_POR_CARGA)
                        setCargando(false)
                    }, 300)
                }
            },
            { threshold: 0.1 }
        )

        if (loaderRef.current) observer.observe(loaderRef.current)
        return () => observer.disconnect()
    }, [cargando])

    const dias = Array.from({ length: cantidadDias }, (_, i) => {
        const fecha = new Date(hoy.current)
        fecha.setDate(hoy.current.getDate() + i)
        return {
            fecha,
            label: getLabelDia(fecha, i === 0),
            tareas: filtrarTareasPorDia(tareas, fecha)
        }
    })

    return (
        <div className="flex flex-col gap-6">
            {dias.map((dia, i) => (
                <div key={i}>
                    <div className="
                        w-[66rem]
                        ml-[1rem]
                        h-12
                        flex
                        items-center
                        px-6
                        rounded-xl
                        bg-neutral-100
                        font-semibold
                        text-neutral-700
                        text-sm
                        uppercase
                        tracking-widest
                        shadow-sm
                        border
                        mb-3
                    ">
                        {dia.label}
                    </div>

                    {dia.tareas.length === 0 ? (
                        <p className="text-neutral-400 text-sm px-6 ml-[1rem]">Sin tareas</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {dia.tareas.map(tarea => (
                                <Task key={tarea.taskId} task={tarea} />
                            ))}
                        </div>
                    )}
                </div>
            ))}

            <div ref={loaderRef} className="py-4 text-center">
                {cargando && <p className="text-neutral-400 text-sm">Cargando más días...</p>}
            </div>
        </div>
    )
}