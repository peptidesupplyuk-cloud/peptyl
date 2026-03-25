import { useState } from "react";
import { Check, X, Lock, Dna, BarChart3, Microscope } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type Tier = "standard" | "advanced" | "pro";

interface CardPreview {
  label: string;
  standard: boolean;
  advanced: boolean;
  pro: boolean;
}

const cardPreviews: CardPreview[] = [
  { label: "Health Score & Overview", standard: true, advanced: true, pro: true },
  { label: "Top 3 Findings", standard: true, advanced: true, pro: true },
  { label: "90-Day Action Plan", standard: true, advanced: true, pro: true },
  { label: "Supplement Protocol", standard: true, advanced: true, pro: true },
  { label: "Gene Results", standard: true, advanced: true, pro: true },
  { label: "Biomarker Results", standard: true, advanced: true, pro: true },
  { label: "Diet Recommendations", standard: false, advanced: true, pro: true },
  { label: "Training Protocol", standard: false, advanced: true, pro: true },
  { label: "Sleep & Circadian", standard: false, advanced: true, pro: true },
  { label: "Cardiovascular Assessment", standard: false, advanced: true, pro: true },
  { label: "Hormonal Assessment", standard: false, advanced: true, pro: true },
  { label: "Drug Interactions", standard: false, advanced: true, pro: true },
  { label: "Peptide Protocol", standard: false, advanced: false, pro: true },
  { label: "Pathway Analysis", standard: false, advanced: false, pro: true },
  { label: "Predicted Outcomes", standard: false, advanced: false, pro: true },
  { label: "Community Outcomes", standard: false, advanced: false, pro: true },
];

const comparisonRows = [
  { feature: "SNPs Analysed", standard: "28", advanced: "80", pro: "140" },
  { feature: "Health Score & Categories", standard: true, advanced: true, pro: true },
  { feature: "Top 3 Findings", standard: true, advanced: true, pro: true },
  { feature: "90-Day Action Plan", standard: true, advanced: true, pro: true },
  { feature: "Supplement Suggestions", standard: "Directions only", advanced: "Full doses + timing", pro: "Doses + timing + stacking" },
  { feature: "Bloodwork Cross-Referencing", standard: false, advanced: true, pro: true },
  { feature: "Diet Recommendations", standard: "Basic", advanced: "Gene-specific", pro: "Gene-specific + timing" },
  { feature: "Training Recommendations", standard: false, advanced: "Gene-specific", pro: "Gene-specific + periodisation" },
  { feature: "Sleep & Circadian", standard: false, advanced: true, pro: true },
  { feature: "Cardiovascular Assessment", standard: false, advanced: true, pro: true },
  { feature: "Hormonal Assessment", standard: false, advanced: true, pro: true },
  { feature: "Drug Interaction Screening", standard: false, advanced: true, pro: true },
  { feature: "GLP-1 Eligibility", standard: false, advanced: true, pro: true },
  { feature: "Peptide Protocols", standard: false, advanced: false, pro: "Up to 3 peptides" },
  { feature: "Pathway Analysis", standard: false, advanced: false, pro: true },
  { feature: "Stack Interaction Analysis", standard: false, advanced: false, pro: true },
  { feature: "Predicted Biomarker Outcomes", standard: false, advanced: false, pro: true },
  { feature: "Biological Age Estimate", standard: false, advanced: false, pro: true },
  { feature: "Chronobiology Protocol", standard: false, advanced: false, pro: true },
  { feature: "PubMed Research Citations", standard: false, advanced: true, pro: true },
  { feature: "Community Outcomes", standard: false, advanced: false, pro: true },
];

const audienceCards = [
  {
    tier: "Standard" as const,
    icon: "🧬",
    points: [
      "First-time genetic testing",
      "Understanding your basic health risks",
      "Getting started with targeted supplements",
      "Quick 5-minute read",
    ],
  },
  {
    tier: "Advanced" as const,
    icon: "📊",
    points: [
      "Health-conscious individuals wanting personalised protocols",
      "People with bloodwork results to cross-reference",
      "Anyone taking multiple supplements who wants to optimise",
      "Those wanting diet and training guidance based on genetics",
    ],
  },
  {
    tier: "Pro" as const,
    icon: "🔬",
    points: [
      "Biohackers and longevity enthusiasts",
      "Research peptide users wanting genetic matching",
      "Athletes optimising performance genetics",
      "Anyone wanting predicted outcomes and retest tracking",
    ],
  },
];

const CellValue = ({ value }: { value: boolean | string }) => {
  if (value === true) return <Check className="h-4 w-4 text-primary mx-auto" />;
  if (value === false) return <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />;
  return <span className="text-muted-foreground text-xs text-center">{value}</span>;
};

const TierComparisonSection = () => {
  const [previewTier, setPreviewTier] = useState<Tier>("advanced");

  const tierTabs: { id: Tier; label: string; accent: string }[] = [
    { id: "standard", label: "Standard", accent: "border-muted-foreground" },
    { id: "advanced", label: "Advanced", accent: "border-primary" },
    { id: "pro", label: "Pro", accent: "border-amber-500" },
  ];

  const visibleCount = cardPreviews.filter((c) => c[previewTier]).length;
  const lockedCount = cardPreviews.length - visibleCount;

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">
            See exactly what you'll get
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Every report is personalised to your unique genetic profile
          </p>
        </div>

        {/* Interactive Preview */}
        <div className="max-w-3xl mx-auto mb-20">
          {/* Tier tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {tierTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPreviewTier(tab.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  previewTier === tab.id
                    ? tab.id === "pro"
                      ? "bg-amber-500/10 text-amber-500 border-2 border-amber-500/40"
                      : tab.id === "advanced"
                      ? "bg-primary/10 text-primary border-2 border-primary/40"
                      : "bg-muted text-foreground border-2 border-muted-foreground/30"
                    : "bg-transparent text-muted-foreground border-2 border-transparent hover:bg-muted/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Card count */}
          <p className="text-center text-sm text-muted-foreground mb-6">
            <span className="font-medium text-foreground">{visibleCount} cards</span> visible
            {lockedCount > 0 && (
              <>, <span className="text-muted-foreground">{lockedCount} locked</span></>
            )}
          </p>

          {/* Card grid preview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {cardPreviews.map((card) => {
              const visible = card[previewTier];
              return (
                <div
                  key={card.label}
                  className={`rounded-xl border p-3.5 text-center transition-all duration-300 ${
                    visible
                      ? "bg-card border-border shadow-sm"
                      : "bg-muted/30 border-border/30 opacity-50"
                  }`}
                >
                  {!visible && (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground/40 mx-auto mb-1.5" />
                  )}
                  <span className={`text-xs font-medium leading-tight ${
                    visible ? "text-foreground" : "text-muted-foreground/50"
                  }`}>
                    {card.label}
                  </span>
                  {!visible && (
                    <p className="text-[9px] text-muted-foreground/40 mt-1">Upgrade</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-4xl mx-auto mb-20">
          <h3 className="text-lg font-heading font-semibold text-foreground text-center mb-6">
            Feature Comparison
          </h3>
          <div className="bg-card border border-border rounded-xl overflow-hidden text-sm">
            {/* Header */}
            <div className="grid grid-cols-4 items-center px-4 py-3 border-b border-border bg-muted/50">
              <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Feature</span>
              <span className="text-center text-muted-foreground font-medium text-xs uppercase tracking-wider">Standard</span>
              <span className="text-center font-medium text-xs uppercase tracking-wider">
                <span className="text-primary">Advanced</span>
                <span className="ml-1.5 text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Popular</span>
              </span>
              <span className="text-center text-amber-500 font-medium text-xs uppercase tracking-wider">Pro</span>
            </div>
            {comparisonRows.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-4 items-center px-4 py-2.5 ${
                  i % 2 === 0 ? "bg-muted/20" : ""
                } ${i < comparisonRows.length - 1 ? "border-b border-border/30" : ""}`}
              >
                <span className="text-foreground font-medium text-xs sm:text-sm pr-2">{row.feature}</span>
                <span className="text-center"><CellValue value={row.standard} /></span>
                <span className="text-center"><CellValue value={row.advanced} /></span>
                <span className="text-center"><CellValue value={row.pro} /></span>
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof */}
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Trusted by biohackers, athletes, and health optimisers across Europe
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Dna className="h-3.5 w-3.5 text-primary" />
              DNA-powered insights
            </span>
            <span>•</span>
            <span>GDPR Compliant</span>
            <span>•</span>
            <span>One-time payment</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TierComparisonSection;
