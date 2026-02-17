import { motion } from "framer-motion";
import { Shield, Activity, GraduationCap, HeartHandshake } from "lucide-react";
import { useTranslation } from "react-i18next";

const MissionSection = () => {
  const { t } = useTranslation();

  const pillars = [
    { icon: HeartHandshake, title: t("mission.communityFirst"), description: t("mission.communityFirstDesc") },
    { icon: Activity, title: t("mission.biomarkerDriven"), description: t("mission.biomarkerDrivenDesc") },
    { icon: Shield, title: t("mission.researchVerified"), description: t("mission.researchVerifiedDesc") },
    { icon: GraduationCap, title: t("mission.educationTools"), description: t("mission.educationToolsDesc") },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
            {t("mission.title").split("<1>").length > 1 ? (
              <>{t("mission.title").split("<1>")[0]}<span className="text-gradient-teal">{t("mission.title").split("<1>")[1]?.split("</1>")[0]}</span>{t("mission.title").split("</1>")[1]}</>
            ) : t("mission.title")}
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-muted-foreground text-lg leading-relaxed">
            {t("mission.subtitle")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6 rounded-2xl bg-card border border-border text-center">
              <div className="inline-flex p-3 rounded-xl bg-accent mb-4">
                <pillar.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">{pillar.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
