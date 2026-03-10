import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateProtocol } from "@/hooks/use-protocols";
import { useLogInjection } from "@/hooks/use-injections";
import { useToast } from "@/hooks/use-toast";
import { format, addWeeks } from "date-fns";

interface StackRow {
  id: string;
  name: string;
  dose: string;
  frequency: string;
}

const PEPTIDE_KEYWORDS = [
  "bpc", "tb-500", "tb500", "ipamorelin", "sermorelin", "semax", "epitalon",
  "ta-1", "ta1", "thymosin", "mots-c", "cjc", "ghrp", "hexarelin", "tesamorelin",
  "retatrutide", "semaglutide", "tirzepatide", "aod", "ghk", "ghk-cu",
  "selank", "dsip", "kisspeptin", "pt-141", "pt141", "melanotan", "igf",
  "frag", "bnp", "bremelanotide", "mod-grf", "ghrh",
];

function isPeptide(name: string): boolean {
  const lower = name.toLowerCase();
  return PEPTIDE_KEYWORDS.some((kw) => lower.includes(kw));
}

const FREQUENCIES = ["Daily", "EOD", "2x/week", "3x/week", "5on/2off", "Weekly"];

const newRow = (): StackRow => ({
  id: crypto.randomUUID(),
  name: "",
  dose: "",
  frequency: "Daily",
});

interface Props {
  disclaimerAccepted: boolean;
  onSaved?: () => void;
}

const QuickStackImport = ({ disclaimerAccepted, onSaved }: Props) => {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<StackRow[]>([newRow()]);
  const [saved, setSaved] = useState(false);
  const createProtocol = useCreateProtocol();
  const logInjection = useLogInjection();
  const { toast } = useToast();

  const updateRow = (id: string, field: keyof StackRow, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSave = async () => {
    if (!disclaimerAccepted) {
      toast({
        title: "Disclaimer required",
        description: "Please acknowledge the medical disclaimer above before saving a protocol.",
        variant: "destructive",
      });
      return;
    }

    const validRows = rows.filter((r) => r.name.trim());
    if (validRows.length === 0) {
      toast({ title: "Nothing to save", description: "Add at least one compound.", variant: "destructive" });
      return;
    }

    const today = format(new Date(), "yyyy-MM-dd");
    const endDate = format(addWeeks(new Date(), 12), "yyyy-MM-dd");

    const peptides = validRows
      .filter((r) => isPeptide(r.name))
      .map((r) => ({
        peptide_name: r.name.trim(),
        dose_mcg: parseInt(r.dose) || 250,
        frequency: r.frequency.toLowerCase(),
        timing: "AM",
        route: "SubQ",
      }));

    const supplements = validRows
      .filter((r) => !isPeptide(r.name))
      .map((r) => ({
        name: r.name.trim(),
        dose: r.dose || "as directed",
        frequency: r.frequency.toLowerCase(),
      }));

    try {
      await createProtocol.mutateAsync({
        name: `My Current Stack (${format(new Date(), "d MMM yyyy")})`,
        goal: "Track existing compounds",
        startDate: today,
        endDate,
        peptides,
        supplements,
        notes: "Imported via Quick Stack Import",
      });

      // Log today's injections for peptides
      for (const p of peptides) {
        await logInjection.mutateAsync({
          peptide_name: p.peptide_name,
          dose_mcg: p.dose_mcg,
          scheduled_time: `${today}T09:00:00.000Z`,
        });
      }

      setSaved(true);
      toast({
        title: "Stack saved",
        description: "Now tracking your protocol. Check Today's Plan for your doses.",
      });
      onSaved?.();

      setTimeout(() => {
        setOpen(false);
        setSaved(false);
        setRows([newRow()]);
      }, 2000);
    } catch (err: any) {
      toast({
        title: "Could not save",
        description: err?.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const isPending = createProtocol.isPending || logInjection.isPending;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Plus className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-heading font-semibold text-foreground">
              Already taking something?
            </p>
            <p className="text-xs text-muted-foreground">Log your current stack in 30 seconds</p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Expanded form */}
      {open && (
        <div className="border-t border-border p-4 sm:p-5 space-y-4">
          <div>
            <p className="text-sm font-heading font-semibold text-foreground">Log your current stack</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Peptides and supplements both supported. We'll auto-detect which is which.
            </p>
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center gap-2">
                <Input
                  placeholder="e.g. BPC-157, Omega-3, Creatine"
                  value={row.name}
                  onChange={(e) => updateRow(row.id, "name", e.target.value)}
                  className="flex-1 min-w-0 text-sm h-9"
                />
                <Input
                  placeholder="Dose"
                  value={row.dose}
                  onChange={(e) => updateRow(row.id, "dose", e.target.value)}
                  className="w-24 text-sm h-9 shrink-0"
                />
                <Select
                  value={row.frequency}
                  onValueChange={(v) => updateRow(row.id, "frequency", v)}
                >
                  <SelectTrigger className="w-28 text-xs h-9 shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => (
                      <SelectItem key={f} value={f} className="text-xs">
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {rows.length > 1 && (
                  <button
                    onClick={() => removeRow(row.id)}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add row */}
          <button
            onClick={() => setRows((prev) => [...prev, newRow()])}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Add another
          </button>

          {/* Save button */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[10px] text-muted-foreground leading-relaxed max-w-xs">
              Saves as "My Current Stack" — 12 week protocol. You can edit timing and doses after saving.
            </p>
            <Button
              onClick={handleSave}
              disabled={isPending || saved}
              size="sm"
              className="shrink-0 shadow-brand"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-400" />
                  Saved
                </>
              ) : isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save as active protocol"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickStackImport;
