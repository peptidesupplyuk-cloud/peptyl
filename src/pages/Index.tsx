import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import MissionSection from "@/components/MissionSection";
import FeaturesSection from "@/components/FeaturesSection";
import LatestArticlesSection from "@/components/LatestArticlesSection";
import CommunitySection from "@/components/CommunitySection";
import SignupBenefits from "@/components/SignupBenefits";
import HowItWorksSection from "@/components/HowItWorksSection";
import SEO from "@/components/SEO";
import { useSaveOnboarding } from "@/hooks/use-save-onboarding";

const Index = () => {
  useSaveOnboarding();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Peptyl | Peptide & Supplement Research, Tools & Bloodwork Tracking"
        description="Your all-in-one platform for peptide and supplement research. Evidence-based guides, precision tools, bloodwork tracking, and personalised health protocols."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Peptyl",
          "url": "https://peptyl.co.uk",
          "description": "Track your health, supplements, peptides, and biomarkers in one platform. Free precision calculators and personalised protocols.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://peptyl.co.uk/peptides?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <Header />

      <HeroSection />
      <HowItWorksSection />
      <SignupBenefits />
      <MissionSection />
      <FeaturesSection />
      <LatestArticlesSection />
      <CommunitySection />

      {/* CTA Section */}
      <section className="dark-section py-24 bg-hero relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-teal/5 blur-3xl" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-primary-foreground mb-4">
            {t("cta.title")}
          </h2>
          <p className="text-primary-foreground/60 text-lg max-w-md mx-auto mb-8">
            {t("cta.subtitle")}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="/peptides">
              <button className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-brand hover:opacity-90 transition-opacity">
                {t("cta.startProtocol")}
              </button>
            </a>
            <a href="/peptides">
              <button className="px-8 py-3 rounded-xl border border-primary-foreground/20 text-primary-foreground font-medium hover:bg-primary-foreground/10 transition-colors">
                {t("cta.browseDatabase")}
              </button>
            </a>
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
};

export default Index;
