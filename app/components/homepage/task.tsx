//HAY POCAS COSAS OPCIONAL PERO VOY A MARCAR MUCHAS PARA EMPEZAR A TRABAJAR DE A POCO
interface Task{
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

}
interface Props{
    task:Task
}
//rachaPorTipo se resetea despues de cada ciclo ejemplo es miercoles hiciste racha martes y lunes bueno rachaportipo es = 2 , se compara con el cantidadDias que calcula la cantidad de dias por mes o semana uqe ibas a hacerlo , cuando llega a ej 2/3 y le da un feedback al usuario cuanto le falta por semana o mes
//para calcular la cantidad de veces que tenes uqe hacerlo por el mes o por la semana lo ves por la cantidadDias 
export default function Task({task}:Props){
    return(
        <>
            <div className="bg-white w-[66rem] h-[3rem] ml-[1rem] mt-[1.5rem] rounded-xl flex ">
                <div>
                    <form>
                        <input type="checkbox" />
                        <input/>
                    </form>
                    <p>{task.titulo}</p>
                    <p>
                        {task.tipoRepeticion}
                    </p>
                    <p>
                        {task.rachaActual}
                    </p>
                </div>
            </div>
        </>
    )
}