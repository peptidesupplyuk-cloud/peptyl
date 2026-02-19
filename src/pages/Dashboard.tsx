import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Activity, FlaskConical, LayoutDashboard, AlertTriangle, User, BookOpen, CalendarDays, BarChart3, Heart, Weight, Droplets, ExternalLink, CheckCircle2 } from "lucide-react";
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
import { useLogInjection, useUpdateInjectionStatus } from "@/hooks/use-injections";
import AdherenceTracker from "@/components/dashboard/AdherenceTracker";
import { useProtocolNotifications, useNotificationActions } from "@/hooks/use-notifications";
import { getRecommendations, getBiometricRecommendations, type Recommendation, type BiometricRecommendation } from "@/data/recommendation-rules";
import PopularProtocols from "@/components/dashboard/PopularProtocols";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import SEO from "@/components/SEO";
import ExperienceChat from "@/components/dashboard/ExperienceChat";
import ProtocolNudges from "@/components/dashboard/ProtocolNudges";
import CollaborativeRecommendations from "@/components/dashboard/CollaborativeRecommendations";
import OnboardingRecommendations from "@/components/dashboard/OnboardingRecommendations";
import MobileTabNav from "@/components/dashboard/MobileTabNav";
import OptimizationScore from "@/components/dashboard/OptimizationScore";
import AdherenceSummary from "@/components/dashboard/AdherenceSummary";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSaveOnboarding } from "@/hooks/use-save-onboarding";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const { data: panels = [], refetch: refetchPanels } = useBloodworkPanels();
  const createProtocol = useCreateProtocol();
  const logInjection = useLogInjection();
  const updateInjectionStatus = useUpdateInjectionStatus();
  const { toast } = useToast();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [activatingProtocol, setActivatingProtocol] = useState(false);
  const [bioRecs, setBioRecs] = useState<BiometricRecommendation[]>([]);
  const [initialPeptide, setInitialPeptide] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  useSaveOnboarding();
  const { user } = useAuth();

  const ADMIN_EMAIL = "peptidesupplyuk@gmail.com";
  const isAdmin = user?.email === ADMIN_EMAIL;

  // Check if WHOOP is already connected (admin only)
  const { data: whoopConnection } = useQuery({
    queryKey: ["whoop-connection", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("whoop_connections")
        .select("id, last_sync_at, whoop_user_id")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: isAdmin && !!user,
  });

  const handleConnectWhoop = async () => {
    if (!user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({ title: "WHOOP Error", description: "You must be logged in to connect WHOOP", variant: "destructive" });
        return;
      }
      // Full browser redirect — the edge function returns a 302 to WHOOP's login
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whoop-authorize?token=${encodeURIComponent(session.access_token)}`;
      window.location.href = functionUrl;
    } catch (err: any) {
      toast({ title: "WHOOP Error", description: err?.message || "Failed to start WHOOP connect", variant: "destructive" });
    }
  };

  // Schedule local notifications for protocol doses
  useProtocolNotifications();

  // Handle notification action buttons (Done / Skip)
  useNotificationActions(
    (injectionId) => updateInjectionStatus.mutate({ id: injectionId, status: "completed" }),
    (injectionId) => updateInjectionStatus.mutate({ id: injectionId, status: "skipped" })
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    const peptide = searchParams.get("peptide") || sessionStorage.getItem("pending_peptide");
    if (tab) {
      setActiveTab(tab);
    }
    if (peptide) {
      setInitialPeptide(peptide);
      sessionStorage.removeItem("pending_peptide");
    }
    if (tab || peptide) {
      setSearchParams({}, { replace: true });
    }
  }, []);

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
        supplements: rec.supplements?.map((s) => ({
          name: s.name,
          dose: s.dose,
          frequency: s.frequency,
        })),
        notes: rec.supplements?.length
          ? `Suggested supplements: ${rec.supplements.map((s) => `${s.name} (${s.dose}, ${s.frequency})`).join(", ")}`
          : undefined,
      });

      // Generate today's dose logs for the new protocol
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

      toast({ title: "Protocol activated", description: `${rec.protocolName} is now active. Today's doses have been scheduled.` });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to activate protocol.", variant: "destructive" });
    } finally {
      setActivatingProtocol(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="My Plan — Daily Actions & Protocol Management"
        description="See what to do today, track biomarkers, and manage your active peptide protocols."
        path="/dashboard"
      />
      <Header />
      <main className="pt-20 pb-24 md:pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              My <span className="text-gradient-teal">Plan</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Your daily actions, biomarkers, and active protocols.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="hidden md:flex w-full overflow-x-auto max-w-3xl no-scrollbar">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">
                <LayoutDashboard className="h-4 w-4 mr-1.5" />Overview
              </TabsTrigger>
              <TabsTrigger value="biomarkers" className="text-xs sm:text-sm">
                <Activity className="h-4 w-4 mr-1.5" />Biomarkers
              </TabsTrigger>
              <TabsTrigger value="protocols" className="text-xs sm:text-sm">
                <FlaskConical className="h-4 w-4 mr-1.5" />Protocols
              </TabsTrigger>
              <TabsTrigger value="injections" className="text-xs sm:text-sm">
                <CalendarDays className="h-4 w-4 mr-1.5" />Tracker
              </TabsTrigger>
              <TabsTrigger value="adherence" className="text-xs sm:text-sm">
                <BarChart3 className="h-4 w-4 mr-1.5" />Adherence
              </TabsTrigger>
              <TabsTrigger value="journal" className="text-xs sm:text-sm">
                <BookOpen className="h-4 w-4 mr-1.5" />Journal
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-xs sm:text-sm">
                <User className="h-4 w-4 mr-1.5" />Profile
              </TabsTrigger>
            </TabsList>

            {/* JOURNAL TAB */}
            <TabsContent value="journal" className="space-y-6">
              <ExperienceChat />
            </TabsContent>

            {/* PROFILE TAB */}
            <TabsContent value="profile" className="space-y-6">
              <ProfileBiometrics onUpdate={(bio) => setBioRecs(getBiometricRecommendations(bio))} />
            </TabsContent>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
              {/* 1. Action card — today's doses or activation CTA */}
              <TodaysPlan onActivate={() => setActiveTab("protocols")} />

              {/* 1b. Adherence snapshot */}
              <AdherenceSummary onNavigate={() => setActiveTab("adherence")} />

              {/* 2. Protocol nudges */}
              <ProtocolNudges onNavigate={setActiveTab} />

              {/* 3. Biomarker grid — "What We're Fixing" */}
              <BiomarkerSummary panels={panels} />

              {/* 4. Active plan */}
              <ActiveProtocols />

              {/* 5. Health Direction Score */}
              <OptimizationScore />

              {/* WHOOP Integration */}
              <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {whoopConnection ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Activity className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-foreground text-sm">WHOOP Integration</h3>
                  <p className="text-xs text-muted-foreground">
                    {whoopConnection
                      ? `Connected${whoopConnection.last_sync_at ? ` · Last sync: ${new Date(whoopConnection.last_sync_at).toLocaleDateString()}` : ""}`
                      : "Auto-sync HRV, recovery, strain & sleep data from your WHOOP band."}
                  </p>
                </div>
                {isAdmin ? (
                  whoopConnection ? (
                    <span className="text-[10px] font-medium text-primary bg-primary/10 rounded-full px-2.5 py-1 whitespace-nowrap">Connected</span>
                  ) : (
                    <Button size="sm" variant="outline" onClick={handleConnectWhoop} className="gap-1.5 text-xs">
                      <ExternalLink className="h-3 w-3" />
                      Connect
                    </Button>
                  )
                ) : (
                  <span className="text-[10px] font-medium text-primary bg-primary/10 rounded-full px-2.5 py-1 whitespace-nowrap">Coming Soon</span>
                )}
              </div>

              {/* 6. Onboarding recommendations */}
              <OnboardingRecommendations onNavigateToProtocols={() => setActiveTab("protocols")} />

              {recommendations.length > 0 && (
                <div className="space-y-3">
                  <Carousel opts={{ align: "start", loop: false }} className="w-full">
                    <div className="flex items-center justify-between">
                      <h2 className="font-heading font-semibold text-foreground">🎯 Personalised Recommendations</h2>
                      <div className="flex items-center gap-1">
                        <CarouselPrevious className="static translate-y-0 h-7 w-7" />
                        <CarouselNext className="static translate-y-0 h-7 w-7" />
                      </div>
                    </div>
                    <CarouselContent className="-ml-3 mt-3">
                      {recommendations.slice(0, 4).map((rec) => (
                        <CarouselItem key={rec.id} className="pl-3 basis-full sm:basis-[70%] md:basis-1/2 lg:basis-[45%]">
                          <RecommendationCard recommendation={rec} onActivate={handleActivateProtocol} isActivating={activatingProtocol} badge="Personalised" />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
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

              <CollaborativeRecommendations />

              {/* 7. Biomarker Trends — bottom */}
              <BiomarkerTrendChart panels={panels} />

              {panels.length === 0 && (
                <div className="bg-card rounded-2xl border border-border p-8 text-center">
                  <Activity className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-heading font-semibold text-foreground mb-1">Get Started</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload your bloodwork to receive personalised peptide and supplement recommendations.
                  </p>
                  <button onClick={() => setActiveTab("biomarkers")} className="text-sm text-primary font-medium hover:underline">
                    Upload Bloodwork →
                  </button>
                </div>
              )}
            </TabsContent>

            {/* BIOMARKERS TAB */}
            <TabsContent value="biomarkers" className="space-y-6">
              <Tabs defaultValue="bloodwork" className="space-y-4">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="bloodwork" className="text-xs sm:text-sm gap-1.5">
                    <Droplets className="h-3.5 w-3.5" />Bloodwork
                  </TabsTrigger>
                  <TabsTrigger value="body" className="text-xs sm:text-sm gap-1.5">
                    <Weight className="h-3.5 w-3.5" />Body
                  </TabsTrigger>
                  <TabsTrigger value="cardio" className="text-xs sm:text-sm gap-1.5">
                    <Heart className="h-3.5 w-3.5" />Cardiovascular
                  </TabsTrigger>
                </TabsList>

                {/* BLOODWORK SUB-TAB */}
                <TabsContent value="bloodwork" className="space-y-6">
                  <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
                    <h2 className="font-heading font-semibold text-foreground mb-4">Enter Bloodwork Results</h2>
                    <BloodworkForm onSaved={() => { refetchPanels(); setActiveTab("protocols"); }} filterCategories={["Metabolic", "Lipids", "Liver", "Kidney", "Inflammation", "Vitamins", "Hormones", "Thyroid"]} />
                  </div>

                  <BiomarkerTrendChart panels={panels} filterCategories={["Metabolic", "Lipids", "Liver", "Kidney", "Inflammation", "Vitamins", "Hormones", "Thyroid"]} />

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

                {/* BODY COMPOSITION SUB-TAB */}
                <TabsContent value="body" className="space-y-6">
                  <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
                    <h2 className="font-heading font-semibold text-foreground mb-4">Body Composition</h2>
                    <BloodworkForm onSaved={() => refetchPanels()} filterCategories={["Body Composition"]} />
                  </div>

                  <BiomarkerTrendChart panels={panels} filterCategories={["Body Composition"]} />
                </TabsContent>

                {/* CARDIOVASCULAR SUB-TAB */}
                <TabsContent value="cardio" className="space-y-6">
                  <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
                    <h2 className="font-heading font-semibold text-foreground mb-4">Cardiovascular</h2>
                    <BloodworkForm onSaved={() => refetchPanels()} filterCategories={["Cardiovascular"]} />
                  </div>

                  <BiomarkerTrendChart panels={panels} filterCategories={["Cardiovascular"]} />
                </TabsContent>
              </Tabs>
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
                <div className="space-y-3">
                  <Carousel opts={{ align: "start", loop: false }} className="w-full">
                    <div className="flex items-center justify-between">
                      <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
                        🎯 Personalised Recommendations
                        <span className="text-xs font-normal text-muted-foreground">Based on your bloodwork</span>
                      </h2>
                      <div className="flex items-center gap-1">
                        <CarouselPrevious className="static translate-y-0 h-7 w-7" />
                        <CarouselNext className="static translate-y-0 h-7 w-7" />
                      </div>
                    </div>
                    <CarouselContent className="-ml-3 mt-3">
                      {recommendations.map((rec) => (
                        <CarouselItem key={rec.id} className="pl-3 basis-full sm:basis-[70%] md:basis-1/2 lg:basis-[45%]">
                          <RecommendationCard recommendation={rec} onActivate={handleActivateProtocol} isActivating={activatingProtocol} badge="Personalised" />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border p-8 text-center">
                  <FlaskConical className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-heading font-semibold text-foreground mb-1">No Personalised Recommendations Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload bloodwork to get personalised protocol recommendations based on your biomarkers.
                  </p>
                </div>
              )}

              <PopularProtocols
                onActivate={handleActivateProtocol}
                isActivating={activatingProtocol}
                disclaimerAccepted={disclaimerAccepted}
              />

              <CreateProtocolForm disclaimerAccepted={disclaimerAccepted} initialPeptide={initialPeptide} onInitialPeptideConsumed={() => setInitialPeptide(null)} />

              <ActiveProtocols />
            </TabsContent>

            {/* TRACKER TAB */}
            <TabsContent value="injections" className="space-y-6">
              <TodaysPlan />
              <ActiveProtocols />
            </TabsContent>

            {/* ADHERENCE TAB */}
            <TabsContent value="adherence" className="space-y-6">
              <AdherenceTracker />
            </TabsContent>
          </Tabs>
          <MobileTabNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </main>
      {!isMobile && <Footer />}
    </div>
  );
};

export default Dashboard;
