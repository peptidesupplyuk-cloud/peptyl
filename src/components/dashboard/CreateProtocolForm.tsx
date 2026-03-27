import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, FlaskConical, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { peptides as peptideDatabase } from "@/data/peptides";
import { supplements as supplementDatabase } from "@/data/supplements";
import { useCreateProtocol, useProtocols } from "@/hooks/use-protocols";
import { useToast } from "@/hooks/use-toast";
import { format, addWeeks } from "date-fns";
import { checkDoseEscalation, type EscalationWarning } from "@/data/titration-rules";
import DoseEscalationWarning from "./DoseEscalationWarning";
import { normaliseSupplementName, isSameSupplement } from "@/lib/supplement-normalise";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CompoundRow {
  id: string;
  name: string;
  doseValue: string;
  doseUnit: string;
  frequency: string;
  timing: string;
  type: "peptide" | "supplement";
  isManual: boolean;
}

const emptyRow = (): CompoundRow => ({
  id: crypto.randomUUID(),
  name: "",
  doseValue: "",
  doseUnit: "mg",
  frequency: "daily",
  timing: "AM",
  type: "supplement",
  isManual: false,
});

const GOALS = [
  "Fat Loss",
  "Muscle Growth",
  "Body Recomposition",
  "Recovery & Healing",
  "Longevity & Anti-Ageing",
  "Cognitive Enhancement",
  "Sleep Optimisation",
  "Immune Support",
  "Gut Health",
  "Skin & Hair",
  "Hormonal Balance",
  "General Wellness",
];

const FREQUENCIES = ["Daily", "2x/week", "3x/week", "5on/2off", "Weekly"];
const TIMINGS = ["AM", "Noon", "PM"];
const DOSE_UNITS = ["g", "mg", "mcg"];

// ─── Unified searchable compound input ─────────────────────────────────────
const allCompounds = [
  ...supplementDatabase.map((s) => ({ name: s.name, type: "supplement" as const })),
  ...peptideDatabase.map((p) => ({ name: p.name, type: "peptide" as const })),
].sort((a, b) => a.name.localeCompare(b.name));

const PEPTIDE_KEYWORDS = [
  "bpc", "tb-500", "tb500", "ipamorelin", "sermorelin", "semax", "epitalon",
  "ta-1", "ta1", "thymosin", "mots-c", "cjc", "ghrp", "hexarelin", "tesamorelin",
  "retatrutide", "semaglutide", "tirzepatide", "aod", "ghk", "ghk-cu",
  "selank", "dsip", "kisspeptin", "pt-141", "pt141", "melanotan", "igf",
  "frag", "bnp", "bremelanotide", "mod-grf", "ghrh", "kpv", "foxo4",
  "humanin", "ss-31", "elamipretide", "fgf21",
];

function detectType(name: string): "peptide" | "supplement" {
  const lower = name.toLowerCase();
  if (PEPTIDE_KEYWORDS.some((kw) => lower.includes(kw))) return "peptide";
  const match = allCompounds.find((c) => c.name.toLowerCase() === lower);
  return match?.type || "supplement";
}

const CompoundSearchInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (name: string, type: "peptide" | "supplement", isManual: boolean) => void;
}) => {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const filtered = query.length > 0
    ? allCompounds.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
    : [];

  useEffect(() => { setQuery(value); }, [value]);

  const hasExactMatch = allCompounds.some((c) => c.name.toLowerCase() === query.toLowerCase());

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => {
          setOpen(false);
          // If user typed something not in DB, flag as manual
          if (query.trim() && !hasExactMatch) {
            onChange(query.trim(), detectType(query.trim()), true);
          }
        }, 150)}
        placeholder="Search or type compound..."
        className="text-xs h-9"
      />
      {open && (filtered.length > 0 || (query.trim().length > 1 && !hasExactMatch)) && (
        <div className="absolute z-50 top-full left-0 right-0 bg-card border border-border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.name}
              type="button"
              className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors flex items-center justify-between"
              onMouseDown={() => { onChange(c.name, c.type, false); setQuery(c.name); setOpen(false); }}
            >
              <span>{c.name}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${c.type === "peptide" ? "bg-primary/10 text-primary" : "bg-accent/30 text-accent-foreground"}`}>
                {c.type === "peptide" ? "Peptide" : "Supplement"}
              </span>
            </button>
          ))}
          {query.trim().length > 1 && !hasExactMatch && (
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors flex items-center justify-between border-t border-border"
              onMouseDown={() => { onChange(query.trim(), detectType(query.trim()), true); setOpen(false); }}
            >
              <span className="flex items-center gap-1.5">
                <Plus className="h-3 w-3 text-primary" />
                Add "<strong>{query.trim()}</strong>" as custom compound
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Manual</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const CreateProtocolForm = ({ disclaimerAccepted, initialPeptide, onInitialPeptideConsumed }: { disclaimerAccepted: boolean; initialPeptide?: string | null; onInitialPeptideConsumed?: () => void }) => {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [endDate, setEndDate] = useState<Date | undefined>(addWeeks(new Date(), 8));
  const [rows, setRows] = useState<CompoundRow[]>([emptyRow()]);
  const [escalationWarnings, setEscalationWarnings] = useState<EscalationWarning[]>([]);
  const [showEscalationWarning, setShowEscalationWarning] = useState(false);
  const createProtocol = useCreateProtocol();
  const { data: existingProtocols = [] } = useProtocols();
  const { toast } = useToast();
  const { user } = useAuth();
  const formRef = useRef<HTMLDivElement>(null);

  // Load from stack import (sessionStorage)
  useEffect(() => {
    const pendingStack = sessionStorage.getItem("pending_stack");
    if (pendingStack) {
      try {
        const stack = JSON.parse(pendingStack);
        setName(stack.name || "");
        setGoal(stack.goal || "");
        if (stack.durationWeeks) setEndDate(addWeeks(new Date(), stack.durationWeeks));
        const newRows: CompoundRow[] = [];
        if (stack.peptides?.length) {
          for (const p of stack.peptides) {
            newRows.push({
              id: crypto.randomUUID(),
              name: p.peptide_name || "",
              doseValue: String(p.dose_mcg || ""),
              doseUnit: "mcg",
              frequency: p.frequency || "Daily",
              timing: p.timing || "AM",
              type: "peptide",
              isManual: false,
            });
          }
        }
        if (stack.supplements?.length) {
          for (const s of stack.supplements) {
            const doseMatch = (s.dose || "").match(/^([\d.]+)\s*(g|mg|mcg)?$/i);
            newRows.push({
              id: crypto.randomUUID(),
              name: s.name || "",
              doseValue: doseMatch ? doseMatch[1] : s.dose || "",
              doseUnit: doseMatch?.[2]?.toLowerCase() || "mg",
              frequency: s.frequency || "Daily",
              timing: s.timing || "AM",
              type: "supplement",
              isManual: false,
            });
          }
        }
        if (newRows.length > 0) setRows(newRows);
        sessionStorage.removeItem("pending_stack");
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (initialPeptide) {
      setRows([{
        ...emptyRow(),
        name: initialPeptide,
        type: "peptide",
      }]);
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

  const updateRow = (id: string, field: keyof CompoundRow, value: string | boolean) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleCompoundChange = (id: string, name: string, type: "peptide" | "supplement", isManual: boolean) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, name, type, isManual } : r)));
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const flagManualCompounds = async (manualRows: CompoundRow[]) => {
    if (!user || manualRows.length === 0) return;
    for (const row of manualRows) {
      await supabase.from("manual_compounds").insert({
        user_id: user.id,
        compound_name: row.name.trim(),
        compound_type: row.type,
        needs_review: true,
      } as any);
    }
  };

  const handleSubmit = async () => {
    if (!disclaimerAccepted) {
      toast({ title: "Disclaimer required", description: "Please acknowledge the medical disclaimer first.", variant: "destructive" });
      return;
    }
    if (!name.trim()) {
      toast({ title: "Missing name", description: "Please enter a protocol name.", variant: "destructive" });
      return;
    }
    if (!goal) {
      toast({ title: "Missing goal", description: "Please select a goal for your protocol.", variant: "destructive" });
      return;
    }
    if (!endDate) {
      toast({ title: "Missing end date", description: "Please set an end date for your protocol.", variant: "destructive" });
      return;
    }

    const validRows = rows.filter((r) => r.name.trim() && r.doseValue.trim());
    if (validRows.length === 0) {
      toast({ title: "Add compounds", description: "Add at least one peptide or supplement with a dose.", variant: "destructive" });
      return;
    }

    // Auto-detect types for manually typed names
    const typedRows = validRows.map((r) => ({
      ...r,
      type: r.type || detectType(r.name),
    }));

    const peptideRows = typedRows.filter((r) => r.type === "peptide");
    const supplementRows = typedRows.filter((r) => r.type === "supplement");

    const validSupplements = supplementRows.map((s) => ({
      name: normaliseSupplementName(s.name),
      dose: `${s.doseValue.trim()} ${s.doseUnit}`,
      frequency: s.frequency,
      timing: s.timing,
    }));

    // Check for duplicate supplements within this protocol
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
      .filter((p) => p.status === "active" || p.status === "paused")
      .flatMap((p) => (p.supplements || []).map((s: any) => ({ name: normaliseSupplementName(s.name), protocolName: p.name })));
    const crossDupes = validSupplements.filter((s) =>
      activeSupps.some((as) => isSameSupplement(as.name, s.name))
    );
    if (crossDupes.length > 0) {
      const details = crossDupes.map((d) => {
        const match = activeSupps.find((as) => isSameSupplement(as.name, d.name));
        return `${d.name} (already in "${match?.protocolName}")`;
      }).join(", ");
      toast({
        title: "Supplement already active",
        description: `${details}. Update the existing protocol's dosage instead of creating a duplicate.`,
        variant: "destructive",
      });
      return;
    }

    // Build peptides payload - convert dose to mcg for DB
    const validPeptides = peptideRows.map((p) => {
      let doseMcg = parseFloat(p.doseValue) || 0;
      if (p.doseUnit === "mg") doseMcg *= 1000;
      if (p.doseUnit === "g") doseMcg *= 1_000_000;
      return {
        peptide_name: p.name.trim(),
        dose_mcg: Math.round(doseMcg),
        frequency: p.frequency,
        timing: p.timing,
        route: "",
      };
    });

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

    // Flag manual compounds before creating
    await flagManualCompounds(typedRows.filter((r) => r.isManual));
    await executeCreate(validPeptides, validSupplements);
  };

  const executeCreate = async (validPeptides: { peptide_name: string; dose_mcg: number; frequency: string; timing: string; route: string }[], validSupplements?: { name: string; dose: string; frequency: string; timing: string }[]) => {
    try {
      await createProtocol.mutateAsync({
        name: name.trim(),
        goal: goal.trim(),
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : format(addWeeks(new Date(), 8), "yyyy-MM-dd"),
        peptides: validPeptides,
        supplements: (validSupplements || []).map((s) => ({
          name: s.name.trim(),
          dose: s.dose.trim(),
          frequency: s.frequency,
          timing: s.timing,
        })),
      });
      toast({ title: "Protocol created", description: `${name} is now active.` });
      setName("");
      setGoal("");
      setEndDate(addWeeks(new Date(), 8));
      setRows([emptyRow()]);
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to create protocol.", variant: "destructive" });
    }
  };

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
          <Select value={goal} onValueChange={setGoal}>
            <SelectTrigger className="text-xs h-10">
              <SelectValue placeholder="Select a goal..." />
            </SelectTrigger>
            <SelectContent>
              {GOALS.map((g) => (
                <SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">End Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-48 justify-start text-left font-normal text-xs h-9",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
              {endDate ? format(endDate, "d MMM yyyy") : "Pick end date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* ─── Compounds Section ─── */}
      <div className="space-y-3">
        <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
          <Pill className="h-3.5 w-3.5" /> Compounds
          <span className="text-[10px] text-muted-foreground/70">(peptides & supplements)</span>
        </label>

        {rows.map((row) => (
          <div key={row.id} className="space-y-2">
            <div className="grid grid-cols-[1fr_80px_64px_90px_70px_32px] gap-2 items-end">
              <CompoundSearchInput
                value={row.name}
                onChange={(n, t, manual) => handleCompoundChange(row.id, n, t, manual)}
              />
              <Input
                placeholder="Dose"
                value={row.doseValue}
                onChange={(e) => updateRow(row.id, "doseValue", e.target.value)}
                className="text-xs h-9"
                type="number"
                min="0"
                step="any"
              />
              <Select value={row.doseUnit} onValueChange={(v) => updateRow(row.id, "doseUnit", v)}>
                <SelectTrigger className="text-xs h-9 px-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOSE_UNITS.map((u) => (
                    <SelectItem key={u} value={u} className="text-xs">{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={row.frequency} onValueChange={(v) => updateRow(row.id, "frequency", v)}>
                <SelectTrigger className="text-xs h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={row.timing} onValueChange={(v) => updateRow(row.id, "timing", v)}>
                <SelectTrigger className="text-xs h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMINGS.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {rows.length > 1 && (
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeRow(row.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              )}
            </div>
            {row.isManual && row.name.trim() && (
              <p className="text-[10px] text-amber-500 pl-1">⚠ Custom compound — will be flagged for knowledge base review</p>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setRows((prev) => [...prev, emptyRow()])} className="text-xs">
          <Plus className="h-3 w-3 mr-1" /> Add Compound
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
          const typedRows = rows.filter((r) => r.name.trim() && r.doseValue.trim()).map((r) => ({ ...r, type: r.type || detectType(r.name) }));
          const validPeptides = typedRows.filter((r) => r.type === "peptide").map((p) => {
            let doseMcg = parseFloat(p.doseValue) || 0;
            if (p.doseUnit === "mg") doseMcg *= 1000;
            if (p.doseUnit === "g") doseMcg *= 1_000_000;
            return {
              peptide_name: p.name.trim(),
              dose_mcg: Math.round(doseMcg),
              frequency: p.frequency,
              timing: p.timing,
              route: "",
            };
          });
          const validSupplements = typedRows.filter((r) => r.type === "supplement").map((s) => ({
            name: normaliseSupplementName(s.name),
            dose: `${s.doseValue.trim()} ${s.doseUnit}`,
            frequency: s.frequency,
            timing: s.timing,
          }));
          flagManualCompounds(typedRows.filter((r) => r.isManual));
          executeCreate(validPeptides, validSupplements);
        }}
      />
    </div>
  );
};

export default CreateProtocolForm;
