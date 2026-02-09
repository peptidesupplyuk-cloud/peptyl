import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, FlaskConical, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BIOMARKERS, getMarkerStatus, getStatusBg, getStatusColor, type BiomarkerDef } from "@/data/biomarker-ranges";
import { useSaveBloodwork } from "@/hooks/use-bloodwork";
import { useToast } from "@/hooks/use-toast";

const BloodworkForm = ({ onSaved }: { onSaved?: () => void }) => {
  const [testDate, setTestDate] = useState<Date>(new Date());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const saveBloodwork = useSaveBloodwork();
  const { toast } = useToast();

  const basicMarkers = BIOMARKERS.filter((m) => m.panel === "basic");
  const advancedMarkers = BIOMARKERS.filter((m) => m.panel === "advanced");

  const setValue = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async () => {
    const markers = BIOMARKERS
      .filter((m) => values[m.key] && !isNaN(parseFloat(values[m.key])))
      .map((m) => ({
        marker_name: m.key,
        value: parseFloat(values[m.key]),
        unit: m.unit,
      }));

    if (markers.length === 0) {
      toast({ title: "No values entered", description: "Please enter at least one biomarker value.", variant: "destructive" });
      return;
    }

    try {
      await saveBloodwork.mutateAsync({
        testDate: format(testDate, "yyyy-MM-dd"),
        panelType: showAdvanced ? "advanced" : "basic",
        markers,
      });
      toast({ title: "Bloodwork saved", description: `${markers.length} markers recorded.` });
      setValues({});
      onSaved?.();
    } catch {
      toast({ title: "Error saving", description: "Please try again.", variant: "destructive" });
    }
  };

  const renderMarkerGroup = (markers: BiomarkerDef[]) => {
    const grouped = markers.reduce<Record<string, BiomarkerDef[]>>((acc, m) => {
      (acc[m.category] = acc[m.category] || []).push(m);
      return acc;
    }, {});

    return Object.entries(grouped).map(([category, items]) => (
      <div key={category}>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{category}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((m) => {
            const val = values[m.key] ? parseFloat(values[m.key]) : undefined;
            const status = val !== undefined && !isNaN(val) ? getMarkerStatus(m, val) : undefined;

            return (
              <div key={m.key} className={cn("rounded-xl border p-3 transition-colors", status ? getStatusBg(status) : "border-border")}>
                <Label className="text-sm font-medium flex items-center justify-between">
                  {m.name}
                  <span className="text-xs text-muted-foreground font-normal">
                    {m.optimalMin}–{m.optimalMax} {m.unit}
                  </span>
                </Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <Input
                    type="number"
                    placeholder={`${m.refMin}–${m.refMax}`}
                    value={values[m.key] || ""}
                    onChange={(e) => setValue(m.key, e.target.value)}
                    className="h-9"
                    step="any"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{m.unit}</span>
                </div>
                {status && (
                  <p className={cn("text-xs mt-1 font-medium", getStatusColor(status))}>
                    {status === "optimal" ? "✓ Optimal" : status === "suboptimal" ? "⚠ Suboptimal" : "✗ Out of range"}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <Label className="text-sm font-medium">Test Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal mt-1", !testDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {testDate ? format(testDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={testDate}
                onSelect={(d) => d && setTestDate(d)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Basic Panel */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-heading font-semibold text-foreground">Basic Panel</h3>
        </div>
        <div className="space-y-6">{renderMarkerGroup(basicMarkers)}</div>
      </div>

      {/* Advanced Panel Toggle */}
      <Button
        variant="outline"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-primary" />
          Advanced Panel (Hormone Optimisation)
        </span>
        {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {showAdvanced && (
        <div className="space-y-6">{renderMarkerGroup(advancedMarkers)}</div>
      )}

      <div className="flex gap-3 pt-2">
        <Button onClick={handleSubmit} disabled={saveBloodwork.isPending} className="shadow-brand">
          {saveBloodwork.isPending ? "Saving..." : "Save Bloodwork"}
        </Button>
      </div>
    </div>
  );
};

export default BloodworkForm;
