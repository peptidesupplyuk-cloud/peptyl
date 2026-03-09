import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "./Logo";
import { Instagram } from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="dark-section bg-navy text-primary-foreground/80">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <Logo size="sm" inverted />
            <div className="flex items-center gap-3 mt-5">
              <a href="https://www.instagram.com/peptyl.uk" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-primary-foreground/5 hover:bg-primary-foreground/10 text-primary-foreground/50 hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://www.tiktok.com/@peptyluk" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-primary-foreground/5 hover:bg-primary-foreground/10 text-primary-foreground/50 hover:text-primary transition-colors" aria-label="TikTok">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .56.04.82.11v-3.5a6.37 6.37 0 0 0-.82-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.19a8.16 8.16 0 0 0 4.76 1.51v-3.4a4.85 4.85 0 0 1-1-.61z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm text-primary-foreground mb-4">{t("footer.platform")}</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/dashboard" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">{t("nav.myHealth")}</Link>
              <Link to="/shop" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">{t("nav.shop")}</Link>
              <Link to="/dna" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">{t("nav.dna")}</Link>
              <Link to="/improve?tab=testing" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">{t("nav.testing")}</Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm text-primary-foreground mb-4">{t("nav.learn")}</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/improve" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">Knowledge Base</Link>
              <Link to="/improve?tab=supplements" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">Supplements</Link>
              <Link to="/improve?tab=calculators" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">{t("footer.calculators")}</Link>
              <Link to="/education" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">Articles</Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm text-primary-foreground mb-4">{t("footer.legal")}</h4>
            <div className="flex flex-col gap-2.5">
              <span className="text-sm text-primary-foreground/50">{t("footer.researchOnly")}</span>
              <Link to="/about" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">{t("footer.aboutUs")}</Link>
              <Link to="/privacy-policy" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">{t("footer.privacyPolicy")}</Link>
              <Link to="/terms-of-service" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">{t("footer.termsOfService")}</Link>
              <Link to="/dna" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">Data &amp; Privacy</Link>
              <span className="text-xs text-primary-foreground/30">ICO Registration: Pending</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <p className="text-xs text-primary-foreground/40">{t("footer.copyright")}</p>
            <p className="text-xs text-primary-foreground/40">
              <Link to="/terms-of-service" className="hover:text-primary transition-colors">{t("footer.termsOfService")}</Link>
              {" · "}
              <Link to="/privacy-policy" className="hover:text-primary transition-colors">{t("footer.privacyPolicy")}</Link>
            </p>
          </div>
          <p className="text-[11px] text-primary-foreground/30 text-center leading-relaxed max-w-3xl mx-auto">
            Peptyl is an educational platform. Not medical advice. Research use only. Peptyl is not operated by medical professionals.
          </p>
          <p className="text-[11px] text-primary-foreground/30 text-center leading-relaxed mt-2">
            © {new Date().getFullYear()} Peptyl Ltd. All rights reserved. All content, design, and intellectual property on this site is owned by Peptyl Ltd and protected under UK and international copyright law. Unauthorised reproduction or distribution is prohibited and subject to DMCA takedown.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
