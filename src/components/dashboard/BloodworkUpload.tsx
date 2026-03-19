import { useState, useRef } from "react";
import { Upload, FileText, Loader2, CheckCircle2, AlertTriangle, X, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BIOMARKERS } from "@/data/biomarker-ranges";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface ParsedMarker {
  marker_name: string;
  value: number;
  unit: string;
  original_name: string;
}

interface UntrackedMarker {
  name: string;
  value: number;
  unit: string;
}

interface ParseResult {
  matched: ParsedMarker[];
  untracked: UntrackedMarker[];
  test_date: string | null;
  lab_name: string | null;
  total_extracted: number;
}

interface BloodworkUploadProps {
  onParsed: (markers: Record<string, string>, testDate?: Date) => void;
}

const BloodworkUpload = ({ onParsed }: BloodworkUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "reading" | "parsing" | "done" | "error">("idle");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [untrackedDialog, setUntrackedDialog] = useState(false);
  const [requestedMarkers, setRequestedMarkers] = useState<Set<string>>(new Set());

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === "text/plain" || file.type === "text/csv") {
      return file.text();
    }

    // For PDFs, we use the browser's FileReader to get base64, then send to AI
    // The AI model can handle raw text extraction from the content
    const text = await file.text();
    
    // If it's a PDF, the raw text might contain extractable content
    // For binary PDFs, we'll extract what we can
    if (file.type === "application/pdf") {
      // Try to extract text content from PDF bytes
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let extracted = "";
      
      // Simple PDF text extraction - find text between BT/ET markers
      const decoder = new TextDecoder("latin1");
      const rawText = decoder.decode(bytes);
      
      // Extract text from PDF streams (basic approach)
      const textMatches = rawText.match(/\(([^)]+)\)/g);
      if (textMatches) {
        extracted = textMatches.map(m => m.slice(1, -1)).join(" ");
      }
      
      // Also try to find readable content
      const readableChunks = rawText.match(/[A-Za-z0-9\s.,:<>\/\-+%()]{10,}/g);
      if (readableChunks) {
        extracted += " " + readableChunks.join(" ");
      }
      
      if (extracted.length > 50) return extracted;
      
      // Fallback: send the raw text
      return text;
    }

    return text;
  };

  const handleFile = async (file: File) => {
    if (!user) {
      toast({ title: "Please sign in", variant: "destructive" });
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({ title: "File too large", description: "Max 10MB", variant: "destructive" });
      return;
    }

    setStatus("reading");
    setResult(null);

    try {
      const text = await extractTextFromFile(file);
      
      if (text.length < 20) {
        toast({ title: "Could not read file", description: "The file appears to be empty or unreadable. Try a text-based PDF.", variant: "destructive" });
        setStatus("error");
        return;
      }

      setStatus("parsing");

      const { data, error } = await supabase.functions.invoke("parse-bloodwork", {
        body: { text: text.slice(0, 15000) },
      });

      if (error || data?.error) {
        toast({ title: "Parse failed", description: data?.error || "Could not extract results", variant: "destructive" });
        setStatus("error");
        return;
      }

      const parseResult = data as ParseResult;
      setResult(parseResult);
      setStatus("done");

      // Auto-fill matched markers
      const markerValues: Record<string, string> = {};
      for (const m of parseResult.matched) {
        markerValues[m.marker_name] = String(m.value);
      }

      // Parse test date
      let testDate: Date | undefined;
      if (parseResult.test_date) {
        const d = new Date(parseResult.test_date);
        if (!isNaN(d.getTime())) testDate = d;
      }

      onParsed(markerValues, testDate);

      toast({
        title: `${parseResult.matched.length} markers extracted`,
        description: parseResult.untracked.length > 0
          ? `${parseResult.untracked.length} marker${parseResult.untracked.length > 1 ? "s" : ""} not yet tracked`
          : "All markers matched to our system",
      });

      // Show untracked dialog if any
      if (parseResult.untracked.length > 0) {
        setTimeout(() => setUntrackedDialog(true), 800);
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast({ title: "Upload failed", variant: "destructive" });
      setStatus("error");
    }
  };

  const handleRequestMarker = async (markerName: string) => {
    if (!user) return;
    try {
      await supabase.from("marker_requests").insert({
        user_id: user.id,
        marker_name: markerName,
        source: "pdf_upload",
      } as any);
      setRequestedMarkers(prev => new Set(prev).add(markerName));
    } catch {
      // silent fail
    }
  };

  const handleDismissMarker = (markerName: string) => {
    setRequestedMarkers(prev => new Set(prev).add(markerName));
  };

  return (
    <>
      <div className="space-y-3">
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={status === "reading" || status === "parsing"}
          className="w-full group relative overflow-hidden rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-primary/5 transition-all p-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex flex-col items-center gap-2.5">
            {status === "idle" || status === "error" ? (
              <>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">Upload Lab Results</p>
                  <p className="text-xs text-muted-foreground mt-0.5">PDF, TXT, or CSV — we'll extract your markers automatically</p>
                </div>
              </>
            ) : status === "reading" ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Reading file…</span>
              </div>
            ) : status === "parsing" ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Extracting biomarkers with AI…</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground font-medium">
                  {result?.matched.length} markers filled • Upload another?
                </span>
              </div>
            )}
          </div>
        </button>

        {/* Quick summary of matched markers */}
        <AnimatePresence>
          {result && result.matched.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-1.5"
            >
              {result.matched.map((m) => {
                const def = BIOMARKERS.find(b => b.key === m.marker_name);
                return (
                  <span
                    key={m.marker_name}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {def?.name || m.marker_name}
                  </span>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Untracked markers dialog */}
      <Dialog open={untrackedDialog} onOpenChange={setUntrackedDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Untracked Markers Found
            </DialogTitle>
            <DialogDescription>
              We found {result?.untracked.length} marker{(result?.untracked.length ?? 0) > 1 ? "s" : ""} we don't currently track.
              Would you like us to look into adding any of these?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {result?.untracked.map((m) => {
              const isRequested = requestedMarkers.has(m.name);
              return (
                <div
                  key={m.name}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.value} {m.unit}
                    </p>
                  </div>
                  {isRequested ? (
                    <span className="text-xs text-primary font-medium shrink-0">Noted ✓</span>
                  ) : (
                    <div className="flex gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs gap-1 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                        onClick={() => handleRequestMarker(m.name)}
                      >
                        <ThumbsUp className="h-3 w-3" />
                        Yes
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs gap-1 text-muted-foreground"
                        onClick={() => handleDismissMarker(m.name)}
                      >
                        <ThumbsDown className="h-3 w-3" />
                        No
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUntrackedDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BloodworkUpload;
