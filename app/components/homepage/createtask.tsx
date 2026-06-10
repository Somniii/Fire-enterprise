"use client"
import addSvg from "../../assets/icons/add.svg"
import {useState} from "react"
import MyCalendar from "./calendar"
import { crearTarea } from "@/app/lib/auth"

export default function CreateTask({ onTareaCreada }: { onTareaCreada: () => void }) {

    function something(){

    }
 
    function isClicked(){
        setIsExpanded(true)
    }

    const [isExpanded, setIsExpanded] = useState(false)
    const [repeatType , setRepeatType] =useState("")
    const [titulo, setTitulo] = useState("")
    const [nota, setNota] = useState("")
    const [diaDelMes, setDiaDelMes] = useState(1)
    const [cantidadDiasSemana ,setCantidadDiasSemana ] = useState(1)

    //useSTATE DE MYCALENDAR
    const [selectedDates,setSelectedDates] = useState<Date[]>([])

    function monthlyType(){
        setRepeatType("month")
    }
    function weeklyType(){
        setRepeatType("week")
    }
    function cancelType(){
        setRepeatType("")
    }
    function corroborarSemanaCantidad(){
        const cantidadTrue = Object.values(diasSeleccionados).filter(valor=>valor).length

        return cantidadTrue >= cantidadDiasSemana

    }

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
        domingo: true,
        lunes: true,
        martes: true,
        miercoles: true,
        jueves: true,
        viernes: true,
        sabado: true,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Evita que la página se recargue

        // Creamos el objeto final con toda la información
        if(
            repeatType==="week" && !corroborarSemanaCantidad()
        ){
            alert(`Debes tener al menos ${cantidadDiasSemana} dias seleccionados`)
            return;
        }
        if(
            (selectedDates.length===0 && repeatType==="month")
        ){
            alert('Debes tener al menos un dia del mes seleccionado')
            return;
        }
        const nuevaTarea = {
   
            activa:true,
            taskId:crypto.randomUUID(),
            fechaCreacion:new Date().toISOString(),
            rachaActual:0,
            mejorRacha:0,
            completadaHoy:false,
            ultimaCompletacion:null,
            titulo,
            nota,
            rachaPorTipo:0,
            tipoRepeticion: repeatType,
            cantidadDias: repeatType === "week" ? cantidadDiasSemana : diaDelMes,
            // Si es semanal, guardamos los días checkeados y la cantidad
            detallesSemanal: repeatType === "week" ? {
                cantidadDias: cantidadDiasSemana,
                dias: Object.keys(diasSeleccionados).filter(key => diasSeleccionados[key as keyof typeof diasSeleccionados])
            } : null,
            // Si es mensual, guardamos el día seleccionado del 1 al 30
            detallesMensual: repeatType === "month" ? {
                cantidadDias: diaDelMes,
                fechas: selectedDates.map(date=>date.toISOString())
            } : null
        };
/*
            alert(
            `¡Tarea Creada con éxito!
            Titulo: ${nuevaTarea.titulo}
            Detalle: ${nuevaTarea.nota}
            Tipo: ${nuevaTarea.tipoRepeticion}
            Mensual: ${JSON.stringify(nuevaTarea.detallesMensual)}
            Semanal: ${JSON.stringify(nuevaTarea.detallesSemanal)}
            Dias mensual: ${JSON.stringify(nuevaTarea.detallesMensual?.fechas)}
            `
            
            )
        console.log("¡Tarea Creada con éxito!", nuevaTarea);
        setSelectedDates([])
        setDiaDelMes(1)
        setCantidadDiasSemana(1)
        setDiasSeleccionados({
            domingo: true,
            lunes: true,
            martes: true,
            miercoles: true,
            jueves: true,
            viernes: true,
            sabado: true,
        });*/

        
        // Aquí podrías enviar 'nuevaTarea' a tu API / Base de datos o a un componente padre.
        await crearTarea(nuevaTarea)
        onTareaCreada()
        // Opcional: Limpiar el formulario y cerrarlo
        setTitulo("");
        setNota("");
        setIsExpanded(false);
        setRepeatType("");
    }
    const handleDiaChange = (id: keyof typeof diasSeleccionados) => {
        setDiasSeleccionados((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    }

    const cantidadDias = selectedDates.length
    
    const opciones = Array.from(
        {length: cantidadDias},
        (_,i) =>i +1
    )

    if(isExpanded){
        return(
            <>
            <div className= {`bg-white w-[66rem] ml-[1rem] mt-[1.5rem] rounded-xl flex ${repeatType==="week" ? "h-[14rem] " :  repeatType==="month" ? "h-[33rem]" : "h-[8rem] " }`}>
                <form onSubmit={handleSubmit}>
                    <div>
                        <input type="text"
                         placeholder="Escribe el titulo de la tarea"
                         value={titulo}
                         onChange={(e)=>setTitulo(e.target.value)}
                         required

                         >
                        </input>
                    </div>
                    <div>
                        <input type="text"
                        placeholder="Agrega una nota"
                        value={nota}
                        onChange={(e)=>setNota(e.target.value)}
                        >
                        </input>
                    </div> 
                    <div className="flex">
                        <div className="flex">
                            <input type="radio" 
                            name="repeat"
                            checked={repeatType=== "week"}
                            onChange={weeklyType}
                            />
                            <p>Repeticion semanal</p>
                        </div>
                        <div className="flex">
                            <input type="radio" 
                            name="repeat"
                            checked={repeatType ==="month"}
                            onChange={monthlyType}
                            />
                            <p>Repeticion mensual</p>
                        </div>
                    </div>
                    {(repeatType==="week" || repeatType==="month")&& (
                        <div>
                            <button onClick={cancelType}>
                                <p>Cancelar repeticion</p>
                            </button>
                        </div>
                    ) }
                    {repeatType==="week" && (
                        <div>
                            <div className="flex">
                                <p>Cantidad dias</p> 
                            <select
                                value={cantidadDiasSemana}
                                onChange={(e) => setCantidadDiasSemana(Number(e.target.value))}
                            >
                                {[1,2,3,4,5,6,7].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
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
                                            checked={diasSeleccionados[dia.id as keyof typeof diasSeleccionados]}
                                            onChange={()=>handleDiaChange(dia.id as keyof typeof diasSeleccionados)}
                                            >
                                                
                                            </input>
                                            <p>{dia.nombre}</p>
                                        </label>
                                    ))}
                                </div>
                            </div>
                    </div>
                    )}
                    {repeatType==="month" &&(
                        <div>
                                <MyCalendar
                                selectedDates={selectedDates}
                                setSelectedDates={setSelectedDates}
                                 />
                                <p>Cantidad dias</p>
                                <select
                                    value={diaDelMes}
                                    onChange={(e)=> setDiaDelMes(Number(e.target.value))}
                                >
                                    {opciones.map((num)=>(
                                        <option key={num} value={num}>
                                            {num}
                                        </option>
                                    ))}
                                </select>
                        </div>
                    )}
                    <div className="mt-4 flex gap-2">
                        <button className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600" type="submit">
                            Aceptar
                        </button>
                        <button className="bg-gray-300 text-black px-4 py-1 rounded hover:bg-gray-400" type="button" onClick={() => setIsExpanded(false)}>
                            Cancelar
                        </button>
                    </div>
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