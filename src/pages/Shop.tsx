import { Package, Pill, FlaskConical, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const peptideProducts = [
  { name: "BPC-157", size: "5mg", description: "Recovery & tissue repair" },
  { name: "TB-500", size: "5mg", description: "Healing & flexibility" },
  { name: "CJC-1295 / Ipamorelin", size: "Blend", description: "Growth hormone secretagogue stack" },
  { name: "Semaglutide", size: "5mg", description: "GLP-1 receptor agonist" },
  { name: "Tirzepatide", size: "10mg", description: "Dual GIP/GLP-1 agonist" },
  { name: "KPV", size: "5mg", description: "Anti-inflammatory tripeptide" },
  { name: "Retatrutide", size: "10mg", description: "Triple agonist peptide" },
  { name: "AOD-9604", size: "5mg", description: "Fat metabolism fragment" },
];

const supplementProducts = [
  { name: "Bacteriostatic Water", size: "30mL", description: "USP-grade reconstitution water" },
  { name: "Insulin Syringes (U-100)", size: "100 pack", description: "0.5mL, 29G precision syringes" },
  { name: "NAC (N-Acetyl Cysteine)", size: "600mg × 60", description: "Liver & antioxidant support" },
  { name: "Tudca", size: "250mg × 60", description: "Bile acid for organ support" },
  { name: "Omega-3 Fish Oil", size: "1000mg × 90", description: "Heart & inflammation support" },
  { name: "Magnesium Glycinate", size: "400mg × 60", description: "Sleep & recovery mineral" },
  { name: "Vitamin D3 + K2", size: "5000IU × 90", description: "Immune & bone health" },
  { name: "Zinc Picolinate", size: "50mg × 60", description: "Immune & hormone support" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};

const ProductCard = ({ name, size, description, index }: { name: string; size: string; description: string; index: number }) => (
  <motion.div
    custom={index}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={fadeUp}
    className="bg-card rounded-2xl border border-border p-6 flex flex-col relative overflow-hidden group hover:border-primary/30 transition-colors"
  >
    <div className="absolute top-3 right-3">
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-warm/10 text-warm border border-warm/20">
        <Clock className="h-3 w-3" /> Coming Soon
      </span>
    </div>
    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
      <Package className="h-5 w-5 text-primary" />
    </div>
    <h3 className="font-heading font-semibold text-foreground">{name}</h3>
    <span className="text-xs text-muted-foreground mt-0.5">{size}</span>
    <p className="text-sm text-muted-foreground mt-2 flex-1">{description}</p>
    <button
      disabled
      className="mt-5 w-full py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed"
    >
      Notify Me
    </button>
  </motion.div>
);

const Shop = () => {
  return (
    <div className="min-h-screen bg-background">
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
            Shop
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-heading font-bold text-primary-foreground leading-tight max-w-2xl"
          >
            Research-Grade Products,{" "}
            <span className="text-primary">Market-Leading Prices</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-primary-foreground/60 max-w-xl"
          >
            Every product is third-party tested with full Certificates of Analysis. Our store is launching soon — browse what's coming.
          </motion.p>
        </div>
      </section>

      {/* Peptides Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">Peptides</h2>
          </div>
          <p className="text-muted-foreground mb-10 max-w-lg">
            Research-grade peptides with full COA documentation. Sold for research purposes only.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {peptideProducts.map((p, i) => (
              <ProductCard key={p.name} {...p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Supplements Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-2">
            <Pill className="h-6 w-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Supplements to Support Your Protocols
            </h2>
          </div>
          <p className="text-muted-foreground mb-10 max-w-lg">
            Essential ancillaries and health supplements to complement your research protocols.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {supplementProducts.map((p, i) => (
              <ProductCard key={p.name} {...p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 bg-hero relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-teal/5 blur-3xl" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-primary-foreground mb-4">
            Be the First to Know
          </h2>
          <p className="text-primary-foreground/60 text-lg max-w-md mx-auto mb-8">
            We'll notify you as soon as the store goes live with launch-day pricing.
          </p>
          <span className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-full bg-primary/10 text-primary border border-primary/20">
            <Clock className="h-4 w-4" /> Store launching soon
          </span>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Shop;
