import { motion } from "framer-motion";
import { Calculator, MessageSquare, Bookmark, Shield, Sparkles, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const benefits = [
  {
    icon: Calculator,
    title: "Dosing Calculators",
    description: "Reconstitution & dosing tools tailored to your peptide and syringe type.",
  },
  {
    icon: MessageSquare,
    title: "Community Feedback",
    description: "Vote on stacks, report experiences, and see what the community thinks.",
  },
  {
    icon: Bookmark,
    title: "Save Custom Stacks",
    description: "Build and save personalised peptide stacks for quick reference.",
  },
  {
    icon: Sparkles,
    title: "AI Research Assistant",
    description: "Ask PeptideBot anything — dosing, stacks, side effects, and more.",
  },
];

const SignupBenefits = () => {
  const { user } = useAuth();

  if (user) return null;

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Shield className="h-4 w-4" />
            100% Free — No Credit Card Required
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3">
            Unlock the Full Platform
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Create a free account to access calculators, community voting, saved stacks, and more. No cost, ever.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-5 text-center"
            >
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <b.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-1">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center space-y-3">
          <Link to="/auth">
            <button className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-brand hover:opacity-90 transition-opacity">
              Create Free Account
            </button>
          </Link>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> No payment needed</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Full access forever</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Research only</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignupBenefits;
