import { BookOpen, Dna, Droplets, FlaskConical, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface OnboardingProfile {
  research_goal?: string | null;
  experience_level?: string | null;
  risk_tolerance?: string | null;
}

interface Props {
  profile: OnboardingProfile;
  hasBloodwork: boolean;
  hasDna: boolean;
  onDismiss: () => void;
  onNavigateToProtocols: () => void;
  onNavigateToBloodwork: () => void;
}

const GOAL_LABELS: Record<string, string> = {
  fat_loss: "fat loss",
  healing: "healing and recovery",
  longevity: "longevity",
  cognitive: "cognitive performance",
  muscle: "muscle and performance",
  hormone: "hormonal optimisation",
  general: "general health",
};

const EXPERIENCE_MESSAGES: Record<string, Record<string, string>> = {
  none: {
    fat_loss: "You're new to peptides and focused on fat loss. We've surfaced the safest, most evidence-backed options first — no injections required to start.",
    healing: "You're new to peptides and want to support recovery. BPC-157 is where most beginners start — well studied, widely used, and beginner safe.",
    longevity: "You're new to peptides and thinking long term. We've filtered the most studied anti-ageing protocols for you — start simple, track your results.",
    cognitive: "You're new to peptides and want sharper cognition. We've highlighted the beginner-safe nootropic stacks with the strongest evidence.",
    muscle: "You're new to peptides and want to build and recover faster. We've filtered the injection-free options first so you can ease in.",
    hormone: "You're new to peptides and exploring hormonal health. We've kept the recommendations conservative — great starting point before bloodwork.",
    general: "You're new to peptides. We've filtered the most beginner-safe, well-studied protocols for you. Start with one, track it, build from there.",
  },
  beginner: {
    fat_loss: "You have some experience and a fat loss goal. We've matched protocols with the strongest evidence for body composition to your profile.",
    healing: "You have some experience and healing as your focus. BPC-157 + TB-500 is the most studied stack for tissue repair — both flagged for your level.",
    longevity: "You have some experience and longevity as your goal. Epitalon and NAD+ precursors are your strongest options based on current evidence.",
    cognitive: "You have some experience and cognitive performance as your goal. Semax and Selank have the best evidence-to-risk ratio for your level.",
    muscle: "You have some experience and muscle/performance as your focus. GHRP-6 with a GHRH is the most studied stack at your level.",
    hormone: "You have some experience and hormonal health as your focus. Your profile suggests conservative dosing — protocols are filtered accordingly.",
    general: "You have some experience with peptides. We've personalised the order of protocols based on your goal and filtered out anything too advanced.",
  },
  intermediate: {
    fat_loss: "You're experienced and focused on fat loss. AOD-9604 and GLP-1 options are surfaced first — you have the experience level for these.",
    healing: "You're experienced and want tissue repair. The full BPC-157 + TB-500 + GHK-Cu stack is within your experience range.",
    longevity: "You're experienced and focused on longevity. Epitalon, Thymalin, and full NMN stacks are all unlocked for your level.",
    cognitive: "You're experienced and focused on cognition. Full Semax/Selank stacks and BDNF-supporting peptides are within your range.",
    muscle: "You're experienced and performance focused. Full GHRH+GHRP stacks with IGF-1 LR3 are surfaced first for your level.",
    hormone: "You're experienced and focused on hormonal health. Kisspeptin and PT-141 protocols are appropriate for your level.",
    general: "You're experienced with peptides. Your full protocol library is unlocked — we've sorted by evidence quality and matched to your stated goal.",
  },
};

const OnboardingSummaryBanner = ({
  profile,
  hasBloodwork,
  hasDna,
  onDismiss,
  onNavigateToProtocols,
  onNavigateToBloodwork,
}: Props) => {
  const navigate = useNavigate();
  const goal = profile.research_goal || "general";
  const experience = profile.experience_level || "beginner";
  const goalLabel = GOAL_LABELS[goal] || "general health";
  const message =
    EXPERIENCE_MESSAGES[experience]?.[goal] ||
    EXPERIENCE_MESSAGES["beginner"]?.["general"] ||
    "We've personalised your protocol recommendations based on your answers.";

  const isNewbie = experience === "none" || experience === "beginner";

  return (
    <div className="relative bg-card border border-primary/30 rounded-2xl overflow-hidden">
      {/* Teal glow accent top bar */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="p-5 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10 shrink-0 mt-0.5">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-foreground text-base">
                Here's your starting point
              </h2>
              <p className="text-xs text-primary mt-0.5 font-medium capitalize">
                Goal: {goalLabel}
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Personalised message */}
        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>

        {/* 3 action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1 — always: browse protocols */}
          <button
            onClick={onNavigateToProtocols}
            className="group text-left bg-muted/40 hover:bg-primary/5 border border-border hover:border-primary/30 rounded-xl p-4 space-y-2 transition-all"
          >
            <FlaskConical className="h-5 w-5 text-primary" />
            <p className="text-sm font-heading font-semibold text-foreground">
              Browse protocols for you
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Filtered to your goal and experience level
            </p>
            <span className="text-xs text-primary group-hover:underline">See protocols →</span>
          </button>

          {/* Card 2 — beginner: read guide | experienced: upload DNA */}
          {isNewbie ? (
            <button
              onClick={() => navigate("/articles/beginners-guide")}
              className="group text-left bg-muted/40 hover:bg-primary/5 border border-border hover:border-primary/30 rounded-xl p-4 space-y-2 transition-all"
            >
              <BookOpen className="h-5 w-5 text-primary" />
              <p className="text-sm font-heading font-semibold text-foreground">
                Read the beginner's guide
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Understand what peptides are before you start anything
              </p>
              <span className="text-xs text-primary group-hover:underline">Read guide →</span>
            </button>
          ) : (
            <button
              onClick={() => navigate("/dna/upload")}
              className="group text-left bg-muted/40 hover:bg-primary/5 border border-border hover:border-primary/30 rounded-xl p-4 space-y-2 transition-all"
            >
              <Dna className="h-5 w-5 text-primary" />
              <p className="text-sm font-heading font-semibold text-foreground">
                Unlock DNA insights
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload a 23andMe file to get genotype-specific protocols
              </p>
              <span className="text-xs text-primary group-hover:underline">Upload DNA →</span>
            </button>
          )}

          {/* Card 3 — bloodwork (if they don't have it) or DNA (if no DNA but have bloodwork) */}
          {!hasBloodwork ? (
            <button
              onClick={onNavigateToBloodwork}
              className="group text-left bg-muted/40 hover:bg-primary/5 border border-border hover:border-primary/30 rounded-xl p-4 space-y-2 transition-all"
            >
              <Droplets className="h-5 w-5 text-primary" />
              <p className="text-sm font-heading font-semibold text-foreground">
                Log your first bloodwork
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Unlocks biomarker-triggered recommendations
              </p>
              <span className="text-xs text-primary group-hover:underline">Add results →</span>
            </button>
          ) : !hasDna ? (
            <button
              onClick={() => navigate("/dna/upload")}
              className="group text-left bg-muted/40 hover:bg-primary/5 border border-border hover:border-primary/30 rounded-xl p-4 space-y-2 transition-all"
            >
              <Dna className="h-5 w-5 text-primary" />
              <p className="text-sm font-heading font-semibold text-foreground">
                Add DNA for deeper insights
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your bloodwork is in — DNA unlocks the full picture
              </p>
              <span className="text-xs text-primary group-hover:underline">Upload DNA →</span>
            </button>
          ) : (
            <button
              onClick={onNavigateToProtocols}
              className="group text-left bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2 transition-all"
            >
              <Sparkles className="h-5 w-5 text-primary" />
              <p className="text-sm font-heading font-semibold text-foreground">
                Your data is ready
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Bloodwork and DNA both in — personalised recommendations are waiting
              </p>
              <span className="text-xs text-primary group-hover:underline">View recommendations →</span>
            </button>
          )}
        </div>

        {/* Dismiss */}
        <div className="flex justify-end">
          <button
            onClick={onDismiss}
            className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
          >
            Got it, take me to the dashboard →
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSummaryBanner;
