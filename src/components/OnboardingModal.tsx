import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OnboardingModal = ({ open, onOpenChange }: OnboardingModalProps) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { t } = useTranslation();

  const steps = [
    {
      id: "goal",
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
      id: "experience",
      question: t("onboarding.experienceQuestion"),
      options: [
        { value: "none", label: t("onboarding.expNone") },
        { value: "beginner", label: t("onboarding.expBeginner") },
        { value: "intermediate", label: t("onboarding.expIntermediate") },
        { value: "advanced", label: t("onboarding.expAdvanced") },
      ],
    },
    {
      id: "compounds",
      question: t("onboarding.compoundsQuestion"),
      type: "text" as const,
      placeholder: t("onboarding.compoundsPlaceholder"),
    },
    {
      id: "biomarkers",
      question: t("onboarding.biomarkersQuestion"),
      options: [
        { value: "none", label: t("onboarding.bioNone") },
        { value: "basic", label: t("onboarding.bioBasic") },
        { value: "hormones", label: t("onboarding.bioHormones") },
        { value: "comprehensive", label: t("onboarding.bioComprehensive") },
      ],
    },
    {
      id: "risk",
      question: t("onboarding.riskQuestion"),
      options: [
        { value: "conservative", label: t("onboarding.riskConservative") },
        { value: "moderate", label: t("onboarding.riskModerate") },
        { value: "aggressive", label: t("onboarding.riskAggressive") },
      ],
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const canProceed = !!answers[current.id] || current.type === "text";

  const handleFinish = () => {
    sessionStorage.setItem("onboarding_answers", JSON.stringify(answers));
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
            {t("onboarding.step", { current: step + 1, total: steps.length })}
          </DialogDescription>
        </DialogHeader>

        <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="py-4 space-y-4">
          <p className="text-sm font-medium text-foreground">{current.question}</p>

          {"options" in current && current.options ? (
            <RadioGroup
              value={answers[current.id] || ""}
              onValueChange={(val) => setAnswers((prev) => ({ ...prev, [current.id]: val }))}
              className="space-y-2"
            >
              {current.options.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 cursor-pointer transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                >
                  <RadioGroupItem value={opt.value} />
                  <span className="text-sm text-foreground">{opt.label}</span>
                </label>
              ))}
            </RadioGroup>
          ) : (
            <Input
              value={answers[current.id] || ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [current.id]: e.target.value }))}
              placeholder={(current as any).placeholder}
              className="w-full"
            />
          )}
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
            <Button size="sm" onClick={handleFinish} disabled={!canProceed}>
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
