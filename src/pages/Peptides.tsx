import { useState } from "react";
import { Search, Database, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PeptideCard from "@/components/PeptideCard";
import StackBuilder from "@/components/StackBuilder";
import { peptides, categories } from "@/data/peptides";

type Tab = "database" | "stacks";

const PeptidesPage = () => {
  const [tab, setTab] = useState<Tab>("database");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userVotes, setUserVotes] = useState<Record<string, Record<number, "up" | "down">>>({});

  const filtered = peptides.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleVote = (peptideName: string, expIndex: number, direction: "up" | "down") => {
    setUserVotes((prev) => ({
      ...prev,
      [peptideName]: {
        ...prev[peptideName],
        [expIndex]: prev[peptideName]?.[expIndex] === direction ? undefined! : direction,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-8">
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3">
              Peptide <span className="text-gradient-teal">Database</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              {tab === "database"
                ? `${filtered.length} peptides. Community-curated profiles with voting on experiences.`
                : "Build and verify peptide stacks with compatibility checking."}
            </p>
          </div>

          {/* Tabs */}
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
              Database
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
              Stack Builder
            </button>
          </div>

          {tab === "database" && (
            <>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search peptides..."
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

              {/* Peptide cards */}
              <div className="space-y-4">
                {filtered.map((peptide, pi) => (
                  <PeptideCard
                    key={peptide.name}
                    peptide={peptide}
                    index={pi}
                    userVotes={userVotes[peptide.name] || {}}
                    onVote={(ei, dir) => handleVote(peptide.name, ei, dir)}
                  />
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <p className="text-lg">No peptides found matching your search.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {tab === "stacks" && <StackBuilder />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PeptidesPage;
