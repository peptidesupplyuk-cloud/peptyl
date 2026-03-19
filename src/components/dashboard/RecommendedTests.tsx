import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, ExternalLink, ChevronDown, ChevronUp, FlaskConical, Sparkles, Clock } from "lucide-react";
import { useProtocols } from "@/hooks/use-protocols";
import { useBloodworkPanels } from "@/hooks/use-bloodwork";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";

interface TestPanel {
  id: string;
  name: string;
  reason: string;
  urgency: "now" | "soon" | "routine";
  markers: string[];
  medichecksCode?: string;
  price?: string;
}

const MEDICHECKS_PANELS: Record<string, { name: string; url: string; price: string; markers: string[] }> = {
  "advanced-well-man": {
    name: "Advanced Well Man",
    url: "https://www.medichecks.com/general-health/advanced-well-man-blood-test",
    price: "£99",
    markers: ["Total Testosterone", "Free Testosterone", "SHBG", "Oestradiol", "DHEA-S", "Cortisol", "Thyroid (TSH, FT3, FT4)", "Liver (ALT, AST)", "Kidney (Creatinine, eGFR)", "Lipids", "HbA1c", "Vitamin D", "Iron/Ferritin", "hsCRP"],
  },
  "advanced-well-woman": {
    name: "Advanced Well Woman",
    url: "https://www.medichecks.com/general-health/advanced-well-woman-blood-test",
    price: "£99",
    markers: ["Oestradiol", "FSH", "LH", "Testosterone", "SHBG", "Thyroid (TSH, FT3, FT4)", "Liver (ALT, AST)", "Kidney (Creatinine, eGFR)", "Lipids", "HbA1c", "Vitamin D", "Iron/Ferritin", "hsCRP"],
  },
  "sports-hormone": {
    name: "Sports Hormone Check",
    url: "https://www.medichecks.com/hormone-tests/sports-hormone-blood-test",
    price: "£69",
    markers: ["Total Testosterone", "Free Testosterone", "SHBG", "Cortisol", "DHEA-S", "IGF-1"],
  },
  "inflammation": {
    name: "Inflammation Check",
    url: "https://www.medichecks.com/general-health/inflammation-check",
    price: "£39",
    markers: ["hsCRP", "ESR"],
  },
  "thyroid": {
    name: "Advanced Thyroid Check",
    url: "https://www.medichecks.com/thyroid-tests/advanced-thyroid-function-blood-test",
    price: "£59",
    markers: ["TSH", "Free T3", "Free T4", "Thyroid Antibodies"],
  },
};

const RecommendedTests = () => {
  const { user } = useAuth();
  const { data: protocols = [] } = useProtocols();
  const { data: panels = [] } = useBloodworkPanels();
  const [expanded, setExpanded] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["rec-tests-profile", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("safety_sex, research_goal")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: hasDna } = useQuery({
    queryKey: ["rec-tests-dna", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const { count } = await supabase
        .from("dna_reports")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id);
      return (count ?? 0) > 0;
    },
  });

  const recommendations = useMemo(() => {
    const recs: TestPanel[] = [];
    const activeProtocols = protocols.filter((p) => p.status === "active");
    const lastTestDate = panels[0]?.test_date ? new Date(panels[0].test_date) : null;
    const daysSinceLastTest = lastTestDate ? differenceInDays(new Date(), lastTestDate) : null;
    const sex = profile?.safety_sex;

    // No bloodwork at all
    if (panels.length === 0) {
      const panelKey = sex === "female" ? "advanced-well-woman" : "advanced-well-man";
      const panel = MEDICHECKS_PANELS[panelKey];
      recs.push({
        id: "baseline",
        name: panel.name,
        reason: "Establish your baseline before starting any protocol. This comprehensive panel covers hormones, metabolic, inflammatory, and organ markers.",
        urgency: "now",
        markers: panel.markers,
        medichecksCode: panelKey,
        price: panel.price,
      });
    }

    // Active protocol > 8 weeks without retest
    for (const p of activeProtocols) {
      const daysActive = differenceInDays(new Date(), new Date(p.start_date));
      const hasRetest = panels.some(
        (panel) => panel.protocol_id === p.id && panel.panel_type?.startsWith("retest")
      );
      if (daysActive >= 56 && !hasRetest) {
        const panelKey = sex === "female" ? "advanced-well-woman" : "advanced-well-man";
        const panel = MEDICHECKS_PANELS[panelKey];
        recs.push({
          id: `retest-${p.id}`,
          name: `Retest — ${p.name}`,
          reason: `You've been on "${p.name}" for ${Math.round(daysActive / 7)} weeks. A follow-up blood test will show whether your biomarkers are responding.`,
          urgency: "now",
          markers: panel.markers,
          medichecksCode: panelKey,
          price: panel.price,
        });
      }
    }

    // Protocol-specific panels
    const peptideNames = activeProtocols.flatMap((p) => p.peptides.map((pp: any) => pp.peptide_name.toLowerCase()));
    if (peptideNames.some((n) => n.includes("bpc") || n.includes("tb-500") || n.includes("tb500"))) {
      recs.push({
        id: "inflammation-check",
        name: "Inflammation Check",
        reason: "Your protocol includes healing peptides. Tracking hsCRP will help monitor inflammation response.",
        urgency: "soon",
        markers: MEDICHECKS_PANELS.inflammation.markers,
        medichecksCode: "inflammation",
        price: MEDICHECKS_PANELS.inflammation.price,
      });
    }

    if (peptideNames.some((n) => n.includes("cjc") || n.includes("ipamorelin") || n.includes("mk-677") || n.includes("sermorelin"))) {
      recs.push({
        id: "sports-hormone",
        name: "Sports Hormone Check",
        reason: "Growth hormone secretagogues can affect IGF-1, cortisol, and testosterone. Track these for safety.",
        urgency: "soon",
        markers: MEDICHECKS_PANELS["sports-hormone"].markers,
        medichecksCode: "sports-hormone",
        price: MEDICHECKS_PANELS["sports-hormone"].price,
      });
    }

    if (peptideNames.some((n) => n.includes("thymosin") || n.includes("ta1") || n.includes("tα1"))) {
      recs.push({
        id: "thyroid-check",
        name: "Advanced Thyroid Check",
        reason: "Immune-modulating peptides can occasionally affect thyroid function. Monitor to ensure stability.",
        urgency: "routine",
        markers: MEDICHECKS_PANELS.thyroid.markers,
        medichecksCode: "thyroid",
        price: MEDICHECKS_PANELS.thyroid.price,
      });
    }

    // Stale bloodwork
    if (daysSinceLastTest && daysSinceLastTest > 90 && recs.length === 0) {
      const panelKey = sex === "female" ? "advanced-well-woman" : "advanced-well-man";
      const panel = MEDICHECKS_PANELS[panelKey];
      recs.push({
        id: "routine-retest",
        name: panel.name,
        reason: `Your last blood test was ${Math.round(daysSinceLastTest / 30)} months ago. Regular retesting (every 8–12 weeks) ensures you're tracking real changes.`,
        urgency: "routine",
        markers: panel.markers,
        medichecksCode: panelKey,
        price: panel.price,
      });
    }

    return recs;
  }, [protocols, panels, profile]);

  if (recommendations.length === 0) return null;

  const urgencyBadge = (urgency: TestPanel["urgency"]) => {
    switch (urgency) {
      case "now": return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">Recommended now</span>;
      case "soon": return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500">Within 2 weeks</span>;
      case "routine": return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Routine</span>;
    }
  };

  const displayed = expanded ? recommendations : recommendations.slice(0, 2);

  return (
    <motion.div
      className="rounded-2xl border border-border bg-card overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-heading font-semibold text-foreground">Recommended Blood Tests</h3>
          </div>
          <span className="text-[10px] text-muted-foreground">via Medichecks</span>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {displayed.map((rec, idx) => {
              const panel = rec.medichecksCode ? MEDICHECKS_PANELS[rec.medichecksCode] : null;
              return (
                <motion.div
                  key={rec.id}
                  className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">{rec.name}</p>
                        {urgencyBadge(rec.urgency)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{rec.reason}</p>
                    </div>
                    {rec.price && (
                      <span className="text-sm font-heading font-bold text-foreground shrink-0">{rec.price}</span>
                    )}
                  </div>

                  {/* Marker chips */}
                  <div className="flex flex-wrap gap-1">
                    {rec.markers.slice(0, 6).map((m) => (
                      <span key={m} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{m}</span>
                    ))}
                    {rec.markers.length > 6 && (
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">+{rec.markers.length - 6} more</span>
                    )}
                  </div>

                  {panel && (
                    <a
                      href={panel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                    >
                      Order from Medichecks <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {recommendations.length > 2 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-primary hover:underline mt-3 mx-auto"
          >
            {expanded ? "Show less" : `Show ${recommendations.length - 2} more`}
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default RecommendedTests;
