import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import AnimatedDNA from "@/components/dna/AnimatedDNA";

const PIPELINE_STAGES: Record<string, { label: string; hint: string; icon: string }> = {
  queued:       { label: "Your report is in the queue",               hint: "We'll start processing shortly.",                icon: "⏳" },
  parsing:      { label: "Analysing your genetic data",               hint: "Reading variants and building your profile.",     icon: "🧬" },
  enriching:    { label: "Cross-referencing clinical databases",       hint: "Matching against research and biomarker data.",   icon: "🔬" },
  synthesising: { label: "Building your personalised report",         hint: "Our AI is writing your recommendations now.",     icon: "✍️" },
  validating:   { label: "Running quality checks",                    hint: "Making sure everything meets our standards.",     icon: "✅" },
  complete:     { label: "Report ready!",                             hint: "Redirecting you now...",                          icon: "🎉" },
  failed:       { label: "Something went wrong",                      hint: "",                                               icon: "⚠️" },
};

const DNAAnalysing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { inputText, imageBase64, method, userId, tier, lifestyleContext, reportId } =
    (location.state || {}) as any;

  const [status, setStatus] = useState<string>("queued");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  const edgeFunctionCalled = useRef(false);

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Call the edge function once, then poll
  useEffect(() => {
    if (!inputText && !imageBase64) {
      navigate("/dna/upload", { replace: true });
      return;
    }
    if (!reportId) {
      navigate("/dna/upload", { replace: true });
      return;
    }

    let cancelled = false;

    const run = async () => {
      // Only call the edge function once
      if (!edgeFunctionCalled.current) {
        edgeFunctionCalled.current = true;
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const resp = await fetch(`${supabaseUrl}/functions/v1/analyse-dna`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              reportId,
              userId,
              inputText,
              imageBase64,
              method,
              tier: tier ?? "standard",
              lifestyleContext: lifestyleContext ?? null,
            }),
          });

          if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.error || `Analysis failed (${resp.status})`);
          }
        } catch (err: any) {
          if (!cancelled) setError(err.message);
          return;
        }
      }

      // Poll for pipeline completion
      while (!cancelled) {
        await new Promise((r) => setTimeout(r, 3000));
        if (cancelled) return;

        const { data, error: fetchErr } = await supabase
          .from("dna_reports")
          .select("pipeline_status, pipeline_progress, pipeline_error")
          .eq("id", reportId)
          .maybeSingle();

        if (fetchErr || !data) continue;

        const pipelineStatus = data.pipeline_status || "queued";
        const pipelineProgress = data.pipeline_progress || 0;

        if (!cancelled) {
          setStatus(pipelineStatus);
          setProgress(pipelineProgress);
        }

        if (pipelineStatus === "complete") {
          navigate(`/dna/report/${reportId}`, { replace: true });
          return;
        }

        if (pipelineStatus === "failed") {
          if (!cancelled) setError(data.pipeline_error || "Analysis failed. Please try again.");
          return;
        }
      }
    };

    run();
    return () => { cancelled = true; };
  }, []);

  const stage = PIPELINE_STAGES[status] || PIPELINE_STAGES.queued;
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16 bg-background flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-md px-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-foreground font-heading font-semibold text-xl mb-2">
              Analysis Failed
            </p>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate("/dna/upload", { replace: true })}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          </motion.div>
        </main>
      </>
    );
  }

  return (
    <>
      <SEO title="Analysing Your DNA | Peptyl" description="Your genetic data is being analysed." path="/dna/analysing" />
      <Header />
      <main className="min-h-screen pt-24 pb-16 bg-background flex items-center justify-center">
        <div className="w-full max-w-lg px-6">
          {/* DNA Helix Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <AnimatedDNA />
          </motion.div>

          {/* Status Message */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-8"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="text-2xl mb-3 block">{stage.icon}</span>
                <h2 className="text-foreground font-heading font-semibold text-lg mb-1.5">
                  {stage.label}
                </h2>
                <p className="text-muted-foreground text-sm">{stage.hint}</p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4"
          >
            <Progress
              value={progress}
              className="h-2.5 bg-muted/50"
            />
            <div className="flex items-center justify-between mt-2.5">
              <span className="text-xs text-muted-foreground font-medium tabular-nums">
                {progress}%
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {timeStr} elapsed
              </span>
            </div>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card border border-border rounded-xl p-5 text-center"
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              This usually takes 1 to 3 minutes. Feel free to close this page.
              We will send you a notification when your report is ready.
            </p>
            {elapsed > 90 && (
              <p className="text-xs text-muted-foreground/70 mt-2">
                Taking longer than expected. Still working on it...
              </p>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default DNAAnalysing;
