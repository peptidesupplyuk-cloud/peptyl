import { motion } from "framer-motion";
import { ArrowRight, Calculator, Database, Users, FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import OnboardingModal from "@/components/OnboardingModal";
import ComingSoonCards from "@/components/ComingSoonCards";

const HeroSection = () => {
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const { t } = useTranslation();

  return (
  <>
  <OnboardingModal open={onboardingOpen} onOpenChange={setOnboardingOpen} />
  <section className="dark-section relative min-h-screen flex items-center overflow-hidden">
    <div className="absolute inset-0">
      <img src={heroBg} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/80 to-navy" />
    </div>

    <div className="absolute top-16 left-0 right-0 z-10 bg-primary/90 backdrop-blur-sm text-primary-foreground py-2 text-center text-sm font-medium tracking-wide">
      {t("hero.banner")}
    </div>

    <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-teal/10 blur-3xl animate-pulse-glow" />
    <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-teal/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

    <div className="container mx-auto px-6 relative z-10 pt-24 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
      <div className="max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 text-primary text-sm font-medium mb-6 mt-12">
            <FlaskConical className="h-3.5 w-3.5" />
            {t("hero.badge")}
          </span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-7xl font-heading font-bold text-primary-foreground leading-[1.1] mb-6">
          {t("hero.title1")}
          <br />
          <span className="text-gradient-teal">{t("hero.title2")}</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-lg sm:text-xl text-primary-foreground/60 max-w-xl mb-10 leading-relaxed">
          {t("hero.subtitle")}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="flex flex-wrap gap-4">
          <Button size="lg" className="shadow-brand text-base px-8" onClick={() => setOnboardingOpen(true)}>
            {t("hero.startProtocol")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Link to="/peptides">
            <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8 bg-primary-foreground/5">
              {t("hero.browseDatabase")}
            </Button>
          </Link>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="w-full">
        <ComingSoonCards />
      </motion.div>
      </div>

    </div>
  </section>
  </>
  );
};

export default HeroSection;
