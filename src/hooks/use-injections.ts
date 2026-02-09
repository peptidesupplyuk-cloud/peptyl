import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export function useTodayInjections() {
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["injections_today", user?.id, today],
    enabled: !!user,
    queryFn: async () => {
      const startOfDay = `${today}T00:00:00.000Z`;
      const endOfDay = `${today}T23:59:59.999Z`;

      const { data, error } = await supabase
        .from("injection_logs")
        .select("*")
        .gte("scheduled_time", startOfDay)
        .lte("scheduled_time", endOfDay)
        .order("scheduled_time", { ascending: true });
      if (error) throw error;
      return (data ?? []) as InjectionLog[];
    },
  });
}

export function useAllInjections() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["injections_all", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("injection_logs")
        .select("*")
        .order("scheduled_time", { ascending: false })
        .limit(100);
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

      const { error } = await supabase.from("injection_logs").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["injections_today"] });
      qc.invalidateQueries({ queryKey: ["injections_all"] });
    },
  });
}
