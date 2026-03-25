import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  targetTier: "advanced" | "pro";
  feature: string;
}

const tierLabels = {
  advanced: "Advanced",
  pro: "Pro",
};

const UpgradeCTA = ({ targetTier, feature }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[40dvh] text-center space-y-4 py-12">
      <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center">
        <Lock className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-heading font-bold text-foreground">
        Upgrade to {tierLabels[targetTier]} for {feature}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        This section is available in the {tierLabels[targetTier]} tier and above.
      </p>
      <button
        onClick={() => navigate("/dna")}
        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
      >
        View Plans
      </button>
    </div>
  );
};

export default UpgradeCTA;
