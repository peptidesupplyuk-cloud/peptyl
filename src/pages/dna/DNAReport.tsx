import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Loader2 } from "lucide-react";
import ReportHeader from "@/components/dna/ReportHeader";
import FlagsPanel from "@/components/dna/FlagsPanel";
import GeneCards from "@/components/dna/GeneCards";
import BiomarkerBars from "@/components/dna/BiomarkerBars";
import DrugInteractionPanel from "@/components/dna/DrugInteractionPanel";
import SupplementTable from "@/components/dna/SupplementTable";
import PersonalisationCard from "@/components/dna/PersonalisationCard";
import PeptideProtocolPanel from "@/components/dna/PeptideProtocolPanel";
import GLP1AssessmentPanel from "@/components/dna/GLP1AssessmentPanel";
import HormonalAssessmentPanel from "@/components/dna/HormonalAssessmentPanel";
import DietRecommendations from "@/components/dna/DietRecommendations";
import TrainingRecommendations from "@/components/dna/TrainingRecommendations";
import ActionPlan from "@/components/dna/ActionPlan";
import LegalDisclaimer from "@/components/dna/LegalDisclaimer";
import ReportReview from "@/components/dna/ReportReview";
import CreateProtocolFromReport from "@/components/dna/CreateProtocolFromReport";
import OutcomeInsights from "@/components/dna/OutcomeInsights";
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

      // Fetch existing review
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

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </>
    );
  }

  const r = report.report_json || {};
  const isAdvanced = report.assessment_tier === "advanced";
  const parseFailed = !!r.parse_failed || !!r.raw_text;

  const buildGenotypeKey = (geneResults: any[]) => {
    if (!geneResults?.length) return null;
    const priority = ['MTHFR', 'APOE', 'VDR'];
    const parts = priority
      .map(gene => geneResults.find((g: any) => g.gene === gene || g.rsid?.includes(gene)))
      .filter(Boolean)
      .map((g: any) => g.gene + '_' + (g.genotype || g.variant || 'unknown').replace(/\//g, ''));
    return parts.length > 0 ? parts.join('+') : null;
  };

  return (
    <>
      <SEO title="Your DNA Report | Peptyl" description="Personalised genetic health assessment report." path={`/dna/report/${id}`} />
      <Header />
      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-6 max-w-4xl space-y-8">
          {parseFailed ? (
            <div className="bg-card border border-destructive/30 rounded-xl p-8 text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <h1 className="text-xl font-heading font-bold text-foreground">Report Generation Issue</h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                The AI produced a malformed response and your report couldn't be fully processed. This occasionally happens with complex analyses. Please try running your assessment again — it's free to retry.
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => navigate(`/dna/upload?tier=${report.assessment_tier === "advanced" ? "advanced" : "standard"}`, { replace: true })}
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
          ) : (
          <>
          {/* Tier badge + PDF button */}
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              isAdvanced
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}>
              {isAdvanced ? "Advanced ✦" : "Standard"}
            </span>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2 hover:bg-muted/30 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>
              </svg>
              Save as PDF
            </button>
          </div>

          <ReportHeader
            healthScore={r.health_score}
            meta={r.meta}
            narrative={report.narrative}
          />
          <FlagsPanel flags={r.flags} />
          <GeneCards genes={r.gene_results} />
          <BiomarkerBars biomarkers={r.biomarker_results} />
          <DrugInteractionPanel interactions={r.drug_interactions} />
          <SupplementTable supplements={r.supplement_protocol} />

          {/* Advanced-only sections */}
          {isAdvanced && (
            <>
              <PersonalisationCard data={r.personalisation} />
              <PeptideProtocolPanel peptides={r.peptide_protocol} />
              <HormonalAssessmentPanel hormonal={r.hormonal_assessment} />
              <GLP1AssessmentPanel glp1={r.glp1_assessment} />
              <DietRecommendations data={r.diet_recommendations} />
              <TrainingRecommendations data={r.training_recommendations} />
            </>
          )}

          <ActionPlan plan={r.action_plan} />
          <OutcomeInsights reportId={id!} genotypeKey={buildGenotypeKey(r.gene_results)} />
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
          </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default DNAReport;