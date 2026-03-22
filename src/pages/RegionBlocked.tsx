import { ShieldX } from "lucide-react";

const RegionBlocked = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <ShieldX className="h-16 w-16 text-destructive mx-auto" />
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Access Denied
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Your request has been blocked because it appears to be automated.
          If you believe this is an error, please visit us in a standard browser.
        </p>
        <p className="text-sm text-muted-foreground/70">
          If you believe this is an error, please contact us at support@peptyl.com
        </p>
      </div>
    </div>
  );
};

export default RegionBlocked;
