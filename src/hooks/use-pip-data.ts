import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function usePipConversations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["pip-conversations", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_conversations")
        .select("id, message, trigger_type, created_at")
        .eq("user_id", user!.id)
        .eq("direction", "outbound")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePipWellnessNotes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["pip-wellness-notes", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pip_wellness_notes")
        .select("id, note_type, context, protocol_day, created_at")
        .eq("user_id", user!.id)
        .eq("resolved", false)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTrajectoryScore() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["trajectory-score", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trajectory_scores")
        .select("*")
        .eq("user_id", user!.id)
        .order("week_start", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function usePipSettings() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["pip-settings", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("pip_paused_until, pip_frequency, pip_onboarding_done")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data as { pip_paused_until: string | null; pip_frequency: string | null; pip_onboarding_done: boolean | null };
    },
  });

  const updateFrequency = useMutation({
    mutationFn: async (frequency: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({ pip_frequency: frequency } as any)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pip-settings"] }),
  });

  const togglePause = useMutation({
    mutationFn: async (pause: boolean) => {
      const pauseUntil = pause
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null;
      const { error } = await supabase
        .from("profiles")
        .update({ pip_paused_until: pauseUntil } as any)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pip-settings"] }),
  });

  return { ...query, updateFrequency, togglePause };
}
