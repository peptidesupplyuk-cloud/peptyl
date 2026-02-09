import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Beaker, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { syringeTypes } from "@/data/calculator-peptides";
import SyringeDiagram from "./SyringeDiagram";
import ValidationWarnings, { type ValidationMessage } from "./ValidationWarnings";

const ReconstitutionCalculator = () => {
  const [peptideAmount, setPeptideAmount] = useState("5");
  const [bacWater, setBacWater] = useState("2");
  const [desiredDose, setDesiredDose] = useState("250");
  const [syringeIdx, setSyringeIdx] = useState("0");

  const syringe = syringeTypes[parseInt(syringeIdx)];

  const result = useMemo(() => {
    const pep = parseFloat(peptideAmount) || 0;
    const bac = parseFloat(bacWater) || 0;
    const dose = parseFloat(desiredDose) || 0;
    if (pep === 0 || bac === 0 || dose === 0) return null;
    const concentration = (pep * 1000) / bac; // mcg/mL
    const volumePerDose = dose / concentration; // mL
    const units = volumePerDose * syringe.multiplier;
    const totalDoses = (pep * 1000) / dose;
    return {
      concentration: concentration.toFixed(0),
      volumePerDose: parseFloat(volumePerDose.toFixed(4)),
      units: parseFloat(units.toFixed(1)),
      totalDoses: Math.floor(totalDoses),
    };
  }, [peptideAmount, bacWater, desiredDose, syringe]);

  const validations = useMemo<ValidationMessage[]>(() => {
    if (!result) return [];
    const msgs: ValidationMessage[] = [];
    if (result.volumePerDose < 0.01) {
      msgs.push({ level: "error", message: `Dose volume (${result.volumePerDose}mL) is below 0.01mL — too small to measure accurately with most syringes. Increase BAC water or dose.` });
    }
    if (result.volumePerDose > syringe.capacityMl) {
      msgs.push({ level: "error", message: `Dose volume (${result.volumePerDose.toFixed(2)}mL) exceeds syringe capacity (${syringe.capacityMl}mL). Use less BAC water, reduce dose, or use a larger syringe.` });
    } else if (result.volumePerDose > syringe.capacityMl * 0.9) {
      msgs.push({ level: "warning", message: "Dose volume is near syringe capacity. Consider using a larger syringe for easier measurement." });
    }
    if (result.volumePerDose >= 0.01 && result.volumePerDose <= syringe.capacityMl) {
      msgs.push({ level: "success", message: `Draw ${result.units} units on your ${syringe.shortLabel} syringe — measurable and within capacity.` });
    }
    return msgs;
  }, [result, syringe]);

  const inputInvalid = (v: string) => {
    const n = parseFloat(v);
    return v !== "" && (isNaN(n) || n < 0);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-accent">
          <Beaker className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">Reconstitution Calculator</h2>
          <p className="text-xs text-muted-foreground">Calculate BAC water mixing ratios & syringe draw</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <Label className="text-sm font-medium">Peptide Amount (mg)</Label>
          <Input type="number" value={peptideAmount} onChange={(e) => setPeptideAmount(e.target.value)} className={`mt-1.5 ${inputInvalid(peptideAmount) ? "border-destructive" : ""}`} min="0" step="0.5" />
          {inputInvalid(peptideAmount) && <p className="text-xs text-destructive mt-1">Enter a valid positive number</p>}
        </div>
        <div>
          <Label className="text-sm font-medium">BAC Water (mL)</Label>
          <Input type="number" value={bacWater} onChange={(e) => setBacWater(e.target.value)} className={`mt-1.5 ${inputInvalid(bacWater) ? "border-destructive" : ""}`} min="0" step="0.5" />
          {inputInvalid(bacWater) && <p className="text-xs text-destructive mt-1">Enter a valid positive number</p>}
        </div>
        <div>
          <Label className="text-sm font-medium">Desired Dose (mcg)</Label>
          <Input type="number" value={desiredDose} onChange={(e) => setDesiredDose(e.target.value)} className={`mt-1.5 ${inputInvalid(desiredDose) ? "border-destructive" : ""}`} min="0" step="10" />
          {inputInvalid(desiredDose) && <p className="text-xs text-destructive mt-1">Enter a valid positive number</p>}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <Label className="text-sm font-medium">Syringe Type</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  <p><strong>U-100:</strong> 100 units = 1mL. Most common insulin syringe.</p>
                  <p className="mt-1"><strong>U-40:</strong> 40 units = 1mL. Less common, larger markings.</p>
                  <p className="mt-1"><strong>Tuberculin:</strong> Measured in mL directly. 1mL capacity.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={syringeIdx} onValueChange={setSyringeIdx}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>
              {syringeTypes.map((s, i) => (
                <SelectItem key={i} value={String(i)}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ValidationWarnings messages={validations} />

        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 p-5 rounded-xl bg-accent border border-primary/20">
            <h3 className="text-sm font-heading font-semibold text-accent-foreground mb-4">Results</h3>
            <div className="flex gap-6">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-heading font-bold text-foreground">{result.concentration}</div>
                  <div className="text-xs text-muted-foreground">mcg/mL concentration</div>
                </div>
                <div>
                  <div className="text-2xl font-heading font-bold text-foreground">{result.volumePerDose.toFixed(2)}mL</div>
                  <div className="text-xs text-muted-foreground">per dose</div>
                </div>
                <div>
                  <div className="text-2xl font-heading font-bold text-primary">
                    {syringe.type === "tuberculin" ? `${result.volumePerDose.toFixed(2)} mL` : `${result.units} units`}
                  </div>
                  <div className="text-xs text-muted-foreground">draw on {syringe.shortLabel}</div>
                </div>
                <div>
                  <div className="text-2xl font-heading font-bold text-foreground">{result.totalDoses}</div>
                  <div className="text-xs text-muted-foreground">total doses per vial</div>
                </div>
              </div>
              {syringe.type !== "tuberculin" && (
                <SyringeDiagram capacityMl={syringe.capacityMl} drawVolumeMl={result.volumePerDose} units={result.units} syringeLabel={syringe.shortLabel} />
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* How-to guide */}
      <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
        <h4 className="text-sm font-heading font-semibold text-foreground mb-3">How to Reconstitute</h4>
        <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
          <li>Gather supplies: peptide vial, BAC water, alcohol swabs, syringe</li>
          <li>Wipe vial tops with alcohol swabs</li>
          <li>Draw BAC water into syringe</li>
          <li>Inject slowly down the side of the vial (NOT onto powder)</li>
          <li>Swirl gently — do NOT shake</li>
          <li>Refrigerate at 2-8°C after reconstitution</li>
          <li>Use within 28-30 days</li>
        </ol>
      </div>

      {/* Safety info */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-muted/30 border border-border">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Storage</p>
          <p className="text-xs text-muted-foreground">Reconstituted: refrigerate 2-8°C, use within 2-8 weeks depending on peptide.</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 border border-border">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Sterility</p>
          <p className="text-xs text-muted-foreground">Always use bacteriostatic water and sterile technique. Never re-use needles.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ReconstitutionCalculator;
