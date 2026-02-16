import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { peptides as peptideDatabase } from "@/data/peptides";
import { useCreateProtocol, useProtocols } from "@/hooks/use-protocols";
import { useToast } from "@/hooks/use-toast";
import { format, addWeeks } from "date-fns";
import { checkDoseEscalation, type EscalationWarning } from "@/data/titration-rules";
import DoseEscalationWarning from "./DoseEscalationWarning";

interface PeptideRow {
  peptide_name: string;
  dose_mcg: number;
  frequency: string;
  timing: string;
  route: string;
}

const emptyPeptide: PeptideRow = {
  peptide_name: "",
  dose_mcg: 0,
  frequency: "daily",
  timing: "PM",
  route: "SubQ",
};

const CreateProtocolForm = ({ disclaimerAccepted, initialPeptide, onInitialPeptideConsumed }: { disclaimerAccepted: boolean; initialPeptide?: string | null; onInitialPeptideConsumed?: () => void }) => {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [peptideRows, setPeptideRows] = useState<PeptideRow[]>([{ ...emptyPeptide }]);
  const [escalationWarnings, setEscalationWarnings] = useState<EscalationWarning[]>([]);
  const [showEscalationWarning, setShowEscalationWarning] = useState(false);
  const createProtocol = useCreateProtocol();
  const { data: existingProtocols = [] } = useProtocols();
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPeptide) {
      setPeptideRows([{ ...emptyPeptide, peptide_name: initialPeptide }]);
      setName(`${initialPeptide} Protocol`);
      onInitialPeptideConsumed?.();
      // Scroll to form
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [initialPeptide]);

  // Get all compounds currently in active/paused protocols
  const activeCompounds = new Set(
    existingProtocols
      .filter((p) => p.status === "active" || p.status === "paused")
      .flatMap((p) => p.peptides.map((pp) => pp.peptide_name))
  );

  const updateRow = (index: number, field: keyof PeptideRow, value: string | number) => {
    setPeptideRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const addRow = () => setPeptideRows((prev) => [...prev, { ...emptyPeptide }]);
  const removeRow = (index: number) => setPeptideRows((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!disclaimerAccepted) {
      toast({ title: "Disclaimer required", description: "Please acknowledge the medical disclaimer first.", variant: "destructive" });
      return;
    }
    if (!name.trim()) {
      toast({ title: "Missing name", description: "Please enter a protocol name.", variant: "destructive" });
      return;
    }
    const validPeptides = peptideRows.filter((p) => p.peptide_name && p.dose_mcg > 0);
    if (validPeptides.length === 0) {
      toast({ title: "No peptides", description: "Add at least one peptide with a dose.", variant: "destructive" });
      return;
    }

    // Check for duplicate compounds already in active protocols
    const duplicates = validPeptides.filter((p) => activeCompounds.has(p.peptide_name));
    if (duplicates.length > 0) {
      const names = duplicates.map((d) => d.peptide_name).join(", ");
      toast({
        title: "Compound already active",
        description: `${names} already exist in an active protocol. Please update the existing protocol's dosage instead of creating a duplicate.`,
        variant: "destructive",
      });
      return;
    }

    // Check dose escalation for flagged compounds
    const allExistingPeptides = existingProtocols
      .filter((p) => p.status === "active" || p.status === "paused")
      .flatMap((p) => p.peptides.map((pp) => ({
        peptide_name: pp.peptide_name,
        dose_mcg: pp.dose_mcg,
        frequency: pp.frequency,
      })));

    const warnings = checkDoseEscalation(
      validPeptides.map((p) => ({ peptide_name: p.peptide_name, dose_mcg: p.dose_mcg, frequency: p.frequency })),
      allExistingPeptides,
    );

    if (warnings.length > 0) {
      setEscalationWarnings(warnings);
      setShowEscalationWarning(true);
      return;
    }

    await executeCreate(validPeptides);
  };

  const executeCreate = async (validPeptides: PeptideRow[]) => {
    try {
      await createProtocol.mutateAsync({
        name: name.trim(),
        goal: goal.trim(),
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(addWeeks(new Date(), durationWeeks), "yyyy-MM-dd"),
        peptides: validPeptides,
      });
      toast({ title: "Protocol created", description: `${name} is now active.` });
      setName("");
      setGoal("");
      setPeptideRows([{ ...emptyPeptide }]);
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to create protocol.", variant: "destructive" });
    }
  };

  const peptideNames = peptideDatabase.map((p) => p.name).sort();

  return (
    <div ref={formRef} className="bg-card rounded-2xl border border-border p-5 space-y-5">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-5 w-5 text-primary" />
        <h2 className="font-heading font-semibold text-foreground">Create Custom Protocol</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Protocol Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fat Loss Stack" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Goal</label>
          <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Body recomposition" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">Duration (weeks)</label>
        <Input type="number" min={1} max={52} value={durationWeeks} onChange={(e) => setDurationWeeks(Number(e.target.value))} className="w-28" />
      </div>

      <div className="space-y-3">
        <label className="text-xs text-muted-foreground font-medium">Peptides</label>
        {peptideRows.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_80px_90px_70px_70px_32px] gap-2 items-end">
            <Select value={row.peptide_name} onValueChange={(v) => updateRow(i, "peptide_name", v)}>
              <SelectTrigger className="text-xs h-9"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {peptideNames.map((n) => (
                  <SelectItem key={n} value={n} className="text-xs">{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" placeholder="mcg" value={row.dose_mcg || ""} onChange={(e) => updateRow(i, "dose_mcg", Number(e.target.value))} className="text-xs h-9" />
            <Select value={row.frequency} onValueChange={(v) => updateRow(i, "frequency", v)}>
              <SelectTrigger className="text-xs h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["daily", "EOD", "2x/week", "3x/week", "weekly"].map((f) => (
                  <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={row.timing} onValueChange={(v) => updateRow(i, "timing", v)}>
              <SelectTrigger className="text-xs h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["AM", "PM", "AM+PM", "Pre-bed"].map((t) => (
                  <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={row.route} onValueChange={(v) => updateRow(i, "route", v)}>
              <SelectTrigger className="text-xs h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["SubQ", "IM", "Oral", "Nasal"].map((r) => (
                  <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeRow(i)} disabled={peptideRows.length === 1}>
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addRow} className="text-xs">
          <Plus className="h-3 w-3 mr-1" /> Add Peptide
        </Button>
      </div>

      <Button onClick={handleSubmit} disabled={createProtocol.isPending} className="shadow-brand">
        {createProtocol.isPending ? "Creating…" : "Create Protocol"}
      </Button>

      <DoseEscalationWarning
        warnings={escalationWarnings}
        open={showEscalationWarning}
        onCancel={() => setShowEscalationWarning(false)}
        onConfirm={() => {
          setShowEscalationWarning(false);
          const validPeptides = peptideRows.filter((p) => p.peptide_name && p.dose_mcg > 0);
          executeCreate(validPeptides);
        }}
      />
    </div>
  );
};

export default CreateProtocolForm;
