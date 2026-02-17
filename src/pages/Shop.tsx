import { Clock, FlaskConical } from "lucide-react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";

const Shop = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Shop — Coming Soon"
        description="Lab equipment and test kits coming soon to Peptyl. Stay tuned for research-grade products."
        path="/shop"
      />
      <Header />

      <section className="min-h-[70vh] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-teal/5 blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center px-6 relative z-10"
        >
          <div className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-warm/10 text-warm border border-warm/20 mb-8">
            <Clock className="h-4 w-4" /> {t("shopPage.comingSoon")}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
            {t("shopPage.comingSoon")}
          </h1>

          <div className="flex items-center justify-center gap-3 mb-4">
            <FlaskConical className="h-6 w-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-heading font-semibold text-foreground">
              {t("shopPage.labEquipment")}
            </h2>
          </div>

          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {t("shopPage.subtitle")}
          </p>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Shop;