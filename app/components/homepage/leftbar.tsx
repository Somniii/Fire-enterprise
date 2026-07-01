"use client"
import NotGlass from "../styles/notglass";
import notetask from '../../assets/icons/notetask.svg'
import poker from '../../assets/icons/poker.svg'
import task from '../../assets/icons/task.svg'
import threebar from '../../assets/icons/threebar.svg'
import fire from '../../assets/icons/fire.svg'
import human from '../../assets/icons/human.svg'
import profile from '../../assets/icons/profile.svg'
import Pomodoro from "@/app/layouts/pomodoro/page";
import pomodoroSvg from '../../assets/icons/pomodoro.svg'

interface Props {
    opcion: number
    setOpcion: (n: number) => void
}

export default function LeftBar({ opcion, setOpcion }: Props) {
    const btnClass = (id: number) =>
        `flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all w-full text-left ${
            opcion === id
                ? "bg-orange-500/20 text-orange-300"
                : "hover:bg-white/10 text-white/80"
        }`

    return (
        <div className="sticky top-16 h-[calc(100vh-4rem)] w-64 shrink-0 hidden lg:flex justify-start z-20">
            <NotGlass>
                <div className="flex flex-col gap-2 p-6 w-full h-full overflow-y-auto">
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-3 px-4">Menú</p>

                    <button onClick={() => setOpcion(1)} className={btnClass(1)}>
                        <img src={notetask.src} className="w-6 h-6 opacity-80" />
                        <p className="text-base font-medium">Tareas</p>
                    </button>
                    <button onClick={() => setOpcion(2)} className={btnClass(2)}>
                        <img src={threebar.src} className="w-6 h-6 opacity-80" />
                        <p className="text-base font-medium">Ver Todo</p>
                    </button>
                    <button onClick={() => setOpcion(3)} className={btnClass(3)}>
                        <img src={task.src} className="w-6 h-6 opacity-80" />
                        <p className="text-base font-medium">Modificar Tareas</p>
                    </button>

                    <div className="border-t border-white/10 my-3" />
                    <button onClick={() => setOpcion(4)} className={btnClass(4)}>
                        <img src={profile.src} className="w-6 h-6 opacity-80" />
                        <p className="text-base font-medium">Perfil</p>
                    </button>
                    <button onClick={() => setOpcion(5)} className={btnClass(5)}>
                        <img src={pomodoroSvg.src} className="w-6 h-6 opacity-80" />
                        <p className="text-base font-medium">Pomodoro</p>
                    </button>
                    <button onClick={() => setOpcion(6)} className={btnClass(6)}>
                        <img src={poker.src} className="w-6 h-6 opacity-80" />
                        <p className="text-base font-medium">Gacha</p>
                    </button>
                    <button onClick={() => setOpcion(7)} className={btnClass(7)}>
                        <img src={human.src} className="w-6 h-6 opacity-80" />
                        <p className="text-base font-medium">Personaje</p>
                    </button>
                    <button onClick={() => setOpcion(8)} className={btnClass(8)}>
                        <img src={fire.src} className="w-6 h-6 opacity-80" />
                        <p className="text-base font-medium">Metricas</p>
                    </button>
                </div>
            </NotGlass>
        </div>
    )
}