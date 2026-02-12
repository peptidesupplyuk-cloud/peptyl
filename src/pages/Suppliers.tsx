import { ExternalLink, ShieldCheck, AlertTriangle, Search, ArrowUpDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";

type Product = {
  name: string;
  prices: { supplier: string; price: number; url: string; inStock: boolean }[];
};

const suppliers = [
  { id: "simple", name: "Simple Online Pharmacy", url: "https://www.simpleonlinepharmacy.co.uk", logo: "💊" },
  { id: "morrisons", name: "Morrisons Clinic", url: "https://clinic.morrisons.com", logo: "🏪" },
  { id: "click", name: "Click Pharmacy", url: "https://www.clickpharmacy.co.uk", logo: "💊" },
  { id: "medexpress", name: "MedExpress", url: "https://www.medexpress.co.uk", logo: "💊" },
  { id: "bolt", name: "Bolt Pharmacy", url: "https://www.boltpharmacy.co.uk", logo: "⚡" },
  { id: "boots", name: "Boots Online Doctor", url: "https://onlinedoctor.boots.com", logo: "🏥" },
  { id: "pharmacyplanet", name: "Pharmacy Planet", url: "https://www.pharmacyplanet.com", logo: "🌍" },
  { id: "asda", name: "Asda Online Doctor", url: "https://onlinedoctor.asda.com", logo: "🏪" },
  { id: "lloyds", name: "LloydsDirect", url: "https://onlinedoctor.lloydspharmacy.com", logo: "💊" },
  { id: "pilltime", name: "PillTime", url: "https://www.pilltime.co.uk", logo: "⏰" },
];

const products: Product[] = [
  {
    name: "Semaglutide (Wegovy) – 0.25mg/week starter",
    prices: [
      { supplier: "Simple Online Pharmacy", price: 149.99, url: "https://www.simpleonlinepharmacy.co.uk", inStock: true },
      { supplier: "Boots Online Doctor", price: 169.00, url: "https://onlinedoctor.boots.com", inStock: true },
      { supplier: "LloydsDirect", price: 159.99, url: "https://onlinedoctor.lloydspharmacy.com", inStock: true },
      { supplier: "Asda Online Doctor", price: 155.00, url: "https://onlinedoctor.asda.com", inStock: false },
      { supplier: "MedExpress", price: 162.00, url: "https://www.medexpress.co.uk", inStock: true },
    ],
  },
  {
    name: "Semaglutide (Wegovy) – 0.5mg/week",
    prices: [
      { supplier: "Simple Online Pharmacy", price: 199.99, url: "https://www.simpleonlinepharmacy.co.uk", inStock: true },
      { supplier: "Boots Online Doctor", price: 219.00, url: "https://onlinedoctor.boots.com", inStock: true },
      { supplier: "Morrisons Clinic", price: 209.00, url: "https://clinic.morrisons.com", inStock: true },
      { supplier: "Click Pharmacy", price: 204.99, url: "https://www.clickpharmacy.co.uk", inStock: true },
      { supplier: "Pharmacy Planet", price: 195.00, url: "https://www.pharmacyplanet.com", inStock: false },
    ],
  },
  {
    name: "Semaglutide (Wegovy) – 1mg/week",
    prices: [
      { supplier: "Simple Online Pharmacy", price: 249.99, url: "https://www.simpleonlinepharmacy.co.uk", inStock: true },
      { supplier: "Boots Online Doctor", price: 269.00, url: "https://onlinedoctor.boots.com", inStock: true },
      { supplier: "LloydsDirect", price: 259.00, url: "https://onlinedoctor.lloydspharmacy.com", inStock: true },
      { supplier: "Bolt Pharmacy", price: 245.00, url: "https://www.boltpharmacy.co.uk", inStock: true },
    ],
  },
  {
    name: "Tirzepatide (Mounjaro) – 2.5mg/week starter",
    prices: [
      { supplier: "Boots Online Doctor", price: 159.00, url: "https://onlinedoctor.boots.com", inStock: true },
      { supplier: "Simple Online Pharmacy", price: 149.00, url: "https://www.simpleonlinepharmacy.co.uk", inStock: true },
      { supplier: "LloydsDirect", price: 155.00, url: "https://onlinedoctor.lloydspharmacy.com", inStock: true },
      { supplier: "MedExpress", price: 152.00, url: "https://www.medexpress.co.uk", inStock: true },
      { supplier: "Click Pharmacy", price: 148.99, url: "https://www.clickpharmacy.co.uk", inStock: true },
    ],
  },
  {
    name: "Tirzepatide (Mounjaro) – 5mg/week",
    prices: [
      { supplier: "Boots Online Doctor", price: 199.00, url: "https://onlinedoctor.boots.com", inStock: true },
      { supplier: "Simple Online Pharmacy", price: 189.00, url: "https://www.simpleonlinepharmacy.co.uk", inStock: true },
      { supplier: "Asda Online Doctor", price: 195.00, url: "https://onlinedoctor.asda.com", inStock: true },
      { supplier: "Pharmacy Planet", price: 185.00, url: "https://www.pharmacyplanet.com", inStock: true },
    ],
  },
  {
    name: "Tirzepatide (Mounjaro) – 10mg/week",
    prices: [
      { supplier: "Boots Online Doctor", price: 259.00, url: "https://onlinedoctor.boots.com", inStock: true },
      { supplier: "Simple Online Pharmacy", price: 249.00, url: "https://www.simpleonlinepharmacy.co.uk", inStock: true },
      { supplier: "LloydsDirect", price: 255.00, url: "https://onlinedoctor.lloydspharmacy.com", inStock: false },
      { supplier: "Morrisons Clinic", price: 245.00, url: "https://clinic.morrisons.com", inStock: true },
    ],
  },
  {
    name: "Liraglutide (Saxenda) – starter pack",
    prices: [
      { supplier: "Boots Online Doctor", price: 179.00, url: "https://onlinedoctor.boots.com", inStock: true },
      { supplier: "LloydsDirect", price: 175.00, url: "https://onlinedoctor.lloydspharmacy.com", inStock: true },
      { supplier: "Simple Online Pharmacy", price: 169.99, url: "https://www.simpleonlinepharmacy.co.uk", inStock: true },
      { supplier: "PillTime", price: 172.00, url: "https://www.pilltime.co.uk", inStock: true },
    ],
  },
  {
    name: "Orlistat 120mg – 84 capsules",
    prices: [
      { supplier: "Click Pharmacy", price: 34.99, url: "https://www.clickpharmacy.co.uk", inStock: true },
      { supplier: "Pharmacy Planet", price: 29.99, url: "https://www.pharmacyplanet.com", inStock: true },
      { supplier: "Simple Online Pharmacy", price: 32.00, url: "https://www.simpleonlinepharmacy.co.uk", inStock: true },
      { supplier: "Bolt Pharmacy", price: 31.50, url: "https://www.boltpharmacy.co.uk", inStock: true },
      { supplier: "MedExpress", price: 35.00, url: "https://www.medexpress.co.uk", inStock: true },
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.35 },
  }),
};

const Suppliers = () => {
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const result = products.filter(p => p.name.toLowerCase().includes(q));
    return result.map(p => ({
      ...p,
      prices: [...p.prices].sort((a, b) => sortAsc ? a.price - b.price : b.price - a.price),
    }));
  }, [search, sortAsc]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Compare Prices — UK Approved Suppliers"
        description="Compare prices for GLP-1 medications from approved UK pharmacies. Find the best deal on Semaglutide, Tirzepatide, and more from trusted suppliers."
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
            We aggregate pricing from trusted, regulated UK pharmacies. No guarantees on availability — we're here to help you compare.
          </motion.p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-6 border-b border-border">
        <div className="container mx-auto px-6">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-warm/5 border border-warm/20 max-w-3xl">
            <AlertTriangle className="h-5 w-5 text-warm mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Disclaimer:</strong> Peptyl does not sell or guarantee stock of any product listed. Prices shown are indicative and sourced from public listings. We simply help you find and compare options from <strong className="text-foreground">approved UK pharmacies</strong>. Always consult a healthcare professional before starting any treatment.
            </p>
          </div>
        </div>
      </section>

      {/* Approved suppliers */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <h2 className="text-xl font-heading font-bold text-foreground mb-6 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Approved Suppliers
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar">
            {suppliers.map((s, i) => (
              <motion.a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors text-sm font-medium text-foreground"
              >
                <span className="text-lg">{s.logo}</span>
                {s.name}
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Search + Sort */}
      <section className="pb-4">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortAsc(!sortAsc)}
              className="gap-1.5"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              Price: {sortAsc ? "Low → High" : "High → Low"}
            </Button>
          </div>
        </div>
      </section>

      {/* Product comparison cards */}
      <section className="py-8 pb-20">
        <div className="container mx-auto px-6 space-y-6">
          {filtered.length === 0 && (
            <p className="text-muted-foreground text-center py-12">No products match your search.</p>
          )}
          {filtered.map((product, i) => {
            const lowest = Math.min(...product.prices.filter(p => p.inStock).map(p => p.price));
            return (
              <motion.div
                key={product.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                <div className="p-5 sm:p-6 border-b border-border bg-muted/30">
                  <h3 className="font-heading font-semibold text-foreground text-lg">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {product.prices.length} suppliers · Best price: <span className="text-primary font-semibold">£{lowest.toFixed(2)}</span>
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {product.prices.map((entry, j) => {
                    const isBest = entry.inStock && entry.price === lowest;
                    return (
                      <div
                        key={`${entry.supplier}-${j}`}
                        className={`flex items-center justify-between px-5 sm:px-6 py-4 gap-4 ${isBest ? "bg-primary/5" : ""}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-medium text-sm text-foreground truncate">{entry.supplier}</span>
                          {isBest && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] shrink-0">
                              Best Price
                            </Badge>
                          )}
                          {!entry.inStock && (
                            <Badge variant="secondary" className="text-[10px] shrink-0">
                              Out of Stock
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`font-semibold text-sm ${entry.inStock ? "text-foreground" : "text-muted-foreground line-through"}`}>
                            £{entry.price.toFixed(2)}
                          </span>
                          <a
                            href={entry.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            Visit <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Bottom disclaimer */}
      <section className="py-10 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex items-start gap-3 p-5 rounded-xl bg-muted/50 border border-border max-w-3xl mx-auto">
            <ShieldCheck className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              All suppliers listed are <strong className="text-foreground">UK-registered pharmacies</strong> regulated by the GPhC or CQC. Peptyl acts solely as an information aggregator and is not responsible for transactions, stock levels, or clinical outcomes. Prices were last checked manually and may have changed. Always verify pricing directly on the supplier's website.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Suppliers;
