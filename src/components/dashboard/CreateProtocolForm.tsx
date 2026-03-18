import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, FlaskConical, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { peptides as peptideDatabase } from "@/data/peptides";
import { useCreateProtocol, useProtocols } from "@/hooks/use-protocols";
import { useToast } from "@/hooks/use-toast";
import { format, addWeeks } from "date-fns";
import { checkDoseEscalation, type EscalationWarning } from "@/data/titration-rules";
import DoseEscalationWarning from "./DoseEscalationWarning";
import { normaliseSupplementName, isSameSupplement } from "@/lib/supplement-normalise";

interface PeptideRow {
  peptide_name: string;
  dose_mcg: number;
  frequency: string;
  timing: string;
  route: string;
}

interface SupplementRow {
  name: string;
  dose: string;
  frequency: string;
  timing: string;
}

const emptyPeptide: PeptideRow = {
  peptide_name: "",
  dose_mcg: 0,
  frequency: "daily",
  timing: "PM",
  route: "SubQ",
};

const emptySupp: SupplementRow = { name: "", dose: "", frequency: "Daily", timing: "AM" };

// ─── Searchable peptide input ────────────────────────────────────────────────

const PeptideSearchInput = ({
  value, onChange, peptideNames
}: { value: string; onChange: (v: string) => void; peptideNames: string[] }) => {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const filtered = query.length > 0
    ? peptideNames.filter(n => n.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => { setQuery(value); }, [value]);

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search peptide..."
        className="text-xs h-9"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 bg-card border border-border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
          {filtered.map(name => (
            <button
              key={name}
              type="button"
              className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors"
              onMouseDown={() => { onChange(name); setQuery(name); setOpen(false); }}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CreateProtocolForm = ({ disclaimerAccepted, initialPeptide, onInitialPeptideConsumed }: { disclaimerAccepted: boolean; initialPeptide?: string | null; onInitialPeptideConsumed?: () => void }) => {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [peptideRows, setPeptideRows] = useState<PeptideRow[]>([{ ...emptyPeptide }]);
  const [supplementRows, setSupplementRows] = useState<SupplementRow[]>([]);
  const [escalationWarnings, setEscalationWarnings] = useState<EscalationWarning[]>([]);
  const [showEscalationWarning, setShowEscalationWarning] = useState(false);
  const createProtocol = useCreateProtocol();
  const { data: existingProtocols = [] } = useProtocols();
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  // Load from stack import (sessionStorage)
  useEffect(() => {
    const pendingStack = sessionStorage.getItem("pending_stack");
    if (pendingStack) {
      try {
        const stack = JSON.parse(pendingStack);
        setName(stack.name || "");
        setGoal(stack.goal || "");
        if (stack.durationWeeks) setDurationWeeks(stack.durationWeeks);
        if (stack.peptides?.length) {
          setPeptideRows(stack.peptides.map((p: any) => ({
            peptide_name: p.peptide_name || "",
            dose_mcg: p.dose_mcg || 0,
            frequency: p.frequency || "daily",
            timing: p.timing || "PM",
            route: p.route || "SubQ",
          })));
        }
        if (stack.supplements?.length) {
          setSupplementRows(stack.supplements.map((s: any) => ({
            name: s.name || "",
            dose: s.dose || "",
            frequency: s.frequency || "Daily",
          })));
        }
        sessionStorage.removeItem("pending_stack");
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (initialPeptide) {
      setPeptideRows([{ ...emptyPeptide, peptide_name: initialPeptide }]);
      setName(`${initialPeptide} Protocol`);
      onInitialPeptideConsumed?.();
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [initialPeptide]);

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
    const validSupplements = supplementRows
      .filter(s => s.name.trim() && s.dose.trim())
      .map(s => ({ ...s, name: normaliseSupplementName(s.name) }));

    if (validPeptides.length === 0 && validSupplements.length === 0) {
      toast({ title: "Add peptides or supplements", description: "Add at least one peptide or supplement.", variant: "destructive" });
      return;
    }

    // Check for duplicate supplements within this protocol (after normalisation)
    const seen = new Set<string>();
    const dupeSupps: string[] = [];
    for (const s of validSupplements) {
      const key = s.name.toLowerCase();
      if (seen.has(key)) dupeSupps.push(s.name);
      seen.add(key);
    }
    if (dupeSupps.length > 0) {
      toast({
        title: "Duplicate supplement",
        description: `${[...new Set(dupeSupps)].join(", ")} is listed more than once. Please remove the duplicate.`,
        variant: "destructive",
      });
      return;
    }

    // Check for supplements already in other active protocols
    const activeSupps = existingProtocols
      .filter(p => p.status === "active" || p.status === "paused")
      .flatMap(p => (p.supplements || []).map((s: any) => ({ name: normaliseSupplementName(s.name), protocolName: p.name })));
    const crossDupes = validSupplements.filter(s =>
      activeSupps.some(as => isSameSupplement(as.name, s.name))
    );
    if (crossDupes.length > 0) {
      const details = crossDupes.map(d => {
        const match = activeSupps.find(as => isSameSupplement(as.name, d.name));
        return `${d.name} (already in "${match?.protocolName}")`;
      }).join(", ");
      toast({
        title: "Supplement already active",
        description: `${details}. Update the existing protocol's dosage instead of creating a duplicate.`,
        variant: "destructive",
      });
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

    await executeCreate(validPeptides, validSupplements);
  };

  const executeCreate = async (validPeptides: PeptideRow[], validSupplements?: SupplementRow[]) => {
    try {
      await createProtocol.mutateAsync({
        name: name.trim(),
        goal: goal.trim(),
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(addWeeks(new Date(), durationWeeks), "yyyy-MM-dd"),
        peptides: validPeptides,
        supplements: (validSupplements || []).map(s => ({
          name: s.name.trim(),
          dose: s.dose.trim(),
          frequency: s.frequency,
          timing: s.timing,
        })),
      });
      toast({ title: "Protocol created", description: `${name} is now active.` });
      setName("");
      setGoal("");
      setPeptideRows([{ ...emptyPeptide }]);
      setSupplementRows([]);
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

      {/* ─── Peptides Section ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
          <FlaskConical className="h-3.5 w-3.5" /> Peptides
        </label>
        {peptideRows.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_80px_90px_70px_70px_32px] gap-2 items-end">
            <PeptideSearchInput
              value={row.peptide_name}
              onChange={(v) => updateRow(i, "peptide_name", v)}
              peptideNames={peptideNames}
            />
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

      {/* ─── Supplements Section ───────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Pill className="h-3.5 w-3.5" /> Supplements
            <span className="text-[10px] text-muted-foreground/70">(optional)</span>
          </label>
          <Button variant="outline" size="sm" onClick={() => setSupplementRows(p => [...p, { ...emptySupp }])} className="text-xs h-7">
            <Plus className="h-3 w-3 mr-1" /> Add Supplement
          </Button>
        </div>

        {supplementRows.length === 0 && (
          <p className="text-xs text-muted-foreground/60 italic">No supplements added. Click above to add.</p>
        )}

        {supplementRows.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_100px_100px_80px_32px] gap-2 items-end">
            <Input
              placeholder="Supplement name"
              value={row.name}
              onChange={(e) => setSupplementRows(p => p.map((r, idx) => idx === i ? { ...r, name: e.target.value } : r))}
              className="text-xs h-9"
            />
            <Input
              placeholder="Dose (e.g. 400mg)"
              value={row.dose}
              onChange={(e) => setSupplementRows(p => p.map((r, idx) => idx === i ? { ...r, dose: e.target.value } : r))}
              className="text-xs h-9"
            />
            <Select
              value={row.frequency}
              onValueChange={(v) => setSupplementRows(p => p.map((r, idx) => idx === i ? { ...r, frequency: v } : r))}
            >
              <SelectTrigger className="text-xs h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Daily", "Twice daily", "With meals", "Before bed", "Morning", "Weekly"].map(f => (
                  <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={row.timing}
              onValueChange={(v) => setSupplementRows(p => p.map((r, idx) => idx === i ? { ...r, timing: v } : r))}
            >
              <SelectTrigger className="text-xs h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AM" className="text-xs">AM</SelectItem>
                <SelectItem value="PM" className="text-xs">PM</SelectItem>
                <SelectItem value="AM+PM" className="text-xs">AM+PM</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSupplementRows(p => p.filter((_, idx) => idx !== i))}>
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        ))}
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
          const validSupplements = supplementRows.filter(s => s.name.trim() && s.dose.trim());
          executeCreate(validPeptides, validSupplements);
        }}
      />
    </div>
  );
};

export default CreateProtocolForm;
