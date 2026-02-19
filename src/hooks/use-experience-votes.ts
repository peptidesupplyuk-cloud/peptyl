import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface VoteCounts {
  [experienceKey: string]: { upvotes: number; downvotes: number };
}

export function useExperienceVotes(peptideName: string) {
  return useQuery({
    queryKey: ["experience-votes", peptideName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("peptide_experience_votes")
        .select("experience_key, vote_type")
        .eq("peptide_name", peptideName);
      if (error) throw error;

      const counts: VoteCounts = {};
      for (const row of data ?? []) {
        if (!counts[row.experience_key]) {
          counts[row.experience_key] = { upvotes: 0, downvotes: 0 };
        }
        if (row.vote_type === "up") counts[row.experience_key].upvotes++;
        else counts[row.experience_key].downvotes++;
      }
      return counts;
    },
  });
}

export function useMyVotes(peptideName: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-experience-votes", peptideName, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("peptide_experience_votes")
        .select("experience_key, vote_type")
        .eq("peptide_name", peptideName)
        .eq("user_id", user!.id);
      if (error) throw error;

      const map: Record<string, "up" | "down"> = {};
      for (const row of data ?? []) {
        map[row.experience_key] = row.vote_type as "up" | "down";
      }
      return map;
    },
  });
}

export function useVoteMutation(peptideName: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      experienceKey,
      direction,
    }: {
      experienceKey: string;
      direction: "up" | "down";
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Check if vote exists
      const { data: existing } = await supabase
        .from("peptide_experience_votes")
        .select("id, vote_type")
        .eq("user_id", user.id)
        .eq("peptide_name", peptideName)
        .eq("experience_key", experienceKey)
        .maybeSingle();

      if (existing) {
        if (existing.vote_type === direction) {
          // Remove vote (toggle off)
          await supabase.from("peptide_experience_votes").delete().eq("id", existing.id);
        } else {
          // Change direction
          await supabase
            .from("peptide_experience_votes")
            .update({ vote_type: direction })
            .eq("id", existing.id);
        }
      } else {
        // Insert new vote
        await supabase.from("peptide_experience_votes").insert({
          user_id: user.id,
          peptide_name: peptideName,
          experience_key: experienceKey,
          vote_type: direction,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["experience-votes", peptideName] });
      qc.invalidateQueries({ queryKey: ["my-experience-votes", peptideName] });
    },
  });
}

export interface CommunityReport {
  journal_id: string;
  summary: string;
  evidence_quality: string | null;
  created_at: string;
}

export function useCommunityReports(peptideName: string) {
  return useQuery({
    queryKey: ["community-reports", peptideName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("id, summary, evidence_quality, created_at")
        .contains("peptides", [peptideName])
        .not("summary", "is", null)
        .neq("summary", "")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []).map(d => ({ ...d, journal_id: d.id })) as CommunityReport[];
    },
  });
}
