"use client"
import addSvg from "../../assets/icons/add.svg"
import {useState} from "react"
export default function CreateTask(){

    function writeTask(){
        
    }
    
    function isClicked(){
        setIsExpanded(true)
    }
    function isChecked(){
        setIsRepeatExpaned(true)
    }

    const [isExpanded, setIsExpanded] = useState(false)
    const [isRepeatExpanded, setIsRepeatExpaned] = useState(false)
    if(isExpanded==true){
        return(
            <>
            <div className="bg-white w-[66rem] h-[5rem] ml-[1rem] mt-[1.5rem] rounded-xl flex ">
                <form>
                    <div>
                        <input type="text" placeholder="Escribe el titulo de la tarea">
                        </input>
                    </div>
                    <div>
                        <input type="text" placeholder="Aniade una descripcion aqui">
                        </input>
                    </div> 
                    <div>
                        <input type="checkbox"
                                id="repetitive"
                                checked={isRepeatExpanded}
                                onChange={(e)=>setIsRepeatExpaned(e.target.checked)}
                                className="w-4 h-4 accent-orange-500"
                        />
                    </div>
                    {isRepeatExpanded && (
                        <div>
                            <h1>peruano</h1>
                        </div>
                    )}
                </form>

            </div>
            </>
        )

    }else{
        return(
            <>
                <div>
                    <button className="bg-white w-[66rem] h-[3rem] ml-[1rem] mt-[1.5rem] rounded-xl hover:hover:bg-orange-100 " onClick={isClicked}>
                        <div className="flex">
                            <img src={addSvg.src}/>
                            <p>Aniadir tarea</p>
                        </div>
                    </button>
                </div>
            </>
        )
    }

}