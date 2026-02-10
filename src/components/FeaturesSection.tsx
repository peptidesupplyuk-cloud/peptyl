import { motion } from "framer-motion";
import { Calculator, Database, Users, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Database,
    title: "Peptide Database",
    description: "Comprehensive, community-curated peptide profiles with real user experiences and voting.",
    href: "/peptides",
    color: "text-primary",
    bg: "bg-accent",
  },
  {
    icon: Calculator,
    title: "Precision Calculators",
    description: "Reconstitution & dose calculators built for accuracy. Never second-guess your mixing ratios.",
    href: "/calculators",
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    icon: Users,
    title: "Community Feedback",
    description: "Vote on peptide experiences. Help build the world's largest crowd-sourced peptide dataset.",
    href: "/peptides",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: BookOpen,
    title: "Education Hub",
    description: "From beginner guides to advanced protocols — learn peptide science the right way.",
    href: "/education",
    color: "text-warm",
    bg: "bg-warm/10",
  },
];

const FeaturesSection = () => (
  <section className="py-24 bg-background">
    <div className="container mx-auto px-6">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
          Everything You Need,{" "}
          <span className="text-gradient-teal">One Platform</span>
        </h2>
        <p className="text-muted-foreground text-lg">
          Tools, data, and community — designed for the global peptide research community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={feature.href}
              className="group block p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.bg} mb-5`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {feature.description}
              </p>
              <span className="inline-flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
                Learn more <ArrowRight className="h-4 w-4 ml-1" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
