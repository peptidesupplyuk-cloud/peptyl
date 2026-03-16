import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpen, Pill, Calculator, Droplets, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PeptidesContent from "@/components/content/PeptidesContent";
import SupplementsContent from "@/components/content/SupplementsContent";
import CalculatorsContent from "@/components/content/CalculatorsContent";
import SEO from "@/components/SEO";
import { lazy, Suspense } from "react";

const TestingContent = lazy(() => import("@/pages/Testing").then(m => ({ default: m.TestingContent })));
const StacksContent = lazy(() => import("@/components/content/StacksContent"));

const TABS = [
  { value: "peptides", label: "Peptides", icon: BookOpen },
  { value: "supplements", label: "Supplements", icon: Pill },
  { value: "stacks", label: "Stacks", icon: Layers },
  { value: "calculators", label: "Calculators", icon: Calculator },
  { value: "testing", label: "Testing", icon: Droplets },
] as const;

const ImprovePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "peptides";
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value }, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Peptide & Supplement Knowledge Base — Free Research Tools"
        description="Browse peptides and supplements with evidence grades, dosing data, and mechanism breakdowns. Use free calculators for reconstitution, dosing, and cycle planning."
        path="/improve"
      />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
             <TabsList className="mb-8 w-full max-w-lg overflow-x-auto no-scrollbar">
              {TABS.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value} className="flex items-center gap-1.5 sm:gap-2 flex-1 text-xs sm:text-sm min-w-0">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="peptides">
              <PeptidesContent />
            </TabsContent>
            <TabsContent value="supplements">
              <SupplementsContent />
            </TabsContent>
            <TabsContent value="calculators">
              <CalculatorsContent />
            </TabsContent>
            <TabsContent value="testing">
              <Suspense fallback={<div className="min-h-[400px]" />}>
                <TestingContent />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ImprovePage;
