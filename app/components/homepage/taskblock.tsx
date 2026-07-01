import NotGlass from "../styles/notglass"
import TaskList from "./tasklist"
import InfiniteTaskList from "./infiniteTasklist"
import fireOrangeSvg from '../../assets/icons/fire-orange.svg'
import GachaPage from '../../layouts/gacha/page'
import Perfil from "../perfil/perfil"

import ModificarTareas from "./modificarTareas"
import VerRacha from "./verRacha"
import Pomodoro from "@/app/layouts/pomodoro/page"
interface Props {
    opcion: number
}

export default function TaskBlock({ opcion }: Props) {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 min-h-screen">
            {opcion === 1 && <NotGlass><TaskList /></NotGlass>}
            {opcion === 2 && <NotGlass><InfiniteTaskList /></NotGlass>}
            {opcion === 3 && <NotGlass><ModificarTareas/></NotGlass>}
            {opcion === 4 && <Perfil/>}
            {opcion === 5 && <Pomodoro/>}
            {opcion === 6 && <GachaPage />}
            {opcion === 8 && <VerRacha />}

        </div>
    )
}

