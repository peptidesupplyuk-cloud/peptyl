import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import MissionSection from "@/components/MissionSection";
import LatestArticlesSection from "@/components/LatestArticlesSection";
import SignupBenefits from "@/components/SignupBenefits";
import HowItWorksSection from "@/components/HowItWorksSection";
import TrustBar from "@/components/TrustBar";
import SEO from "@/components/SEO";
import { useSaveOnboarding } from "@/hooks/use-save-onboarding";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  useSaveOnboarding();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Signed-in users go straight to their dashboard
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Peptyl - Health Intelligence Platform | Peptides, Supplements, Bloodwork & Wearables"
        description="Track peptide, supplement, and GLP-1 protocols. Analyse bloodwork, sync wearables, and get AI-driven health insights. Free tools for health optimisers."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Peptyl",
          "url": "https://peptyl.co.uk",
          "description": "Health intelligence platform. Track protocols, analyse bloodwork, sync wearables, and optimise with AI-driven insights across 54+ peptides, GLP-1s, and supplements.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://peptyl.co.uk/peptides?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <Header />

      <HeroSection />
      <TrustBar />
      <HowItWorksSection />
      <SignupBenefits />
      <MissionSection />
      <LatestArticlesSection />

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
            <Link to="/auth">
              <button className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-brand hover:opacity-90 transition-opacity">
                {t("cta.startProtocol")}
              </button>
            </Link>
            <Link to="/improve">
              <button className="px-8 py-3 rounded-xl border border-primary-foreground/20 text-primary-foreground font-medium hover:bg-primary-foreground/10 transition-colors">
                {t("cta.browseDatabase")}
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
