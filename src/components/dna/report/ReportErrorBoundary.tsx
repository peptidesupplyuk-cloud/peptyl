import React from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: React.ReactNode;
  sectionLabel?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Wraps a single report section. If it crashes, the rest of the report
 * stays usable and we show a small inline error card.
 */
class ReportErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(
      `[ReportErrorBoundary] section "${this.props.sectionLabel ?? "unknown"}" crashed:`,
      error.message,
      info.componentStack,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-card border border-destructive/30 rounded-2xl p-5 flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-heading font-semibold text-foreground">
              {this.props.sectionLabel
                ? `${this.props.sectionLabel} couldn't load`
                : "This section couldn't load"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              The rest of your report is unaffected. Try refreshing the page.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ReportErrorBoundary;
