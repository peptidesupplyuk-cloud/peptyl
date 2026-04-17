import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Loader2 } from "lucide-react";
import ReportScrollLayout, { type ReportSection } from "@/components/dna/report/ReportScrollLayout";
import HeroCard from "@/components/dna/report/HeroCard";
import UpgradeCTA from "@/components/dna/report/UpgradeCTA";
import TopFindings from "@/components/dna/TopFindings";
import FlagsPanel from "@/components/dna/FlagsPanel";
import HealthPriorities from "@/components/dna/HealthPriorities";
import ActionPlan from "@/components/dna/ActionPlan";
import CreateProtocolCTA from "@/components/dna/CreateProtocolCTA";
import SupplementTable from "@/components/dna/SupplementTable";
import PeptideProtocolPanel from "@/components/dna/PeptideProtocolPanel";
import HormonalAssessmentPanel from "@/components/dna/HormonalAssessmentPanel";
import GLP1AssessmentPanel from "@/components/dna/GLP1AssessmentPanel";
import PersonalisationCard from "@/components/dna/PersonalisationCard";
import GeneCards from "@/components/dna/GeneCards";
import BiomarkerBars from "@/components/dna/BiomarkerBars";
import DietRecommendations from "@/components/dna/DietRecommendations";
import TrainingRecommendations from "@/components/dna/TrainingRecommendations";
import DrugInteractionPanel from "@/components/dna/DrugInteractionPanel";
import OutcomeInsights from "@/components/dna/OutcomeInsights";
import CreateProtocolFromReport from "@/components/dna/CreateProtocolFromReport";
import LegalDisclaimer from "@/components/dna/LegalDisclaimer";
import ReportReview from "@/components/dna/ReportReview";
import ResearchCitations from "@/components/dna/ResearchCitations";
import ProtocolCrossReference from "@/components/dna/ProtocolCrossReference";
import { useAuth } from "@/contexts/AuthContext";

const DNAReport = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [review, setReview] = useState<{ rating: number; note: string | null } | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("dna_reports")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        navigate("/dna/dashboard", { replace: true });
        return;
      }
      setReport(data);

      if (user) {
        const { data: rev } = await supabase
          .from("dna_reviews" as any)
          .select("rating, note")
          .eq("report_id", id)
          .eq("user_id", user.id)
          .maybeSingle();
        setReview(rev as any ?? null);
      }

      setLoading(false);
    };
    fetchReport();
  }, [id, user]);

  const buildGenotypeKey = (geneResults: any[]) => {
    if (!geneResults?.length) return null;
    const priority = ['MTHFR', 'APOE', 'VDR'];
    const parts = priority
      .map(gene => geneResults.find((g: any) => g.gene === gene || g.rsid?.includes(gene)))
      .filter(Boolean)
      .map((g: any) => g.gene + '_' + (g.genotype || g.variant || 'unknown').replace(/\//g, ''));
    return parts.length > 0 ? parts.join('+') : null;
  };

  const cards = useMemo<ReportSection[]>(() => {
    if (!report) return [];
    const r = report.report_json || {};
    const isPro = report.assessment_tier === "pro";
    const isAdvanced = report.assessment_tier === "advanced" || isPro;
    const score = report.overall_score ?? r.health_score?.overall ?? 0;

    const result: ReportSection[] = [];

    // CARD 1 — Hero
    result.push({
      id: "hero",
      label: "Overview",
      content: (
        <HeroCard
          score={score}
          label={r.health_score?.label}
          tier={report.assessment_tier || "standard"}
          qualityScore={report.pipeline_quality_score}
          categories={r.health_score?.categories}
          personalisedSummary={r.personalised_summary}
        />
      ),
    });

    // CARD 2 — Top Findings
    if (r.gene_results?.length || r.biomarker_results?.length || r.flags) {
      result.push({
        id: "findings",
        label: "Top Findings",
        content: (
          <div className="space-y-8">
            <TopFindings geneResults={r.gene_results} biomarkerResults={r.biomarker_results} flags={r.flags} />
            <HealthPriorities priorities={r.health_priorities} />
          </div>
        ),
      });
    }

    // CARD 3 — Action Plan
    if (r.action_plan) {
      result.push({
        id: "action-plan",
        label: "Action Plan",
        content: (
          <div className="space-y-8">
            <ActionPlan plan={r.action_plan} />
            <CreateProtocolCTA supplements={r.supplement_protocol} peptides={r.peptide_protocol} reportId={id!} />
          </div>
        ),
      });
    }

    // CARD 4 — Supplements
    if (r.supplement_protocol?.length > 0) {
      result.push({
        id: "supplements",
        label: "Supplements",
        content: isAdvanced ? (
          <SupplementTable supplements={r.supplement_protocol} />
        ) : (
          <div className="space-y-6">
            <SupplementTable supplements={r.supplement_protocol} />
            <UpgradeCTA targetTier="advanced" feature="personalised dosing" />
          </div>
        ),
      });
    }

    // CARD 5 — Gene Results
    if (r.gene_results?.length > 0) {
      result.push({
        id: "genes",
        label: "Genetics",
        content: (
          <div className="space-y-6">
            {isAdvanced && <PersonalisationCard data={r.personalisation} />}
            <GeneCards genes={r.gene_results} />
          </div>
        ),
      });
    }

    // CARD 6 — Biomarkers
    if (r.biomarker_results?.length > 0) {
      result.push({
        id: "biomarkers",
        label: "Biomarkers",
        content: <BiomarkerBars biomarkers={r.biomarker_results} />,
      });
    }

    // CARD 7 — Diet (Advanced+)
    if (isAdvanced && r.diet_recommendations) {
      result.push({
        id: "diet",
        label: "Diet",
        content: <DietRecommendations data={r.diet_recommendations} />,
      });
    } else if (!isAdvanced && r.gene_results?.length) {
      result.push({
        id: "diet",
        label: "Diet",
        content: <UpgradeCTA targetTier="advanced" feature="diet recommendations" />,
      });
    }

    // CARD 8 — Training (Advanced+)
    if (isAdvanced && r.training_recommendations) {
      result.push({
        id: "training",
        label: "Training",
        content: <TrainingRecommendations data={r.training_recommendations} />,
      });
    }

    // CARD 9 — Hormonal (Advanced+)
    if (isAdvanced && r.hormonal_assessment?.triggered) {
      result.push({
        id: "hormonal",
        label: "Hormonal",
        content: (
          <div className="space-y-8">
            <HormonalAssessmentPanel hormonal={r.hormonal_assessment} />
            <GLP1AssessmentPanel glp1={r.glp1_assessment} />
          </div>
        ),
      });
    }

    // CARD 10 — Peptides (Pro only)
    if (isPro && r.peptide_protocol?.length > 0) {
      result.push({
        id: "peptides",
        label: "Peptides",
        content: <PeptideProtocolPanel peptides={r.peptide_protocol} />,
      });
    } else if (!isPro) {
      result.push({
        id: "peptides",
        label: "Peptides",
        content: <UpgradeCTA targetTier="pro" feature="peptide recommendations" />,
      });
    }

    // CARD 11 — Protocol Cross-Reference (Pro)
    if (isPro && r.protocol_cross_reference) {
      result.push({
        id: "cross-ref",
        label: "Cross-Reference",
        content: <ProtocolCrossReference data={r.protocol_cross_reference} />,
      });
    }

    // CARD 12 — Predicted Outcomes
    if (id) {
      result.push({
        id: "outcomes",
        label: "Outcomes",
        content: <OutcomeInsights reportId={id} genotypeKey={buildGenotypeKey(r.gene_results)} />,
      });
    }

    // CARD 13 — Flags & Safety
    if (r.flags || r.drug_interactions?.length > 0) {
      result.push({
        id: "safety",
        label: "Safety",
        content: (
          <div className="space-y-8">
            <FlagsPanel flags={r.flags} />
            <DrugInteractionPanel interactions={r.drug_interactions} />
          </div>
        ),
      });
    }

    // CARD 14 — Research Citations
    if (r.research_citations?.length > 0) {
      result.push({
        id: "citations",
        label: "Citations",
        content: <ResearchCitations citations={r.research_citations} />,
      });
    }

    // CARD 15 — Create Protocol + Review + Legal
    result.push({
      id: "protocol",
      label: "Create Protocol",
      content: (
        <div className="space-y-8">
          {(r.supplement_protocol?.length > 0 || r.peptide_protocol?.length > 0) && (
            <CreateProtocolFromReport
              supplements={r.supplement_protocol ?? []}
              peptides={r.peptide_protocol ?? []}
              reportId={id!}
            />
          )}
          <LegalDisclaimer />
          {review !== undefined && (
            <ReportReview reportId={id!} existingReview={review} />
          )}
        </div>
      ),
    });

    return result;
  }, [report, id, review]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  const r = report.report_json || {};
  const parseFailed = !!r.parse_failed || !!r.raw_text;

  if (parseFailed) {
    return (
      <>
        <SEO title="Report Error | Peptyl" description="Report generation issue." path={`/dna/report/${id}`} />
        <main className="min-h-screen pt-24 pb-16 bg-background flex items-center justify-center">
          <div className="bg-card border border-destructive/30 rounded-xl p-8 text-center space-y-4 max-w-md mx-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h1 className="text-xl font-heading font-bold text-foreground">Report Generation Issue</h1>
            <p className="text-sm text-muted-foreground">
              The AI produced a malformed response. Please try running your assessment again.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => navigate(`/dna/upload?tier=${report.assessment_tier || "standard"}`, { replace: true })}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm"
              >
                Re-run Analysis
              </button>
              <button
                onClick={() => navigate("/dna/dashboard", { replace: true })}
                className="px-6 py-2.5 border border-border text-foreground rounded-lg font-medium text-sm hover:bg-muted/30"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SEO title="Your DNA Report | Peptyl" description="Personalised genetic health assessment report." path={`/dna/report/${id}`} />
      <ReportScrollLayout sections={cards} />
    </>
  );
};

export default DNAReport;
