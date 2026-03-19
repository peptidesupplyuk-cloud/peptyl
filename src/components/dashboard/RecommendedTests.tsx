import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, ChevronDown, ChevronUp, FlaskConical, AlertTriangle, Clock, CalendarCheck } from "lucide-react";
import { useProtocols } from "@/hooks/use-protocols";
import { useBloodworkPanels } from "@/hooks/use-bloodwork";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";
import { BIOMARKERS, getMarkerStatus } from "@/data/biomarker-ranges";

/* ── Medichecks panel catalogue ─────────────────────────── */

const MEDICHECKS_PANELS: Record<string, { name: string; url: string; price: string; markers: string[]; categories: string[] }> = {
  "advanced-well-man": {
    name: "Advanced Well Man",
    url: "https://www.medichecks.com/general-health/advanced-well-man-blood-test",
    price: "£99",
    markers: ["Total Testosterone", "Free Testosterone", "SHBG", "Oestradiol", "DHEA-S", "Cortisol", "Thyroid (TSH, FT3, FT4)", "Liver (ALT, AST)", "Kidney (Creatinine, eGFR)", "Lipids", "HbA1c", "Vitamin D", "Iron/Ferritin", "hsCRP"],
    categories: ["Hormones", "Liver", "Kidney", "Lipids", "Metabolic", "Vitamins", "Inflammation", "Iron"],
  },
  "advanced-well-woman": {
    name: "Advanced Well Woman",
    url: "https://www.medichecks.com/general-health/advanced-well-woman-blood-test",
    price: "£99",
    markers: ["Oestradiol", "FSH", "LH", "Testosterone", "SHBG", "Thyroid (TSH, FT3, FT4)", "Liver (ALT, AST)", "Kidney (Creatinine, eGFR)", "Lipids", "HbA1c", "Vitamin D", "Iron/Ferritin", "hsCRP"],
    categories: ["Hormones", "Liver", "Kidney", "Lipids", "Metabolic", "Vitamins", "Inflammation", "Iron"],
  },
  "sports-hormone": {
    name: "Sports Hormone Check",
    url: "https://www.medichecks.com/hormone-tests/sports-hormone-blood-test",
    price: "£69",
    markers: ["Total Testosterone", "Free Testosterone", "SHBG", "Cortisol", "DHEA-S", "IGF-1"],
    categories: ["Hormones"],
  },
  inflammation: {
    name: "Inflammation Check",
    url: "https://www.medichecks.com/general-health/inflammation-check",
    price: "£39",
    markers: ["hsCRP", "ESR"],
    categories: ["Inflammation"],
  },
  thyroid: {
    name: "Advanced Thyroid Check",
    url: "https://www.medichecks.com/thyroid-tests/advanced-thyroid-function-blood-test",
    price: "£59",
    markers: ["TSH", "Free T3", "Free T4", "Thyroid Antibodies"],
    categories: ["Thyroid"],
  },
};

/* ── Marker → category mapping for follow-up matching ──── */

const MARKER_CATEGORY: Record<string, string> = {};
BIOMARKERS.forEach((b) => { MARKER_CATEGORY[b.key] = b.category; });

/* ── Types ──────────────────────────────────────────────── */

type Urgency = "now" | "soon" | "routine";

interface RecommendationGroup {
  id: string;
  urgency: Urgency;
  title: string;
  reasons: string[];
  suggestedPanel: string; // key into MEDICHECKS_PANELS
  /** Extra marker chips beyond what the panel already covers */
  focusMarkers: string[];
}

/* ── Component ──────────────────────────────────────────── */

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

  const recommendations = useMemo(() => {
    const groups: RecommendationGroup[] = [];
    const activeProtocols = protocols.filter((p) => p.status === "active");
    const latestPanel = panels[0];
    const lastTestDate = latestPanel?.test_date ? new Date(latestPanel.test_date) : null;
    const daysSinceLastTest = lastTestDate ? differenceInDays(new Date(), lastTestDate) : null;
    const sex = profile?.safety_sex;
    const comprehensiveKey = sex === "female" ? "advanced-well-woman" : "advanced-well-man";

    // ── Build marker status map from latest panel ──
    const offTrackMarkers: { key: string; name: string; value: number; status: string; category: string }[] = [];

    if (latestPanel?.markers) {
      for (const m of latestPanel.markers) {
        const def = BIOMARKERS.find((b) => b.key === m.marker_name || b.name === m.marker_name);
        if (!def || m.value == null) continue;
        const status = getMarkerStatus(def, m.value);
        if (status !== "optimal") {
          offTrackMarkers.push({
            key: def.key,
            name: def.name,
            value: m.value,
            status,
            category: def.category,
          });
        }
      }
    }

    const outOfRange = offTrackMarkers.filter((m) => m.status === "out_of_range");
    const suboptimal = offTrackMarkers.filter((m) => m.status === "suboptimal");

    // ── 1. No bloodwork → baseline ──
    if (panels.length === 0) {
      groups.push({
        id: "baseline",
        urgency: "now",
        title: "Establish Your Baseline",
        reasons: ["No bloodwork on file. A comprehensive panel covers hormones, metabolic, inflammatory, and organ markers — giving your recommendations a real foundation."],
        suggestedPanel: comprehensiveKey,
        focusMarkers: [],
      });
      return groups; // nothing else to say without data
    }

    // ── 2. Off-track markers → combined recommendation ──
    if (offTrackMarkers.length > 0) {
      const allCategories = [...new Set(offTrackMarkers.map((m) => m.category))];
      const bestPanel = pickBestPanel(allCategories, comprehensiveKey);
      const panelDef = MEDICHECKS_PANELS[bestPanel];

      // Check which off-track markers the suggested panel actually covers
      const coveredCategories = new Set(panelDef?.categories ?? []);
      const uncoveredMarkers = offTrackMarkers.filter((m) => !coveredCategories.has(m.category));

      // Build reason text combining out-of-range and suboptimal
      const reasons: string[] = [];
      if (outOfRange.length > 0) {
        const summary = outOfRange.map((m) => `${m.name} (${m.value} ${BIOMARKERS.find((b) => b.key === m.key)?.unit ?? ""})`).join(", ");
        reasons.push(`${summary} ${outOfRange.length > 1 ? "are" : "is"} outside reference range. Retest to confirm and track response to any changes you make.`);
      }
      if (suboptimal.length > 0) {
        const subNames = suboptimal.slice(0, 4).map((m) => m.name).join(", ");
        const extra = suboptimal.length > 4 ? ` and ${suboptimal.length - 4} more` : "";
        reasons.push(`${subNames}${extra} ${suboptimal.length > 1 ? "are" : "is"} suboptimal — tracking these will show if your interventions are working.`);
      }

      // Coverage gap: if the cheaper panel misses some markers, suggest upgrade
      if (uncoveredMarkers.length > 0 && bestPanel !== comprehensiveKey) {
        const compPanel = MEDICHECKS_PANELS[comprehensiveKey];
        const uncoveredNames = uncoveredMarkers.map((m) => m.name).join(", ");
        reasons.push(`⚠ This panel doesn't cover ${uncoveredNames}. The ${compPanel.name} (${compPanel.price}) covers all ${offTrackMarkers.length} markers in one test.`);
      }

      // If gaps exist, auto-upgrade to comprehensive
      const finalPanel = uncoveredMarkers.length > 0 ? comprehensiveKey : bestPanel;
      const urgency: Urgency = outOfRange.length > 0 ? "now" : "soon";

      groups.push({
        id: "off-track-combined",
        urgency,
        title: `${offTrackMarkers.length} Marker${offTrackMarkers.length > 1 ? "s" : ""} to Track`,
        reasons,
        suggestedPanel: finalPanel,
        focusMarkers: [
          ...outOfRange.map((m) => m.name),
          ...suboptimal.slice(0, 6 - outOfRange.length).map((m) => m.name),
        ],
      });
    }

    // ── 3. Active protocol > 8 weeks without retest ──
    for (const p of activeProtocols) {
      const daysActive = differenceInDays(new Date(), new Date(p.start_date));
      const hasRetest = panels.some(
        (panel) => panel.protocol_id === p.id && panel.panel_type?.startsWith("retest")
      );
      if (daysActive >= 56 && !hasRetest) {
        const weeksActive = Math.round(daysActive / 7);
        groups.push({
          id: `retest-${p.id}`,
          urgency: "soon",
          title: `Mid-Cycle Retest — ${p.name}`,
          reasons: [
            `${weeksActive} weeks into "${p.name}". A follow-up will show whether biomarkers are responding to your protocol.`,
            ...(offTrackMarkers.length > 0
              ? [`This will also track progress on your ${offTrackMarkers.length} off-track marker${offTrackMarkers.length > 1 ? "s" : ""}.`]
              : []),
          ],
          suggestedPanel: comprehensiveKey,
          focusMarkers: offTrackMarkers.slice(0, 4).map((m) => m.name),
        });
      }
    }

    // ── 4. Protocol-specific panels (only if not already covered above) ──
    const peptideNames = activeProtocols.flatMap((p) =>
      p.peptides.map((pp: any) => pp.peptide_name.toLowerCase())
    );
    const alreadyCoveredCategories = new Set(
      groups.flatMap((g) => MEDICHECKS_PANELS[g.suggestedPanel]?.categories ?? [])
    );

    if (
      peptideNames.some((n) => n.includes("cjc") || n.includes("ipamorelin") || n.includes("mk-677") || n.includes("sermorelin")) &&
      !alreadyCoveredCategories.has("Hormones")
    ) {
      groups.push({
        id: "sports-hormone",
        urgency: "soon",
        title: "GH Secretagogue Monitoring",
        reasons: ["Growth hormone peptides affect IGF-1, cortisol, and testosterone. Track these for safety."],
        suggestedPanel: "sports-hormone",
        focusMarkers: ["IGF-1", "Cortisol", "DHEA-S"],
      });
    }

    if (
      peptideNames.some((n) => n.includes("thymosin") || n.includes("ta1") || n.includes("tα1")) &&
      !alreadyCoveredCategories.has("Thyroid")
    ) {
      groups.push({
        id: "thyroid-check",
        urgency: "routine",
        title: "Thyroid Stability Check",
        reasons: ["Immune-modulating peptides can occasionally affect thyroid function. Monitor for stability."],
        suggestedPanel: "thyroid",
        focusMarkers: ["TSH", "Free T3", "Free T4"],
      });
    }

    // ── 6. Stale bloodwork fallback ──
    if (daysSinceLastTest && daysSinceLastTest > 90 && groups.length === 0) {
      groups.push({
        id: "routine-retest",
        urgency: "routine",
        title: "Routine Retest Due",
        reasons: [`Last blood test was ${Math.round(daysSinceLastTest / 30)} months ago. Regular retesting (every 8–12 weeks) ensures you're tracking real changes.`],
        suggestedPanel: comprehensiveKey,
        focusMarkers: [],
      });
    }

    // ── Deduplicate: if multiple groups suggest the same panel, merge ──
    return deduplicateGroups(groups);
  }, [protocols, panels, profile]);

  if (recommendations.length === 0) return null;

  const urgencyConfig: Record<Urgency, { label: string; icon: React.ReactNode; cls: string }> = {
    now: { label: "Recommended now", icon: <AlertTriangle className="h-3 w-3" />, cls: "bg-primary/15 text-primary" },
    soon: { label: "Within 2 weeks", icon: <Clock className="h-3 w-3" />, cls: "bg-amber-500/15 text-amber-500" },
    routine: { label: "Routine", icon: <CalendarCheck className="h-3 w-3" />, cls: "bg-muted text-muted-foreground" },
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
              const panel = MEDICHECKS_PANELS[rec.suggestedPanel];
              const urg = urgencyConfig[rec.urgency];
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
                        <p className="text-sm font-medium text-foreground">{rec.title}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${urg.cls}`}>
                          {urg.icon} {urg.label}
                        </span>
                      </div>
                      {rec.reasons.map((r, ri) => (
                        <p key={ri} className="text-xs text-muted-foreground mt-1 leading-relaxed">{r}</p>
                      ))}
                    </div>
                    {panel && (
                      <span className="text-sm font-heading font-bold text-foreground shrink-0">{panel.price}</span>
                    )}
                  </div>

                  {/* Focus markers */}
                  {rec.focusMarkers.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rec.focusMarkers.slice(0, 6).map((m) => (
                        <span key={m} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{m}</span>
                      ))}
                      {rec.focusMarkers.length > 6 && (
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">+{rec.focusMarkers.length - 6} more</span>
                      )}
                    </div>
                  )}

                  {/* Suggested panel link */}
                  {panel && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Suggested: {panel.name}</span>
                      <a
                        href={panel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                      >
                        Order <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
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

/* ── Helpers ────────────────────────────────────────────── */

/** Pick a panel that covers the most off-track categories */
function pickBestPanel(categories: string[], fallback: string): string {
  let best = fallback;
  let bestScore = 0;
  for (const [key, panel] of Object.entries(MEDICHECKS_PANELS)) {
    const overlap = panel.categories.filter((c) => categories.includes(c)).length;
    if (overlap > bestScore) {
      bestScore = overlap;
      best = key;
    }
  }
  return best;
}

/** Merge groups that recommend the same panel into one consolidated card */
function deduplicateGroups(groups: RecommendationGroup[]): RecommendationGroup[] {
  const byPanel = new Map<string, RecommendationGroup[]>();
  for (const g of groups) {
    const existing = byPanel.get(g.suggestedPanel) || [];
    existing.push(g);
    byPanel.set(g.suggestedPanel, existing);
  }

  const merged: RecommendationGroup[] = [];
  for (const [panelKey, items] of byPanel) {
    if (items.length === 1) {
      merged.push(items[0]);
      continue;
    }
    // Merge: take highest urgency, combine reasons and focus markers
    const urgencyOrder: Urgency[] = ["now", "soon", "routine"];
    const bestUrgency = urgencyOrder.find((u) => items.some((i) => i.urgency === u)) ?? "routine";
    const allReasons = items.flatMap((i) => i.reasons);
    const allFocus = [...new Set(items.flatMap((i) => i.focusMarkers))];

    merged.push({
      id: items.map((i) => i.id).join("+"),
      urgency: bestUrgency,
      title: items.length === 2 && items.some((i) => i.id.startsWith("retest-"))
        ? items.find((i) => !i.id.startsWith("retest-"))?.title + " + Mid-Cycle Retest"
        : items[0].title,
      reasons: allReasons,
      suggestedPanel: panelKey,
      focusMarkers: allFocus.slice(0, 8),
    });
  }

  // Sort by urgency
  const order: Record<Urgency, number> = { now: 0, soon: 1, routine: 2 };
  return merged.sort((a, b) => order[a.urgency] - order[b.urgency]);
}

export default RecommendedTests;
