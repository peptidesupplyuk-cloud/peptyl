import { useMemo, useState } from "react";
import { Search, FlaskConical, Plus, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PeptideCard from "@/components/PeptideCard";
import CategoryGroup from "@/components/CategoryGroup";
import PeptideActionBlock from "@/components/PeptideActionBlock";
import { peptides as staticPeptides, categories } from "@/data/peptides";
import { useEnrichedPeptides } from "@/hooks/use-enriched-peptides";
import type { PeptideData } from "@/data/peptides";
import { useAuth } from "@/contexts/AuthContext";

const gradeOrder: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

const PeptidesContent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const { data: enrichedPeptides } = useEnrichedPeptides();

  const peptides: PeptideData[] = useMemo(() => {
    if (!enrichedPeptides || enrichedPeptides.length === 0) return staticPeptides;

    return enrichedPeptides.map((ep) => {
      const staticMatch = staticPeptides.find(
        (sp) => sp.name.toLowerCase() === ep.name.toLowerCase()
      );
      return {
        name: ep.name,
        fullName: ep.full_name || staticMatch?.fullName || ep.name,
        category: ep.category || staticMatch?.category || "Uncategorised",
        description: ep.description || staticMatch?.description || "",
        icon: staticMatch?.icon || FlaskConical,
        administration: ep.administration?.[0] || staticMatch?.administration || "Subcutaneous",
        frequency: ep.frequency || staticMatch?.frequency || "",
        doseRange: ep.dose_range || staticMatch?.doseRange,
        cycleDuration: ep.cycle_duration || staticMatch?.cycleDuration,
        notes: ep.dosing_notes || staticMatch?.notes,
        evidenceGrade: (ep.evidence_grade as "A" | "B" | "C" | "D") || staticMatch?.evidenceGrade,
        benefits: ep.primary_effects || staticMatch?.benefits || [],
        regulatoryStatus: staticMatch?.regulatoryStatus,
        experiences: staticMatch?.experiences || [],
      };
    });
  }, [enrichedPeptides]);

  const filtered = peptides.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchesGrade = selectedGrade === "All" || (p.evidenceGrade || "D") === selectedGrade;
    return matchesSearch && matchesCat && matchesGrade;
  }).sort((a, b) => (gradeOrder[a.evidenceGrade || "D"] ?? 3) - (gradeOrder[b.evidenceGrade || "D"] ?? 3));

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, PeptideData[]>();
    filtered.forEach((p) => {
      const list = map.get(p.category) || [];
      list.push(p);
      map.set(p.category, list);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const handleCreateProtocol = () => {
    if (user) {
      navigate("/dashboard?tab=protocols");
    } else {
      navigate("/auth");
    }
  };

  return (
    <>
      <div className="max-w-2xl mb-8">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-3">
          {t("peptidesPage.title")} <span className="text-gradient-teal">{t("peptidesPage.titleHighlight")}</span>
        </h2>
        <p className="text-muted-foreground text-lg">
          {t("peptidesPage.subtitleDb", { count: filtered.length })}
        </p>
      </div>

      <div className="relative max-w-md mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("peptidesPage.searchPlaceholder")}
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
            {categories.filter(c => c === "All" || peptides.some(p => p.category === c)).map((cat) => (
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

        <Button variant="default" className="gap-2" onClick={handleCreateProtocol}>
          <Plus className="h-4 w-4" />
          Create Your Protocol
        </Button>
      </div>

      <div className="space-y-1">
        {grouped.map(([category, items]) => {
          const bestGrade = items.reduce((best, p) => {
            const g = p.evidenceGrade || "D";
            return (gradeOrder[g] ?? 3) < (gradeOrder[best] ?? 3) ? g : best;
          }, "D");
          return (
            <CategoryGroup key={category} category={category} count={items.length} bestGrade={bestGrade}>
              {items.map((peptide, pi) => (
                <PeptideCard
                  key={peptide.name}
                  peptide={peptide}
                  index={pi}
                  userVotes={{}}
                  onVote={() => {}}
                />
              ))}
            </CategoryGroup>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">{t("peptidesPage.noResults")}</p>
          </div>
        )}
      </div>

      <PeptideActionBlock />
    </>
  );
};

export default PeptidesContent;
