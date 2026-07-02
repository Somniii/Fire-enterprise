"use client"
import { TaskInterface } from "@/app/lib/auth"
import { modificarTarea } from "@/app/lib/auth"
import { useState } from "react"
import fireOrangeSvg from '../../assets/icons/fire-orange.svg'
import fireGraySvg from '../../assets/icons/fire-gray.svg'
import checkbox from '../../assets/icons/check-box.svg'
import checkboxCheck from '../../assets/icons/check-box-check.svg'
import CalendarView from "./calendarview"

interface Props {
    task: TaskInterface
    onToggleCompletada?: (taskId: string, completada: boolean) => void
}

const DIAS_ORDENADOS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]

export default function SimpleTask({ task, onToggleCompletada }: Props) {
    const [hover, setHover] = useState(false)
    const [rachaActual, setRachaActual] = useState(task.rachaActual ?? 0)
    const [rachaCiclo, setRachaCiclo] = useState(task.rachaCiclo ?? 0)
    const [hoyHecho, setHoyHecho] = useState(task.completadaHoy)

    const tienePanelExpandible = task.tipoRepeticion !== "" || task.nota !== ""

    return (
        <div
            className="relative
                    hover:shadow-xl
                    hover:scale-[1.01]
                    transition-all
                    duration-200
                    mt-[1rem]
            "
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            
        >
            <div
                className={`
                    bg-white
                    w-[66rem]
                    ml-[1rem]
                    h-[3rem]
                    px-4
                    flex
                    items-center
                    gap-4
                    shadow-sm
                    ${hover && tienePanelExpandible ? "rounded-t-xl" : "rounded-xl"}
                    ${!task.activa ? "opacity-60" : ""}
                `}
            >

                {/* Tipo */}
                <span className="text-xs text-neutral-400 w-14 shrink-0">
                    {task.tipoRepeticion === "week" && "Semanal"}
                    {task.tipoRepeticion === "month" && "Mensual"}
                    {task.tipoRepeticion === "" && "Única"}
                </span>

                {/* Estado activa/inactiva */}
                <span
                    className={`
                        text-xs
                        font-medium
                        px-2
                        py-0.5
                        rounded-full
                        shrink-0
                        ${task.activa
                            ? "bg-green-100 text-green-700"
                            : "bg-neutral-200 text-neutral-500"
                        }
                    `}
                >
                    {task.activa ? "Activa" : "Inactiva"}
                </span>

                {/* Título */}
                <p className="text-black font-medium flex-1">{task.titulo}</p>

                {/* Racha */}
                {task.tipoRepeticion!="" &&(

                    <span className="flex items-center gap-1 shrink-0">
                        <img
                            src={hoyHecho ? fireOrangeSvg.src : fireGraySvg.src}
                            className="w-4 h-4"
                            alt="racha"
                        />
                        <p className="text-black font-semibold text-sm">{rachaActual}</p>
                    </span>
                )}

            
            
            
            </div>

            {/* Panel expandible al hover: días de repetición + nota/calendario */}
            {hover && tienePanelExpandible && (
                <div
                    className={`
                        bg-white
                        w-[66rem]
                        ml-[1rem]
                        rounded-b-xl
                        flex
                        px-6
                        py-3
                        shadow-sm
                        ${
                            task.tipoRepeticion === "week"
                                ? "h-[5rem]"
                                : task.tipoRepeticion === "month"
                                ? "h-[12rem]"
                                : "h-[3rem]"
                        }
                    `}
                >
                    <div className="w-full">
                        {task.tipoRepeticion === "week" && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-neutral-500">Días de repetición:</p>
                                    <div className="flex gap-1.5">
                                        {(task.detallesSemanal?.dias ?? []).map((dia, indice) => (
                                            <span
                                                key={indice}
                                                className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium capitalize"
                                            >
                                                {dia}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {task.nota && (
                                    <p className="text-black text-sm">{task.nota}</p>
                                )}
                            </div>
                        )}

                        {task.tipoRepeticion === "month" && (
                            <div className="flex gap-8">
                                <div className="w-[40%] space-y-1">
                                    <p className="text-sm font-medium text-neutral-500">Nota:</p>
                                    {task.nota ? (
                                        <p className="text-black text-sm">{task.nota}</p>
                                    ) : (
                                        <p className="text-neutral-400 text-sm italic">Sin nota</p>
                                    )}
                                </div>

                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-neutral-500">Días del mes que podés completarla:</p>
                                    <CalendarView
                                        fechas={task.detallesMensual?.fechas.map(Number) ?? []}
                                    />
                                </div>
                            </div>
                        )}

                        {task.tipoRepeticion === "" && task.nota && (
                            <p className="text-black text-sm">{task.nota}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}