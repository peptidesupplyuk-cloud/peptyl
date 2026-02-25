import { motion } from "framer-motion";
import { ArrowRight, Download, Smartphone, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import heroBg from "@/assets/hero-bg.jpg";
import OnboardingModal from "@/components/OnboardingModal";
import ComingSoonCards from "@/components/ComingSoonCards";

const HeroSection = () => {
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const { t } = useTranslation();

  return (
  <>
  <OnboardingModal open={onboardingOpen} onOpenChange={setOnboardingOpen} />

  {/* Install App Dialog */}
  <Dialog open={installOpen} onOpenChange={setInstallOpen}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-lg font-heading">
          <Smartphone className="h-5 w-5 text-primary" />
          Install Peptyl
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-5 pt-2">
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">iPhone / iPad (Safari)</h4>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Open <span className="font-medium text-foreground">peptyl.co.uk</span> in Safari</li>
            <li>Tap the <span className="inline-flex items-center gap-1 font-medium text-foreground">Share icon <span className="inline-block text-base leading-none" aria-label="share icon">⬆️</span></span> at the bottom of the screen (square with an upward arrow)</li>
            <li>Scroll down the share menu and tap <span className="font-medium text-foreground">"Add to Home Screen"</span></li>
            <li>Tap <span className="font-medium text-foreground">Add</span> in the top-right corner</li>
          </ol>
          <p className="text-xs text-muted-foreground/70 mt-2 italic">
            Can't see it? Make sure you're using Safari — Chrome on iPhone doesn't support this.
          </p>
        </div>
        <div className="h-px bg-border" />
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Android (Chrome)</h4>
          <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
            <li>Open <span className="font-medium text-foreground">peptyl.co.uk</span> in Chrome</li>
            <li>Tap the <span className="font-medium text-foreground">⋮ menu</span> (top right)</li>
            <li>Tap <span className="font-medium text-foreground">Add to Home Screen</span> or <span className="font-medium text-foreground">Install App</span></li>
            <li>Tap <span className="font-medium text-foreground">Install</span> to confirm</li>
          </ol>
        </div>
        <p className="text-xs text-muted-foreground/70 pt-1">
          The app works offline, loads instantly, and receives protocol reminders — just like a native app.
        </p>
      </div>
    </DialogContent>
  </Dialog>
  <section className="dark-section relative min-h-screen flex items-center overflow-hidden">
    <div className="absolute inset-0">
      <img src={heroBg} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/80 to-navy" />
    </div>

    <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-teal/10 blur-3xl animate-pulse-glow" />
    <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-teal/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

    <div className="container mx-auto px-6 relative z-10 pt-28 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div className="max-w-3xl">

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
          <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8 bg-primary-foreground/5" onClick={() => setInstallOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Download App
          </Button>
          <Link to="/education">
            <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8 bg-primary-foreground/5">
              <BookOpen className="mr-2 h-4 w-4" />
              Learn More
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
