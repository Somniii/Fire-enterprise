"use client"
import addSvg from "../../assets/icons/add.svg"
import {useState} from "react"
export default function CreateTask(){
    function something(){

    }
    function writeTask(){
        
    }
    
    function isClicked(){
        setIsExpanded(true)
    }
    function isWeekChecked(){
        setIsRepeatWeekExpanded(true)
    }

    const [isExpanded, setIsExpanded] = useState(false)
    const [isRepeatWeekExpanded, setIsRepeatWeekExpanded] = useState(false)
    const [isRepeatMonthExpanded, setIsRepeatMonthExpanded] = useState(false)

    const DIAS_SEMANA = [
        { id: "domingo", nombre: "Domingo" },
        { id: "lunes", nombre: "Lunes" },
        { id: "martes", nombre: "Martes" },
        { id: "miercoles", nombre: "Miércoles" },
        { id: "jueves", nombre: "Jueves" },
        { id: "viernes", nombre: "Viernes" },
        { id: "sabado", nombre: "Sábado" },
    ]
    const [diasSeleccionados ,setDiasSeleccionados] = useState({
        domingo: false,
        lunes: false,
        martes: false,
        miercoles: false,
        jueves: false,
        viernes: false,
        sabado: false,
    })

    const handleDiaChanfe = (id: keyof typeof diasSeleccionados) => {
        setDiasSeleccionados((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    }


    if(isExpanded){
        return(
            <>
            <div className= {`bg-white w-[66rem] ml-[1rem] mt-[1.5rem] rounded-xl flex ${isRepeatWeekExpanded ? "h-[12rem] " :  isRepeatMonthExpanded ? "h-[15rem]" : "h-[5rem] " }`}>
                <form>
                    <div>
                        <input type="text" placeholder="Escribe el titulo de la tarea">
                        </input>
                    </div>
                    <div>
                        <input type="text" placeholder="Agrega una nota">
                        </input>
                    </div> 
                    <div className="flex">
                        <div className="flex">
                            <input type="checkbox"
                                    id="repeatWeekly"
                                    checked={isRepeatWeekExpanded}
                                    onChange={(e)=>setIsRepeatWeekExpanded(e.target.checked)}
                                    className="w-4 h-4 accent-orange-500"
                            />
                            <p>Repeticion semanal</p>
                        </div>
                        <div className="flex">
                            <input type="checkbox"
                                    id="repeathMonthly"
                                    checked={isRepeatMonthExpanded}
                                    onChange={(e)=>setIsRepeatMonthExpanded(e.target.checked)}
                                    className="w-4 h-4 accent-orange-500"
                            />
                            <p>Repeticion mensual</p>
                        </div>
                    </div>
                    {isRepeatWeekExpanded && (
                        <div>
                            <div className="flex">
                                <p>Cantidad dias</p> 
                                <select>
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                    <option value={4}>4</option>
                                    <option value={5}>5</option>
                                    <option value={6}>6</option>
                                    <option value={7}>7</option>
                                </select>
                            </div>
                            <div className="">
                                <p>Dias que podes repetir</p>
                                <div className="flex flex-wrap gap-4 mt-1">
                                    {DIAS_SEMANA.map((dia)=>(
                                        <label 
                                        key={dia.id}
                                        className="flex items-center gap-2 cursor-pointer text-sm select-none"
                                        >
                                            <input
                                            type="checkbox"
                                            >
                                                
                                            </input>
                                            <p>{dia.nombre}</p>
                                            

                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button className=" hover:color-red-500">
                                Aceptar
                            </button>
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
                            <p>Agregar tarea</p>
                        </div>
                    </button>
                </div>
            </>
        )
    }

}