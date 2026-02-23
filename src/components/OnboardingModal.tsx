import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles, CalendarCheck, Pill, Activity, Target } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OnboardingModal = ({ open, onOpenChange }: OnboardingModalProps) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { t } = useTranslation();

  type StepWithOptions = {
    id: string;
    question: string;
    options: { value: string; label: string }[];
    type: "options";
  };

  type StepBenefit = {
    id: string;
    type: "benefit";
  };

  type Step = StepWithOptions | StepBenefit;

  const steps: Step[] = [
    {
      id: "goal",
      type: "options",
      question: t("onboarding.goalQuestion"),
      options: [
        { value: "fat_loss", label: t("onboarding.goalFatLoss") },
        { value: "healing", label: t("onboarding.goalHealing") },
        { value: "longevity", label: t("onboarding.goalLongevity") },
        { value: "cognitive", label: t("onboarding.goalCognitive") },
        { value: "muscle", label: t("onboarding.goalMuscle") },
        { value: "hormone", label: t("onboarding.goalHormone") },
      ],
    },
    {
      id: "glp1_experience",
      type: "options",
      question: t("onboarding.glp1Question"),
      options: [
        { value: "yes", label: t("onboarding.glp1Yes") },
        { value: "no", label: t("onboarding.glp1No") },
      ],
    },
    {
      id: "protocol_experience",
      type: "options",
      question: t("onboarding.protocolQuestion"),
      options: [
        { value: "yes", label: t("onboarding.protocolYes") },
        { value: "no", label: t("onboarding.protocolNo") },
        { value: "some", label: t("onboarding.protocolSome") },
      ],
    },
    {
      id: "supplements",
      type: "options",
      question: t("onboarding.supplementsQuestion"),
      options: [
        { value: "none", label: t("onboarding.suppNone") },
        { value: "1-3", label: t("onboarding.supp1to3") },
        { value: "4-8", label: t("onboarding.supp4to8") },
        { value: "9+", label: t("onboarding.supp9plus") },
      ],
    },
    {
      id: "consistency",
      type: "options",
      question: t("onboarding.consistencyQuestion"),
      options: [
        { value: "strong", label: t("onboarding.consistencyStrong") },
        { value: "moderate", label: t("onboarding.consistencyModerate") },
        { value: "struggle", label: t("onboarding.consistencyStruggle") },
        { value: "starting", label: t("onboarding.consistencyStarting") },
      ],
    },
    {
      id: "bloodwork",
      type: "options",
      question: t("onboarding.bloodworkQuestion"),
      options: [
        { value: "recent", label: t("onboarding.bloodworkYes") },
        { value: "older", label: t("onboarding.bloodworkOlder") },
        { value: "no", label: t("onboarding.bloodworkNo") },
        { value: "planning", label: t("onboarding.bloodworkPlanning") },
      ],
    },
    {
      id: "dna_testing",
      type: "options",
      question: t("onboarding.dnaQuestion"),
      options: [
        { value: "yes", label: t("onboarding.dnaYes") },
        { value: "no", label: t("onboarding.dnaNo") },
        { value: "interested", label: t("onboarding.dnaInterested") },
      ],
    },
    {
      id: "benefit",
      type: "benefit" as const,
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const isBenefit = current.type === "benefit";
  const canProceed = isBenefit || !!answers[current.id];
  const optionsStep = current.type === "options" ? current : null;

  // Map new answers to profile fields for backwards compatibility
  const mapAnswersToProfile = () => {
    const mapped: Record<string, string> = { ...answers };
    // Map glp1 + protocol experience into experience_level
    const glp1 = answers.glp1_experience;
    const protocol = answers.protocol_experience;
    if (glp1 === "no" && protocol === "no") mapped.experience = "none";
    else if (glp1 === "no" && protocol === "some") mapped.experience = "beginner";
    else if (glp1 === "yes" && (protocol === "no" || protocol === "some")) mapped.experience = "beginner";
    else if (glp1 === "yes" && protocol === "yes") mapped.experience = "intermediate";
    else mapped.experience = "beginner";
    // Map supplements count to current_compounds
    mapped.compounds = answers.supplements === "none" ? "" : `${answers.supplements} supplements`;
    // Map consistency to risk_tolerance
    const c = answers.consistency;
    if (c === "strong") mapped.risk = "moderate";
    else if (c === "moderate") mapped.risk = "moderate";
    else mapped.risk = "conservative";
    return mapped;
  };

  const handleFinish = () => {
    const mapped = mapAnswersToProfile();
    sessionStorage.setItem("onboarding_answers", JSON.stringify(mapped));
    onOpenChange(false);
    setStep(0);
    navigate("/auth");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-heading">
            {t("onboarding.title")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isBenefit
              ? ""
              : t("onboarding.step", { current: step + 1, total: steps.length - 1 })}
          </DialogDescription>
        </DialogHeader>

        {!isBenefit && (
          <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((step + 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
        )}

        <div className="py-4 space-y-4">
          {isBenefit ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-heading font-bold text-foreground">
                  {t("onboarding.benefitTitle")}
                </h3>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("onboarding.benefitMessage")}
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                  <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">Personalised plans matched to your goals and experience</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                  <CalendarCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">Smart reminders so you never miss a dose or supplement</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                  <Pill className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">Track supplements, peptides, and protocols in one place</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                  <Activity className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">Biomarker tracking to see what's actually working</p>
                </div>
              </div>

              <p className="text-sm font-medium text-foreground">
                {t("onboarding.benefitCta")}
              </p>
            </div>
          ) : optionsStep ? (
            <>
              <p className="text-sm font-medium text-foreground">{optionsStep.question}</p>
              <RadioGroup
                value={answers[optionsStep.id] || ""}
                onValueChange={(val) => setAnswers((prev) => ({ ...prev, [optionsStep.id]: val }))}
                className="space-y-2"
              >
                {optionsStep.options.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 cursor-pointer transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                  >
                    <RadioGroupItem value={opt.value} />
                    <span className="text-sm text-foreground">{opt.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </>
          ) : null}
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("onboarding.back")}
          </Button>

          {isLast ? (
            <Button size="sm" onClick={handleFinish} className="shadow-brand">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              {t("onboarding.generatePlan")}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed}
            >
              {t("onboarding.next")}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
