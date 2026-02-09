import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Syringe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { peptideConfigs } from "@/data/calculator-peptides";
import WeightBadge from "./WeightBadge";

const DoseCalculator = () => {
  const [bodyWeight, setBodyWeight] = useState("80");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [selectedPeptide, setSelectedPeptide] = useState("bpc157");
  const [doseSlider, setDoseSlider] = useState([50]);

  const config = peptideConfigs[selectedPeptide];
  const weightKg = weightUnit === "kg" ? parseFloat(bodyWeight) || 0 : (parseFloat(bodyWeight) || 0) * 0.453592;

  const recommendedDose = useMemo(() => {
    if (!config) return 0;
    if (config.weightDosing === "weight-based" && config.weightDoseMin && config.weightDoseMax && weightKg > 0) {
      const minDose = config.weightDoseMin * weightKg;
      const maxDose = config.weightDoseMax * weightKg;
      return Math.round(minDose + (doseSlider[0] / 100) * (maxDose - minDose));
    }
    return Math.round(config.min + (doseSlider[0] / 100) * (config.max - config.min));
  }, [config, doseSlider, weightKg]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-accent">
          <Syringe className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">Dose Recommendation</h2>
          <p className="text-xs text-muted-foreground">Get personalised dose guidance</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <Label className="text-sm font-medium">Select Peptide</Label>
          <Select value={selectedPeptide} onValueChange={(v) => { setSelectedPeptide(v); setDoseSlider([50]); }}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(peptideConfigs).map(([key, info]) => (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    {info.name}
                    <WeightBadge type={info.weightDosing} />
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {config && (
          <div className="flex items-center gap-2">
            <WeightBadge type={config.weightDosing} />
            <span className="text-xs text-muted-foreground">
              {config.weightDosing === "independent" ? "Standard dose works for most individuals" : "Dose adjusted based on body weight"}
            </span>
          </div>
        )}

        <div>
          <Label className="text-sm font-medium">Body Weight {config?.weightDosing === "weight-based" && <span className="text-warm">*required</span>}</Label>
          <div className="flex gap-2 mt-1.5">
            <Input type="number" value={bodyWeight} onChange={(e) => setBodyWeight(e.target.value)} min="0" className="flex-1" />
            <Select value={weightUnit} onValueChange={setWeightUnit}>
              <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="lbs">lbs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">
            Dose Level: {doseSlider[0] <= 33 ? "Low" : doseSlider[0] <= 66 ? "Moderate" : "High"}
          </Label>
          <Slider value={doseSlider} onValueChange={setDoseSlider} max={100} step={1} className="mt-3" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Conservative</span>
            <span>Aggressive</span>
          </div>
        </div>

        {config && (
          <motion.div key={selectedPeptide + doseSlider[0]} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 p-5 rounded-xl bg-accent border border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-heading font-semibold text-accent-foreground">
                {config.name}
              </h3>
              <WeightBadge type={config.weightDosing} />
            </div>
            <div className="text-3xl font-heading font-bold text-primary mb-1">
              {recommendedDose} mcg
              {config.weightDosing === "weight-based" && weightKg > 0 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({(recommendedDose / weightKg).toFixed(1)} mcg/kg)
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{config.unit}</p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-3">{config.note}</p>

            {/* Peptide details */}
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Frequency</p>
                <p className="text-xs text-foreground mt-0.5">{config.typicalFrequency}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Cycle Length</p>
                <p className="text-xs text-foreground mt-0.5">{config.typicalCycleWeeks[0]}-{config.typicalCycleWeeks[1]} weeks</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Dose Range</p>
                <p className="text-xs text-foreground mt-0.5">{config.min}-{config.max} {config.unit}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Vial Sizes</p>
                <p className="text-xs text-foreground mt-0.5">{config.commonVialSizes.map(v => `${v}mg`).join(", ")}</p>
              </div>
            </div>

            {weightKg > 0 && (
              <p className="text-xs text-muted-foreground mt-3">
                Body weight: {weightKg.toFixed(1)} kg
                {config.weightDosing === "independent" && " — dose is weight-independent for this peptide."}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DoseCalculator;
