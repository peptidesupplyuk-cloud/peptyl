import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus, Activity, GitCompareArrows } from "lucide-react";

const PeptideActionBlock = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-card rounded-2xl border border-border p-6 mt-8">
      <h3 className="text-sm font-heading font-semibold text-foreground mb-1">
        {t("peptidesPage.actionTitle")}
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        {t("peptidesPage.actionSubtitle")}
      </p>
      <div className="flex flex-wrap gap-3">
        <Link to="/dashboard">
          <Button size="sm" className="text-xs">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            {t("peptidesPage.addProtocol")}
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button size="sm" variant="outline" className="text-xs">
            <Activity className="h-3.5 w-3.5 mr-1.5" />
            {t("peptidesPage.trackCompound")}
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button size="sm" variant="outline" className="text-xs">
            <GitCompareArrows className="h-3.5 w-3.5 mr-1.5" />
            {t("peptidesPage.compareGoal")}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PeptideActionBlock;