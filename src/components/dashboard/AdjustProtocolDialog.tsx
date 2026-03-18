import { useState, useEffect } from "react";
import { Plus, FlaskConical, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAddPeptideToProtocol, useAddSupplementToProtocol } from "@/hooks/use-protocol-history";
import { useToast } from "@/hooks/use-toast";
import { differenceInCalendarDays } from "date-fns";
import type { Protocol } from "@/hooks/use-protocols";
import { peptides as peptideDatabase } from "@/data/peptides";
import { supplements as supplementDatabase } from "@/data/supplements";

interface Props {
  protocol: Protocol;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* ─── Searchable autocomplete input ─── */
const SearchInput = ({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) => {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const filtered = query.length > 0
    ? options.filter((n) => n.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => { setQuery(value); }, [value]);

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="text-sm"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 bg-card border border-border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
          {filtered.map((name) => (
            <button
              key={name}
              type="button"
              className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors text-foreground"
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

const AdjustProtocolDialog = ({ protocol, open, onOpenChange }: Props) => {
  const { toast } = useToast();
  const addPeptide = useAddPeptideToProtocol();
  const addSupplement = useAddSupplementToProtocol();
  const [mode, setMode] = useState<"peptide" | "supplement">("peptide");

  const dayNumber = Math.max(1, differenceInCalendarDays(new Date(), new Date(protocol.start_date)) + 1);

  const peptideNames = peptideDatabase.map((p) => p.name);
  const supplementNames = supplementDatabase.map((s) => s.name);

  // Peptide form
  const [pepName, setPepName] = useState("");
  const [pepDose, setPepDose] = useState(0);
  const [pepFreq, setPepFreq] = useState("daily");
  const [pepTiming, setPepTiming] = useState("PM");
  const [pepRoute, setPepRoute] = useState("SubQ");

  // Supplement form
  const [suppName, setSuppName] = useState("");
  const [suppDose, setSuppDose] = useState("");
  const [suppFreq, setSuppFreq] = useState("Daily");
  const [suppTiming, setSuppTiming] = useState("AM");

  const handleAddPeptide = async () => {
    if (!pepName.trim() || pepDose <= 0) {
      toast({ title: "Missing fields", description: "Enter peptide name and dose.", variant: "destructive" });
      return;
    }
    try {
      await addPeptide.mutateAsync({
        protocol_id: protocol.id,
        peptide_name: pepName.trim(),
        dose_mcg: pepDose,
        frequency: pepFreq,
        timing: pepTiming,
        route: pepRoute,
        day_number: dayNumber,
      });
      toast({ title: "Peptide added", description: `${pepName} added to ${protocol.name} on Day ${dayNumber}.` });
      setPepName("");
      setPepDose(0);
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to add peptide.", variant: "destructive" });
    }
  };

  const handleAddSupplement = async () => {
    if (!suppName.trim() || !suppDose.trim()) {
      toast({ title: "Missing fields", description: "Enter supplement name and dose.", variant: "destructive" });
      return;
    }
    try {
      await addSupplement.mutateAsync({
        protocol_id: protocol.id,
        supplement: { name: suppName.trim(), dose: suppDose.trim(), frequency: suppFreq, timing: suppTiming },
        day_number: dayNumber,
        current_supplements: protocol.supplements || [],
      });
      toast({ title: "Supplement added", description: `${suppName} added to ${protocol.name} on Day ${dayNumber}.` });
      setSuppName("");
      setSuppDose("");
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to add supplement.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Plus className="h-5 w-5 text-primary" />
            Adjust Protocol — Day {dayNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant={mode === "peptide" ? "default" : "outline"}
            onClick={() => setMode("peptide")}
            className="flex-1 gap-1.5"
          >
            <FlaskConical className="h-3.5 w-3.5" /> Add Peptide
          </Button>
          <Button
            size="sm"
            variant={mode === "supplement" ? "default" : "outline"}
            onClick={() => setMode("supplement")}
            className="flex-1 gap-1.5"
          >
            <Pill className="h-3.5 w-3.5" /> Add Supplement
          </Button>
        </div>

        {mode === "peptide" ? (
          <div className="space-y-3">
            <SearchInput
              value={pepName}
              onChange={setPepName}
              options={peptideNames}
              placeholder="Search peptide..."
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Dose (mcg)</label>
                <Input
                  type="number"
                  value={pepDose || ""}
                  onChange={(e) => setPepDose(Number(e.target.value))}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Frequency</label>
                <Select value={pepFreq} onValueChange={setPepFreq}>
                  <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="eod">Every other day</SelectItem>
                    <SelectItem value="3x_week">3× / week</SelectItem>
                    <SelectItem value="5_on_2_off">5 on / 2 off</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Timing</label>
                <Select value={pepTiming} onValueChange={setPepTiming}>
                  <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                    <SelectItem value="AM+PM">AM+PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Route</label>
                <Select value={pepRoute} onValueChange={setPepRoute}>
                  <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SubQ">SubQ</SelectItem>
                    <SelectItem value="IM">IM</SelectItem>
                    <SelectItem value="Oral">Oral</SelectItem>
                    <SelectItem value="Nasal">Nasal</SelectItem>
                    <SelectItem value="Topical">Topical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleAddPeptide}
              disabled={addPeptide.isPending}
            >
              {addPeptide.isPending ? "Adding..." : `Add to ${protocol.name}`}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <SearchInput
              value={suppName}
              onChange={setSuppName}
              options={supplementNames}
              placeholder="Search supplement..."
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Dose</label>
                <Input
                  placeholder="e.g. 400mg"
                  value={suppDose}
                  onChange={(e) => setSuppDose(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Frequency</label>
                <Select value={suppFreq} onValueChange={setSuppFreq}>
                  <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Twice daily">Twice daily</SelectItem>
                    <SelectItem value="3× / week">3× / week</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">When to take</label>
              <Select value={suppTiming} onValueChange={setSuppTiming}>
                <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM (Morning)</SelectItem>
                  <SelectItem value="PM">PM (Evening)</SelectItem>
                  <SelectItem value="AM+PM">AM + PM (Both)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleAddSupplement}
              disabled={addSupplement.isPending}
            >
              {addSupplement.isPending ? "Adding..." : `Add to ${protocol.name}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdjustProtocolDialog;
