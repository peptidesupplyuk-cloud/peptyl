import { motion } from "framer-motion";
import { Shield, Activity, GraduationCap, HeartHandshake } from "lucide-react";

const pillars = [
  {
    icon: HeartHandshake,
    title: "Community First",
    description:
      "Built for the UK & European research community — with transparent, crowd-sourced data and honest guidance.",
  },
  {
    icon: Activity,
    title: "Biomarker Driven",
    description:
      "Upload your bloodwork and get personalised peptide and supplement insights based on your actual biology.",
  },
  {
    icon: Shield,
    title: "Research Verified",
    description:
      "Every compound in our database is backed by cited research. We prioritise clinical evidence over anecdote.",
  },
  {
    icon: GraduationCap,
    title: "Education & Tools",
    description:
      "Free calculators, dosing guides, and an ever-growing knowledge base — because informed researchers get better results.",
  },
];

const MissionSection = () => (
  <section className="py-24 bg-background">
    <div className="container mx-auto px-6">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4"
        >
          Why <span className="text-gradient-teal">Peptyl</span>?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-lg leading-relaxed"
        >
           We built Peptyl because the UK peptide space lacked a single trusted research hub — 
            one that connects your biomarkers to real data, community insights, and the tools researchers actually need.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {pillars.map((pillar, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-card border border-border text-center"
          >
            <div className="inline-flex p-3 rounded-xl bg-accent mb-4">
              <pillar.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-foreground mb-2">{pillar.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default MissionSection;
