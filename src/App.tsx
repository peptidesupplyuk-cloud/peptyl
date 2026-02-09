import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PeptideChat from "@/components/PeptideChat";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Peptides from "./pages/Peptides";
import Calculators from "./pages/Calculators";
import Education from "./pages/Education";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Shop from "./pages/Shop";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

const BeginnersGuide = lazy(() => import("./pages/articles/BeginnersGuide"));
const HowToReconstitute = lazy(() => import("./pages/articles/HowToReconstitute"));
const Bpc157VsTb500 = lazy(() => import("./pages/articles/Bpc157VsTb500"));
const StorageGuide = lazy(() => import("./pages/articles/StorageGuide"));
const Glp1Guide = lazy(() => import("./pages/articles/Glp1Guide"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/peptides" element={<Peptides />} />
              <Route path="/calculators" element={<ProtectedRoute><Calculators /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/education" element={<Education />} />
              <Route path="/about" element={<About />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/education/beginners-guide-peptides" element={<BeginnersGuide />} />
              <Route path="/education/how-to-reconstitute-peptides" element={<HowToReconstitute />} />
              <Route path="/education/bpc157-vs-tb500" element={<Bpc157VsTb500 />} />
              <Route path="/education/peptide-storage-guide" element={<StorageGuide />} />
              <Route path="/education/understanding-glp1-peptides" element={<Glp1Guide />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <PeptideChat />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
