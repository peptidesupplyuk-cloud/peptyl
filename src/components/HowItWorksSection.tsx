import { motion } from "framer-motion";
import { Activity, Brain, SlidersHorizontal, TrendingUp, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Activity,
    label: "Track",
    description: "Log biomarkers, protocols, and doses in one place.",
  },
  {
    icon: Brain,
    label: "Decide",
    description: "Get data-driven insights tailored to your biology.",
  },
  {
    icon: SlidersHorizontal,
    label: "Adjust",
    description: "Fine-tune dosing, timing, and stacks based on real results.",
  },
  {
    icon: TrendingUp,
    label: "Improve",
    description: "See measurable progress across every cycle.",
  },
];

const HowItWorksSection = () => (
  <section className="py-24 bg-card relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
    <div className="container mx-auto px-6 relative z-10">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-primary font-medium text-sm tracking-widest uppercase mb-3"
        >
          The Peptyl Method
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-heading font-bold text-foreground"
        >
          Research With <span className="text-gradient-teal">Purpose</span>
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 lg:gap-0 max-w-5xl mx-auto">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className="relative flex flex-col items-center text-center px-6 py-8"
          >
            {/* Connector arrow (hidden on last item and on mobile between rows) */}
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-14 -right-3 z-20">
                <ArrowRight className="h-5 w-5 text-primary/40" />
              </div>
            )}

            {/* Step number ring */}
            <div className="relative mb-5">
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center border border-border">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-brand">
                {i + 1}
              </span>
            </div>

            <h3 className="font-heading font-bold text-lg text-foreground mb-1.5">
              {step.label}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Looping indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="flex justify-center mt-8"
      >
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent border border-border text-sm text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
          Continuous cycle — every round gets sharper
        </div>
      </motion.div>
    </div>
  </section>
);

export default HowItWorksSection;
