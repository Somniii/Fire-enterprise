"use client";

import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
} from "date-fns";
import { es } from "date-fns/locale";

interface Props {
    fechas: number[];
}

export default function CalendarView({ fechas }: Props) {
    const currentMonth = new Date();

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);

    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

    return (
        <div className="w-fit rounded-md bg-white p-2">

            <div className="mb-1 grid grid-cols-7 gap-[2px] text-center text-[9px] text-gray-400">
                {weekDays.map((day) => (
                    <div key={day}>{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-[2px]">
                {days.map((day) => {
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const marcado =
                        isCurrentMonth && fechas.includes(day.getDate());

                    return (
                        <div
                            key={day.toISOString()}
                            className={`
                                flex h-5 w-5 items-center justify-center rounded text-[10px]
                                ${
                                    !isCurrentMonth
                                        ? "text-gray-300"
                                        : marcado
                                        ? "bg-orange-500 font-semibold text-white"
                                        : "text-gray-700"
                                }
                            `}
                        >
                            {format(day, "d")}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}