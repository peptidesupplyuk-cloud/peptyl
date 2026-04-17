import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateProtocol, type ProtocolSupplement } from "@/hooks/use-protocols";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FlaskConical, Lock, CheckCircle2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Supplement {
  supplement: string;
  dose: string;
  timing: string;
  evidence_grade: string;
  driven_by?: string[];
  caution?: string;
  is_priority?: boolean;
}

interface PeptideItem {
  peptide: string;
  dose: string;
  route: string;
  duration: string;
  evidence_grade: string;
  driven_by?: string[] | string;
  use_case?: string;
  is_priority?: boolean;
}

interface Props {
  supplements: any[];
  peptides?: any[];
  reportId: string;
  isPaid?: boolean;
}

const toArr = (v: any): string[] => {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  return [String(v)];
};

const normaliseSupp = (s: any): Supplement => ({
  supplement: s?.supplement ?? s?.name ?? s?.compound ?? "Unnamed supplement",
  dose: s?.dose ?? s?.dosage ?? s?.dosage_range ?? s?.amount ?? "—",
  timing: s?.timing ?? s?.frequency ?? s?.when ?? "daily",
  evidence_grade: s?.evidence_grade ?? s?.grade ?? s?.evidence ?? "B",
  driven_by: toArr(s?.driven_by ?? s?.drivers ?? s?.rationale_genes),
  caution: s?.caution,
  is_priority: s?.is_priority,
});

const normalisePep = (p: any): PeptideItem => ({
  peptide: p?.peptide ?? p?.name ?? p?.peptide_name ?? p?.compound ?? "Unnamed peptide",
  dose: p?.dose ?? p?.dosage ?? p?.dosage_range ?? p?.amount ?? "—",
  route: p?.route ?? p?.administration ?? "Subcutaneous injection",
  duration: p?.duration ?? p?.cycle_duration ?? p?.cycle ?? "",
  evidence_grade: p?.evidence_grade ?? p?.grade ?? p?.evidence ?? "B",
  driven_by: toArr(p?.driven_by ?? p?.drivers),
  use_case: p?.use_case ?? p?.indication ?? "",
  is_priority: p?.is_priority,
});

const gradeColor = (g: string) => {
  if (g === "A") return "bg-primary/10 text-primary";
  if (g === "B") return "bg-blue-500/10 text-blue-600";
  if (g === "C") return "bg-amber-500/10 text-amber-600";
  return "bg-muted text-muted-foreground";
};

const parseDoseMcg = (dose: string): number => {
  const match = dose.match(/([\d.]+)\s*(mcg|mg|g)/i);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === "mg") return val * 1000;
  if (unit === "g") return val * 1000000;
  return val;
};

const CreateProtocolFromReport = ({ supplements, peptides = [], reportId, isPaid = true }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createProtocol = useCreateProtocol();
  const today = format(new Date(), "yyyy-MM-dd");

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(`DNA Health Protocol - ${format(new Date(), "MMM yyyy")}`);
  const [startDate, setStartDate] = useState(today);
  const [showSuppSuggestions, setShowSuppSuggestions] = useState(false);
  const [showPepSuggestions, setShowPepSuggestions] = useState(false);

  const normSupps = (supplements || []).map(normaliseSupp);
  const normPeps = (peptides || []).map(normalisePep);

  const hasSuppFlag = normSupps.some(s => s.is_priority !== undefined);
  const prioritySupps = hasSuppFlag ? normSupps.filter(s => s.is_priority) : normSupps.slice(0, 5);
  const suggestionSupps = hasSuppFlag ? normSupps.filter(s => !s.is_priority) : normSupps.slice(5);

  const hasPepFlag = normPeps.some(p => p.is_priority !== undefined);
  const priorityPeps = hasPepFlag ? normPeps.filter(p => p.is_priority) : normPeps.slice(0, 3);
  const suggestionPeps = hasPepFlag ? normPeps.filter(p => !p.is_priority) : normPeps.slice(3);

  const [suppSelected, setSuppSelected] = useState<boolean[]>(() => [
    ...prioritySupps.map(() => true),
    ...suggestionSupps.map(() => false),
  ]);
  const [pepSelected, setPepSelected] = useState<boolean[]>(() => [
    ...priorityPeps.map(() => true),
    ...suggestionPeps.map(() => false),
  ]);

  const allSupps = [...prioritySupps, ...suggestionSupps];
  const allPeps = [...priorityPeps, ...suggestionPeps];

  const selectedSuppCount = suppSelected.filter(Boolean).length;
  const selectedPepCount = pepSelected.filter(Boolean).length;

  const [showNudge, setShowNudge] = useState(false);
  const [createdProtocolId, setCreatedProtocolId] = useState<string | null>(null);
  const [createdProtocolName, setCreatedProtocolName] = useState("");

  if (!user) return null;

  if (!isPaid) {
    return (
      <Button variant="outline" className="w-full border-border text-muted-foreground gap-2 cursor-not-allowed opacity-70" disabled>
        <Lock className="h-4 w-4" />
        Unlock with DNA Report
      </Button>
    );
  }

  const toggleSupp = (i: number) => setSuppSelected(prev => { const n = [...prev]; n[i] = !n[i]; return n; });
  const togglePep = (i: number) => setPepSelected(prev => { const n = [...prev]; n[i] = !n[i]; return n; });

  const handleCreate = async () => {
    const chosenSupps = allSupps.filter((_, i) => suppSelected[i]);
    const chosenPeps = allPeps.filter((_, i) => pepSelected[i]);

    if (chosenSupps.length === 0 && chosenPeps.length === 0) {
      toast({ title: "Select at least one item", variant: "destructive" });
      return;
    }

    const supps: ProtocolSupplement[] = chosenSupps.map(s => ({
      name: s.supplement,
      dose: s.dose,
      frequency: "daily",
      drivenBy: s.driven_by || [],
    }));

    const pepsPayload = chosenPeps.map(p => ({
      peptide_name: p.peptide,
      dose_mcg: parseDoseMcg(p.dose),
      frequency: "daily",
      timing: null as string | null,
      route: p.route || "Subcutaneous injection",
    }));

    try {
      const protocol = await createProtocol.mutateAsync({
        name,
        goal: "DNA-driven health optimisation",
        startDate,
        peptides: pepsPayload,
        supplements: supps,
        notes: `Auto-generated from DNA report ${reportId}`,
      });
      toast({ title: "Protocol created", description: "Your DNA-based protocol is now active." });
      setOpen(false);
      setCreatedProtocolId(protocol.id);
      setCreatedProtocolName(name);
      setShowNudge(true);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const SectionItem = ({
    label,
    sublabel,
    grade,
    checked,
    onToggle,
    isSuggestion = false,
  }: {
    label: string;
    sublabel: string;
    grade: string;
    checked: boolean;
    onToggle: () => void;
    isSuggestion?: boolean;
  }) => (
    <label className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
      checked
        ? "border-primary/30 bg-primary/5"
        : "border-border hover:bg-muted/20"
    }`}>
      <Checkbox checked={checked} onCheckedChange={onToggle} className="mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {isSuggestion && (
            <span className="text-[10px] text-muted-foreground">After cycle 1</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
      </div>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${gradeColor(grade)}`}>
        {grade}
      </span>
    </label>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <FlaskConical className="h-4 w-4" />
            Build My Protocol from This Report
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Build Your Protocol</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Priority items are pre-selected. Add suggestions when you're ready to expand.
            </p>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {/* Name + date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block uppercase tracking-wide">Protocol Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block uppercase tracking-wide">Start Date</label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="flex items-end">
                <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 w-full">
                  <span className="font-medium text-foreground">{selectedSuppCount}</span> supplement{selectedSuppCount !== 1 ? "s" : ""} +{" "}
                  <span className="font-medium text-foreground">{selectedPepCount}</span> peptide{selectedPepCount !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* SUPPLEMENTS */}
            {allSupps.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">Supplements</label>
                  <span className="text-xs text-muted-foreground">{selectedSuppCount} selected</span>
                </div>

                <div className="space-y-2">
                  {prioritySupps.map((s, i) => (
                    <SectionItem
                      key={i}
                      label={s.supplement}
                      sublabel={`${s.dose} · ${s.timing}`}
                      grade={s.evidence_grade}
                      checked={suppSelected[i]}
                      onToggle={() => toggleSupp(i)}
                    />
                  ))}
                </div>

                {suggestionSupps.length > 0 && (
                  <div className="border border-border/50 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowSuppSuggestions(!showSuppSuggestions)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">
                          {suggestionSupps.length} suggestions - after first 90 days
                        </span>
                      </div>
                      {showSuppSuggestions
                        ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                        : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      }
                    </button>
                    {showSuppSuggestions && (
                      <div className="p-2 space-y-2 border-t border-border/50">
                        {suggestionSupps.map((s, i) => (
                          <SectionItem
                            key={i}
                            label={s.supplement}
                            sublabel={`${s.dose} · ${s.timing}`}
                            grade={s.evidence_grade}
                            checked={suppSelected[prioritySupps.length + i]}
                            onToggle={() => toggleSupp(prioritySupps.length + i)}
                            isSuggestion
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* PEPTIDES */}
            {allPeps.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">Research Peptides</label>
                  <span className="text-xs text-muted-foreground">{selectedPepCount} selected</span>
                </div>

                <div className="space-y-2">
                  {priorityPeps.map((p, i) => (
                    <SectionItem
                      key={i}
                      label={p.peptide}
                      sublabel={`${p.dose} · ${p.route}`}
                      grade={p.evidence_grade}
                      checked={pepSelected[i]}
                      onToggle={() => togglePep(i)}
                    />
                  ))}
                </div>

                {suggestionPeps.length > 0 && (
                  <div className="border border-border/50 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowPepSuggestions(!showPepSuggestions)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">
                          {suggestionPeps.length} peptide suggestion{suggestionPeps.length > 1 ? "s" : ""} - after first cycle
                        </span>
                      </div>
                      {showPepSuggestions
                        ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                        : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      }
                    </button>
                    {showPepSuggestions && (
                      <div className="p-2 space-y-2 border-t border-border/50">
                        {suggestionPeps.map((p, i) => (
                          <SectionItem
                            key={i}
                            label={p.peptide}
                            sublabel={`${p.dose} · ${p.route}`}
                            grade={p.evidence_grade}
                            checked={pepSelected[priorityPeps.length + i]}
                            onToggle={() => togglePep(priorityPeps.length + i)}
                            isSuggestion
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <p className="text-[11px] text-muted-foreground px-1">
                  Research compounds only. Not licensed for human use in UK. Consult a healthcare professional.
                </p>
              </div>
            )}

            <Button
              onClick={handleCreate}
              disabled={createProtocol.isPending || (selectedSuppCount + selectedPepCount) === 0}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              {createProtocol.isPending ? "Creating..." : `Create Protocol (${selectedSuppCount + selectedPepCount} items)`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post-creation baseline nudge */}
      {showNudge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#070B14] max-w-md w-full mx-4 rounded-2xl border border-border p-6 space-y-5">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-foreground">Protocol created</h2>
              <p className="text-sm text-muted-foreground">{createdProtocolName} is now active</p>
            </div>

            <div className="border-l-4 border-primary bg-primary/5 pl-4 py-3 rounded-r-xl">
              <p className="text-sm text-foreground">
                Log your baseline bloods before you start. Without a baseline, Peptyl can't calculate
                what changed at the end of your protocol.
              </p>
            </div>

            <div className="space-y-2">
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                onClick={() => {
                  setShowNudge(false);
                  navigate(`/dashboard?tab=bloodwork&protocolId=${createdProtocolId}`);
                }}
              >
                Log Baseline Bloods Now
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => {
                  if (createdProtocolId) {
                    localStorage.setItem(`baseline_pending_${createdProtocolId}`, "true");
                  }
                  setShowNudge(false);
                  navigate("/dashboard");
                }}
              >
                I'll do it in the next day or two
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateProtocolFromReport;
