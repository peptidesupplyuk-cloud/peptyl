import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateProtocol, type ProtocolSupplement } from "@/hooks/use-protocols";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FlaskConical, Lock } from "lucide-react";
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

interface Props {
  supplements: Supplement[];
  reportId: string;
  isPaid?: boolean;
}

const CreateProtocolFromReport = ({ supplements, reportId, isPaid = true }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createProtocol = useCreateProtocol();
  const today = format(new Date(), "yyyy-MM-dd");

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(`DNA Health Protocol — ${format(new Date(), "dd MMM yyyy")}`);
  const [startDate, setStartDate] = useState(today);
  const [selected, setSelected] = useState<boolean[]>(() => supplements.map(() => true));

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

  const toggleItem = (i: number) => {
    setSelected((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const handleCreate = async () => {
    const chosen = supplements.filter((_, i) => selected[i]);
    if (chosen.length === 0) {
      toast({ title: "Select at least one supplement", variant: "destructive" });
      return;
    }

    const supps: ProtocolSupplement[] = chosen.map((s) => ({
      name: s.supplement,
      dose: s.dose,
      frequency: "daily",
    }));

    try {
      await createProtocol.mutateAsync({
        name,
        goal: "DNA-driven health optimisation",
        startDate,
        peptides: [],
        supplements: supps,
        notes: `Auto-generated from DNA report ${reportId}`,
      });
      toast({ title: "Protocol created", description: "Your DNA-based protocol is now active." });
      setOpen(false);
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <FlaskConical className="h-4 w-4" />
          Create Protocol from Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Create Protocol from DNA Report</DialogTitle>
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

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Supplements ({selected.filter(Boolean).length}/{supplements.length} selected)
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {supplements.map((s, i) => (
                <label
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <Checkbox
                    checked={selected[i]}
                    onCheckedChange={() => toggleItem(i)}
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

          <Button
            onClick={handleCreate}
            disabled={createProtocol.isPending || selected.filter(Boolean).length === 0}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {createProtocol.isPending ? "Creating..." : "Create Protocol"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProtocolFromReport;
