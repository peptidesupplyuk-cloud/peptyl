import { useState } from "react";
import { Search, Pill } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SupplementCard from "@/components/SupplementCard";
import { supplements, supplementCategories } from "@/data/supplements";

const SupplementsContent = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = supplements.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      s.fullName.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.benefits.some((b) => b.toLowerCase().includes(q));
    const matchesCat = selectedCategory === "All" || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

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

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search supplements, benefits, biomarkers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {supplementCategories
            .filter((c) => c === "All" || supplements.some((s) => s.category === c))
            .map((cat) => (
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
        {filtered.map((supp, i) => (
          <SupplementCard key={supp.name} supplement={supp} index={i} />
        ))}
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
