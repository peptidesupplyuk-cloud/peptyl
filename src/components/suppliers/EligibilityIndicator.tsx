import { useState } from "react";
import { Activity, AlertTriangle, ChevronDown, ChevronUp, Stethoscope, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface MarkerFlag {
  label: string;
  description: string;
  threshold: string;
}

const markers: MarkerFlag[] = [
  {
    label: "Elevated HbA1c",
    description: "HbA1c above 42 mmol/mol (6.0%) may indicate pre-diabetes or insulin resistance.",
    threshold: "≥ 42 mmol/mol (6.0%)",
  },
  {
    label: "High Fasting Insulin",
    description: "Fasting insulin above 12 mU/L can suggest early metabolic dysfunction before glucose rises.",
    threshold: "≥ 12 mU/L",
  },
  {
    label: "Poor Triglyceride/HDL Ratio",
    description: "A TG:HDL ratio above 1.7 (mmol/L) is associated with insulin resistance and cardiovascular risk.",
    threshold: "TG:HDL > 1.7",
  },
  {
    label: "BMI ≥ 30",
    description: "A BMI of 30 or above is the standard clinical threshold for obesity, a primary eligibility criterion.",
    threshold: "≥ 30 kg/m²",
  },
  {
    label: "BMI ≥ 27 with Comorbidity",
    description: "BMI 27–29.9 with conditions like type 2 diabetes, hypertension, or dyslipidaemia may also qualify.",
    threshold: "≥ 27 kg/m² + comorbidity",
  },
];

const EligibilityIndicator = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden"
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start sm:items-center gap-3 p-5 text-left hover:bg-primary/[0.08] transition-colors"
      >
        <div className="p-2 rounded-xl bg-primary/10 shrink-0">
          <Stethoscope className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-foreground text-sm sm:text-base">
            Could you be eligible for GLP-1 treatment?
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
            Certain blood markers and biometrics are commonly assessed by clinicians when considering GLP-1 prescriptions.
          </p>
        </div>
        <div className="shrink-0 mt-1">
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {/* Marker flags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {markers.map((m) => (
                  <div
                    key={m.label}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border"
                  >
                    <Activity className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-foreground block">{m.label}</span>
                      <span className="text-[11px] text-muted-foreground leading-relaxed block mt-0.5">
                        {m.description}
                      </span>
                      <span className="text-[10px] font-mono text-primary/70 mt-1 block">{m.threshold}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA — sign up & track */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/15">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    People with these markers often discuss GLP-1 treatment with their clinician.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Sign up free to upload your bloodwork results and see how your markers compare — all in one private dashboard.
                  </p>
                </div>
                <Link to="/auth" className="shrink-0">
                  <Button size="sm" className="gap-2 shadow-brand">
                    <LogIn className="h-3.5 w-3.5" />
                    Log In & Compare
                  </Button>
                </Link>
              </div>

              {/* Legal */}
              <div className="flex items-start gap-2 pt-1">
                <AlertTriangle className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  This is general health information, not a diagnosis or medical recommendation. Only a qualified healthcare professional can assess eligibility and prescribe medication. Always consult your GP or a registered prescriber.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EligibilityIndicator;
