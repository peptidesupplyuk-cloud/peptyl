import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Beaker, Syringe, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CalculatorsPage = () => {
  // Reconstitution calculator state
  const [peptideAmount, setPeptideAmount] = useState<string>("5");
  const [bacWater, setBacWater] = useState<string>("2");
  const [desiredDose, setDesiredDose] = useState<string>("250");

  const reconResult = useMemo(() => {
    const pep = parseFloat(peptideAmount) || 0;
    const bac = parseFloat(bacWater) || 0;
    const dose = parseFloat(desiredDose) || 0;
    if (pep === 0 || bac === 0 || dose === 0) return null;
    const concentration = (pep * 1000) / bac; // mcg/ml
    const volumePerDose = dose / concentration; // ml
    const iu = volumePerDose * 100; // IU (on a standard insulin syringe)
    const totalDoses = (pep * 1000) / dose;
    return {
      concentration: concentration.toFixed(0),
      volumePerDose: volumePerDose.toFixed(2),
      iu: iu.toFixed(1),
      totalDoses: Math.floor(totalDoses),
    };
  }, [peptideAmount, bacWater, desiredDose]);

  // Dose calculator state
  const [bodyWeight, setBodyWeight] = useState<string>("80");
  const [weightUnit, setWeightUnit] = useState<string>("kg");
  const [selectedPeptide, setSelectedPeptide] = useState<string>("bpc157");
  const [doseSlider, setDoseSlider] = useState([50]);

  const doseRanges: Record<string, { name: string; min: number; max: number; unit: string; note: string }> = {
    bpc157: { name: "BPC-157", min: 200, max: 800, unit: "mcg/day", note: "Typically split into 2 doses, morning and evening" },
    ghkcu: { name: "GHK-Cu", min: 100, max: 600, unit: "mcg/day", note: "Start low and increase gradually over 2 weeks" },
    tb500: { name: "TB-500", min: 2000, max: 5000, unit: "mcg/2x week", note: "Loading phase: higher dose for 4-6 weeks, then maintenance" },
    ipamorelin: { name: "Ipamorelin", min: 100, max: 300, unit: "mcg/dose", note: "Best taken before bed on an empty stomach" },
    semaglutide: { name: "Semaglutide", min: 250, max: 2500, unit: "mcg/week", note: "Start at lowest dose. Increase every 4 weeks as tolerated" },
  };

  const doseInfo = doseRanges[selectedPeptide];
  const weightKg = weightUnit === "kg" ? parseFloat(bodyWeight) || 0 : ((parseFloat(bodyWeight) || 0) * 0.453592);
  const recommendedDose = doseInfo ? Math.round(doseInfo.min + (doseSlider[0] / 100) * (doseInfo.max - doseInfo.min)) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3">
              Precision <span className="text-gradient-teal">Calculators</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Essential tools for accurate peptide preparation and dosing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Reconstitution Calculator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-accent">
                  <Beaker className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-bold text-foreground">Reconstitution Calculator</h2>
                  <p className="text-xs text-muted-foreground">Calculate BAC water mixing ratios</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-medium">Peptide Amount (mg)</Label>
                  <Input
                    type="number"
                    value={peptideAmount}
                    onChange={(e) => setPeptideAmount(e.target.value)}
                    className="mt-1.5"
                    min="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">BAC Water (ml)</Label>
                  <Input
                    type="number"
                    value={bacWater}
                    onChange={(e) => setBacWater(e.target.value)}
                    className="mt-1.5"
                    min="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Desired Dose (mcg)</Label>
                  <Input
                    type="number"
                    value={desiredDose}
                    onChange={(e) => setDesiredDose(e.target.value)}
                    className="mt-1.5"
                    min="0"
                    step="10"
                  />
                </div>

                {reconResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-5 rounded-xl bg-accent border border-primary/20"
                  >
                    <h3 className="text-sm font-heading font-semibold text-accent-foreground mb-4">Results</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-heading font-bold text-foreground">{reconResult.concentration}</div>
                        <div className="text-xs text-muted-foreground">mcg/ml concentration</div>
                      </div>
                      <div>
                        <div className="text-2xl font-heading font-bold text-foreground">{reconResult.volumePerDose}ml</div>
                        <div className="text-xs text-muted-foreground">per dose</div>
                      </div>
                      <div>
                        <div className="text-2xl font-heading font-bold text-primary">{reconResult.iu} IU</div>
                        <div className="text-xs text-muted-foreground">on insulin syringe</div>
                      </div>
                      <div>
                        <div className="text-2xl font-heading font-bold text-foreground">{reconResult.totalDoses}</div>
                        <div className="text-xs text-muted-foreground">total doses per vial</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Dose Recommendation Calculator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl border border-border p-6 sm:p-8"
            >
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
                  <Select value={selectedPeptide} onValueChange={setSelectedPeptide}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(doseRanges).map(([key, info]) => (
                        <SelectItem key={key} value={key}>{info.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Body Weight</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      type="number"
                      value={bodyWeight}
                      onChange={(e) => setBodyWeight(e.target.value)}
                      min="0"
                      className="flex-1"
                    />
                    <Select value={weightUnit} onValueChange={setWeightUnit}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
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
                  <Slider
                    value={doseSlider}
                    onValueChange={setDoseSlider}
                    max={100}
                    step={1}
                    className="mt-3"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Conservative</span>
                    <span>Aggressive</span>
                  </div>
                </div>

                {doseInfo && (
                  <motion.div
                    key={selectedPeptide + doseSlider[0]}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-5 rounded-xl bg-accent border border-primary/20"
                  >
                    <h3 className="text-sm font-heading font-semibold text-accent-foreground mb-4">
                      Recommended for {doseInfo.name}
                    </h3>
                    <div className="text-3xl font-heading font-bold text-primary mb-1">
                      {recommendedDose} {doseInfo.unit}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-3">
                      {doseInfo.note}
                    </p>
                    {weightKg > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Body weight: {weightKg.toFixed(1)} kg — dose may be adjusted proportionally.
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-8 max-w-lg mx-auto">
            These calculators are for research reference only. Always consult qualified professionals before any research protocol.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CalculatorsPage;
