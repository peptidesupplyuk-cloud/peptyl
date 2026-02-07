import { motion } from "framer-motion";
import { FileCheck, ShieldCheck, FlaskConical } from "lucide-react";

const COASection = () => (
  <section className="py-24 bg-muted/50">
    <div className="container mx-auto px-6">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4"
        >
          Certificates of <span className="text-gradient-teal">Analysis</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-lg"
        >
          Transparency is non-negotiable. Every product ships with a third-party COA confirming purity and identity.
        </motion.p>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          {
            icon: FileCheck,
            title: "Third-Party Tested",
            text: "Independent HPLC & Mass Spec analysis on every batch — never self-tested.",
          },
          {
            icon: ShieldCheck,
            title: "98%+ Purity Guaranteed",
            text: "We only stock peptides that meet our strict purity thresholds.",
          },
          {
            icon: FlaskConical,
            title: "Full Traceability",
            text: "Every COA links to a specific batch so you know exactly what you're working with.",
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <div className="inline-flex p-3 rounded-xl bg-accent mb-4">
              <card.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-foreground mb-2">{card.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{card.text}</p>
          </motion.div>
        ))}
      </div>

      {/* Example COA placeholders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto"
      >
        <h3 className="font-heading font-semibold text-foreground text-center mb-6">
          Example COAs
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {["BPC-157", "TB-500", "Semaglutide"].map((name, i) => (
            <div
              key={i}
              className="group relative aspect-[3/4] rounded-xl border-2 border-dashed border-border bg-card flex flex-col items-center justify-center gap-3 hover:border-primary/30 transition-colors cursor-pointer"
            >
              <FileCheck className="h-10 w-10 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
              <span className="text-sm font-medium text-muted-foreground">{name} COA</span>
              <span className="text-xs text-muted-foreground/60">Image coming soon</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default COASection;
