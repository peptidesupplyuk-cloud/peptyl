import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
const PeptideChat = lazy(() => import("@/components/PeptideChat"));

const PWAUpdatePrompt = lazy(() => import("@/components/PWAUpdatePrompt"));
import { useActivityTracker } from "@/hooks/use-activity-tracker";

const SitewideDisclaimer = lazy(() => import("@/components/SitewideDisclaimer"));
import ScrollToTop from "@/components/ScrollToTop";
import GeoGate from "@/components/GeoGate";
const GlobalMobileNav = lazy(() => import("@/components/GlobalMobileNav"));

// Lazy-load ALL pages for faster initial load
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const CompleteProfile = lazy(() => import("./pages/CompleteProfile"));
const Peptides = lazy(() => import("./pages/Peptides"));
const Calculators = lazy(() => import("./pages/Calculators"));
const Education = lazy(() => import("./pages/Education"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Improve = lazy(() => import("./pages/Improve"));
const ShopHub = lazy(() => import("./pages/ShopHub"));
const Testing = lazy(() => import("./pages/Testing"));
const NotFound = lazy(() => import("./pages/NotFound"));
const About = lazy(() => import("./pages/About"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Shop = lazy(() => import("./pages/Shop"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ResearchQueue = lazy(() => import("./pages/ResearchQueue"));

const BeginnersGuide = lazy(() => import("./pages/articles/BeginnersGuide"));
const HowToReconstitute = lazy(() => import("./pages/articles/HowToReconstitute"));
const Bpc157VsTb500 = lazy(() => import("./pages/articles/Bpc157VsTb500"));
const StorageGuide = lazy(() => import("./pages/articles/StorageGuide"));
const Glp1Guide = lazy(() => import("./pages/articles/Glp1Guide"));
const RetatrutideReview = lazy(() => import("./pages/articles/RetatrutideReview"));
const GhkCuGuide = lazy(() => import("./pages/articles/GhkCuGuide"));
const RussiaPeptides = lazy(() => import("./pages/articles/RussiaPeptides"));
const WhatIsPeptyl = lazy(() => import("./pages/articles/WhatIsPeptyl"));
const BpSupplementStack = lazy(() => import("./pages/articles/BpSupplementStack"));
const LongevityStack = lazy(() => import("./pages/articles/LongevityStack"));
const RecoveryStack = lazy(() => import("./pages/articles/RecoveryStack"));
const CognitiveStack = lazy(() => import("./pages/articles/CognitiveStack"));
const Mt1VsMt2 = lazy(() => import("./pages/articles/Mt1VsMt2"));
const OralGlp1Boom = lazy(() => import("./pages/articles/OralGlp1Boom"));
const BloodworkFirst = lazy(() => import("./pages/articles/BloodworkFirst"));
const NadLongevityStack = lazy(() => import("./pages/articles/NadLongevityStack"));
const ThymosinAlpha1 = lazy(() => import("./pages/articles/ThymosinAlpha1"));
const PeptideCycling = lazy(() => import("./pages/articles/PeptideCycling"));
const GutHealthPeptides = lazy(() => import("./pages/articles/GutHealthPeptides"));
const EuropeanPeptideGuide = lazy(() => import("./pages/articles/EuropeanPeptideGuide"));
const PeptidesCancer2026 = lazy(() => import("./pages/articles/PeptidesCancer2026"));
const PeptideCrazeBiohacking = lazy(() => import("./pages/articles/PeptideCrazeBiohacking"));
const MotsCMitochondrial = lazy(() => import("./pages/articles/MotsCMitochondrial"));
const Ss31Elamipretide = lazy(() => import("./pages/articles/Ss31Elamipretide"));
const Bpc157Dosage = lazy(() => import("./pages/articles/Bpc157Dosage"));
const Bpc157OralVsInjection = lazy(() => import("./pages/articles/Bpc157OralVsInjection"));
const Bpc157SideEffects = lazy(() => import("./pages/articles/Bpc157SideEffects"));
const SemaglutideUkGuide = lazy(() => import("./pages/articles/SemaglutideUkGuide"));
const TirzepatideVsSemaglutide = lazy(() => import("./pages/articles/TirzepatideVsSemaglutide"));
const Glp1MuscleLoss = lazy(() => import("./pages/articles/Glp1MuscleLoss"));
const BodybuilderPeptides = lazy(() => import("./pages/articles/BodybuilderPeptides"));
const HumaninPeptide = lazy(() => import("./pages/articles/HumaninPeptide"));
const MyostatinBlockers = lazy(() => import("./pages/articles/MyostatinBlockers"));
const Fgf21Longevity = lazy(() => import("./pages/articles/Fgf21Longevity"));
const PeptideStackingGuide = lazy(() => import("./pages/articles/PeptideStackingGuide"));
const SemaxSelankGuide = lazy(() => import("./pages/articles/SemaxSelankGuide"));
const EndotoxinPurity = lazy(() => import("./pages/articles/EndotoxinPurity"));
const Glossary = lazy(() => import("./pages/Glossary"));
const SiteMapPage = lazy(() => import("./pages/SiteMap"));
const CampaignPage = lazy(() => import("./pages/CampaignPage"));
const WhoopCallback = lazy(() => import("./pages/WhoopCallback"));
const FitbitCallback = lazy(() => import("./pages/FitbitCallback"));
const DNALanding = lazy(() => import("./pages/dna/DNALanding"));
const DNAUpload = lazy(() => import("./pages/dna/DNAUpload"));
const DNAQuestionnaire = lazy(() => import("./pages/dna/DNAQuestionnaire"));
const DNAAnalysing = lazy(() => import("./pages/dna/DNAAnalysing"));
const DNAReport = lazy(() => import("./pages/dna/DNAReport"));
const DNADashboard = lazy(() => import("./pages/dna/DNADashboard"));
const JoinReferral = lazy(() => import("./pages/JoinReferral"));

const queryClient = new QueryClient();

const AppContent = () => {
  useActivityTracker();
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
          <Route path="/peptides" element={<Peptides />} />
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
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/sitemap" element={<SiteMapPage />} />
          <Route path="/whoop-callback" element={<WhoopCallback />} />
          <Route path="/fitbit-callback" element={<FitbitCallback />} />
          <Route path="/start/:slug" element={<CampaignPage />} />
          <Route path="/dna" element={<DNALanding />} />
          <Route path="/dna/upload" element={<ProtectedRoute><DNAUpload /></ProtectedRoute>} />
          <Route path="/dna/analysing" element={<ProtectedRoute><DNAAnalysing /></ProtectedRoute>} />
          <Route path="/dna/report/:id" element={<ProtectedRoute><DNAReport /></ProtectedRoute>} />
          <Route path="/dna/dashboard" element={<ProtectedRoute><DNADashboard /></ProtectedRoute>} />
          <Route path="/join/:code" element={<JoinReferral />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <GlobalMobileNav />
      <PeptideChat />
      
      
      <SitewideDisclaimer />
      <PWAUpdatePrompt />
    </>
  );
};

const App = () => (
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
);

export default App;
