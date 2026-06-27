"use client"
import { useState, useEffect, useCallback } from "react"
import { obtenerTareas, TaskInterface } from "@/app/lib/auth"
import SimpleTask from "./simpleTask"
import ChangeTask from "./changeTask"

export default function ModificarTareas() {
    const [tareas, setTareas] = useState<TaskInterface[]>([])
    const [tareaSeleccionada, setTareaSeleccionada] = useState<TaskInterface | null>(null)

    const cargar = useCallback(async () => {
        const data = await obtenerTareas()
        setTareas(data)
    }, [])

    useEffect(() => {
        cargar()
    }, [cargar])

    const semanales = tareas.filter(t => t.tipoRepeticion === "week")
    const mensuales = tareas.filter(t => t.tipoRepeticion === "month")
    const unaVez    = tareas.filter(t => t.tipoRepeticion === "")

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
                lista.map(tarea => (
                    <div key={tarea.taskId} onClick={() => setTareaSeleccionada(tarea)} className="cursor-pointer">
                        <SimpleTask task={tarea} />
                    </div>
                ))
            )}
        </div>
    )

    return (
        <div className="flex flex-col gap-8 p-6">
            <Seccion titulo="Semanales" lista={semanales} />
            <Seccion titulo="Mensuales" lista={mensuales} />
            <Seccion titulo="Una sola vez" lista={unaVez} />

            {/* Modal */}
            {tareaSeleccionada && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
                    onClick={() => setTareaSeleccionada(null)}
                >
                    <div
                        className="bg-white/10 border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-6 pt-5 pb-2">
                            <p className="text-white font-semibold">Editar tarea</p>
                            <button
                                onClick={() => setTareaSeleccionada(null)}
                                className="text-white/40 hover:text-white transition-all text-lg"
                            >
                                ✕
                            </button>
                        </div>
                        <ChangeTask
                            task={tareaSeleccionada}
                            onGuardado={() => {
                                setTareaSeleccionada(null)
                                cargar()
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}