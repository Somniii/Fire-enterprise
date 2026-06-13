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

/*interface Task{
    idTarea: string;
    idUsuario?: string | null;
    fechaCreacion?: Date;
    //racha actual que es la que se resetea a 0 si no hace
    rachaActual?: number;
    //mejor racha que tuvo 
    mejorRacha?: number;
    //si hizo la tarea hoy (sale solo el dia que puede hacerlas)
    completadaHoy?: boolean;
    //ultima completacion compara hoy es domingo y la hizo el jueves , los dias que puede hacerla son los lunes jueves y domingo todavia puede hacerla hoy pero si ej hoy es domingo y la hizo el lunes automaticamente le pone 0
    ultimaCompletacion?: Date|null;
    //dias de la semana que puede hacerla 
    diasSemana?: string[];
    //dias del mes que puede hacerla(obvio por ahora no lo vamos a hacer peor hay que encontrar una solucion para los meses con 28 29 30 y 31)
    diasMes?: number[]
    //cantidad de dias minimo que tiene que hacer la tarea
    cantidadDias?: number;
    //si la racha es mensual semanal o tarea sin racha
    tipoRepeticion?: string;
    //titulo de la tarea
    titulo:string;
    //nota descriptiva de la tarea
    nota:string;
    //La cantidad de dias que va hacciendo la tarea por un ciclo especifico ej : dias: lunes martes jueves hizo lunes martes estamos a jueves rachatipo muestra =2 y compara con cantidad dias mostrando 2/3 , cuando sea domingo se resetea de nuevo a 0 para que vaya sumando de nuevo
    rachaPorTipo?:number;

}*/

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
    //si puede hacer la racha ese ciclo ej esa semana o ya no le dan los dias
           //1. QUEDARNOS CON LAS TAREAS ACTIVAS DE ESE USUARIO
              //2. QUEDARNOS CON LAS TAREAS QUE SE PUEDEN HACER ESE DIA DE ESE USUARIO
              
    
              //3. CREAR UN ARRAY CON ESAS TAREAS PARA PONERLAS EN EL RENDER
              //4. CALCULAR QUE DIA SEMANAL MOSTRAR EJ 4 FUEGOS PQ HIZO 4 LA ANTERIOR VEZ Y EN TOTAL TIENE Q HACER 5 SI ES SEMANA , SI ES MES QUE SALGA 4/5 PQ SI UNO PONE MUCHOS DIAS IMAGINATE 24 FUEGOS QUE SEA 4/25 MEJOR
              //O MEJOR AUN QUE A PARTIR DE MAS DE 7 TAREAS TENGA OTRA VISTA QUE SE FIJE 4/8 EJ EN VEZ DE 8 FUEGOS(esto se ve cno un if(task.cantidad > 7))
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
        if(task.tipoRepeticion === "week" && indiceHoy===0 && rachaCiclo >0){
            setRachaCiclo(0)
            //modificarTarea(task.taskId,{rachaCiclo:0})
        }
        //RESETEO MENSUAL
        if(task.tipoRepeticion === "month" && indiceMes===1 && rachaCiclo >0){
            setRachaCiclo(0)
            //modificarTarea(task.taskId,{rachaCiclo:0})
        }

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
            const nuevaRachaActual = (task.rachaActual ?? 0) + 1
            const nuevaRachaCiclo = (task.rachaCiclo ?? 0) + 1
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
    const cantidadDiasMeta = task.cantidadDias??0
    const fuegoGrisFaltantes = Math.max(0,cantidadDiasMeta - rachaCiclo)
    //aca calculamos los dias faltantes se pone el ?? 0 por que si la racha ciclo esta vacia se reemplaza por 0
    return(
        <>
            <div className="bg-white w-[66rem] h-[3rem] ml-[1rem] mt-[1.5rem] rounded-xl flex ">
                <div className="flex">
                    <button onClick={cambiarRacha}>
                        {hoyHecho==false &&(
                            <img src={checkbox.src}></img>
                        )}
                        {hoyHecho==true&&(
                            <img src={checkboxCheck.src}></img>
                        )}
                        
                    </button>
                    <p className="text-black">{task.titulo}</p>
                    <p>
                        {task.tipoRepeticion}
                    </p>
                    <p>
                        {task.detallesSemanal?.dias}
                    </p>
                    <div className="flex gap-1">
                        {Array.from({length:rachaCiclo}).map((_,indice)=>(
                            <div key={indice}>
                                <img className="bg-Red-50"  src={fireOrangeSvg.src}></img>
                            </div>
                        ))}
                    
                        {Array.from({length:fuegoGrisFaltantes}).map((_,indice)=>(
                            <div key={indice}>
                                <img className="bg-red-50"  src={fireGraySvg.src}></img>
                            </div>
                        ))}
                    </div>
                    <div>
                        <p>Dias totales de racha {rachaActual}</p>
                    </div>
                </div>
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