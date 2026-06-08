import LeftBar from "@/app/components/homepage/leftbar"
import ImageBackground from "../../components/homepage/imagebackground"
import TaskBlock from "@/app/components/homepage/taskblock"
import UpBar from "@/app/components/homepage/upbar"
export default function homepage(){
    return(
        <div className="block">
            <div className="z-1">
                <UpBar/>
            </div>
            <div className="flex">
             <ImageBackground/>
                <div className="flex z-1">  
                    <LeftBar/>
                    <TaskBlock/>
                </div>

            </div>
        </div>

    )
}