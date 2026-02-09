import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReconstitutionCalculator from "@/components/calculators/ReconstitutionCalculator";
import DoseCalculator from "@/components/calculators/DoseCalculator";
import CycleOrderCalculator from "@/components/calculators/CycleOrderCalculator";
import SEO from "@/components/SEO";

const CalculatorsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Peptide Calculators — Reconstitution, Dosing & Cycle Planning"
        description="Free precision tools for peptide reconstitution, dose calculation with syringe diagrams, and cycle planning with waste buffers. U-100, U-40 and Tuberculin support."
        path="/calculators"
      />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3">
              Precision <span className="text-gradient-teal">Calculators</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Essential tools for accurate peptide preparation, dosing, and cycle planning.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ReconstitutionCalculator />
            <DoseCalculator />
            <CycleOrderCalculator />
          </div>

          <p className="text-xs text-muted-foreground text-center mt-8 max-w-lg mx-auto">
            These calculators are for research and educational purposes only. Always consult qualified healthcare professionals before any research protocol.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CalculatorsPage;
