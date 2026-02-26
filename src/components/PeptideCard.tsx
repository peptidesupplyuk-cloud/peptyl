import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, TrendingUp, AlertTriangle, Clock, ChevronDown, ChevronUp, Syringe, CalendarDays, Sparkles, CheckCircle2, FlaskConical, Plus, ArrowRight, Users, FileText, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import OnboardingModal from "@/components/OnboardingModal";
import { useExperienceVotes, useMyVotes, useVoteMutation, useCommunityReports } from "@/hooks/use-experience-votes";
import type { PeptideData, ApprovalStatus } from "@/data/peptides";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface PeptideCardProps {
  peptide: PeptideData;
  index: number;
  userVotes: Record<number, "up" | "down">;
  onVote: (expIndex: number, direction: "up" | "down") => void;
}

const ApprovalBadge = ({ region, approval }: { region: string; approval: ApprovalStatus }) => {
  if (approval.status === "none") return null;
  if (approval.status === "approved") {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-medium">
        <CheckCircle2 className="h-3 w-3" />
        {region}: {approval.label}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-warm/10 text-warm text-[10px] font-medium">
      <FlaskConical className="h-3 w-3" />
      {region}: {approval.phase}
    </span>
  );
};

const gradeConfig: Record<string, { label: string; className: string }> = {
  A: { label: "A", className: "bg-primary/20 text-primary border border-primary/30" },
  B: { label: "B", className: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
  C: { label: "C", className: "bg-amber-500/20 text-amber-400 border border-amber-500/30" },
  D: { label: "D", className: "bg-muted text-muted-foreground border border-border" },
};

const PeptideCard = ({ peptide, index }: PeptideCardProps) => {
  const grade = gradeConfig[peptide.evidenceGrade || "D"] || gradeConfig.D;
  const [expanded, setExpanded] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: voteCounts = {} } = useExperienceVotes(peptide.name);
  const { data: myVotes = {} } = useMyVotes(peptide.name);
  const voteMutation = useVoteMutation(peptide.name);
  const { data: communityReports = [] } = useCommunityReports(peptide.name);

  const handleVote = (experienceKey: string, direction: "up" | "down") => {
    if (!user) {
      toast.info("Sign in to vote on experiences");
      return;
    }
    voteMutation.mutate({ experienceKey, direction });
  };

  const handleAddToProtocol = () => {
    if (user) {
      navigate("/dashboard?tab=protocols&peptide=" + encodeURIComponent(peptide.name));
    } else {
      sessionStorage.setItem("pending_peptide", peptide.name);
      setOnboardingOpen(true);
    }
  };

  const getNetVotes = (key: string, baseVotes: number = 0) => {
    const counts = voteCounts[key];
    return baseVotes + (counts?.upvotes ?? 0) - (counts?.downvotes ?? 0);
  };

  return (
    <>
      {/* Compact row */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg cursor-pointer hover:border-primary/20 transition-all group"
        style={{ minHeight: "65px" }}
      >
        <peptide.icon className="h-4 w-4 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-foreground">{peptide.name}</span>
          <p className="text-[11px] text-muted-foreground truncate leading-tight">{peptide.fullName}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground hidden sm:inline-flex">
            {peptide.category}
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${grade.className}`}>
            {grade.label}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="ml-4 mr-0 border-l-2 border-primary/20 pl-4 pb-4 pt-2 space-y-3">
              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">{peptide.description}</p>

              {/* Benefits */}
              {peptide.benefits.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {peptide.benefits.map((benefit) => (
                    <span key={benefit} className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      {benefit}
                    </span>
                  ))}
                </div>
              )}

              {/* Dosing row */}
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {peptide.administration.split("/").map((route) => {
                  const trimmed = route.trim();
                  return (
                    <span key={trimmed} className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50">
                      <Syringe className="h-3 w-3" /> {trimmed}
                    </span>
                  );
                })}
                <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50">
                  <CalendarDays className="h-3 w-3" /> {peptide.frequency}
                </span>
                {peptide.doseRange && (
                  <span className="px-2 py-1 rounded-md bg-muted/50">{peptide.doseRange}</span>
                )}
                {peptide.cycleDuration && (
                  <span className="px-2 py-1 rounded-md bg-muted/50">Cycle: {peptide.cycleDuration}</span>
                )}
              </div>

              {/* Regulatory status */}
              {peptide.regulatoryStatus && (() => {
                const rs = peptide.regulatoryStatus;
                const hasBadges = (rs.us && rs.us.status !== "none") || (rs.eu && rs.eu.status !== "none") || (rs.uk && rs.uk.status !== "none");
                return hasBadges ? (
                  <div className="flex flex-wrap gap-1.5">
                    {rs.us && <ApprovalBadge region="US" approval={rs.us} />}
                    {rs.uk && <ApprovalBadge region="UK" approval={rs.uk} />}
                    {rs.eu && <ApprovalBadge region="EU" approval={rs.eu} />}
                  </div>
                ) : null;
              })()}

              {/* Notes */}
              {peptide.notes && (
                <p className="text-xs text-muted-foreground italic">💡 {peptide.notes}</p>
              )}

              {/* Research References */}
              {peptide.experiences.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <FlaskConical className="h-3 w-3" /> Research References
                  </h4>
                  {peptide.experiences.map((exp, ei) => {
                    const key = `research_${ei}`;
                    const myVote = myVotes[key];
                    const netVotes = getNetVotes(key, exp.votes);
                    return (
                      <div key={ei} className="flex items-start gap-2 p-2 rounded-md bg-muted/30 text-xs">
                        <div className={`mt-0.5 p-1 rounded flex-shrink-0 ${
                          exp.sentiment === "positive" ? "bg-success/10 text-success" :
                          exp.sentiment === "caution" ? "bg-warm/10 text-warm" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {exp.sentiment === "positive" ? <TrendingUp className="h-3 w-3" /> :
                           exp.sentiment === "caution" ? <AlertTriangle className="h-3 w-3" /> :
                           <Clock className="h-3 w-3" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground/80 leading-relaxed">{exp.text}</p>
                          {(exp as any).source && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 italic">Source: {(exp as any).source}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); handleVote(key, "up"); }}
                            className={`p-1 rounded transition-colors ${myVote === "up" ? "bg-success/20 text-success" : "hover:bg-muted text-muted-foreground"}`}>
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                          <span className="text-[10px] font-medium text-muted-foreground min-w-[1.5rem] text-center">{netVotes}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleVote(key, "down"); }}
                            className={`p-1 rounded transition-colors ${myVote === "down" ? "bg-destructive/20 text-destructive" : "hover:bg-muted text-muted-foreground"}`}>
                            <ThumbsDown className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* User Experiences */}
              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Users className="h-3 w-3" /> User Experiences
                </h4>
                {communityReports.length > 0 ? (
                  communityReports.map((report) => {
                    const key = report.journal_id;
                    const myVote = myVotes[key];
                    const netVotes = getNetVotes(key);
                    return (
                      <div key={report.journal_id} className="flex items-start gap-2 p-2 rounded-md bg-primary/5 text-xs">
                        <div className="mt-0.5 p-1 rounded flex-shrink-0 bg-primary/10 text-primary">
                          <Users className="h-3 w-3" />
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground/80 leading-relaxed">{report.summary}</p>
                          <span className="text-[10px] text-muted-foreground italic">
                            {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); handleVote(key, "up"); }}
                            className={`p-1 rounded transition-colors ${myVote === "up" ? "bg-success/20 text-success" : "hover:bg-muted text-muted-foreground"}`}>
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                          <span className="text-[10px] font-medium text-muted-foreground min-w-[1.5rem] text-center">{netVotes}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleVote(key, "down"); }}
                            className={`p-1 rounded transition-colors ${myVote === "down" ? "bg-destructive/20 text-destructive" : "hover:bg-muted text-muted-foreground"}`}>
                            <ThumbsDown className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-muted/20 border border-dashed border-border">
                    <MessageSquarePlus className="h-4 w-4 text-muted-foreground" />
                    <p className="text-[11px] text-muted-foreground">No user experiences yet.</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddToProtocol(); }}
                      className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors ml-auto"
                    >
                      Share your experience →
                    </button>
                  </div>
                )}
              </div>

              {/* Add to protocol */}
              <Button size="sm" onClick={(e) => { e.stopPropagation(); handleAddToProtocol(); }} className="shadow-brand text-xs gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                {t("peptideCard.addToProtocol")}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <OnboardingModal open={onboardingOpen} onOpenChange={setOnboardingOpen} />
    </>
  );
};

export default PeptideCard;
