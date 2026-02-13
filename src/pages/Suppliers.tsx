import { ShieldCheck, AlertTriangle, Search, ArrowUpDown, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import ProductCards from "@/components/suppliers/ProductCards";
import EligibilityIndicator from "@/components/suppliers/EligibilityIndicator";
import { useSupplierPrices } from "@/hooks/use-supplier-prices";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

const Suppliers = () => {
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [tab, setTab] = useState<"medications" | "bloodwork">("medications");

  const queryClient = useQueryClient();
  const category = tab === "medications" ? "medication" : "bloodwork";
  const { products: activeProducts, lastUpdated, isLive, isLoading } = useSupplierPrices(category as "medication" | "bloodwork");

  const handleForceRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["supplier-prices"] });
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return activeProducts
      .filter(p => p.name.toLowerCase().includes(q))
      .map(p => ({
        ...p,
        prices: [...p.prices].sort((a, b) => sortAsc ? a.price - b.price : b.price - a.price),
      }));
  }, [search, sortAsc, activeProducts]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Compare Prices — UK Approved Suppliers"
        description="Compare prices for GLP-1 medications and bloodwork from approved UK pharmacies and labs. Find the best deal from trusted suppliers."
        path="/suppliers"
      />
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-hero relative overflow-hidden">
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-teal/5 blur-3xl" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 inline-block mb-6"
          >
            Price Comparison
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-heading font-bold text-primary-foreground leading-tight max-w-2xl"
          >
            Find the Best Price from{" "}
            <span className="text-primary">Approved UK Suppliers</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-primary-foreground/60 max-w-xl"
          >
            We aggregate pricing from trusted, regulated UK pharmacies and labs. No guarantees on availability — we're here to help you compare.
          </motion.p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-6 border-b border-border">
        <div className="container mx-auto px-6">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-warm/5 border border-warm/20 max-w-3xl">
            <AlertTriangle className="h-5 w-5 text-warm mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Disclaimer:</strong> Peptyl does not sell or guarantee stock of any product listed. Prices shown are indicative and sourced from public listings. We simply help you find and compare options from <strong className="text-foreground">approved UK providers</strong>. Always consult a healthcare professional before starting any treatment.
            </p>
          </div>
        </div>
      </section>

      {/* Last Updated Indicator */}
      <section className="py-3 border-b border-border">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              {lastUpdated ? (
                <>
                  <span>Prices last updated {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}</span>
                  {isLive && <span className="px-1.5 py-0.5 rounded bg-success/10 text-success text-[10px] font-medium">Live</span>}
                </>
              ) : (
                <span>No pricing data has been added yet.</span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleForceRefresh} disabled={isLoading} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="pt-8">
        <div className="container mx-auto px-6">
          <Tabs value={tab} onValueChange={(v) => { setTab(v as "medications" | "bloodwork"); setSearch(""); }} className="w-full">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-8">
              <TabsTrigger value="medications" className="gap-1.5">💊 Medications</TabsTrigger>
              <TabsTrigger value="bloodwork" className="gap-1.5">🩸 Bloodwork</TabsTrigger>
            </TabsList>

            <TabsContent value="medications" className="mt-0">
              <div className="space-y-8">
                {/* Offering chips */}
                <div>
                  <h2 className="text-xl font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" /> Available Medications
                  </h2>
                  <div className="flex gap-2 flex-wrap">
                    {["Semaglutide (Wegovy)", "Tirzepatide (Mounjaro)", "Liraglutide (Saxenda)", "Orlistat"].map(name => (
                      <span key={name} className="px-3 py-1.5 rounded-full border border-border bg-card text-sm font-medium text-foreground">{name}</span>
                    ))}
                  </div>
                </div>

                {/* Search + Sort */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search medications…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSortAsc(!sortAsc)} className="gap-1.5">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    Price: {sortAsc ? "Low → High" : "High → Low"}
                  </Button>
                </div>

                <EligibilityIndicator />

                <ProductCards products={filtered} />
              </div>
            </TabsContent>

            <TabsContent value="bloodwork" className="mt-0">
              <div className="space-y-8">
                {/* Offering chips */}
                <div>
                  <h2 className="text-xl font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" /> Available Tests
                  </h2>
                  <div className="flex gap-2 flex-wrap">
                    {["Basic Health Check", "Well Man / Well Woman", "Testosterone Panel", "Thyroid Function", "HbA1c (Diabetes)", "Hormone Panel", "Liver Function", "Full Body MOT", "Cholesterol & Lipids", "Vitamin D"].map(name => (
                      <span key={name} className="px-3 py-1.5 rounded-full border border-border bg-card text-sm font-medium text-foreground">{name}</span>
                    ))}
                  </div>
                </div>

                {/* Search + Sort */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search blood tests…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSortAsc(!sortAsc)} className="gap-1.5">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    Price: {sortAsc ? "Low → High" : "High → Low"}
                  </Button>
                </div>

                <ProductCards products={filtered} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Bottom disclaimer */}
      <section className="py-10 mt-12 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex items-start gap-3 p-5 rounded-xl bg-muted/50 border border-border max-w-3xl mx-auto">
            <ShieldCheck className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              All suppliers listed are <strong className="text-foreground">UK-registered pharmacies or CQC/UKAS-accredited laboratories</strong>. Peptyl acts solely as an information aggregator and is not responsible for transactions, stock levels, or clinical outcomes. Prices were last checked manually and may have changed. Always verify pricing directly on the provider's website.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Suppliers;
