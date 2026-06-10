import {useState} from 'react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import {es} from 'date-fns/locale';


interface Props{
    selectedDates: Date[];
    setSelectedDates: React.Dispatch<React.SetStateAction<Date[]>>
}

export default function Calendar({selectedDates, setSelectedDates}:Props){


    const[currentMonth , setCurrentMonth] = useState(new Date())
    //ESTA IGUAL SE PUEDE SELECCIONAR MAS DE UNA FECHA ASI QUE DEBERIA SER UN ARRAY
    
    //const[selectedDates, setSelectedDates] = useState<Date[]>([new Date()])
    function cantidadDias(){
        return selectedDates.length
    }

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart,{weekStartsOn: 1})
    const endDate = endOfWeek(monthEnd, {weekStartsOn:1})

    const days = eachDayOfInterval({start: startDate , end:endDate})

    const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    const nextMonth = ()=> setCurrentMonth(addMonths(currentMonth,1))
    const prevMonth = ()=> setCurrentMonth(subMonths(currentMonth,1))

    const handleDateClick = (day:Date)=>{
        const isAlreadySelected = selectedDates.some((date)=>isSameDay(date,day))

        if(isAlreadySelected){
            setSelectedDates(selectedDates.filter((date)=> !isSameDay(date,day)))
        }else{
            setSelectedDates([...selectedDates,day])
        }
    }
    return(
        <div className='max-w-md mx-auto p-4 bg-white rounded-xl shadow-md text-gray-800'>
            {//mes y fecha
            }
            <div className='flex justify-between items-center mb-4 px-2'>
                <h2>
                    {format(currentMonth,'MMMM yyyy',{locale:es})}
                </h2>
                <div className='space-x-2'>

                </div>

            </div>
            <div className='grid grid-cols-7 gap-1 text-center font-semibold text-gray-500 text-sm mb-2'>
                {weekDays.map((day)=>(
                    <div key={day}>{day}</div>
                ))}
            </div>
            <div className='grid grid-cols-7 gap-1'>
                {days.map((day,idx)=>{
                    const isCurrentMonth = isSameMonth(day,currentMonth);
                    const isSelected = selectedDates.some((date)=>isSameDay(date,day))
                    return(
                        <button type='button'
                            key={idx}
                            onClick={() => handleDateClick(day)}
                            className={`
                                h-10 w-10 mx-auto flex items-center justify-center rounded-full text-sm transition-all
                                ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                                ${isSelected ? 'bg-blue-600 text-white font-bold shadow': 'hover:bg-gray-100'}
                                
                            `}>
                                {format(day,`d`)}
                        </button>
                    )
                }

                )}
                <div></div>

            </div>
        </div>
    )
}  