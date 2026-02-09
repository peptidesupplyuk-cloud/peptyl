import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface BloodworkPanel {
  id: string;
  user_id: string;
  test_date: string;
  panel_type: string;
  created_at: string;
  markers: { marker_name: string; value: number; unit: string }[];
}

export function useBloodworkPanels() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bloodwork_panels", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: panels, error } = await supabase
        .from("bloodwork_panels")
        .select("*")
        .order("test_date", { ascending: false });
      if (error) throw error;

      const results: BloodworkPanel[] = [];
      for (const p of panels ?? []) {
        const { data: markers } = await supabase
          .from("bloodwork_markers")
          .select("marker_name, value, unit")
          .eq("panel_id", p.id);
        results.push({ ...p, markers: markers ?? [] });
      }
      return results;
    },
  });
}

export function useSaveBloodwork() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      testDate,
      panelType,
      markers,
    }: {
      testDate: string;
      panelType: string;
      markers: { marker_name: string; value: number; unit: string }[];
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: panel, error: pErr } = await supabase
        .from("bloodwork_panels")
        .insert({ user_id: user.id, test_date: testDate, panel_type: panelType })
        .select()
        .single();
      if (pErr) throw pErr;

      const rows = markers
        .filter((m) => m.value !== null && m.value !== undefined && !isNaN(m.value))
        .map((m) => ({ panel_id: panel.id, marker_name: m.marker_name, value: m.value, unit: m.unit }));

      if (rows.length > 0) {
        const { error: mErr } = await supabase.from("bloodwork_markers").insert(rows);
        if (mErr) throw mErr;
      }

      return panel;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bloodwork_panels"] }),
  });
}
