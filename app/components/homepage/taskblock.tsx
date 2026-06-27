import NotGlass from "../styles/notglass"
import TaskList from "./tasklist"
import InfiniteTaskList from "./infiniteTasklist"
import GachaPage from "@/app/gacha/page"
import ModificarTareas from "./modificarTareas"

interface Props {
    opcion: number
}

export default function TaskBlock({ opcion }: Props) {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 min-h-screen">
            {opcion === 1 && <NotGlass><TaskList /></NotGlass>}
            {opcion === 2 && <NotGlass><InfiniteTaskList /></NotGlass>}
            {opcion === 3 && <NotGlass><ModificarTareas/></NotGlass>}
            {opcion === 4 && <GachaPage />}
        </div>
    )
}