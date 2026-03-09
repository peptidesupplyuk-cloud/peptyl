import { useMemo } from "react";
import { format, addDays, subDays, isSameDay, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DayPickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DayPicker = ({ selectedDate, onDateChange }: DayPickerProps) => {
  const today = startOfDay(new Date());

  const days = useMemo(() => {
    const result: Date[] = [];
    for (let i = -3; i <= 3; i++) {
      result.push(addDays(selectedDate, i));
    }
    return result;
  }, [selectedDate]);

  const isToday = isSameDay(selectedDate, today);

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onDateChange(subDays(selectedDate, 1))}
        className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isDayToday = isSameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateChange(day)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 transition-all min-w-[3rem] shrink-0",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : isDayToday
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {isDayToday && !isSelected && (
                <div className="h-1 w-1 rounded-full bg-primary" />
              )}
              {isSelected && isDayToday && (
                <div className="h-1 w-1 rounded-full bg-primary-foreground" />
              )}
              {!isDayToday && <div className="h-1" />}
              <span className="text-sm font-heading font-bold leading-none">
                {format(day, "d")}
              </span>
              <span className="text-[9px] font-medium leading-none">
                {format(day, "EEE")}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onDateChange(addDays(selectedDate, 1))}
        className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {!isToday && (
        <button
          onClick={() => onDateChange(today)}
          className="text-[10px] font-semibold text-primary hover:underline shrink-0 ml-1"
        >
          Today
        </button>
      )}
    </div>
  );
};

export default DayPicker;
