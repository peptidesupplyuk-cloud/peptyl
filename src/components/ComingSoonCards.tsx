import { motion } from "framer-motion";
import { Activity, Droplets } from "lucide-react";

const ComingSoonCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* WHOOP / OURA Integration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="group relative rounded-2xl border border-primary-foreground/10 bg-glass overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(0_0%_100%/0.04)] to-transparent" />
        <div className="relative p-6 sm:p-8 flex flex-col h-full min-h-[220px]">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-[11px] font-semibold uppercase tracking-wider">
              Coming Soon
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-heading font-bold text-primary-foreground mb-2">
            Wearable Integration
          </h3>
          <p className="text-sm text-primary-foreground/50 leading-relaxed mb-6 max-w-sm">
            Auto-sync HRV, recovery, strain & sleep data directly into your protocol dashboard. Track how peptides affect your real biometrics.
          </p>

          {/* Brand logos */}
          <div className="mt-auto flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[hsl(0_0%_100%/0.08)] flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary-foreground tracking-tight">W</span>
              </div>
              <span className="text-sm font-semibold text-primary-foreground/80 tracking-tight">WHOOP</span>
            </div>
            <div className="h-5 w-px bg-primary-foreground/15" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[hsl(0_0%_100%/0.08)] flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary-foreground/70" />
              </div>
              <span className="text-sm font-semibold text-primary-foreground/80 tracking-tight">OURA</span>
            </div>
          </div>
        </div>

        {/* Decorative glow */}
        <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-primary/10 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
      </motion.div>

      {/* Bespoke Bloodwork Kits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        className="group relative rounded-2xl border border-primary-foreground/10 bg-glass overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(0_0%_100%/0.04)] to-transparent" />
        <div className="relative p-6 sm:p-8 flex flex-col h-full min-h-[220px]">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warm/15 text-warm text-[11px] font-semibold uppercase tracking-wider">
              Coming Soon
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-heading font-bold text-primary-foreground mb-2">
            Bespoke Bloodwork Kits
          </h3>
          <p className="text-sm text-primary-foreground/50 leading-relaxed mb-6 max-w-sm">
            Peptide-optimised home blood panels designed for your protocol. Track IGF-1, lipids, liver & kidney markers — results feed directly into your dashboard.
          </p>

          <div className="mt-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[hsl(0_0%_100%/0.08)] flex items-center justify-center">
                <Droplets className="h-4 w-4 text-warm" />
              </div>
              <div>
                <span className="text-sm font-semibold text-primary-foreground/80 block leading-none">At-Home Testing</span>
                <span className="text-[10px] text-primary-foreground/40">Results in 48hrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative glow */}
        <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-warm/10 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
      </motion.div>
    </div>
  );
};

export default ComingSoonCards;
