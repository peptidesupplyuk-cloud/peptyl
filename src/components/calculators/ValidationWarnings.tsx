import { AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";

export type ValidationLevel = "success" | "warning" | "error" | "info";

export interface ValidationMessage {
  level: ValidationLevel;
  message: string;
}

interface ValidationWarningsProps {
  messages: ValidationMessage[];
}

const iconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const colorMap = {
  success: "text-success border-success/20 bg-success/5",
  warning: "text-warm border-warm/20 bg-warm/5",
  error: "text-destructive border-destructive/20 bg-destructive/5",
  info: "text-info border-info/20 bg-info/5",
};

const ValidationWarnings = ({ messages }: ValidationWarningsProps) => {
  if (messages.length === 0) return null;

  return (
    <div className="space-y-2">
      {messages.map((msg, i) => {
        const Icon = iconMap[msg.level];
        return (
          <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs ${colorMap[msg.level]}`}>
            <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>{msg.message}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ValidationWarnings;
