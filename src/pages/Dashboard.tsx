import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Activity, FlaskConical, LayoutDashboard, AlertTriangle, User, BookOpen, CalendarDays, BarChart3, Heart, Weight, Droplets, ExternalLink, CheckCircle2, Play, Eye, X, Dna, Sparkles } from "lucide-react";
import { addWeeks, format, differenceInCalendarDays, startOfDay, subDays, isSameDay } from "date-fns";
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
import WhoopSection from "@/components/dashboard/WhoopSection";
import FitbitSection from "@/components/dashboard/FitbitSection";
import WearableSummary from "@/components/dashboard/WearableSummary";
import { useBloodworkPanels } from "@/hooks/use-bloodwork";
import { useCreateProtocol, useProtocols } from "@/hooks/use-protocols";
import { useLogInjection, useUpdateInjectionStatus, useAllInjections, useTodayInjections } from "@/hooks/use-injections";
import { useTodaySupplementLogs } from "@/hooks/use-supplement-logs";
import ResultsTab from "@/components/dashboard/ResultsTab";
import { useProtocolNotifications, useNotificationActions } from "@/hooks/use-notifications";
import { getUnifiedRecommendations, getBiometricRecommendations, type Recommendation, type BiometricRecommendation, type UnifiedRecommendation } from "@/data/recommendation-rules";
import PopularProtocols from "@/components/dashboard/PopularProtocols";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import SEO from "@/components/SEO";
import ExperienceChat from "@/components/dashboard/ExperienceChat";
import ProtocolNudges from "@/components/dashboard/ProtocolNudges";

// OnboardingRecommendations removed — unified engine handles onboarding-based recs
import MobileTabNav from "@/components/dashboard/MobileTabNav";
import OptimizationScore from "@/components/dashboard/OptimizationScore";
import AdherenceSummary from "@/components/dashboard/AdherenceSummary";
import { useIsMobile } from "@/hooks/use-mobile";
import ProtocolOutcomeCard from "@/components/dashboard/ProtocolOutcomeCard";
import { useSaveOnboarding } from "@/hooks/use-save-onboarding";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

const VideoHelpButton = () => {
  const [open, setOpen] = useState(false);
  const tracked = useRef(false);

  const trackView = () => {
    if (tracked.current) return;
    tracked.current = true;
    (supabase as any).from("video_views").insert({ video_name: "meet-peptyl" });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 text-xs shrink-0"
      >
        <Play className="h-3.5 w-3.5" />
        Need help? Watch demo
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="relative w-full max-w-3xl mx-4 rounded-2xl overflow-hidden border border-border bg-card shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-primary" />
                <span className="text-sm font-heading font-semibold text-foreground">Meet Peptyl</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <video className="w-full aspect-video" controls autoPlay preload="metadata" onPlay={trackView}>
              <source src="/videos/meet-peptyl.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      )}
    </>
  );
};

const Dashboard = () => {
  const { data: panels = [], refetch: refetchPanels } = useBloodworkPanels();
  const createProtocol = useCreateProtocol();
  const { data: protocols = [] } = useProtocols();
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
  const navigate = useNavigate();

  const ADMIN_EMAIL = "peptidesupplyuk@gmail.com";
  const isAdmin = user?.email === ADMIN_EMAIL;

  // DNA reports for overview data status card
  const { data: dnaReports = [] } = useQuery({
    queryKey: ["dna-reports-overview", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data } = await supabase
        .from("dna_reports")
        .select("id, created_at, overall_score, confidence, report_json")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1);
      return data || [];
    },
  });
  const latestDnaReport = dnaReports[0] || null;

  const { data: onboardingProfile } = useQuery({
    queryKey: ["onboarding-profile", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("research_goal, experience_level, current_compounds, biomarker_availability, risk_tolerance")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });
  const hasBloodwork = panels.length > 0;
  const hasDna = !!latestDnaReport;

  // Hero status stats
  const { data: allInjections = [] } = useAllInjections();
  const { data: todayInjections = [] } = useTodayInjections();
  const activeProtocol = protocols.find((p) => p.status === "active");
  const hasActiveProtocol = !!activeProtocol;

  const heroStats = useMemo(() => {
    if (!hasActiveProtocol || allInjections.length === 0) return { rate: 0, streak: 0 };

    const protocolStart = activeProtocol?.start_date
      ? startOfDay(new Date(activeProtocol.start_date))
      : null;
    const protocolInjections = protocolStart
      ? allInjections.filter((i) => new Date(i.scheduled_time) >= protocolStart)
      : allInjections;

    const completed = protocolInjections.filter((i) => i.status === "completed").length;
    const skipped = protocolInjections.filter((i) => i.status === "skipped").length;
    const missed = protocolInjections.filter((i) =>
      i.status === "scheduled" && new Date(i.scheduled_time) < new Date()
    ).length;
    const total = completed + skipped + missed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    let streak = 0;
    const today = startOfDay(new Date());
    for (let d = 0; d < 365; d++) {
      const day = subDays(today, d);
      if (protocolStart && day < protocolStart) break;
      const dayInj = protocolInjections.filter((i) => isSameDay(new Date(i.scheduled_time), day));
      if (dayInj.length === 0) continue;
      if (dayInj.every((i) => i.status === "completed")) streak++;
      else break;
    }
    return { rate, streak };
  }, [allInjections, hasActiveProtocol, activeProtocol?.start_date]);

  const protocolStartDate = activeProtocol?.start_date;
  const protocolEndDate = activeProtocol?.end_date;
  const daysActive = protocolStartDate
    ? Math.max(0, differenceInCalendarDays(new Date(), new Date(protocolStartDate)))
    : 0;
  const totalDays = protocolStartDate && protocolEndDate
    ? Math.max(1, differenceInCalendarDays(new Date(protocolEndDate), new Date(protocolStartDate)))
    : 90;
  const progressPct = Math.min(100, Math.round((daysActive / totalDays) * 100));
  const daysLeft = totalDays - daysActive;
  const todayScheduled = todayInjections.filter((i) => i.status === "scheduled").length;
  const todayCompleted = todayInjections.filter((i) => i.status === "completed").length;

  // Supplement-aware "all done" check
  const { data: supplementLogs = [] } = useTodaySupplementLogs();
  const completedOrSkippedSupplements = new Set(supplementLogs.map((l) => l.item));
  const activeSupplements = protocols
    .filter((p) => p.status === "active")
    .flatMap((p) => (p.supplements || []) as Array<{ name: string }>)
    .filter((s, i, arr) => arr.findIndex(x => x.name === s.name) === i);
  const todayPendingSupplements = activeSupplements.filter(
    (s) => !completedOrSkippedSupplements.has(s.name)
  ).length;
  const todayRemaining = todayScheduled + todayPendingSupplements;

  const [showMore, setShowMore] = useState(false);



  // Schedule local notifications for protocol doses
  useProtocolNotifications();

  // Handle notification action buttons (Done / Skip)
  useNotificationActions(
    (injectionId) => updateInjectionStatus.mutate({ id: injectionId, status: "completed" }),
    (injectionId) => updateInjectionStatus.mutate({ id: injectionId, status: "skipped" })
  );

  const [retestProtocolId, setRetestProtocolId] = useState<string | null>(null);
  const [defaultIsRetest, setDefaultIsRetest] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    const peptide = searchParams.get("peptide") || sessionStorage.getItem("pending_peptide");
    const retest = searchParams.get("retest");
    const protocolIdParam = searchParams.get("protocolId");
    if (tab) {
      setActiveTab(tab);
    }
    if (peptide) {
      setInitialPeptide(peptide);
      sessionStorage.removeItem("pending_peptide");
    }
    if (retest === "true") {
      setDefaultIsRetest(true);
    }
    if (protocolIdParam) {
      setRetestProtocolId(protocolIdParam);
    }
    if (tab || peptide || retest || protocolIdParam) {
      setSearchParams({}, { replace: true });
    }
  }, []);

  // Get recommendations from latest panel
  const latestPanel = panels[0];
  const markerMap = latestPanel
    ? Object.fromEntries(latestPanel.markers.map((m) => [m.marker_name, m.value]))
    : {};
  const recommendations: Recommendation[] = useMemo(() => {
    const unified = getUnifiedRecommendations({
      markers: markerMap,
      dnaReport: latestDnaReport?.report_json as any || null,
      onboarding: onboardingProfile || null,
    });
    return unified.map((u) => ({
      id: u.id,
      protocolName: u.protocolName,
      goal: u.goal,
      triggerDescription: u.signalLabels?.[0] || "",
      peptides: u.peptides,
      supplements: u.supplements,
      durationWeeks: u.durationWeeks,
      retestWeeks: u.retestWeeks,
      source: u.source,
      beginner_safe: u.beginner_safe,
      signalSources: u.signalSources,
      signalLabels: u.signalLabels,
      confidenceLevel: u.confidenceLevel,
      type: u.type,
    }));
  }, [markerMap, latestDnaReport, onboardingProfile]);

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
        title="My Health | Peptyl"
        description="See what to do today, track biomarkers, and manage your active peptide protocols."
        path="/dashboard"
      />
      <Header />
      <main className="pt-20 pb-24 md:pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
                My <span className="text-gradient-teal">Health</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Your daily actions, biomarkers, and active protocols.
              </p>
            </div>
            <VideoHelpButton />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="hidden md:flex w-full overflow-x-auto max-w-3xl no-scrollbar">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">
                <LayoutDashboard className="h-4 w-4 mr-1.5" />Today
              </TabsTrigger>
              <TabsTrigger value="protocols" className="text-xs sm:text-sm">
                <FlaskConical className="h-4 w-4 mr-1.5" />Protocols
              </TabsTrigger>
              <TabsTrigger value="injections" className="text-xs sm:text-sm">
                <CalendarDays className="h-4 w-4 mr-1.5" />Tracker
              </TabsTrigger>
              <TabsTrigger value="results" className="text-xs sm:text-sm">
                <BarChart3 className="h-4 w-4 mr-1.5" />Results
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
              <Tabs defaultValue="profile-info" className="space-y-4">
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="profile-info" className="text-xs sm:text-sm gap-1.5">
                    <User className="h-3.5 w-3.5" />Profile
                  </TabsTrigger>
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

                {/* PROFILE SUB-TAB */}
                <TabsContent value="profile-info" className="space-y-6">
                  <ProfileBiometrics onUpdate={(bio) => setBioRecs(getBiometricRecommendations(bio))} />
                  <WhoopSection />
                  <FitbitSection />
                </TabsContent>

                {/* BLOODWORK SUB-TAB */}
                <TabsContent value="bloodwork" className="space-y-6">
                  {(() => {
                    const retestPanels = panels.filter(p => p.panel_type?.startsWith('retest') && p.protocol_id);
                    if (retestPanels.length === 0) return null;
                    return (
                      <div className="space-y-4 mb-2">
                        <h3 className="font-heading font-semibold text-foreground text-sm">Protocol Results</h3>
                        {retestPanels.map(retest => {
                          const baseline = panels.find(p => p.protocol_id === retest.protocol_id && !p.panel_type?.startsWith('retest'));
                          const protocol = protocols.find(p => p.id === retest.protocol_id);
                          if (!baseline) return null;
                          return <ProtocolOutcomeCard key={retest.id} baselinePanel={baseline} retestPanel={retest} protocolName={protocol?.name ?? 'Protocol'} />;
                        })}
                      </div>
                    );
                  })()}

                  <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
                    <h2 className="font-heading font-semibold text-foreground mb-4">Enter Bloodwork Results</h2>
                    <BloodworkForm onSaved={() => { refetchPanels(); setActiveTab("protocols"); }} filterCategories={["Metabolic", "Lipids", "Liver", "Kidney", "Inflammation", "Vitamins", "Hormones", "Thyroid"]} defaultProtocolId={retestProtocolId} defaultIsRetest={defaultIsRetest} />
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

                {/* BODY SUB-TAB */}
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

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-4">
              {/* ═══ ZONE A — Hero Status ═══ */}
              {hasActiveProtocol ? (
                <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
                  <div className="flex items-start gap-6">
                    {/* Left: Day counter */}
                    <div className="shrink-0">
                      <p className="text-4xl font-heading font-bold text-foreground leading-none">Day {daysActive}</p>
                      <p className="text-sm text-muted-foreground mt-1">of {totalDays}</p>
                      <div className="h-1.5 bg-muted rounded-full mt-2 w-28">
                        <div className="h-1.5 bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                      </div>
                    </div>
                    {/* Right: stat pills */}
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-foreground">{heroStats.rate}%</span>
                        <span className="text-muted-foreground">adherence</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`font-medium ${heroStats.streak > 7 ? "text-green-500" : heroStats.streak > 0 ? "text-amber-400" : "text-muted-foreground"}`}>
                         {heroStats.streak} day streak this protocol
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {todayRemaining > 0 ? (
                          <span className="font-medium text-primary">{todayRemaining} left today</span>
                        ) : (
                          <span className="font-medium text-green-500">Today complete ✓</span>
                        )}
                      </div>
                    </div>
              </div>

              {/* Wearable Summary — shown if user has wearable data */}
              <WearableSummary />
                  {/* Protocol name line */}
                  <p className="text-xs text-muted-foreground mt-3">
                    {activeProtocol.name} · {daysLeft > 0 ? `${daysLeft} days remaining` : "Completing today"}
                  </p>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border p-6 text-center space-y-3">
                  <Sparkles className="h-10 w-10 text-primary mx-auto" />
                  <h2 className="font-heading font-bold text-xl text-foreground">Ready to start?</h2>
                  <p className="text-sm text-muted-foreground">Choose a protocol or explore recommendations below</p>
                  <div className="flex justify-center gap-3">
                    <Button onClick={() => setActiveTab("protocols")}>Browse Protocols</Button>
                    <Button variant="ghost" onClick={() => setActiveTab("profile")}>View my data</Button>
                  </div>
                  {(hasBloodwork || hasDna) && (
                    <p className="text-xs text-primary mt-2">
                      You have {hasBloodwork && hasDna ? "bloodwork and DNA data" : hasBloodwork ? "bloodwork results" : "a DNA report"} — personalised recommendations are waiting.
                    </p>
                  )}
                </div>
              )}

              {/* ═══ ZONE B — Today's doses (active) OR Next step (inactive) ═══ */}
              {hasActiveProtocol ? (
                <TodaysPlan slim onActivate={() => setActiveTab("protocols")} />
              ) : (
                <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
                  {!hasBloodwork && !hasDna && (
                    <>
                      <h3 className="text-sm font-heading font-semibold text-foreground">Start with your data</h3>
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setActiveTab("profile")}>
                          <Droplets className="h-3.5 w-3.5 mr-1.5" /> Log bloodwork
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate("/dna/upload")}>
                          <Dna className="h-3.5 w-3.5 mr-1.5" /> Upload DNA
                        </Button>
                      </div>
                    </>
                  )}
                  {hasBloodwork && !hasDna && (
                    <div className="flex items-start gap-3">
                      <Dna className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-heading font-semibold text-foreground">Add DNA for deeper insights</h3>
                        <p className="text-xs text-muted-foreground mt-1">Your bloodwork is in. Upload your genetic data to get DNA-driven supplement recommendations.</p>
                        <Button variant="link" size="sm" className="px-0 h-auto mt-1 text-xs" onClick={() => navigate("/dna/upload")}>Upload DNA →</Button>
                      </div>
                    </div>
                  )}
                  {hasDna && !hasBloodwork && (
                    <div className="flex items-start gap-3">
                      <Droplets className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-heading font-semibold text-foreground">Add bloodwork to personalise protocols</h3>
                        <p className="text-xs text-muted-foreground mt-1">Your DNA report is ready. Add bloodwork results to unlock biomarker-triggered protocol recommendations.</p>
                        <Button variant="link" size="sm" className="px-0 h-auto mt-1 text-xs" onClick={() => setActiveTab("profile")}>Log bloodwork →</Button>
                      </div>
                    </div>
                  )}
                  {hasBloodwork && hasDna && (
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-heading font-semibold text-foreground">Your data is ready</h3>
                        <p className="text-xs text-muted-foreground mt-1">Browse protocols above to get started with a personalised plan.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ═══ ZONE C — Supporting context ═══ */}
              {isMobile ? (
                <div>
                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="text-xs text-primary font-medium hover:underline mb-3"
                  >
                    {showMore ? "Show less" : "Show more"}
                  </button>
                  {showMore && (
                    <div className="space-y-4">
                      {/* C1 — Biomarker summary */}
                      {hasBloodwork && <BiomarkerSummary panels={panels} />}

                      {/* C2 — Protocol nudges */}
                      <ProtocolNudges onNavigate={setActiveTab} />

                      {/* C3 — Data completeness row */}
                      <div className="flex items-center gap-3 px-1 flex-wrap">
                        <span className="text-xs text-muted-foreground">Your data:</span>
                        <span className={`text-xs font-medium ${hasBloodwork ? "text-primary" : "text-muted-foreground"}`}>
                          {hasBloodwork ? `✓ Bloodwork (${panels.length} panels)` : "○ No bloodwork yet"}
                        </span>
                        <span className={`text-xs font-medium ${hasDna ? "text-primary" : "text-muted-foreground"}`}>
                          {hasDna ? `✓ DNA report (${latestDnaReport.overall_score}/100)` : "○ No DNA report"}
                        </span>
                        {(!hasBloodwork || !hasDna) && (
                          <button onClick={() => !hasBloodwork ? setActiveTab("profile") : navigate("/dna/upload")}
                            className="text-xs text-primary hover:underline ml-auto">
                            Add data →
                          </button>
                        )}
                      </div>

                      {/* C4 — Personalised recommendations */}
                      {recommendations.length > 0 && (hasBloodwork || hasDna) && (
                        <div className="space-y-3">
                          <Carousel opts={{ align: "start", loop: false }} className="w-full">
                            <div className="flex items-center justify-between">
                              <div>
                                <h2 className="font-heading font-semibold text-foreground">Based on your results</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {hasBloodwork && hasDna ? "Based on your bloodwork and DNA report" : hasBloodwork ? "Based on your bloodwork results" : "Based on your DNA report"}
                                </p>
                              </div>
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

                      {/* OnboardingRecommendations removed — unified engine handles it */}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* C1 — Biomarker summary */}
                  {hasBloodwork && <BiomarkerSummary panels={panels} />}

                  {/* C2 — Protocol nudges */}
                  <ProtocolNudges onNavigate={setActiveTab} />

                  {/* C3 — Data completeness row */}
                  <div className="flex items-center gap-3 px-1 flex-wrap">
                    <span className="text-xs text-muted-foreground">Your data:</span>
                    <span className={`text-xs font-medium ${hasBloodwork ? "text-primary" : "text-muted-foreground"}`}>
                      {hasBloodwork ? `✓ Bloodwork (${panels.length} panels)` : "○ No bloodwork yet"}
                    </span>
                    <span className={`text-xs font-medium ${hasDna ? "text-primary" : "text-muted-foreground"}`}>
                      {hasDna ? `✓ DNA report (${latestDnaReport.overall_score}/100)` : "○ No DNA report"}
                    </span>
                    {(!hasBloodwork || !hasDna) && (
                      <button onClick={() => !hasBloodwork ? setActiveTab("profile") : navigate("/dna/upload")}
                        className="text-xs text-primary hover:underline ml-auto">
                        Add data →
                      </button>
                    )}
                  </div>

                  {/* C4 — Personalised recommendations */}
                  {recommendations.length > 0 && (hasBloodwork || hasDna) && (
                    <div className="space-y-3">
                      <Carousel opts={{ align: "start", loop: false }} className="w-full">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="font-heading font-semibold text-foreground">Based on your results</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {hasBloodwork && hasDna ? "Based on your bloodwork and DNA report" : hasBloodwork ? "Based on your bloodwork results" : "Based on your DNA report"}
                            </p>
                          </div>
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

                  {/* OnboardingRecommendations removed — unified engine handles it */}
                </div>
              )}

            </TabsContent>



            {/* PROTOCOLS TAB */}
            <TabsContent value="protocols" className="space-y-6">
              {/* ACTIVE PLAN — always first */}
              <ActiveProtocols />

              {/* Disclaimer */}
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-heading font-semibold text-foreground text-sm">Medical Disclaimer</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      All protocols, recommendations, and content on this dashboard are for educational and research information purposes only. They do not constitute medical advice, clinical guidance, or a professional recommendation. Peptyl is not operated by medical professionals. Always consult a qualified GP, pharmacist, or specialist before beginning any new protocol, changing medications, or making decisions about your health based on information shown here.
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

              {/* PERSONALISED RECOMMENDATIONS (unified engine) */}
              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  <Carousel opts={{ align: "start", loop: false }} className="w-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-heading font-semibold text-foreground">Based on your results</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {hasBloodwork && hasDna ? "Based on your bloodwork and DNA report" : hasBloodwork ? "Based on your bloodwork results" : hasDna ? "Based on your DNA report" : "Based on your profile"}
                        </p>
                      </div>
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
                    Upload bloodwork or DNA data to get personalised protocol recommendations.
                  </p>
                </div>
              )}

              {/* SUPPLEMENT + PEPTIDE PROTOCOLS (split) */}
              <PopularProtocols
                onActivate={handleActivateProtocol}
                isActivating={activatingProtocol}
                disclaimerAccepted={disclaimerAccepted}
              />

              {/* CREATE CUSTOM */}
              <CreateProtocolForm disclaimerAccepted={disclaimerAccepted} initialPeptide={initialPeptide} onInitialPeptideConsumed={() => setInitialPeptide(null)} />
            </TabsContent>

            {/* TRACKER TAB */}
            <TabsContent value="injections" className="space-y-6">
              <TodaysPlan />
              <ActiveProtocols />
            </TabsContent>

            {/* RESULTS TAB */}
            <TabsContent value="results" className="space-y-6">
              <ResultsTab />
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
