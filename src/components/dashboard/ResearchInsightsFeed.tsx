import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProtocols } from "@/hooks/use-protocols";
import { BookOpen, ExternalLink, FlaskConical, Dna, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const EVIDENCE_COLORS: Record<string, string> = {
  A: "bg-green-500/10 text-green-500 border-green-500/20",
  B: "bg-primary/10 text-primary border-primary/20",
  C: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  D: "bg-muted text-muted-foreground border-border",
};

const EVIDENCE_LABELS: Record<string, string> = {
  A: "Grade A",
  B: "Grade B",
  C: "Grade C",
  D: "Grade D",
};

interface InsightItem {
  id: string;
  title: string;
  ai_summary: string | null;
  published_date: string | null;
  source_url: string | null;
  compound_names: string[] | null;
  gene_names: string[] | null;
  evidence_level: string | null;
  dose_note: string | null;
  strength: string | null;
  matchedTags: string[];
}

const ResearchInsightsFeed = () => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const { data: protocols = [] } = useProtocols();

  // User's active peptide names
  const activePeptideNames = protocols
    .filter((p) => p.status === "active" || p.status === "paused")
    .flatMap((p) => p.peptides.map((pp: any) => pp.peptide_name.toLowerCase()));

  // User's profile (for current_compounds and DNA variants)
  const { data: profile } = useQuery({
    queryKey: ["profile-research-feed", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("current_compounds, research_goal")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const profileCompounds = (profile?.current_compounds || "")
    .toLowerCase()
    .split(/[,\s]+/)
    .map((s: string) => s.trim())
    .filter(Boolean);

  // User's DNA gene variants
  const { data: dnaReport } = useQuery({
    queryKey: ["dna-research-feed", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 15,
    queryFn: async () => {
      const { data } = await supabase
        .from("dna_reports")
        .select("report_json")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const geneVariants: string[] = [];
  if (dnaReport?.report_json) {
    const reportJson = dnaReport.report_json as any;
    const geneResults = reportJson?.gene_results || reportJson?.genes || [];
    if (Array.isArray(geneResults)) {
      geneResults.forEach((g: any) => {
        if (g?.gene) geneVariants.push(g.gene.toLowerCase());
      });
    }
  }

  const allUserTerms = [...new Set([...activePeptideNames, ...profileCompounds])];

  // Fetch approved research
  const { data: insights = [], isLoading } = useQuery({
    queryKey: ["research-insights", user?.id, allUserTerms.join(","), geneVariants.join(",")],
    enabled: !!user && (allUserTerms.length > 0 || geneVariants.length > 0),
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data } = await supabase
        .from("research_queue")
        .select("id, title, ai_summary, published_date, source_url, compound_names, gene_names, evidence_level, dose_note, strength")
        .eq("status", "approved")
        .eq("written_to_graph", true)
        .order("published_date", { ascending: false })
        .limit(30);

      if (!data) return [];

      const matched: InsightItem[] = [];
      for (const item of data) {
        const itemCompounds = (item.compound_names ?? []).map((c: string) => c.toLowerCase());
        const itemGenes = (item.gene_names ?? []).map((g: string) => g.toLowerCase());

        const matchedCompounds = allUserTerms.filter((t) =>
          itemCompounds.some((c) => c.includes(t) || t.includes(c))
        );
        const matchedGenes = geneVariants.filter((g) => itemGenes.includes(g));
        const matchedTags = [
          ...matchedCompounds.map((c) => c.charAt(0).toUpperCase() + c.slice(1)),
          ...matchedGenes.map((g) => g.toUpperCase()),
        ];

        if (matchedTags.length > 0) {
          matched.push({ ...item, matchedTags });
        }
      }

      return matched.slice(0, 8);
    },
  });

  if (isLoading || insights.length === 0) return null;

  const visibleInsights = expanded ? insights : insights.slice(0, 3);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
    } catch {
      return "";
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary/10 shrink-0">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-foreground text-sm">Research Updates</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              New peer-reviewed studies matched to your stack
            </p>
          </div>
        </div>
        <span className="text-[10px] text-primary bg-primary/10 rounded-full px-2 py-0.5 shrink-0 mt-1">
          Updated daily
        </span>
      </div>

      {/* Cards */}
      <div className="px-5 pb-2 space-y-3">
        {visibleInsights.map((item) => {
          const summary = item.ai_summary
            ? item.ai_summary.split(".")[0].slice(0, 140) + (item.ai_summary.length > 140 ? "…" : ".")
            : item.title.slice(0, 140);

          const evidenceLevel = (item.evidence_level || "").toUpperCase();

          return (
            <div
              key={item.id}
              className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2.5"
            >
              {/* Top row: date + evidence badge */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">
                    New Research
                  </span>
                  {item.published_date && (
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(item.published_date)}
                    </span>
                  )}
                </div>
                {evidenceLevel && EVIDENCE_COLORS[evidenceLevel] && (
                  <span
                    className={`text-[10px] border rounded-full px-2 py-0.5 font-medium ${EVIDENCE_COLORS[evidenceLevel]}`}
                  >
                    {EVIDENCE_LABELS[evidenceLevel] || `Grade ${evidenceLevel}`}
                  </span>
                )}
              </div>

              {/* Summary */}
              <p className="text-xs text-foreground leading-relaxed">{summary}</p>

              {/* Matched tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-muted-foreground">Relevant to:</span>
                {item.matchedTags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary rounded-full px-2 py-0.5"
                  >
                    {tag.includes("-") || tag.length <= 6 ? (
                      <Dna className="h-2.5 w-2.5" />
                    ) : (
                      <FlaskConical className="h-2.5 w-2.5" />
                    )}
                    {tag}
                  </span>
                ))}
                {item.matchedTags.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{item.matchedTags.length - 3} more
                  </span>
                )}
              </div>

              {/* Dose note + source */}
              <div className="flex items-center justify-between gap-2">
                {item.dose_note && (
                  <p className="text-[10px] text-muted-foreground italic truncate max-w-[60%]">
                    Dose: {item.dose_note}
                  </p>
                )}
                {item.source_url && (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-1 text-[10px] text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View source
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expand/collapse */}
      {insights.length > 3 && (
        <div className="px-5 pb-4 pt-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" /> View all {insights.length} updates
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ResearchInsightsFeed;
