import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateProtocol, type ProtocolSupplement } from "@/hooks/use-protocols";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FlaskConical, Lock, CheckCircle2, Layers } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Supplement {
  supplement: string;
  dose: string;
  timing: string;
  evidence_grade: string;
  driven_by?: string[];
  caution?: string;
}

interface Peptide {
  peptide: string;
  dose: string;
  route?: string;
  duration?: string;
  evidence_grade?: string;
  driven_by?: string[];
}

interface Props {
  supplements: Supplement[];
  peptides?: Peptide[];
  reportId: string;
  isPaid?: boolean;
  geneticArchetype?: string;
}

const CreateProtocolFromReport = ({ supplements, peptides = [], reportId, isPaid = true, geneticArchetype }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createProtocol = useCreateProtocol();
  const today = format(new Date(), "yyyy-MM-dd");

  const defaultName = geneticArchetype
    ? `${geneticArchetype} Protocol — ${format(new Date(), "dd MMM yyyy")}`
    : `DNA Health Protocol — ${format(new Date(), "dd MMM yyyy")}`;

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [startDate, setStartDate] = useState(today);
  const [selectedSupps, setSelectedSupps] = useState<boolean[]>(() => supplements.map(() => true));
  const [selectedPeptides, setSelectedPeptides] = useState<boolean[]>(() => peptides.map(() => true));

  // Post-creation interstitial state
  const [showNudge, setShowNudge] = useState(false);
  const [createdProtocolId, setCreatedProtocolId] = useState<string | null>(null);
  const [createdProtocolName, setCreatedProtocolName] = useState("");

  if (!user) return null;

  if (!isPaid) {
    return (
      <Button
        variant="outline"
        className="w-full border-border text-muted-foreground gap-2 cursor-not-allowed opacity-70"
        disabled
      >
        <Lock className="h-4 w-4" />
        Unlock with DNA Report
      </Button>
    );
  }

  const toggleSupp = (i: number) => {
    setSelectedSupps((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const togglePeptide = (i: number) => {
    setSelectedPeptides((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const totalSelected = selectedSupps.filter(Boolean).length + selectedPeptides.filter(Boolean).length;

  const handleCreate = async () => {
    const chosenSupps = supplements.filter((_, i) => selectedSupps[i]);
    const chosenPeptides = peptides.filter((_, i) => selectedPeptides[i]);

    if (chosenSupps.length === 0 && chosenPeptides.length === 0) {
      toast({ title: "Select at least one item", variant: "destructive" });
      return;
    }

    const supps: ProtocolSupplement[] = chosenSupps.map((s) => ({
      name: s.supplement,
      dose: s.dose,
      frequency: "daily",
      drivenBy: s.driven_by || [],
    }));

    const peptideItems = chosenPeptides.map((p) => ({
      peptide_name: p.peptide,
      dose_mcg: parseDoseMcg(p.dose),
      frequency: "daily",
      route: p.route || "SubQ",
      timing: "PM",
      notes: (p.driven_by || []).join("; "),
    }));

    try {
      const protocol = await createProtocol.mutateAsync({
        name,
        goal: "DNA-driven health optimisation",
        startDate,
        peptides: peptideItems,
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

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Layers className="h-4 w-4" />
            Build My Full Protocol
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Build Protocol from DNA Report</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Protocol Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Start Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            {/* Peptides section */}
            {peptides.length > 0 && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Peptides ({selectedPeptides.filter(Boolean).length}/{peptides.length})
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {peptides.map((p, i) => (
                    <label
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedPeptides[i]}
                        onCheckedChange={() => togglePeptide(i)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{p.peptide}</p>
                        <p className="text-xs text-muted-foreground">{p.dose} · {p.route || "SubQ"} · {p.duration || "8-12 weeks"}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        p.evidence_grade === "A" ? "bg-primary/10 text-primary" :
                        p.evidence_grade === "B" ? "bg-blue-500/10 text-blue-600" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {p.evidence_grade || "C"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Supplements section */}
            {supplements.length > 0 && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Supplements ({selectedSupps.filter(Boolean).length}/{supplements.length})
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {supplements.map((s, i) => (
                    <label
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedSupps[i]}
                        onCheckedChange={() => toggleSupp(i)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{s.supplement}</p>
                        <p className="text-xs text-muted-foreground">{s.dose} · {s.timing}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        s.evidence_grade === "A" ? "bg-primary/10 text-primary" :
                        s.evidence_grade === "B" ? "bg-blue-500/10 text-blue-600" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {s.evidence_grade}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleCreate}
              disabled={createProtocol.isPending || totalSelected === 0}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {createProtocol.isPending ? "Creating..." : `Create Protocol (${totalSelected} items)`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post-creation baseline nudge modal */}
      {showNudge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card max-w-md w-full mx-4 rounded-2xl border border-border p-6 space-y-5">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-foreground">Protocol started</h2>
              <p className="text-sm text-muted-foreground">{createdProtocolName} is now active</p>
            </div>

            <div className="border-l-4 border-primary bg-primary/5 pl-4 py-3 rounded-r-xl">
              <p className="text-sm text-foreground">
                Log your baseline bloods before you start. This is the most important step —
                without a baseline, Peptyl can't calculate what changed at the end.
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

/** Parse dose string like "250–500mcg" to a number */
function parseDoseMcg(dose: string): number {
  const match = dose.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 250;
}

export default CreateProtocolFromReport;
