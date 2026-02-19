import { motion } from "framer-motion";
import { ThumbsUp, AlertTriangle, Clock, TrendingUp, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const sampleFeedback = [
  { peptide: "BPC-157", votes: 1243, insight: "Significant improvement in tendon recovery reported within 2-4 weeks", sentiment: "positive", icon: ThumbsUp },
  { peptide: "GHK-Cu", votes: 496, insight: "Mild skin breakouts or stinging at administration site in first few weeks", sentiment: "caution", icon: AlertTriangle },
  { peptide: "TB-500", votes: 892, insight: "Best results observed when combined with BPC-157 for joint recovery", sentiment: "positive", icon: TrendingUp },
  { peptide: "Ipamorelin", votes: 634, insight: "Improved sleep quality noticed within the first week of use", sentiment: "positive", icon: Clock },
];

const CommunitySection = () => {
  const { t } = useTranslation();

  const renderTitle = () => {
    const raw = t("community.title");
    const parts = raw.split(/<1>|<\/1>/);
    if (parts.length === 3) return <>{parts[0]}<span className="text-gradient-teal">{parts[1]}</span>{parts[2]}</>;
    return raw;
  };

  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">{renderTitle()}</h2>
          <p className="text-muted-foreground text-lg">{t("community.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {sampleFeedback.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl p-6 border border-border hover:border-primary/20 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-heading font-semibold text-lg text-foreground">{item.peptide}</h3>
                  <span className="text-xs text-muted-foreground">{item.votes.toLocaleString()} {t("community.votes")}</span>
                </div>
                <div className={`p-2 rounded-lg ${item.sentiment === "positive" ? "bg-success/10 text-success" : "bg-warm/10 text-warm"}`}>
                  <item.icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.insight}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12 space-y-5">
          <Link to="/peptides">
            <Button size="lg" className="shadow-brand">{t("community.exploreDb")}</Button>
          </Link>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-muted-foreground">Follow us</span>
            <a href="https://www.instagram.com/peptyl.uk" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted hover:bg-accent text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://www.tiktok.com/@peptyluk" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted hover:bg-accent text-muted-foreground hover:text-primary transition-colors" aria-label="TikTok">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .56.04.82.11v-3.5a6.37 6.37 0 0 0-.82-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.19a8.16 8.16 0 0 0 4.76 1.51v-3.4a4.85 4.85 0 0 1-1-.61z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
