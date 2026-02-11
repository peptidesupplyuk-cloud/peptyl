import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, FlaskConical, Syringe, LayoutDashboard, AlertTriangle, User } from "lucide-react";
import { addWeeks, format } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BloodworkForm from "@/components/dashboard/BloodworkForm";
import RecommendationCard from "@/components/dashboard/RecommendationCard";
import TodaysPlan from "@/components/dashboard/TodaysPlan";
import BiomarkerSummary from "@/components/dashboard/BiomarkerSummary";
import BiomarkerTrendChart from "@/components/dashboard/BiomarkerTrendChart";
import ActiveProtocols from "@/components/dashboard/ActiveProtocols";
import CreateProtocolForm from "@/components/dashboard/CreateProtocolForm";
import ProfileBiometrics from "@/components/dashboard/ProfileBiometrics";
import { useBloodworkPanels } from "@/hooks/use-bloodwork";
import { useCreateProtocol } from "@/hooks/use-protocols";
import { useLogInjection } from "@/hooks/use-injections";
import { getRecommendations, getBiometricRecommendations, type Recommendation, type BiometricRecommendation } from "@/data/recommendation-rules";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import SEO from "@/components/SEO";
import ExperienceChat from "@/components/dashboard/ExperienceChat";

const Dashboard = () => {
  const { data: panels = [], refetch: refetchPanels } = useBloodworkPanels();
  const createProtocol = useCreateProtocol();
  const logInjection = useLogInjection();
  const { toast } = useToast();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [activatingProtocol, setActivatingProtocol] = useState(false);
  const [bioRecs, setBioRecs] = useState<BiometricRecommendation[]>([]);

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

    if (activatingProtocol) return;
    setActivatingProtocol(true);

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

        if (p.timing === "AM+PM") {
          await logInjection.mutateAsync({
            peptide_name: p.name,
            dose_mcg: p.dose_mcg,
            scheduled_time: `${startDate}T21:00:00.000Z`,
          });
        }
      }

      toast({ title: "Protocol activated", description: `${rec.protocolName} is now active. Today's injections have been scheduled.` });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to activate protocol.", variant: "destructive" });
    } finally {
      setActivatingProtocol(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Dashboard — Biomarker Tracking & Protocol Management"
        description="Track bloodwork, manage peptide protocols, and monitor daily injections with smart recommendations powered by your biomarker data."
        path="/dashboard"
      />
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
            <TabsList className="grid w-full grid-cols-5 max-w-2xl">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">
                <LayoutDashboard className="h-4 w-4 mr-1.5 hidden sm:inline" />Overview
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-xs sm:text-sm">
                <User className="h-4 w-4 mr-1.5 hidden sm:inline" />Profile
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

            {/* PROFILE TAB */}
            <TabsContent value="profile" className="space-y-6">
              <ProfileBiometrics onUpdate={(bio) => setBioRecs(getBiometricRecommendations(bio))} />
            </TabsContent>

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
                      <RecommendationCard key={rec.id} recommendation={rec} onActivate={handleActivateProtocol} isActivating={activatingProtocol} />
                    ))}
                  </div>
                </div>
              )}

              {bioRecs.length > 0 && (
                <div className="space-y-4">
                  <h2 className="font-heading font-semibold text-foreground">Supplement Suggestions (Based on Profile)</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bioRecs.map((rec) => (
                      <div key={rec.id} className="bg-card rounded-2xl border border-border p-5 space-y-3">
                        <h3 className="font-heading font-semibold text-foreground">{rec.title}</h3>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                        <div className="space-y-1.5">
                          {rec.supplements.map((s) => (
                            <div key={s.name} className="flex items-center justify-between text-xs bg-muted/50 rounded-lg px-3 py-2">
                              <span className="font-medium text-foreground">{s.name}</span>
                              <span className="text-muted-foreground">{s.dose} — {s.frequency}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">Source: {rec.source}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <ExperienceChat />

              {panels.length === 0 && (
                <div className="bg-card rounded-2xl border border-border p-8 text-center">
                  <Activity className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-heading font-semibold text-foreground mb-1">Get Started</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload your bloodwork to receive personalised peptide and supplement recommendations.
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
                      <RecommendationCard key={rec.id} recommendation={rec} onActivate={handleActivateProtocol} isActivating={activatingProtocol} />
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

              <CreateProtocolForm disclaimerAccepted={disclaimerAccepted} />

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
