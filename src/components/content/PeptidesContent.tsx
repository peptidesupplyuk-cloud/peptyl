import { useMemo, useState } from "react";
import { Search, FlaskConical, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PeptideCard from "@/components/PeptideCard";
import PeptideActionBlock from "@/components/PeptideActionBlock";
import { peptides as staticPeptides, categories } from "@/data/peptides";
import { useEnrichedPeptides } from "@/hooks/use-enriched-peptides";
import type { PeptideData } from "@/data/peptides";
import { useAuth } from "@/contexts/AuthContext";

const PeptidesContent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
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

  const gradeOrder: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

  const filtered = peptides.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  }).sort((a, b) => (gradeOrder[a.evidenceGrade || "D"] ?? 3) - (gradeOrder[b.evidenceGrade || "D"] ?? 3));

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

      <div className="flex gap-2 mb-8">
        <Button variant="default" className="gap-2" onClick={handleCreateProtocol}>
          <Plus className="h-4 w-4" />
          Create Your Protocol
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("peptidesPage.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.filter(c => {
            if (c === "All") return true;
            return peptides.some(p => p.category === c);
          }).map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="text-xs"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((peptide, pi) => (
          <PeptideCard
            key={peptide.name}
            peptide={peptide}
            index={pi}
            userVotes={{}}
            onVote={() => {}}
          />
        ))}
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
