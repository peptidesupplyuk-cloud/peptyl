import { useBloodworkPanels } from "@/hooks/use-bloodwork";
import { useProtocols } from "@/hooks/use-protocols";
import { Activity } from "lucide-react";

const OptimizationScore = () => {
  const { data: panels = [] } = useBloodworkPanels();
  const { data: protocols = [] } = useProtocols();

  // Score calculation: base + bloodwork + active protocols + marker count
  let score = 10; // base for having an account
  if (panels.length > 0) score += 25; // uploaded bloodwork
  if (panels.length > 1) score += 10; // multiple panels = tracking over time
  const activeProtocols = protocols.filter((p) => p.status === "active");
  if (activeProtocols.length > 0) score += 25; // running a protocol
  if (activeProtocols.length > 1) score += 10; // multi-compound
  const markerCount = panels[0]?.markers?.length ?? 0;
  if (markerCount >= 5) score += 10;
  if (markerCount >= 10) score += 10;
  score = Math.min(score, 100);

  const color =
    score >= 70 ? "text-success" : score >= 40 ? "text-primary" : "text-muted-foreground";

  return (
    <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
      <div className={`relative flex items-center justify-center w-16 h-16 rounded-full border-4 ${
        score >= 70 ? "border-success/30" : score >= 40 ? "border-primary/30" : "border-border"
      }`}>
        <span className={`text-xl font-heading font-bold ${color}`}>{score}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Activity className={`h-4 w-4 ${color}`} />
          <h3 className="text-sm font-heading font-semibold text-foreground">Health Direction Score</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {score < 30
            ? "Upload bloodwork and start a protocol to increase your score."
            : score < 60
            ? "Active protocol detected. Add biomarkers to improve further."
            : score < 80
            ? "Tracking well. Add more data points over time."
            : "Strong data coverage. Keep tracking to maintain."}
        </p>
      </div>
    </div>
  );
};

export default OptimizationScore;
