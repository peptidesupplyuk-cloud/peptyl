import { useEffect, useState } from "react";
import RegionBlocked from "@/pages/RegionBlocked";

const BLOCKED_COUNTRIES = ["US"];

const BLOCKED_USER_AGENTS = [
  "httrack", "wget", "curl", "scrapy", "python-requests",
  "go-http-client", "java/", "libwww-perl", "mechanize",
  "sitesucker", "webcopier", "teleport", "website-mirrorer",
  "cyotek", "webripper", "sitesnagger", "blackwidow",
  "grabber", "offline explorer", "webzip",
];

const GeoGate = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"checking" | "allowed" | "blocked">("checking");

  useEffect(() => {
    // Block known scraper user-agents immediately
    const ua = navigator.userAgent.toLowerCase();
    if (BLOCKED_USER_AGENTS.some((bot) => ua.includes(bot))) {
      setStatus("blocked");
      return;
    }

    const cached = sessionStorage.getItem("geo-status");
    if (cached === "allowed" || cached === "blocked") {
      setStatus(cached as "allowed" | "blocked");
      return;
    }

    const checkGeo = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          const geo = await res.json();
          const country = geo.country_code || geo.country || "";
          return BLOCKED_COUNTRIES.includes(country) ? "blocked" : "allowed";
        }
      } catch {
        // Primary failed, try fallback
      }

      try {
        const res2 = await fetch("https://freeipapi.com/api/json", { signal: AbortSignal.timeout(4000) });
        if (res2.ok) {
          const geo2 = await res2.json();
          const country2 = geo2.countryCode || "";
          return BLOCKED_COUNTRIES.includes(country2) ? "blocked" : "allowed";
        }
      } catch {
        // Both failed — fail open
      }

      return "allowed";
    };

    checkGeo().then((result) => {
      setStatus(result);
      sessionStorage.setItem("geo-status", result);
    });
  }, []);

  if (status === "checking") {
    return <div className="min-h-screen bg-background" />;
  }

  if (status === "blocked") {
    return <RegionBlocked />;
  }

  return <>{children}</>;
};

export default GeoGate;
