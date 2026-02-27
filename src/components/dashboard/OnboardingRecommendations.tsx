import { Sparkles, FlaskConical, Shield, Zap, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getOnboardingRecommendations, type OnboardingProfile, CATEGORY_LABELS, CATEGORY_COLORS } from "@/data/recommendation-rules";
import { Button } from "@/components/ui/button";

interface OnboardingRecommendationsProps {
  onActivateProtocol?: (protocolId: string) => void;
  onNavigateToProtocols?: () => void;
}

const EXPERIENCE_LABELS: Record<string, string> = {
  none: "New researcher",
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const RISK_LABELS: Record<string, { label: string; icon: typeof Shield }> = {
  conservative: { label: "Conservative", icon: Shield },
  moderate: { label: "Moderate", icon: Zap },
  aggressive: { label: "Aggressive", icon: Zap },
};

const WHY_LABEL: Record<string, Record<string, string>> = {
  healing: {
    healing: "Matches your healing goal",
    immune: "Supports tissue repair and immune resilience",
    "anti-aging": "Addresses cellular repair relevant to healing",
  },
  fat_loss: {
    "fat-loss": "Targets your fat loss goal directly",
    performance: "Supports body composition alongside fat loss",
  },
  longevity: {
    "anti-aging": "Aligns with your longevity goal",
    immune: "Immune health is central to longevity",
  },
  cognitive: {
    cognitive: "Directly addresses your cognitive goal",
    "anti-aging": "Neuroprotection supports long-term cognition",
  },
  muscle: {
    performance: "Supports muscle recovery and growth",
    healing: "Tissue repair underpins muscle development",
  },
  general: {
    healing: "Well-studied and widely used",
    "anti-aging": "Broadly applicable to general health",
    immune: "Foundational immune support",
  },
};

const OnboardingRecommendations = ({ onNavigateToProtocols }: OnboardingRecommendationsProps) => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["onboarding-profile", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("research_goal, experience_level, current_compounds, biomarker_availability, risk_tolerance")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data as OnboardingProfile | null;
    },
  });

  if (!profile?.research_goal && !profile?.experience_level) return null;

  const recommendations = getOnboardingRecommendations(profile);
  if (recommendations.length === 0) return null;

  const experience = profile.experience_level || "beginner";
  const risk = profile.risk_tolerance || "moderate";
  const goalKey = profile.research_goal || "general";

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="font-heading font-semibold text-foreground">Your Starting Plan</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
          {EXPERIENCE_LABELS[experience] || experience}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
          {RISK_LABELS[risk]?.label || risk} approach
        </span>
        {profile.research_goal && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-medium capitalize">
            Goal: {profile.research_goal.replace(/_/g, " ")}
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Based on your onboarding answers, here are protocols tailored to your goals and experience level.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {recommendations.map((protocol) => (
          <div
            key={protocol.id}
            className="bg-muted/50 rounded-xl p-4 space-y-3 border border-border/50"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">{protocol.protocolName}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[protocol.category]}`}>
                {CATEGORY_LABELS[protocol.category]}
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">{protocol.description}</p>

            {WHY_LABEL[goalKey]?.[protocol.category] && (
              <p className="text-[10px] text-primary/70 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" />
                {WHY_LABEL[goalKey][protocol.category]}
              </p>
            )}

            <div className="space-y-1.5">
              {protocol.peptides.map((p) => (
                <div key={p.name} className="flex items-center gap-2 text-xs">
                  <FlaskConical className="h-3 w-3 text-primary flex-shrink-0" />
                  <span className="font-medium text-foreground">{p.name}</span>
                  <span className="text-muted-foreground ml-auto">{p.dose_mcg}mcg</span>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-muted-foreground">
              {protocol.durationWeeks} weeks · {protocol.peptides[0]?.frequency} · {protocol.peptides[0]?.route}
            </div>
          </div>
        ))}
      </div>

      {onNavigateToProtocols && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onNavigateToProtocols}
        >
          Activate a Protocol <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      )}
    </div>
  );
};

export default OnboardingRecommendations;
