import { motion } from "framer-motion";
import { ArrowRight, Calculator, Database, Users, FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center overflow-hidden">
    {/* BG image */}
    <div className="absolute inset-0">
      <img src={heroBg} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/80 to-navy" />
    </div>

    {/* Floating orbs */}
    <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-teal/10 blur-3xl animate-pulse-glow" />
    <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-teal/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

    <div className="container mx-auto px-6 relative z-10 pt-24 pb-16">
      <div className="max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 text-primary text-sm font-medium mb-6">
            <FlaskConical className="h-3.5 w-3.5" />
            UK's Leading Research Platform
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-heading font-bold text-primary-foreground leading-[1.1] mb-6"
        >
          Research-Grade
          <br />
          <span className="text-gradient-teal">Peptide Intelligence</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl text-primary-foreground/60 max-w-xl mb-10 leading-relaxed"
        >
           Community-powered peptide database, precision calculators, and educational resources — built by researchers, for researchers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap gap-4"
        >
          <Link to="/peptides">
            <Button size="lg" className="shadow-brand text-base px-8">
              Explore Database
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/calculators">
            <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8 bg-primary-foreground/5">
              Try Calculators
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        {[
          { icon: Database, label: "Peptides Catalogued", value: "120+" },
          { icon: Users, label: "Community Votes", value: "12,400+" },
          { icon: Calculator, label: "Calculations Made", value: "48,000+" },
          { icon: FlaskConical, label: "Research Resources", value: "200+" },
        ].map((stat, i) => (
          <div key={i} className="bg-glass rounded-xl p-5 border border-primary-foreground/10">
            <stat.icon className="h-5 w-5 text-primary mb-3" />
            <div className="text-2xl font-heading font-bold text-primary-foreground">{stat.value}</div>
            <div className="text-xs text-primary-foreground/50 mt-1">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
