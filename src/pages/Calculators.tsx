import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReconstitutionCalculator from "@/components/calculators/ReconstitutionCalculator";

import CycleOrderCalculator from "@/components/calculators/CycleOrderCalculator";
import SEO from "@/components/SEO";

const CalculatorsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Free Peptide Reconstitution Calculator & Dose Planner"
        description="Calculate peptide reconstitution volumes, syringe doses (U-100, U-40, Tuberculin), and plan full cycles with waste buffers. Free online precision tools."
        path="/calculators"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Peptyl Peptide Calculators",
          "url": "https://peptyl.co.uk/calculators",
          "applicationCategory": "HealthApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "GBP" },
          "description": "Free precision tools for peptide reconstitution, dose calculation with syringe diagrams, and cycle planning.",
          "author": { "@type": "Organization", "name": "Peptyl", "url": "https://peptyl.co.uk" }
        }}
      />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3">
              {t("calculatorsPage.title")} <span className="text-gradient-teal">{t("calculatorsPage.titleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              {t("calculatorsPage.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ReconstitutionCalculator />
            <CycleOrderCalculator />
          </div>

          <p className="text-xs text-muted-foreground text-center mt-8 max-w-lg mx-auto">
            {t("calculatorsPage.disclaimer")}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CalculatorsPage;