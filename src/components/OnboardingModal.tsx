import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  {
    id: "goal",
    question: "What is your primary research goal?",
    options: [
      { value: "fat_loss", label: "Fat loss / metabolic health" },
      { value: "healing", label: "Healing & injury recovery" },
      { value: "longevity", label: "Longevity & anti-aging" },
      { value: "cognitive", label: "Cognitive performance" },
      { value: "muscle", label: "Muscle growth & performance" },
      { value: "hormone", label: "Hormone optimisation" },
    ],
  },
  {
    id: "experience",
    question: "What is your experience level with peptides?",
    options: [
      { value: "none", label: "No prior experience" },
      { value: "beginner", label: "1–3 compounds used" },
      { value: "intermediate", label: "4–10 compounds used" },
      { value: "advanced", label: "10+ compounds used" },
    ],
  },
  {
    id: "compounds",
    question: "Are you currently using any compounds?",
    type: "text" as const,
    placeholder: "e.g. BPC-157, Semaglutide — or leave blank",
  },
  {
    id: "biomarkers",
    question: "Which biomarkers do you have available?",
    options: [
      { value: "none", label: "None yet" },
      { value: "basic", label: "Basic panel (CBC, CMP)" },
      { value: "hormones", label: "Hormones (Testosterone, Thyroid)" },
      { value: "comprehensive", label: "Comprehensive (all of the above + lipids, inflammation)" },
    ],
  },
  {
    id: "risk",
    question: "What is your risk tolerance for research compounds?",
    options: [
      { value: "conservative", label: "Conservative — well-established compounds only" },
      { value: "moderate", label: "Moderate — some newer compounds acceptable" },
      { value: "aggressive", label: "Open — willing to explore emerging research" },
    ],
  },
];

const OnboardingModal = ({ open, onOpenChange }: OnboardingModalProps) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const canProceed = !!answers[current.id] || current.type === "text";

  const handleFinish = () => {
    // Store answers in sessionStorage so they can be used after signup
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
            Build Your Starting Plan
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Step {step + 1} of {steps.length}
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
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
            Back
          </Button>

          {isLast ? (
            <Button size="sm" onClick={handleFinish} disabled={!canProceed}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Generate Plan
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
