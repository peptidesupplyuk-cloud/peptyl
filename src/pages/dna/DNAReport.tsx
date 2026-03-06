import { useEffect, useState, useRef, useCallback } from "react";
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
  
  const reportRef = useRef<HTMLDivElement>(null);

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

  const r = report?.report_json || {};
  const isAdvanced = report?.assessment_tier === "advanced";

  const handleDownloadPDF = useCallback(async () => {
    setGeneratingPdf(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF } = await import("jspdf");

      const el = reportRef.current;
      if (!el) return;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#070B14",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pdf = new jsPDF("p", "mm", "a4");

      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = 297;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      const tierLabel = isAdvanced ? "Advanced" : "Standard";
      pdf.save(`Peptyl_DNA_Report_${tierLabel}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setGeneratingPdf(false);
    }
  }, [isAdvanced]);

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
        {/* Print-only header */}
        <div className="hidden print:block mb-6 pb-4 border-b border-gray-200 container mx-auto px-6 max-w-4xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Peptyl DNA Health Report</h1>
              <p className="text-sm text-gray-500 mt-1">
                {isAdvanced ? "Advanced Assessment" : "Standard Assessment"} · Generated {new Date(report.created_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <p className="text-xs text-gray-400">peptyl.co.uk · For research and educational purposes only</p>
          </div>
        </div>

        <div className="container mx-auto px-6 max-w-4xl space-y-8" ref={reportRef}>
          {/* Tier badge + PDF button */}
          <div className="flex items-center justify-between" data-hide-print="true">
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
              <GLP1AssessmentPanel glp1={r.glp1_assessment} />
              <DietRecommendations data={r.diet_recommendations} />
              <TrainingRecommendations data={r.training_recommendations} />
            </>
          )}

          <ActionPlan plan={r.action_plan} />
          <div data-hide-print="true">
            <OutcomeInsights reportId={id!} genotypeKey={buildGenotypeKey(r.gene_results)} />
          </div>
          {r.supplement_protocol?.length > 0 && (
            <div data-hide-print="true">
              <CreateProtocolFromReport
                supplements={r.supplement_protocol}
                reportId={id!}
              />
            </div>
          )}
          <div data-hide-print="true">
            <LegalDisclaimer />
          </div>
          {review !== undefined && (
            <div data-hide-print="true">
              <ReportReview reportId={id!} existingReview={review} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default DNAReport;