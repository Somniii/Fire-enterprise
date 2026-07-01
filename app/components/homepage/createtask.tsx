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
    const fechaCreacion = new Date()

    // Calcula el próximo lunes a las 00:00
    function getProximoLunes(desde: Date): string {
        const d = new Date(desde)
        const diaSemana = d.getDay() // 0=dom, 1=lun...
        const diasHastaLunes = diaSemana === 1 ? 7 : (8 - diaSemana) % 7 || 7
        d.setDate(d.getDate() + diasHastaLunes)
        d.setHours(0, 0, 0, 0)
        return d.toISOString()
    }

    // Calcula el próximo día 1 a las 00:00
    function getProximoDia1(desde: Date): string {
        const d = new Date(desde)
        d.setMonth(d.getMonth() + 1)
        d.setDate(1)
        d.setHours(0, 0, 0, 0)
        return d.toISOString()
    }

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
            fechaCreacion:fechaCreacion.toISOString(),
            fechaCiclo:fechaCreacion.toISOString(),
            rachaActual:0,
            mejorRacha:0,
            completadaHoy:false,
            ultimaCompletacion:null,
            ultimaUltimaCompletacion: null,
            titulo,
            nota,
            rachaCiclo:0,
            cantidadCiclos:0,
            modo:0,
            horasCompletacionCiclo: [],
            tipoRepeticion: repeatType,
            cantidadDias: repeatType === "week" ? cantidadDiasSemana : repeatType === "month" ? diaDelMes : 0,
            // Si es semanal, guardamos los días checkeados y la cantidad
            detallesSemanal: repeatType === "week" ? {
                cantidadDias: cantidadDiasSemana,
                dias: Object.keys(diasSeleccionados).filter(key => diasSeleccionados[key as keyof typeof diasSeleccionados]),
                finSemana: repeatType === "week" ? getProximoLunes(fechaCreacion):null
            } : null,
            // Si es mensual, guardamos el día seleccionado del 1 al 30
            detallesMensual: repeatType === "month" ? {
                cantidadDias: diaDelMes,
                fechas: selectedDates.map(date=>date.getDate().toString()),
                finMes: repeatType === "month" ? getProximoDia1(fechaCreacion) : null,
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
            {/*Este div controla todo */}
            <div className={`bg-white w-full ml-[1rem] mt-[1.5rem] rounded-xl p-6 flex gap-6 ${repeatType==="week" ? "h-[26rem] " :  repeatType==="month" ? "h-[26rem]" : "h-[17rem] " }`}>

                {/*Columna izquierda: formulario */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1 min-w-0">
                    <div>
                        <div>
                            <input
                            type="text"
                            placeholder="Escribe el titulo de la tarea"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            required
                            className="
                                w-full
                                rounded-lg
                                px-4
                                py-2
                                text-black
                                focus:outline-none
                                focus:ring-0
                                focus:border-transparent
                            "
                            />
                        </div>
                        <div>
                            <input type="text"
                            placeholder="Agrega una nota"
                            value={nota}
                            onChange={(e)=>setNota(e.target.value)}
                            className="
                                w-full
                                rounded-lg
                                px-4
                                py-2
                                text-black
                                focus:outline-none
                                focus:ring-0
                                focus:border-transparent
                            "
                            >
                            </input>
                        </div> 

                        <div className="flex gap-2 bg-neutral-100 p-1 rounded-lg w-fit mt-4">
                            <label
                                className={`
                                    flex items-center justify-center
                                    px-4 py-2
                                    rounded-md
                                    text-sm font-medium
                                    cursor-pointer
                                    transition-all duration-200
                                    ${repeatType === ""
                                        ? "bg-orange-400 text-white shadow-sm"
                                        : "text-neutral-600 hover:bg-neutral-200"
                                    }
                                `}
                            >
                                <input
                                    type="radio"
                                    name="repeat"
                                    checked={repeatType === ""}
                                    onChange={cancelType}
                                    className="hidden"
                                />
                                Sin repetición
                            </label>

                            <label
                                className={`
                                    flex items-center justify-center
                                    px-4 py-2
                                    rounded-md
                                    text-sm font-medium
                                    cursor-pointer
                                    transition-all duration-200
                                    ${repeatType === "week"
                                        ? "bg-orange-400 text-white shadow-sm"
                                        : "text-neutral-600 hover:bg-neutral-200"
                                    }
                                `}
                            >
                                <input
                                    type="radio"
                                    name="repeat"
                                    checked={repeatType === "week"}
                                    onChange={weeklyType}
                                    className="hidden"
                                />
                                Semanal
                            </label>

                            <label
                                className={`
                                    flex items-center justify-center
                                    px-4 py-2
                                    rounded-md
                                    text-sm font-medium
                                    cursor-pointer
                                    transition-all duration-200
                                    ${repeatType === "month"
                                        ? "bg-orange-400 text-white shadow-sm"
                                        : "text-neutral-600 hover:bg-neutral-200"
                                    }
                                `}
                            >
                                <input
                                    type="radio"
                                    name="repeat"
                                    checked={repeatType === "month"}
                                    onChange={monthlyType}
                                    className="hidden"
                                />
                                Mensual
                            </label>
                        </div>

                        {repeatType==="week" && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mt-4">
                                <p className="text-sm font-medium text-neutral-700">Cantidad dias</p>
                                <select
                                    value={cantidadDiasSemana}
                                    onChange={(e) => setCantidadDiasSemana(Number(e.target.value))}
                                    className="
                                        rounded-lg
                                        border
                                        border-neutral-300
                                        px-3
                                        py-1.5
                                        text-sm
                                        text-black
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-orange-400
                                    "
                                >
                                    {[1,2,3,4,5,6,7].map(num => (
                                        <option key={num} value={num}>{num} día{num > 1 ? "s" : ""}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-neutral-700 mb-2">Días que podés repetir</p>
                                <div className="flex flex-wrap gap-2">
                                    {DIAS_SEMANA.map((dia) => {
                                        const seleccionado = diasSeleccionados[dia.id as keyof typeof diasSeleccionados]
                                        return (
                                            <label
                                                key={dia.id}
                                                className={`
                                                    px-3 py-1.5
                                                    rounded-full
                                                    text-sm font-medium
                                                    cursor-pointer
                                                    select-none
                                                    transition-all duration-200
                                                    ${seleccionado
                                                        ? "bg-orange-400 text-white shadow-sm"
                                                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                                    }
                                                `}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={seleccionado}
                                                    onChange={() => handleDiaChange(dia.id as keyof typeof diasSeleccionados)}
                                                    className="hidden"
                                                />
                                                {dia.nombre.slice(0, 3)}
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                        )}
                    </div>

                    <div className="mt-auto flex gap-2">
                        <button className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600" type="submit">
                            Aceptar
                        </button>
                        <button className="bg-gray-300 text-black px-4 py-1 rounded hover:bg-gray-400" type="button" onClick={() => setIsExpanded(false)}>
                            Cancelar
                        </button>
                    </div>
                </form>

                {/*Columna derecha: calendario, solo si es mensual */}
                {repeatType==="month" && (
                    <div className="flex-shrink-0 w-[22rem] border-l border-neutral-200 pl-6">
                        <MyCalendar
                        selectedDates={selectedDates}
                        setSelectedDates={setSelectedDates}
                        />
                        <p className="text-sm font-medium text-neutral-700 mt-3 mb-1">Cantidad días</p>
                        <select
                            value={diaDelMes}
                            onChange={(e)=> setDiaDelMes(Number(e.target.value))}
                            className="
                                rounded-lg
                                border
                                border-neutral-300
                                px-3
                                py-1.5
                                text-sm
                                text-black
                                focus:outline-none
                                focus:ring-2
                                focus:ring-orange-400
                            "
                        >
                            {opciones.map((num)=>(
                                <option key={num} value={num}>
                                    {num}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

            </div>
            </>
        )

    }else{
        return(
            <>
                <div>
                    <button className="bg-white w-full
                        h-[3rem] 
                        ml-[1rem] 
                        mt-[1.5rem] 
                        rounded-xl 
                        hover:shadow-xl
                        hover:scale-[1.01]

                        transition-all
                        duration-200" onClick={isClicked}>
                        <div className="flex">
                            <img src={addSvg.src}/>
                            <p className="text-black">Agregar tarea</p>
                        </div>
                    </button>
                </div>
            </>
        )
    }

}