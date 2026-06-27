"use client"
import { useState, useEffect, useCallback } from "react"
import { obtenerTareas, TaskInterface } from "@/app/lib/auth"
import fireOrangeSvg from '../../assets/icons/fire-orange.svg'
import fireGraySvg from '../../assets/icons/fire-gray.svg'
import fireBlue from '../../assets/icons/fire-blue.svg'

export default function VerRacha() {
    const [tareas, setTareas] = useState<TaskInterface[]>([])

    const cargar = useCallback(async () => {
        const data = await obtenerTareas()
        setTareas(data)
    }, [])

    useEffect(() => { cargar() }, [cargar])

    const activas = tareas.filter(t => t.activa)
    const mejorRachaGeneral = Math.max(0, ...tareas.map(t => t.mejorRacha ?? 0))
    const rachasSumadas = tareas.reduce((acc, t) => acc + (t.rachaActual ?? 0), 0)
    const completadasHoy = tareas.filter(t => t.completadaHoy).length
    const totalHoy = tareas.filter(t => t.activa).length

    const tareasOrdenadas = [...activas].sort((a, b) => (b.rachaActual ?? 0) - (a.rachaActual ?? 0))

    const StatCard = ({ label, valor, sub }: { label: string, valor: string | number, sub?: string }) => (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
            <p className="text-xs text-white/40 uppercase tracking-widest">{label}</p>
            <p className="text-3xl font-bold text-white">{valor}</p>
            {sub && <p className="text-xs text-white/30">{sub}</p>}
        </div>
    )

    function getFuego(tarea: TaskInterface) {
        if ((tarea.rachaActual ?? 0) === 0) return fireGraySvg.src
        if ((tarea.rachaActual ?? 0) > (tarea.mejorRacha ?? 0)) return fireBlue.src
        return fireOrangeSvg.src
    }

    return (
        <div className="flex flex-col gap-8 p-6 text-white">

            <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Resumen</p>
                <div className="grid grid-cols-2 gap-3">
                    <StatCard
                        label="Completadas hoy"
                        valor={`${completadasHoy} / ${totalHoy}`}
                        sub="tareas activas"
                    />
                    <StatCard
                        label="Mejor racha"
                        valor={mejorRachaGeneral}
                        sub="días consecutivos"
                    />
                    <StatCard
                        label="Rachas activas"
                        valor={activas.filter(t => (t.rachaActual ?? 0) > 0).length}
                        sub={`de ${activas.length} tareas`}
                    />
                    <StatCard
                        label="Total acumulado"
                        valor={rachasSumadas}
                        sub="días entre todas"
                    />
                </div>
            </div>

            <div>
                <div className="flex items-center gap-3 mb-4">
                    <p className="text-xs text-white/40 uppercase tracking-widest">Ranking de rachas</p>
                    <div className="flex-1 border-t border-white/10" />
                </div>

                <div className="flex flex-col gap-2">
                    {tareasOrdenadas.map((tarea, i) => (
                        <div key={tarea.taskId} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                            <span className="text-white/30 text-sm w-5 text-center">{i + 1}</span>
                            <div className="flex-1">
                                <p className="text-white text-sm font-medium">{tarea.titulo}</p>
                                <p className="text-white/30 text-xs">
                                    {tarea.tipoRepeticion === "week" ? "Semanal" :
                                     tarea.tipoRepeticion === "month" ? "Mensual" : "Una vez"}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <img src={getFuego(tarea)} className="w-4 h-4" />
                                <span className="text-white font-bold text-sm">{tarea.rachaActual ?? 0}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-white/30 text-xs">mejor</p>
                                <p className="text-white/50 text-sm">{tarea.mejorRacha ?? 0}</p>
                            </div>
                        </div>
                    ))}

                    {tareasOrdenadas.length === 0 && (
                        <p className="text-white/20 text-sm px-1">No hay tareas activas</p>
                    )}
                </div>
            </div>
        </div>
    )
}