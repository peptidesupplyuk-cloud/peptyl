import { Link } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const SignupBanner = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (user || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-primary text-primary-foreground py-3 px-6 shadow-lg">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <p className="text-sm font-medium">
          Create a free account to unlock calculators, protocol tracking, and community tools.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-foreground text-primary text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Sign Up Free <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded hover:bg-primary-foreground/10 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupBanner;
