import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Dna, Activity, FlaskConical, AlertTriangle, Shield, ArrowRight, Loader2, History, Check, Sparkles, Upload, FileText, Zap, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import AnimatedDNA from "@/components/dna/AnimatedDNA";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const standardFeatures = [
  "Health Score (0-100)",
  "Gene Variant Analysis (15 SNPs)",
  "Supplement Protocol",
  "Drug Interaction Flags",
  "Biomarker Interpretation",
  "30/60/90-day Action Plan",
  "Email + push notification when ready",
];

const advancedExtras = [
  "Deep Personalisation Layer",
  "Your Genetic Archetype",
  "Research Peptide Protocol (where relevant)",
  "GLP-1 / Weight Management Assessment (where relevant)",
  "GP Talking Points",
  "Expanded SNP Panel (25 SNPs vs 15)",
  "Evidence-graded peptide recommendations",
];

const steps = [
  { icon: Sparkles, title: "Choose your tier and pay", desc: "Standard or Advanced, one-time payment." },
  { icon: Upload, title: "Upload your DNA file, lab report, or photo", desc: "We accept 23andMe, AncestryDNA, PDFs, images, or paste text." },
  { icon: Zap, title: "Receive your personalised report in under 60 seconds", desc: "AI-powered analysis with evidence-graded recommendations." },
];

const faqs = [
  { q: "What DNA formats do you accept?", a: "23andMe, AncestryDNA .txt files, PDF lab reports, photos of results, or paste text directly." },
  { q: "Is my raw DNA stored?", a: "No. Your genetic data is processed in memory, only the report is saved. You can delete it at any time." },
  { q: "Are peptide recommendations medical advice?", a: "No. Grade C/D evidence is noted. Peptide information is for research context only. Always consult a qualified practitioner." },
  { q: "What is the difference between Standard and Advanced?", a: "Standard covers supplements and drug interactions. Advanced adds peptide protocols, GLP-1 metabolic assessment, deep personalisation, and GP talking points." },
  { q: "Can I upgrade from Standard to Advanced?", a: "Yes. Purchase Advanced separately and re-run your analysis. Your raw data is not stored so you will re-upload." },
];

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
        title="DNA Health Assessment | Peptyl"
        description="Upload your genetic data and get a personalised health report with supplement and peptide recommendations. Standard or Advanced tier."
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
              Your DNA.<br />
              <span className="text-gradient-teal">Your Protocol.</span>
            </h1>
            <p className="text-lg text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              Upload your genetic data from 23andMe, AncestryDNA, or a lab report. Choose Standard for your personalised supplement stack, or Advanced for peptide protocols, GLP-1 insights, and deep personalisation.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Link to="/dna/upload?tier=standard">
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-6 text-base">
                  Start Standard £19.99
                </Button>
              </Link>
              <Link to="/dna/upload?tier=advanced">
                <Button size="lg" className="shadow-brand px-8 py-6 text-base">
                  Go Advanced £39.99 <ArrowRight className="ml-2 h-5 w-5" />
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
              Choose Your Assessment
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
              Both tiers use the same AI engine and genetic parsing. Advanced adds peptide science and deep personalisation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Standard */}
              <div className="bg-card border border-border rounded-2xl p-6 flex flex-col">
                <div className="mb-4">
                  <span className="text-sm font-medium text-muted-foreground">Standard</span>
                  <div className="text-3xl font-heading font-bold text-foreground mt-1">£19.99</div>
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {standardFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/dna/upload?tier=standard">
                  <Button variant="outline" className="w-full">Get Standard Report</Button>
                </Link>
              </div>

              {/* Advanced */}
              <div className="bg-card border-2 border-primary/40 rounded-2xl p-6 flex flex-col relative">
                <div className="absolute -top-3 right-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Best Value
                </div>
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Advanced</span>
                    <span className="text-xs bg-amber-500/10 text-amber-600 font-semibold px-2 py-0.5 rounded-md">NEW</span>
                  </div>
                  <div className="text-3xl font-heading font-bold text-foreground mt-1">£39.99</div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Everything in Standard, plus:</p>
                <ul className="space-y-3 flex-1 mb-6">
                  {advancedExtras.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/dna/upload?tier=advanced">
                  <Button className="w-full shadow-brand">Get Advanced Report</Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Peptide recommendations are for research purposes only. Not medical advice.
                </p>
              </div>
          </div>

          {/* Quick VS Table */}
          <div className="mt-12 max-w-2xl mx-auto">
            <h3 className="text-sm font-heading font-semibold text-muted-foreground text-center mb-4 uppercase tracking-wider">At a Glance</h3>
            <div className="bg-card border border-border rounded-xl overflow-hidden text-sm">
              <div className="grid grid-cols-3 items-center px-4 py-2.5 border-b border-border bg-muted/50">
                <span className="text-muted-foreground font-medium">Feature</span>
                <span className="text-center text-muted-foreground font-medium">Standard</span>
                <span className="text-center text-muted-foreground font-medium">Advanced</span>
              </div>
              {[
                { feature: "Health Score", standard: true, advanced: true },
                { feature: "Supplement Protocol", standard: true, advanced: true },
                { feature: "Drug Interaction Flags", standard: true, advanced: true },
                { feature: "Biomarker Interpretation", standard: true, advanced: true },
                { feature: "SNP Panel", standard: "15", advanced: "25" },
                { feature: "Peptide Protocol", standard: false, advanced: true },
                { feature: "GLP-1 Assessment", standard: false, advanced: true },
                { feature: "Genetic Archetype", standard: false, advanced: true },
                { feature: "GP Talking Points", standard: false, advanced: true },
              ].map((row, i) => (
                <div key={row.feature} className={`grid grid-cols-3 items-center px-4 py-2.5 ${i % 2 === 0 ? "bg-muted/30" : ""}`}>
                  <span className="text-foreground font-medium">{row.feature}</span>
                  <span className="text-center">
                    {row.standard === true ? <Check className="h-4 w-4 text-primary mx-auto" /> : row.standard === false ? <X className="h-4 w-4 text-muted-foreground/40 mx-auto" /> : <span className="text-muted-foreground">{row.standard}</span>}
                  </span>
                  <span className="text-center">
                    {row.advanced === true ? <Check className="h-4 w-4 text-primary mx-auto" /> : row.advanced === false ? <X className="h-4 w-4 text-muted-foreground/40 mx-auto" /> : <span className="text-muted-foreground">{row.advanced}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
                <Button size="lg" variant="outline" className="px-8 py-6 text-base">Standard £19.99</Button>
              </Link>
              <Link to="/dna/upload?tier=advanced">
                <Button size="lg" className="shadow-brand px-8 py-6 text-base">Advanced £39.99</Button>
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
