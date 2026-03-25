import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, Plus, Dna, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const scoreColor = (s: number | null) => {
  if (!s) return "text-muted-foreground";
  if (s >= 80) return "text-primary";
  if (s >= 65) return "text-info";
  if (s >= 50) return "text-yellow-500";
  return "text-destructive";
};

const DNADashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("dna_reports")
      .select("id, created_at, overall_score, input_method, confidence, assessment_tier")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setReports(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("dna_reports").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Could not delete report.", variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Report removed." });
      setReports((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <>
      <SEO title="Your Health Reports | Peptyl" description="View and manage your holistic health assessment reports." path="/dna/dashboard" />
      <Header />
      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Your DNA Reports</h1>
              <p className="text-sm text-muted-foreground mt-1">{reports.length} report{reports.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex gap-2">
              <Link to="/dna/upload?tier=standard">
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Standard
                </Button>
              </Link>
              <Link to="/dna/upload?tier=advanced">
                <Button size="sm" className="shadow-brand">
                  <Sparkles className="h-4 w-4 mr-1" /> Advanced
                </Button>
              </Link>
              <Link to="/dna/upload?tier=pro">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Sparkles className="h-4 w-4 mr-1" /> Pro
                </Button>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-20">
              <Dna className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium mb-2">No reports yet</p>
              <p className="text-sm text-muted-foreground mb-6">Upload your genetic data to get started.</p>
              <Link to="/dna/upload?tier=standard">
                <Button className="shadow-brand">Start Your First Analysis</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => {
                const isPro = r.assessment_tier === "pro";
                const isAdvanced = r.assessment_tier === "advanced" || isPro;
                return (
                  <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-medium text-sm">
                        {format(new Date(r.created_at), "d MMM yyyy, HH:mm")}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`font-heading font-bold text-lg ${scoreColor(r.overall_score)}`}>
                          {r.overall_score ?? "\u2014"}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                          isPro
                            ? "bg-amber-500/10 text-amber-600"
                            : isAdvanced
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {isPro ? "Pro ★" : isAdvanced ? "Advanced ✦" : "Standard"}
                         </span>
                        <span className="text-xs bg-muted text-muted-foreground rounded-md px-2 py-0.5">
                          {r.input_method}
                        </span>
                        {r.confidence && (
                          <span className="text-xs bg-muted text-muted-foreground rounded-md px-2 py-0.5">
                            {r.confidence}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link to={`/dna/report/${r.id}`}>
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default DNADashboard;
