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

    return (
        <>
            <div>
                <CreateTask onTareaCreada={cargar} />
                {tareas.map((tarea)=>(
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