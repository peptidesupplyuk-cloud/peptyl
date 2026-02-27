import { ShieldX } from "lucide-react";

const RegionBlocked = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <ShieldX className="h-16 w-16 text-destructive mx-auto" />
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Not Available in Your Region
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Peptyl is not currently available in the United States. We are focused on serving
          researchers and health optimisers in regions where peptide research is permitted.
        </p>
        <p className="text-sm text-muted-foreground/70">
          If you believe this is an error, please contact us at support@peptyl.com
        </p>
      </div>
    </div>
  );
};

export default RegionBlocked;
