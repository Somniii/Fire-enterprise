"use client"
import NotGlass from "../styles/notglass";
import notetask from '../../assets/icons/notetask.svg'
import poker from '../../assets/icons/poker.svg'
import task from '../../assets/icons/task.svg'
import threebar from '../../assets/icons/threebar.svg'
import fire from '../../assets/icons/fire.svg'
import human from '../../assets/icons/human.svg'

interface Props {
    opcion: number
    setOpcion: (n: number) => void
}

export default function LeftBar({ opcion, setOpcion }: Props) {
    const btnClass = (id: number) =>
        `flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all w-full text-left ${
            opcion === id
                ? "bg-orange-500/20 text-orange-300"
                : "hover:bg-white/10 text-white/80"
        }`

    return (
        <div className="h-[50rem] w-64 hidden lg:flex justify-start">
            <NotGlass>
                <div className="flex flex-col gap-1 p-6 w-full">
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-2 px-3">Menú</p>

                    <button onClick={() => setOpcion(1)} className={btnClass(1)}>
                        <img src={notetask.src} className="w-5 h-5 opacity-80" />
                        <p className="text-sm font-medium">Tareas</p>
                    </button>
                    <button onClick={() => setOpcion(2)} className={btnClass(2)}>
                        <img src={threebar.src} className="w-5 h-5 opacity-80" />
                        <p className="text-sm font-medium">Ver Todo</p>
                    </button>
                    <button onClick={() => setOpcion(3)} className={btnClass(3)}>
                        <img src={task.src} className="w-5 h-5 opacity-80" />
                        <p className="text-sm font-medium">Modificar Tareas</p>
                    </button>

                    <div className="border-t border-white/10 my-2" />

                    <button onClick={() => setOpcion(4)} className={btnClass(4)}>
                        <img src={poker.src} className="w-5 h-5 opacity-80" />
                        <p className="text-sm font-medium">Gacha</p>
                    </button>
                    <button onClick={() => setOpcion(5)} className={btnClass(5)}>
                        <img src={human.src} className="w-5 h-5 opacity-80" />
                        <p className="text-sm font-medium">Personaje</p>
                    </button>
                    <button onClick={() => setOpcion(6)} className={btnClass(6)}>
                        <img src={fire.src} className="w-5 h-5 opacity-80" />
                        <p className="text-sm font-medium">Ver Racha</p>
                    </button>
                </div>
            </NotGlass>
        </div>
    )
}