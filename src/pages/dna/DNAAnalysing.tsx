import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowLeft, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import AnimatedDNA from "@/components/dna/AnimatedDNA";

const PIPELINE_STEPS = [
  { key: "queued",       label: "In the queue",                        hint: "We'll start processing shortly.",              icon: "⏳" },
  { key: "parsing",      label: "Analysing genetic data",              hint: "Reading variants and building your profile.",   icon: "🧬" },
  { key: "enriching",    label: "Cross-referencing clinical databases", hint: "Matching against research and biomarker data.", icon: "🔬" },
  { key: "synthesising", label: "Building personalised report",        hint: "Our AI is writing your recommendations now.",   icon: "✍️" },
  { key: "validating",   label: "Running quality checks",              hint: "Making sure everything meets our standards.",   icon: "✅" },
];

const stepIndex = (status: string) => PIPELINE_STEPS.findIndex((s) => s.key === status);

const DNAAnalysing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { inputText, imageBase64, method, userId, tier, lifestyleContext, reportId, questionnaireAnswers } =
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
              reportId, userId, inputText, imageBase64, method,
              tier: tier ?? "standard",
              lifestyleContext: lifestyleContext ?? null,
              questionnaireAnswers: questionnaireAnswers ?? null,
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

  const currentIdx = stepIndex(status);
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

  const currentStep = currentIdx >= 0 ? PIPELINE_STEPS[currentIdx] : PIPELINE_STEPS[0];

  return (
    <>
      <SEO title="Analysing Your DNA | Peptyl" description="Your genetic data is being analysed." path="/dna/analysing" />
      <Header />
      <main className="min-h-screen pt-24 pb-16 bg-background flex items-center justify-center">
        <div className="w-full max-w-2xl px-6">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Left: Step timeline */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="hidden md:flex flex-col gap-0 min-w-[220px]"
            >
              {PIPELINE_STEPS.map((step, i) => {
                const done = currentIdx > i;
                const active = currentIdx === i;
                return (
                  <div key={step.key} className="flex items-start gap-3 relative">
                    {/* Vertical connector line */}
                    {i < PIPELINE_STEPS.length - 1 && (
                      <div
                        className="absolute left-[13px] top-[28px] w-0.5 h-[calc(100%-4px)] transition-colors duration-500"
                        style={{
                          background: done ? "hsl(var(--primary))" : "hsl(var(--muted))",
                        }}
                      />
                    )}
                    {/* Circle / check */}
                    <div
                      className="relative z-10 flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-all duration-500 mt-0.5"
                      style={{
                        background: done
                          ? "hsl(var(--primary))"
                          : active
                          ? "hsl(var(--primary) / 0.2)"
                          : "hsl(var(--muted))",
                        border: active ? "2px solid hsl(var(--primary))" : "2px solid transparent",
                      }}
                    >
                      {done ? (
                        <Check className="h-3.5 w-3.5 text-primary-foreground" />
                      ) : (
                        <span
                          className="text-xs tabular-nums font-medium"
                          style={{
                            color: active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                          }}
                        >
                          {i + 1}
                        </span>
                      )}
                    </div>
                    {/* Label */}
                    <div className="pb-6">
                      <p
                        className="text-sm font-medium leading-tight transition-colors duration-300"
                        style={{
                          color: done || active ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                        }}
                      >
                        {step.label}
                      </p>
                      {active && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-xs text-muted-foreground mt-0.5"
                        >
                          {step.hint}
                        </motion.p>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Right: Main content */}
            <div className="flex-1 w-full">
              {/* DNA Helix Animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="mb-8"
              >
                <AnimatedDNA />
              </motion.div>

              {/* Status Message */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="text-center mb-6"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={status}
                    initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="text-2xl mb-3 block">{currentStep.icon}</span>
                    <h2 className="text-foreground font-heading font-semibold text-lg mb-1.5">
                      {currentStep.label}
                    </h2>
                    <p className="text-muted-foreground text-sm">{currentStep.hint}</p>
                  </motion.div>
                </AnimatePresence>

                {/* Mobile step indicators */}
                <div className="flex md:hidden items-center justify-center gap-1.5 mt-4">
                  {PIPELINE_STEPS.map((step, i) => (
                    <div
                      key={step.key}
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: currentIdx === i ? 24 : 8,
                        background:
                          currentIdx > i
                            ? "hsl(var(--primary))"
                            : currentIdx === i
                            ? "hsl(var(--primary))"
                            : "hsl(var(--muted))",
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Progress Bar with gradient */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mb-4"
              >
                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/50">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${progress}%`,
                      background: "linear-gradient(90deg, hsl(var(--primary)), hsl(187 100% 42%))",
                    }}
                  />
                </div>
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
                  This can take up to 30 minutes depending on the depth of your assessment.
                  Feel free to close this page — we'll email you when your report is ready.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate("/dna/dashboard")}
                >
                  View My Assessments
                </Button>
                {elapsed > 600 && (
                  <p className="text-xs text-muted-foreground/70 mt-2">
                    Still working on your report. You can safely leave and check back later.
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default DNAAnalysing;
