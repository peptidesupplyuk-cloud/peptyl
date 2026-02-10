import { useState } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, TrendingUp, AlertTriangle, Clock, Filter, ChevronDown, ChevronUp, Syringe, CalendarDays, Sparkles } from "lucide-react";
import type { PeptideData } from "@/data/peptides";

interface PeptideCardProps {
  peptide: PeptideData;
  index: number;
  userVotes: Record<number, "up" | "down">;
  onVote: (expIndex: number, direction: "up" | "down") => void;
}

const PeptideCard = ({ peptide, index, userVotes, onVote }: PeptideCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-card rounded-2xl border border-border p-6 sm:p-8 hover:border-primary/20 transition-all"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 rounded-xl bg-accent">
          <peptide.icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h2 className="text-xl font-heading font-bold text-foreground">{peptide.name}</h2>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              {peptide.category}
            </span>
            {peptide.isNew && (
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> New
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-1">{peptide.fullName}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{peptide.description}</p>
        </div>
      </div>

      {/* Protocol info */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50">
          <Syringe className="h-3 w-3" /> {peptide.administration}
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50">
          <CalendarDays className="h-3 w-3" /> {peptide.frequency}
        </span>
        {peptide.doseRange && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50">
            {peptide.doseRange}
          </span>
        )}
      </div>

      {/* Expand/collapse for details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors mb-3"
      >
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expanded ? "Hide" : "Show"} Community Experiences
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-3"
        >
          <h3 className="text-sm font-heading font-semibold text-foreground flex items-center gap-2">
            <Filter className="h-3.5 w-3.5" />
            Community Experiences
          </h3>
          {peptide.experiences.map((exp, ei) => {
            const vote = userVotes?.[ei];
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
                <div className="flex-1">
                  <p className="text-sm text-foreground/80 leading-relaxed">{exp.text}</p>
                  {(exp as any).source && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 italic">Source: {(exp as any).source}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onVote(ei, "up")}
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
                    onClick={() => onVote(ei, "down")}
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
          {peptide.notes && (
            <p className="text-xs text-muted-foreground italic px-3">💡 {peptide.notes}</p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default PeptideCard;
