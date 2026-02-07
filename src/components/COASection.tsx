import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileCheck, ShieldCheck, FlaskConical, X } from "lucide-react";

import coaKpv from "@/assets/coa-kpv.jpg";
import coaTa1 from "@/assets/coa-ta1.jpg";
import coaTirzepatide from "@/assets/coa-tirzepatide.jpg";
import coaBpc157 from "@/assets/coa-bpc157.jpg";
import coaRetatrutide from "@/assets/coa-retatrutide.jpg";
import coaCjc1295 from "@/assets/coa-cjc1295.jpg";
import coaBpcTb500 from "@/assets/coa-bpctb500.jpg";

const coas = [
  { name: "KPV 30mg", purity: "99.801%", image: coaKpv },
  { name: "Thymosin Alpha-1", purity: "99.454%", image: coaTa1 },
  { name: "Tirzepatide 30mg", purity: "99.779%", image: coaTirzepatide },
  { name: "BPC-157 10mg", purity: "99.762%", image: coaBpc157 },
  { name: "Retatrutide 40mg", purity: "99.919%", image: coaRetatrutide },
  { name: "CJC-1295 10mg", purity: "99.434%", image: coaCjc1295 },
  { name: "BPC + TB-500", purity: "99%+", image: coaBpcTb500 },
];

const COASection = () => {
  const [selected, setSelected] = useState<typeof coas[0] | null>(null);

  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4"
          >
            Certificate of <span className="text-gradient-teal">Analysis</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg"
          >
            Below are example COAs provided by our suppliers. We strongly recommend all researchers conduct their own independent testing — not every batch is guaranteed to include a COA.
          </motion.p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: FileCheck, title: "Third-Party Tested", text: "Independent HPLC & Mass Spec analysis on every batch — never self-tested." },
            { icon: ShieldCheck, title: "98%+ Purity Guaranteed", text: "We only stock peptides that meet our strict purity thresholds." },
            { icon: FlaskConical, title: "Full Traceability", text: "Every COA links to a specific batch so you know exactly what you're working with." },
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

        {/* COA gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <h3 className="font-heading font-semibold text-foreground text-center mb-6">
            Example COAs
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {coas.map((coa, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(coa)}
                className="group relative rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-colors cursor-pointer"
              >
                <img
                  src={coa.image}
                  alt={`${coa.name} Certificate of Analysis`}
                  className="w-full aspect-[3/4] object-cover object-top"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-3 pt-8">
                  <p className="text-xs font-medium text-foreground">{coa.name}</p>
                  <p className="text-xs text-primary">{coa.purity} purity</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl w-full max-h-[90vh] overflow-auto rounded-2xl border border-border bg-card shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 text-foreground hover:bg-background transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={selected.image}
                alt={`${selected.name} COA`}
                className="w-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default COASection;
