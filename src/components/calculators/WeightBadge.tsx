import type { WeightDosing } from "@/data/calculator-peptides";

interface WeightBadgeProps {
  type: WeightDosing;
  className?: string;
}

const WeightBadge = ({ type, className = "" }: WeightBadgeProps) => {
  if (type === "independent") {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-success/15 text-success border border-success/20 ${className}`}>
        🟢 Standard dosing
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-warm/15 text-warm border border-warm/20 ${className}`}>
      🟡 Weight-based
    </span>
  );
};

export default WeightBadge;
