import { useMemo } from "react";

interface SyringeDiagramProps {
  capacityMl: number;
  drawVolumeMl: number;
  units: number;
  syringeLabel: string;
}

const SyringeDiagram = ({ capacityMl, drawVolumeMl, units, syringeLabel }: SyringeDiagramProps) => {
  const fillPercent = useMemo(() => {
    const pct = Math.min((drawVolumeMl / capacityMl) * 100, 100);
    return Math.max(pct, 2); // minimum visible fill
  }, [drawVolumeMl, capacityMl]);

  const tickCount = 5;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i);

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-medium text-muted-foreground">{syringeLabel}</p>
      <div className="relative w-16 h-48 flex flex-col items-center">
        {/* Plunger */}
        <div className="w-1.5 bg-muted-foreground/40 rounded-t-full" style={{ height: `${100 - fillPercent}%` }} />
        <div className="w-8 h-1.5 bg-muted-foreground/40 rounded-sm" />
        
        {/* Barrel */}
        <div className="relative w-10 flex-1 border-2 border-border rounded-b-md overflow-hidden bg-card">
          {/* Fill */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-primary/30 border-t-2 border-primary transition-all duration-500"
            style={{ height: `${fillPercent}%` }}
          />
          {/* Tick marks */}
          {ticks.map((i) => (
            <div
              key={i}
              className="absolute left-0 w-2 h-px bg-muted-foreground/30"
              style={{ bottom: `${(i / tickCount) * 100}%` }}
            />
          ))}
        </div>
        
        {/* Needle hub */}
        <div className="w-3 h-2 bg-muted-foreground/40 rounded-b-sm" />
        <div className="w-0.5 h-4 bg-muted-foreground/30" />
      </div>
      <div className="text-center">
        <span className="text-lg font-heading font-bold text-primary">{units}</span>
        <span className="text-xs text-muted-foreground ml-1">units</span>
      </div>
    </div>
  );
};

export default SyringeDiagram;
