import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderCTA {
  label: string;
  href: string;
  variant: "primary" | "secondary" | "default";
}

export function useHeaderState(): HeaderCTA | null {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["header-state", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const uid = user!.id;

      // Check active protocol
      const { count: protocolCount } = await supabase
        .from("protocols")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid)
        .eq("status", "active");

      if (!protocolCount || protocolCount === 0) {
        return { label: "Start Protocol", href: "/dashboard?tab=protocols", variant: "primary" as const };
      }

      // Check bloodwork
      const { count: bloodworkCount } = await supabase
        .from("bloodwork_panels")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid);

      if (!bloodworkCount || bloodworkCount === 0) {
        return { label: "Log Bloodwork", href: "/dashboard?tab=bloodwork", variant: "secondary" as const };
      }

      // Check wearable
      const { count: whoopCount } = await supabase
        .from("whoop_connections")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid);
      const { count: fitbitCount } = await supabase
        .from("fitbit_connections")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid);

      if ((!whoopCount || whoopCount === 0) && (!fitbitCount || fitbitCount === 0)) {
        return { label: "Connect Wearable", href: "/dashboard?tab=wearables", variant: "secondary" as const };
      }

      // Check DNA
      const { count: dnaCount } = await supabase
        .from("dna_reports")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid);

      if (!dnaCount || dnaCount === 0) {
        return { label: "Upload DNA", href: "/dna", variant: "secondary" as const };
      }

      return { label: "My Health", href: "/dashboard", variant: "default" as const };
    },
  });

  if (!user) return null;
  return data ?? null;
}
