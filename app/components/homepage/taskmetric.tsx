"use client"
import { TaskInterface } from "@/app/lib/auth"
import fireOrangeSvg from '../../assets/icons/fire-orange.svg'
import fireGraySvg from '../../assets/icons/fire-gray.svg'
import fireBlue from '../../assets/icons/fire-blue.svg'

interface CicloRecord {
    fechaInicio: string
    diasCompletados: number
    diasMeta: number
    cumplida: boolean
    perdida: boolean
    horasCompletacion: string[]
}

interface Props {
    task: TaskInterface
    historial: CicloRecord[] // ya viene ordenado del más viejo al más nuevo
}

function calcularHoraPromedio(historial: CicloRecord[]): string | null {
    const minutos: number[] = []

    historial.forEach(ciclo => {
        ciclo.horasCompletacion.forEach(iso => {
            const fecha = new Date(iso)
            minutos.push(fecha.getHours() * 60 + fecha.getMinutes())
        })
    })

    if (minutos.length === 0) return null

    const promedio = minutos.reduce((acc, m) => acc + m, 0) / minutos.length
    const horas = Math.floor(promedio / 60)
    const mins = Math.round(promedio % 60)

    return `${horas.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
}

export default function TaskMetrics({ task, historial }: Props) {
    const esMensual = task.tipoRepeticion === "month"
    const cantidadVentana = esMensual ? 6 : 8
    const ventana = historial.slice(-cantidadVentana)

    const totalCiclos = historial.length
    const cumplidos = historial.filter(c => c.cumplida)
    const perdidos = historial.filter(c => c.perdida)
    const fallados = historial.filter(c => !c.cumplida && !c.perdida)

    const porcentajeExito = totalCiclos > 0
        ? Math.round((cumplidos.length / totalCiclos) * 100)
        : 0

    const horaPromedio = calcularHoraPromedio(historial)

    return (
        <div className="bg-white rounded-xl p-6 w-full space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-black text-lg font-semibold">{task.titulo}</h3>
                <span className="text-sm text-neutral-500">
                    {esMensual ? "Métricas mensuales" : "Métricas semanales"}
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <MetricaCard
                    label={esMensual ? "Meses perfectos" : "Semanas perfectas"}
                    valor={cumplidos.length}
                />
                <MetricaCard label="Veces completada" valor={cumplidos.length} />
                <MetricaCard label="Veces fallada" valor={fallados.length} />
                <MetricaCard label="Ciclos perdidos" valor={perdidos.length} />
                <MetricaCard label="Porcentaje de éxito" valor={`${porcentajeExito}%`} />
                <MetricaCard
                    label="Hora promedio"
                    valor={horaPromedio ?? "Sin datos"}
                />
            </div>

            <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-500">
                    {esMensual ? "Últimos 6 meses" : "Últimas 8 semanas"}
                </p>
                <div className="flex items-end gap-2 h-24">
                    {ventana.length === 0 && (
                        <p className="text-neutral-400 text-sm italic">
                            Todavía no hay historial para esta tarea
                        </p>
                    )}
                    {ventana.map((ciclo, indice) => {
                        const porcentaje = ciclo.diasMeta > 0
                            ? Math.min(100, (ciclo.diasCompletados / ciclo.diasMeta) * 100)
                            : 0

                        const color = ciclo.perdida
                            ? fireGraySvg.src
                            : ciclo.cumplida
                                ? fireOrangeSvg.src
                                : fireBlue.src

                        const bgColor = ciclo.perdida
                            ? "bg-neutral-200"
                            : ciclo.cumplida
                                ? "bg-orange-400"
                                : "bg-blue-300"

                        return (
                            <div key={indice} className="flex flex-col items-center gap-1 flex-1">
                                <div className="w-full h-16 flex items-end bg-neutral-100 rounded">
                                    <div
                                        className={`${bgColor} w-full rounded`}
                                        style={{ height: `${porcentaje}%` }}
                                    />
                                </div>
                                <img src={color} className="w-3 h-3" alt="estado ciclo" />
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

function MetricaCard({ label, valor }: { label: string; valor: string | number }) {
    return (
        <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-neutral-500 text-xs">{label}</p>
            <p className="text-black text-xl font-semibold">{valor}</p>
        </div>
    )
}