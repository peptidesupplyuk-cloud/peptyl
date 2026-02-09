import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, FlaskConical, Syringe, LayoutDashboard, AlertTriangle } from "lucide-react";
import { addWeeks, format } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BloodworkForm from "@/components/dashboard/BloodworkForm";
import RecommendationCard from "@/components/dashboard/RecommendationCard";
import TodaysPlan from "@/components/dashboard/TodaysPlan";
import BiomarkerSummary from "@/components/dashboard/BiomarkerSummary";
import BiomarkerTrendChart from "@/components/dashboard/BiomarkerTrendChart";
import ActiveProtocols from "@/components/dashboard/ActiveProtocols";
import { useBloodworkPanels } from "@/hooks/use-bloodwork";
import { useCreateProtocol } from "@/hooks/use-protocols";
import { useLogInjection } from "@/hooks/use-injections";
import { getRecommendations, type Recommendation } from "@/data/recommendation-rules";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const Dashboard = () => {
  const { data: panels = [], refetch: refetchPanels } = useBloodworkPanels();
  const createProtocol = useCreateProtocol();
  const logInjection = useLogInjection();
  const { toast } = useToast();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Get recommendations from latest panel
  const latestPanel = panels[0];
  const markerMap = latestPanel
    ? Object.fromEntries(latestPanel.markers.map((m) => [m.marker_name, m.value]))
    : {};
  const recommendations = getRecommendations(markerMap);

  const handleActivateProtocol = async (rec: Recommendation) => {
    if (!disclaimerAccepted) {
      toast({
        title: "Disclaimer required",
        description: "Please acknowledge the medical disclaimer before activating a protocol.",
        variant: "destructive",
      });
      return;
    }

    try {
      const startDate = format(new Date(), "yyyy-MM-dd");
      const endDate = format(addWeeks(new Date(), rec.durationWeeks), "yyyy-MM-dd");

      const protocol = await createProtocol.mutateAsync({
        name: rec.protocolName,
        goal: rec.goal,
        startDate,
        endDate,
        peptides: rec.peptides.map((p) => ({
          peptide_name: p.name,
          dose_mcg: p.dose_mcg,
          frequency: p.frequency,
          timing: p.timing,
          route: p.route,
        })),
      });

      // Generate today's injection logs for the new protocol
      for (const p of rec.peptides) {
        const timing = p.timing.includes("AM") ? "09:00" : "21:00";
        await logInjection.mutateAsync({
          peptide_name: p.name,
          dose_mcg: p.dose_mcg,
          scheduled_time: `${startDate}T${timing}:00.000Z`,
        });

        // If AM+PM, add a second dose
        if (p.timing === "AM+PM") {
          await logInjection.mutateAsync({
            peptide_name: p.name,
            dose_mcg: p.dose_mcg,
            scheduled_time: `${startDate}T21:00:00.000Z`,
          });
        }
      }

      toast({ title: "Protocol activated", description: `${rec.protocolName} is now active. Today's injections have been scheduled.` });
    } catch {
      toast({ title: "Error", description: "Failed to activate protocol.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              My <span className="text-gradient-teal">Dashboard</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track bloodwork, protocols, and daily injections in one place.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 max-w-lg">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">
                <LayoutDashboard className="h-4 w-4 mr-1.5 hidden sm:inline" />Overview
              </TabsTrigger>
              <TabsTrigger value="bloodwork" className="text-xs sm:text-sm">
                <Activity className="h-4 w-4 mr-1.5 hidden sm:inline" />Bloodwork
              </TabsTrigger>
              <TabsTrigger value="protocols" className="text-xs sm:text-sm">
                <FlaskConical className="h-4 w-4 mr-1.5 hidden sm:inline" />Protocols
              </TabsTrigger>
              <TabsTrigger value="injections" className="text-xs sm:text-sm">
                <Syringe className="h-4 w-4 mr-1.5 hidden sm:inline" />Tracker
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
              <TodaysPlan />
              <BiomarkerTrendChart panels={panels} />
              <BiomarkerSummary panels={panels} />
              <ActiveProtocols />

              {recommendations.length > 0 && (
                <div className="space-y-4">
                  <h2 className="font-heading font-semibold text-foreground">Recommendations</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.slice(0, 2).map((rec) => (
                      <RecommendationCard key={rec.id} recommendation={rec} onActivate={handleActivateProtocol} />
                    ))}
                  </div>
                </div>
              )}

              {panels.length === 0 && (
                <div className="bg-card rounded-2xl border border-border p-8 text-center">
                  <Activity className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-heading font-semibold text-foreground mb-1">Get Started</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload your bloodwork to receive personalised peptide recommendations.
                  </p>
                  <button onClick={() => setActiveTab("bloodwork")} className="text-sm text-primary font-medium hover:underline">
                    Upload Bloodwork →
                  </button>
                </div>
              )}
            </TabsContent>

            {/* BLOODWORK TAB */}
            <TabsContent value="bloodwork" className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
                <h2 className="font-heading font-semibold text-foreground mb-4">Enter Bloodwork Results</h2>
                <BloodworkForm onSaved={() => { refetchPanels(); setActiveTab("protocols"); }} />
              </div>

              <BiomarkerTrendChart panels={panels} />

              {panels.length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-5">
                  <h3 className="font-heading font-semibold text-foreground mb-3">Previous Tests</h3>
                  <div className="space-y-2">
                    {panels.map((p) => (
                      <div key={p.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2.5">
                        <div>
                          <span className="text-sm font-medium text-foreground">
                            {new Date(p.test_date).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2 capitalize">{p.panel_type} panel</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{p.markers.length} markers</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* PROTOCOLS TAB */}
            <TabsContent value="protocols" className="space-y-6">
              {/* Disclaimer */}
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-heading font-semibold text-foreground text-sm">Medical Disclaimer</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      All protocols and recommendations are for educational and research purposes only. They do not constitute medical advice. Always consult with a qualified healthcare professional before beginning any peptide protocol.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-7">
                  <Checkbox
                    id="disclaimer"
                    checked={disclaimerAccepted}
                    onCheckedChange={(checked) => setDisclaimerAccepted(checked === true)}
                  />
                  <label htmlFor="disclaimer" className="text-xs text-foreground cursor-pointer">
                    I understand and acknowledge this disclaimer
                  </label>
                </div>
              </div>

              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="font-heading font-semibold text-foreground">
                    Personalised Recommendations ({recommendations.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.map((rec) => (
                      <RecommendationCard key={rec.id} recommendation={rec} onActivate={handleActivateProtocol} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border p-8 text-center">
                  <FlaskConical className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-heading font-semibold text-foreground mb-1">No Recommendations Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload bloodwork to get personalised protocol recommendations.
                  </p>
                </div>
              )}

              <ActiveProtocols />
            </TabsContent>

            {/* INJECTIONS TAB */}
            <TabsContent value="injections" className="space-y-6">
              <TodaysPlan />
              <ActiveProtocols />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
