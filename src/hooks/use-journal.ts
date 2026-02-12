import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type JournalEntry = {
  id: string;
  user_id: string;
  content: string;
  peptides: string[];
  summary: string | null;
  evidence_quality: string | null;
  findings_count: number | null;
  article_id: string | null;
  created_at: string;
};

export function useJournalEntries() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["journal_entries", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as JournalEntry[];
    },
  });
}

export function useAddJournalEntry() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (entry: {
      content: string;
      peptides: string[];
      summary: string | null;
      evidence_quality: string | null;
      findings_count: number | null;
      article_id?: string | null;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({
          user_id: user.id,
          content: entry.content,
          peptides: entry.peptides,
          summary: entry.summary,
          evidence_quality: entry.evidence_quality,
          findings_count: entry.findings_count,
          article_id: entry.article_id || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as JournalEntry;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal_entries"] });
    },
  });
}

export function useDeleteJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("journal_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal_entries"] });
    },
  });
}
