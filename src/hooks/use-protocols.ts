import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ProtocolPeptide {
  id: string;
  protocol_id: string;
  peptide_name: string;
  dose_mcg: number;
  frequency: string;
  timing: string | null;
  route: string | null;
  notes: string | null;
}

export interface ProtocolSupplement {
  name: string;
  dose: string;
  frequency: string;
  timing?: string; // "AM" | "PM" | "AM+PM"
  drivenBy?: string[];
}

export interface Protocol {
  id: string;
  user_id: string;
  name: string;
  goal: string | null;
  status: string;
  start_date: string;
  end_date: string | null;
  disclaimer_accepted: boolean;
  created_at: string;
  updated_at: string;
  supplements: ProtocolSupplement[];
  notes: string | null;
  peptides: ProtocolPeptide[];
}

export function useProtocols() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["protocols", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: protocols, error } = await supabase
        .from("protocols")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const results: Protocol[] = [];
      for (const p of protocols ?? []) {
        const { data: peptides } = await supabase
          .from("protocol_peptides")
          .select("*")
          .eq("protocol_id", p.id);
        results.push({
          ...p,
          supplements: (Array.isArray(p.supplements) ? p.supplements : []) as unknown as ProtocolSupplement[],
          notes: p.notes ?? null,
          peptides: peptides ?? [],
        });
      }
      return results;
    },
  });
}

export function useCreateProtocol() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      name,
      goal,
      startDate,
      endDate,
      peptides,
      supplements,
      notes,
    }: {
      name: string;
      goal: string;
      startDate: string;
      endDate?: string;
      peptides: { peptide_name: string; dose_mcg: number; frequency: string; timing: string; route: string }[];
      supplements?: ProtocolSupplement[];
      notes?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Check for duplicate active/paused protocol with same name
      const { data: existing } = await supabase
        .from("protocols")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", name)
        .in("status", ["active", "paused"])
        .maybeSingle();

      if (existing) {
        throw new Error("A protocol with this name is already active.");
      }

      const { data: protocol, error } = await supabase
        .from("protocols")
        .insert({
          user_id: user.id,
          name,
          goal,
          start_date: startDate,
          end_date: endDate || null,
          disclaimer_accepted: true,
          supplements: (supplements || []) as any,
          notes: notes || null,
        })
        .select()
        .single();
      if (error) throw error;

      if (peptides.length > 0) {
        const rows = peptides.map((p) => ({ protocol_id: protocol.id, ...p }));
        const { error: pErr } = await supabase.from("protocol_peptides").insert(rows);
        if (pErr) throw pErr;
      }

      return protocol;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["protocols"] });
      qc.invalidateQueries({ queryKey: ["injections_today"] });
      qc.invalidateQueries({ queryKey: ["injections_all"] });
      qc.invalidateQueries({ queryKey: ["injections_date"] });
      qc.invalidateQueries({ queryKey: ["supplement-logs"] });
    },
  });
}

export function useUpdateProtocolStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("protocols").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["protocols"] }),
  });
}

export function useDeleteProtocol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Get protocol peptide IDs to clean up injection logs
      const { data: pepRows } = await supabase
        .from("protocol_peptides")
        .select("id")
        .eq("protocol_id", id);

      // Delete injection logs linked to this protocol's peptides
      if (pepRows && pepRows.length > 0) {
        const pepIds = pepRows.map((r) => r.id);
        const { error: logErr } = await supabase
          .from("injection_logs")
          .delete()
          .in("protocol_peptide_id", pepIds);
        if (logErr) throw logErr;
      }

      // Delete peptides first, then protocol
      const { error: pepErr } = await supabase.from("protocol_peptides").delete().eq("protocol_id", id);
      if (pepErr) throw pepErr;
      const { error } = await supabase.from("protocols").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["protocols"] });
      qc.invalidateQueries({ queryKey: ["injections_today"] });
      qc.invalidateQueries({ queryKey: ["injections_all"] });
      qc.invalidateQueries({ queryKey: ["injections_date"] });
    },
  });
}
