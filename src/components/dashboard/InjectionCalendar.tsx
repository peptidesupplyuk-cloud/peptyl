import { useState, useMemo } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProtocols } from "@/hooks/use-protocols";
import { addDays, format, startOfDay, isBefore, isAfter, isSameDay } from "date-fns";

/** Check if a peptide is due on a given date */
function isDueOnDate(frequency: string, protocolStartDate: string, date: Date): boolean {
  const start = new Date(protocolStartDate);
  const daysSinceStart = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const dayOfWeek = date.getDay();

  if (daysSinceStart < 0) return false;

  switch (frequency.toLowerCase()) {
    case "daily": return true;
    case "weekly": return daysSinceStart % 7 === 0;
    case "2x/week": return dayOfWeek === 1 || dayOfWeek === 4;
    case "3x/week": return dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
    case "5on/2off": return dayOfWeek >= 1 && dayOfWeek <= 5;
    case "eod":
    case "every other day": return daysSinceStart % 2 === 0;
    default: return true;
  }
}

interface DayInjection {
  peptide_name: string;
  dose_mcg: number;
  timing: string;
  protocolName: string;
}

const InjectionCalendar = () => {
  const [open, setOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const { data: protocols = [] } = useProtocols();

  const activeProtocols = protocols.filter((p) => p.status === "active" || p.status === "paused");

  // Generate 7 days starting from current week offset
  const today = startOfDay(new Date());
  const weekStart = addDays(today, weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const injectionsByDay = useMemo(() => {
    const map = new Map<string, DayInjection[]>();

    for (const day of days) {
      const key = format(day, "yyyy-MM-dd");
      const dayInjections: DayInjection[] = [];

      for (const protocol of activeProtocols) {
        if (protocol.status === "paused") continue;
        const endDate = protocol.end_date ? new Date(protocol.end_date) : null;
        if (endDate && isAfter(day, endDate)) continue;
        if (isBefore(day, new Date(protocol.start_date))) continue;

        for (const pep of protocol.peptides) {
          if (isDueOnDate(pep.frequency, protocol.start_date, day)) {
            dayInjections.push({
              peptide_name: pep.peptide_name,
              dose_mcg: pep.dose_mcg,
              timing: pep.timing || "PM",
              protocolName: protocol.name,
            });
          }
        }
      }

      // Merge same compound + timing
      const merged = new Map<string, DayInjection>();
      for (const inj of dayInjections) {
        const mk = `${inj.peptide_name}||${inj.timing}`;
        const existing = merged.get(mk);
        if (existing) {
          existing.dose_mcg += inj.dose_mcg;
          existing.protocolName += `, ${inj.protocolName}`;
        } else {
          merged.set(mk, { ...inj });
        }
      }

      map.set(key, Array.from(merged.values()));
    }

    return map;
  }, [days, activeProtocols]);

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => setOpen(true)}>
        <CalendarDays className="h-3.5 w-3.5" /> Calendar View
      </Button>
    );
  }

  const totalWeeks = Math.ceil(30 / 7);

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="font-heading font-semibold text-foreground">Calendar</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekOffset((w) => Math.max(0, w - 1))} disabled={weekOffset === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[80px] text-center">
              Week {weekOffset + 1} of {totalWeeks}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekOffset((w) => Math.min(totalWeeks - 1, w + 1))} disabled={weekOffset >= totalWeeks - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const injections = injectionsByDay.get(key) || [];
          const isToday = isSameDay(day, today);

          return (
            <div
              key={key}
              className={`rounded-xl border p-2 min-h-[100px] ${
                isToday ? "border-primary bg-primary/5" : "border-border bg-muted/30"
              }`}
            >
              <div className={`text-[10px] font-medium mb-1.5 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                {format(day, "EEE")}
                <span className="block text-xs font-semibold text-foreground">{format(day, "d")}</span>
              </div>
              <div className="space-y-1">
                {injections.map((inj, idx) => (
                  <div
                    key={idx}
                    className="bg-primary/10 rounded px-1.5 py-1 text-[9px] leading-tight"
                    title={`${inj.protocolName}: ${inj.dose_mcg}mcg ${inj.timing}`}
                  >
                    <span className="font-medium text-foreground block truncate">{inj.peptide_name}</span>
                    <span className="text-muted-foreground">{inj.dose_mcg}mcg · {inj.timing}</span>
                  </div>
                ))}
                {injections.length === 0 && (
                  <span className="text-[9px] text-muted-foreground/50">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activeProtocols.some((p) => p.end_date) && (
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground font-medium">Protocol end dates:</p>
          {activeProtocols.filter((p) => p.end_date).map((p) => (
            <p key={p.id} className="text-[10px] text-muted-foreground">
              {p.name}: ends {format(new Date(p.end_date!), "MMM d, yyyy")}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default InjectionCalendar;
