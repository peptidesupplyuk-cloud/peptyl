import { useEffect, useState } from "react";
import RegionBlocked from "@/pages/RegionBlocked";
import { isEditorPreviewHost } from "@/lib/runtime-host";

const BLOCKED_USER_AGENTS = [
  "httrack", "wget", "curl", "scrapy", "python-requests",
  "go-http-client", "java/", "libwww-perl", "mechanize",
  "sitesucker", "webcopier", "teleport", "website-mirrorer",
  "cyotek", "webripper", "sitesnagger", "blackwidow",
  "grabber", "offline explorer", "webzip", "pavuk",
  "copier", "stripper", "sucker", "ninja", "clshttp",
  "websphinx", "larbin", "emailcollector", "emailsiphon",
  "emailwolf", "extractorpro", "indy library", "libcurl",
  "winhttp", "httpunit", "pangolin", "sqlmap", "nikto",
  "fimap", "havij", "zmeu", "bsqlbf", "phpmyadmin",
];

const isScraperEnvironment = (): boolean => {
  if (navigator.webdriver) return true;
  if (!navigator.languages || navigator.languages.length === 0) return true;
  if ((navigator as any).plugins?.length === 0 && !/mobile/i.test(navigator.userAgent)) return true;
  if ((window as any).__phantom || (window as any)._phantom || (window as any).callPhantom) return true;
  if ((window as any).__nightmare) return true;
  if ((document as any).__selenium_unwrapped || (document as any).__webdriver_evaluate || (document as any).__driver_evaluate) return true;
  return false;
};

const GeoGate = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"checking" | "allowed" | "blocked">("checking");

  useEffect(() => {
    if (isEditorPreviewHost()) {
      setStatus("allowed");
      return;
    }

    const ua = navigator.userAgent.toLowerCase();
    if (BLOCKED_USER_AGENTS.some((bot) => ua.includes(bot))) {
      setStatus("blocked");
      return;
    }
    if (isScraperEnvironment()) {
      setStatus("blocked");
      return;
    }
    setStatus("allowed");
  }, []);

  if (status === "checking") return <div className="min-h-screen bg-background" />;
  if (status === "blocked") return <RegionBlocked />;
  return <>{children}</>;
};

export default GeoGate;
