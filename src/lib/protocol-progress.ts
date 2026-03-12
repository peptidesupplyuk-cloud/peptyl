import { differenceInCalendarDays, startOfDay } from "date-fns";

export interface ProtocolProgress {
  dayNumber: number;
  totalDays: number | null;
  daysElapsed: number;
  daysLeft: number | null;
  progressPct: number | null;
}

export function getProtocolProgress(
  startDate: string,
  endDate?: string | null,
  referenceDate: Date = new Date()
): ProtocolProgress {
  const start = startOfDay(new Date(startDate));
  const current = startOfDay(referenceDate);

  const daysElapsed = Math.max(0, differenceInCalendarDays(current, start));

  if (!endDate) {
    return {
      dayNumber: daysElapsed + 1,
      totalDays: null,
      daysElapsed,
      daysLeft: null,
      progressPct: null,
    };
  }

  const end = startOfDay(new Date(endDate));
  const totalDays = Math.max(1, differenceInCalendarDays(end, start) + 1);
  const dayNumber = Math.min(totalDays, daysElapsed + 1);

  return {
    dayNumber,
    totalDays,
    daysElapsed,
    daysLeft: Math.max(0, totalDays - dayNumber),
    progressPct: Math.min(100, Math.round((dayNumber / totalDays) * 100)),
  };
}
