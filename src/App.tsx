import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { lazyWithRetry } from "@/lib/lazy-with-retry";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PeptideChat from "@/components/PeptideChat";

import PWAUpdatePrompt from "@/components/PWAUpdatePrompt";
import { useActivityTracker } from "@/hooks/use-activity-tracker";

import SitewideDisclaimer from "@/components/SitewideDisclaimer";
import ScrollToTop from "@/components/ScrollToTop";
import GeoGate from "@/components/GeoGate";
import PWACrashRecovery from "@/components/PWACrashRecovery";
import GlobalMobileNav from "@/components/GlobalMobileNav";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import CompleteProfile from "./pages/CompleteProfile";
import Dashboard from "./pages/Dashboard";
import PipFloatingButton from "./components/pip/PipFloatingButton";

// Lazy-load ALL pages for faster initial load
const Index = lazyWithRetry(() => import("./pages/Index"));
const Peptides = lazyWithRetry(() => import("./pages/Peptides"));
const Calculators = lazyWithRetry(() => import("./pages/Calculators"));
const Education = lazyWithRetry(() => import("./pages/Education"));
const Improve = lazyWithRetry(() => import("./pages/Improve"));
const ShopHub = lazyWithRetry(() => import("./pages/ShopHub"));
const Testing = lazyWithRetry(() => import("./pages/Testing"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const About = lazyWithRetry(() => import("./pages/About"));
const FAQ = lazyWithRetry(() => import("./pages/FAQ"));
const Shop = lazyWithRetry(() => import("./pages/Shop"));
const Suppliers = lazyWithRetry(() => import("./pages/Suppliers"));
const PrivacyPolicy = lazyWithRetry(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazyWithRetry(() => import("./pages/TermsOfService"));
const AdminDashboard = lazyWithRetry(() => import("./pages/AdminDashboard"));
const ResearchQueue = lazyWithRetry(() => import("./pages/ResearchQueue"));

const BeginnersGuide = lazyWithRetry(() => import("./pages/articles/BeginnersGuide"));
const HowToReconstitute = lazyWithRetry(() => import("./pages/articles/HowToReconstitute"));
const Bpc157VsTb500 = lazyWithRetry(() => import("./pages/articles/Bpc157VsTb500"));
const StorageGuide = lazyWithRetry(() => import("./pages/articles/StorageGuide"));
const Glp1Guide = lazyWithRetry(() => import("./pages/articles/Glp1Guide"));
const RetatrutideReview = lazyWithRetry(() => import("./pages/articles/RetatrutideReview"));
const GhkCuGuide = lazyWithRetry(() => import("./pages/articles/GhkCuGuide"));
const RussiaPeptides = lazyWithRetry(() => import("./pages/articles/RussiaPeptides"));
const WhatIsPeptyl = lazyWithRetry(() => import("./pages/articles/WhatIsPeptyl"));
const BpSupplementStack = lazyWithRetry(() => import("./pages/articles/BpSupplementStack"));
const LongevityStack = lazyWithRetry(() => import("./pages/articles/LongevityStack"));
const RecoveryStack = lazyWithRetry(() => import("./pages/articles/RecoveryStack"));
const CognitiveStack = lazyWithRetry(() => import("./pages/articles/CognitiveStack"));
const Mt1VsMt2 = lazyWithRetry(() => import("./pages/articles/Mt1VsMt2"));
const OralGlp1Boom = lazyWithRetry(() => import("./pages/articles/OralGlp1Boom"));
const BloodworkFirst = lazyWithRetry(() => import("./pages/articles/BloodworkFirst"));
const NadLongevityStack = lazyWithRetry(() => import("./pages/articles/NadLongevityStack"));
const ThymosinAlpha1 = lazyWithRetry(() => import("./pages/articles/ThymosinAlpha1"));
const PeptideCycling = lazyWithRetry(() => import("./pages/articles/PeptideCycling"));
const GutHealthPeptides = lazyWithRetry(() => import("./pages/articles/GutHealthPeptides"));
const EuropeanPeptideGuide = lazyWithRetry(() => import("./pages/articles/EuropeanPeptideGuide"));
const PeptidesCancer2026 = lazyWithRetry(() => import("./pages/articles/PeptidesCancer2026"));
const PeptideCrazeBiohacking = lazyWithRetry(() => import("./pages/articles/PeptideCrazeBiohacking"));
const MotsCMitochondrial = lazyWithRetry(() => import("./pages/articles/MotsCMitochondrial"));
const Ss31Elamipretide = lazyWithRetry(() => import("./pages/articles/Ss31Elamipretide"));
const Bpc157Dosage = lazyWithRetry(() => import("./pages/articles/Bpc157Dosage"));
const Bpc157OralVsInjection = lazyWithRetry(() => import("./pages/articles/Bpc157OralVsInjection"));
const Bpc157SideEffects = lazyWithRetry(() => import("./pages/articles/Bpc157SideEffects"));
const SemaglutideUkGuide = lazyWithRetry(() => import("./pages/articles/SemaglutideUkGuide"));
const TirzepatideVsSemaglutide = lazyWithRetry(() => import("./pages/articles/TirzepatideVsSemaglutide"));
const Glp1MuscleLoss = lazyWithRetry(() => import("./pages/articles/Glp1MuscleLoss"));
const BodybuilderPeptides = lazyWithRetry(() => import("./pages/articles/BodybuilderPeptides"));
const HumaninPeptide = lazyWithRetry(() => import("./pages/articles/HumaninPeptide"));
const MyostatinBlockers = lazyWithRetry(() => import("./pages/articles/MyostatinBlockers"));
const Fgf21Longevity = lazyWithRetry(() => import("./pages/articles/Fgf21Longevity"));
const PeptideStackingGuide = lazyWithRetry(() => import("./pages/articles/PeptideStackingGuide"));
const SemaxSelankGuide = lazyWithRetry(() => import("./pages/articles/SemaxSelankGuide"));
const EndotoxinPurity = lazyWithRetry(() => import("./pages/articles/EndotoxinPurity"));
const Glp1SideEffects = lazyWithRetry(() => import("./pages/articles/Glp1SideEffects"));
const Glossary = lazyWithRetry(() => import("./pages/Glossary"));
const SiteMapPage = lazyWithRetry(() => import("./pages/SiteMap"));
const CampaignPage = lazyWithRetry(() => import("./pages/CampaignPage"));
const WhoopCallback = lazyWithRetry(() => import("./pages/WhoopCallback"));
const FitbitCallback = lazyWithRetry(() => import("./pages/FitbitCallback"));
const DNALanding = lazyWithRetry(() => import("./pages/dna/DNALanding"));
const DNAUpload = lazyWithRetry(() => import("./pages/dna/DNAUpload"));
const DNAQuestionnaire = lazyWithRetry(() => import("./pages/dna/DNAQuestionnaire"));
const DNAAnalysing = lazyWithRetry(() => import("./pages/dna/DNAAnalysing"));
const DNAReport = lazyWithRetry(() => import("./pages/dna/DNAReport"));
const DNADashboard = lazyWithRetry(() => import("./pages/dna/DNADashboard"));
const JoinReferral = lazyWithRetry(() => import("./pages/JoinReferral"));
const CompoundIntelligence = lazyWithRetry(() => import("./pages/CompoundIntelligence"));
const PipChatPage = lazyWithRetry(() => import("./pages/PipChat"));
const SharedCoachPlan = lazyWithRetry(() => import("./pages/SharedCoachPlan"));
const PeptideDetail = lazyWithRetry(() => import("./pages/PeptideDetail"));
const SupplementDetail = lazyWithRetry(() => import("./pages/SupplementDetail"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-sm text-muted-foreground">Loading…</div>
  </div>
);

const AppContent = () => {
  useActivityTracker();
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
          <Route path="/peptides" element={<Peptides />} />
          <Route path="/peptides/:slug" element={<PeptideDetail />} />
          <Route path="/supplements/:slug" element={<SupplementDetail />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/improve" element={<Improve />} />
          <Route path="/education" element={<Education />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/shop" element={<ShopHub />} />
          <Route path="/testing" element={<Testing />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/admin/content" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/research-queue" element={<ProtectedRoute><ResearchQueue /></ProtectedRoute>} />
          <Route path="/education/beginners-guide-peptides" element={<BeginnersGuide />} />
          <Route path="/education/how-to-reconstitute-peptides" element={<HowToReconstitute />} />
          <Route path="/education/bpc157-vs-tb500" element={<Bpc157VsTb500 />} />
          <Route path="/education/peptide-storage-guide" element={<StorageGuide />} />
          <Route path="/education/understanding-glp1-peptides" element={<Glp1Guide />} />
          <Route path="/education/retatrutide-triple-agonist-review" element={<RetatrutideReview />} />
          <Route path="/education/ghk-cu-pretty-peptide" element={<GhkCuGuide />} />
          <Route path="/education/russia-cognitive-peptides" element={<RussiaPeptides />} />
          <Route path="/education/what-is-peptyl" element={<WhatIsPeptyl />} />
          <Route path="/education/bp-supplement-stack" element={<BpSupplementStack />} />
          <Route path="/education/longevity-supplement-stack" element={<LongevityStack />} />
          <Route path="/education/recovery-supplement-stack" element={<RecoveryStack />} />
          <Route path="/education/cognitive-supplement-stack" element={<CognitiveStack />} />
          <Route path="/education/mt1-vs-mt2" element={<Mt1VsMt2 />} />
          <Route path="/education/oral-glp1-boom-2026" element={<OralGlp1Boom />} />
          <Route path="/education/bloodwork-comes-first" element={<BloodworkFirst />} />
          <Route path="/education/nad-longevity-stack" element={<NadLongevityStack />} />
          <Route path="/education/thymosin-alpha-1-immune-peptide" element={<ThymosinAlpha1 />} />
          <Route path="/education/peptide-cycling-guide" element={<PeptideCycling />} />
          <Route path="/education/gut-health-peptides" element={<GutHealthPeptides />} />
          <Route path="/education/peptide-research-europe-guide" element={<EuropeanPeptideGuide />} />
          <Route path="/education/peptides-cancer-therapy-2026" element={<PeptidesCancer2026 />} />
          <Route path="/education/peptide-craze-biohacking" element={<PeptideCrazeBiohacking />} />
          <Route path="/education/mots-c-mitochondrial-peptide" element={<MotsCMitochondrial />} />
          <Route path="/education/ss31-elamipretide-mitochondrial-ageing" element={<Ss31Elamipretide />} />
          <Route path="/education/bpc-157-dosage-guide" element={<Bpc157Dosage />} />
          <Route path="/education/bpc-157-oral-vs-injection" element={<Bpc157OralVsInjection />} />
          <Route path="/education/bpc-157-side-effects" element={<Bpc157SideEffects />} />
          <Route path="/education/semaglutide-uk-guide" element={<SemaglutideUkGuide />} />
          <Route path="/education/tirzepatide-vs-semaglutide" element={<TirzepatideVsSemaglutide />} />
          <Route path="/education/glp1-muscle-loss-prevention" element={<Glp1MuscleLoss />} />
          <Route path="/education/peptides-bodybuilders-use" element={<BodybuilderPeptides />} />
          <Route path="/education/humanin-longevity-peptide" element={<HumaninPeptide />} />
          <Route path="/education/myostatin-blockers-bimagrumab" element={<MyostatinBlockers />} />
          <Route path="/education/fgf21-metabolic-longevity" element={<Fgf21Longevity />} />
          <Route path="/education/peptide-stacking-guide" element={<PeptideStackingGuide />} />
          <Route path="/education/semax-selank-dosage-guide" element={<SemaxSelankGuide />} />
          <Route path="/education/endotoxin-purity-peptides" element={<EndotoxinPurity />} />
          <Route path="/education/glp1-side-effects-supplements" element={<Glp1SideEffects />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/sitemap" element={<SiteMapPage />} />
          <Route path="/whoop-callback" element={<WhoopCallback />} />
          <Route path="/fitbit-callback" element={<FitbitCallback />} />
          <Route path="/start/:slug" element={<CampaignPage />} />
          <Route path="/dna" element={<DNALanding />} />
          <Route path="/dna/upload" element={<ProtectedRoute><DNAUpload /></ProtectedRoute>} />
          <Route path="/dna/questionnaire" element={<ProtectedRoute><DNAQuestionnaire /></ProtectedRoute>} />
          <Route path="/dna/analysing" element={<ProtectedRoute><DNAAnalysing /></ProtectedRoute>} />
          <Route path="/dna/report/:id" element={<ProtectedRoute><DNAReport /></ProtectedRoute>} />
          <Route path="/dna/dashboard" element={<ProtectedRoute><DNADashboard /></ProtectedRoute>} />
          <Route path="/compound/:compoundId" element={<ProtectedRoute><CompoundIntelligence /></ProtectedRoute>} />
          <Route path="/pip" element={<ProtectedRoute><PipChatPage /></ProtectedRoute>} />
          <Route path="/join/:code" element={<JoinReferral />} />
          <Route path="/plan/:token" element={<SharedCoachPlan />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <GlobalMobileNav />
      <PeptideChat />
      <PipFloatingButton />
      <SitewideDisclaimer />
      <PWAUpdatePrompt />
    </>
  );
};

const App = () => (
  <PWACrashRecovery>
    <GeoGate>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GeoGate>
  </PWACrashRecovery>
);

export default App;
