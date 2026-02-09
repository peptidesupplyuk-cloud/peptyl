import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import MissionSection from "@/components/MissionSection";
import FeaturesSection from "@/components/FeaturesSection";
import COASection from "@/components/COASection";
import CommunitySection from "@/components/CommunitySection";
import SignupBenefits from "@/components/SignupBenefits";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <SignupBenefits />
      <MissionSection />
      <FeaturesSection />
      <COASection />
      <CommunitySection />

      {/* CTA Section */}
      <section className="py-24 bg-hero relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-teal/5 blur-3xl" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-primary-foreground mb-4">
            Ready to Explore?
          </h2>
          <p className="text-primary-foreground/60 text-lg max-w-md mx-auto mb-8">
            Join thousands of UK & European researchers using Peptyl's tools and community insights.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="/peptides">
              <button className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-brand hover:opacity-90 transition-opacity">
                Explore Database
              </button>
            </a>
            <a href="/calculators">
              <button className="px-8 py-3 rounded-xl border border-primary-foreground/20 text-primary-foreground font-medium hover:bg-primary-foreground/10 transition-colors">
                Try Calculators
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
