//HAY POCAS COSAS OPCIONAL PERO VOY A MARCAR MUCHAS PARA EMPEZAR A TRABAJAR DE A POCO
"use client"
import { auth } from "@/app/lib/firebase";
import { TaskInterface } from "@/app/lib/auth";
import { modificarTarea } from "@/app/lib/auth";
import {useState , useEffect} from "react"
import fireSvg from '../../assets/icons/fire.svg'
import fireOrangeSvg from '../../assets/icons/fire-orange.svg'
import fireGraySvg from '../../assets/icons/fire-gray.svg'
import checkbox from '../../assets/icons/check-box.svg'
import checkboxCheck from '../../assets/icons/check-box-check.svg'
import fireBlue from '../../assets/icons/fire-blue.svg'
import CalendarView from "./calendarview";


interface Props{
    task:TaskInterface
}



//rachaPorTipo se resetea despues de cada ciclo ejemplo es miercoles hiciste racha martes y lunes bueno rachaportipo es = 2 , se compara con el cantidadDias que calcula la cantidad de dias por mes o semana uqe ibas a hacerlo , cuando llega a ej 2/3 y le da un feedback al usuario cuanto le falta por semana o mes
//para calcular la cantidad de veces que tenes uqe hacerlo por el mes o por la semana lo ves por la cantidadDias 
export default function Task({task}:Props){
    const [rachaActual,setRachaActual] = useState(task.rachaActual ?? 0)
    const [rachaCiclo ,setRachaCiclo] = useState(task.rachaCiclo ?? 0)
    const [diasFaltantes, setDiasFaltantes] = useState( task.cantidadDias- (task.rachaCiclo ?? 0) )
    const [hoyHecho, setHoyHecho] = useState (task.completadaHoy)
    const diaActual = new Date()
    const [diasExtras, setDiasExtras] = useState(0)
    //Lo que hace este useState es cuando vos pasas por arriba de la tarea funcinoa como verificador para ver los dias que podes hacerla y la descripcion 
    const [hoverTask, setHoverTask] = useState(false)

    //si puede hacer la racha ese ciclo ej esa semana o ya no le dan los dias
           //1. QUEDARNOS CON LAS TAREAS ACTIVAS DE ESE USUARIO
              //2. QUEDARNOS CON LAS TAREAS QUE SE PUEDEN HACER ESE DIA DE ESE USUARIO
              
    
              //3. CREAR UN ARRAY CON ESAS TAREAS PARA PONERLAS EN EL RENDER
              //4. CALCULAR QUE DIA SEMANAL MOSTRAR EJ 4 FUEGOS PQ HIZO 4 LA ANTERIOR VEZ Y EN TOTAL TIENE Q HACER 5 SI ES SEMANA , SI ES MES QUE SALGA 4/5 PQ SI UNO PONE MUCHOS DIAS IMAGINATE 24 FUEGOS QUE SEA 4/25 MEJOR
              //O MEJOR AUN QUE A PARTIR DE MAS DE 7 TAREAS TENGA OTRA VISTA QUE SE FIJE 4/8 EJ EN VEZ DE 8 FUEGOS(esto se ve cno un if(task.cantidad > 7))
    const DIAS_ORDENADOS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]

    useEffect(()=>{
        const DIAS_ORDENADOS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]

        const diasSemana = task.diasSemana ?? []
        const cantidadDiasMeta = task.cantidadDias ?? 0
        const diaActual = new Date();
        //vemos que dia de la semana estamos
        const indiceHoy = diaActual.getDay()
        //vemos que dia del mes estamos
        const indiceMes = diaActual.getDate()
        //vemos cual es el ultimo dia del mes(si es 28 29 30 o 31) 

        //Si estamos a domingo (domigno es 0) y la racha ciclo es mayor a 0(osea si hizo algo de racha) entonces la racha ciclo se pone en 0
        //RESETEO SEMANAL
        /*
        if(task.tipoRepeticion === "week" && indiceHoy===0 && rachaCiclo >0){
            setRachaCiclo(0)
            //modificarTarea(task.taskId,{rachaCiclo:0})
        }
        //RESETEO MENSUAL
        if(task.tipoRepeticion === "month" && indiceMes===1 && rachaCiclo >0){
            setRachaCiclo(0)
            //modificarTarea(task.taskId,{rachaCiclo:0})
        }
        */
        if(task.tipoRepeticion!=="" && task.activa===true){
            if(!task.completadaHoy){

                //CALCULAMOS LA CANTIDAD DE DIAS QUE FALTAN EJ TENEMOS QUE HACER 4 POR DIA Y PODEMOS HACER LUN MAR JUE VIE Y SAB Y HICIMOS LUN MAR JUE TENEMOS 3 DIAS NOS FALTAN 1 PERO PODEMOS 2 DIAS MAS
                const cantidadDiasFaltan = cantidadDiasMeta -rachaCiclo
                
                //VER EL DIA ACTUAL Y COMPARARLO CON LOS DIAS QUE PODEMOS HACER RACHA IF(DIACTUAL == DIASEMANA) OK PASAMOS ALSIGUIENTE
                const diasDisponiblesRestantes = diasSemana.filter(dia=>{
                    const indiceDiaPermitido = DIAS_ORDENADOS.indexOf(dia);
                    return indiceDiaPermitido >= indiceHoy;
                }).length 
                if(cantidadDiasFaltan >diasDisponiblesRestantes){
                    //Esto esta mal implementado
                    //modificarTarea(task.taskId,{rachaActual:0})
                    
                    //setRachaActual(0)
                }
                //VEMOS SI HOY ES DOMINGO

                
                //
            }
        }
    },[task.taskId, task.tipoRepeticion, task.activa, task.completadaHoy, task.diasSemana, rachaCiclo, task.cantidadDias, rachaActual])
    //se desarmo task en propiedades asi no se manda siempre el cmabio a la firebase y evitas que useeffect se dispare por cualquier minimo cambio
    
    function verificarDiaYaPuesto(): boolean {
        if(task.ultimaCompletacion == null) return false

        const auxUltimaCompletacion = new Date(task.ultimaCompletacion)
        const hoy = new Date()
        if(            auxUltimaCompletacion.getFullYear() === hoy.getFullYear() &&
            auxUltimaCompletacion.getMonth() === hoy.getMonth() &&
            auxUltimaCompletacion.getDate() === hoy.getDate()){
                return true;
            }else{return false}

    }
    function cambiarRacha(){

        if(!hoyHecho){
            
            //Si hoy no se hizo lo prepara para subir a la nube
            //const nuevaRachaActual = (task.rachaActual ?? 0) + 1
            //const nuevaRachaCiclo = (task.rachaCiclo ?? 0) + 1
            const nuevaRachaActual = rachaActual + 1
            const nuevaRachaCiclo = rachaCiclo + 1
            //aca deberia meter algun if que compare el valor de la bdd y que si tiene 1 menos sume 1 , la cosa es que 
            //sube 2 valores porque task.rachaActual es el (HACER EN BULLET JOURNAL EL CICLO DE PONERLE UNOE XTRA A LA RACHA)
            const ultimaCompletacion = new Date().toISOString()
            const updates: Partial<TaskInterface> = {
                rachaActual: nuevaRachaActual,
                completadaHoy: true,
                ultimaCompletacion: ultimaCompletacion,
                rachaCiclo: nuevaRachaCiclo,
                ultimaUltimaCompletacion: task.ultimaCompletacion ?? null,
            }

            modificarTarea(task.taskId, updates)
            setRachaActual(nuevaRachaActual)
            setRachaCiclo(nuevaRachaCiclo)
            setHoyHecho(true)
 
        }else{
            
            //si hoy ya se hizo resta uno
            const nuevaRachaActual = rachaActual - 1
            const nuevaRachaCiclo = rachaCiclo - 1

            const updates: Partial<TaskInterface> = {
                rachaActual: nuevaRachaActual,
                completadaHoy: false,
                rachaCiclo: nuevaRachaCiclo,
                ultimaCompletacion: task.ultimaUltimaCompletacion ?? null,
            }

            setRachaCiclo(nuevaRachaCiclo)
            setRachaActual(nuevaRachaActual)
            modificarTarea(task.taskId, updates)
            setHoyHecho(false)
        }

    }
    useEffect(() => {
        if (rachaCiclo > task.cantidadDias) {
            setDiasExtras(rachaCiclo - task.cantidadDias)
        } else {
            setDiasExtras(0)
        }
    }, [rachaCiclo])  // ← ahora sí reacciona al state
    const cantidadDiasMeta = task.cantidadDias??0
    const fuegoGrisFaltantes = Math.max(0,cantidadDiasMeta - rachaCiclo)
    const fuegoAzul = task.rachaCiclo - task.cantidadDias
    //aca calculamos los dias faltantes se pone el ?? 0 por que si la racha ciclo esta vacia se reemplaza por 0

    //En esta parte del codigo que se usa cuando la tarea tiene mas de 7 dias si la tarea no esta hecha el fuego es gris , sino naranja y si supero la cantidad de dias que tenia que hacer azul
    let fuegoResumen = fireGraySvg.src;

    if (rachaCiclo > 0) {
        fuegoResumen = fireOrangeSvg.src;
    }

    if (rachaCiclo > cantidadDiasMeta) {
        fuegoResumen = fireBlue.src;
    }
    return(
        <>
        <div className="                        
        hover:shadow-xl
        hover:scale-[1.01]
        transition-all
        duration-200">
            <div
                    className={`
                        bg-white
                        w-[66rem]
                        h-[3rem]
                        ml-[1rem]
                        mt-[1.5rem]
                        flex

                        ${hoverTask && (task.tipoRepeticion !== "" || task.nota !== "")
                            ? "rounded-t-xl"
                            : "rounded-xl"}

                    `}
                    onMouseEnter={()=>setHoverTask(true)}
                    onMouseLeave={()=>setHoverTask(false)}
                >
                <div className="flex w-full items-center">
                    <div className="w-[4%] flex justify-center items-center">
                        <button onClick={cambiarRacha} className="flex items-center justify-center">
                            {hoyHecho==false &&(
                                <img src={checkbox.src} className="w-5 h-5" alt="check pendiente" />
                            )}
                            {hoyHecho==true&&(
                                <img src={checkboxCheck.src} className="w-5 h-5" alt="check completado" />
                            )}
                        </button>
                    </div>
                    <div className="w-[35%]">
                        <p className="text-black  text-lg">
                            {task.titulo}
                        </p>
                    </div>
                    <div>
                        {task.tipoRepeticion == "week" &&(
                            <p
                             className="text-black 
                             
                             ">Semanal</p>
                        )}
                        {task.tipoRepeticion == "month" &&(
                            <p className="text-black">Mensual</p>
                        )}
                    </div>
                        {(task.tipoRepeticion !== "" )&&(
                            <div className="flex w-[40%] justify-center items-center">

                                {cantidadDiasMeta <= 7 ? (
                                    <>
                                        {Array.from({ length: Math.min(rachaCiclo, cantidadDiasMeta) }).map((_, indice) => (
                                            <img key={indice} src={fireOrangeSvg.src} alt="fuego completado" />
                                        ))}

                                        {Array.from({ length: fuegoGrisFaltantes }).map((_, indice) => (
                                            <img key={indice} src={fireGraySvg.src} alt="fuego faltante" />
                                        ))}

                                        {fuegoAzul > 0 &&
                                            Array.from({ length: diasExtras }).map((_, indice) => (
                                                <img key={indice} src={fireBlue.src} alt="fuego extra" />
                                            ))}
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <img src={fuegoResumen} className="w-5 h-5" alt="fuego" />
                                        <p className="font-semibold text-black">
                                            {rachaCiclo} / {cantidadDiasMeta} días
                                        </p>
                                    </div>
                                )}

                            </div>
                        )}
                    <div >
                        {(task.tipoRepeticion !== "" )&&(
                            <div className="flex">
                                <img
                                src={hoyHecho ? fireOrangeSvg.src : fireGraySvg.src}
                                className="w-5 h-5"
                                alt="racha actual"
                            />
                            <p> {rachaActual}</p>
                            </div>
                        )}

                    </div>
                </div>

            </div>
                {/*este condicional sirve para el hover , si la tarea es de tipo una sola vez y no yiene nota no muestra nada*/}
                {hoverTask && !(task.tipoRepeticion === "" && task.nota ==="") &&(
                    <div
                        className={`
                                bg-white
                                w-[66rem]
                                ml-[1rem]
                                rounded-b-xl
                                flex
                                px-6
                                py-3

                                ${
                                    task.tipoRepeticion === "week"
                                        ? "h-[5rem]"
                                        : task.tipoRepeticion === "month"
                                        ? "h-[12rem]"
                                        : "h-[2rem]"
                                }
                            `}
                        onMouseEnter={()=>setHoverTask(true)}
                        onMouseLeave={()=>setHoverTask(false)}
                    >
                        <div className="w-full">

                            {task.tipoRepeticion=="week" &&(
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-neutral-500">Días de repetición:</p>
                                        <div className="flex gap-1.5">
                                            {Array.from({length:task.detallesSemanal?.dias?.length ?? 0}).map((_,indice)=>(
                                                <span
                                                    key={indice}
                                                    className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium"
                                                >
                                                    {DIAS_ORDENADOS[indice]}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {task.nota && (
                                        <p className="text-black text-sm">{task.nota}</p>
                                    )}
                                </div>
                            )}

                            {task.tipoRepeticion == "month" && (
                                <div className="flex gap-8">
                                    <div className="w-[40%] space-y-1">
                                        <p className="text-sm font-medium text-neutral-500">Nota:</p>
                                        {task.nota ? (
                                            <p className="text-black text-sm">{task.nota}</p>
                                        ) : (
                                            <p className="text-neutral-400 text-sm italic">Sin nota</p>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium text-neutral-500">Días del mes que podés completarla:</p>
                                        <div className="transition-transform duration-200 hover:scale-125 hover:z-10 origin-top-left">
                                            <CalendarView
                                                fechas={task.detallesMensual?.fechas.map(Number) ?? []}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {task.tipoRepeticion=="" && (
                                <p className="text-black text-sm">
                                    {task.nota}
                                </p>
                            )}

                        </div>
                    </div>
                )}
        </div>
            
        </>
    )
}

/*
 FORM DE ACTUALIZAR RACHA:
                     <form>
                        <input type="checkbox" onChange={cambiarRacha} />
                        <input/>
                    </form>
*/

/*
    function cambiarRacha(e: React.ChangeEvent<HTMLInputElement>){
        //VEMOS SI ESTA CHECKEADA LA TAREA DE HOY
        //const estaCheckeado = e.target.checked;
        const estaCheckeado = !task.completadaHoy
        //SUMAR LA RACHA , LA RACHA SE EMPIEZA A MOSTRAR EN COMPLETADAS DEL DIA , SE TIENE QUE ACTUALIZAR EL RACHASEMANAL CON EL SET PARA UQE SE RENDERICE Y SI YA PASO EL CICLO(semana,mes)SE VE CON UN COLOR FUEGO ESPECIAL  
        //VEMOS SI ETA CHECKEADO
        if(estaCheckeado){
            const nuevaRachaActual = (task.rachaActual ?? 0 )+1
            const nuevaRachaCiclo = (task.rachaCiclo ?? 0 ) +1
            //estamos poniendo el dia antes de la ultima completacion asi por si el usuario desmarca queda como ultima completacion la ultima ultima.
            const ultimaCompletacion = new Date().toISOString()
            if(task.ultimaCompletacion!=null){
                const nuevaUltimaUltimaCompletacion = task.ultimaCompletacion
                modificarTarea(task.taskId,{ultimaUltimaCompletacion: nuevaUltimaUltimaCompletacion})
                
            }else{
                
            }
            
            setRachaActual(nuevaRachaActual)
            setRachaCiclo(nuevaRachaCiclo)
            modificarTarea(task.taskId,{rachaActual: nuevaRachaActual ,completadaHoy: true,ultimaCompletacion: ultimaCompletacion , rachaCiclo:nuevaRachaCiclo})

        }else{
            //SI EL USUARIO DESCHECKEA
            const nuevaRachaActual = (rachaActual ?? 0 ) - 1
            const nuevaRachaCiclo = (rachaCiclo ?? 0) - 1
            if(task.ultimaUltimaCompletacion != null){
                const nuevaCompletacion = task.ultimaUltimaCompletacion
                modificarTarea(task.taskId,{ultimaCompletacion: nuevaCompletacion})
            }else{
                modificarTarea(task.taskId,{ultimaCompletacion:null})
            }
            setRachaCiclo(nuevaRachaCiclo)
            setRachaActual(nuevaRachaActual);
            
            modificarTarea(task.taskId,{rachaActual: nuevaRachaActual ,completadaHoy: false,ultimaCompletacion: null , rachaCiclo:nuevaRachaCiclo})


        }

    }
*/