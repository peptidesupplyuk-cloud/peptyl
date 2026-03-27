import { motion } from 'framer-motion';

interface DnaMatchRingProps {
  score: number;
  size?: number;
  showLabel?: boolean;
}

/** Circular progress ring showing DNA match percentage */
const DnaMatchRing = ({ score, size = 24, showLabel = false }: DnaMatchRingProps) => {
  const strokeWidth = size > 32 ? 3 : 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 70 ? 'hsl(var(--primary))' : score >= 40 ? 'hsl(var(--warm))' : 'hsl(var(--muted-foreground))';

  return (
    <div className="flex items-center gap-1.5" title={`${score}% DNA match`}>
      <svg width={size} height={size} className="shrink-0 -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </svg>
      {showLabel && (
        <span className="text-[10px] font-medium" style={{ color }}>
          {score}%
        </span>
      )}
    </div>
  );
};

export default DnaMatchRing;
