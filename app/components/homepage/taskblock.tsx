import GlassCard from "../styles/glasscard"
import NotGlass from "../styles/notglass"
import TaskList from "./tasklist"
import Task from "./task"

export default function TaskBlock(){
    return(
        <div  className="h-[49rem] w-[68rem] mx-auto flex ml-[2rem] ">
            <NotGlass>
                <TaskList/>
            </NotGlass>
        </div>

        
    )
}