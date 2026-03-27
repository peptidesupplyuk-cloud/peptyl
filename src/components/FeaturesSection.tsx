import { motion } from "framer-motion";
import { Calculator, Database, Dna, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    { icon: Database, title: t("features.peptideDb"), description: t("features.peptideDbDesc"), href: "/peptides", color: "text-primary", bg: "bg-accent" },
    { icon: Calculator, title: t("features.precisionCalc"), description: t("features.precisionCalcDesc"), href: "/calculators", color: "text-info", bg: "bg-info/10" },
    { icon: Dna, title: t("features.communityFeedback"), description: t("features.communityFeedbackDesc"), href: "/dna", color: "text-success", bg: "bg-success/10" },
    { icon: BookOpen, title: t("features.educationHub"), description: t("features.educationHubDesc"), href: "/education", color: "text-warm", bg: "bg-warm/10" },
  ];

  const renderTitle = () => {
    const raw = t("features.title");
    const parts = raw.split(/<1>|<\/1>/);
    if (parts.length === 3) return <>{parts[0]}<span className="text-gradient-teal">{parts[1]}</span>{parts[2]}</>;
    return raw;
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">{renderTitle()}</h2>
          <p className="text-muted-foreground text-lg">{t("features.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Link to={feature.href} className="group block p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className={`inline-flex p-3 rounded-xl ${feature.bg} mb-5`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">{feature.description}</p>
                <span className="inline-flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
                  {t("features.learnMore")} <ArrowRight className="h-4 w-4 ml-1" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
