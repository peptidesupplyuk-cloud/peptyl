import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Package, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { peptideConfigs, dosingFrequencies } from "@/data/calculator-peptides";
import WeightBadge from "./WeightBadge";

const CycleOrderCalculator = () => {
  const [selectedPeptide, setSelectedPeptide] = useState("bpc157");
  const [dosePerInjection, setDosePerInjection] = useState("250"); // mcg
  const [cycleDuration, setCycleDuration] = useState("8");
  const [durationUnit, setDurationUnit] = useState("weeks");
  const [frequencyIdx, setFrequencyIdx] = useState("0");
  const [customDaysPerWeek, setCustomDaysPerWeek] = useState("5");
  const [vialSize, setVialSize] = useState("5"); // mg
  const [includeBuffer, setIncludeBuffer] = useState(true);

  const config = peptideConfigs[selectedPeptide];
  const freq = dosingFrequencies[parseInt(frequencyIdx)];

  const result = useMemo(() => {
    const dose = parseFloat(dosePerInjection) || 0;
    const duration = parseFloat(cycleDuration) || 0;
    const vial = parseFloat(vialSize) || 0;
    if (dose === 0 || duration === 0 || vial === 0) return null;

    let daysTotal: number;
    if (durationUnit === "days") daysTotal = duration;
    else if (durationUnit === "weeks") daysTotal = duration * 7;
    else daysTotal = duration * 30;

    const weeksTotal = daysTotal / 7;

    let totalInjections: number;
    if (freq.label === "Custom") {
      const custom = parseFloat(customDaysPerWeek) || 0;
      totalInjections = Math.ceil(weeksTotal * custom);
    } else if (freq.perDay >= 1) {
      totalInjections = Math.ceil(daysTotal * freq.perDay);
    } else {
      totalInjections = Math.ceil(weeksTotal * freq.perWeek);
    }

    const totalPeptideMcg = dose * totalInjections;
    const totalPeptideMg = totalPeptideMcg / 1000;
    const rawVials = totalPeptideMg / vial;
    const vialsNeeded = Math.ceil(rawVials);
    const totalOrderedMg = vialsNeeded * vial;
    const leftoverMg = totalOrderedMg - totalPeptideMg;
    const leftoverDoses = Math.floor((leftoverMg * 1000) / dose);

    const bufferVials = includeBuffer ? Math.ceil(vialsNeeded * 1.15) : vialsNeeded;
    const bufferMg = bufferVials * vial;

    return {
      daysTotal,
      weeksTotal: Math.round(weeksTotal * 10) / 10,
      totalInjections,
      totalPeptideMcg,
      totalPeptideMg: Math.round(totalPeptideMg * 100) / 100,
      vialsNeeded,
      bufferVials,
      bufferMg,
      totalOrderedMg,
      leftoverMg: Math.round(leftoverMg * 100) / 100,
      leftoverDoses,
      vialSizeMg: vial,
    };
  }, [dosePerInjection, cycleDuration, durationUnit, freq, customDaysPerWeek, vialSize, includeBuffer]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border border-border p-6 sm:p-8 lg:col-span-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-accent">
          <Package className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">Cycle & Order Calculator</h2>
          <p className="text-xs text-muted-foreground">Calculate how much to order for your full treatment cycle</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Peptide</Label>
            <Select value={selectedPeptide} onValueChange={(v) => {
              setSelectedPeptide(v);
              const c = peptideConfigs[v];
              if (c) setVialSize(String(c.commonVialSizes[0]));
            }}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(peptideConfigs).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">{info.name} <WeightBadge type={info.weightDosing} /></span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Dose per Injection (mcg)</Label>
            <Input type="number" value={dosePerInjection} onChange={(e) => setDosePerInjection(e.target.value)} className="mt-1.5" min="0" step="10" />
          </div>

          <div>
            <Label className="text-sm font-medium">Cycle Duration</Label>
            <div className="flex gap-2 mt-1.5">
              <Input type="number" value={cycleDuration} onChange={(e) => setCycleDuration(e.target.value)} min="1" className="flex-1" />
              <Select value={durationUnit} onValueChange={setDurationUnit}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {config && (
              <p className="text-xs text-muted-foreground mt-1">Typical: {config.typicalCycleWeeks[0]}-{config.typicalCycleWeeks[1]} weeks</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium">Dosing Frequency</Label>
            <Select value={frequencyIdx} onValueChange={setFrequencyIdx}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {dosingFrequencies.map((f, i) => (
                  <SelectItem key={i} value={String(i)}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {freq.label === "Custom" && (
              <div className="mt-2">
                <Label className="text-xs">Days per week</Label>
                <Input type="number" value={customDaysPerWeek} onChange={(e) => setCustomDaysPerWeek(e.target.value)} min="1" max="7" className="mt-1" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <Label className="text-sm font-medium">Vial Size (mg)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild><Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                  <TooltipContent className="text-xs max-w-xs">Common sizes: {config?.commonVialSizes.map(v => `${v}mg`).join(", ")}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={vialSize} onValueChange={setVialSize}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[...new Set([...(config?.commonVialSizes || []), 2, 5, 10, 15, 20, 30])].sort((a, b) => a - b).map(v => (
                  <SelectItem key={v} value={String(v)}>{v}mg {config?.commonVialSizes.includes(v) ? "✓" : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={includeBuffer} onChange={(e) => setIncludeBuffer(e.target.checked)} className="rounded border-border" />
            <span className="text-xs text-muted-foreground">Include ~15% buffer for waste/measurement error</span>
          </label>
        </div>

        {/* Results */}
        <div>
          {result ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-5 rounded-xl bg-accent border border-primary/20 h-full">
              <h3 className="text-sm font-heading font-semibold text-accent-foreground mb-4">Cycle Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-xs text-muted-foreground">Duration</span>
                  <span className="text-sm font-medium text-foreground">{result.weeksTotal} weeks ({result.daysTotal} days)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-xs text-muted-foreground">Frequency</span>
                  <span className="text-sm font-medium text-foreground">{freq.label === "Custom" ? `${customDaysPerWeek}x/week` : freq.label}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-xs text-muted-foreground">Dose per injection</span>
                  <span className="text-sm font-medium text-foreground">{dosePerInjection} mcg</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-xs text-muted-foreground">Total doses needed</span>
                  <span className="text-sm font-bold text-foreground">{result.totalInjections}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-xs text-muted-foreground">Total peptide needed</span>
                  <span className="text-sm font-bold text-foreground">{result.totalPeptideMg} mg</span>
                </div>

                {/* Order card */}
                <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-2">Order Recommendation</p>
                  <div className="text-2xl font-heading font-bold text-primary">
                    {includeBuffer ? result.bufferVials : result.vialsNeeded} vials
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {includeBuffer ? result.bufferVials : result.vialsNeeded} × {result.vialSizeMg}mg = {includeBuffer ? result.bufferMg : result.totalOrderedMg}mg total
                  </p>
                  {!includeBuffer && result.leftoverDoses > 0 && (
                    <p className="text-xs text-success mt-1">
                      Leftover: {result.leftoverMg}mg ({result.leftoverDoses} extra doses as buffer)
                    </p>
                  )}
                  {includeBuffer && (
                    <p className="text-xs text-muted-foreground mt-1 italic">Includes ~15% buffer for waste</p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-2 italic">
                  💡 Tip: Order enough vials for your full cycle to avoid interruptions.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full p-8 rounded-xl border border-dashed border-border">
              <p className="text-sm text-muted-foreground text-center">Fill in the fields to see your cycle summary and order recommendation.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CycleOrderCalculator;
