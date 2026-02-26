import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, TrendingUp, AlertTriangle, Clock, Filter, ChevronDown, ChevronUp, Syringe, CalendarDays, Sparkles, CheckCircle2, FlaskConical, Plus, ArrowRight, Users, Beaker } from "lucide-react";
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

const gradeLabel: Record<string, { text: string; className: string }> = {
  A: { text: "Grade A — Strong clinical evidence", className: "bg-primary/10 text-primary" },
  B: { text: "Grade B — Moderate evidence", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  C: { text: "Grade C — Preliminary evidence", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  D: { text: "Grade D — Theoretical / Anecdotal", className: "bg-muted text-muted-foreground" },
};

const PeptideCard = ({ peptide, index }: PeptideCardProps) => {
  const grade = peptide.evidenceGrade ? gradeLabel[peptide.evidenceGrade] : null;
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className="bg-card rounded-2xl border border-border p-6 sm:p-8 hover:border-primary/20 transition-all"
      >
        {/* Header */}
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
                  <Sparkles className="h-3 w-3" /> {t("peptideCard.new")}
                </span>
              )}
              {grade && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${grade.className}`}>
                  {peptide.evidenceGrade}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-1">{peptide.fullName}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{peptide.description}</p>
          </div>
        </div>

        {/* Benefits */}
        {peptide.benefits.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {peptide.benefits.map((benefit) => (
              <span key={benefit} className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="h-2.5 w-2.5" />
                {benefit}
              </span>
            ))}
          </div>
        )}

        {/* Admin details */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs text-muted-foreground">
          {peptide.administration.split("/").map((route) => {
            const trimmed = route.trim();
            const isOral = trimmed.toLowerCase().includes("oral");
            const isNasal = trimmed.toLowerCase().includes("nasal");
            const isTopical = trimmed.toLowerCase().includes("topical");
            const isInTrial = trimmed.toLowerCase().includes("trial");
            return (
              <span
                key={trimmed}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium ${
                  isOral
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : isNasal
                    ? "bg-accent text-accent-foreground"
                    : isTopical
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted/50"
                }`}
              >
                <Syringe className="h-3 w-3" />
                {trimmed}
                {isInTrial && <Sparkles className="h-3 w-3 ml-0.5" />}
              </span>
            );
          })}
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50">
            <CalendarDays className="h-3 w-3" /> {peptide.frequency}
          </span>
          {peptide.doseRange && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50">
              {peptide.doseRange}
            </span>
          )}
        </div>

        {/* Regulatory status */}
        {peptide.regulatoryStatus && (() => {
          const rs = peptide.regulatoryStatus;
          const hasBadges = (rs.us && rs.us.status !== "none") || (rs.eu && rs.eu.status !== "none") || (rs.uk && rs.uk.status !== "none");
          return hasBadges ? (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {rs.us && <ApprovalBadge region="US" approval={rs.us} />}
              {rs.uk && <ApprovalBadge region="UK" approval={rs.uk} />}
              {rs.eu && <ApprovalBadge region="EU" approval={rs.eu} />}
            </div>
          ) : null;
        })()}

        {/* Toggle + Add to Protocol */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? t("peptideCard.hideExperiences") : t("peptideCard.showExperiences")}
            {communityReports.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                +{communityReports.length} community
              </span>
            )}
          </button>

          <Button size="sm" onClick={handleAddToProtocol} className="shadow-brand text-xs gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            {t("peptideCard.addToProtocol")}
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>

        {/* Expanded: Research Experiences + Community Reports */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-4"
          >
            {/* Research Experiences */}
            <div className="space-y-3">
              <h3 className="text-sm font-heading font-semibold text-foreground flex items-center gap-2">
                <Filter className="h-3.5 w-3.5" />
                {t("peptideCard.communityExperiences")}
              </h3>
              {peptide.experiences.map((exp, ei) => {
                const key = `research_${ei}`;
                const myVote = myVotes[key];
                const netVotes = getNetVotes(key, exp.votes);
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
                        <p className="text-[10px] text-muted-foreground mt-0.5 italic">{t("peptideCard.source")}: {(exp as any).source}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleVote(key, "up")}
                        className={`p-1.5 rounded-lg transition-colors ${
                          myVote === "up" ? "bg-success/20 text-success" : "hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-xs font-medium text-muted-foreground min-w-[2.5rem] text-center">
                        {netVotes}
                      </span>
                      <button
                        onClick={() => handleVote(key, "down")}
                        className={`p-1.5 rounded-lg transition-colors ${
                          myVote === "down" ? "bg-destructive/20 text-destructive" : "hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Community Reports from Journal Entries */}
            {communityReports.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-border">
                <h3 className="text-sm font-heading font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  Community Reports
                  <span className="text-[10px] font-normal text-muted-foreground ml-1">
                    from user journals
                  </span>
                </h3>
                {communityReports.map((report) => {
                  const key = report.journal_id;
                  const myVote = myVotes[key];
                  const netVotes = getNetVotes(key);
                  return (
                    <div key={report.journal_id} className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 group">
                      <div className="mt-0.5 p-1.5 rounded-lg flex-shrink-0 bg-primary/10 text-primary">
                        <Users className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground/80 leading-relaxed">{report.summary}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground italic">
                            Community Report • {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                          </span>
                          {report.evidence_quality && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {report.evidence_quality}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleVote(key, "up")}
                          className={`p-1.5 rounded-lg transition-colors ${
                            myVote === "up" ? "bg-success/20 text-success" : "hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-xs font-medium text-muted-foreground min-w-[2.5rem] text-center">
                          {netVotes}
                        </span>
                        <button
                          onClick={() => handleVote(key, "down")}
                          className={`p-1.5 rounded-lg transition-colors ${
                            myVote === "down" ? "bg-destructive/20 text-destructive" : "hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {peptide.notes && (
              <p className="text-xs text-muted-foreground italic px-3">💡 {peptide.notes}</p>
            )}
          </motion.div>
        )}
      </motion.div>

      <OnboardingModal open={onboardingOpen} onOpenChange={setOnboardingOpen} />
    </>
  );
};

export default PeptideCard;
