import { useTranslation } from "react-i18next";
import ReconstitutionCalculator from "@/components/calculators/ReconstitutionCalculator";
import DoseCalculator from "@/components/calculators/DoseCalculator";
import CycleOrderCalculator from "@/components/calculators/CycleOrderCalculator";

const CalculatorsContent = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="max-w-2xl mb-12">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-3">
          {t("calculatorsPage.title")} <span className="text-gradient-teal">{t("calculatorsPage.titleHighlight")}</span>
        </h2>
        <p className="text-muted-foreground text-lg">
          {t("calculatorsPage.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ReconstitutionCalculator />
        <DoseCalculator />
        <CycleOrderCalculator />
      </div>

      <p className="text-xs text-muted-foreground text-center mt-8 max-w-lg mx-auto">
        {t("calculatorsPage.disclaimer")}
      </p>
    </>
  );
};

export default CalculatorsContent;
