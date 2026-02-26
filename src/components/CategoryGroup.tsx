import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CategoryGroupProps {
  category: string;
  count: number;
  bestGrade: string;
  children: React.ReactNode;
}

const gradeConfig: Record<string, { label: string; className: string }> = {
  A: { label: "A", className: "bg-primary/20 text-primary border border-primary/30" },
  B: { label: "B", className: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
  C: { label: "C", className: "bg-amber-500/20 text-amber-400 border border-amber-500/30" },
  D: { label: "D", className: "bg-muted text-muted-foreground border border-border" },
};

const CategoryGroup = ({ category, count, bestGrade, children }: CategoryGroupProps) => {
  const [open, setOpen] = useState(true);
  const grade = gradeConfig[bestGrade] || gradeConfig.D;

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full py-2.5 px-3 rounded-md hover:bg-muted/30 transition-colors border-l-2"
        style={{ borderLeftColor: "#00D4AA" }}
      >
        <span className="text-sm font-heading font-bold text-foreground">{category}</span>
        <span className="text-[11px] text-muted-foreground">{count} compounds</span>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${grade.className}`}>
          Best: {grade.label}
        </span>
        <div className="flex-1" />
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="space-y-1 mt-1 ml-1">{children}</div>}
    </div>
  );
};

export default CategoryGroup;
