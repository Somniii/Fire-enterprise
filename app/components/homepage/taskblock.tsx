import GlassCard from "../styles/glasscard"
import NotGlass from "../styles/notglass"
import TaskList from "./tasklist"
import Task from "./task"
import BarraTaskBlock from "./barraTaskBlock"

export default function TaskBlock(){
    return(
        <div  className="flex h-[49rem] w-[68rem] mx-auto flex ml-[2rem] ">
            <NotGlass>
                <BarraTaskBlock/>
                <TaskList/>
            </NotGlass>
        </div>

        
    )
}