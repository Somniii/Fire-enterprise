"use client"
import { useState, useEffect, useCallback } from "react"
import { obtenerTareas, TaskInterface } from "@/app/lib/auth"
import fireOrangeSvg from '../../assets/icons/fire-orange.svg'
import fireGraySvg from '../../assets/icons/fire-gray.svg'
import fireBlue from '../../assets/icons/fire-blue.svg'

type Vista = "general" | "semanal" | "mensual"

function formatearFechaRelativa(iso: string | null): string {
    if (!iso) return "Nunca"
    const fecha = new Date(iso)
    const ahora = new Date()
    const esHoy =
        fecha.getFullYear() === ahora.getFullYear() &&
        fecha.getMonth() === ahora.getMonth() &&
        fecha.getDate() === ahora.getDate()

    const hora = fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })

    if (esHoy) return `Hoy a las ${hora}`

    const ayer = new Date(ahora)
    ayer.setDate(ayer.getDate() - 1)
    const esAyer =
        fecha.getFullYear() === ayer.getFullYear() &&
        fecha.getMonth() === ayer.getMonth() &&
        fecha.getDate() === ayer.getDate()

    if (esAyer) return `Ayer a las ${hora}`

    const diffMs = ahora.getTime() - fecha.getTime()
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    return `Hace ${diffDias} día${diffDias !== 1 ? "s" : ""}`
}

export default function VerRacha() {
    const [tareas, setTareas] = useState<TaskInterface[]>([])
    const [vista, setVista] = useState<Vista>("general")

    const cargar = useCallback(async () => {
        const data = await obtenerTareas()
        setTareas(data)
    }, [])

    useEffect(() => { cargar() }, [cargar])

    const activas = tareas.filter(t => t.activa)
    const mejorRachaGeneral = Math.max(0, ...tareas.map(t => t.mejorRacha ?? 0))
    const rachaActualMasLarga = Math.max(0, ...tareas.map(t => t.rachaActual ?? 0))
    const completadasHoy = tareas.filter(t => t.completadaHoy).length
    const totalHoy = tareas.filter(t => t.activa).length

    const tareaMasConstante = [...activas]
        .sort((a, b) => (b.rachaActual ?? 0) - (a.rachaActual ?? 0))[0]

    const tareaDescuidada = [...activas]
        .filter(t => !t.completadaHoy)
        .sort((a, b) => {
            const fechaA = a.ultimaCompletacion ? new Date(a.ultimaCompletacion).getTime() : 0
            const fechaB = b.ultimaCompletacion ? new Date(b.ultimaCompletacion).getTime() : 0
            return fechaA - fechaB
        })[0]

    function rankingPorTipo(tipo?: "week" | "month") {
        const base = tipo ? activas.filter(t => t.tipoRepeticion === tipo) : activas
        return [...base].sort((a, b) => (b.rachaActual ?? 0) - (a.rachaActual ?? 0))
    }

    function getFuego(tarea: TaskInterface) {
        if ((tarea.rachaActual ?? 0) === 0) return fireGraySvg.src
        if ((tarea.rachaActual ?? 0) > (tarea.mejorRacha ?? 0)) return fireBlue.src
        return fireOrangeSvg.src
    }

    const StatCard = ({ label, valor, sub }: { label: string, valor: string | number, sub?: string }) => (
        <div className="bg-white rounded-xl p-4 flex flex-col gap-1 hover:shadow-xl hover:scale-[1.01] transition-all duration-200">
            <p className="text-xs text-neutral-400 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-bold text-black">{valor}</p>
            {sub && <p className="text-xs text-neutral-400">{sub}</p>}
        </div>
    )

    const RankingLista = ({ lista }: { lista: TaskInterface[] }) => (
        <div className="flex flex-col gap-2">
            {lista.map((tarea, i) => (
                <div
                    key={tarea.taskId}
                    className="flex items-center gap-4 bg-white rounded-xl px-4 py-3 hover:shadow-xl hover:scale-[1.01] transition-all duration-200"
                >
                    <span className="text-neutral-300 text-sm w-5 text-center">{i + 1}</span>
                    <div className="flex-1">
                        <p className="text-black text-sm font-medium">{tarea.titulo}</p>
                        <p className="text-neutral-400 text-xs">
                            {tarea.tipoRepeticion === "week" ? "Semanal" :
                             tarea.tipoRepeticion === "month" ? "Mensual" : "Una vez"}
                            {" · "}
                            {formatearFechaRelativa(tarea.ultimaCompletacion)}
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        <img src={getFuego(tarea)} className="w-4 h-4" alt="racha" />
                        <span className="text-black font-bold text-sm">{tarea.rachaActual ?? 0}</span>
                    </div>
                    <div className="text-right">
                        <p className="text-neutral-400 text-xs">mejor</p>
                        <p className="text-neutral-500 text-sm">{tarea.mejorRacha ?? 0}</p>
                    </div>
                </div>
            ))}
            {lista.length === 0 && (
                <p className="text-white/20 text-sm px-1">No hay tareas activas</p>
            )}
        </div>
    )

    const SeccionTitulo = ({ texto, count }: { texto: string, count?: number }) => (
        <div className="flex items-center gap-3">
            <p className="text-xs text-white/40 uppercase tracking-widest">{texto}</p>
            <div className="flex-1 border-t border-white/10" />
            {count !== undefined && <span className="text-xs text-white/30">{count}</span>}
        </div>
    )

    return (
        <div className="w-full flex justify-center px-4 py-6">
            <div className="w-full max-w-[66rem] flex flex-col gap-8">

                <div className="flex gap-2 bg-neutral-100 p-1 rounded-lg w-fit">
                    {(["general", "semanal", "mensual"] as Vista[]).map(v => (
                        <label
                            key={v}
                            className={`
                                flex items-center justify-center
                                px-4 py-2
                                rounded-md
                                text-sm font-medium
                                capitalize
                                cursor-pointer
                                transition-all duration-200
                                ${vista === v
                                    ? "bg-orange-400 text-white shadow-sm"
                                    : "text-neutral-600 hover:bg-neutral-200"
                                }
                            `}
                        >
                            <input
                                type="radio"
                                name="vista"
                                checked={vista === v}
                                onChange={() => setVista(v)}
                                className="hidden"
                            />
                            {v}
                        </label>
                    ))}
                </div>

                {vista === "general" && (
                    <>
                        <div className="flex flex-col gap-3">
                            <SeccionTitulo texto="Resumen General" />
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <StatCard label="🔥 Racha actual más larga" valor={rachaActualMasLarga} sub="días consecutivos" />
                                <StatCard label="🏆 Mejor racha histórica" valor={mejorRachaGeneral} sub="días consecutivos" />
                                <StatCard
                                    label="Completadas hoy"
                                    valor={`${completadasHoy} / ${totalHoy}`}
                                    sub="tareas activas"
                                />
                                <StatCard
                                    label="Hábito más constante"
                                    valor={tareaMasConstante ? tareaMasConstante.titulo : "Sin datos"}
                                    sub={tareaMasConstante ? `${tareaMasConstante.rachaActual ?? 0} días seguidos` : undefined}
                                />
                                <StatCard
                                    label="Necesita atención"
                                    valor={tareaDescuidada ? tareaDescuidada.titulo : "Todo al día"}
                                    sub={tareaDescuidada ? formatearFechaRelativa(tareaDescuidada.ultimaCompletacion) : undefined}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <SeccionTitulo texto="Ranking de rachas" count={rankingPorTipo().length} />
                            <RankingLista lista={rankingPorTipo()} />
                        </div>
                    </>
                )}

                {vista === "semanal" && (
                    <div className="flex flex-col gap-3">
                        <SeccionTitulo texto="Ranking de rachas semanal" count={rankingPorTipo("week").length} />
                        <RankingLista lista={rankingPorTipo("week")} />
                    </div>
                )}

                {vista === "mensual" && (
                    <div className="flex flex-col gap-3">
                        <SeccionTitulo texto="Ranking de rachas mensual" count={rankingPorTipo("month").length} />
                        <RankingLista lista={rankingPorTipo("month")} />
                    </div>
                )}
            </div>
        </div>
    )
}