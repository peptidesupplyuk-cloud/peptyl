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
import ActionPlan from "@/components/dna/ActionPlan";
import LegalDisclaimer from "@/components/dna/LegalDisclaimer";
import ReportReview from "@/components/dna/ReportReview";
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

  return (
    <>
      <SEO title="Your DNA Report | Peptyl" description="Personalised genetic health assessment report." path={`/dna/report/${id}`} />
      <Header />
      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-6 max-w-4xl space-y-8">
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
          <ActionPlan plan={r.action_plan} />
          <LegalDisclaimer />
          {review !== undefined && (
            <ReportReview reportId={id!} existingReview={review} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default DNAReport;
