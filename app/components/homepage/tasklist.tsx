"use client"
import CreateTask from "./createtask"
import { useState, useEffect, useCallback } from "react";
import { obtenerTareas, TaskInterface } from "@/app/lib/auth";
import Task from "./task"
import BarraTaskBlock from "./barraTaskBlock";


export default function TaskList() {
    const [tareas, setTareas] = useState<TaskInterface[]>([])

    const cargar = useCallback(async () => {
        const data = await obtenerTareas()
        setTareas(data)
    }, [])

    useEffect(() => {
        cargar()
    }, [cargar])

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

    return (
        <div className="w-full flex justify-center px-4">
            <div className="w-full max-w-[66rem] flex flex-col">
                <BarraTaskBlock />
                <CreateTask onTareaCreada={cargar} />
                {tareasMostrar.map((tarea) => (
                    <Task
                        key={tarea.taskId}
                        task={tarea}
                    />
                ))}
            </div>
        </div>
    )
}