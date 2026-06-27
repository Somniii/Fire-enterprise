import NotGlass from "../styles/notglass";
import LeftButton from "./leftbutton";
import notetask from '../../assets/icons/notetask.svg'
import poker from '../../assets/icons/poker.svg'
import task from '../../assets/icons/task.svg'
import threebar from '../../assets/icons/threebar.svg'
import fire from '../../assets/icons/fire.svg'
import human from '../../assets/icons/human.svg'

export default function LeftBar(){
    return(
        <>
          <div className="h-[50rem] w-64 hidden lg:flex justify-start">
            <NotGlass>
                <div className="flex flex-col gap-1 p-6 w-full">

                    <p className="text-xs text-white/40 uppercase tracking-widest mb-2 px-3">
                        Menú
                    </p>

                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 cursor-pointer transition-all">
                        <img src={notetask.src} className="w-5 h-5 opacity-80" />
                        <p className="text-white/80 text-sm font-medium">Tareas</p>
                    </div>

                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 cursor-pointer transition-all">
                        <img src={threebar.src} className="w-5 h-5 opacity-80" />
                        <p className="text-white/80 text-sm font-medium">Ver Todo</p>
                    </div>

                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 cursor-pointer transition-all">
                        <img src={task.src} className="w-5 h-5 opacity-80" />
                        <p className="text-white/80 text-sm font-medium">Ver Tareas</p>
                    </div>

                    <div className="border-t border-white/10 my-2" />

                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 cursor-pointer transition-all">
                        <img src={poker.src} className="w-5 h-5 opacity-80" />
                        <p className="text-white/80 text-sm font-medium">Gacha</p>
                    </div>

                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 cursor-pointer transition-all">
                        <img src={human.src} className="w-5 h-5 opacity-80" />
                        <p className="text-white/80 text-sm font-medium">Personaje</p>
                    </div>

                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 cursor-pointer transition-all">
                        <img src={fire.src} className="w-5 h-5 opacity-80" />
                        <p className="text-white/80 text-sm font-medium">Ver Racha</p>
                    </div>

                </div>
            </NotGlass>
          </div>  
        </>
    )
}