"use client"
import CreateTask from "./createtask"
import { useState, useEffect, useCallback } from "react";
import { obtenerTareas, TaskInterface } from "@/app/lib/auth";
import Task from "./task"


export default function TaskList() {
    const [tareas, setTareas] = useState<TaskInterface[]>([])

    const cargar = useCallback(async () => {
        const data = await obtenerTareas()
        setTareas(data)
    }, [])

    useEffect(() => {
        cargar()
    }, [cargar])


    const [tareasMostrar, setTareasMostrar ] = useState<TaskInterface[]>([])
    //hacemos un useeffect para que solo se ejecute cuando tareas cambie
    useEffect(()=>{
        const DIAS_ORDENADOS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]
        const diaActual = new Date()
        const nombreDiaActualSemana = DIAS_ORDENADOS[diaActual.getDay()]
        const nombreDiaActualMes = diaActual.getDate().toString()
        const tareasFiltradas = tareas.filter(tarea =>{
            let esDeHoy = false
            const esActiva = tarea.activa ===true;
            //ESTO ES SOLO SEMANA FALTA MES
            const diaSemanaBien = tarea.detallesSemanal?.dias.includes(nombreDiaActualSemana);
            const diaActualMesBien = tarea.detallesMensual?.fechas.includes(nombreDiaActualMes)
            const tipoSiempre = tarea.tipoRepeticion === ""
            console.log(`compara ${tarea.detallesMensual?.fechas?.join(", ") || "Ninguno"} con ${nombreDiaActualMes}`)
            if(diaSemanaBien || diaActualMesBien || tipoSiempre){
                esDeHoy = true
            }
            return esActiva && esDeHoy
        })
        setTareasMostrar(tareasFiltradas)
        
        if(tareasMostrar.length===0){
            //alert("es nulo")
        }
    }  ,[tareas]) //esto le decis que se ejecute cuando tareas cambie
    
    return (
        <>
            <div>
                <CreateTask onTareaCreada={cargar} />
                {tareasMostrar.map((tarea)=>(
                    <Task
                        key={tarea.taskId}
                        task={tarea}
                    >

                    </Task>
                ))}
                
            </div>
        </>
    )
}