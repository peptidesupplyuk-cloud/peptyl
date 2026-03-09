import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "peptyl_disclaimer_seen";

const SitewideDisclaimer = () => {
  const { user, loading } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading) return;
    // Never show for signed-in users; they accepted terms at signup
    if (!user && !sessionStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [user, loading]);

  if (!visible) return null;

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border py-3 px-4">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          ⚠ Peptyl is an educational platform. Not medical advice. We are not medical professionals. Research use only.
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to="/terms-of-service" className="text-xs text-primary hover:underline">
            Learn more
          </Link>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={dismiss}>
            I understand
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SitewideDisclaimer;
