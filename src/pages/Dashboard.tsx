import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Activity, FlaskConical, LayoutDashboard, AlertTriangle, User, BookOpen, CalendarDays, BarChart3, Heart, Weight, Droplets, ExternalLink, CheckCircle2, Play, Eye, X, Dna, Sparkles, Flame, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PremiumCard from "@/components/ui/PremiumCard";
import { addWeeks, format, differenceInCalendarDays, startOfDay, subDays, isSameDay } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BloodworkForm from "@/components/dashboard/BloodworkForm";
import RecommendationCard from "@/components/dashboard/RecommendationCard";
import TodaysPlan from "@/components/dashboard/TodaysPlan";
import BiomarkerSummary from "@/components/dashboard/BiomarkerSummary";
import BiomarkerTrendChart from "@/components/dashboard/BiomarkerTrendChart";
import ActiveProtocols from "@/components/dashboard/ActiveProtocols";
import PreviousPlans from "@/components/dashboard/PreviousPlans";
import CreateProtocolForm from "@/components/dashboard/CreateProtocolForm";
import ProfileBiometrics from "@/components/dashboard/ProfileBiometrics";
import WhoopSection from "@/components/dashboard/WhoopSection";
import FitbitSection from "@/components/dashboard/FitbitSection";
import WearableSummary from "@/components/dashboard/WearableSummary";
import { useBloodworkPanels } from "@/hooks/use-bloodwork";
import { useCreateProtocol, useProtocols } from "@/hooks/use-protocols";
import { useProtocolScorecards, useGenerateScorecard } from "@/hooks/use-protocol-history";
import { useLogInjection, useUpdateInjectionStatus, useAllInjections, useTodayInjections } from "@/hooks/use-injections";
import { useTodaySupplementLogs } from "@/hooks/use-supplement-logs";
import { useJournalEntries, useAddJournalEntry } from "@/hooks/use-journal";
import ResultsTab from "@/components/dashboard/ResultsTab";
import { useProtocolNotifications, useNotificationActions, useRequestNotificationPermission } from "@/hooks/use-notifications";
import { Capacitor } from "@capacitor/core";
import { getUnifiedRecommendations, getBiometricRecommendations, type Recommendation, type BiometricRecommendation, type UnifiedRecommendation } from "@/data/recommendation-rules";
import PopularProtocols from "@/components/dashboard/PopularProtocols";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import SEO from "@/components/SEO";
import ExperienceChat from "@/components/dashboard/ExperienceChat";
import ProtocolNudges from "@/components/dashboard/ProtocolNudges";
import BioAgeScore from "@/components/dashboard/BioAgeScore";
import WearableNudges from "@/components/dashboard/WearableNudges";
import RecommendedTests from "@/components/dashboard/RecommendedTests";
import UnifiedInsights from "@/components/dashboard/UnifiedInsights";

// OnboardingRecommendations removed — unified engine handles onboarding-based recs
import MobileTabNav from "@/components/dashboard/MobileTabNav";
import OptimizationScore from "@/components/dashboard/OptimizationScore";
import AdherenceSummary from "@/components/dashboard/AdherenceSummary";
import AdherenceTracker from "@/components/dashboard/AdherenceTracker";
import DayPicker from "@/components/dashboard/DayPicker";
import { useIsMobile } from "@/hooks/use-mobile";
import ProtocolOutcomeCard from "@/components/dashboard/ProtocolOutcomeCard";
import { useSaveOnboarding } from "@/hooks/use-save-onboarding";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import OnboardingSummaryBanner from "@/components/dashboard/OnboardingSummaryBanner";
import ResearchInsightsFeed from "@/components/dashboard/ResearchInsightsFeed";
import QuickStackImport from "@/components/dashboard/QuickStackImport";
import CollaborativeRecommendations from "@/components/dashboard/CollaborativeRecommendations";
import PipMemoryCard from "@/components/dashboard/PipMemoryCard";
import GpSummarySection from "@/components/dashboard/GpSummarySection";
import { useAdherence } from "@/hooks/use-adherence";

/* ─── Compact Journal for Overview ─── */
const CompactJournal = ({ onExpandJournal }: { onExpandJournal: () => void }) => {
  const [note, setNote] = useState("");
  const addEntry = useAddJournalEntry();
  const { data: journal = [] } = useJournalEntries();
  const { toast } = useToast();

  const submit = async () => {
    if (note.trim().length < 10) return;
    try {
      await addEntry.mutateAsync({ content: note.trim(), peptides: [], summary: null, evidence_quality: null, findings_count: 0 });
      toast({ title: "Saved", description: "Journal entry logged." });
      setNote("");
    } catch {
      toast({ title: "Error", description: "Could not save entry.", variant: "destructive" });
    }
  };

  return (
    <PremiumCard className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-heading font-semibold text-foreground">Quick Journal</h3>
        </div>
        <button onClick={onExpandJournal} className="text-xs text-primary hover:underline">
          View all →
        </button>
      </div>

      <div className="flex gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Log an observation, side effect, or note…"
          className="flex-1 min-w-0 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <Button
          size="sm"
          onClick={submit}
          disabled={note.trim().length < 10 || addEntry.isPending}
          className="shrink-0"
        >
          {addEntry.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>

      {journal.length > 0 && (
        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {journal.slice(0, 3).map((entry) => (
            <div key={entry.id} className="flex items-start gap-2 text-xs">
              <span className="text-muted-foreground shrink-0">{new Date(entry.created_at).toLocaleDateString()}</span>
              <span className="text-foreground line-clamp-1">{entry.content}</span>
            </div>
          ))}
        </div>
      )}
    </PremiumCard>
  );
};

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
  const { data: protocols = [], isLoading: protocolsLoading } = useProtocols();
  const logInjection = useLogInjection();
  const updateInjectionStatus = useUpdateInjectionStatus();
  const { toast } = useToast();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [activatingProtocol, setActivatingProtocol] = useState(false);
  const [bioRecs, setBioRecs] = useState<BiometricRecommendation[]>([]);
  const [profileSubTab, setProfileSubTab] = useState("profile-info");
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
  const activeProtocols = protocols.filter((p) => p.status === "active");
  const hasActiveProtocol = activeProtocols.length > 0;

  // Unified adherence
  const { perProtocol: adherencePerProtocol, isLoading: adherenceLoading } = useAdherence();

  // Per-protocol stats for hero zone
  const perProtocolStats = useMemo(() => {
    return activeProtocols.map((protocol) => {
      const protocolStart = startOfDay(new Date(protocol.start_date));
      const now = new Date();
      const hasPeptides = protocol.peptides.length > 0;
      const hasSupplements = (protocol.supplements || []).length > 0;

      // Use unified adherence (peptides + supplements)
      const adherenceEntry = adherencePerProtocol.find((a) => a.protocolId === protocol.id);
      const rate = adherenceEntry?.combinedAdherence ?? null;

      const daysElapsed = Math.max(0, differenceInCalendarDays(now, protocolStart));
      const endDate = protocol.end_date ? new Date(protocol.end_date) : null;
      const totalDays = endDate ? Math.max(1, differenceInCalendarDays(endDate, protocolStart)) : 90;
      const dayNumber = Math.min(totalDays, daysElapsed + 1);
      const progressPct = Math.min(100, Math.round((dayNumber / totalDays) * 100));
      const daysLeft = Math.max(0, totalDays - dayNumber);

      return { protocol, rate, dayNumber, totalDays, progressPct, daysLeft, hasPeptides, hasSupplements };
    });
  }, [activeProtocols, adherencePerProtocol]);

  // Auto-generate milestone scorecards at 30/60/90 days
  const { data: existingScorecards = [] } = useProtocolScorecards();
  const generateScorecard = useGenerateScorecard();
  const milestoneCheckedRef = useRef(new Set<string>());

  useEffect(() => {
    const milestones = [
      { day: 30, key: "30_day" },
      { day: 60, key: "60_day" },
      { day: 90, key: "90_day" },
    ];
    for (const stat of perProtocolStats) {
      for (const m of milestones) {
        if (stat.dayNumber >= m.day) {
          const cacheKey = `${stat.protocol.id}_${m.key}`;
          if (milestoneCheckedRef.current.has(cacheKey)) continue;
          milestoneCheckedRef.current.add(cacheKey);
          const exists = existingScorecards.some(
            (s) => s.protocol_id === stat.protocol.id && s.milestone === m.key
          );
          if (!exists) {
            generateScorecard.mutate({
              protocolId: stat.protocol.id,
              milestone: m.key,
              dayNumber: m.day,
            });
          }
        }
      }
    }
  }, [perProtocolStats, existingScorecards]);

  // Global streak across ALL protocol-scheduled injections
  const globalStreak = useMemo(() => {
    if (!hasActiveProtocol || allInjections.length === 0) return 0;
    const protocolInjections = allInjections.filter((i) => !!i.protocol_peptide_id);
    const now = new Date();
    const today = startOfDay(now);
    let streak = 0;
    for (let d = 0; d < 365; d++) {
      const day = subDays(today, d);
      const dayInj = protocolInjections.filter((i) => {
        const st = new Date(i.scheduled_time);
        return isSameDay(st, day) && st <= now;
      });
      if (dayInj.length === 0) continue; // Off-day — don't break streak
      if (dayInj.every((i) => i.status === "completed")) streak++;
      else break;
    }
    return streak;
  }, [allInjections, hasActiveProtocol]);

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

  const [showMore, setShowMore] = useState(!hasActiveProtocol);

  // Onboarding banner — show once after first login
  const onboardingBannerKey = user ? `peptyl_onboarding_seen_${user.id}` : null;
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(() => {
    if (!onboardingBannerKey) return false;
    return localStorage.getItem(onboardingBannerKey) !== "true";
  });
  const dismissOnboardingBanner = () => {
    if (onboardingBannerKey) localStorage.setItem(onboardingBannerKey, "true");
    setShowOnboardingBanner(false);
  };
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { shouldAsk, requestPermission } = useRequestNotificationPermission();
  const [notifDismissed, setNotifDismissed] = useState(false);



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

      // Generate today's dose logs — use upsert to avoid duplicate key errors
      if (rec.peptides.length > 0) {
        const { data: protocolPeptides } = await supabase
          .from("protocol_peptides")
          .select("id, peptide_name, timing")
          .eq("protocol_id", protocol.id);

        for (const pp of protocolPeptides ?? []) {
          const timing = (pp.timing || "AM").toUpperCase();
          const timings: string[] = [];
          if (timing.includes("AM")) timings.push("09:00");
          if (timing.includes("PM") || timing === "AM+PM") timings.push("21:00");
          if (timings.length === 0) timings.push("09:00");

          const matchingRec = rec.peptides.find((p) => p.name === pp.peptide_name);
          if (!matchingRec) continue;

          for (const t of timings) {
            // First try to claim any existing unlinked log for this slot
            const scheduledTime = `${startDate}T${t}:00.000Z`;
            const { data: existingLog } = await supabase
              .from("injection_logs")
              .select("id")
              .eq("user_id", user!.id)
              .eq("peptide_name", pp.peptide_name)
              .eq("scheduled_time", scheduledTime)
              .maybeSingle();

            if (existingLog) {
              // Link the existing log to this protocol
              await supabase
                .from("injection_logs")
                .update({ protocol_peptide_id: pp.id })
                .eq("id", existingLog.id);
            } else {
              await supabase.from("injection_logs").insert({
                user_id: user!.id,
                peptide_name: pp.peptide_name,
                dose_mcg: matchingRec.dose_mcg,
                scheduled_time: scheduledTime,
                protocol_peptide_id: pp.id,
                status: "scheduled",
              });
            }
          }
        }
      }

      toast({ title: "Protocol activated", description: `${rec.protocolName} is now active. Today's doses have been scheduled.` });
    } catch (err: any) {
      const msg = err?.message || "";
      let userMessage = "Failed to activate protocol. Please try again.";
      if (msg.includes("already active")) {
        userMessage = `"${rec.protocolName}" is already in your active protocols. Please edit or delete the existing one first.`;
      } else if (msg.includes("duplicate key") || msg.includes("unique constraint")) {
        userMessage = `"${rec.protocolName}" already has scheduled doses for today. Please delete the existing protocol first, then try again.`;
      }
      toast({ title: "Protocol already exists", description: userMessage, variant: "destructive" });
    } finally {
      setActivatingProtocol(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="My Health Dashboard - Protocols, Doses & Bloodwork"
        description="Track supplements, peptides, and protocols in one place. Log doses, set reminders, monitor bloodwork trends, and optimise your health with data."
        path="/dashboard"
      />
      <Header />
      <main className="pt-20 pb-28 md:pb-16">
        {/* Ambient radial glow behind hero area */}
        <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-20 blur-[100px] -z-10"
          style={{ background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.3) 0%, transparent 70%)" }}
        />
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="mb-6 space-y-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground leading-tight tracking-tight">
                My <span className="text-gradient-teal">Health</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 ml-2 align-middle">Beta</span>
              </h1>
              <VideoHelpButton />
            </div>
            <p className="text-muted-foreground text-sm">
              Your daily actions, biomarkers, and active protocols.
            </p>
          </motion.div>

          <MobileTabNav activeTab={activeTab} onTabChange={setActiveTab} />

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
              <Tabs value={profileSubTab} onValueChange={setProfileSubTab} className="space-y-4">
                <TabsList className="w-full grid grid-cols-4 overflow-x-auto no-scrollbar">
                  <TabsTrigger value="profile-info" className="text-xs sm:text-sm gap-1 sm:gap-1.5 min-w-0 px-1.5 sm:px-3">
                    <User className="h-3.5 w-3.5 shrink-0" /><span className="truncate">Profile</span>
                  </TabsTrigger>
                  <TabsTrigger value="bloodwork" className="text-xs sm:text-sm gap-1 sm:gap-1.5 min-w-0 px-1.5 sm:px-3">
                    <Droplets className="h-3.5 w-3.5 shrink-0" /><span className="truncate">Bloodwork</span>
                  </TabsTrigger>
                  <TabsTrigger value="body" className="text-xs sm:text-sm gap-1 sm:gap-1.5 min-w-0 px-1.5 sm:px-3">
                    <Weight className="h-3.5 w-3.5 shrink-0" /><span className="truncate">Body</span>
                  </TabsTrigger>
                  <TabsTrigger value="cardio" className="text-xs sm:text-sm gap-1 sm:gap-1.5 min-w-0 px-1.5 sm:px-3">
                    <Heart className="h-3.5 w-3.5 shrink-0" /><span className="truncate">Cardio</span>
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
              {/* Day Picker */}
              <DayPicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

              {/* ═══ ONBOARDING BANNER (first-time users only) ═══ */}
              {showOnboardingBanner && !hasActiveProtocol && onboardingProfile?.research_goal && (
                <OnboardingSummaryBanner
                  profile={onboardingProfile}
                  hasBloodwork={hasBloodwork}
                  hasDna={hasDna}
                  onDismiss={dismissOnboardingBanner}
                  onNavigateToProtocols={() => { dismissOnboardingBanner(); setActiveTab("protocols"); }}
                  onNavigateToBloodwork={() => { dismissOnboardingBanner(); setActiveTab("profile"); }}
                />
              )}

              {/* ═══ ZONE A — Hero Status ═══ */}
              {protocolsLoading || adherenceLoading ? (
                <div className="space-y-3">
                  {[1].map((i) => (
                    <div key={i} className="rounded-2xl border border-border bg-card p-4 sm:p-5 animate-pulse space-y-3">
                      <div className="h-1 bg-muted rounded-full" />
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-40 bg-muted rounded" />
                          <div className="h-3 w-24 bg-muted/60 rounded" />
                        </div>
                        <div className="w-14 h-14 bg-muted rounded-xl" />
                      </div>
                      <div className="h-6 w-28 bg-muted/50 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : hasActiveProtocol ? (
                <div className="space-y-3">
                  {perProtocolStats.map(({ protocol, rate, dayNumber, totalDays, progressPct, daysLeft, hasPeptides, hasSupplements }, idx) => (
                    <PremiumCard key={protocol.id} glow delay={idx * 0.08}>
                      {/* Progress bar across top */}
                      <div className="h-1 bg-muted">
                        <motion.div
                          className="h-1 bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPct}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                        />
                      </div>

                      <div className="p-4 sm:p-5 space-y-3">
                        {/* Top row: protocol name + day badge */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-heading font-semibold text-foreground truncate">{protocol.name}</p>
                            <p className="text-[11px] text-muted-foreground">{daysLeft > 0 ? `${daysLeft} days remaining` : "Completing today"}</p>
                          </div>
                          <motion.div
                            className="shrink-0 bg-primary/10 rounded-xl px-3 py-1.5 text-center"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.4 }}
                            style={{ boxShadow: "0 0 12px hsl(var(--primary) / 0.1)" }}
                          >
                            <p className="text-lg font-heading font-bold text-primary leading-none">{dayNumber}</p>
                            <p className="text-[9px] text-muted-foreground mt-0.5">of {totalDays}</p>
                          </motion.div>
                        </div>

                        {/* Stat pills row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted/60 rounded-full px-2.5 py-1 text-foreground">
                            {rate !== null ? `${rate}% adherence` : (hasPeptides || hasSupplements) ? "No doses yet" : "No items"}
                          </span>
                        </div>
                      </div>
                    </PremiumCard>
                  ))}

                  <div className="flex items-center gap-2 flex-wrap px-1">
                    {todayRemaining > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary rounded-full px-2.5 py-1">
                        {todayRemaining} left today
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-500/10 text-green-500 rounded-full px-2.5 py-1">
                        ✓ Today complete
                      </span>
                    )}
                  </div>

                  {/* Wearable Summary */}
                  <WearableSummary selectedDate={selectedDate} />
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

              {/* Notification permission banner */}
              {!Capacitor.isNativePlatform() && shouldAsk && !notifDismissed && (
                <div className="flex items-center justify-between gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Activity className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-sm text-foreground">Enable notifications for dose reminders</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={requestPermission} className="text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg">Enable</button>
                    <button onClick={() => setNotifDismissed(true)} className="text-xs text-muted-foreground px-2">✕</button>
                  </div>
                </div>
              )}

              {/* Health Intelligence Score — top of Today */}
              <BioAgeScore />

              {/* Pip AI Companion */}
              <PipMemoryCard />

              {/* ═══ ZONE B — Today's doses (active) OR Next step (inactive) ═══ */}
              {hasActiveProtocol ? (
                <TodaysPlan slim onActivate={() => setActiveTab("protocols")} selectedDate={selectedDate} />
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
                      {/* Adherence snapshot */}
                      <AdherenceSummary onNavigate={() => setActiveTab("injections")} />

                      {/* C1 — Biomarker summary */}
                      {hasBloodwork && <BiomarkerSummary panels={panels} />}

                      {/* GP Summary — clinical flags from Pip */}
                      <GpSummarySection />

                      {/* C2 — Protocol nudges */}
                      <ProtocolNudges onNavigate={setActiveTab} />

                      {/* C2.1 — Wearable-aware nudges */}
                      <WearableNudges />


                      {/* C2.3 — Unified health insights */}
                      <UnifiedInsights />

                      {/* C2.4 — Recommended blood tests */}
                      <RecommendedTests />

                      {/* C2.5 — Research insights feed */}
                      <ResearchInsightsFeed />

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

                      {/* C4 — Personalised recommendations — only when NO active protocol */}
                      {!hasActiveProtocol && recommendations.length > 0 && (hasBloodwork || hasDna) && (
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

                      {/* C5 — Quick journal */}
                      <CompactJournal onExpandJournal={() => setActiveTab("journal")} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Adherence snapshot */}
                  <AdherenceSummary onNavigate={() => setActiveTab("injections")} />

                  {/* C1 — Biomarker summary */}
                  {hasBloodwork && <BiomarkerSummary panels={panels} />}

                  {/* GP Summary — clinical flags from Pip */}
                  <GpSummarySection />

                  {/* C2 — Protocol nudges */}
                  <ProtocolNudges onNavigate={setActiveTab} />

                  {/* C2.1 — Wearable-aware nudges */}
                  <WearableNudges />


                  {/* C2.3 — Unified health insights */}
                  <UnifiedInsights />

                  {/* C2.4 — Recommended blood tests */}
                  <RecommendedTests />

                  {/* C2.5 — Research insights feed */}
                  <ResearchInsightsFeed />

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

                  {/* C4 — Personalised recommendations — only when NO active protocol */}
                  {!hasActiveProtocol && recommendations.length > 0 && (hasBloodwork || hasDna) && (
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

                  {/* C5 — Quick journal */}
                  <CompactJournal onExpandJournal={() => setActiveTab("journal")} />
                </div>
              )}

            </TabsContent>



            {/* PROTOCOLS TAB */}
            <TabsContent value="protocols" className="space-y-6">
              {/* ACTIVE PLAN — always first */}
              <ActiveProtocols />

              {/* PREVIOUS PLANS — completed/archived */}
              <PreviousPlans />

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
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-heading font-semibold text-foreground">
                      Recommendations tailored to your biology
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Add bloodwork or a DNA file and we'll surface protocols matched to your actual biology.
                    Until then, browse below — we've marked beginner-safe options clearly.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => setActiveTab("profile")}>
                      <Droplets className="h-3.5 w-3.5 mr-1.5" /> Log bloodwork
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate("/dna/upload")}>
                      <Dna className="h-3.5 w-3.5 mr-1.5" /> Upload DNA
                    </Button>
                  </div>
                </div>
              )}

              {/* SUPPLEMENT + PEPTIDE PROTOCOLS (split) */}
              <PopularProtocols
                onActivate={handleActivateProtocol}
                isActivating={activatingProtocol}
                disclaimerAccepted={disclaimerAccepted}
              />

              {/* COMMUNITY PICKS */}
              <CollaborativeRecommendations />

              {/* QUICK STACK IMPORT */}
              <QuickStackImport disclaimerAccepted={disclaimerAccepted} />

              {/* CREATE CUSTOM */}
              <CreateProtocolForm disclaimerAccepted={disclaimerAccepted} initialPeptide={initialPeptide} onInitialPeptideConsumed={() => setInitialPeptide(null)} />
            </TabsContent>

            {/* TRACKER TAB */}
            <TabsContent value="injections" className="space-y-6">
              <TodaysPlan onActivate={() => setActiveTab("protocols")} />
              <ActiveProtocols />
              <AdherenceTracker />
            </TabsContent>

            {/* RESULTS TAB */}
            <TabsContent value="results" className="space-y-6">
              <ResultsTab />
            </TabsContent>
          </Tabs>


        </div>
      </main>
      {!isMobile && <Footer />}
    </div>
  );
};

export default Dashboard;
