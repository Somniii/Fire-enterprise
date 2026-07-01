"use client"
import CreateTask from "./createtask"
import { useState, useEffect, useCallback, useMemo } from "react";
import { obtenerTareas, TaskInterface } from "@/app/lib/auth";
import Task from "./task"
import BarraTaskBlock from "./barraTaskBlock";


export default function TaskList() {
    const [tareas, setTareas] = useState<TaskInterface[]>([])
    const hoy = new Date()
    const cargar = useCallback(async () => {
        const data = await obtenerTareas()
        setTareas(data)
    }, [])

    useEffect(() => {
        cargar()
    }, [cargar])

    const DIAS_DISPLAY = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado"
    ]

    const labelHoy = `Hoy — ${DIAS_DISPLAY[hoy.getDay()]} ${hoy.getDate()} de ${hoy.toLocaleString(
        "es-AR",
        { month: "long" }
    )}`
    
    const handleToggleCompletada = useCallback((taskId: string, updates: Partial<TaskInterface>) => {
        setTareas(prev =>
            prev.map(t => t.taskId === taskId ? { ...t, ...updates } : t)
        )
    }, [])

    const [tareasMostrar, setTareasMostrar] = useState<TaskInterface[]>([])

    useEffect(() => {
        const DIAS_ORDENADOS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]
        const diaActual = new Date()
        const nombreDiaActualSemana = DIAS_ORDENADOS[diaActual.getDay()]
        const nombreDiaActualMes = diaActual.getDate().toString()
        const tareasFiltradas = tareas.filter(tarea => {
            let esDeHoy = false
            const esActiva = tarea.activa === true;
            const diaSemanaBien = tarea.detallesSemanal?.dias.includes(nombreDiaActualSemana);
            const diaActualMesBien = tarea.detallesMensual?.fechas.includes(nombreDiaActualMes)
            const tipoSiempre = tarea.tipoRepeticion === ""
            if (diaSemanaBien || diaActualMesBien || tipoSiempre) {
                esDeHoy = true
            }
            return esActiva && esDeHoy
        })
        setTareasMostrar(tareasFiltradas)
    }, [tareas])

    //separamos en dos grupos en vez de un solo sort
    const pendientes = useMemo(
        () => tareasMostrar.filter(t => !t.completadaHoy),
        [tareasMostrar]
    )
    const completadas = useMemo(
        () => tareasMostrar.filter(t => t.completadaHoy),
        [tareasMostrar]
    )

    const Seccion = ({ titulo, lista }: { titulo: string, lista: TaskInterface[] }) => (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <p className="text-xs text-white/40 uppercase tracking-widest">{titulo}</p>
                <div className="flex-1 border-t border-white/10" />
                <span className="text-xs text-white/30">{lista.length}</span>
            </div>
            {lista.length === 0 ? (
                <p className="text-white/20 text-sm px-1">Sin tareas</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {lista.map(tarea => (
                        <Task
                            key={tarea.taskId}
                            task={tarea}
                            onToggleCompletada={handleToggleCompletada}
                        />
                    ))}
                </div>
            )}
        </div>
    )

    return (
        <div className="w-full flex justify-center px-4 py-6">
            <div className="w-full max-w-[66rem] flex flex-col gap-8">
                <BarraTaskBlock />
                <CreateTask onTareaCreada={cargar} />

                <Seccion titulo="Pendientes" lista={pendientes} />
                <Seccion titulo="Completadas" lista={completadas} />
            </div>
        </div>
    )
}