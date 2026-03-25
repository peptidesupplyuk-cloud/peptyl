import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, History, Check, X, Sparkles, Upload, Zap, Heart, BarChart3, Microscope, Crown } from "lucide-react";
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
    badge: null,
    features: [
      "28 key SNPs analysed",
      "Health score with category breakdown",
      "3 top findings cards",
      "90-day action plan",
      "Up to 5 supplement suggestions",
      "Basic diet and exercise guidance",
    ],
    excluded: [
      "No peptide recommendations",
      "No pathway analysis",
      "No bloodwork cross-referencing",
    ],
  },
  {
    id: "advanced" as const,
    name: "Advanced",
    price: "£29.99",
    tagline: "Deep personalisation, clear actions",
    icon: BarChart3,
    badge: "Most Popular",
    features: [
      "Everything in Standard, plus:",
      "80 SNPs analysed (expanded panel)",
      "Full bloodwork cross-referencing",
      "Detailed supplement protocol with doses",
      "Gene-specific diet recommendations",
      "Training, sleep & circadian analysis",
      "Cardiovascular & hormonal assessment",
      "GLP-1 eligibility + drug interactions",
      "PubMed research citations",
    ],
    excluded: [
      "No peptide recommendations",
      "No pathway analysis",
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "£59.99",
    tagline: "The tactical manual for your biology",
    icon: Microscope,
    badge: "Biohacker",
    features: [
      "Everything in Advanced, plus:",
      "140 SNPs (full panel incl. longevity)",
      "Peptide protocol recommendations",
      "Pathway analysis — systems mapped",
      "Stack interaction analysis",
      "Predicted biomarker outcomes",
      "Biological age estimate",
      "Chronobiology protocol",
      "Methylation deep-dive",
      "Nootropic & hormesis protocols",
    ],
    excluded: [],
  },
];

const steps = [
  { icon: Sparkles, title: "Choose your tier", desc: "Standard, Advanced, or Pro — one-time payment." },
  { icon: Upload, title: "Upload DNA or bloodwork", desc: "23andMe, AncestryDNA, PDF lab reports, or paste text." },
  { icon: Zap, title: "Get your protocol", desc: "AI-powered recommendations grounded in your biology." },
];

const faqs = [
  { q: "What DNA formats do you accept?", a: "23andMe, AncestryDNA .txt files, PDF lab reports, photos of results, or paste text directly." },
  { q: "Is my raw DNA stored?", a: "No. Your genetic data is processed in memory, only the report is saved. You can delete it at any time." },
  { q: "Are peptide recommendations medical advice?", a: "No. Grade C/D evidence is noted. Peptide information is for research context only. Always consult a qualified practitioner." },
  { q: "Can I upgrade from Standard to Pro?", a: "Yes. Purchase a higher tier separately and re-run your analysis." },
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
        title="DNA Health Analysis - Personalised Protocols"
        description="Upload DNA and bloodwork for AI-powered personalised peptide, supplement, and lifestyle protocols built from your genetics."
        path="/dna"
      />
      <Header />
      <main className="min-h-screen pt-16">
        {/* ── Hero ── */}
        <section className="bg-hero dark-section py-12 md:py-16">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <AnimatedDNA />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground mt-2 mb-4 tracking-tight">
              Stop Guessing.<br />
              <span className="text-gradient-teal">Start Knowing.</span>
            </h1>
            <p className="text-base text-primary-foreground/60 mb-6 max-w-md mx-auto leading-relaxed">
              Upload your DNA, bloodwork, or both — get a personalised protocol built from your biology.
            </p>
            {hasReports && (
              <Link to="/dna/dashboard" className="inline-flex items-center gap-1.5 text-xs text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors underline underline-offset-2">
                <History className="h-3.5 w-3.5" />
                View previous reports
              </Link>
            )}
          </div>
        </section>

        {/* ── Which tier is right for you? ── */}
        <section className="py-10 bg-background">
          <div className="container mx-auto px-6">
            <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground text-center mb-2">
              Which tier is right for you?
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-8 max-w-md mx-auto">
              One-time payment. Your raw genetic data is never stored.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {[
                { tier: "Standard", icon: "🧬", price: "£14.99", points: ["First-time genetic testing", "Understand basic health risks", "Get started with targeted supplements"] },
                { tier: "Advanced", icon: "📊", price: "£29.99", points: ["Cross-reference DNA with bloodwork", "Personalised supplement doses & timing", "Diet and training guidance from genetics"] },
                { tier: "Pro", icon: "🔬", price: "£59.99", points: ["Peptide protocol recommendations", "Predicted outcomes & biological age", "Full pathway & stack analysis"] },
              ].map((card) => {
                const isAdvanced = card.tier === "Advanced";
                const isPro = card.tier === "Pro";
                return (
                  <div
                    key={card.tier}
                    className={`bg-card border rounded-2xl p-5 flex flex-col relative ${
                      isAdvanced ? "border-primary/30 shadow-[var(--shadow-teal)]" : isPro ? "border-amber-500/30" : "border-border"
                    }`}
                  >
                    {isAdvanced && (
                      <div className="absolute -top-2.5 right-4 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                        Most Popular
                      </div>
                    )}
                    {isPro && (
                      <div className="absolute -top-2.5 right-4 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500 text-white">
                        Biohacker
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xl">{card.icon}</span>
                      <div>
                        <h3 className="font-heading font-semibold text-foreground text-sm">{card.tier}</h3>
                        <span className="text-lg font-heading font-bold text-foreground">{card.price}</span>
                      </div>
                    </div>
                    <ul className="space-y-2 flex-1">
                      {card.points.map((point) => (
                        <li key={point} className="flex items-start gap-2 text-sm text-foreground">
                          <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                          <span className="leading-snug">{point}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to={`/dna/upload?tier=${card.tier.toLowerCase()}`} className="block mt-4">
                      <Button
                        variant={isAdvanced || isPro ? "default" : "outline"}
                        className={`w-full ${isPro ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}`}
                        size="sm"
                      >
                        Get {card.tier} Report
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Choose Your Depth — detailed tier cards ── */}
        <section className="py-12 bg-muted/20">
          <div className="container mx-auto px-6">
            <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground text-center mb-8">
              What's included
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {tiers.map((t) => (
                <div
                  key={t.id}
                  className={`bg-card border rounded-2xl p-5 flex flex-col relative transition-shadow hover:shadow-lg ${
                    t.id === "advanced"
                      ? "border-2 border-primary/40"
                      : t.id === "pro"
                      ? "border-2 border-amber-500/40"
                      : "border-border"
                  }`}
                >
                  {t.badge && (
                    <div className={`absolute -top-2.5 right-4 text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      t.id === "advanced"
                        ? "bg-primary text-primary-foreground"
                        : "bg-amber-500 text-white"
                    }`}>
                      {t.badge}
                    </div>
                  )}
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <t.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">{t.name}</span>
                    </div>
                    <div className="text-2xl font-heading font-bold text-foreground mt-1">{t.price}</div>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.tagline}</p>
                  </div>
                  <ul className="space-y-2 flex-1 mb-3">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-foreground">
                        <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                    {t.excluded.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground/50">
                        <X className="h-3.5 w-3.5 text-muted-foreground/30 mt-0.5 shrink-0" />
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
                      size="sm"
                    >
                      Get Your Report
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Interactive comparison ── */}
        <TierComparisonSection />

        {/* ── How It Works ── */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-6">
            <h2 className="text-xl font-heading font-bold text-foreground text-center mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {steps.map((s, i) => (
                <div key={s.title} className="text-center">
                  <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3">
                    <s.icon className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Step {i + 1}</div>
                  <h3 className="font-heading font-semibold text-foreground mb-1 text-sm">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Privacy ── */}
        <section className="py-12 bg-muted/20">
          <div className="container mx-auto px-6 text-center max-w-xl">
            <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">GDPR Compliant & Private</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Your raw genetic data is never stored. It's processed in memory, analysed by AI, then discarded.
              Only your processed report is saved — deletable at any time. Genetic data is special category data under UK GDPR Article 9.
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-6 max-w-xl">
            <h2 className="text-xl font-heading font-bold text-foreground text-center mb-6">FAQ</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-xl px-4">
                  <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="py-10 bg-muted/20">
          <div className="container mx-auto px-6 text-center">
            <div className="flex justify-center gap-3 flex-wrap">
              <Link to="/dna/upload?tier=standard">
                <Button size="lg" variant="outline">Standard £14.99</Button>
              </Link>
              <Link to="/dna/upload?tier=advanced">
                <Button size="lg" className="shadow-brand">Advanced £29.99</Button>
              </Link>
              <Link to="/dna/upload?tier=pro">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Crown className="mr-2 h-4 w-4" /> Pro £59.99
                </Button>
              </Link>
            </div>
            {hasReports && (
              <div className="mt-3">
                <Link to="/dna/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
                  <History className="h-3.5 w-3.5" />
                  View previous reports
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
