import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FileText, Upload, Camera, MessageSquare, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TARGET_RSIDS = new Set([
  "rs429358", "rs7412",
  "rs1801133", "rs1801131",
  "rs731236", "rs1544410", "rs2228570",
  "rs3892097",
  "rs4680",
  "rs9939609",
  "rs12934922", "rs7501331",
  "rs7903146", "rs4880", "rs1695",
]);

type Method = "pdf" | "raw23andme" | "text" | "image";

const tabs: { id: Method; label: string; icon: any }[] = [
  { id: "pdf", label: "PDF Report", icon: FileText },
  { id: "raw23andme", label: "23andMe / Ancestry", icon: Upload },
  { id: "image", label: "Photo", icon: Camera },
  { id: "text", label: "Paste Text", icon: MessageSquare },
];

const DNAUpload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [method, setMethod] = useState<Method>("pdf");
  const [inputText, setInputText] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);
  const [consent3, setConsent3] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    setFileName(file.name);

    if (method === "image") {
      const reader = new FileReader();
      reader.onload = () => {
        setImageBase64(reader.result as string);
        setInputText(`[Image: ${file.name}]`);
      };
      reader.readAsDataURL(file);
      return;
    }

    if (method === "raw23andme" || file.name.endsWith(".txt")) {
      const text = await file.text();
      const lines = text.split("\n");
      const filtered = lines.filter((line) => {
        if (line.startsWith("#")) return false;
        const parts = line.trim().split(/\s+/);
        return parts[0] && TARGET_RSIDS.has(parts[0]);
      });
      setInputText(filtered.join("\n") || "No target rsIDs found in file.");
      setMethod("raw23andme");
      return;
    }

    if (file.type === "application/pdf") {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let allText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          allText += content.items.map((item: any) => item.str).join(" ") + "\n";
        }
        setInputText(allText);
      } catch (err) {
        console.error("PDF parse error:", err);
        toast({ title: "PDF Error", description: "Could not read this PDF. Try pasting the text instead.", variant: "destructive" });
      }
      return;
    }

    const text = await file.text();
    setInputText(text);
  }, [method, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const canSubmit =
    consent1 &&
    consent2 &&
    consent3 &&
    !loading &&
    (inputText.trim().length >= 10 || !!imageBase64);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to analyse your DNA data.", variant: "destructive" });
      navigate("/auth");
      return;
    }

    // Log consent with version
    await supabase.from("dna_consents").insert({
      user_id: user.id,
      feature: "dna_analysis",
      consent_version: "2.0",
    } as any);

    navigate("/dna/analysing", {
      state: {
        inputText: method === "image" ? "" : inputText,
        imageBase64: method === "image" ? imageBase64 : null,
        method,
        userId: user.id,
      },
    });
  };

  const clearFile = () => {
    setFileName(null);
    setInputText("");
    setImageBase64(null);
  };

  return (
    <>
      <SEO title="Upload DNA Data | Peptyl" description="Upload your genetic data for AI-powered health analysis." path="/dna/upload" />
      <Header />
      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-6 max-w-2xl">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Upload Your Data</h1>
          <p className="text-muted-foreground mb-8">Choose how you'd like to provide your genetic or health data.</p>

          {/* Method tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => { setMethod(t.id); clearFile(); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                  method === t.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/30"
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Upload area */}
          {method !== "text" ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-border rounded-xl p-10 text-center bg-card hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = method === "pdf" ? ".pdf" : method === "raw23andme" ? ".txt" : ".jpg,.jpeg,.png,.webp";
                input.onchange = (e: any) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                };
                input.click();
              }}
            >
              {fileName ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-foreground font-medium">{fileName}</span>
                  <button onClick={(e) => { e.stopPropagation(); clearFile(); }} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-foreground font-medium mb-1">
                    {method === "pdf" ? "Drop a PDF lab report" : method === "raw23andme" ? "Drop a 23andMe / Ancestry .txt file" : "Drop a photo of your results"}
                  </p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </>
              )}
            </div>
          ) : (
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your genetic results, lab values, or describe your genotype here..."
              rows={8}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors resize-none text-sm"
            />
          )}

          {/* Character count */}
          {inputText && (
            <p className="text-xs text-muted-foreground mt-2">{inputText.length} characters</p>
          )}

          {/* Image warning */}
          {method === "image" && imageBase64 && (
            <div className="mt-3 bg-accent/50 border border-accent-foreground/10 rounded-lg px-4 py-2 text-xs text-accent-foreground">
              ⚠️ Results parsed from images should be verified manually for accuracy.
            </div>
          )}

          {/* Triple Consent */}
          <div className="mt-6 space-y-4">
            <div>
              <p className="font-semibold text-foreground text-sm">Before you continue</p>
              <p className="text-xs text-muted-foreground">Your genetic data is sensitive. Please confirm you understand how it will be used.</p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox checked={consent1} onCheckedChange={(v) => setConsent1(!!v)} className="mt-0.5" />
              <span className="text-xs text-muted-foreground leading-relaxed">
                I explicitly consent to my genetic data being processed by AI for the sole purpose of generating a personalised educational health report. I understand this is special category data under UK GDPR Article 9.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox checked={consent2} onCheckedChange={(v) => setConsent2(!!v)} className="mt-0.5" />
              <span className="text-xs text-muted-foreground leading-relaxed">
                I understand this report is for educational purposes only. It is not medical advice, a diagnosis, or a clinical assessment. Peptyl is not operated by medical professionals. I will not use this report to make decisions about medications, treatments, or clinical interventions without consulting a qualified healthcare professional.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox checked={consent3} onCheckedChange={(v) => setConsent3(!!v)} className="mt-0.5" />
              <span className="text-xs text-muted-foreground leading-relaxed">
                I have read and agree to the{" "}
                <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
                {" "}and{" "}
                <Link to="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link>
                , and I understand I can delete my report at any time from my DNA dashboard.
              </span>
            </label>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full mt-6 shadow-brand py-6 text-base"
            size="lg"
          >
            {loading ? "Processing…" : "Analyse My Data"}
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default DNAUpload;
