import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import RegionBlocked from "@/pages/RegionBlocked";

const GeoGate = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"checking" | "allowed" | "blocked">("checking");

  useEffect(() => {
    const checkGeo = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("geo-check");
        if (error) {
          // Fail open
          setStatus("allowed");
          return;
        }
        setStatus(data?.blocked ? "blocked" : "allowed");
      } catch {
        setStatus("allowed");
      }
    };

    // Check sessionStorage to avoid re-checking on every navigation
    const cached = sessionStorage.getItem("geo-status");
    if (cached === "allowed" || cached === "blocked") {
      setStatus(cached);
      return;
    }

    checkGeo().then(() => {
      // Cache after state updates via effect below
    });
  }, []);

  useEffect(() => {
    if (status !== "checking") {
      sessionStorage.setItem("geo-status", status);
    }
  }, [status]);

  if (status === "checking") {
    return <div className="min-h-screen bg-background" />;
  }

  if (status === "blocked") {
    return <RegionBlocked />;
  }

  return <>{children}</>;
};

export default GeoGate;
