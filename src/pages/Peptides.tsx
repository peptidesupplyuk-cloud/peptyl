import { useState } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Search, Filter, ChevronDown, AlertTriangle, TrendingUp, Clock, Zap, Shield, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface PeptideExperience {
  text: string;
  votes: number;
  sentiment: "positive" | "caution" | "neutral";
}

interface PeptideData {
  name: string;
  category: string;
  description: string;
  icon: typeof Heart;
  experiences: PeptideExperience[];
}

const peptides: PeptideData[] = [
  {
    name: "BPC-157",
    category: "Recovery",
    description: "Body Protection Compound. A pentadecapeptide studied for its regenerative properties on tendons, ligaments, and gut tissue.",
    icon: Shield,
    experiences: [
      { text: "Significant improvement in tendon recovery within 2-4 weeks", votes: 1243, sentiment: "positive" },
      { text: "Reduced inflammation in gut lining observed after 1 week", votes: 812, sentiment: "positive" },
      { text: "Mild nausea when taken on empty stomach", votes: 234, sentiment: "caution" },
    ],
  },
  {
    name: "GHK-Cu",
    category: "Skin & Hair",
    description: "Copper peptide with research showing benefits for skin remodelling, wound healing, and hair follicle stimulation.",
    icon: Heart,
    experiences: [
      { text: "Noticeable skin texture improvement after 3-4 weeks", votes: 678, sentiment: "positive" },
      { text: "Skin breakouts or stinging at injection site in first few weeks", votes: 496, sentiment: "caution" },
      { text: "Improved hair thickness over 8-12 weeks of use", votes: 312, sentiment: "positive" },
    ],
  },
  {
    name: "TB-500",
    category: "Recovery",
    description: "Thymosin Beta-4 fragment studied for tissue repair, anti-inflammatory effects, and wound healing acceleration.",
    icon: Zap,
    experiences: [
      { text: "Best results when combined with BPC-157 for joint recovery", votes: 892, sentiment: "positive" },
      { text: "Reduced muscle soreness and faster recovery from training", votes: 567, sentiment: "positive" },
      { text: "Takes 4-6 weeks to see significant results", votes: 445, sentiment: "neutral" },
    ],
  },
  {
    name: "Ipamorelin",
    category: "Growth Hormone",
    description: "Selective GH secretagogue that stimulates growth hormone release with minimal effect on cortisol or prolactin.",
    icon: TrendingUp,
    experiences: [
      { text: "Improved sleep quality noticed within the first week", votes: 634, sentiment: "positive" },
      { text: "Water retention during first 2 weeks, resolves on its own", votes: 389, sentiment: "caution" },
      { text: "Enhanced recovery and body composition over 8-12 weeks", votes: 521, sentiment: "positive" },
    ],
  },
  {
    name: "CJC-1295 (no DAC)",
    category: "Growth Hormone",
    description: "Modified GHRH analogue often paired with Ipamorelin to amplify pulsatile GH release.",
    icon: TrendingUp,
    experiences: [
      { text: "Synergistic effect with Ipamorelin for sleep and recovery", votes: 723, sentiment: "positive" },
      { text: "Tingling in extremities reported by some in early weeks", votes: 198, sentiment: "caution" },
      { text: "Fat loss visible from week 6 onwards at consistent doses", votes: 456, sentiment: "positive" },
    ],
  },
  {
    name: "Semaglutide",
    category: "Metabolic",
    description: "GLP-1 receptor agonist researched extensively for appetite regulation and metabolic improvement.",
    icon: Clock,
    experiences: [
      { text: "Significant appetite reduction from first dose", votes: 1567, sentiment: "positive" },
      { text: "Nausea common during dose escalation phase", votes: 1102, sentiment: "caution" },
      { text: "Steady weight loss of 1-2 lbs per week at therapeutic dose", votes: 934, sentiment: "positive" },
    ],
  },
];

const categories = ["All", "Recovery", "Skin & Hair", "Growth Hormone", "Metabolic"];

const PeptidesPage = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userVotes, setUserVotes] = useState<Record<string, Record<number, "up" | "down">>>({});

  const filtered = peptides.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
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
          {/* Header */}
          <div className="max-w-2xl mb-12">
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3">
              Peptide <span className="text-gradient-teal">Database</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Community-curated peptide profiles. Vote on experiences to improve our recommendations.
            </p>
          </div>

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
              {categories.map((cat) => (
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
          <div className="space-y-6">
            {filtered.map((peptide, pi) => (
              <motion.div
                key={peptide.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: pi * 0.05 }}
                className="bg-card rounded-2xl border border-border p-6 sm:p-8 hover:border-primary/20 transition-all"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-accent">
                    <peptide.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-heading font-bold text-foreground">{peptide.name}</h2>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {peptide.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{peptide.description}</p>
                  </div>
                </div>

                {/* Experiences with voting */}
                <div className="space-y-3">
                  <h3 className="text-sm font-heading font-semibold text-foreground flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5" />
                    Community Experiences
                  </h3>
                  {peptide.experiences.map((exp, ei) => {
                    const vote = userVotes[peptide.name]?.[ei];
                    const adjustedVotes = exp.votes + (vote === "up" ? 1 : vote === "down" ? -1 : 0);
                    return (
                      <div key={ei} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 group">
                        <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${
                          exp.sentiment === "positive" ? "bg-success/10 text-success" :
                          exp.sentiment === "caution" ? "bg-warm/10 text-warm" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {exp.sentiment === "positive" ? <TrendingUp className="h-3.5 w-3.5" /> :
                           exp.sentiment === "caution" ? <AlertTriangle className="h-3.5 w-3.5" /> :
                           <Clock className="h-3.5 w-3.5" />}
                        </div>
                        <p className="flex-1 text-sm text-foreground/80 leading-relaxed">{exp.text}</p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleVote(peptide.name, ei, "up")}
                            className={`p-1.5 rounded-lg transition-colors ${
                              vote === "up"
                                ? "bg-success/20 text-success"
                                : "hover:bg-muted text-muted-foreground"
                            }`}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-xs font-medium text-muted-foreground min-w-[2.5rem] text-center">
                            {adjustedVotes.toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleVote(peptide.name, ei, "down")}
                            className={`p-1.5 rounded-lg transition-colors ${
                              vote === "down"
                                ? "bg-destructive/20 text-destructive"
                                : "hover:bg-muted text-muted-foreground"
                            }`}
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PeptidesPage;
