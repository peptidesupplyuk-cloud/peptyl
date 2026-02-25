import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Dna } from "lucide-react";
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
  const { inputText, imageBase64, method, userId } = (location.state || {}) as any;
  const [statusIndex, setStatusIndex] = useState(0);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  const abortRef = useRef<AbortController | null>(null);

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

  // Call the edge function
  useEffect(() => {
    if (!inputText && !imageBase64) {
      navigate("/dna/upload", { replace: true });
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const analyse = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const resp = await fetch(`${supabaseUrl}/functions/v1/analyse-dna`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ inputText, imageBase64, method, userId }),
          signal: controller.signal,
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error || `Analysis failed (${resp.status})`);
        }

        const reader = resp.body!.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line === "data: [DONE]") {
              // Parse report and redirect
              const parts = fullText.split("---NARRATIVE---");
              let jsonStr = parts[0].trim().replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
              try {
                const report = JSON.parse(jsonStr);
                // Fetch the saved report ID
                const { createClient } = await import("@supabase/supabase-js");
                const sb = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
                const { data } = await sb
                  .from("dna_reports")
                  .select("id")
                  .eq("user_id", userId)
                  .order("created_at", { ascending: false })
                  .limit(1)
                  .single();
                if (data?.id) {
                  navigate(`/dna/report/${data.id}`, { replace: true });
                } else {
                  navigate("/dna/dashboard", { replace: true });
                }
              } catch {
                navigate("/dna/dashboard", { replace: true });
              }
              return;
            }
            if (!line.startsWith("data: ")) continue;
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.text) {
                fullText += parsed.text;
                setStreamText(fullText.slice(-300));
              }
            } catch {
              // skip
            }
          }
        }

        // If stream ends without [DONE]
        navigate("/dna/dashboard", { replace: true });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      }
    };

    analyse();
    return () => controller.abort();
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
          {/* Spinner */}
          <div className="relative h-24 w-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-border" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <Dna className="absolute inset-0 m-auto h-8 w-8 text-primary" />
          </div>

          {/* Status */}
          <p className="text-foreground font-heading font-semibold text-lg mb-2">
            {STATUS_MESSAGES[statusIndex]}
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            {elapsed}s elapsed
            {elapsed > 90 && " — Taking longer than expected, still working…"}
          </p>

          {/* Stream preview */}
          {streamText && (
            <div className="bg-card border border-border rounded-lg p-4 text-left">
              <p className="font-mono text-xs text-muted-foreground whitespace-pre-wrap break-words leading-relaxed max-h-32 overflow-hidden">
                {streamText}
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default DNAAnalysing;
