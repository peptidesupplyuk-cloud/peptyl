import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Dna, Activity, FlaskConical, AlertTriangle, Shield, ArrowRight, Loader2, History, Check, Sparkles, Upload, FileText, Zap, ChevronDown, X, Heart, BarChart3, Microscope, Crown } from "lucide-react";
import TierComparisonSection from "@/components/dna/TierComparisonSection";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import AnimatedDNA from "@/components/dna/AnimatedDNA";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const tiers = [
  {
    id: "standard" as const,
    name: "Standard",
    price: "£14.99",
    tagline: "Your genetic health snapshot",
    icon: Heart,
    accent: "primary",
    badge: null,
    features: [
      "28 key SNPs analysed (core health markers)",
      "Basic health score with category breakdown",
      "3 top findings cards",
      "Personalised 90-day action plan",
      "Up to 5 supplement suggestions (direction only)",
      "Basic diet and exercise guidance",
    ],
    excluded: [
      "No peptide recommendations",
      "No pathway analysis",
      "No bloodwork cross-referencing",
      "No advanced personalisation",
    ],
  },
  {
    id: "advanced" as const,
    name: "Advanced",
    price: "£29.99",
    tagline: "Deep personalisation, clear actions",
    icon: BarChart3,
    accent: "primary",
    badge: "Most Popular",
    features: [
      "Everything in Standard, plus:",
      "80 SNPs analysed (expanded panel)",
      "Full bloodwork cross-referencing with gene interactions",
      "Detailed supplement protocol with doses",
      "Diet recommendations citing specific genes",
      "Training recommendations (ACTN3, COL1A1)",
      "Sleep and circadian analysis (CLOCK, ADORA2A)",
      "Cardiovascular risk assessment",
      "Hormonal assessment (male & female)",
      "GLP-1 eligibility check",
      "Drug interaction screening",
      "PubMed research citations",
    ],
    excluded: [
      "No peptide recommendations",
      "No pathway analysis",
      "No predicted outcomes",
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "£59.99",
    tagline: "The tactical operating manual for your biology",
    icon: Microscope,
    accent: "amber",
    badge: "Biohacker",
    features: [
      "Everything in Advanced, plus:",
      "140 SNPs analysed (full panel incl. longevity, cognition, pharmacogenomics)",
      "Peptide protocol recommendations (BPC-157, Ipamorelin, etc.)",
      "Pathway analysis — biological systems mapped",
      "Stack interaction analysis (detects redundancies & conflicts)",
      "Predicted biomarker outcomes with timelines",
      "Biological age estimate based on longevity genetics",
      "Chronobiology protocol (supplement timing)",
      "Methylation cycle deep-dive",
      "Nootropic protocol (if cognitive SNPs detected)",
      "Hormesis recommendations (sauna, cold exposure)",
    ],
    excluded: [],
  },
];

const comparisonRows = [
  { feature: "SNPs Analysed", standard: "28", advanced: "80", pro: "140" },
  { feature: "Health Score & Categories", standard: true, advanced: true, pro: true },
  { feature: "Top 3 Findings", standard: true, advanced: true, pro: true },
  { feature: "90-Day Action Plan", standard: true, advanced: true, pro: true },
  { feature: "Supplement Suggestions", standard: "Directions only", advanced: "Full doses + timing", pro: "Doses + stacking" },
  { feature: "Bloodwork Cross-Referencing", standard: false, advanced: true, pro: true },
  { feature: "Diet Recommendations", standard: "Basic", advanced: "Gene-specific", pro: "Gene + timing" },
  { feature: "Training Recommendations", standard: false, advanced: true, pro: true },
  { feature: "Sleep & Circadian", standard: false, advanced: true, pro: true },
  { feature: "Cardiovascular Assessment", standard: false, advanced: true, pro: true },
  { feature: "Hormonal Assessment", standard: false, advanced: true, pro: true },
  { feature: "Drug Interaction Screening", standard: false, advanced: true, pro: true },
  { feature: "GLP-1 Eligibility", standard: false, advanced: true, pro: true },
  { feature: "PubMed Citations", standard: false, advanced: true, pro: true },
  { feature: "Peptide Protocols", standard: false, advanced: false, pro: true },
  { feature: "Pathway Analysis", standard: false, advanced: false, pro: true },
  { feature: "Predicted Outcomes", standard: false, advanced: false, pro: true },
  { feature: "Biological Age Estimate", standard: false, advanced: false, pro: true },
  { feature: "Chronobiology Protocol", standard: false, advanced: false, pro: true },
];

const steps = [
  { icon: Sparkles, title: "Choose your tier and pay", desc: "Standard, Advanced, or Pro — one-time payment, no subscription." },
  { icon: Upload, title: "Upload your DNA, bloodwork, or both", desc: "23andMe, AncestryDNA, PDF lab reports, photos, or paste text. Combining DNA + bloods gives the most accurate results." },
  { icon: Zap, title: "Get your personalised protocol", desc: "AI-powered supplement, peptide, and lifestyle recommendations grounded in your biology." },
];

const faqs = [
  { q: "What DNA formats do you accept?", a: "23andMe, AncestryDNA .txt files, PDF lab reports, photos of results, or paste text directly." },
  { q: "Is my raw DNA stored?", a: "No. Your genetic data is processed in memory, only the report is saved. You can delete it at any time." },
  { q: "Are peptide recommendations medical advice?", a: "No. Grade C/D evidence is noted. Peptide information is for research context only. Always consult a qualified practitioner." },
  { q: "What is the difference between the tiers?", a: "Standard covers core health markers and supplement directions. Advanced adds detailed dosing, bloodwork cross-referencing, and lifestyle genetics. Pro adds peptide protocols, pathway analysis, and predicted outcomes." },
  { q: "Can I upgrade from Standard to Advanced or Pro?", a: "Yes. Purchase a higher tier separately and re-run your analysis. Your raw data is not stored so you will re-upload." },
];

const CellValue = ({ value }: { value: boolean | string }) => {
  if (value === true) return <Check className="h-4 w-4 text-primary mx-auto" />;
  if (value === false) return <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-muted-foreground text-xs">{value}</span>;
};

const DNALanding = () => {
  const { user } = useAuth();
  const [hasReports, setHasReports] = useState(false);

  useEffect(() => {
    if (!user) { setHasReports(false); return; }
    supabase
      .from("dna_reports")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .then(({ data }) => setHasReports((data?.length ?? 0) > 0));
  }, [user]);

  return (
    <>
      <SEO
        title="DNA Health Analysis - Personalised Protocols"
        description="Upload DNA and bloodwork for AI-powered personalised peptide, supplement, and lifestyle protocols built from your genetics. Standard, Advanced, and Pro tiers available."
        path="/dna"
      />
      <Header />
      <main className="min-h-screen pt-16">
        {/* Hero */}
        <section className="bg-hero dark-section py-24 md:py-32">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <AnimatedDNA />
            <div className="mt-8" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground mb-6 tracking-tight">
              Stop Guessing.<br />
              <span className="text-gradient-teal">Start Knowing.</span>
            </h1>
            <p className="text-lg text-primary-foreground/70 mb-4 max-w-xl mx-auto">
              Generic protocols ignore what makes you unique. Upload your DNA, bloodwork, or both — and get a personalised supplement, peptide, and lifestyle plan built from <em>your</em> biology.
            </p>
            <p className="text-sm text-primary-foreground/50 mb-8 max-w-md mx-auto">
              Best results come from combining genetic data (23andMe / AncestryDNA) with recent blood panels. You can start with either.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Link to="/dna/upload?tier=standard">
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 px-6 py-6 text-base">
                  Standard £14.99
                </Button>
              </Link>
              <Link to="/dna/upload?tier=advanced">
                <Button size="lg" className="shadow-brand px-6 py-6 text-base">
                  Advanced £29.99 <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dna/upload?tier=pro">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-6 text-base">
                  <Crown className="mr-2 h-5 w-5" /> Pro £59.99
                </Button>
              </Link>
            </div>
            <p className="text-xs text-primary-foreground/50 mt-4">
              One-time payment per report. Your raw genetic data is never stored.
            </p>

            {hasReports && (
              <div className="mt-4">
                <Link to="/dna/dashboard" className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/60 hover:text-primary-foreground/90 transition-colors underline underline-offset-2">
                  <History className="h-4 w-4" />
                  View your previous reports
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Tier Comparison */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground text-center mb-4">
              Choose Your Depth
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
              All tiers analyse your data with the same AI engine. Higher tiers unlock deeper personalisation, peptide science, and predictive insights.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {tiers.map((t) => (
                <div
                  key={t.id}
                  className={`bg-card border rounded-2xl p-6 flex flex-col relative transition-shadow hover:shadow-lg ${
                    t.id === "advanced"
                      ? "border-2 border-primary/40"
                      : t.id === "pro"
                      ? "border-2 border-amber-500/40"
                      : "border-border"
                  }`}
                >
                  {t.badge && (
                    <div className={`absolute -top-3 right-4 text-xs font-semibold px-3 py-1 rounded-full ${
                      t.id === "advanced"
                        ? "bg-primary text-primary-foreground"
                        : "bg-amber-500 text-white"
                    }`}>
                      {t.badge}
                    </div>
                  )}
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <t.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">{t.name}</span>
                    </div>
                    <div className="text-3xl font-heading font-bold text-foreground mt-1">{t.price}</div>
                    <p className="text-xs text-muted-foreground mt-1">{t.tagline}</p>
                  </div>
                  <ul className="space-y-2.5 flex-1 mb-4">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                    {t.excluded.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground/50">
                        <X className="h-4 w-4 text-muted-foreground/30 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={`/dna/upload?tier=${t.id}`}>
                    <Button
                      className={`w-full ${
                        t.id === "pro"
                          ? "bg-amber-500 hover:bg-amber-600 text-white"
                          : t.id === "advanced"
                          ? "shadow-brand"
                          : ""
                      }`}
                      variant={t.id === "standard" ? "outline" : "default"}
                    >
                      Get Your Report
                    </Button>
                  </Link>
                  {t.id === "pro" && (
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Peptide recommendations are for research purposes only. Not medical advice.
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Comparison Table */}
            <div className="mt-16 max-w-4xl mx-auto">
              <h3 className="text-sm font-heading font-semibold text-muted-foreground text-center mb-4 uppercase tracking-wider">At a Glance</h3>
              <div className="bg-card border border-border rounded-xl overflow-hidden text-sm">
                <div className="grid grid-cols-4 items-center px-4 py-2.5 border-b border-border bg-muted/50">
                  <span className="text-muted-foreground font-medium">Feature</span>
                  <span className="text-center text-muted-foreground font-medium">Standard</span>
                  <span className="text-center text-primary font-medium">Advanced</span>
                  <span className="text-center text-amber-500 font-medium">Pro</span>
                </div>
                {comparisonRows.map((row, i) => (
                  <div key={row.feature} className={`grid grid-cols-4 items-center px-4 py-2.5 ${i % 2 === 0 ? "bg-muted/30" : ""}`}>
                    <span className="text-foreground font-medium text-xs sm:text-sm">{row.feature}</span>
                    <span className="text-center"><CellValue value={row.standard} /></span>
                    <span className="text-center"><CellValue value={row.advanced} /></span>
                    <span className="text-center"><CellValue value={row.pro} /></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What's in each report? */}
        <TierComparisonSection />

        {/* How It Works */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-heading font-bold text-foreground text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {steps.map((s, i) => (
                <div key={s.title} className="text-center">
                  <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
                    <s.icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">Step {i + 1}</div>
                  <h3 className="font-heading font-semibold text-foreground mb-2 text-sm">{s.title}</h3>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6 text-center max-w-2xl">
            <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold text-foreground mb-3">GDPR Compliant & Private</h2>
            <p className="text-muted-foreground text-sm">
              Your raw genetic data is never stored. It's processed in memory, analysed by AI, then discarded.
              Only your processed health report is saved — and you can delete it at any time.
            </p>
            <p className="text-muted-foreground text-sm mt-3">
              Genetic data is special category data under UK GDPR Article 9. Your explicit consent is required and captured before processing. This report is for educational purposes only — it is not a clinical genetic test and Peptyl is not operated by medical professionals. Peptyl is registering with the ICO as a special category data controller prior to launching paid services.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6 max-w-2xl">
            <h2 className="text-2xl font-heading font-bold text-foreground text-center mb-8">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-xl px-4">
                  <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6 text-center">
            <div className="flex justify-center gap-3 flex-wrap">
              <Link to="/dna/upload?tier=standard">
                <Button size="lg" variant="outline" className="px-6 py-6 text-base">Standard £14.99</Button>
              </Link>
              <Link to="/dna/upload?tier=advanced">
                <Button size="lg" className="shadow-brand px-6 py-6 text-base">Advanced £29.99</Button>
              </Link>
              <Link to="/dna/upload?tier=pro">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-6 text-base">
                  <Crown className="mr-2 h-5 w-5" /> Pro £59.99
                </Button>
              </Link>
            </div>
            {hasReports && (
              <div className="mt-4">
                <Link to="/dna/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
                  <History className="h-4 w-4" />
                  View your previous reports
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default DNALanding;
