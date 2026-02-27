import { Users, FlaskConical, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SimilarUserRec {
  peptide_name: string;
  usage_count: number;
  avg_dose_mcg: number;
  common_goal: string | null;
}

const CollaborativeRecommendations = () => {
  const { user } = useAuth();

  const { data: recs = [], isLoading } = useQuery({
    queryKey: ["collaborative-recs", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 30, // 30 min cache
    queryFn: async () => {
      // Get current user's profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("research_goal, age, gender")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!profile?.research_goal) return [];

      // Get current user's peptides to exclude
      const { data: myProtocols } = await supabase
        .from("protocols")
        .select("id")
        .eq("user_id", user!.id);

      const myProtocolIds = (myProtocols ?? []).map((p) => p.id);

      let myPeptideNames: string[] = [];
      if (myProtocolIds.length > 0) {
        const { data: myPeptides } = await supabase
          .from("protocol_peptides")
          .select("peptide_name")
          .in("protocol_id", myProtocolIds);
        myPeptideNames = [...new Set((myPeptides ?? []).map((p) => p.peptide_name))];
      }

      // Find users with same research goal
      const { data: similarProfiles } = await supabase
        .from("profiles")
        .select("user_id, research_goal")
        .eq("research_goal", profile.research_goal)
        .neq("user_id", user!.id)
        .limit(50);

      if (!similarProfiles?.length || similarProfiles.length < 3) return [];

      const similarUserIds = similarProfiles.map((p) => p.user_id);

      // Get their protocols
      const { data: theirProtocols } = await supabase
        .from("protocols")
        .select("id, goal")
        .in("user_id", similarUserIds);

      if (!theirProtocols?.length) return [];

      const theirProtocolIds = theirProtocols.map((p) => p.id);
      const goalMap = Object.fromEntries(theirProtocols.map((p) => [p.id, p.goal]));

      // Get their peptides
      const { data: theirPeptides } = await supabase
        .from("protocol_peptides")
        .select("peptide_name, dose_mcg, protocol_id")
        .in("protocol_id", theirProtocolIds);

      if (!theirPeptides?.length) return [];

      // Aggregate: count usage, avg dose, exclude user's own peptides
      const peptideStats: Record<string, { count: number; totalDose: number; goals: string[] }> = {};
      
      for (const pp of theirPeptides) {
        if (myPeptideNames.includes(pp.peptide_name)) continue;
        
        if (!peptideStats[pp.peptide_name]) {
          peptideStats[pp.peptide_name] = { count: 0, totalDose: 0, goals: [] };
        }
        peptideStats[pp.peptide_name].count++;
        peptideStats[pp.peptide_name].totalDose += pp.dose_mcg;
        const goal = goalMap[pp.protocol_id];
        if (goal && !peptideStats[pp.peptide_name].goals.includes(goal)) {
          peptideStats[pp.peptide_name].goals.push(goal);
        }
      }

      return Object.entries(peptideStats)
        .map(([name, stats]) => ({
          peptide_name: name,
          usage_count: stats.count,
          avg_dose_mcg: Math.round(stats.totalDose / stats.count),
          common_goal: stats.goals[0] || null,
        }))
        .filter((rec) => rec.usage_count >= 3)
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 4);
    },
  });

  if (isLoading || recs.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="font-heading font-semibold text-foreground">Users Like You Also Tried</h2>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        Based on members with a similar research goal
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {recs.map((rec) => (
          <div
            key={rec.peptide_name}
            className="bg-muted/50 rounded-xl p-3.5 space-y-2"
          >
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{rec.peptide_name}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>~{rec.avg_dose_mcg}mcg avg dose</span>
              <span>{rec.usage_count} user{rec.usage_count > 1 ? "s" : ""}</span>
            </div>
            {rec.common_goal && (
              <p className="text-[10px] text-muted-foreground italic">
                Goal: {rec.common_goal}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollaborativeRecommendations;
