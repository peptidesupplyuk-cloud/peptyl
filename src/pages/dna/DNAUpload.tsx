import { useState, useCallback, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { FileText, Upload, Camera, MessageSquare, X, CheckCircle2, Loader2, ChevronDown, ChevronUp, CreditCard, FlaskConical, AlertCircle, Sparkles, Shield, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import { useBloodworkPanels } from "@/hooks/use-bloodwork";
import BloodworkForm from "@/components/dashboard/BloodworkForm";
import { BIOMARKERS } from "@/data/biomarker-ranges";

const TARGET_RSIDS = new Set([
  "rs429358", "rs7412", "rs1801133", "rs1801131", "rs731236", "rs1544410",
  "rs2228570", "rs3892097", "rs1056836", "rs4680", "rs9939609", "rs12934922",
  "rs7501331", "rs7903146", "rs4880", "rs1695", "rs6923761", "rs10305420",
  "rs17782313", "rs1137101", "rs10423928", "rs1800012", "rs12722", "rs1815739",
  "rs35767", "rs1800795", "rs1800629", "rs2070744", "rs2010963",
]);

type Method = "pdf" | "raw23andme" | "text" | "image";

const tabs: { id: Method; label: string; icon: any; hint: string }[] = [
  { id: "pdf", label: "PDF Report", icon: FileText, hint: "Lab or genetic report" },
  { id: "raw23andme", label: "23andMe / Ancestry", icon: Upload, hint: "Raw data .txt file" },
  { id: "image", label: "Photo", icon: Camera, hint: "Snap your results" },
  { id: "text", label: "Paste Text", icon: MessageSquare, hint: "Copy and paste" },
];

const goalOptions = [
  "General wellness",
  "Weight management",
  "Athletic performance",
  "Longevity",
  "Recovery",
  "Hormonal health",
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const DNAUpload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const tier = (searchParams.get("tier") ?? "standard") as "standard" | "advanced" | "pro";

  const [method, setMethod] = useState<Method>("pdf");
  const [inputText, setInputText] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);
  const [consent3, setConsent3] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [checkingUnlock, setCheckingUnlock] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const [showLifestyle, setShowLifestyle] = useState(false);
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [bp, setBp] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [medications, setMedications] = useState("");

  const { data: panels = [] } = useBloodworkPanels();
  const [showBloodworkEntry, setShowBloodworkEntry] = useState(false);
  const [bloodworkSaved, setBloodworkSaved] = useState(false);
  const [showBloodworkDetails, setShowBloodworkDetails] = useState(false);

  const latestPanel = panels[0] ?? null;
  const latestPanelDate = latestPanel?.test_date
    ? new Date(latestPanel.test_date).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      })
    : null;

  useEffect(() => {
    if (!user) { setCheckingUnlock(false); setIsUnlocked(false); return; }
    const checkUnlock = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("dna_standard_unlocked, dna_advanced_unlocked, dna_assessment_unlocked, height_cm, weight_kg, age, gender, bp_systolic, bp_diastolic, primary_health_goal, current_medications, research_goal")
        .eq("user_id", user.id)
        .single();
      const p = profile as any;
      const hasPermanentUnlock = !!p?.dna_assessment_unlocked;
      const unlocked = tier === "advanced" || tier === "pro"
        ? true
        : (hasPermanentUnlock || !!p?.dna_standard_unlocked);
      setIsUnlocked(unlocked);
      if (p?.height_cm) setHeightCm(String(p.height_cm));
      if (p?.weight_kg) setWeightKg(String(p.weight_kg));
      if (p?.age) setAge(String(p.age));
      if (p?.gender) setSex(p.gender);
      if (p?.bp_systolic && p?.bp_diastolic) setBp(`${p.bp_systolic}/${p.bp_diastolic}`);
      if (p?.primary_health_goal) setPrimaryGoal(p.primary_health_goal);
      else if (p?.research_goal) setPrimaryGoal(p.research_goal);
      if (p?.current_medications) setMedications(p.current_medications);
      setCheckingUnlock(false);
    };
    checkUnlock();
  }, [user, tier]);

  const handlePurchase = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to purchase.", variant: "destructive" });
      navigate(`/auth?redirect=${encodeURIComponent(`/dna/upload?tier=${tier}`)}`);
      return;
    }
    setPurchasing(true);
    try {
      const product = tier === "pro" ? "dna_pro" : tier === "advanced" ? "dna_advanced" : "dna_standard";
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
      reader.onload = () => { setImageBase64(reader.result as string); setInputText(`[Image: ${file.name}]`); };
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
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const canSubmit = consent1 && consent2 && consent3 && !loading && (inputText.trim().length >= 10 || !!imageBase64);

  const buildBloodworkContext = (panel: typeof latestPanel) => {
    if (!panel || panel.markers.length === 0) return null;
    const ctx: Record<string, { value: number; unit: string; name: string }> = {};
    for (const m of panel.markers) ctx[m.marker_name] = { value: m.value, unit: m.unit, name: m.marker_name };
    return { test_date: panel.test_date, panel_type: panel.panel_type, markers: ctx };
  };

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
    const bloodwork = buildBloodworkContext(latestPanel);
    if (bloodwork) ctx.bloodwork = bloodwork;
    return Object.keys(ctx).length > 0 ? ctx : null;
  };

  const handleBloodworkSaved = () => {
    setBloodworkSaved(true);
    setShowBloodworkEntry(false);
    toast({ title: "Bloodwork saved", description: "Your results will be included in the assessment." });
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to analyse your DNA data.", variant: "destructive" });
      navigate(`/auth?redirect=${encodeURIComponent(`/dna/upload?tier=${tier}`)}`);
      return;
    }
    await supabase.from("dna_consents").insert({ user_id: user.id, feature: "dna_analysis", consent_version: "2.0" } as any);
    const lifestyleContext = buildLifestyleContext();
    const { data: newReport, error: insertErr } = await supabase
      .from("dna_reports")
      .insert({ user_id: user.id, input_method: method, report_json: {}, assessment_tier: tier, lifestyle_context: lifestyleContext, pipeline_status: "queued", pipeline_progress: 0 })
      .select("id")
      .single();
    if (insertErr || !newReport) {
      toast({ title: "Could not start analysis", description: insertErr?.message || "Please try again.", variant: "destructive" });
      return;
    }
    navigate("/dna/questionnaire", {
      state: { inputText: method === "image" ? "" : inputText, imageBase64: method === "image" ? imageBase64 : null, method, userId: user.id, tier, lifestyleContext, reportId: newReport.id },
    });
  };

  const clearFile = () => { setFileName(null); setInputText(""); setImageBase64(null); };

  const tierLabel = tier === "pro" ? "Pro" : tier === "advanced" ? "Advanced" : "Standard";
  const tierPrice = tier === "pro" ? "£59.99" : tier === "advanced" ? "£29.99" : "£14.99";

  if (checkingUnlock) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 flex items-center justify-center bg-background">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Preparing your assessment...</p>
          </motion.div>
        </main>
      </>
    );
  }

  // Paywall
  if (!isUnlocked && user) {
    return (
      <>
        <SEO title={`Unlock ${tierLabel} Health Assessment | Peptyl`} description="Purchase your holistic health assessment." path="/dna/upload" />
        <Header />
        <main className="min-h-screen pt-24 pb-16 bg-background">
          <div className="container mx-auto px-6 max-w-md text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-8"
              style={{ boxShadow: "var(--shadow-lg)" }}
            >
              <div className="absolute inset-0 opacity-[0.03]" style={{ background: "var(--gradient-teal)" }} />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: "var(--gradient-teal)" }}>
                  <Sparkles className="h-7 w-7 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
                  Unlock Your {tierLabel} Report
                </h1>
                <div className="text-4xl font-heading font-bold text-primary my-4">{tierPrice}</div>
                <ul className="text-sm text-muted-foreground space-y-3 text-left mb-6">
                  {tier === "advanced" ? (
                    <>
                      <li className="flex items-start gap-2.5"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Full supplement + peptide protocol</li>
                      <li className="flex items-start gap-2.5"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> GLP-1 weight management assessment</li>
                      <li className="flex items-start gap-2.5"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Deep personalisation + GP talking points</li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-2.5"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Health score + gene variant analysis</li>
                      <li className="flex items-start gap-2.5"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Personalised supplement protocol</li>
                      <li className="flex items-start gap-2.5"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Drug interaction flags + action plan</li>
                    </>
                  )}
                </ul>
                <Button onClick={handlePurchase} disabled={purchasing} className="w-full py-6 text-base" size="lg" style={{ boxShadow: "var(--shadow-teal)" }}>
                  {purchasing ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>) : (<><CreditCard className="mr-2 h-5 w-5" /> Pay with GoCardless</>)}
                </Button>
                <button onClick={() => window.location.reload()} className="text-xs text-muted-foreground mt-3 underline underline-offset-2 hover:text-foreground">
                  Already paid? Refresh this page
                </button>
                <p className="text-xs text-muted-foreground mt-3">Secure payment via GoCardless. One-time charge.</p>
              </div>
            </motion.div>
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
        <main className="min-h-screen pt-24 pb-16 bg-background flex items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md px-6">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-primary/10">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-3">Sign in to continue</h1>
            <p className="text-muted-foreground text-sm mb-6">You need an account to run a health assessment.</p>
            <Link to="/auth">
              <Button size="lg" className="px-8" style={{ boxShadow: "var(--shadow-teal)" }}>Sign In / Sign Up</Button>
            </Link>
          </motion.div>
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
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="container mx-auto px-6 max-w-2xl"
        >
          {/* Hero heading area */}
          <motion.div variants={fadeUp} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
                tier === "pro"
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  : tier === "advanced"
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-muted text-muted-foreground border-border"
              }`}>
                <Sparkles className="h-3 w-3" />
                {tierLabel} Assessment
              </span>
              <Link to="/dna" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Change
              </Link>
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground tracking-tight mb-2">
              Upload Your Data
            </h1>
            <p className="text-muted-foreground text-base">
              Choose how you'd like to provide your genetic or health data.
            </p>
          </motion.div>

          {/* Bloodwork integration */}
          <motion.div variants={fadeUp}>
            {latestPanel && latestPanel.markers.length > 0 ? (
              <div className="mb-6 rounded-xl overflow-hidden border border-primary/20" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-sm)" }}>
                <button
                  onClick={() => setShowBloodworkDetails(!showBloodworkDetails)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-primary/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--gradient-teal)" }}>
                      <FlaskConical className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">
                        Bloodwork included
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {latestPanel.markers.length} markers from {latestPanelDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-[11px] font-semibold tracking-wide uppercase text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      Active
                    </span>
                    {showBloodworkDetails ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>
                <AnimatePresence>
                  {showBloodworkDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 border-t border-border/50">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                          {latestPanel.markers.map((m) => {
                            const def = BIOMARKERS.find((b) => b.key === m.marker_name);
                            return (
                              <div key={m.marker_name} className="bg-muted/40 rounded-lg px-3 py-2.5">
                                <p className="text-[11px] text-muted-foreground truncate">{def?.name ?? m.marker_name}</p>
                                <p className="text-sm font-semibold text-foreground tabular-nums">
                                  {m.value} <span className="text-[11px] font-normal text-muted-foreground">{m.unit}</span>
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : bloodworkSaved ? (
              <div className="mb-6 flex items-center gap-3 rounded-xl px-5 py-4 border border-primary/20" style={{ background: "var(--gradient-card)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm text-foreground font-medium">Bloodwork saved and included in your assessment.</p>
              </div>
            ) : showBloodworkEntry ? (
              <div className="mb-6 rounded-xl overflow-hidden border border-border" style={{ boxShadow: "var(--shadow-sm)" }}>
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-2.5">
                    <FlaskConical className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold text-foreground">Add your blood results</p>
                  </div>
                  <button onClick={() => setShowBloodworkEntry(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                    Upload a PDF or enter values manually. All markers including hormones, thyroid, and metabolic panels are supported.
                  </p>
                  <BloodworkForm onSaved={handleBloodworkSaved} />
                </div>
              </div>
            ) : (
              <div className="mb-6 rounded-xl px-5 py-4 border border-border bg-card" style={{ boxShadow: "var(--shadow-sm)" }}>
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-muted shrink-0 mt-0.5">
                    <FlaskConical className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">No bloodwork on file</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      DNA + bloodwork together produce significantly more accurate protocols. Your current biomarkers confirm whether genetic variants are actively affecting you.
                    </p>
                    <button
                      onClick={() => setShowBloodworkEntry(true)}
                      className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold mt-2.5 hover:underline transition-colors"
                    >
                      Add blood results now
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Method tabs - card-style */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
            {tabs.map((t) => {
              const isActive = method === t.id;
              return (
                <motion.button
                  key={t.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setMethod(t.id); clearFile(); }}
                  className={`relative flex flex-col items-center gap-1.5 px-3 py-4 rounded-xl text-center transition-all duration-200 border ${
                    isActive
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "bg-card border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"
                  }`}
                  style={isActive ? { boxShadow: "var(--shadow-teal)" } : { boxShadow: "var(--shadow-sm)" }}
                >
                  <t.icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                  <span className="text-xs font-semibold">{t.label}</span>
                  <span className="text-[10px] text-muted-foreground">{t.hint}</span>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Upload area */}
          <motion.div variants={fadeUp}>
            {method !== "text" ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer border-2 border-dashed ${
                  dragOver
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : fileName
                    ? "border-primary/30 bg-primary/[0.03]"
                    : "border-border bg-card hover:border-primary/30 hover:bg-primary/[0.02]"
                }`}
                style={{ boxShadow: dragOver ? "var(--shadow-teal)" : "var(--shadow-sm)" }}
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
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-teal)" }}>
                      <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="text-foreground font-semibold text-sm">{fileName}</p>
                      <p className="text-xs text-muted-foreground">File ready for analysis</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); clearFile(); }} className="ml-2 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-semibold mb-1">
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
                className="w-full bg-card border border-border rounded-xl px-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all resize-none text-sm"
                style={{ boxShadow: "var(--shadow-sm)" }}
              />
            )}

            {inputText && (
              <p className="text-xs text-muted-foreground mt-2 tabular-nums">{inputText.length.toLocaleString()} characters</p>
            )}

            {method === "image" && imageBase64 && (
              <div className="mt-3 bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-xs text-muted-foreground">
                Results parsed from images should be verified manually for accuracy.
              </div>
            )}
          </motion.div>

          {/* Lifestyle Context */}
          <motion.div variants={fadeUp} className="mt-6">
            <div className="rounded-xl overflow-hidden border border-border bg-card" style={{ boxShadow: "var(--shadow-sm)" }}>
              <button
                onClick={() => setShowLifestyle(!showLifestyle)}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-foreground hover:bg-muted/30 transition-colors"
              >
                <span>Add health context for a more complete assessment</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Optional</span>
                  {showLifestyle ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>
              <AnimatePresence>
                {showLifestyle && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-4 border-t border-border/50">
                      <p className="text-xs text-muted-foreground pt-3 leading-relaxed">
                        This context helps us generate more relevant recommendations.
                        {tier === "advanced" && " Advanced tier uses this for the GLP-1 assessment and personalisation layer."}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Age</label>
                          <Input type="number" placeholder="e.g. 35" value={age} onChange={(e) => setAge(e.target.value)} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Biological sex</label>
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
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Height (cm)</label>
                          <Input type="number" placeholder="e.g. 175" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Weight (kg)</label>
                          <Input type="number" placeholder="e.g. 80" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Blood pressure</label>
                          <Input placeholder="e.g. 135/85" value={bp} onChange={(e) => setBp(e.target.value)} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Primary health goal</label>
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
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Current medications</label>
                        <Textarea rows={2} placeholder="e.g. Metformin, Atorvastatin" value={medications} onChange={(e) => setMedications(e.target.value)} />
                      </div>
                      {heightCm && weightKg && (
                        <p className="text-xs text-muted-foreground">
                          Calculated BMI: <span className="font-semibold text-foreground tabular-nums">{(parseFloat(weightKg) / ((parseFloat(heightCm) / 100) ** 2)).toFixed(1)}</span>
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Consent */}
          <motion.div variants={fadeUp} className="mt-8">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4" style={{ boxShadow: "var(--shadow-sm)" }}>
              <div className="flex items-center gap-2.5">
                <Shield className="h-4 w-4 text-primary" />
                <p className="font-semibold text-foreground text-sm">Before you continue</p>
              </div>
              <p className="text-xs text-muted-foreground -mt-1">Your genetic data is sensitive. Please confirm you understand how it will be used.</p>

              <label className="flex items-start gap-3 cursor-pointer group">
                <Checkbox checked={consent1} onCheckedChange={(v) => setConsent1(!!v)} className="mt-0.5" />
                <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                  I explicitly consent to my genetic data being processed by AI for the sole purpose of generating a personalised educational health report. I understand this is special category data under UK GDPR Article 9.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <Checkbox checked={consent2} onCheckedChange={(v) => setConsent2(!!v)} className="mt-0.5" />
                <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                  I understand this report is for educational purposes only. It is not medical advice, a diagnosis, or a clinical assessment. Peptyl is not operated by medical professionals. I will not use this report to make decisions about medications, treatments, or clinical interventions without consulting a qualified healthcare professional.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <Checkbox checked={consent3} onCheckedChange={(v) => setConsent3(!!v)} className="mt-0.5" />
                <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                  I have read and agree to the{" "}
                  <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
                  {" "}and{" "}
                  <Link to="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link>
                  , and I understand I can delete my report at any time from my assessments page.
                </span>
              </label>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div variants={fadeUp} className="mt-6">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full py-6 text-base font-semibold group"
              size="lg"
              style={{ boxShadow: canSubmit ? "var(--shadow-teal)" : undefined }}
            >
              {loading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
              ) : (
                <>
                  Analyse My Data
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground mt-3">
              Your data is encrypted and processed securely. We never share or sell genetic information.
            </p>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
};

export default DNAUpload;
