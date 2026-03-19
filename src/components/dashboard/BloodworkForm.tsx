import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { CalendarIcon, FlaskConical, ChevronDown, ChevronUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { BIOMARKERS, getMarkerStatus, getStatusBg, getStatusColor, type BiomarkerDef } from "@/data/biomarker-ranges";
import { useSaveBloodwork } from "@/hooks/use-bloodwork";
import { useProtocols } from "@/hooks/use-protocols";
import { useToast } from "@/hooks/use-toast";
import BloodworkUpload from "./BloodworkUpload";

interface BloodworkFormProps {
  onSaved?: () => void;
  filterCategories?: string[];
  defaultProtocolId?: string | null;
  defaultIsRetest?: boolean;
}

const BloodworkForm = ({ onSaved, filterCategories, defaultProtocolId, defaultIsRetest }: BloodworkFormProps) => {
  const [testDate, setTestDate] = useState<Date>(new Date());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(defaultProtocolId ?? null);
  const [isRetest, setIsRetest] = useState(defaultIsRetest ?? false);
  const saveBloodwork = useSaveBloodwork();
  const { toast } = useToast();
  const { data: protocols } = useProtocols();

  // Sync defaults when they change (e.g. navigating from protocol completion modal)
  useEffect(() => {
    if (defaultProtocolId) setSelectedProtocolId(defaultProtocolId);
    if (defaultIsRetest) setIsRetest(true);
  }, [defaultProtocolId, defaultIsRetest]);

  const allBasic = BIOMARKERS.filter((m) => m.panel === "basic");
  const allAdvanced = BIOMARKERS.filter((m) => m.panel === "advanced");
  const basicMarkers = filterCategories ? allBasic.filter((m) => filterCategories.includes(m.category)) : allBasic;
  const advancedMarkers = filterCategories ? allAdvanced.filter((m) => filterCategories.includes(m.category)) : allAdvanced;

  // Filter protocols: active, paused, or completed within last 90 days
  const now = new Date();
  const ninetyDaysAgo = subDays(now, 90);
  const eligibleProtocols = (protocols ?? []).filter((p) => {
    if (p.status === "active" || p.status === "paused") return true;
    if (p.status === "completed" && new Date(p.updated_at) >= ninetyDaysAgo) return true;
    return false;
  });

  const setValue = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handlePdfParsed = (markers: Record<string, string>, parsedDate?: Date) => {
    setValues((prev) => ({ ...prev, ...markers }));
    if (parsedDate) setTestDate(parsedDate);
    // Auto-show advanced panel if any advanced markers were parsed
    const advKeys = new Set(allAdvanced.map(m => m.key));
    if (Object.keys(markers).some(k => advKeys.has(k))) {
      setShowAdvanced(true);
    }
  };

  const handleSubmit = async () => {
    const relevantMarkers = filterCategories
      ? BIOMARKERS.filter((m) => filterCategories.includes(m.category))
      : BIOMARKERS;
    const markers = relevantMarkers
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

    const basePanelType = filterCategories ? filterCategories[0].toLowerCase().replace(" ", "_") : (showAdvanced ? "advanced" : "basic");
    const panelType = isRetest ? `retest_${basePanelType}` : basePanelType;

    try {
      await saveBloodwork.mutateAsync({
        testDate: format(testDate, "yyyy-MM-dd"),
        panelType,
        markers,
        protocolId: selectedProtocolId,
      });
      toast({ title: "Bloodwork saved", description: `${markers.length} markers recorded.` });
      setValues({});
      setSelectedProtocolId(null);
      setIsRetest(false);
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
      {/* PDF Upload */}
      <BloodworkUpload onParsed={handlePdfParsed} />

      {/* Date Picker */}
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

      {/* Protocol Linking */}
      {eligibleProtocols.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Were you on a protocol when this test was taken?</Label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setSelectedProtocolId(null); setIsRetest(false); }}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                selectedProtocolId === null
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
              )}
            >
              Not linked
            </button>
            {eligibleProtocols.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProtocolId(p.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                  selectedProtocolId === p.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                )}
              >
                {p.name}
                {p.status !== "active" && (
                  <span className="ml-1 text-xs opacity-60">({p.status})</span>
                )}
              </button>
            ))}
          </div>

          {/* Retest Checkbox */}
          {selectedProtocolId && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is-retest"
                  checked={isRetest}
                  onCheckedChange={(checked) => setIsRetest(checked === true)}
                />
                <label htmlFor="is-retest" className="text-sm text-foreground cursor-pointer">
                  This is a retest — I want to compare to my previous results
                </label>
              </div>
              {isRetest && (
                <div className="flex items-start gap-2 pl-6">
                  <Info className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-primary">
                    We will calculate what changed since your baseline.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Basic Panel */}
      {basicMarkers.length > 0 && (
        <div>
          {!filterCategories && (
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-heading font-semibold text-foreground">Basic Panel</h3>
            </div>
          )}
          <div className="space-y-6">{renderMarkerGroup(basicMarkers)}</div>
        </div>
      )}

      {/* Advanced Panel Toggle */}
      {advancedMarkers.length > 0 && (
        <>
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
        </>
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
