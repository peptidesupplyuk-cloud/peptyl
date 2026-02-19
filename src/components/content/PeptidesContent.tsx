import { useState } from "react";
import { Search, Database, Layers } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PeptideCard from "@/components/PeptideCard";
import StackBuilder from "@/components/StackBuilder";
import PeptideActionBlock from "@/components/PeptideActionBlock";
import { peptides, categories } from "@/data/peptides";

type Tab = "database" | "stacks";

const PeptidesContent = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("database");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = peptides.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <>
      <div className="max-w-2xl mb-8">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-3">
          {t("peptidesPage.title")} <span className="text-gradient-teal">{t("peptidesPage.titleHighlight")}</span>
        </h2>
        <p className="text-muted-foreground text-lg">
          {tab === "database"
            ? t("peptidesPage.subtitleDb", { count: filtered.length })
            : t("peptidesPage.subtitleStacks")}
        </p>
      </div>

      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setTab("database")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === "database"
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <Database className="h-4 w-4" />
          {t("peptidesPage.database")}
        </button>
        <button
          onClick={() => setTab("stacks")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === "stacks"
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4" />
          {t("peptidesPage.stackBuilder")}
        </button>
      </div>

      {tab === "database" && (
        <>
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
      )}

      {tab === "stacks" && <StackBuilder />}
    </>
  );
};

export default PeptidesContent;
