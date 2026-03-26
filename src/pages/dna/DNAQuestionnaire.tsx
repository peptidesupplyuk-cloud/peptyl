import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, SkipForward, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

/* ─── Types ─── */
type QuestionType = "single" | "multi" | "freetext" | "toggle";

interface QuestionOption {
  value: string;
  label: string;
  emoji?: string;
  description?: string;
  allowFreeText?: boolean;
}

interface Question {
  id: string;
  title: string;
  subtitle: string;
  type: QuestionType;
  options?: QuestionOption[];
  placeholder?: string;
  required?: boolean;
  minTier: "standard" | "advanced" | "pro";
}

/* ─── Question Definitions ─── */
const ALL_QUESTIONS: Question[] = [
  // ── Standard (1-5) ──
  {
    id: "primary_goal",
    title: "What's your primary health goal?",
    subtitle: "This shapes every recommendation in your report.",
    type: "single",
    required: false,
    minTier: "standard",
    options: [
      { value: "energy", label: "More energy & focus", emoji: "⚡" },
      { value: "weight", label: "Weight management", emoji: "⚖️" },
      { value: "sleep", label: "Better sleep", emoji: "😴" },
      { value: "wellness", label: "General wellness", emoji: "🌿" },
      { value: "fitness", label: "Fitness & performance", emoji: "💪" },
      { value: "longevity", label: "Longevity & aging", emoji: "🧬" },
      { value: "hormones", label: "Hormone optimisation", emoji: "🔬" },
      { value: "gut", label: "Gut health", emoji: "🦠" },
    ],
  },
  {
    id: "current_supplements",
    title: "What supplements do you currently take?",
    subtitle: "We'll avoid duplicating what you already use and check for interactions.",
    type: "multi",
    required: false,
    minTier: "standard",
    options: [
      { value: "none", label: "None" },
      { value: "vitamin_d", label: "Vitamin D" },
      { value: "omega3", label: "Omega-3" },
      { value: "magnesium", label: "Magnesium" },
      { value: "multivitamin", label: "Multivitamin" },
      { value: "creatine", label: "Creatine" },
      { value: "probiotics", label: "Probiotics" },
      { value: "zinc", label: "Zinc" },
      { value: "vitamin_c", label: "Vitamin C" },
      { value: "b_complex", label: "B-Complex / B12" },
      { value: "iron", label: "Iron" },
      { value: "collagen", label: "Collagen" },
      { value: "ashwagandha", label: "Ashwagandha" },
      { value: "curcumin", label: "Curcumin" },
      { value: "coq10", label: "CoQ10" },
      { value: "nac", label: "NAC" },
      { value: "other", label: "Other", allowFreeText: true },
    ],
  },
  {
    id: "current_medications",
    title: "Are you taking any prescribed medications?",
    subtitle: "Critical for safety — we check every recommendation against your medications.",
    type: "multi",
    required: true,
    minTier: "standard",
    options: [
      { value: "none", label: "None" },
      { value: "statins", label: "Statins" },
      { value: "ssri_snri", label: "Antidepressants (SSRIs/SNRIs)" },
      { value: "ppi", label: "PPIs (omeprazole)" },
      { value: "bp_medication", label: "Blood pressure medication" },
      { value: "thyroid_medication", label: "Thyroid medication" },
      { value: "metformin", label: "Metformin" },
      { value: "blood_thinners", label: "Blood thinners" },
      { value: "hormonal_contraception", label: "Hormonal contraception" },
      { value: "hrt", label: "HRT" },
      { value: "other", label: "Other", allowFreeText: true },
    ],
  },
  {
    id: "conditions",
    title: "Do you have any medical conditions?",
    subtitle: "We'll flag anything that might affect your recommendations.",
    type: "multi",
    required: true,
    minTier: "standard",
    options: [
      { value: "none", label: "None" },
      { value: "thyroid", label: "Thyroid condition" },
      { value: "diabetes", label: "Diabetes" },
      { value: "autoimmune", label: "Autoimmune condition" },
      { value: "pregnant", label: "Pregnant or breastfeeding" },
      { value: "cancer_history", label: "Cancer history" },
      { value: "kidney_disease", label: "Kidney disease" },
      { value: "liver_disease", label: "Liver disease" },
      { value: "heart_condition", label: "Heart condition" },
      { value: "blood_clotting", label: "Blood clotting disorder" },
      { value: "anxiety_depression", label: "Anxiety / Depression" },
    ],
  },
  {
    id: "sex",
    title: "What is your biological sex?",
    subtitle: "Certain genetic variants and supplement doses differ by sex.",
    type: "single",
    required: true,
    minTier: "standard",
    options: [
      { value: "male", label: "Male", emoji: "♂️" },
      { value: "female", label: "Female", emoji: "♀️" },
    ],
  },

  // ── Advanced (6-8) ──
  {
    id: "exercise_type",
    title: "What type of exercise do you do most?",
    subtitle: "Helps us tailor recovery, performance, and nutrient timing.",
    type: "single",
    required: false,
    minTier: "advanced",
    options: [
      { value: "strength", label: "Strength / Gym", emoji: "🏋️" },
      { value: "cardio", label: "Cardio / Running", emoji: "🏃" },
      { value: "mixed", label: "Mixed / Functional", emoji: "🤸" },
      { value: "competitive", label: "Competitive sport", emoji: "🏆" },
      { value: "yoga", label: "Yoga / Pilates", emoji: "🧘" },
      { value: "minimal", label: "Minimal / Starting out", emoji: "🚶" },
    ],
  },
  {
    id: "sleep_quality",
    title: "How would you describe your sleep?",
    subtitle: "Sleep quality affects nearly every biomarker and supplement response.",
    type: "single",
    required: false,
    minTier: "advanced",
    options: [
      { value: "great", label: "Great (7-9hrs, refreshed)", emoji: "🌟" },
      { value: "ok", label: "OK (could be better)", emoji: "😐" },
      { value: "poor", label: "Poor (regular issues)", emoji: "😩" },
      { value: "variable", label: "Highly variable", emoji: "📉" },
    ],
  },
  {
    id: "biggest_frustration",
    title: "What's your biggest health frustration right now?",
    subtitle: "This helps us personalise your report to what matters most to you.",
    type: "freetext",
    required: false,
    minTier: "advanced",
    placeholder: "e.g., 'I eat well and train hard but I'm always tired', 'I can't lose weight despite trying everything'",
  },

  // ── Pro (9-12) ──
  {
    id: "current_peptides",
    title: "Are you currently using any peptides?",
    subtitle: "We'll factor these into your protocol to avoid overlap or conflicts.",
    type: "multi",
    required: false,
    minTier: "pro",
    options: [
      { value: "none", label: "None" },
      { value: "bpc157", label: "BPC-157" },
      { value: "tb500", label: "TB-500" },
      { value: "ipamorelin", label: "Ipamorelin" },
      { value: "cjc1295", label: "CJC-1295" },
      { value: "mk677", label: "MK-677" },
      { value: "semaglutide", label: "Semaglutide" },
      { value: "tirzepatide", label: "Tirzepatide" },
      { value: "ghkcu", label: "GHK-Cu" },
      { value: "selank_semax", label: "Selank / Semax" },
      { value: "other", label: "Other", allowFreeText: true },
    ],
  },
  {
    id: "failed_interventions",
    title: "Anything you've tried that didn't work for you?",
    subtitle: "We won't recommend the same things that didn't work for you.",
    type: "freetext",
    required: false,
    minTier: "pro",
    placeholder: "e.g., 'Tried methylfolate for 3 months — made me anxious', 'Ashwagandha gave me stomach issues'",
  },
  {
    id: "wearable_device",
    title: "Do you use a wearable device?",
    subtitle: "We can correlate your protocol with your biometric data.",
    type: "single",
    required: false,
    minTier: "pro",
    options: [
      { value: "none", label: "No wearable", emoji: "❌" },
      { value: "whoop", label: "WHOOP", emoji: "⌚" },
      { value: "oura", label: "Oura Ring", emoji: "💍" },
      { value: "garmin", label: "Garmin", emoji: "⌚" },
      { value: "apple_watch", label: "Apple Watch", emoji: "⌚" },
      { value: "fitbit", label: "Fitbit", emoji: "⌚" },
      { value: "other", label: "Other", emoji: "⌚" },
    ],
  },
  {
    id: "include_emerging_compounds",
    title: "Would you like to see emerging compounds?",
    subtitle: "Some peptides and supplements have promising but limited evidence. Would you like to see these, clearly labelled?",
    type: "toggle",
    required: false,
    minTier: "pro",
    options: [
      {
        value: "yes",
        label: "Yes — show me everything",
        emoji: "🔬",
        description: "I understand some evidence is early-stage",
      },
      {
        value: "no",
        label: "No — clinically validated only",
        emoji: "✅",
        description: "Grade A & B recommendations",
      },
    ],
  },
];

function getQuestionsForTier(tier: string): Question[] {
  const tierOrder = { standard: 0, advanced: 1, pro: 2 };
  const tierLevel = tierOrder[tier as keyof typeof tierOrder] ?? 0;
  return ALL_QUESTIONS.filter(
    (q) => tierOrder[q.minTier] <= tierLevel
  );
}

/* ─── Component ─── */
const DNAQuestionnaire = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as any;

  const { reportId, inputText, imageBase64, method, userId, tier, lifestyleContext } = state;

  const questions = getQuestionsForTier(tier || "standard");
  const totalQuestions = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [freeTextInputs, setFreeTextInputs] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);

  // Pre-fill sex from lifestyleContext if available
  useEffect(() => {
    if (lifestyleContext?.sex && !answers.sex) {
      setAnswers((prev) => ({ ...prev, sex: lifestyleContext.sex }));
    }
  }, [lifestyleContext]);

  // Redirect if no state
  useEffect(() => {
    if (!reportId) navigate("/dna/upload", { replace: true });
  }, [reportId, navigate]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleSingleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    // Auto-advance after short delay for single select
    if (!currentQuestion.required || value) {
      setTimeout(() => goNext(), 300);
    }
  };

  const handleMultiSelect = (value: string) => {
    setAnswers((prev) => {
      const current = (prev[currentQuestion.id] as string[]) || [];
      if (value === "none") {
        // Toggle "none" off if already selected, otherwise set it and clear others
        if (current.includes("none")) return { ...prev, [currentQuestion.id]: [] };
        return { ...prev, [currentQuestion.id]: ["none"] };
      }
      const withoutNone = current.filter((v) => v !== "none");
      if (withoutNone.includes(value)) {
        return { ...prev, [currentQuestion.id]: withoutNone.filter((v) => v !== value) };
      }
      return { ...prev, [currentQuestion.id]: [...withoutNone, value] };
    });
  };

  const handleToggleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value === "yes" }));
    setTimeout(() => goNext(), 300);
  };

  const handleFreeText = (text: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: text }));
  };

  const canProceed = useCallback(() => {
    if (!currentQuestion.required) return true;
    const answer = answers[currentQuestion.id];
    if (!answer) return false;
    if (Array.isArray(answer) && answer.length === 0) return false;
    return true;
  }, [currentQuestion, answers]);

  const goNext = useCallback(() => {
    if (!canProceed()) return;
    if (isLastQuestion) {
      handleComplete();
      return;
    }
    setDirection(1);
    setCurrentIndex((i) => Math.min(i + 1, totalQuestions - 1));
  }, [canProceed, isLastQuestion, totalQuestions]);

  const goBack = () => {
    if (currentIndex === 0) {
      navigate(-1);
      return;
    }
    setDirection(-1);
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  const skip = () => {
    if (currentQuestion.required) return;
    setDirection(1);
    if (isLastQuestion) {
      handleComplete();
      return;
    }
    setCurrentIndex((i) => Math.min(i + 1, totalQuestions - 1));
  };

  const handleComplete = async () => {
    if (saving) return;
    setSaving(true);

    // Build clean answers object, merge freetext "other" values
    const cleanAnswers: Record<string, any> = {};
    for (const q of questions) {
      const val = answers[q.id];
      if (val !== undefined && val !== "" && !(Array.isArray(val) && val.length === 0)) {
        if (Array.isArray(val) && val.includes("other") && freeTextInputs[q.id]) {
          cleanAnswers[q.id] = val.map((v: string) =>
            v === "other" ? `other: ${freeTextInputs[q.id]}` : v
          );
        } else {
          cleanAnswers[q.id] = val;
        }
      }
    }

    // Save to DB
    await supabase
      .from("dna_reports")
      .update({ questionnaire_answers: cleanAnswers } as any)
      .eq("id", reportId);

    // Navigate to analysing page
    navigate("/dna/analysing", {
      state: {
        inputText,
        imageBase64,
        method,
        userId,
        tier,
        lifestyleContext,
        reportId,
        questionnaireAnswers: cleanAnswers,
      },
      replace: true,
    });
  };

  if (!reportId) return null;

  const currentAnswer = answers[currentQuestion.id];
  const multiAnswer = (currentAnswer as string[]) || [];

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0, filter: "blur(4px)" }),
    center: { x: 0, opacity: 1, filter: "blur(0px)" },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0, filter: "blur(4px)" }),
  };

  return (
    <>
      <SEO title="Health Questionnaire | Peptyl" description="Answer a few questions to personalise your DNA report." path="/dna/questionnaire" />
      <div className="fixed inset-0 flex flex-col" style={{ background: "#070B14" }}>
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <span className="text-xs text-white/30 font-medium tabular-nums">
            {currentIndex + 1} / {totalQuestions}
          </span>
          {!currentQuestion.required && (
            <button onClick={skip} className="flex items-center gap-1 text-sm text-white/40 hover:text-white/60 transition-colors">
              Skip <SkipForward className="h-3.5 w-3.5" />
            </button>
          )}
          {currentQuestion.required && <div className="w-12" />}
        </div>

        {/* Progress Bar */}
        <div className="px-5 pb-4 shrink-0">
          <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #00D4AA, #00B4D8)" }}
              animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-24">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-lg mx-auto pt-6"
            >
              {/* Required badge */}
              {currentQuestion.required && (
                <div className="flex items-center gap-1.5 mb-3">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Required</span>
                </div>
              )}

              {/* Question text */}
              <h2 className="text-[22px] md:text-[26px] font-heading font-bold text-white leading-tight mb-2">
                {currentQuestion.title}
              </h2>
              <p className="text-sm text-white/40 leading-relaxed mb-8">
                {currentQuestion.subtitle}
              </p>

              {/* ── SINGLE SELECT ── */}
              {currentQuestion.type === "single" && currentQuestion.options && (
                <div className="space-y-2.5">
                  {currentQuestion.options.map((opt) => {
                    const selected = currentAnswer === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSingleSelect(opt.value)}
                        className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border text-left transition-all duration-200 ${
                          selected
                            ? "border-[#00D4AA] bg-[#00D4AA]/10 shadow-[0_0_20px_rgba(0,212,170,0.1)]"
                            : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                        }`}
                      >
                        {opt.emoji && <span className="text-lg shrink-0">{opt.emoji}</span>}
                        <span className={`text-sm font-medium ${selected ? "text-[#00D4AA]" : "text-white/80"}`}>
                          {opt.label}
                        </span>
                        {selected && (
                          <Check className="h-4 w-4 text-[#00D4AA] ml-auto shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── MULTI SELECT ── */}
              {currentQuestion.type === "multi" && currentQuestion.options && (
                <div className="space-y-2">
                  {currentQuestion.options.map((opt) => {
                    const selected = multiAnswer.includes(opt.value);
                    const isNoneSelected = multiAnswer.includes("none");
                    const isDisabled = opt.value !== "none" && isNoneSelected;
                    return (
                      <div key={opt.value}>
                        <button
                          onClick={() => handleMultiSelect(opt.value)}
                          disabled={isDisabled}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${
                            isDisabled
                              ? "border-white/5 bg-white/[0.01] opacity-30 cursor-not-allowed"
                              : selected
                              ? "border-[#00D4AA] bg-[#00D4AA]/10"
                              : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                          }`}
                        >
                          <div
                            className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                              selected
                                ? "border-[#00D4AA] bg-[#00D4AA]"
                                : "border-white/20 bg-transparent"
                            }`}
                          >
                            {selected && <Check className="h-3 w-3 text-[#070B14]" />}
                          </div>
                          <span className={`text-sm ${selected ? "text-white font-medium" : "text-white/70"}`}>
                            {opt.label}
                          </span>
                        </button>
                        {/* Free text for "Other" */}
                        {opt.allowFreeText && selected && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="mt-2 pl-8"
                          >
                            <input
                              type="text"
                              placeholder="Please specify..."
                              value={freeTextInputs[currentQuestion.id] || ""}
                              onChange={(e) =>
                                setFreeTextInputs((prev) => ({
                                  ...prev,
                                  [currentQuestion.id]: e.target.value,
                                }))
                              }
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00D4AA]/40"
                            />
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── FREE TEXT ── */}
              {currentQuestion.type === "freetext" && (
                <Textarea
                  value={(currentAnswer as string) || ""}
                  onChange={(e) => handleFreeText(e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  rows={5}
                  className="w-full bg-white/[0.04] border-white/10 text-white placeholder:text-white/25 rounded-xl resize-none focus:border-[#00D4AA]/40 text-sm leading-relaxed"
                />
              )}

              {/* ── TOGGLE (2-card choice) ── */}
              {currentQuestion.type === "toggle" && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((opt) => {
                    const selected =
                      (opt.value === "yes" && currentAnswer === true) ||
                      (opt.value === "no" && currentAnswer === false);
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleToggleSelect(opt.value)}
                        className={`w-full flex items-start gap-4 px-5 py-5 rounded-xl border text-left transition-all duration-200 ${
                          selected
                            ? "border-[#00D4AA] bg-[#00D4AA]/10 shadow-[0_0_24px_rgba(0,212,170,0.08)]"
                            : "border-white/10 bg-white/[0.03] hover:border-white/20"
                        }`}
                      >
                        <span className="text-2xl mt-0.5">{opt.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${selected ? "text-[#00D4AA]" : "text-white"}`}>
                            {opt.label}
                          </p>
                          {opt.description && (
                            <p className="text-xs text-white/40 mt-0.5">{opt.description}</p>
                          )}
                        </div>
                        {selected && <Check className="h-5 w-5 text-[#00D4AA] shrink-0 mt-1" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Action */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-4 shrink-0" style={{ background: "linear-gradient(to top, #070B14 60%, transparent)" }}>
          <div className="max-w-lg mx-auto">
            {(currentQuestion.type === "multi" || currentQuestion.type === "freetext") && (
              <Button
                onClick={goNext}
                disabled={!canProceed() || saving}
                className="w-full py-5 text-sm font-semibold rounded-xl"
                style={{
                  background: canProceed() ? "linear-gradient(135deg, #00D4AA, #00B4D8)" : "rgba(255,255,255,0.06)",
                  color: canProceed() ? "#070B14" : "rgba(255,255,255,0.3)",
                  border: "none",
                }}
              >
                {saving ? "Saving..." : isLastQuestion ? "Generate My Report" : "Continue"}
                {!saving && <ChevronRight className="h-4 w-4 ml-1.5" />}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DNAQuestionnaire;
