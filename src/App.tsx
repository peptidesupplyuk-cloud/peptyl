import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PeptideChat from "@/components/PeptideChat";
import SignupBanner from "@/components/SignupBanner";
import FeedbackBanner from "@/components/FeedbackBanner";
import SitewideDisclaimer from "@/components/SitewideDisclaimer";
import ScrollToTop from "@/components/ScrollToTop";
import GeoGate from "@/components/GeoGate";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
import Peptides from "./pages/Peptides";
import Calculators from "./pages/Calculators";
import Education from "./pages/Education";
import Dashboard from "./pages/Dashboard";
import Improve from "./pages/Improve";
import ShopHub from "./pages/ShopHub";
const Testing = lazy(() => import("./pages/Testing"));
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Shop from "./pages/Shop";
import Suppliers from "./pages/Suppliers";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

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
const CampaignPage = lazy(() => import("./pages/CampaignPage"));
const WhoopCallback = lazy(() => import("./pages/WhoopCallback"));
const FitbitCallback = lazy(() => import("./pages/FitbitCallback"));
const DNALanding = lazy(() => import("./pages/dna/DNALanding"));
const DNAUpload = lazy(() => import("./pages/dna/DNAUpload"));
const DNAAnalysing = lazy(() => import("./pages/dna/DNAAnalysing"));
const DNAReport = lazy(() => import("./pages/dna/DNAReport"));
const DNADashboard = lazy(() => import("./pages/dna/DNADashboard"));

const queryClient = new QueryClient();

const App = () => (
  <GeoGate>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/peptides" element={<Peptides />} />
              <Route path="/calculators" element={<ProtectedRoute><Calculators /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/improve" element={<Improve />} />
              <Route path="/education" element={<Education />} />
              <Route path="/about" element={<About />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/shop" element={<ShopHub />} />
              <Route path="/testing" element={<Testing />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/admin/content" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
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
              <Route path="/whoop-callback" element={<WhoopCallback />} />
              <Route path="/fitbit-callback" element={<FitbitCallback />} />
              <Route path="/start/:slug" element={<CampaignPage />} />
              <Route path="/dna" element={<DNALanding />} />
              <Route path="/dna/upload" element={<ProtectedRoute><DNAUpload /></ProtectedRoute>} />
              <Route path="/dna/analysing" element={<ProtectedRoute><DNAAnalysing /></ProtectedRoute>} />
              <Route path="/dna/report/:id" element={<ProtectedRoute><DNAReport /></ProtectedRoute>} />
              <Route path="/dna/dashboard" element={<ProtectedRoute><DNADashboard /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <PeptideChat />
          <SignupBanner />
          <FeedbackBanner />
          <SitewideDisclaimer />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </GeoGate>
);

export default App;
