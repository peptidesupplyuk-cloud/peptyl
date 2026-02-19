import { useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCampaignBySlug } from "@/data/campaigns";
import SEO from "@/components/SEO";
import heroBg from "@/assets/hero-bg.jpg";

const CampaignPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const campaign = slug ? getCampaignBySlug(slug) : undefined;

  if (!campaign) return <Navigate to="/" replace />;

  const Icon = campaign.icon;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={campaign.seoTitle}
        description={campaign.seoDescription}
        path={`/start/${campaign.slug}`}
      />

      {/* Hero — no nav, pure conversion */}
      <section className="dark-section relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/85 to-navy" />
        </div>

        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-teal/10 blur-3xl animate-pulse-glow" />

        <div className="container mx-auto px-6 relative z-10 py-16">
          {/* Minimal top bar */}
          <div className="flex items-center justify-between mb-16">
            <Link to="/" className="text-primary-foreground font-heading font-bold text-xl tracking-tight">
              Peptyl
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="sm" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent">
                Log In
              </Button>
            </Link>
          </div>

          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 text-primary text-sm font-medium mb-6">
                <Icon className="h-3.5 w-3.5" />
                Free Research Tool
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground leading-[1.1] mb-6"
            >
              {campaign.headline}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-primary-foreground/60 max-w-xl mb-10 leading-relaxed"
            >
              {campaign.subheadline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link to={campaign.ctaHref}>
                <Button size="lg" className="shadow-brand text-base px-8">
                  {campaign.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              {campaign.secondaryCta && (
                <Link to={campaign.secondaryCtaHref!}>
                  <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8 bg-primary-foreground/5">
                    {campaign.secondaryCta}
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-4 max-w-lg"
          >
            {campaign.stats.map((stat, i) => (
              <div key={i} className="bg-glass rounded-xl p-4 border border-primary-foreground/10 text-center">
                <div className="text-2xl font-heading font-bold text-primary-foreground">{stat.value}</div>
                <div className="text-xs text-primary-foreground/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground text-center mb-12">
            What You'll Get
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {campaign.features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <CheckCircle className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-heading font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="dark-section py-16 bg-hero">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-primary-foreground mb-4">
            Ready to Start?
          </h2>
          <p className="text-primary-foreground/60 max-w-md mx-auto mb-8">
            Join thousands of researchers worldwide using Peptyl's free tools.
          </p>
          <Link to={campaign.ctaHref}>
            <Button size="lg" className="shadow-brand text-base px-10">
              {campaign.cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Legal */}
      <section className="py-6 bg-background border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-4 border border-border">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Research Use Only — Not for Human Consumption. All peptides referenced are intended strictly for in-vitro research. Nothing on this website constitutes medical advice.{" "}
              <Link to="/terms-of-service" className="text-primary underline hover:text-primary/80">Terms of Service</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CampaignPage;
