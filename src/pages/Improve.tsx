import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Database, Calculator } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PeptidesContent from "@/components/content/PeptidesContent";
import CalculatorsContent from "@/components/content/CalculatorsContent";
import SEO from "@/components/SEO";

const TABS = [
  { value: "peptides", label: "Peptides", icon: Database },
  { value: "calculators", label: "Calculators", icon: Calculator },
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
        title="Improve — Peptides & Calculators | Peptyl"
        description="Browse our peptide database and use precision calculators for reconstitution, dosing, and cycle planning."
        path="/improve"
      />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-8 w-full max-w-xs">
              {TABS.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value} className="flex items-center gap-2 flex-1">
                  <Icon className="h-4 w-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="peptides">
              <PeptidesContent />
            </TabsContent>
            <TabsContent value="calculators">
              <CalculatorsContent />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ImprovePage;
