"use client"
import { useState } from "react"
import { TaskInterface, modificarTarea } from "@/app/lib/auth"

interface Props {
    task: TaskInterface
    onGuardado?: () => void
}

const DIAS_SEMANA = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]

export default function ChangeTask({ task, onGuardado }: Props) {
    const [titulo, setTitulo] = useState(task.titulo ?? "")
    const [nota, setNota] = useState(task.nota ?? "")
    const [activa, setActiva] = useState(task.activa ?? true)
    const [tipoRepeticion, setTipoRepeticion] = useState(task.tipoRepeticion ?? "")
    const [diasSemana, setDiasSemana] = useState<string[]>(task.detallesSemanal?.dias ?? [])
    const [diasMes, setDiasMes] = useState<string[]>(task.detallesMensual?.fechas ?? [])
    const [cantidadMeta, setCantidadMeta] = useState(task.cantidadDias ?? 1)
    //Flags mientras espera la respuesta de firebase
    const [guardando, setGuardando] = useState(false)
    const [guardado, setGuardado] = useState(false)


    function toggleDiaSemana(dia: string) {
         //Funcion para cambiar los dias de semana
        setDiasSemana(prev => {
            const nuevo = prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
            //aca se fija si al sacar un dia la meta qiueda mas alta que los dias disponibles la recorta
            if (cantidadMeta > nuevo.length) setCantidadMeta(Math.max(1, nuevo.length))
            return nuevo
        })
    }
    //Misma logica pero para dias del mes
    function toggleDiaMes(dia: string) {
        setDiasMes(prev => {
            const nuevo = prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
            if (cantidadMeta > nuevo.length) setCantidadMeta(Math.max(1, nuevo.length))
            return nuevo
        })
    }
    //Cantidad de dias masrcados segun el tipo de repeticion actual
    const diasDisponibles = tipoRepeticion === "week" ? diasSemana.length : diasMes.length


    //Funcion para enviar cambios a firebase
    async function guardar() {
        setGuardando(true)
        const updates: Partial<TaskInterface> = {
            titulo,
            nota,
            activa,
            tipoRepeticion,
            cantidadDias: cantidadMeta,
            //Dependiendo el tipo de repeticion manda los cambios de semana o de mes
            ...(tipoRepeticion === "week" && {
                detallesSemanal: {
                    dias: diasSemana,
                    cantidadDias: cantidadMeta,
                    finSemana: task.detallesSemanal?.finSemana ?? null,
                },
            }),
            ...(tipoRepeticion === "month" && {
                detallesMensual: {
                    fechas: diasMes,
                    cantidadDias: cantidadMeta,
                    finMes: task.detallesMensual?.finMes ?? null,
                },
            }),

        }
        //llamada a firestore
        await modificarTarea(task.taskId, updates)
        setGuardando(false)
        setGuardado(true)
        setTimeout(() => setGuardado(false), 2000)
        onGuardado?.()
    }

    const inputClass = "w-full bg-white border border-neutral-300 rounded-xl px-4 py-2 text-black text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 transition-all"
    const labelClass = "text-xs text-neutral-400 uppercase tracking-widest mb-1"
    
    return (
        <div className="flex flex-col gap-5 p-6 bg-white text-black">

            <div className="flex flex-col gap-1">
                <p className={labelClass}>Nombre</p>
                <input
                    className={inputClass}
                    value={titulo}
                    onChange={e => setTitulo(e.target.value)}
                    placeholder="Nombre de la tarea"
                />
            </div>

            <div className="flex flex-col gap-1">
                <p className={labelClass}>Descripción</p>
                <textarea
                    className={inputClass + " resize-none h-20"}
                    value={nota}
                    onChange={e => setNota(e.target.value)}
                    placeholder="Descripción opcional"
                />
            </div>

            <div className="flex flex-col gap-2">
                <p className={labelClass}>Tipo de repetición</p>
                <div className="flex gap-2">
                    {[
                        { valor: "",      label: "Una vez" },
                        { valor: "week",  label: "Semanal" },
                        { valor: "month", label: "Mensual" },
                    ].map(op => (
                        <button
                            key={op.valor}
                            onClick={() => setTipoRepeticion(op.valor)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                tipoRepeticion === op.valor
                                    ? "bg-orange-400 text-white border border-orange-400"
                                    : "bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200"
                            }`}
                        >
                            {op.label}
                        </button>
                    ))}
                </div>
            </div>

            {tipoRepeticion === "week" && (
                <div className="flex flex-col gap-2">
                    <p className={labelClass}>Días de la semana</p>
                    <div className="flex flex-wrap gap-2">
                        {DIAS_SEMANA.map(dia => (
                            <button
                                key={dia}
                                onClick={() => toggleDiaSemana(dia)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                                    diasSemana.includes(dia)
                                        ? "bg-orange-400 text-white border border-orange-400"
                                        : "bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200"
                                }`}
                            >
                                {dia}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {tipoRepeticion === "month" && (
                <div className="flex flex-col gap-2">
                    <p className={labelClass}>Días del mes</p>
                    <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 31 }, (_, i) => (i + 1).toString()).map(dia => (
                            <button
                                key={dia}
                                onClick={() => toggleDiaMes(dia)}
                                className={`w-9 h-9 rounded-lg text-xs font-medium transition-all ${
                                    diasMes.includes(dia)
                                        ? "bg-orange-400 text-white border border-orange-400"
                                        : "bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200"
                                }`}
                            >
                                {dia}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Cantidad de días meta — solo si hay días seleccionados */}
            {(tipoRepeticion === "week" || tipoRepeticion === "month") && diasDisponibles > 0 && (
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                        <p className={labelClass}>Días mínimos por ciclo</p>
                        <span className="text-xs text-orange-500 font-medium">{cantidadMeta} / {diasDisponibles}</span>
                    </div>
                    <input
                        type="range"
                        min={1}
                        max={diasDisponibles}
                        value={cantidadMeta}
                        onChange={e => setCantidadMeta(Number(e.target.value))}
                        className="w-full accent-orange-400"
                    />
                    <div className="flex justify-between text-xs text-neutral-400">
                        <span>1</span>
                        <span>{diasDisponibles}</span>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-3">
                <p className="text-sm text-neutral-600">Tarea activa</p>
                <button
                    onClick={() => setActiva(prev => !prev)}
                    className={`w-12 h-6 rounded-full transition-all relative ${
                        activa ? "bg-orange-400" : "bg-neutral-300"
                    }`}
                >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        activa ? "left-7" : "left-1"
                    }`} />
                </button>
            </div>

            <button
                onClick={guardar}
                disabled={guardando}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    guardado
                        ? "bg-green-100 text-green-600 border border-green-300"
                        : "bg-orange-400 text-white border border-orange-400 hover:bg-orange-500"
                }`}
            >
                {guardando ? "Guardando..." : guardado ? "✓ Guardado" : "Guardar cambios"}
            </button>
        </div>
    )
}