import { useMemo } from "react";
import { useAllInjections } from "@/hooks/use-injections";
import { useAllSupplementLogs } from "@/hooks/use-supplement-logs";
import { useProtocols, type Protocol, type ProtocolSupplement } from "@/hooks/use-protocols";
import { differenceInCalendarDays, format } from "date-fns";
import { normaliseSupplementName } from "@/lib/supplement-normalise";

/**
 * Frequency-aware day count: how many days in a date range is a frequency scheduled?
 */
function countScheduledDays(frequency: string, startDate: string, endDateStr: string): number {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDateStr}T12:00:00`);
  let count = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const daysSinceStart = differenceInCalendarDays(d, start);
    const dayOfWeek = d.getDay();
    if (daysSinceStart < 0) continue;

    const f = frequency.toLowerCase();
    let due = true;
    if (f === "weekly" || f.includes("1x")) due = daysSinceStart % 7 === 0;
    else if (f.includes("2x")) due = dayOfWeek === 1 || dayOfWeek === 4;
    else if (f.includes("3x")) due = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
    else if (f === "5on/2off") due = dayOfWeek >= 1 && dayOfWeek <= 5;
    else if (f === "eod" || f.includes("every other")) due = daysSinceStart % 2 === 0;
    // daily, twice daily, etc. → due = true

    if (due) {
      // Count number of doses per day based on timing
      count++;
    }
  }
  return count;
}

/** How many dose windows per day (AM+PM = 2, otherwise 1) */
function dosesPerDay(timing?: string): number {
  const t = (timing || "AM").toUpperCase();
  if (t.includes("AM") && t.includes("PM")) return 2;
  if (t === "AM+PM" || t === "BOTH" || t.includes("SPLIT")) return 2;
  return 1;
}

export interface ProtocolAdherence {
  protocolId: string;
  protocolName: string;
  peptideAdherence: number | null; // percentage
  supplementAdherence: number | null; // percentage
  combinedAdherence: number | null; // percentage
  peptideCompleted: number;
  peptideTotal: number;
  supplementCompleted: number;
  supplementTotal: number;
}

export interface AdherenceResult {
  perProtocol: ProtocolAdherence[];
  overall: number | null; // average of all active protocol combined adherences
  totalPeptideRate: number | null;
  totalSupplementRate: number | null;
  isLoading: boolean;
}

export function useAdherence(): AdherenceResult {
  const { data: protocols = [], isLoading: protocolsLoading } = useProtocols();
  const { data: allInjections = [], isLoading: injectionsLoading } = useAllInjections();
  const { data: allSupplementLogs = [], isLoading: supplementsLoading } = useAllSupplementLogs();

  const isLoading = protocolsLoading || injectionsLoading || supplementsLoading;

  const result = useMemo(() => {
    const activeProtocols = protocols.filter((p) => p.status === "active");
    if (activeProtocols.length === 0) {
      return { perProtocol: [], overall: null, totalPeptideRate: null, totalSupplementRate: null };
    }

    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");

    const perProtocol: ProtocolAdherence[] = activeProtocols.map((protocol) => {
      // ── Peptide adherence ──
      const pepIds = new Set(protocol.peptides.map((pp) => pp.id));
      const protocolInj = allInjections.filter(
        (i) => i.protocol_peptide_id && pepIds.has(i.protocol_peptide_id)
      );
      const peptideCompleted = protocolInj.filter((i) => i.status === "completed").length;
      const peptideTotal = protocolInj.filter(
        (i) => i.status === "completed" || i.status === "skipped" || (i.status === "scheduled" && new Date(i.scheduled_time) < now)
      ).length;
      const peptideAdherence = peptideTotal > 0 ? Math.round((peptideCompleted / peptideTotal) * 100) : null;

      // ── Supplement adherence ──
      const supplements = (protocol.supplements || []) as ProtocolSupplement[];
      let supplementCompleted = 0;
      let supplementTotal = 0;

      if (supplements.length > 0) {
        const effectiveEnd = protocol.end_date && protocol.end_date < todayStr ? protocol.end_date : todayStr;
        
        for (const supp of supplements) {
          const canonicalName = normaliseSupplementName(supp.name);
          const scheduledDays = countScheduledDays(supp.frequency || "daily", protocol.start_date, effectiveEnd);
          const dPerDay = dosesPerDay(supp.timing);
          const totalDoses = scheduledDays * dPerDay;
          supplementTotal += totalDoses;

          // Count completed logs for this supplement in this protocol's date range
          const completedLogs = allSupplementLogs.filter((log) => {
            if (!log.completed) return false;
            if (log.date < protocol.start_date || log.date > effectiveEnd) return false;
            const logName = normaliseSupplementName(log.item.replace(/::(?:AM|PM)$/, ""));
            return logName === canonicalName && (log.protocol_id === protocol.id || log.protocol_id === null);
          });
          supplementCompleted += completedLogs.length;
        }
      }

      const supplementAdherence = supplementTotal > 0 ? Math.min(100, Math.round((supplementCompleted / supplementTotal) * 100)) : null;

      // ── Combined adherence ──
      const totalAll = peptideTotal + supplementTotal;
      const completedAll = peptideCompleted + supplementCompleted;
      const combinedAdherence = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : null;

      return {
        protocolId: protocol.id,
        protocolName: protocol.name,
        peptideAdherence,
        supplementAdherence,
        combinedAdherence,
        peptideCompleted,
        peptideTotal,
        supplementCompleted,
        supplementTotal,
      };
    });

    // Overall = average of all protocol combined adherences
    const validAdherences = perProtocol.filter((p) => p.combinedAdherence !== null);
    const overall = validAdherences.length > 0
      ? Math.round(validAdherences.reduce((sum, p) => sum + p.combinedAdherence!, 0) / validAdherences.length)
      : null;

    // Global peptide/supplement rates
    const totalPepCompleted = perProtocol.reduce((s, p) => s + p.peptideCompleted, 0);
    const totalPepTotal = perProtocol.reduce((s, p) => s + p.peptideTotal, 0);
    const totalSuppCompleted = perProtocol.reduce((s, p) => s + p.supplementCompleted, 0);
    const totalSuppTotal = perProtocol.reduce((s, p) => s + p.supplementTotal, 0);

    return {
      perProtocol,
      overall,
      totalPeptideRate: totalPepTotal > 0 ? Math.round((totalPepCompleted / totalPepTotal) * 100) : null,
      totalSupplementRate: totalSuppTotal > 0 ? Math.round((totalSuppCompleted / totalSuppTotal) * 100) : null,
    };
  }, [protocols, allInjections, allSupplementLogs]);

  return { ...result, isLoading };
}
