import { Link } from "react-router-dom";
import { Brain, Globe, Rocket, TrendingUp, Users, Beaker } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/about/ContactForm";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";

const stats = [
  { label: "Peptides in Our Database", value: "56+", icon: Beaker },
  { label: "Years Scaling AI Startups", value: "6+", icon: Rocket },
  { label: "Years Biohacking", value: "5+", icon: Brain },
  { label: "Serving Researchers Globally", value: "🌍", icon: Globe },
];

const values = [
  {
    icon: TrendingUp,
    title: "Data-Driven Innovation",
    description:
      "Six years building AI-first startups taught us that the best tools are built on real data. Our calculators, dashboards, and community insights reflect that philosophy.",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "Peptyl exists because the peptide community deserves better — better education, better tools, and accessible research. Everything we build starts with what our users need.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="About Peptyl — The Global Peptide Research Hub"
        description="Built by biohackers and AI engineers. Peptyl is the research platform the global peptide community deserved."
        path="/about"
      />
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-20 bg-hero relative overflow-hidden">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-teal/5 blur-3xl" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 inline-block mb-6"
          >
            Our Story
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground leading-tight max-w-3xl"
          >
            Built by Biohackers,
            <span className="text-primary"> Powered by AI</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-primary-foreground/60 max-w-2xl leading-relaxed"
          >
            Peptyl is the research hub we wished existed — combining AI-driven tools, real biomarker data, and community knowledge for the global peptide research community.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 -mt-10 relative z-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-card rounded-2xl border border-border p-6 text-center shadow-sm"
              >
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-3" />
                <p className="text-3xl font-heading font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why We Started */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-heading font-bold text-foreground mb-8"
            >
              Why We Started
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6 text-muted-foreground leading-relaxed"
            >
              <p>
                The peptide community deserved better — better education, better tools, and more transparency. We couldn't find a single platform that combined reliable research data with practical dosing tools and genuine community support. So we built one.
              </p>
              <p>
                Our team brings together <strong className="text-foreground">10+ years in global manufacturing and supply chain</strong> for Fortune 500 companies, <strong className="text-foreground">6+ years scaling AI-driven startups</strong>, and first-hand experience in the <strong className="text-foreground">biohacking and peptide research space</strong>. That combination is what makes Peptyl's tools, data, and sourcing standards fundamentally different.
              </p>
              <p className="text-foreground font-medium">
                We're building the research hub we wish existed. And we're just getting started.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-heading font-bold text-foreground text-center mb-12"
          >
            What Drives Us
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-card rounded-2xl border border-border p-8"
              >
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-5">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-foreground text-lg mb-3">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <ContactForm />

      {/* CTA */}
      <section className="py-24 bg-hero relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-teal/5 blur-3xl" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-primary-foreground mb-4">
            Experience the Difference
          </h2>
          <p className="text-primary-foreground/60 text-lg max-w-md mx-auto mb-8">
            Explore our tools, browse our peptide database, or join the community.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/peptides">
              <button className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-brand hover:opacity-90 transition-opacity">
                Explore Database
              </button>
            </Link>
            <Link to="/education">
              <button className="px-8 py-3 rounded-xl border border-primary-foreground/20 text-primary-foreground font-medium hover:bg-primary-foreground/10 transition-colors">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
