import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Dna } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import SEO from "@/components/SEO";

const STATUS_MESSAGES = [
  "Reading your genetic data…",
  "Identifying variants…",
  "Calculating health scores…",
  "Building your supplement protocol…",
];

const DNAAnalysing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { inputText, imageBase64, method, userId, tier, lifestyleContext, reportId } =
    (location.state || {}) as any;
  const [statusIndex, setStatusIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  // Cycle status messages
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Submit to edge function then poll for completion
  useEffect(() => {
    if (!inputText && !imageBase64) {
      navigate("/dna/upload", { replace: true });
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        // Call the edge function (now returns immediately with queued status)
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

        const result = await resp.json();
        const trackingReportId = result.reportId || reportId;

        if (!trackingReportId) {
          throw new Error("No report ID returned");
        }

        // Poll dna_reports for pipeline completion
        const poll = async () => {
          while (!cancelled) {
            await new Promise((r) => setTimeout(r, 3000));
            if (cancelled) return;

            const { data, error: fetchErr } = await supabase
              .from("dna_reports")
              .select("pipeline_status, pipeline_error")
              .eq("id", trackingReportId)
              .maybeSingle();

            if (fetchErr || !data) continue;

            if (data.pipeline_status === "complete") {
              navigate(`/dna/report/${trackingReportId}`, { replace: true });
              return;
            }

            if (data.pipeline_status === "failed") {
              setError(data.pipeline_error || "Analysis failed. Please try again.");
              return;
            }
          }
        };

        poll();
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16 bg-background flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <p className="text-destructive font-heading font-semibold text-lg mb-3">Analysis Failed</p>
            <p className="text-muted-foreground text-sm mb-6">{error}</p>
            <button
              onClick={() => navigate("/dna/upload", { replace: true })}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm"
            >
              Try Again
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SEO title="Analysing… | Peptyl DNA" description="Your genetic data is being analysed." path="/dna/analysing" />
      <Header />
      <main className="min-h-screen pt-24 pb-16 bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="relative h-24 w-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-border" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <Dna className="absolute inset-0 m-auto h-8 w-8 text-primary" />
          </div>

          <p className="text-foreground font-heading font-semibold text-lg mb-2">
            {STATUS_MESSAGES[statusIndex]}
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            {elapsed}s elapsed
            {elapsed > 90 && " — Taking longer than expected, still working…"}
          </p>

          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Can't wait? Don't worry, we'll send you a push notification and email when your report is ready.
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default DNAAnalysing;
