import LeftBar from "@/app/components/homepage/leftbar"
import ImageBackground from "../../components/homepage/imagebackground"
import TaskBlock from "@/app/components/homepage/taskblock"
import UpBar from "@/app/components/homepage/upbar"
export default function homepage(){
    return(
        <div className="min-h-screen relative">
            <UpBar/>
            <ImageBackground/>
            <div className="pt-16 flex min-h-screen">
            {}
               <LeftBar/>
               <TaskBlock/>


            </div>
        </div>

    )
}