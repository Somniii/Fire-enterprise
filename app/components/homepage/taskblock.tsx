import GlassCard from "../styles/glasscard"
import NotGlass from "../styles/notglass"
import TaskList from "./tasklist"
import Task from "./task"
import BarraTaskBlock from "./barraTaskBlock"
import InfiniteTaskList from "./infiniteTasklist"

export default function TaskBlock(){
    return(
        <div className="
        w-full
        max-w-7xl
        mx-auto
        px-4
        md:px-6
        lg:px-8
        min-h-screen
        ">
            <NotGlass>
                <InfiniteTaskList></InfiniteTaskList>
                
            </NotGlass>
        </div>
    )
}
//<TaskList/>