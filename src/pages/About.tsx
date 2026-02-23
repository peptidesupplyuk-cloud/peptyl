import { Link } from "react-router-dom";
import { Brain, Globe, Rocket, TrendingUp, Users, Beaker } from "lucide-react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/about/ContactForm";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const About = () => {
  const { t } = useTranslation();

  const stats = [
    { labelKey: "aboutPage.statPeptides", value: "56+", icon: Beaker },
    { labelKey: "aboutPage.statAI", value: "6+", icon: Rocket },
    { labelKey: "aboutPage.statBiohacking", value: "5+", icon: Brain },
    { labelKey: "aboutPage.statGlobal", value: "🌍", icon: Globe },
  ];

  const values = [
    {
      icon: TrendingUp,
      titleKey: "aboutPage.valueDataTitle",
      descKey: "aboutPage.valueDataDesc",
    },
    {
      icon: Users,
      titleKey: "aboutPage.valueCommunityTitle",
      descKey: "aboutPage.valueCommunityDesc",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="About Peptyl | The Global Peptide Research Hub"
        description="Built by biohackers and AI engineers. Peptyl is the research platform the global peptide community deserved."
        path="/about"
      />
      <Header />

      {/* Hero */}
      <section className="dark-section pt-28 pb-20 bg-hero relative overflow-hidden">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-teal/5 blur-3xl" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 inline-block mb-6"
          >
            {t("aboutPage.badge")}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground leading-tight max-w-3xl"
          >
            {t("aboutPage.title")}
            <span className="text-primary"> {t("aboutPage.titleHighlight")}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-primary-foreground/60 max-w-2xl leading-relaxed"
          >
            {t("aboutPage.subtitle")}
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 -mt-10 relative z-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.labelKey}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-card rounded-2xl border border-border p-6 text-center shadow-sm"
              >
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-3" />
                <p className="text-3xl font-heading font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{t(stat.labelKey)}</p>
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
              {t("aboutPage.whyTitle")}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6 text-muted-foreground leading-relaxed"
            >
              <p>{t("aboutPage.whyP1")}</p>
              <p dangerouslySetInnerHTML={{ __html: t("aboutPage.whyP2") }} />
              <p className="text-foreground font-medium">{t("aboutPage.whyP3")}</p>
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
            {t("aboutPage.valuesTitle")}
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {values.map((value, i) => (
              <motion.div
                key={value.titleKey}
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
                <h3 className="font-heading font-semibold text-foreground text-lg mb-3">{t(value.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(value.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <ContactForm />

      {/* CTA */}
      <section className="dark-section py-24 bg-hero relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-teal/5 blur-3xl" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-primary-foreground mb-4">
            {t("aboutPage.ctaTitle")}
          </h2>
          <p className="text-primary-foreground/60 text-lg max-w-md mx-auto mb-8">
            {t("aboutPage.ctaSubtitle")}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/peptides">
              <button className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-brand hover:opacity-90 transition-opacity">
                {t("aboutPage.exploreDb")}
              </button>
            </Link>
            <Link to="/education">
              <button className="px-8 py-3 rounded-xl border border-primary-foreground/20 text-primary-foreground font-medium hover:bg-primary-foreground/10 transition-colors">
                {t("aboutPage.learnMore")}
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