import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CategoryScore {
  score: number;
  status?: string;
}

interface Props {
  score: number;
  label?: string;
  tier: string;
  qualityScore?: number;
  categories?: Record<string, CategoryScore>;
  personalisedSummary?: string;
}

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

const HeroCard = ({ score, label, tier, qualityScore, categories, personalisedSummary }: Props) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let frame: number;
    const duration = 1400;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;
  const scoreColor =
    score >= 80 ? "hsl(var(--primary))" :
    score >= 65 ? "hsl(160, 60%, 45%)" :
    score >= 50 ? "hsl(38, 92%, 50%)" :
    "hsl(var(--destructive))";

  const tierBadge = tier === "pro"
    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
    : tier === "advanced"
    ? "bg-primary/10 text-primary border-primary/20"
    : "bg-muted text-muted-foreground border-border";

  const tierLabel = tier === "pro" ? "Pro ★" : tier === "advanced" ? "Advanced ✦" : "Standard";

  const catEntries = categories ? Object.entries(categories).slice(0, 6) : [];

  return (
    <div className="relative">
      {/* Soft brand gradient background */}
      <div className="absolute inset-0 -mx-4 md:-mx-8 rounded-3xl bg-gradient-to-b from-primary/5 via-primary/[0.02] to-transparent pointer-events-none" />

      <div className="relative flex flex-col items-center text-center space-y-6 md:space-y-8 pt-4 md:pt-8 pb-4">
        {/* Tier badge */}
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`text-xs md:text-sm font-semibold px-4 py-1.5 rounded-full border ${tierBadge}`}
        >
          {tierLabel} Assessment
        </motion.span>

        {/* Score gauge */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 22, delay: 0.25 }}
          className="relative"
        >
          <svg viewBox="0 0 168 168" className="h-52 w-52 md:h-64 md:w-64 drop-shadow-sm">
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={scoreColor} stopOpacity="1" />
                <stop offset="100%" stopColor={scoreColor} stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <circle
              cx="84" cy="84" r={radius}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="11"
              opacity="0.6"
            />
            <circle
              cx="84" cy="84" r={radius}
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              transform="rotate(-90 84 84)"
              style={{ filter: `drop-shadow(0 0 10px ${scoreColor}50)` }}
            />
            <text
              x="84" y="80"
              textAnchor="middle"
              className="fill-foreground"
              fontSize="52"
              fontWeight="800"
              fontFamily="var(--font-heading, inherit)"
            >
              {animatedScore}
            </text>
            <text
              x="84" y="106"
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize="13"
              letterSpacing="1.5"
            >
              / 100
            </text>
          </svg>
          {qualityScore != null && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-medium text-muted-foreground bg-card border border-border px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm">
              Quality {qualityScore}%
            </span>
          )}
        </motion.div>

        {/* Title + label */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="space-y-2"
        >
          <h1 className="text-2xl md:text-4xl font-heading font-bold text-foreground leading-tight">
            Your Health Assessment
          </h1>
          {label && (
            <span
              className={`inline-block text-sm md:text-base font-medium px-4 py-1.5 rounded-full ${
                label === "Good" || label === "Excellent" ? "bg-primary/10 text-primary" :
                label === "Needs Attention" ? "bg-amber-500/10 text-amber-600" :
                "bg-destructive/10 text-destructive"
              }`}
            >
              {label}
            </span>
          )}
        </motion.div>

        {/* Category bars */}
        {catEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="w-full max-w-md space-y-3 pt-2"
          >
            {catEntries.map(([key, cat], i) => {
              const c = cat as CategoryScore;
              return (
                <div key={key} className="text-left">
                  <div className="flex justify-between items-baseline text-sm mb-1.5">
                    <span className="text-muted-foreground font-medium">
                      {categoryLabels[key] || key}
                    </span>
                    <span className="text-foreground font-heading font-bold tabular-nums">
                      {c.score}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.score}%` }}
                      transition={{ delay: 0.9 + i * 0.05, duration: 0.7, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Summary excerpt */}
        {personalisedSummary && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed pt-2"
          >
            {personalisedSummary.split("\n\n")[0]}
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default HeroCard;
