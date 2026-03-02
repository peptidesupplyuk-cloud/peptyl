import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Dna, Activity, FlaskConical, AlertTriangle, Shield, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import AnimatedDNA from "@/components/dna/AnimatedDNA";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const outcomes = [
  { icon: Activity, title: "Health Score", desc: "A weighted 0–100 score across genetics, biomarkers, and lifestyle" },
  { icon: Dna, title: "Gene Variant Analysis", desc: "Key SNP results (MTHFR, APOE, COMT, etc.) with risk flags explained" },
  { icon: FlaskConical, title: "Supplement Protocol", desc: "A personalised supplement stack built around your genetic profile" },
  { icon: AlertTriangle, title: "Drug Interaction Flags", desc: "Variants that affect how you metabolise common medications" },
];

const DNALanding = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (!user) { setUnlocked(false); return; }
    supabase
      .from("profiles")
      .select("dna_assessment_unlocked")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setUnlocked(!!(data as any)?.dna_assessment_unlocked);
      });
  }, [user]);

  const handlePurchase = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to purchase.", variant: "destructive" });
      return;
    }
    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-gocardless-payment");
      if (error || !data?.authorisation_url) {
        throw new Error(error?.message || "No authorisation URL returned");
      }
      window.location.href = data.authorisation_url;
    } catch (err: any) {
      console.error(err);
      toast({ title: "Payment error", description: err.message || "Could not start payment.", variant: "destructive" });
      setPurchasing(false);
    }
  };

  return (
    <>
      <SEO
        title="DNA Health Assessment | Peptyl"
        description="Upload your genetic data and get a personalised health report with supplement recommendations. Powered by AI."
        path="/dna"
      />
      <Header />
      <main className="min-h-screen pt-16">
        {/* Hero */}
        <section className="bg-hero dark-section py-24 md:py-32">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <AnimatedDNA />
            <div className="mt-8" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground mb-6 tracking-tight">
              Your DNA.<br />
              <span className="text-gradient-teal">Your Protocol.</span>
            </h1>
            <p className="text-lg text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              Upload your genetic data from 23andMe, AncestryDNA, or a lab report. Our AI analyses your variants and builds a personalised supplement protocol.
            </p>
            {unlocked ? (
              <Link to="/dna/upload">
                <Button size="lg" className="shadow-brand text-base px-8 py-6">
                  Start Your Analysis <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                className="shadow-brand text-base px-8 py-6"
                onClick={handlePurchase}
                disabled={purchasing}
              >
                {purchasing ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing…</>
                ) : (
                  <>Unlock DNA Assessment — £29.99 <ArrowRight className="ml-2 h-5 w-5" /></>
                )}
              </Button>
            )}
            <p className="text-xs text-primary-foreground/50 mt-3 text-center">
              For educational purposes only. Not medical advice. We are not medical professionals.
            </p>
          </div>
        </section>

        {/* What You Get */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground text-center mb-4">
              What You'll Get
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
              One upload. Four actionable outputs.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {outcomes.map((f) => (
                <div key={f.title} className="bg-card border border-border rounded-xl p-6 text-center">
                  <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
                    <f.icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6 text-center max-w-2xl">
            <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold text-foreground mb-3">GDPR Compliant & Private</h2>
            <p className="text-muted-foreground text-sm">
              Your raw genetic data is never stored. It's processed in memory, analysed by AI, then discarded.
              Only your processed health report is saved — and you can delete it at any time.
            </p>
            <p className="text-muted-foreground text-sm mt-3">
              Genetic data is special category data under UK GDPR Article 9. Your explicit consent is required and captured before processing. This report is for educational purposes only — it is not a clinical genetic test and Peptyl is not operated by medical professionals. Peptyl is registering with the ICO as a special category data controller prior to launching paid services.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6 text-center">
            {unlocked ? (
              <Link to="/dna/upload">
                <Button size="lg" className="shadow-brand">
                  Upload Your Data <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                className="shadow-brand"
                onClick={handlePurchase}
                disabled={purchasing}
              >
                {purchasing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</>
                ) : (
                  <>Unlock DNA Assessment — £29.99 <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default DNALanding;
