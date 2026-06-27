"use client"
import { TaskInterface } from "@/app/lib/auth"
import { useState } from "react"

interface Props {
    task: TaskInterface
}

export default function SimpleTask({ task }: Props) {
    const [hover, setHover] = useState(false)

    return (
        <div
            className="relative bg-white/10 rounded-xl px-4 py-3 flex items-center gap-4 cursor-pointer transition-all"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {/* Tipo */}
            <span className="text-xs text-white/40 w-16 shrink-0">
                {task.tipoRepeticion === "week" && "Semanal"}
                {task.tipoRepeticion === "month" && "Mensual"}
                {task.tipoRepeticion === "" && "Unica"}
            </span>

            {/* Título */}
            <p className="text-white font-medium flex-1">{task.titulo}</p>

            {/* Racha */}
            <span className="text-orange-400 font-bold text-sm shrink-0">
                🔥 {task.rachaActual ?? 0}
            </span>

            {/* Tooltip descripción */}
            {hover && task.nota && (
                <div className="absolute left-0 -bottom-12 z-10 bg-black/80 text-white/80 text-xs rounded-lg px-3 py-2 w-full">
                    {task.nota}
                </div>
            )}
        </div>
    )
}