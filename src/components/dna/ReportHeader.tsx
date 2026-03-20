interface CategoryScore {
  score: number;
  status?: string;
  trend?: string;
}

interface Props {
  healthScore?: {
    overall?: number;
    categories?: Record<string, CategoryScore>;
    // Legacy fields
    genetics_score?: number;
    biomarker_score?: number;
    lifestyle_score?: number;
    label?: string;
    summary?: string;
  };
  overallScore?: number; // from dna_reports.overall_score
  meta?: {
    confidence?: string;
    variants_detected?: string[];
    variants_not_found?: string[];
    data_quality_notes?: string;
  };
  narrative?: string;
  personalisedSummary?: string;
  qualityScore?: number;
}

const ScoreGauge = ({ score }: { score: number }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color =
    score >= 80 ? "hsl(var(--primary))" :
    score >= 65 ? "hsl(var(--info))" :
    score >= 50 ? "#F59E0B" :
    "hsl(var(--destructive))";

  return (
    <svg viewBox="0 0 120 120" className="h-32 w-32">
      <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
      <circle
        cx="60" cy="60" r={radius} fill="none"
        stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        transform="rotate(-90 60 60)"
        className="transition-all duration-1000"
      />
      <text x="60" y="56" textAnchor="middle" className="fill-foreground font-heading" fontSize="28" fontWeight="700">{score}</text>
      <text x="60" y="74" textAnchor="middle" className="fill-muted-foreground" fontSize="10">/ 100</text>
    </svg>
  );
};

const categoryLabels: Record<string, string> = {
  methylation: "Methylation",
  detoxification: "Detoxification",
  cardiovascular: "Cardiovascular",
  metabolic: "Metabolic",
  inflammation: "Inflammation",
  tissue_repair: "Tissue Repair",
  sleep_circadian: "Sleep & Circadian",
  cognitive_mood: "Cognitive & Mood",
  longevity: "Longevity",
  pharmacogenomics: "Pharmacogenomics",
  nutrient: "Nutrient Status",
};

const statusDot = (status?: string) => {
  const s = status?.toLowerCase();
  if (s === "optimal" || s === "good") return "bg-primary";
  if (s === "suboptimal" || s === "moderate") return "bg-yellow-500";
  return "bg-destructive";
};

const CategoryBar = ({ name, cat }: { name: string; cat: CategoryScore }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-muted-foreground flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${statusDot(cat.status)}`} />
        {categoryLabels[name] || name}
      </span>
      <span className="text-foreground font-medium tabular-nums">{cat.score}</span>
    </div>
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${cat.score}%` }} />
    </div>
  </div>
);

const ProgressBar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${value}%` }} />
    </div>
  </div>
);

const ReportHeader = ({ healthScore, overallScore, meta, narrative, personalisedSummary, qualityScore }: Props) => {
  // Prefer DB-level overall_score, then health_score.overall
  const score = overallScore ?? healthScore?.overall ?? 0;

  // Use new categories if available, fall back to legacy
  const categories = healthScore?.categories;
  const hasCategories = categories && Object.keys(categories).length > 0;
  const hasLegacy = !hasCategories && (healthScore?.genetics_score != null || healthScore?.biomarker_score != null || healthScore?.lifestyle_score != null);

  return (
    <div className="bg-card border border-border rounded-xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <ScoreGauge score={score} />
          {qualityScore != null && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full whitespace-nowrap">
              Quality: {qualityScore}%
            </span>
          )}
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Your Health Assessment</h1>
            {healthScore?.label && (
              <span className={`inline-block mt-1 text-sm font-medium px-3 py-1 rounded-full ${
                healthScore.label === "Good" ? "bg-primary/10 text-primary" :
                healthScore.label === "Needs Attention" ? "bg-yellow-500/10 text-yellow-600" :
                "bg-destructive/10 text-destructive"
              }`}>
                {healthScore.label}
              </span>
            )}
          </div>
          {healthScore?.summary && (
            <p className="text-sm text-muted-foreground">{healthScore.summary}</p>
          )}

          {/* New category bars */}
          {hasCategories && (
            <div className="space-y-2.5 max-w-md">
              {Object.entries(categories!).slice(0, 6).map(([key, cat]) => (
                <CategoryBar key={key} name={key} cat={cat as CategoryScore} />
              ))}
            </div>
          )}

          {/* Legacy progress bars */}
          {hasLegacy && (
            <div className="space-y-3 max-w-sm">
              {healthScore?.genetics_score != null && <ProgressBar label="Genetics" value={healthScore.genetics_score} />}
              {healthScore?.biomarker_score != null && <ProgressBar label="Biomarkers" value={healthScore.biomarker_score} />}
              {healthScore?.lifestyle_score != null && <ProgressBar label="Lifestyle" value={healthScore.lifestyle_score} />}
            </div>
          )}
        </div>
      </div>

      {meta?.confidence && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Confidence:</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
            meta.confidence === "high" ? "bg-primary/10 text-primary" :
            meta.confidence === "medium" ? "bg-yellow-500/10 text-yellow-600" :
            "bg-destructive/10 text-destructive"
          }`}>{meta.confidence}</span>
        </div>
      )}

      {/* Personalised summary */}
      {personalisedSummary && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-heading font-semibold text-foreground mb-3">Personalised Summary</h3>
          <div className="text-sm text-foreground leading-relaxed space-y-3">
            {personalisedSummary.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      )}

      {narrative && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-heading font-semibold text-foreground mb-3">Key Insights</h3>
          {narrative.includes("•") ? (
            <ul className="space-y-3">
              {narrative
                .split("\n")
                .filter((line) => line.trim().startsWith("•"))
                .map((line, i) => {
                  const text = line.replace(/^•\s*/, "");
                  const parts = text.split(/\*\*([^*]+)\*\*/g);
                  return (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                      <span className="text-primary mt-0.5 shrink-0 text-base">●</span>
                      <span className="leading-relaxed">
                        {parts.map((part, j) =>
                          j % 2 === 1 ? (
                            <strong key={j} className="font-semibold text-foreground">{part}</strong>
                          ) : (
                            <span key={j}>{part}</span>
                          )
                        )}
                      </span>
                    </li>
                  );
                })}
            </ul>
          ) : (
            <p className="text-sm text-foreground leading-relaxed">{narrative}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportHeader;
