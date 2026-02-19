import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "./Logo";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="dark-section bg-navy text-primary-foreground/80">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <Logo size="sm" inverted />
            <p className="mt-4 text-sm text-primary-foreground/50 leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm text-primary-foreground mb-4">{t("footer.platform")}</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/peptides" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">{t("footer.peptideDb")}</Link>
              <Link to="/calculators" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">{t("nav.calculators")}</Link>
              <Link to="/education" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">{t("nav.education")}</Link>
              <Link to="/shop" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">{t("nav.shop")}</Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm text-primary-foreground mb-4">{t("footer.tools")}</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/calculators" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">{t("footer.reconCalc")}</Link>
              <Link to="/calculators" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">{t("footer.doseCalc")}</Link>
              <Link to="/peptides" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">{t("footer.communityFeedback")}</Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm text-primary-foreground mb-4">{t("footer.legal")}</h4>
            <div className="flex flex-col gap-2.5">
              <span className="text-sm text-primary-foreground/50">{t("footer.researchOnly")}</span>
              <Link to="/about" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">{t("footer.aboutUs")}</Link>
              <Link to="/privacy-policy" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">{t("footer.privacyPolicy")}</Link>
              <Link to="/terms-of-service" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">{t("footer.termsOfService")}</Link>
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
            {t("footer.legalDisclaimer")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
