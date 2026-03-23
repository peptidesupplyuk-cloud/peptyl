import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface InjectionLog {
  id: string;
  user_id: string;
  protocol_peptide_id: string | null;
  peptide_name: string;
  dose_mcg: number;
  scheduled_time: string;
  completed_at: string | null;
  status: string;
  injection_site: string | null;
  side_effects: string | null;
  notes: string | null;
  created_at: string;
}

// Module-level mutex to prevent concurrent auto-generation
let generatingForDate: string | null = null;

/** Check if a peptide is due today based on its frequency */
function isDueToday(frequency: string, protocolStartDate: string): boolean {
  const today = new Date();
  const start = new Date(protocolStartDate);
  const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const dayOfWeek = today.getDay(); // 0=Sun

  switch (frequency.toLowerCase()) {
    case "daily":
      return true;
    case "weekly":
      return daysSinceStart % 7 === 0;
    case "2x/week":
      return dayOfWeek === 1 || dayOfWeek === 4; // Mon, Thu
    case "3x/week":
      return dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5; // Mon, Wed, Fri
    case "5on/2off":
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Weekdays
    case "eod":
    case "every other day":
      return daysSinceStart % 2 === 0;
    default:
      return true;
  }
}

export function useDateInjections(date: Date) {
  const { user } = useAuth();
  const dateStr = date.toISOString().split("T")[0];
  const isToday = dateStr === new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["injections_date", user?.id, dateStr],
    enabled: !!user,
    queryFn: async () => {
      const startOfDay = `${dateStr}T00:00:00.000Z`;
      const endOfDay = `${dateStr}T23:59:59.999Z`;

      const { data: existing, error } = await supabase
        .from("injection_logs")
        .select("*")
        .gte("scheduled_time", startOfDay)
        .lte("scheduled_time", endOfDay)
        .order("scheduled_time", { ascending: true });
      if (error) throw error;

      return (existing ?? []) as InjectionLog[];
    },
  });
}

export function useTodayInjections() {
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["injections_today", user?.id, today],
    enabled: !!user,
    queryFn: async () => {
      const startOfDay = `${today}T00:00:00.000Z`;
      const endOfDay = `${today}T23:59:59.999Z`;

      // Check existing logs for today
      const { data: existing, error } = await supabase
        .from("injection_logs")
        .select("*")
        .gte("scheduled_time", startOfDay)
        .lte("scheduled_time", endOfDay)
        .order("scheduled_time", { ascending: true });
      if (error) throw error;

      if (existing && existing.length > 0) {
        // Still backfill past days in the background (non-blocking)
        backfillMissingDays(user!.id).catch(() => {});
        return existing as InjectionLog[];
      }

      // Mutex: prevent concurrent auto-generation
      if (generatingForDate === today) {
        return [];
      }
      generatingForDate = today;

      // No logs yet — auto-generate from active protocols (exclude expired ones)
      const { data: protocols } = await supabase
        .from("protocols")
        .select("*")
        .eq("status", "active");

      // Filter out protocols whose end_date has passed
      const activeProtocols = (protocols || []).filter(p => {
        if (!p.end_date) return true;
        return p.end_date >= today;
      });

      if (activeProtocols.length === 0) return [];

      // Gather all peptides from all active protocols
      const logsToInsert: Array<{
        user_id: string;
        peptide_name: string;
        dose_mcg: number;
        scheduled_time: string;
        protocol_peptide_id: string;
        status: string;
      }> = [];

      for (const protocol of activeProtocols) {
        const { data: peptides } = await supabase
          .from("protocol_peptides")
          .select("*")
          .eq("protocol_id", protocol.id);

        if (!peptides) continue;

        for (const pep of peptides) {
          if (!isDueToday(pep.frequency, protocol.start_date)) continue;

          const timings: string[] = [];
          const timing = (pep.timing || "AM").toUpperCase();
          if (timing.includes("AM")) timings.push("09:00");
          if (timing.includes("PM") || timing.includes("BED")) timings.push("21:00");
          if (timings.length === 0) timings.push("09:00");

          for (const t of timings) {
            logsToInsert.push({
              user_id: user!.id,
              peptide_name: pep.peptide_name,
              dose_mcg: pep.dose_mcg,
              scheduled_time: `${today}T${t}:00.000Z`,
              protocol_peptide_id: pep.id,
              status: "scheduled",
            });
          }
        }
      }

      if (logsToInsert.length === 0) {
        generatingForDate = null;
        return [];
      }

      try {
        const { error: insertErr } = await supabase
          .from("injection_logs")
          .insert(logsToInsert);

        if (insertErr && !String(insertErr.message || "").toLowerCase().includes("duplicate")) {
          throw insertErr;
        }

        // Backfill past days too
        backfillMissingDays(user!.id).catch(() => {});

        // Re-fetch to get updated data
        const { data: final } = await supabase
          .from("injection_logs")
          .select("*")
          .gte("scheduled_time", `${today}T00:00:00.000Z`)
          .lte("scheduled_time", `${today}T23:59:59.999Z`)
          .order("scheduled_time", { ascending: true });

        return (final ?? []) as InjectionLog[];
      } finally {
        generatingForDate = null;
      }
    },
  });
}

/** Check if a peptide is due on a specific date based on its frequency */
function isDueOnDate(frequency: string, protocolStartDate: string, targetDate: Date): boolean {
  const start = new Date(protocolStartDate);
  const daysSinceStart = Math.floor((targetDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const dayOfWeek = targetDate.getDay();

  switch (frequency.toLowerCase()) {
    case "daily":
      return true;
    case "weekly":
      return daysSinceStart % 7 === 0;
    case "2x/week":
      return dayOfWeek === 1 || dayOfWeek === 4;
    case "3x/week":
      return dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
    case "5on/2off":
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case "eod":
    case "every other day":
      return daysSinceStart % 2 === 0;
    default:
      return true;
  }
}

// Module-level flag to prevent concurrent backfill
let backfillRunning = false;

/**
 * Backfill missing injection_log rows for past days since each active protocol started.
 * Creates them with status="scheduled" so adherence correctly shows them as missed.
 */
async function backfillMissingDays(userId: string) {
  if (backfillRunning) return;
  backfillRunning = true;

  try {
    const { data: protocols } = await supabase
      .from("protocols")
      .select("*")
      .in("status", ["active", "paused"]);

    if (!protocols || protocols.length === 0) return;

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    for (const protocol of protocols) {
      const { data: peptides } = await supabase
        .from("protocol_peptides")
        .select("*")
        .eq("protocol_id", protocol.id);

      if (!peptides || peptides.length === 0) continue;

      const protocolStart = new Date(protocol.start_date);
      const logsToInsert: Array<{
        user_id: string;
        peptide_name: string;
        dose_mcg: number;
        scheduled_time: string;
        protocol_peptide_id: string;
        status: string;
      }> = [];

      // Determine the effective end for backfill (don't backfill past end_date)
      const backfillEnd = protocol.end_date && new Date(protocol.end_date) < today
        ? new Date(protocol.end_date)
        : today;

      // Iterate from protocol start to the effective end (today is handled by useTodayInjections)
      for (let d = new Date(protocolStart); d <= backfillEnd; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        if (dateStr === todayStr) continue; // Skip today

        for (const pep of peptides) {
          if (!isDueOnDate(pep.frequency, protocol.start_date, d)) continue;

          const timings: string[] = [];
          const timing = (pep.timing || "AM").toUpperCase();
          if (timing.includes("AM")) timings.push("09:00");
          if (timing.includes("PM") || timing.includes("BED")) timings.push("21:00");
          if (timings.length === 0) timings.push("09:00");

          for (const t of timings) {
            logsToInsert.push({
              user_id: userId,
              peptide_name: pep.peptide_name,
              dose_mcg: pep.dose_mcg,
              scheduled_time: `${dateStr}T${t}:00.000Z`,
              protocol_peptide_id: pep.id,
              status: "scheduled", // Will show as "missed" since time has passed
            });
          }
        }
      }

      if (logsToInsert.length > 0) {
        const { data: existingLogs } = await supabase
          .from("injection_logs")
          .select("protocol_peptide_id, scheduled_time")
          .eq("user_id", userId)
          .in("protocol_peptide_id", peptides.map((pep) => pep.id))
          .gte("scheduled_time", `${protocol.start_date}T00:00:00.000Z`)
          .lt("scheduled_time", `${todayStr}T00:00:00.000Z`);

        const existingKeys = new Set(
          (existingLogs || []).map((log) => `${log.protocol_peptide_id}||${log.scheduled_time}`)
        );

        const missingLogs = logsToInsert.filter(
          (log) => !existingKeys.has(`${log.protocol_peptide_id}||${log.scheduled_time}`)
        );

        if (missingLogs.length > 0) {
          for (let i = 0; i < missingLogs.length; i += 100) {
            const batch = missingLogs.slice(i, i + 100);
            await supabase.from("injection_logs").insert(batch);
          }
        }
      }
    }
  } finally {
    backfillRunning = false;
  }
}

export function useAllInjections() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["injections_all", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Trigger backfill before fetching
      await backfillMissingDays(user!.id);

      const { data, error } = await supabase
        .from("injection_logs")
        .select("*")
        .order("scheduled_time", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return (data ?? []) as InjectionLog[];
    },
  });
}

export function useLogInjection() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (log: {
      peptide_name: string;
      dose_mcg: number;
      scheduled_time: string;
      status?: string;
      injection_site?: string;
      notes?: string;
      side_effects?: string;
      protocol_peptide_id?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("injection_logs").insert({
        user_id: user.id,
        ...log,
        status: log.status || "scheduled",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["injections_today"] });
      qc.invalidateQueries({ queryKey: ["injections_all"] });
    },
  });
}

export function useUpdateInjectionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes, side_effects, injection_site }: {
      id: string;
      status: string;
      notes?: string;
      side_effects?: string;
      injection_site?: string;
    }) => {
      const update: Record<string, unknown> = { status };
      if (status === "completed") update.completed_at = new Date().toISOString();
      if (notes !== undefined) update.notes = notes;
      if (side_effects !== undefined) update.side_effects = side_effects;
      if (injection_site !== undefined) update.injection_site = injection_site;

      const { data, error } = await supabase
        .from("injection_logs")
        .update(update)
        .eq("id", id)
        .select();
      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await qc.cancelQueries({ queryKey: ["injections_today"] });
      await qc.cancelQueries({ queryKey: ["injections_date"] });

      // Snapshot previous values for rollback
      const prevToday = qc.getQueriesData<InjectionLog[]>({ queryKey: ["injections_today"] });
      const prevDate = qc.getQueriesData<InjectionLog[]>({ queryKey: ["injections_date"] });

      // Optimistically update all injection query caches
      const updater = (old: InjectionLog[] | undefined) => {
        if (!old) return old;
        return old.map((inj) =>
          inj.id === id
            ? { ...inj, status, completed_at: status === "completed" ? new Date().toISOString() : inj.completed_at }
            : inj
        );
      };

      qc.setQueriesData<InjectionLog[]>({ queryKey: ["injections_today"] }, updater);
      qc.setQueriesData<InjectionLog[]>({ queryKey: ["injections_date"] }, updater);

      return { prevToday, prevDate };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.prevToday) {
        for (const [key, data] of context.prevToday) {
          qc.setQueryData(key, data);
        }
      }
      if (context?.prevDate) {
        for (const [key, data] of context.prevDate) {
          qc.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      // Always refetch after mutation settles to ensure consistency
      qc.invalidateQueries({ queryKey: ["injections_today"] });
      qc.invalidateQueries({ queryKey: ["injections_all"] });
      qc.invalidateQueries({ queryKey: ["injections_date"] });
    },
  });
}
