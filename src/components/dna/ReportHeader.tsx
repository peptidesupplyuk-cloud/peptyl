interface Props {
  healthScore?: {
    overall?: number;
    genetics_score?: number;
    biomarker_score?: number;
    lifestyle_score?: number;
    label?: string;
    summary?: string;
  };
  meta?: {
    confidence?: string;
    variants_detected?: string[];
    variants_not_found?: string[];
    data_quality_notes?: string;
  };
  narrative?: string;
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

const ReportHeader = ({ healthScore, meta, narrative }: Props) => {
  const score = healthScore?.overall ?? 0;

  return (
    <div className="bg-card border border-border rounded-xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <ScoreGauge score={score} />
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
          <div className="space-y-3 max-w-sm">
            {healthScore?.genetics_score != null && <ProgressBar label="Genetics" value={healthScore.genetics_score} />}
            {healthScore?.biomarker_score != null && <ProgressBar label="Biomarkers" value={healthScore.biomarker_score} />}
            {healthScore?.lifestyle_score != null && <ProgressBar label="Lifestyle" value={healthScore.lifestyle_score} />}
          </div>
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

      {narrative && (
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm text-foreground leading-relaxed">{narrative}</p>
        </div>
      )}
    </div>
  );
};

export default ReportHeader;
