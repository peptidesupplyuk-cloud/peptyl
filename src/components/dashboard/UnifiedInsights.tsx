import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Dna, Droplets, Activity, ArrowRight, TrendingUp, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBloodworkPanels } from "@/hooks/use-bloodwork";
import { useProtocols } from "@/hooks/use-protocols";
import { BIOMARKERS, getMarkerStatus } from "@/data/biomarker-ranges";
import { format, subDays } from "date-fns";

interface Insight {
  id: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  sources: string[];
  type: "cross-reference" | "opportunity" | "validation";
}

const UnifiedInsights = () => {
  const { user } = useAuth();
  const { data: panels = [] } = useBloodworkPanels();
  const { data: protocols = [] } = useProtocols();

  const { data: dnaReport } = useQuery({
    queryKey: ["unified-insights-dna", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const { data } = await supabase
        .from("dna_reports")
        .select("report_json, overall_score")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const sevenDaysAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: recentWearable = [] } = useQuery({
    queryKey: ["unified-insights-wearable", user?.id, sevenDaysAgo],
    enabled: !!user,
    staleTime: 1000 * 60 * 15,
    queryFn: async () => {
      const { data } = await supabase
        .from("whoop_daily_metrics")
        .select("hrv, sleep_score, recovery_score")
        .eq("user_id", user!.id)
        .gte("date", sevenDaysAgo)
        .lte("date", today);
      return data || [];
    },
  });

  const insights = useMemo(() => {
    const results: Insight[] = [];
    const latestPanel = panels[0];
    const markerMap = latestPanel
      ? Object.fromEntries(latestPanel.markers.map((m: any) => [m.marker_name, m.value]))
      : {};
    const report = dnaReport?.report_json as any;
    const avgHRV = recentWearable.length > 0
      ? recentWearable.reduce((s, w) => s + (w.hrv || 0), 0) / recentWearable.filter(w => w.hrv).length
      : null;
    const avgSleep = recentWearable.length > 0
      ? recentWearable.reduce((s, w) => s + (w.sleep_score || 0), 0) / recentWearable.filter(w => w.sleep_score).length
      : null;
    const avgRecovery = recentWearable.length > 0
      ? recentWearable.reduce((s, w) => s + (w.recovery_score || 0), 0) / recentWearable.filter(w => w.recovery_score).length
      : null;

    // 1. DNA + Bloodwork cross-reference: Inflammation
    if (report?.flags && markerMap.hscrp !== undefined) {
      const inflammationFlags = (report.flags as any[])?.filter(
        (f: any) => f.category?.toLowerCase().includes("inflam") || f.gene?.toLowerCase().includes("il6") || f.gene?.toLowerCase().includes("tnf")
      );
      if (inflammationFlags?.length > 0 && markerMap.hscrp > 1.0) {
        results.push({
          id: "dna-blood-inflammation",
          icon: <Shield className="h-4 w-4 text-orange-400" />,
          title: "Genetic + Blood Inflammation Signal",
          body: `Your DNA shows ${inflammationFlags.length} inflammation-related variant${inflammationFlags.length > 1 ? "s" : ""}, and your hsCRP is elevated at ${markerMap.hscrp} mg/L. Consider prioritising anti-inflammatory protocols (BPC-157, Omega-3, curcumin).`,
          sources: ["DNA Report", "Bloodwork"],
          type: "cross-reference",
        });
      }
    }

    // 2. Low sleep + elevated cortisol
    if (avgSleep != null && avgSleep < 65 && markerMap.cortisol_am !== undefined) {
      const cortisol = markerMap.cortisol_am;
      if (cortisol > 550) {
        results.push({
          id: "sleep-cortisol",
          icon: <Activity className="h-4 w-4 text-indigo-400" />,
          title: "Poor Sleep + High Cortisol",
          body: `Your 7-day sleep score (${Math.round(avgSleep)}%) is low and morning cortisol is elevated (${cortisol} nmol/L). This combination accelerates ageing. Consider magnesium glycinate, ashwagandha, or Semax for cortisol regulation.`,
          sources: ["Wearable", "Bloodwork"],
          type: "cross-reference",
        });
      }
    }

    // 3. Good recovery + active protocol = validation
    if (avgRecovery != null && avgRecovery >= 65) {
      const activeProtocols = protocols.filter(p => p.status === "active");
      if (activeProtocols.length > 0) {
        results.push({
          id: "recovery-validation",
          icon: <TrendingUp className="h-4 w-4 text-emerald-400" />,
          title: "Protocol Well-Tolerated",
          body: `Your 7-day recovery average (${Math.round(avgRecovery)}%) suggests your body is adapting well to "${activeProtocols[0].name}". No adjustments recommended at this stage.`,
          sources: ["Wearable", "Protocol"],
          type: "validation",
        });
      }
    }

    // 4. DNA gene flags + no bloodwork = opportunity
    if (report?.flags && (report.flags as any[])?.length > 0 && panels.length === 0) {
      results.push({
        id: "dna-no-blood",
        icon: <Droplets className="h-4 w-4 text-blue-400" />,
        title: "Validate DNA Findings with Bloodwork",
        body: `Your DNA report flagged ${(report.flags as any[]).length} genetic variants. Blood testing will confirm whether these are actively expressing, making your protocol recommendations significantly more precise.`,
        sources: ["DNA Report"],
        type: "opportunity",
      });
    }

    // 5. Low HRV + active GH protocol
    if (avgHRV != null && avgHRV < 30) {
      const ghPeptides = protocols
        .filter(p => p.status === "active")
        .flatMap((p: any) => p.peptides)
        .filter((pp: any) => {
          const name = pp.peptide_name?.toLowerCase() || "";
          return name.includes("cjc") || name.includes("ipamorelin") || name.includes("mk-677");
        });
      if (ghPeptides.length > 0) {
        results.push({
          id: "low-hrv-gh",
          icon: <Activity className="h-4 w-4 text-amber-400" />,
          title: "Low HRV on GH Protocol",
          body: `Your HRV is low (${Math.round(avgHRV)}ms) while running growth hormone peptides. GH secretagogues can affect autonomic balance. Consider cycling off for 1 week if HRV doesn't recover.`,
          sources: ["Wearable", "Protocol"],
          type: "cross-reference",
        });
      }
    }

    // 6. Good vitamin D + DNA detox = opportunity
    if (markerMap.vitamin_d !== undefined && markerMap.vitamin_d >= 75) {
      const detoxFlags = (report?.flags as any[])?.filter(
        (f: any) => f.category?.toLowerCase().includes("detox") || f.gene?.toLowerCase().includes("gst") || f.gene?.toLowerCase().includes("cyp")
      );
      if (detoxFlags?.length > 0) {
        results.push({
          id: "vit-d-detox",
          icon: <Sparkles className="h-4 w-4 text-primary" />,
          title: "Strong Foundation for Detox Support",
          body: `Your Vitamin D is optimal (${markerMap.vitamin_d} nmol/L) which supports detoxification pathways. Your DNA shows ${detoxFlags.length} detox-related variants — consider adding NAC or glutathione support.`,
          sources: ["Bloodwork", "DNA Report"],
          type: "opportunity",
        });
      }
    }

    return results.slice(0, 3);
  }, [panels, dnaReport, recentWearable, protocols]);

  if (insights.length === 0) return null;

  const sourceBadge = (source: string) => {
    const icons: Record<string, React.ReactNode> = {
      "DNA Report": <Dna className="h-2.5 w-2.5" />,
      "Bloodwork": <Droplets className="h-2.5 w-2.5" />,
      "Wearable": <Activity className="h-2.5 w-2.5" />,
      "Protocol": <TrendingUp className="h-2.5 w-2.5" />,
    };
    return (
      <span key={source} className="inline-flex items-center gap-1 text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
        {icons[source]} {source}
      </span>
    );
  };

  return (
    <motion.div
      className="rounded-2xl border border-border bg-card overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header with ambient glow */}
      <div className="relative p-5">
        <div
          className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full opacity-15 blur-[40px]"
          style={{ background: "hsl(var(--primary))" }}
        />
        <div className="relative flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-heading font-semibold text-foreground">Unified Health Insights</h3>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium ml-auto">
            AI Cross-Reference
          </span>
        </div>

        <div className="space-y-3">
          {insights.map((insight, idx) => (
            <motion.div
              key={insight.id}
              className="rounded-xl border border-border/40 bg-muted/10 p-4 space-y-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.15 }}
            >
              <div className="flex items-start gap-2.5">
                <div className="shrink-0 mt-0.5">{insight.icon}</div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.body}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {insight.sources.map(sourceBadge)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default UnifiedInsights;
