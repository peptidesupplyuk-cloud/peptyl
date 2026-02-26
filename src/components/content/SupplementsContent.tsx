import { useState, useMemo } from "react";
import { Search, Pill, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SupplementCard from "@/components/SupplementCard";
import CategoryGroup from "@/components/CategoryGroup";
import { supplements as staticSupplements, supplementCategories } from "@/data/supplements";
import { useEnrichedSupplements } from "@/hooks/use-enriched-supplements";
import type { SupplementData } from "@/data/supplements";
import { Sparkles, Zap, Heart, Brain, Shield, Flame, Clock, Activity } from "lucide-react";

const iconMap: Record<string, any> = {
  "Longevity & NAD+": Sparkles,
  "Mitochondrial Support": Zap,
  "Cardiovascular": Heart,
  "Cognitive": Brain,
  "Gut Health": Shield,
  "Immune Support": Shield,
  "Hormonal Support": Activity,
  "Anti-Inflammatory": Flame,
  "Sleep & Recovery": Clock,
  "Methylation": Activity,
  "Antioxidant": Shield,
  "Joint & Connective Tissue": Heart,
  "Metabolic": Flame,
};

const gradeOrder: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

const SupplementsContent = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const { data: enrichedSupplements } = useEnrichedSupplements();

  const supplements: SupplementData[] = (enrichedSupplements && enrichedSupplements.length > 0)
    ? enrichedSupplements.map((es) => {
        const staticMatch = staticSupplements.find(
          (ss) => ss.name.toLowerCase() === es.name.toLowerCase()
        );
        return {
          name: es.name,
          fullName: staticMatch?.fullName || es.name,
          category: es.category || "Uncategorized",
          description: es.description || "",
          icon: staticMatch?.icon || iconMap[es.category || ""] || Pill,
          form: es.best_form || staticMatch?.form || "",
          doseRange: es.dose_range || staticMatch?.doseRange || "",
          timing: es.timing || staticMatch?.timing || "",
          halfLife: staticMatch?.halfLife,
          synergies: es.synergistic_supplements || staticMatch?.synergies,
          contraindications: es.contraindications || staticMatch?.contraindications,
          biomarkerTargets: es.biomarker_targets
            ? (es.biomarker_targets as any[]).map((b: any) => b.name || b)
            : staticMatch?.biomarkerTargets,
          evidenceGrade: (es.evidence_grade as "A" | "B" | "C" | "D") || staticMatch?.evidenceGrade || "D",
          benefits: es.primary_effects || staticMatch?.benefits || [],
          notes: es.cycling_notes || staticMatch?.notes,
          keyStudies: es.key_research_refs
            ? (es.key_research_refs as any[]).map((r: any) => r.one_line_summary || r.title || r)
            : staticMatch?.keyStudies,
        };
      })
    : staticSupplements;

  const filtered = supplements.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      s.fullName.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.benefits.some((b) => b.toLowerCase().includes(q));
    const matchesCat = selectedCategory === "All" || s.category === selectedCategory;
    const matchesGrade = selectedGrade === "All" || s.evidenceGrade === selectedGrade;
    return matchesSearch && matchesCat && matchesGrade;
  }).sort((a, b) => (gradeOrder[a.evidenceGrade] ?? 3) - (gradeOrder[b.evidenceGrade] ?? 3));

  const grouped = useMemo(() => {
    const map = new Map<string, SupplementData[]>();
    filtered.forEach((s) => {
      const list = map.get(s.category) || [];
      list.push(s);
      map.set(s.category, list);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <>
      <div className="max-w-2xl mb-8">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-3">
          Supplement <span className="text-gradient-teal">Knowledge Base</span>
        </h2>
        <p className="text-muted-foreground text-lg">
          {filtered.length} evidence-graded supplements with dosing protocols, synergies, biomarker targets, and clinical references.
        </p>
      </div>

      <div className="relative max-w-md mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search supplements, benefits, biomarkers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {supplementCategories
              .filter((c) => c === "All" || supplements.some((s) => s.category === c))
              .map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Evidence Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Grades</SelectItem>
            <SelectItem value="A">Grade A — Strong</SelectItem>
            <SelectItem value="B">Grade B — Moderate</SelectItem>
            <SelectItem value="C">Grade C — Preliminary</SelectItem>
            <SelectItem value="D">Grade D — Anecdotal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        {grouped.map(([category, items]) => {
          const bestGrade = items.reduce((best, s) => {
            const g = s.evidenceGrade || "D";
            return (gradeOrder[g] ?? 3) < (gradeOrder[best] ?? 3) ? g : best;
          }, "D");
          return (
            <CategoryGroup key={category} category={category} count={items.length} bestGrade={bestGrade}>
              {items.map((supp, i) => (
                <SupplementCard key={supp.name} supplement={supp} index={i} />
              ))}
            </CategoryGroup>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Pill className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="text-lg">No supplements found matching your search.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default SupplementsContent;
