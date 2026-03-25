import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

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
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;
  const scoreColor =
    score >= 80 ? "hsl(var(--primary))" :
    score >= 65 ? "hsl(160, 60%, 45%)" :
    score >= 50 ? "#F59E0B" :
    "hsl(var(--destructive))";

  const tierBadge = tier === "pro"
    ? "bg-amber-500/10 text-amber-600"
    : tier === "advanced"
    ? "bg-primary/10 text-primary"
    : "bg-muted text-muted-foreground";

  const tierLabel = tier === "pro" ? "Pro ★" : tier === "advanced" ? "Advanced ✦" : "Standard";

  const catEntries = categories ? Object.entries(categories).slice(0, 6) : [];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80dvh] text-center space-y-8">
      {/* Tier badge */}
      <motion.span
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`text-xs font-semibold px-4 py-1.5 rounded-full ${tierBadge}`}
      >
        {tierLabel}
      </motion.span>

      {/* Score gauge */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
        className="relative"
      >
        <svg viewBox="0 0 160 160" className="h-44 w-44 md:h-56 md:w-56">
          {/* Background ring */}
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="10"
          />
          {/* Progress ring */}
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            transform="rotate(-90 80 80)"
            className="transition-all duration-100"
            style={{ filter: `drop-shadow(0 0 8px ${scoreColor}40)` }}
          />
          {/* Score number */}
          <text x="80" y="72" textAnchor="middle" className="fill-foreground" fontSize="42" fontWeight="800" fontFamily="var(--font-heading, inherit)">
            {animatedScore}
          </text>
          <text x="80" y="96" textAnchor="middle" className="fill-muted-foreground" fontSize="13">
            / 100
          </text>
        </svg>
        {qualityScore != null && (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full whitespace-nowrap">
            Quality: {qualityScore}%
          </span>
        )}
      </motion.div>

      {/* Label */}
      {label && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className={`text-sm font-medium px-4 py-1.5 rounded-full ${
            label === "Good" ? "bg-primary/10 text-primary" :
            label === "Needs Attention" ? "bg-yellow-500/10 text-yellow-600" :
            "bg-destructive/10 text-destructive"
          }`}
        >
          {label}
        </motion.span>
      )}

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-2xl md:text-3xl font-heading font-bold text-foreground"
      >
        Your Health Assessment
      </motion.h1>

      {/* Category bars */}
      {catEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="w-full max-w-sm space-y-2"
        >
          {catEntries.map(([key, cat]) => {
            const c = cat as CategoryScore;
            return (
              <div key={key}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-muted-foreground">{categoryLabels[key] || key}</span>
                  <span className="text-foreground font-medium tabular-nums">{c.score}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.score}%` }}
                    transition={{ delay: 1.1, duration: 0.8 }}
                    className="h-full bg-primary rounded-full"
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
          transition={{ delay: 1.2 }}
          className="text-sm text-muted-foreground max-w-md leading-relaxed line-clamp-3"
        >
          {personalisedSummary.split("\n\n")[0]}
        </motion.p>
      )}

      {/* Swipe prompt */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="flex flex-col items-center gap-1 text-muted-foreground/60"
      >
        <span className="text-xs">Swipe up to explore your results</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeroCard;
