import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Search,
  X,
  Check,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Minus,
  ChevronDown,
  ChevronUp,
  Beaker,
  Target,
  Sparkles,
  Shield,
  FlaskConical,
} from "lucide-react";
import { peptides } from "@/data/peptides";
import {
  recommendedStacks,
  getInteraction,
  type InteractionType,
  type RecommendedStack,
} from "@/data/peptide-stacks";

const interactionMeta: Record<
  InteractionType,
  { label: string; color: string; bg: string; icon: typeof CheckCircle2 }
> = {
  synergy: {
    label: "Synergy",
    color: "text-success",
    bg: "bg-success/10 border-success/20",
    icon: CheckCircle2,
  },
  caution: {
    label: "Caution",
    color: "text-warm",
    bg: "bg-warm/10 border-warm/20",
    icon: AlertTriangle,
  },
  neutral: {
    label: "Compatible",
    color: "text-muted-foreground",
    bg: "bg-muted/50 border-border",
    icon: Minus,
  },
  no_data: {
    label: "Insufficient Data",
    color: "text-muted-foreground",
    bg: "bg-muted/30 border-border",
    icon: HelpCircle,
  },
};

const evidenceBadge: Record<string, { label: string; class: string }> = {
  clinical: { label: "Clinical Trial Data", class: "bg-success/10 text-success" },
  established: { label: "Established Protocol", class: "bg-primary/10 text-primary" },
  emerging: { label: "Emerging Evidence", class: "bg-warm/10 text-warm" },
};

const goalIcons: Record<string, typeof Shield> = {
  "Healing & Recovery": Shield,
  "Growth Hormone": Sparkles,
  "Healing & Growth Hormone": Shield,
  "Weight Management": Target,
  "Cognitive Enhancement": FlaskConical,
  "Healing & Anti-Inflammatory": Shield,
  "Immune Support": Shield,
  "Anti-Aging & Energy": Sparkles,
};

// ── Recommended Stack Card ─────────────────────────────────────────────────

const StackCard = ({
  stack,
  onLoad,
}: {
  stack: RecommendedStack;
  onLoad: (peptides: string[]) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = goalIcons[stack.goal] || Beaker;
  const badge = evidenceBadge[stack.evidence];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-5 hover:border-primary/20 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-accent">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-foreground text-sm">
              {stack.name}
            </h3>
            <p className="text-xs text-muted-foreground">{stack.goal}</p>
          </div>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.class}`}>
          {badge.label}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {stack.peptides.map((p) => (
          <span
            key={p}
            className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
          >
            {p}
          </span>
        ))}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors mb-2"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {expanded ? "Less" : "Details & Protocol"}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {stack.description}
            </p>
            <div className="p-3 rounded-xl bg-muted/50 mb-3">
              <p className="text-xs font-medium text-foreground mb-1">Protocol</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{stack.protocol}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => onLoad(stack.peptides)}
        className="w-full text-xs font-medium py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
      >
        Load into Builder
      </button>
    </motion.div>
  );
};

// ── Main Stack Builder ─────────────────────────────────────────────────────

const StackBuilder = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const peptideNames = peptides.map((p) => p.name);
  const filtered = peptideNames.filter(
    (name) =>
      !selected.includes(name) &&
      name.toLowerCase().includes(search.toLowerCase())
  );

  const interactions = useMemo(() => {
    const pairs: ReturnType<typeof getInteraction>[] = [];
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        pairs.push(getInteraction(selected[i], selected[j]));
      }
    }
    return pairs;
  }, [selected]);

  const hasCaution = interactions.some((i) => i.type === "caution");
  const synergyCount = interactions.filter((i) => i.type === "synergy").length;
  const noDataCount = interactions.filter((i) => i.type === "no_data").length;

  const addPeptide = (name: string) => {
    if (selected.length < 6 && !selected.includes(name)) {
      setSelected([...selected, name]);
      setSearch("");
    }
  };

  const removePeptide = (name: string) => {
    setSelected(selected.filter((s) => s !== name));
  };

  const loadStack = (peptideList: string[]) => {
    // Only add peptides that exist in our database
    const valid = peptideList.filter((p) => peptideNames.includes(p));
    setSelected(valid);
  };

  return (
    <div className="space-y-10">
      {/* Recommended Stacks */}
      <div>
        <h2 className="text-xl font-heading font-bold text-foreground mb-2 flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Recommended Stacks
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Curated peptide combinations backed by research and established protocols.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedStacks.map((stack) => (
            <StackCard key={stack.name} stack={stack} onLoad={loadStack} />
          ))}
        </div>
      </div>

      {/* Custom Builder */}
      <div>
        <h2 className="text-xl font-heading font-bold text-foreground mb-2 flex items-center gap-2">
          <Beaker className="h-5 w-5 text-primary" />
          Custom Stack Builder
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Select up to 6 peptides to check compatibility and interactions.
        </p>

        {/* Selected pills */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selected.map((name) => (
              <motion.button
                key={name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => removePeptide(name)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:opacity-80 transition-opacity"
              >
                {name}
                <X className="h-3 w-3" />
              </motion.button>
            ))}
            <button
              onClick={() => setSelected([])}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Search filter */}
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter peptides..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>

        {/* Peptide selection grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-8">
          {peptideNames
            .filter((name) => name.toLowerCase().includes(search.toLowerCase()))
            .map((name) => {
              const isSelected = selected.includes(name);
              const peptide = peptides.find((p) => p.name === name);
              const disabled = !isSelected && selected.length >= 6;
              return (
                <button
                  key={name}
                  onClick={() => (isSelected ? removePeptide(name) : addPeptide(name))}
                  disabled={disabled}
                  className={`relative p-3 rounded-xl border text-left transition-all text-xs ${
                    isSelected
                      ? "bg-primary/10 border-primary/40 text-foreground"
                      : disabled
                      ? "bg-card border-border text-muted-foreground/40 cursor-not-allowed"
                      : "bg-card border-border text-foreground hover:border-primary/30 hover:bg-card/80 cursor-pointer"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{name}</p>
                      {peptide && (
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {peptide.category}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              );
            })}
        </div>

        {/* Interaction Results */}
        {selected.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Summary bar */}
            <div className="flex flex-wrap gap-3 p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-foreground font-medium">{synergyCount}</span>
                <span className="text-muted-foreground">synergies</span>
              </div>
              {hasCaution && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-warm" />
                  <span className="text-foreground font-medium">
                    {interactions.filter((i) => i.type === "caution").length}
                  </span>
                  <span className="text-muted-foreground">cautions</span>
                </div>
              )}
              {noDataCount > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">{noDataCount}</span>
                  <span className="text-muted-foreground">insufficient data</span>
                </div>
              )}
            </div>

            {/* Interaction list */}
            <div className="space-y-2">
              {interactions.map((interaction, i) => {
                const meta = interactionMeta[interaction.type];
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-4 rounded-xl border ${meta.bg}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${meta.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium text-foreground">
                            {interaction.peptideA}
                          </span>
                          <span className="text-xs text-muted-foreground">+</span>
                          <span className="text-sm font-medium text-foreground">
                            {interaction.peptideB}
                          </span>
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {interaction.reason}
                        </p>
                        {interaction.source && (
                          <p className="text-[10px] text-muted-foreground/60 mt-1 italic">
                            Source: {interaction.source}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-muted-foreground/60 leading-relaxed px-1">
              ⚠️ This tool is for educational and research purposes only. Interaction data is based on published research, clinical protocols, and established pharmacology. Always consult a qualified healthcare professional before using any peptide protocol. Where "Insufficient Data" is shown, no reliable research exists for that combination.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StackBuilder;
