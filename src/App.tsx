import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import Peptides from "./pages/Peptides";
import Calculators from "./pages/Calculators";
import Education from "./pages/Education";
import NotFound from "./pages/NotFound";

const BeginnersGuide = lazy(() => import("./pages/articles/BeginnersGuide"));
const HowToReconstitute = lazy(() => import("./pages/articles/HowToReconstitute"));
const Bpc157VsTb500 = lazy(() => import("./pages/articles/Bpc157VsTb500"));
const StorageGuide = lazy(() => import("./pages/articles/StorageGuide"));
const Glp1Guide = lazy(() => import("./pages/articles/Glp1Guide"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/peptides" element={<Peptides />} />
            <Route path="/calculators" element={<Calculators />} />
            <Route path="/education" element={<Education />} />
            <Route path="/education/beginners-guide-peptides" element={<BeginnersGuide />} />
            <Route path="/education/how-to-reconstitute-peptides" element={<HowToReconstitute />} />
            <Route path="/education/bpc157-vs-tb500" element={<Bpc157VsTb500 />} />
            <Route path="/education/peptide-storage-guide" element={<StorageGuide />} />
            <Route path="/education/understanding-glp1-peptides" element={<Glp1Guide />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
