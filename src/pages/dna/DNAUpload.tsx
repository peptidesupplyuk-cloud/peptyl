import { useState, useCallback, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { FileText, Upload, Camera, MessageSquare, X, CheckCircle2, Loader2, ChevronDown, ChevronUp, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TARGET_RSIDS = new Set([
  // Original SNPs
  "rs429358", "rs7412",
  "rs1801133", "rs1801131",
  "rs731236", "rs1544410", "rs2228570",
  "rs3892097",
  "rs1056836",
  "rs4680",
  "rs9939609",
  "rs12934922", "rs7501331",
  "rs7903146", "rs4880", "rs1695",
  // NEW: Metabolic / GLP-1
  "rs6923761",
  "rs10305420",
  "rs17782313",
  "rs1137101",
  "rs10423928",
  // NEW: Tissue Repair / Peptide
  "rs1800012",
  "rs12722",
  "rs1815739",
  "rs35767",
  "rs1800795",
  "rs1800629",
  "rs2070744",
  "rs2010963",
]);

type Method = "pdf" | "raw23andme" | "text" | "image";

const tabs: { id: Method; label: string; icon: any }[] = [
  { id: "pdf", label: "PDF Report", icon: FileText },
  { id: "raw23andme", label: "23andMe / Ancestry", icon: Upload },
  { id: "image", label: "Photo", icon: Camera },
  { id: "text", label: "Paste Text", icon: MessageSquare },
];

const goalOptions = [
  "General wellness",
  "Weight management",
  "Athletic performance",
  "Longevity",
  "Recovery",
  "Hormonal health",
];

const DNAUpload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const tier = (searchParams.get("tier") ?? "standard") as "standard" | "advanced";

  const [method, setMethod] = useState<Method>("pdf");
  const [inputText, setInputText] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);
  const [consent3, setConsent3] = useState(false);
  const [loading, setLoading] = useState(false);

  // Payment gate
  const [checkingUnlock, setCheckingUnlock] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  // Lifestyle context
  const [showLifestyle, setShowLifestyle] = useState(false);
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [bp, setBp] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [medications, setMedications] = useState("");

  // Check unlock status
  useEffect(() => {
    if (!user) {
      setCheckingUnlock(false);
      setIsUnlocked(false);
      return;
    }
    const checkUnlock = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("dna_standard_unlocked, dna_advanced_unlocked, height_cm, weight_kg")
        .eq("user_id", user.id)
        .single();

      const unlocked = tier === "advanced"
        ? !!(profile as any)?.dna_advanced_unlocked
        : !!(profile as any)?.dna_standard_unlocked;
      setIsUnlocked(unlocked);

      // Pre-fill from profile
      if ((profile as any)?.height_cm) setHeightCm(String((profile as any).height_cm));
      if ((profile as any)?.weight_kg) setWeightKg(String((profile as any).weight_kg));

      setCheckingUnlock(false);
    };
    checkUnlock();
  }, [user, tier]);

  const handlePurchase = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to purchase.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    setPurchasing(true);
    try {
      const product = tier === "advanced" ? "dna_advanced" : "dna_standard";
      const { data, error } = await supabase.functions.invoke("create-gocardless-payment", {
        body: { product },
      });
      if (error || !data?.authorisation_url) {
        throw new Error(error?.message || "No authorisation URL returned");
      }
      window.location.href = data.authorisation_url;
    } catch (err: any) {
      console.error(err);
      toast({ title: "Payment error", description: err.message || "Could not start payment.", variant: "destructive" });
      setPurchasing(false);
    }
  };

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

  const buildLifestyleContext = () => {
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    const bmi = h && w ? (w / ((h / 100) ** 2)).toFixed(1) : undefined;

    const ctx: any = {};
    if (age) ctx.age = parseInt(age);
    if (sex) ctx.sex = sex;
    if (h) ctx.height_cm = h;
    if (w) ctx.weight_kg = w;
    if (bmi) ctx.bmi = parseFloat(bmi);
    if (bp) ctx.bp = bp;
    if (primaryGoal) ctx.primary_goal = primaryGoal;
    if (medications) ctx.medications = medications;

    return Object.keys(ctx).length > 0 ? ctx : null;
  };

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

    const lifestyleContext = buildLifestyleContext();

    navigate("/dna/analysing", {
      state: {
        inputText: method === "image" ? "" : inputText,
        imageBase64: method === "image" ? imageBase64 : null,
        method,
        userId: user.id,
        tier,
        lifestyleContext,
      },
    });
  };

  const clearFile = () => {
    setFileName(null);
    setInputText("");
    setImageBase64(null);
  };

  const tierLabel = tier === "advanced" ? "Advanced" : "Standard";
  const tierPrice = tier === "advanced" ? "£39.99" : "£19.99";

  // Show loading while checking
  if (checkingUnlock) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 flex items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </main>
      </>
    );
  }

  // Paywall
  if (!isUnlocked && user) {
    return (
      <>
        <SEO title={`Unlock ${tierLabel} DNA Assessment | Peptyl`} description="Purchase your DNA health assessment." path="/dna/upload" />
        <Header />
        <main className="min-h-screen pt-24 pb-16 bg-background">
          <div className="container mx-auto px-6 max-w-md text-center">
            <div className="bg-card border border-border rounded-2xl p-8">
              <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
                Unlock Your {tierLabel} Report
              </h1>
              <div className="text-4xl font-heading font-bold text-primary my-4">{tierPrice}</div>
              <ul className="text-sm text-muted-foreground space-y-2 text-left mb-6">
                {tier === "advanced" ? (
                  <>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Full supplement + peptide protocol</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> GLP-1 weight management assessment</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Deep personalisation + GP talking points</li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Health score + gene variant analysis</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Personalised supplement protocol</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Drug interaction flags + action plan</li>
                  </>
                )}
              </ul>
              <Button
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full shadow-brand py-6 text-base"
                size="lg"
              >
                {purchasing ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                ) : (
                  <><CreditCard className="mr-2 h-5 w-5" /> Pay with GoCardless</>
                )}
              </Button>
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-muted-foreground mt-3 underline underline-offset-2 hover:text-foreground"
              >
                Already paid? Refresh this page
              </button>
              <p className="text-xs text-muted-foreground mt-3">Secure payment via GoCardless. One-time charge.</p>
            </div>
            <Link to="/dna" className="text-xs text-muted-foreground mt-4 inline-block underline underline-offset-2 hover:text-foreground">
              Change tier
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Auth gate
  if (!user) {
    return (
      <>
        <SEO title="Upload DNA Data | Peptyl" description="Sign in to upload your genetic data." path="/dna/upload" />
        <Header />
        <main className="min-h-screen pt-24 pb-16 bg-background">
          <div className="container mx-auto px-6 max-w-md text-center">
            <h1 className="text-2xl font-heading font-bold text-foreground mb-4">Sign in to continue</h1>
            <p className="text-muted-foreground text-sm mb-6">You need an account to run a DNA analysis.</p>
            <Link to="/auth">
              <Button className="shadow-brand">Sign In / Sign Up</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO title="Upload DNA Data | Peptyl" description="Upload your genetic data for AI-powered health analysis." path="/dna/upload" />
      <Header />
      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-6 max-w-2xl">
          {/* Tier badge */}
          <div className="flex items-center gap-3 mb-6">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
              tier === "advanced"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}>
              {tier === "advanced" ? `Advanced Assessment — ${tierPrice} ✦` : `Standard Assessment — ${tierPrice}`}
            </span>
            <Link to="/dna" className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground">
              Change tier
            </Link>
          </div>

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

          {inputText && (
            <p className="text-xs text-muted-foreground mt-2">{inputText.length} characters</p>
          )}

          {method === "image" && imageBase64 && (
            <div className="mt-3 bg-accent/50 border border-accent-foreground/10 rounded-lg px-4 py-2 text-xs text-accent-foreground">
              Results parsed from images should be verified manually for accuracy.
            </div>
          )}

          {/* Lifestyle Context (optional) */}
          <div className="mt-6 bg-card border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setShowLifestyle(!showLifestyle)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/30 transition-colors"
            >
              <span>Add health context for a more complete assessment (optional)</span>
              {showLifestyle ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
            {showLifestyle && (
              <div className="px-4 pb-4 space-y-4">
                <p className="text-xs text-muted-foreground">
                  This context helps us generate more relevant recommendations.
                  {tier === "advanced" && " Advanced tier uses this for the GLP-1 assessment and personalisation layer."}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Age</label>
                    <Input type="number" placeholder="e.g. 35" value={age} onChange={(e) => setAge(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Biological sex</label>
                    <Select value={sex} onValueChange={setSex}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Height (cm)</label>
                    <Input type="number" placeholder="e.g. 175" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Weight (kg)</label>
                    <Input type="number" placeholder="e.g. 80" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Blood pressure (optional)</label>
                    <Input placeholder="e.g. 135/85" value={bp} onChange={(e) => setBp(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Primary health goal</label>
                    <Select value={primaryGoal} onValueChange={setPrimaryGoal}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {goalOptions.map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Current medications (optional)</label>
                  <Textarea rows={2} placeholder="e.g. Metformin, Atorvastatin" value={medications} onChange={(e) => setMedications(e.target.value)} />
                </div>
                {heightCm && weightKg && (
                  <p className="text-xs text-muted-foreground">
                    Calculated BMI: <span className="font-medium text-foreground">{(parseFloat(weightKg) / ((parseFloat(heightCm) / 100) ** 2)).toFixed(1)}</span>
                  </p>
                )}
              </div>
            )}
          </div>

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
            {loading ? "Processing..." : "Analyse My Data"}
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default DNAUpload;
