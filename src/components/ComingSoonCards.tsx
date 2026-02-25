import { motion } from "framer-motion";
import { Activity, Droplets, Dna, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ComingSoonCards = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* DNA Health Assessment — NOW LIVE */}
      <Link to="/dna">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="group relative rounded-2xl border border-primary/30 bg-glass overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent" />
          <div className="relative p-5 sm:p-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-[11px] font-semibold uppercase tracking-wider mb-3">
              Now Live
            </span>
            <h3 className="text-lg sm:text-xl font-heading font-bold text-primary-foreground mb-1.5">
              DNA Health Assessment
            </h3>
            <p className="text-sm text-primary-foreground/50 leading-relaxed mb-4 max-w-sm">
              Upload your 23andMe or lab results. Get a personalised health score and supplement protocol in minutes.
            </p>
            <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all">
              <Dna className="h-4 w-4" />
              Start your analysis
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
          <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-primary/10 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
        </motion.div>
      </Link>

      {/* Coming Soon row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WHOOP / OURA Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="group relative rounded-2xl border border-primary-foreground/10 bg-glass overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(0_0%_100%/0.04)] to-transparent" />
          <div className="relative p-5 sm:p-6 flex flex-col h-full">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-[11px] font-semibold uppercase tracking-wider mb-3 self-start">
              Coming Soon
            </span>
            <h3 className="text-lg font-heading font-bold text-primary-foreground mb-1.5">
              Wearable Integration
            </h3>
            <p className="text-xs text-primary-foreground/50 leading-relaxed mb-4">
              Auto-sync HRV, recovery, strain & sleep data directly into your protocol dashboard.
            </p>
            <div className="mt-auto flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-7 w-7 rounded-md bg-[hsl(0_0%_100%/0.08)] flex items-center justify-center">
                  <span className="text-[9px] font-bold text-primary-foreground tracking-tight">W</span>
                </div>
                <span className="text-xs font-semibold text-primary-foreground/70">WHOOP</span>
              </div>
              <div className="h-4 w-px bg-primary-foreground/15" />
              <div className="flex items-center gap-1.5">
                <div className="h-7 w-7 rounded-md bg-[hsl(0_0%_100%/0.08)] flex items-center justify-center">
                  <Activity className="h-3.5 w-3.5 text-primary-foreground/70" />
                </div>
                <span className="text-xs font-semibold text-primary-foreground/70">OURA</span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-primary/10 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
        </motion.div>

        {/* Bespoke Bloodwork Kits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="group relative rounded-2xl border border-primary-foreground/10 bg-glass overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(0_0%_100%/0.04)] to-transparent" />
          <div className="relative p-5 sm:p-6 flex flex-col h-full">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warm/15 text-warm text-[11px] font-semibold uppercase tracking-wider mb-3 self-start">
              Coming Soon
            </span>
            <h3 className="text-lg font-heading font-bold text-primary-foreground mb-1.5">
              Bespoke Bloodwork Kits
            </h3>
            <p className="text-xs text-primary-foreground/50 leading-relaxed mb-4">
              Peptide-optimised home blood panels. Track IGF-1, lipids, liver & kidney markers — results feed into your dashboard.
            </p>
            <div className="mt-auto flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-[hsl(0_0%_100%/0.08)] flex items-center justify-center">
                <Droplets className="h-3.5 w-3.5 text-warm" />
              </div>
              <div>
                <span className="text-xs font-semibold text-primary-foreground/70 block leading-none">At-Home Testing</span>
                <span className="text-[10px] text-primary-foreground/40">Results in 48hrs</span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-warm/10 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoonCards;
