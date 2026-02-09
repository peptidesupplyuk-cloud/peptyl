import { Link } from "react-router-dom";
import { Award, Globe, Rocket, Shield, TrendingUp, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const stats = [
  { label: "Years in Global Manufacturing", value: "10+", icon: Globe },
  { label: "Years Scaling AI Startups", value: "6+", icon: Rocket },
  { label: "Fortune 500 Experience", value: "✓", icon: Award },
  { label: "Countries Supplied", value: "30+", icon: TrendingUp },
];

const values = [
  {
    icon: Shield,
    title: "Quality Without Compromise",
    description:
      "Every product is third-party tested with full Certificates of Analysis. A decade in Fortune 500 supply chain means we hold ourselves to the highest global manufacturing standards.",
  },
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
      "Peptyl exists because the peptide community deserves better — better education, better tools, and transparent pricing. Everything we build starts with what our users need.",
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
            Built on a Decade of
            <span className="text-primary"> Global Supply Chain</span> Expertise
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-primary-foreground/60 max-w-2xl leading-relaxed"
          >
            Peptyl is the result of combining world-class manufacturing knowledge with cutting-edge AI and startup agility — purpose-built for the UK &amp; European peptide community.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 -mt-10 relative z-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Founder Story */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-heading font-bold text-foreground mb-8"
            >
              The Person Behind Peptyl
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6 text-muted-foreground leading-relaxed"
            >
              <p>
                With <strong className="text-foreground">over 10 years of experience in global manufacturing and supply chain management</strong> for one of the world's largest Fortune 500 companies, I've seen first-hand what separates truly world-class operations from the rest: rigorous quality control, transparent sourcing, and an obsession with consistency.
              </p>
              <p>
                That foundation shaped everything about how Peptyl operates. Every supplier is vetted to the same standards I applied managing global logistics at scale. Every batch is third-party tested. Every Certificate of Analysis is published openly.
              </p>
              <p>
                But Peptyl isn't just about supply chain excellence. Over the past <strong className="text-foreground">6+ years, I've been deeply embedded in the startup ecosystem</strong>, scaling early-stage companies with a sharp focus on <strong className="text-foreground">artificial intelligence and data-driven product development</strong>. That experience is why Peptyl's tools — from our precision dose calculators to our biomarker tracking dashboard — feel fundamentally different from anything else in this space.
              </p>
              <p>
                I built Peptyl because I was frustrated. The peptide community deserved better tools, better education, and more transparent pricing. I wanted to create a platform where researchers could access clinical-grade information, plan their protocols with confidence, and buy from a supplier they could actually trust.
              </p>
              <p className="text-foreground font-medium">
                This is that platform. And we're just getting started.
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
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
